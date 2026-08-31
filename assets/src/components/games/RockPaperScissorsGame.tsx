import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Language, UserRole } from '../../types';
import { GameSession, roleDisplayName } from '../../gameTypes';
import BirthdayConfetti from '../BirthdayConfetti';
import { GameFooter, partnerOf } from './GameUI';

interface Props {
  lang: Language;
  myRole: UserRole;
  session: GameSession | null;
  suggestedStarter: UserRole;
  onStart: (board: any, turn: UserRole, extra?: any) => Promise<void>;
  onMove: (patch: any) => Promise<void>;
  onFinish: (patch: any, finish: { winner: UserRole | null; draw: boolean; matchScore: string }) => Promise<void>;
  onCancel: () => Promise<void>;
}

type Choice = 'rock' | 'paper' | 'scissors';
const CHOICES: { id: Choice; emoji: string; labelAr: string; labelEn: string }[] = [
  { id: 'rock', emoji: '🪨', labelAr: 'حجر', labelEn: 'Rock' },
  { id: 'paper', emoji: '📄', labelAr: 'ورقة', labelEn: 'Paper' },
  { id: 'scissors', emoji: '✂️', labelAr: 'مقص', labelEn: 'Scissors' }
];
const WINS_TO: number = 3; // best-of-5 match

function roundWinner(a: Choice, b: Choice): 'a' | 'b' | 'tie' {
  if (a === b) return 'tie';
  if ((a === 'rock' && b === 'scissors') || (a === 'scissors' && b === 'paper') || (a === 'paper' && b === 'rock')) return 'a';
  return 'b';
}

export default function RockPaperScissorsGame({ lang, myRole, session, suggestedStarter, onStart, onMove, onFinish, onCancel }: Props) {
  const isAr = lang === 'ar';
  const partnerRole: UserRole = partnerOf(myRole);
  const [celebrate, setCelebrate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (session?.status === 'finished' && session.winner === myRole) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3200);
      return () => clearTimeout(t);
    }
  }, [session?.status, session?.winner, myRole]);

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="text-5xl">✋</span>
        <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-[240px]">
          {isAr ? `أول وحدة توصل لـ ${WINS_TO} جولات تكسب المباراة` : `First to ${WINS_TO} rounds wins the match`}
        </p>
        <button
          onClick={async () => {
            setBusy(true);
            await onStart(null, suggestedStarter, { roundScore: { Dodo: 0, SO: 0 }, round: 1 });
            setBusy(false);
          }}
          disabled={busy}
          className="px-6 py-2.5 rounded-full bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-sm font-bold shadow-lg shadow-rose-gold-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {busy ? (isAr ? 'جارِ البدء...' : 'Starting...') : isAr ? 'ابدأ اللعب 🚀' : 'Start Playing 🚀'}
        </button>
      </div>
    );
  }

  const isFinished = session.status === 'finished';
  const choices = session.choices || {};
  const myChoice = choices[myRole] as Choice | undefined;
  const partnerChoice = choices[partnerRole] as Choice | undefined;
  const bothChosen = !!myChoice && !!partnerChoice;
  const roundScore = session.roundScore || { Dodo: 0, SO: 0 };

  const handlePick = async (choice: Choice) => {
    if (busy || isFinished || myChoice) return;
    setBusy(true);
    const nextChoices = { ...choices, [myRole]: choice };

    if (nextChoices.Dodo && nextChoices.SO) {
      // Both have picked — resolve the round.
      const a = nextChoices.Dodo as Choice;
      const b = nextChoices.SO as Choice;
      const result = roundWinner(a, b); // 'a' = Dodo, 'b' = SO
      const tie = result === 'tie';
      const roundWinnerRole: UserRole | null = tie ? null : result === 'a' ? 'Dodo' : 'SO';
      const newRoundScore = {
        Dodo: roundScore.Dodo + (roundWinnerRole === 'Dodo' ? 1 : 0),
        SO: roundScore.SO + (roundWinnerRole === 'SO' ? 1 : 0)
      };

      setRevealing(true);
      setTimeout(() => setRevealing(false), 1400);

      const matchOver = newRoundScore.Dodo >= WINS_TO || newRoundScore.SO >= WINS_TO;
      if (matchOver) {
        const matchWinner: UserRole = newRoundScore.Dodo > newRoundScore.SO ? 'Dodo' : 'SO';
        await onFinish(
          { choices: {}, roundScore: newRoundScore, round: (session.round || 1) + 1 },
          { winner: matchWinner, draw: false, matchScore: `${newRoundScore.Dodo}-${newRoundScore.SO}` }
        );
      } else {
        // Keep choices visible for a beat (both clients see the reveal),
        // then move to the next round by clearing choices.
        await onMove({ choices: nextChoices, roundScore: newRoundScore });
        setTimeout(async () => {
          await onMove({ choices: {}, round: (session.round || 1) + 1 });
        }, 1600);
      }
    } else {
      await onMove({ choices: nextChoices });
    }
    setBusy(false);
  };

  const handleRematch = async () => {
    setBusy(true);
    const starter: UserRole = session.winner ? partnerOf(session.winner) : suggestedStarter;
    await onStart(null, starter, { roundScore: { Dodo: 0, SO: 0 }, round: 1 });
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {celebrate && <BirthdayConfetti active={celebrate} />}

      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{isAr ? 'سعيد' : 'Saeed'}</p>
          <p className="text-2xl font-black text-rose-gold-500">{roundScore.Dodo}</p>
        </div>
        <span className="text-xs text-neutral-300 dark:text-neutral-600 font-bold">{isAr ? 'أول لـ' : 'first to'} {WINS_TO}</span>
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{isAr ? 'سهيلة' : 'Sohila'}</p>
          <p className="text-2xl font-black text-arcade-cyan-500">{roundScore.SO}</p>
        </div>
      </div>

      {isFinished ? (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <p className={`text-lg font-serif font-bold ${session.winner === myRole ? 'text-rose-gold-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
            {session.winner === myRole
              ? (isAr ? '🏆 مبروك، كسبت المباراة!' : '🏆 You won the match!')
              : (isAr ? `😅 ${roleDisplayName(session.winner as UserRole, 'ar')} كسبت المباراة` : `😅 ${roleDisplayName(session.winner as UserRole, 'en')} won the match`)}
          </p>
        </motion.div>
      ) : (
        <>
          <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
            {isAr ? `الجولة ${session.round || 1}` : `Round ${session.round || 1}`}
          </p>

          <div className="flex items-center justify-center gap-6 h-16">
            <ChoiceBubble emoji={myChoice ? CHOICES.find((c) => c.id === myChoice)?.emoji : '❔'} label={isAr ? 'أنت' : 'You'} revealed={!!myChoice} />
            <span className="text-2xl">⚡</span>
            <ChoiceBubble
              emoji={bothChosen ? CHOICES.find((c) => c.id === partnerChoice)?.emoji : partnerChoice ? '✅' : '❔'}
              label={isAr ? 'الطرف التاني' : 'Partner'}
              revealed={bothChosen}
            />
          </div>

          {!myChoice ? (
            <div className="flex items-center gap-3">
              {CHOICES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handlePick(c.id)}
                  disabled={busy}
                  className="w-16 h-16 rounded-2xl glass border border-white/30 dark:border-white/5 flex flex-col items-center justify-center gap-0.5 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400">{isAr ? c.labelAr : c.labelEn}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {isAr ? 'اخترت بالفعل، مستني الطرف التاني يختار...' : 'You picked — waiting for your partner...'}
            </p>
          )}
        </>
      )}

      <GameFooter lang={lang} isFinished={isFinished} busy={busy} onRematch={handleRematch} onCancel={onCancel} />
    </div>
  );
}

function ChoiceBubble({ emoji, label, revealed }: { emoji?: string; label: string; revealed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={revealed ? { scale: [0.7, 1.15, 1] } : {}}
        transition={{ duration: 0.4 }}
        className="w-14 h-14 rounded-2xl glass border border-white/30 dark:border-white/5 flex items-center justify-center text-2xl"
      >
        {emoji}
      </motion.div>
      <span className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500">{label}</span>
    </div>
  );
}
