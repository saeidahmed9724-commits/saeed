import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Heart, CheckCircle2, Sparkles, Calendar, FileText, ArrowRight } from 'lucide-react';
import { Language, GalleryItem, Memory } from '../types';
import { DataStore } from '../dataStore';

interface GalleryToMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialGalleryItem?: GalleryItem | null;
  onSuccess: () => void;
  onNavigateToMemories?: () => void;
}

export default function GalleryToMemoryModal({
  isOpen,
  onClose,
  lang,
  initialGalleryItem,
  onSuccess,
  onNavigateToMemories
}: GalleryToMemoryModalProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const gallery = DataStore.getGallery();
      setGalleryItems(gallery);
      
      const itemToUse = initialGalleryItem || (gallery.length > 0 ? gallery[0] : null);
      setSelectedItem(itemToUse);
      
      if (itemToUse) {
        setTitle(itemToUse.caption || (lang === 'ar' ? 'ذكرى من المعرض 💖' : 'Gallery Memory 💖'));
        setDate(itemToUse.date || new Date().toISOString().split('T')[0]);
      } else {
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
      }
      setContent('');
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialGalleryItem, lang]);

  if (!isOpen) return null;

  const handleSelectGalleryItem = (item: GalleryItem) => {
    setSelectedItem(item);
    if (!title || title.trim() === '' || title === selectedItem?.caption) {
      setTitle(item.caption || (lang === 'ar' ? 'ذكرى من المعرض 💖' : 'Gallery Memory 💖'));
    }
    if (item.date) {
      setDate(item.date);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedItem.url) return;

    setIsSubmitting(true);

    const newMemory: Memory = {
      id: `mem-${Date.now()}`,
      title: title.trim() || (lang === 'ar' ? 'ذكرى حلوة من المعرض 📸' : 'Sweet Gallery Memory 📸'),
      date: date || new Date().toISOString().split('T')[0],
      content: content.trim() || (lang === 'ar' ? 'إحدى الذكريات المتميزة المحفوظة في المعرض المشترك.' : 'One of our special photos saved in our shared gallery.'),
      imageUrl: selectedItem.url
    };

    const currentMemories = DataStore.getMemories().filter(m => m && m.imageUrl && m.imageUrl.trim() !== '');
    const updated = [newMemory, ...currentMemories];

    DataStore.saveMemories(updated, {
      type: 'buzz',
      titleAr: 'إضافة ذكرى جديدة من المعرض 🌸',
      titleEn: 'New Memory Added from Gallery 🌸',
      descAr: `تمت إضافة صورة المعرض إلى الذكريات بعنوان "${newMemory.title}"`,
      descEn: `Added gallery photo to memories titled "${newMemory.title}"`
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg glass dark:bg-neutral-900/90 rounded-[32px] border border-white/40 dark:border-white/10 p-6 sm:p-8 shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-all cursor-pointer z-10"
        >
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-5 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {lang === 'ar' ? 'تمت إضافة الصورة إلى الذكريات بنجاح! 🎉' : 'Memory Added Successfully! 🎉'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
                {lang === 'ar'
                  ? 'الصورة أصبحت موجودة الآن في قسم الذكريات ومصنفة بحسب التاريخ.'
                  : 'The photo is now saved under the Memories section, organized by date.'}
              </p>
            </div>

            {selectedItem && (
              <div className="max-w-xs mx-auto rounded-2xl overflow-hidden border border-white/20 shadow-md my-4">
                <img src={selectedItem.url} alt="" className="w-full h-36 object-cover" />
                <div className="p-3 bg-white/40 dark:bg-black/40 text-left dir-ltr">
                  <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{title}</p>
                  <p className="text-[10px] text-rose-gold-600 font-mono">{date}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              {onNavigateToMemories && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToMemories();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <Heart size={16} />
                  <span>{lang === 'ar' ? 'الانتقال إلى الذكريات 💖' : 'Go to Memories Tab 💖'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-all cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق ✖️' : 'Close ✖️'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-gold-500/10 text-rose-gold-600 dark:text-rose-gold-400 text-xs font-bold mb-2">
                <Sparkles size={14} />
                <span>{lang === 'ar' ? 'تحويل صورة المعرض إلى ذكرى' : 'Gallery Photo to Memory'}</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {lang === 'ar' ? 'إضافة إلى الذكريات 🌸' : 'Add Gallery Photo to Memories 🌸'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {lang === 'ar'
                  ? 'اختر صورة من المعرض وأضف بياناتها وتفاصيلها لتظهر في سجل الذكريات.'
                  : 'Select a photo from the gallery and add its details to display in Memories.'}
              </p>
            </div>

            {/* Gallery Photo Selector / Preview */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                <span>{lang === 'ar' ? 'الصورة المختارة من المعرض:' : 'Selected Gallery Photo:'}</span>
                {galleryItems.length > 1 && (
                  <span className="text-[11px] text-rose-gold-600 dark:text-rose-gold-400 font-normal">
                    {lang === 'ar' ? 'اختر أي صورة أخرى بالأسفل' : 'Or pick another photo below'}
                  </span>
                )}
              </label>

              {selectedItem ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-rose-gold-500/50 shadow-md bg-black/10 group">
                  <img
                    src={selectedItem.url}
                    alt=""
                    className="w-full h-44 object-cover"
                  />
                  {selectedItem.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-xs font-serif">
                      "{selectedItem.caption}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-rose-gold-200 dark:border-rose-gold-900/50 p-8 text-center text-xs text-neutral-500">
                  {lang === 'ar' ? 'لا يوجد صور في المعرض حالياً.' : 'No photos available in gallery.'}
                </div>
              )}

              {/* Gallery Mini Selector Carousel */}
              {galleryItems.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                    {lang === 'ar' ? 'تغيير الصورة (من معرض صوركم):' : 'Choose another photo:'}
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {galleryItems.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleSelectGalleryItem(g)}
                        className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedItem?.id === g.id
                            ? 'border-rose-gold-500 scale-105 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={g.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inputs: Title, Date, Content */}
            <div className="space-y-4 pt-2 border-t border-rose-gold-100/20">
              
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-rose-gold-500" />
                  <span>{lang === 'ar' ? 'عنوان الذكرى:' : 'Memory Title:'}</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: يوم خطير في الكافيه ✨' : 'e.g. An unforgettable day ✨'}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-gold-400 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-rose-gold-500" />
                  <span>{lang === 'ar' ? 'تاريخ الذكرى:' : 'Memory Date:'}</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-gold-400 text-xs text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Content / Details */}
              <div>
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5 flex items-center gap-1.5">
                  <FileText size={14} className="text-rose-gold-500" />
                  <span>{lang === 'ar' ? 'الوصف والتفاصيل:' : 'Story & Details:'}</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    lang === 'ar'
                      ? 'اكتب التفاصيل والمواقف الجميلة الخاصة بهذه الصورة...'
                      : 'Write the details and sweet moments of this memory...'
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-gold-400 text-xs text-neutral-900 dark:text-neutral-100 resize-none"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedItem}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-gold-500 to-pink-500 hover:from-rose-gold-600 hover:to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
              >
                <Heart size={16} />
                <span>{lang === 'ar' ? 'حفظ في سجل الذكريات 💖' : 'Save to Memories 💖'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
