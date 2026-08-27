import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Music, Film, Heart, CheckCircle2, AlertCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Language, UserRole } from '../types';
import { DataStore } from '../dataStore';
import { uploadFilesDirect } from '../uploadService'; // <--- الجديد

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
  preview: string; // للصور فقط هنعمل preview، للاغاني والفيديو هنستخدم object URL
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
  const [progressText, setProgressText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    const first = filesArray[0];
    if (first.type.startsWith('image/')) {
      setCategory('gallery');
    } else if (first.type.startsWith('audio/')) {
      setCategory('song');
    } else if (first.type.startsWith('video/')) {
      setCategory('video');
    }

    setUploadStatus('idle');

    // بدل FileReader -> base64 (اللي كان بيفرقع الـ 4.5MB)
    // بنستخدم URL.createObjectURL للمعاينة فقط، خفيف جدا
    filesArray.forEach((f) => {
      const preview = f.type.startsWith('image/') 
        ? URL.createObjectURL(f) 
        : ''; // للاغاني والفيديو مش محتاجين preview تقيل
      
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
      const toRemove = prev.find(p => p.id === idToRemove);
      if (toRemove?.preview) URL.revokeObjectURL(toRemove.preview);
      return prev.filter((item) => item.id !== idToRemove);
    });
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(f => { if(f.preview) URL.revokeObjectURL(f.preview) });
    setSelectedFiles([]);
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
    setProgressText(lang === 'ar' ? 'جاري تجهيز الروابط الآمنة...' : 'Preparing secure links...');

    try {
      // === الحل الجديد: 3 خطوات، الملف مش بيعدي على فيرسل ===
      // uploadFilesDirect بيعمل: sign -> upload direct to Supabase -> complete
      
      const result = await uploadFilesDirect(
        currentRole, // section = الدور (Dodo / Sohila) - استخدمت currentRole زي ما كان عندك role
        category,
        selectedFiles.map(item => ({
          file: item.file,
          title: category === 'song' ? (title.trim() || item.file.name) : (title.trim() || item.file.name),
          artist: artist.trim(),
          description: description.trim(),
          date: date,
        })) as any,
        (msg) => setProgressText(msg) // callback للـ progress لو عايز
      );

      // result ده هو نفس data.state اللي كنت بترجعه قبل كده
      if (result?.state) {
        DataStore.syncFromRemote(result.state);
      } else if ((result as any)?.files) {
        // لو الـ backend الجديد بيرجع files بس، اعمل reload للـ state
        // ممكن تعمل fetch للـ state بعد الرفع
        const stateRes = await fetch('/api/state');
        if (stateRes.ok) {
          const stateData = await stateRes.json();
          DataStore.syncFromRemote(stateData);
        }
      }

      setIsUploading(false);
      setUploadStatus('success');
      setProgressText('');

      if (onSuccess) onSuccess();

      setTimeout(() => {
        clearAllFiles();
        setTitle('');
        setDescription('');
        setArtist('');
        setUploadStatus('idle');
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error(err);
      setIsUploading(false);
      setUploadStatus('error');
      setErrorMessage(err.message || (lang === 'ar' ? 'حدث خطأ أثناء الرفع، حاول مرة أخرى' : 'Failed to upload, please try again.'));
      setProgressText('');
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
                {lang === 'ar' ? 'الرفع المباشر - يدعم ملفات كبيرة 💖' : 'Direct upload - supports large files 💖'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center hover:bg-neutral-200">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-4 overflow-y-auto">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-rose-gold-200 dark:border-white/10 rounded-2xl p-4 bg-rose-gold-50/30 dark:bg-neutral-800/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,audio/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">{selectedFiles.length} ملفات محددة</p>
                  <button type="button" onClick={clearAllFiles} className="text-xs text-red-500 flex items-center gap-1">
                    <Trash2 size={12} /> مسح الكل
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map(item => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-square">
                      {item.file.type.startsWith('image/') && item.preview ? (
                        <img src={item.preview} alt={item.file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2">
                          {item.file.type.startsWith('audio/') ? <Music size={20} /> : <Film size={20} />}
                          <p className="text-[9px] mt-1 truncate w-full text-center">{item.file.name}</p>
                          <p className="text-[8px] text-neutral-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                      <button type="button" onClick={() => removeFile(item.id)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer flex flex-col items-center justify-center gap-3 py-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-rose-gold-100 dark:bg-rose-gold-900/40 text-rose-gold-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    {lang === 'ar' ? 'اضغط هنا لاختيار عدة صور/ملفات أو اسحبهم هنا 📸' : 'Click to select multiple files or drag & drop 📸'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {lang === 'ar' ? 'يدعم الآن الأغاني والفيديوهات بأي حجم' : 'Now supports songs & videos of any size'}
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
          {progressText && isUploading && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-xl text-xs font-bold">
              <Loader2 size={16} className="animate-spin" />
              <span>{progressText}</span>
            </div>
          )}

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
                <span>{progressText || (lang === 'ar' ? `جاري رفع ${selectedFiles.length} ملفات...` : `Uploading ${selectedFiles.length} files...`)}</span>
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
