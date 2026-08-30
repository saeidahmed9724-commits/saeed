import React from 'react';
import { motion } from 'motion/react';
import { Language, UserRole } from '../../types';
import { roleDisplayName } from '../../gameTypes';

export function StartScreen({
  lang,
  suggestedStarter,
  onStart,
  busy,
  extraLabel
}: {
  lang: Language;
  myRole: UserRole;
  suggestedStarter: UserRole;
  onStart: () => void;
  busy: boolean;
  extraLabel?: string;
}) {
  const isAr = lang === 'ar';
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <span className="text-5xl">🎮</span>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-[220px]">
        {isAr
          ? `${roleDisplayName(suggestedStarter, 'ar')} تبدأ الجولة دي 🎲`
          : `${roleDisplayName(suggestedStarter, 'en')} starts this round 🎲`}
      </p>
      {extraLabel && <p className="text-xs text-neutral-400 dark:text-neutral-500">{extraLabel}</p>}
      <button
        onClick={onStart}
        disabled={busy}
        className="px-6 py-2.5 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-sm font-bold shadow-lg shadow-rose-gold-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
      >
        {busy ? (isAr ? 'جارِ البدء...' : 'Starting...') : isAr ? 'ابدأ اللعب 🚀' : 'Start Playing 🚀'}
      </button>
    </div>
  );
}

export function TurnBanner({
  lang,
  myRole,
  isFinished,
  winner,
  draw,
  myTurn,
  waitingLabel
}: {
  lang: Language;
  myRole: UserRole;
  isFinished: boolean;
  winner: UserRole | null;
  draw: boolean;
  myTurn: boolean;
  waitingLabel?: string;
}) {
  const isAr = lang === 'ar';
  if (isFinished) {
    if (draw) {
      return (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <p className="text-lg font-serif font-bold text-neutral-700 dark:text-neutral-200">🤝 {isAr ? 'تعادل!' : "It's a draw!"}</p>
        </motion.div>
      );
    }
    const iWon = winner === myRole;
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <p className={`text-lg font-serif font-bold ${iWon ? 'text-rose-gold-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
          {iWon
            ? (isAr ? '🏆 مبروك، كسبت!' : '🏆 You won!')
            : (isAr ? `😅 ${roleDisplayName(winner as UserRole, 'ar')} كسبت` : `😅 ${roleDisplayName(winner as UserRole, 'en')} won`)}
        </p>
      </motion.div>
    );
  }
  return (
    <div className="text-center">
      <p className={`text-sm font-bold ${myTurn ? 'text-rose-gold-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
        {myTurn ? (isAr ? 'دورك دلوقتي 🎯' : 'Your turn 🎯') : (waitingLabel || (isAr ? 'مستني الطرف التاني...' : 'Waiting for partner...'))}
      </p>
    </div>
  );
}

export function GameFooter({
  lang,
  isFinished,
  busy,
  onRematch,
  onCancel
}: {
  lang: Language;
  isFinished: boolean;
  busy: boolean;
  onRematch: () => void;
  onCancel: () => void;
}) {
  const isAr = lang === 'ar';
  return (
    <div className="flex items-center gap-2 mt-1">
      {isFinished ? (
        <button
          onClick={onRematch}
          disabled={busy}
          className="px-5 py-2 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {isAr ? '🔁 إعادة المباراة' : '🔁 Rematch'}
        </button>
      ) : (
        <button
          onClick={onCancel}
          disabled={busy}
          className="px-5 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {isAr ? 'إنهاء المباراة' : 'End Match'}
        </button>
      )}
    </div>
  );
}

export function partnerOf(r: UserRole): UserRole {
  return r === 'Dodo' ? 'SO' : 'Dodo';
}
