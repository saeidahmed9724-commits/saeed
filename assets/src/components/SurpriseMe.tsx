import { useState, useEffect } from 'react';
import { Gift, X, Sparkles, Heart, Quote, Image as ImageIcon, Music, Video, Mic } from 'lucide-react';
import { Language, Memory, GalleryItem, VideoItem, Quote as QuoteType, Song, VoiceMessage, UserRole } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface SurpriseMeProps {
  lang: Language;
  currentUserRole: UserRole;
  forceTriggerSignal?: number;
}

type SurpriseItem = 
  | { type: 'memory'; data: Memory }
  | { type: 'photo'; data: GalleryItem }
  | { type: 'video'; data: VideoItem }
  | { type: 'quote'; data: QuoteType }
  | { type: 'song'; data: Song }
  | { type: 'voice'; data: VoiceMessage };

export default function SurpriseMe({ lang, currentUserRole, forceTriggerSignal }: SurpriseMeProps) {
  const t = translations[lang];
  const [surprise, setSurprise] = useState<SurpriseItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceTriggerSignal && forceTriggerSignal > 0) {
      triggerSurprise();
    }
  }, [forceTriggerSignal]);

  const triggerSurprise = () => {
    const memories = DataStore.getMemories();
    const photos = DataStore.getGallery();
    const videos = DataStore.getVideos();
    const quotes = DataStore.getQuotes();
    const songs = DataStore.getSongs();
    const voices = DataStore.getVoiceMessages();

    // Compile all available content items
    const pool: SurpriseItem[] = [];
    memories.forEach((m) => pool.push({ type: 'memory', data: m }));
    photos.forEach((p) => pool.push({ type: 'photo', data: p }));
    videos.forEach((v) => pool.push({ type: 'video', data: v }));
    quotes.forEach((q) => pool.push({ type: 'quote', data: q }));
    songs.forEach((s) => pool.push({ type: 'song', data: s }));
    voices.forEach((v) => pool.push({ type: 'voice', data: v }));

    if (pool.length === 0) {
      // Empty pool surprise
      setSurprise(null);
      setIsOpen(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    setSurprise(pool[randomIndex]);
    setIsOpen(true);

    // Broadcast surprise trigger to live activity feed
    fetch('/api/interaction-state/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: currentUserRole,
        type: 'buzz',
        titleAr: 'فتح مفاجأة 🎁',
        titleEn: 'Opened a Surprise 🎁',
        descAr: `شريكك فتح مفاجأة وطلعتله حاجة حلوة من ذكرياتكم!`,
        descEn: `Your partner opened a surprise and got a sweet memory!`
      })
    }).catch(err => console.log('Error logging surprise trigger:', err));
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Surprise trigger button */}
      <button
        onClick={triggerSurprise}
        className="group relative hover:scale-[1.03] transition-all duration-300 active:scale-98 cursor-pointer w-full"
      >
        {/* Glow behind the button */}
        <div className="absolute inset-0 bg-[#d4af37]/20 blur-xl opacity-25 transition-opacity group-hover:opacity-45 rounded-full" />
        
        {/* Transparent frosted container with thin elegant border */}
        <div className="relative bg-white/10 dark:bg-black/25 backdrop-blur-2xl border border-white/20 hover:border-[#d4af37]/60 px-3 sm:px-4 py-3 rounded-full flex items-center justify-center gap-1.5 text-neutral-900 dark:text-white shadow-lg h-[54px] sm:h-[58px] w-full">
          <span className="font-serif text-xs sm:text-sm font-bold tracking-wide text-neutral-900 dark:text-white drop-shadow-xs truncate">
            {t.surpriseBtn}
          </span>
        </div>
      </button>

      {/* Surprise Content Modal overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-cream-100 dark:bg-neutral-900 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl border border-white/50 dark:border-white/5 relative animate-fade-in p-6">
            
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-black/15 transition-colors z-10"
            >
              <X size={18} />
            </button>

            {!surprise ? (
              // Empty State romantic fallback message
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500 rounded-full flex items-center justify-center animate-bounce">
                  <Heart fill="currentColor" size={28} />
                </div>
                <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                  {lang === 'ar' ? 'مفيش حاجات متسجلة لسه' : 'Nothing Added Yet'}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed px-4">
                  {lang === 'ar'
                    ? 'لسه مفيش صور أو أغاني أو ذكريات متضافة. ضيفوا شوية حاجات من الإعدادات عشان تظهر هنا مفاجآت!'
                    : 'Nothing added yet. Open Settings below to add quotes, songs, or photos to get surprises!'}
                </p>
              </div>
            ) : (
              // Render surprise details
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-rose-gold-500 font-bold text-xs uppercase tracking-widest font-mono">
                  <Sparkles size={14} />
                  <span>{surprise.type} surprise</span>
                </div>

                {surprise.type === 'memory' && (
                  <div>
                    {surprise.data.imageUrl && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-neutral-100">
                        <img src={surprise.data.imageUrl} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-neutral-400 block mb-1">{surprise.data.date}</span>
                    <h5 className="font-serif text-lg font-bold text-neutral-950 dark:text-neutral-100 mb-2">{surprise.data.title}</h5>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed max-h-36 overflow-y-auto">{surprise.data.content}</p>
                  </div>
                )}

                {surprise.type === 'photo' && (
                  <div>
                    <div className="w-full h-56 rounded-2xl overflow-hidden bg-neutral-100">
                      <img src={surprise.data.url} referrerPolicy="no-referrer" alt="" className="w-full h-full object-cover" />
                    </div>
                    {surprise.data.caption && (
                      <p className="text-xs font-serif italic text-neutral-700 dark:text-neutral-300 mt-3 text-center">
                        "{surprise.data.caption}"
                      </p>
                    )}
                  </div>
                )}

                {surprise.type === 'video' && (
                  <div>
                    <div className="w-full rounded-2xl overflow-hidden bg-black aspect-video relative">
                      <video src={surprise.data.url} controls playsInline className="w-full h-full" />
                    </div>
                    {surprise.data.title && (
                      <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-3 text-center">
                        {surprise.data.title}
                      </p>
                    )}
                  </div>
                )}

                {surprise.type === 'quote' && (
                  <div className="text-center py-6 px-4">
                    <Quote size={32} className="text-rose-gold-300 mx-auto mb-4" />
                    <p className="font-serif text-base md:text-lg italic text-neutral-800 dark:text-neutral-200 mb-4 leading-relaxed">
                      "{surprise.data.text}"
                    </p>
                    <span className="text-xs font-bold text-rose-gold-500 font-mono">
                      — {surprise.data.author === currentUserRole ? (lang === 'ar' ? 'أنت' : 'You') : (surprise.data.author === 'Dodo' ? t.saeed : t.sohila)} ({surprise.data.author === 'Dodo' ? t.dodo : t.so})
                    </span>
                  </div>
                )}

                {surprise.type === 'song' && (
                  <div className="text-center py-4">
                    {surprise.data.coverUrl ? (
                      <img src={surprise.data.coverUrl} referrerPolicy="no-referrer" alt="" className="w-24 h-24 rounded-2xl mx-auto shadow-md mb-4 object-cover" />
                    ) : (
                      <div className="w-20 h-20 bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <Music size={28} />
                      </div>
                    )}
                    <h5 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100">{surprise.data.title}</h5>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">{surprise.data.artist}</p>
                    <audio src={surprise.data.url} controls className="w-full mx-auto" />
                  </div>
                )}

                {surprise.type === 'voice' && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
                      <Mic size={24} />
                    </div>
                    <h5 className="font-serif text-sm font-bold text-neutral-900 dark:text-neutral-100">{surprise.data.title}</h5>
                    <p className="text-[10px] text-rose-gold-400 font-mono font-bold mt-1 uppercase tracking-wider mb-4">
                      {lang === 'ar' 
                        ? `بواسطة ${surprise.data.sender === currentUserRole ? 'أنت' : (surprise.data.sender === 'Dodo' ? t.saeed : t.sohila)}` 
                        : `Recorded by ${surprise.data.sender === currentUserRole ? 'You' : (surprise.data.sender === 'Dodo' ? t.saeed : t.sohila)}`}
                    </p>
                    <audio src={surprise.data.url} controls className="w-full mx-auto" />
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
