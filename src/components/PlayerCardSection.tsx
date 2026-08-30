import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Edit3, Save } from 'lucide-react';
import { Language, UserRole, PlayerCardMap, PlayerCardData } from '../types';
import { DataStore } from '../dataStore';
import { CARD_SECTIONS, calculateOVR } from '../playerCardAttributes';

interface PlayerCardModalProps {
  lang: Language;
  currentRole: UserRole;
}

export default function PlayerCardSection({ lang, currentRole }: PlayerCardModalProps) {
  const [cardMap, setCardMap] = useState<PlayerCardMap>({});
  const [isEditing, setIsEditing] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [strength, setStrength] = useState('');
  const [weakness, setWeakness] = useState('');
  const [signatureMove, setSignatureMove] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(CARD_SECTIONS[0].id);

  const partnerRole: UserRole = currentRole === 'Dodo' ? 'SO' : 'Dodo';
  const myName = currentRole === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila');
  const partnerName = currentRole === 'Dodo' ? (lang === 'ar' ? 'سهيلة' : 'Sohila') : (lang === 'ar' ? 'سعيد' : 'Saeed');

  // The card being viewed/edited is always about the PARTNER (I rate them, I view their card)
  const cardKey = currentRole === 'Dodo' ? 'ratingsOfSO' : 'ratingsOfDodo';
  const existingCard: PlayerCardData | undefined = cardMap[cardKey];

  useEffect(() => {
    const load = () => {
      const data = DataStore.getPlayerCard();
      setCardMap(data);
    };
    load();
    window.addEventListener('datastore_synced', load);
    return () => window.removeEventListener('datastore_synced', load);
  }, []);

  useEffect(() => {
    if (existingCard) {
      setRatings(existingCard.ratings || {});
      setStrength(existingCard.strength || '');
      setWeakness(existingCard.weakness || '');
      setSignatureMove(existingCard.signatureMove || '');
    }
  }, [existingCard?.updatedAt]);

  const handleSave = () => {
    const data: PlayerCardData = {
      ratings,
      strength: strength.trim(),
      weakness: weakness.trim(),
      signatureMove: signatureMove.trim()
    };
    DataStore.savePlayerCardRating(currentRole, data);
    setIsEditing(false);
  };

  const ovr = existingCard ? calculateOVR(existingCard.ratings || {}) : 0;
  const activeSection = CARD_SECTIONS.find((s) => s.id === activeSectionId)!;

  // --- Rating Form ---
  if (isEditing) {
    return (
      <div className="w-full max-w-lg mx-auto py-2 space-y-4">
        <div className="text-center mb-2">
          <h4 className="font-serif text-lg font-bold text-neutral-900 dark:text-neutral-50">
            {lang === 'ar' ? `قيّم كارت ${partnerName} 🃏` : `Rate ${partnerName}'s Card 🃏`}
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {lang === 'ar' ? 'كل خاصية من 0 لـ 100' : 'Each attribute from 0 to 100'}
          </p>
        </div>

        {/* Section pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {CARD_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeSectionId === section.id
                  ? 'bg-rose-gold-500 text-white shadow-md shadow-rose-gold-500/20'
                  : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-rose-gold-50 dark:hover:bg-neutral-700'
              }`}
            >
              <span>{section.emoji}</span>
              <span>{lang === 'ar' ? section.nameAr : section.nameEn}</span>
            </button>
          ))}
        </div>

        {/* Sliders for active section */}
        <div className="space-y-4">
          {activeSection.attributes.map((attr) => {
            const value = ratings[attr.id] ?? 50;
            return (
              <div key={attr.id}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <span>{attr.emoji}</span>
                    <span>{lang === 'ar' ? attr.labelAr : attr.labelEn}</span>
                  </label>
                  <span className="text-xs font-extrabold text-rose-gold-600 dark:text-rose-gold-400 font-mono">
                    {value}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(e) =>
                    setRatings((prev) => ({ ...prev, [attr.id]: parseInt(e.target.value, 10) }))
                  }
                  className="w-full accent-rose-gold-500 cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        {/* Scout report fields - only shown once, not per section, so keep simple: show under 'special' section */}
        {activeSectionId === 'special' && (
          <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-white/10">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {lang === 'ar' ? `أكتر حاجة بتميز ${partnerName} ❤️` : `${partnerName}'s biggest strength ❤️`}
              </label>
              <textarea
                rows={2}
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {lang === 'ar' ? `أكتر حاجة بتتعبني منها ⚠️` : `What tires me most ⚠️`}
              </label>
              <textarea
                rows={2}
                value={weakness}
                onChange={(e) => setWeakness(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {lang === 'ar' ? `الحركة المميزة بتاعتها/بتاعته 🔥` : `Signature move 🔥`}
              </label>
              <textarea
                rows={2}
                value={signatureMove}
                onChange={(e) => setSignatureMove(e.target.value)}
                className="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-gold-500/20"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {existingCard && (
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save size={14} />
            {lang === 'ar' ? 'حفظ الكارت' : 'Save Card'}
          </button>
        </div>
      </div>
    );
  }

  // --- No Card Yet ---
  if (!existingCard) {
    return (
      <div className="w-full max-w-lg mx-auto py-8 text-center space-y-4">
        <Sparkles className="mx-auto text-rose-gold-400" size={32} />
        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
          {lang === 'ar'
            ? `لسه معملتش كارت لـ ${partnerName}! اعمل الكارت الأول دلوقتي 🃏`
            : `You haven't made ${partnerName}'s card yet! Create it now 🃏`}
        </p>
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
        >
          {lang === 'ar' ? 'اعمل الكارت 🃏' : 'Create Card 🃏'}
        </button>
      </div>
    );
  }

  // --- Card Display ---
  return (
    <div className="w-full max-w-md mx-auto py-4 space-y-5">
      {/* The Card itself */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[28px] p-6 bg-gradient-to-br from-arcade-purple-800 via-arcade-purple-900 to-black border-2 border-rose-gold-400/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-gold-500/20 rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between mb-4">
          <div>
            <span className="block text-4xl font-black text-rose-gold-300 font-mono leading-none">{ovr}</span>
            <span className="text-[10px] font-bold text-rose-gold-400 uppercase tracking-widest">OVR</span>
          </div>
          <div className="text-right">
            <h4 className="font-serif text-xl font-bold text-white">{partnerName}</h4>
            <span className="text-[10px] font-bold text-rose-gold-300 uppercase tracking-wider">
              {lang === 'ar' ? '❤️ الشريك' : '❤️ Partner'}
            </span>
          </div>
        </div>

        {/* Section mini-scores */}
        <div className="relative grid grid-cols-2 gap-2 mb-3">
          {CARD_SECTIONS.map((section) => {
            const values = section.attributes.map((a) => existingCard.ratings[a.id] ?? 0);
            const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
            return (
              <div key={section.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                <span className="text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <span>{section.emoji}</span>
                  <span>{lang === 'ar' ? section.nameAr : section.nameEn}</span>
                </span>
                <span className="text-xs font-extrabold text-rose-gold-300 font-mono">{avg}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scout report */}
      {(existingCard.strength || existingCard.weakness || existingCard.signatureMove) && (
        <div className="space-y-2.5">
          {existingCard.strength && (
            <div className="p-3 rounded-2xl bg-rose-gold-50 dark:bg-rose-gold-950/30 border border-rose-gold-100 dark:border-rose-gold-900/30">
              <span className="text-[10px] font-bold text-rose-gold-600 dark:text-rose-gold-400 uppercase tracking-wider block mb-1">
                ❤️ {lang === 'ar' ? 'أهم مميزاتها' : 'Strength'}
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">{existingCard.strength}</p>
            </div>
          )}
          {existingCard.weakness && (
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-black/30 border border-neutral-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                ⚠️ {lang === 'ar' ? 'أكتر حاجة متعبة' : 'Weakness'}
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">{existingCard.weakness}</p>
            </div>
          )}
          {existingCard.signatureMove && (
            <div className="p-3 rounded-2xl bg-white/80 dark:bg-black/30 border border-neutral-200 dark:border-white/10">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                🔥 {lang === 'ar' ? 'الحركة المميزة' : 'Signature Move'}
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-200 font-medium">{existingCard.signatureMove}</p>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-1.5 text-xs text-rose-gold-600 dark:text-rose-gold-400 font-bold hover:underline cursor-pointer"
        >
          <Edit3 size={14} />
          <span>{lang === 'ar' ? 'تعديل الكارت' : 'Edit Card'}</span>
        </button>
      </div>
    </div>
  );
}
