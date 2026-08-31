import { useState, useEffect } from 'react';
import { Mail, MailOpen, X, Sparkles, Heart } from 'lucide-react';
import { Language, Envelope } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';

interface OpenWhenEnvelopeProps {
  lang: Language;
  initialEnvelopeId?: string | null;
}

export default function OpenWhenEnvelope({ lang, initialEnvelopeId }: OpenWhenEnvelopeProps) {
  const t = translations[lang];
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [activeEnvelope, setActiveEnvelope] = useState<Envelope | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadEnvelopes = () => {
      const list = DataStore.getEnvelopes();
      setEnvelopes(list);

      if (list.length > 0) {
        if (initialEnvelopeId) {
          const found = list.find((e) => e.id === initialEnvelopeId);
          if (found) {
            setActiveEnvelope(found);
            setIsOpen(true);
            return;
          }
        }
        if (!activeEnvelope) {
          const rand = list[Math.floor(Math.random() * list.length)];
          setActiveEnvelope(rand);
        } else {
          const updatedActive = list.find((e) => e.id === activeEnvelope.id);
          if (updatedActive) {
            setActiveEnvelope(updatedActive);
          }
        }
      }
    };

    loadEnvelopes();
    window.addEventListener('datastore_synced', loadEnvelopes);
    return () => window.removeEventListener('datastore_synced', loadEnvelopes);
  }, [initialEnvelopeId]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!activeEnvelope) return null;

  const title = lang === 'ar' ? activeEnvelope.titleAr : activeEnvelope.titleEn;
  const letterContent = lang === 'ar' ? activeEnvelope.contentAr : activeEnvelope.contentEn;

  return (
    <div className="relative w-full max-w-sm mx-auto text-center flex flex-col items-center justify-between min-h-[280px] py-2">
      <div className="absolute inset-0 pointer-events-none -z-10 bg-radial-gradient from-rose-gold-50/10 to-transparent dark:from-rose-gold-950/10" />
      
      <div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-gold-100 dark:bg-rose-gold-950/30 text-rose-gold-500 font-bold text-[10px] uppercase tracking-wider font-mono mb-3">
          {t.envelopeTitle}
        </span>
        <h4 className="font-serif text-base font-bold text-neutral-800 dark:text-neutral-100">
          {title}
        </h4>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 px-4">
          {t.envelopeIntro}
        </p>
      </div>

      <div className="my-5 relative flex items-center justify-center">
        {/* Pulsating heart ring */}
        <div className="absolute w-14 h-14 rounded-full bg-rose-gold-100/50 dark:bg-rose-gold-950/20 animate-ping opacity-70" />
        
        <button
          onClick={handleOpen}
          className="relative w-14 h-14 rounded-full bg-rose-gold-100 dark:bg-rose-gold-950/30 text-rose-gold-500 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300 border border-rose-gold-200/50"
        >
          <Mail size={24} />
        </button>
      </div>

      <button
        onClick={handleOpen}
        className="px-6 py-2 rounded-full border border-rose-gold-200 dark:border-rose-gold-900/40 text-rose-gold-500 dark:text-rose-gold-300 font-bold text-xs uppercase tracking-widest hover:bg-rose-gold-500 hover:text-white transition-all duration-300"
      >
        {t.openEnvelope}
      </button>

      {/* Full screen Letter pop-up overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-cream-50 dark:bg-neutral-950 rounded-[32px] max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-white/40 dark:border-white/5 relative p-6 sm:p-8 animate-fade-in text-center flex flex-col justify-between">
            
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 hover:bg-black/15 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Letter Head */}
            <div className="mb-6">
              <span className="text-2xl block mb-2">{activeEnvelope.emoji}</span>
              <h5 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {title}
              </h5>
              <div className="w-12 h-0.5 bg-rose-gold-300 mx-auto mt-3 rounded-full" />
            </div>

            {/* Content box */}
            <div className="flex-1 flex items-center justify-center px-2 py-4">
              {!letterContent ? (
                // Empty Letter State
                <div className="text-neutral-400 dark:text-neutral-500 text-xs italic font-medium">
                  {t.envelopeEmpty}
                </div>
              ) : (
                // Beautiful handwritten letter layout
                <p className="font-serif text-sm md:text-base leading-relaxed italic text-neutral-800 dark:text-neutral-200 max-h-[220px] overflow-y-auto font-medium">
                  "{letterContent}"
                </p>
              )}
            </div>

            {/* Letter Footer */}
            <div className="mt-6">
              <div className="flex items-center justify-center gap-1 text-rose-gold-400 font-serif text-xs italic">
                <Heart size={12} fill="currentColor" />
                {lang === 'ar' ? 'سعيد وسهيلة سوا دايماً' : 'Saeed & Sohila Forever'}
              </div>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold text-xs uppercase tracking-widest shadow-md transition-transform hover:scale-105"
              >
                {t.closeEnvelope}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
