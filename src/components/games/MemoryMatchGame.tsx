import React, { useEffect, useRef, useState } from 'react';
import { Language, UserRole } from '../../types';
import { GameSession } from '../../gameTypes';
import BirthdayConfetti from '../BirthdayConfetti';
import { StartScreen, TurnBanner, GameFooter, partnerOf } from './GameUI';

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

const SYMBOLS = ['🌸', '🎈', '🍓', '🎵', '⭐', '🦋', '🍩', '🌙'];

interface Card {
  symbol: string;
  matched: boolean;
}

interface MemoryBoard {
  cards: Card[];
  revealed: number[]; // indices currently face-up, not yet resolved (0, 1, or 2 items)
}

function buildShuffledBoard(): MemoryBoard {
  const deck = [...SYMBOLS, ...SYMBOLS]
    .map((symbol) => ({ symbol, matched: false }))
    .sort(() => Math.random() - 0.5);
  return { cards: deck, revealed: [] };
}

export default function MemoryMatchGame({ lang, myRole, session, suggestedStarter, onStart, onMove, onFinish, onCancel }: Props) {
  const isAr = lang === 'ar';
  const [celebrate, setCelebrate] = useState(false);
  const [busy, setBusy] = useState(false);
  const resolveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (session?.status === 'finished' && session.winner === myRole) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3200);
      return () => clearTimeout(t);
    }
  }, [session?.status, session?.winner, myRole]);

  useEffect(() => () => {
    if (resolveTimeout.current) clearTimeout(resolveTimeout.current);
  }, []);

  if (!session) {
    return (
      <StartScreen
        lang={lang}
        myRole={myRole}
        suggestedStarter={suggestedStarter}
        busy={busy}
        extraLabel={isAr ? '8 أزواج من الكروت — لو طابقت كملي دورك!' : '8 pairs of cards — match to keep your turn!'}
        onStart={async () => {
          setBusy(true);
          await onStart(buildShuffledBoard(), suggestedStarter, { roundScore: { Dodo: 0, SO: 0 } });
          setBusy(false);
        }}
      />
    );
  }

  const board: MemoryBoard = session.board || buildShuffledBoard();
  const isFinished = session.status === 'finished';
  const myTurn = session.turn === myRole && !isFinished;
  const revealed = board.revealed || [];
  const scores = session.roundScore || { Dodo: 0, SO: 0 };

  const handleCardClick = async (idx: number) => {
    if (busy || isFinished || !myTurn) return;
    const card = board.cards[idx];
    if (card.matched || revealed.includes(idx) || revealed.length >= 2) return;

    setBusy(true);
    const nextRevealed = [...revealed, idx];

    if (nextRevealed.length < 2) {
      await onMove({ board: { ...board, revealed: nextRevealed } });
      setBusy(false);
      return;
    }

    // Second card flipped — resolve the pair.
    const [firstIdx, secondIdx] = nextRevealed;
    const isMatch = board.cards[firstIdx].symbol === board.cards[secondIdx].symbol;
    const nextCards = board.cards.map((c, i) => (i === firstIdx || i === secondIdx ? { ...c, matched: c.matched || isMatch } : c));
    const allMatched = nextCards.every((c) => c.matched);
    const newScores = { ...scores, [myRole]: scores[myRole] + (isMatch ? 1 : 0) };

    if (isMatch && allMatched) {
      const winner: UserRole | null = newScores.Dodo === newScores.SO ? null : newScores.Dodo > newScores.SO ? 'Dodo' : 'SO';
      await onFinish(
        { board: { cards: nextCards, revealed: [] }, roundScore: newScores },
        { winner, draw: winner === null, matchScore: `${newScores.Dodo}-${newScores.SO}` }
      );
      setBusy(false);
      return;
    }

    if (isMatch) {
      // Keep the pair visible briefly, then clear the "revealed" markers
      // (cards stay matched) and let the same player continue.
      await onMove({ board: { cards: nextCards, revealed: nextRevealed }, roundScore: newScores });
      resolveTimeout.current = setTimeout(async () => {
        await onMove({ board: { cards: nextCards, revealed: [] } });
      }, 700);
    } else {
      await onMove({ board: { cards: board.cards, revealed: nextRevealed } });
      resolveTimeout.current = setTimeout(async () => {
        await onMove({ board: { cards: board.cards, revealed: [] }, turn: partnerOf(myRole) });
      }, 900);
    }
    setBusy(false);
  };

  const handleRematch = async () => {
    setBusy(true);
    const starter: UserRole = session.winner ? partnerOf(session.winner) : partnerOf(session.turn);
    await onStart(buildShuffledBoard(), starter, { roundScore: { Dodo: 0, SO: 0 } });
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {celebrate && <BirthdayConfetti active={celebrate} />}

      <div className="flex items-center gap-6 text-center">
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{isAr ? 'سعيد' : 'Saeed'}</p>
          <p className="text-xl font-black text-rose-gold-500">{scores.Dodo}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">{isAr ? 'سهيلة' : 'Sohila'}</p>
          <p className="text-xl font-black text-arcade-cyan-500">{scores.SO}</p>
        </div>
      </div>

      <TurnBanner lang={lang} myRole={myRole} isFinished={isFinished} winner={session.winner ?? null} draw={!!session.draw} myTurn={myTurn} />

      <div className="grid grid-cols-4 gap-1.5 w-full max-w-[280px] mx-auto">
        {board.cards.map((card, idx) => {
          const faceUp = card.matched || revealed.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleCardClick(idx)}
              disabled={busy || isFinished || !myTurn || faceUp}
              className={`aspect-square rounded-xl flex items-center justify-center text-lg sm:text-xl transition-all ${
                card.matched
                  ? 'bg-rose-gold-50 dark:bg-rose-gold-950/30 border border-rose-gold-200 dark:border-rose-gold-900'
                  : faceUp
                    ? 'glass border border-white/40 dark:border-white/10 scale-105'
                    : 'bg-arcade-purple-500/90 dark:bg-arcade-purple-800 border border-arcade-purple-600/40 hover:scale-105 cursor-pointer'
              }`}
            >
              {faceUp ? card.symbol : ''}
            </button>
          );
        })}
      </div>

      <GameFooter lang={lang} isFinished={isFinished} busy={busy} onRematch={handleRematch} onCancel={onCancel} />
    </div>
  );
}
