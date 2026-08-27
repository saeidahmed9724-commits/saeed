import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Music, Film, Heart, CheckCircle2, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Language, UserRole } from '../types';
import { DataStore } from '../dataStore';
import { uploadFilesDirect } from '../uploadService';

interface DirectUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentRole: UserRole;
  onSuccess?: () => void;
}

type UploadCategory = 'gallery' | 'song' | 'video' | 'memory';

interface SelectedFileItem {
  id: string;
  file: File;
  preview: string;
}

export default function DirectUploaderModal({
  isOpen,
  onClose,
  lang,
  currentRole,
  onSuccess
}: DirectUploaderModalProps) {
  const [category, setCategory] = useState<UploadCategory>('gallery');
  const [selectedFiles, setSelectedFiles] = useState<SelectedFileItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    // Auto detect category from first file if needed
    const first = filesArray[0];
    if (first.type.startsWith('image/')) {
      setCategory('gallery');
    } else if (first.type.startsWith('audio/')) {
      setCategory('song');
    } else if (first.type.startsWith('video/')) {
      setCategory('video');
    }

    setUploadStatus('idle');

    filesArray.forEach((f) => {
      // Object URL is only for local preview; the real file is uploaded
      // directly to Supabase by uploadFilesDirect().
      const preview = URL.createObjectURL(f);
      setSelectedFiles((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file: f,
          preview
        }
      ]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // reset value so re-selecting same files triggers change event
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (idToRemove: string) => {
    setSelectedFiles((prev) => {
      const item = prev.find((file) => file.id === idToRemove);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((file) => file.id !== idToRemove);
    });
  };

  const clearAllFiles = () => {
    setSelectedFiles((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMessage(lang === 'ar' ? 'الرجاء اختيار ملف واحد على الأقل للرفع' : 'Please select at least one file');
      setUploadStatus('error');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const items = selectedFiles.map((item) => ({
        file: item.file,
        title: category === 'song'
          ? title.trim()
          : (title.trim() || (selectedFiles.length === 1 ? item.file.name : '')),
        description: description.trim(),
        date,
        artist: artist.trim(),
      }));

      const data = await uploadFilesDirect(currentRole, category, items);
      if (data?.success) {
        setIsUploading(false);
        setUploadStatus('success');

        // Sync local datastore
        if (data.state) {
          DataStore.syncFromRemote(data.state);
        }

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          // Reset fields and close
          selectedFiles.forEach((item) => URL.revokeObjectURL(item.preview));
          setSelectedFiles([]);
          setTitle('');
          setDescription('');
          setArtist('');
          setUploadStatus('idle');
          onClose();
        }, 1200);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadStatus('error');
      setErrorMessage(lang === 'ar' ? 'حدث خطأ أثناء الرفع، حاول مرة أخرى' : 'Failed to upload, please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-rose-gold-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-rose-gold-100 dark:border-white/10 bg-gradient-to-r from-rose-gold-50/50 to-pink-50/30 dark:from-neutral-800 dark:to-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-gold-500/10 text-rose-gold-600 flex items-center justify-center font-bold">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-neutral-900 dark:text-neutral-100">
                {lang === 'ar' ? 'رفع صور ووسائط متعددة 📤' : 'Multiple Media Upload 📤'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {lang === 'ar' ? 'يمكنك تحديد عدة صور أو ملفات ورفعهم معاً دفعة واحدة 💖' : 'Select multiple photos or files and upload them together 💖'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleUpload} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              {lang === 'ar' ? 'تصنيف المحتوى 🏷️' : 'Content Category 🏷️'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setCategory('gallery')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all gap-1.5 ${
                  category === 'gallery'
                    ? 'border-rose-gold-500 bg-rose-gold-50 dark:bg-rose-gold-950/40 text-rose-gold-600 dark:text-rose-gold-300 shadow-xs ring-2 ring-rose-gold-500/20'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <ImageIcon size={18} />
                <span>{lang === 'ar' ? 'معرض الصور' : 'Gallery Photo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('song')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all gap-1.5 ${
                  category === 'song'
                    ? 'border-rose-gold-500 bg-rose-gold-50 dark:bg-rose-gold-950/40 text-rose-gold-600 dark:text-rose-gold-300 shadow-xs ring-2 ring-rose-gold-500/20'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Music size={18} />
                <span>{lang === 'ar' ? 'أغنية / صوت' : 'Song / Audio'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('video')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all gap-1.5 ${
                  category === 'video'
                    ? 'border-rose-gold-500 bg-rose-gold-50 dark:bg-rose-gold-950/40 text-rose-gold-600 dark:text-rose-gold-300 shadow-xs ring-2 ring-rose-gold-500/20'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Film size={18} />
                <span>{lang === 'ar' ? 'فيديو ريلز' : 'Video Reel'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('memory')}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all gap-1.5 ${
                  category === 'memory'
                    ? 'border-rose-gold-500 bg-rose-gold-50 dark:bg-rose-gold-950/40 text-rose-gold-600 dark:text-rose-gold-300 shadow-xs ring-2 ring-rose-gold-500/20'
                    : 'border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Heart size={18} />
                <span>{lang === 'ar' ? 'ذكرى رومانسية' : 'Memory'}</span>
              </button>
            </div>
          </div>

          {/* Multiple File Picker Area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                {lang === 'ar' ? 'الملفات المحددة للرفع 📁' : 'Selected Files 📁'}
              </label>
              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>{lang === 'ar' ? 'مسح الكل' : 'Clear all'}</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept={
                category === 'gallery'
                  ? 'image/*'
                  : category === 'song'
                  ? 'audio/*'
                  : category === 'video'
                  ? 'video/*'
                  : 'image/*,audio/*,video/*'
              }
              className="hidden"
            />

            {/* Selected files preview list/grid */}
            {selectedFiles.length > 0 ? (
              <div className="space-y-3 p-4 bg-rose-gold-50/40 dark:bg-rose-gold-950/20 rounded-3xl border border-rose-gold-200 dark:border-white/10">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {selectedFiles.map((item) => (
                    <div
                      key={item.id}
                      className="relative group rounded-2xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 shadow-xs aspect-square flex flex-col items-center justify-center p-1"
                    >
                      {category === 'gallery' || item.file.type.startsWith('image/') ? (
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : category === 'video' || item.file.type.startsWith('video/') ? (
                        <video
                          src={item.preview}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : category === 'song' || item.file.type.startsWith('audio/') ? (
                        <div className="flex flex-col items-center justify-center text-center p-2">
                          <Music className="text-rose-gold-500 mb-1" size={24} />
                          <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 line-clamp-1 w-full">
                            {item.file.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 line-clamp-2 p-1 text-center">
                          {item.file.name}
                        </span>
                      )}

                      {/* Remove single button */}
                      <button
                        type="button"
                        onClick={() => removeFile(item.id)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-90 group-hover:opacity-100 shadow-xs"
                        title={lang === 'ar' ? 'حذف هذه الصورة' : 'Remove'}
                      >
                        <X size={12} />
                      </button>

                      <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs rounded-md px-1.5 py-0.5 text-[9px] text-white truncate font-medium text-center">
                        {Math.round(item.file.size / 1024)} KB
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rose-gold-200/50">
                  <div className="flex items-center gap-1.5 text-xs text-rose-gold-600 dark:text-rose-gold-300 font-bold">
                    <CheckCircle2 size={16} />
                    <span>
                      {lang === 'ar'
                        ? `تم اختيار ${selectedFiles.length} ملفات جاهزة للرفع`
                        : `${selectedFiles.length} files selected`}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs font-bold text-rose-gold-600 dark:text-rose-gold-300 hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{lang === 'ar' ? 'إضافة المزيد' : 'Add More'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-rose-gold-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-rose-gold-100 dark:bg-rose-gold-900/40 text-rose-gold-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {lang === 'ar' ? 'اضغط هنا لاختيار عدة صور/ملفات أو اسحبهم هنا 📸' : 'Click to select multiple files or drag & drop 📸'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {lang === 'ar' ? 'يمكنك اختيار أكثر من صورة أو ملف في نفس الوقت' : 'You can choose multiple photos or files at once'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {category === 'song'
                  ? (lang === 'ar' ? 'اسم الأغنية (اختياري) 🎵' : 'Song Title (Optional) 🎵')
                  : category === 'gallery'
                  ? (lang === 'ar' ? 'عنوان المجموعة / الصور (اختياري) 📸' : 'Group Title (Optional) 📸')
                  : category === 'video'
                  ? (lang === 'ar' ? 'عنوان الفيديو 🎬' : 'Video Title 🎬')
                  : (lang === 'ar' ? 'عنوان الذكرى 💖' : 'Memory Title 💖')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  category === 'song'
                    ? 'اتركه فاضي أو اكتب اسم الأغنية'
                    : category === 'gallery'
                    ? 'مثال: صور خروجتنا سوا'
                    : category === 'video'
                    ? 'مثال: فيديو ذكريات الرحلة'
                    : 'مثال: أول يوم اتكلمنا فيه'
                }
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none"
              />
            </div>

            {category === 'song' && (
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {lang === 'ar' ? 'اسم الفنان / المغني (اختياري) 🎙️' : 'Artist Name (Optional) 🎙️'}
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="مثال: عمرو دياب / أنغام"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {lang === 'ar' ? 'التاريخ 📅' : 'Date 📅'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {lang === 'ar' ? 'الوصف / تفاصيل الذكرى (اختياري) 📝' : 'Description / Details (Optional) 📝'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder={lang === 'ar' ? 'اكتب كلمة حلوة أو تفاصيل عن المحتوى ده...' : 'Write details or a sweet note...'}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-neutral-800 text-sm font-medium focus:ring-2 focus:ring-rose-gold-400 outline-none resize-none"
              />
            </div>
          </div>

          {/* Status feedback */}
          {uploadStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300 rounded-xl text-xs font-bold">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 rounded-xl text-xs font-bold animate-bounce">
              <CheckCircle2 size={16} />
              <span>{lang === 'ar' ? 'تم رفع وحفظ جميع الملفات بنجاح! 🎉' : 'All files uploaded and saved successfully! 🎉'}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading || selectedFiles.length === 0}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
              isUploading || selectedFiles.length === 0
                ? 'bg-neutral-400 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-rose-gold-500 to-pink-500 hover:from-rose-gold-600 hover:to-pink-600 active:scale-98 shadow-rose-gold-500/20 cursor-pointer'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{lang === 'ar' ? `جاري رفع ${selectedFiles.length} ملفات...` : `Uploading ${selectedFiles.length} files...`}</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>
                  {lang === 'ar'
                    ? selectedFiles.length > 1
                      ? `رفع وحفظ (${selectedFiles.length}) ملفات معاً`
                      : 'رفع وحفظ المحتوى الآن'
                    : 'Upload & Save Now'}
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
