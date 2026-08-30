import React, { useEffect, useState } from 'react';
import { Language, UserRole } from '../../types';
import { GameSession } from '../../gameTypes';
import BirthdayConfetti from '../BirthdayConfetti';
import { StartScreen, TurnBanner, GameFooter, partnerOf } from './GameUI';

interface Props {
  lang: Language;
  myRole: UserRole;
  session: GameSession | null;
  suggestedStarter: UserRole;
  onStart: (board: any, turn: UserRole) => Promise<void>;
  onMove: (patch: any) => Promise<void>;
  onFinish: (patch: any, finish: { winner: UserRole | null; draw: boolean; matchScore: string }) => Promise<void>;
  onCancel: () => Promise<void>;
}

// Symbols are fixed by design spec: Dodo (Saeed) = X, SO (Sohila) = O.
const SYMBOL: Record<UserRole, 'X' | 'O'> = { Dodo: 'X', SO: 'O' };

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(board: (string | null)[]): { winnerSymbol: string | null; line: number[] | null } {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winnerSymbol: board[a], line };
    }
  }
  return { winnerSymbol: null, line: null };
}

export default function TicTacToeGame({ lang, myRole, session, suggestedStarter, onStart, onMove, onFinish, onCancel }: Props) {
  const partnerRole: UserRole = partnerOf(myRole);
  const [celebrate, setCelebrate] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session?.status === 'finished' && session.winner === myRole) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3200);
      return () => clearTimeout(t);
    }
  }, [session?.status, session?.winner, myRole]);

  if (!session) {
    return (
      <StartScreen
        lang={lang}
        myRole={myRole}
        suggestedStarter={suggestedStarter}
        busy={busy}
        onStart={async () => {
          setBusy(true);
          await onStart(Array(9).fill(null), suggestedStarter);
          setBusy(false);
        }}
      />
    );
  }

  const board: (string | null)[] = session.board || Array(9).fill(null);
  const { winnerSymbol, line } = checkWinner(board);
  const isDraw = !winnerSymbol && board.every((c) => c !== null);
  const isFinished = session.status === 'finished';
  const myTurn = session.turn === myRole && !isFinished;

  const handleCellClick = async (idx: number) => {
    if (busy || isFinished || board[idx] || session.turn !== myRole) return;
    setBusy(true);
    const next = [...board];
    next[idx] = SYMBOL[myRole];
    const { winnerSymbol: newWinnerSymbol } = checkWinner(next);
    const drawNow = !newWinnerSymbol && next.every((c) => c !== null);

    if (newWinnerSymbol) {
      const winnerRole: UserRole = newWinnerSymbol === SYMBOL.Dodo ? 'Dodo' : 'SO';
      await onFinish(
        { board: next, moveCount: (session.moveCount || 0) + 1 },
        { winner: winnerRole, draw: false, matchScore: '1-0' }
      );
    } else if (drawNow) {
      await onFinish(
        { board: next, moveCount: (session.moveCount || 0) + 1 },
        { winner: null, draw: true, matchScore: '0-0' }
      );
    } else {
      await onMove({ board: next, turn: partnerRole, moveCount: (session.moveCount || 0) + 1 });
    }
    setBusy(false);
  };

  const handleRematch = async () => {
    setBusy(true);
    const starter: UserRole = session.winner ? partnerOf(session.winner) : partnerOf(session.turn);
    await onStart(Array(9).fill(null), starter);
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {celebrate && <BirthdayConfetti active={celebrate} />}

      <TurnBanner lang={lang} myRole={myRole} isFinished={isFinished} winner={session.winner ?? null} draw={isDraw} myTurn={myTurn} />

      <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] mx-auto">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={busy || isFinished || !!cell || session.turn !== myRole}
            className={`aspect-square rounded-2xl glass border flex items-center justify-center text-3xl font-black transition-all ${
              line?.includes(idx)
                ? 'border-rose-gold-400 bg-rose-gold-50 dark:bg-rose-gold-950/40'
                : 'border-white/30 dark:border-white/5'
            } ${!cell && session.turn === myRole && !isFinished ? 'hover:scale-105 cursor-pointer' : ''}`}
          >
            {cell === 'X' && <span className="text-arcade-purple-500 dark:text-arcade-purple-300">✕</span>}
            {cell === 'O' && <span className="text-rose-gold-500 dark:text-rose-gold-300">○</span>}
          </button>
        ))}
      </div>

      <GameFooter lang={lang} isFinished={isFinished} busy={busy} onRematch={handleRematch} onCancel={onCancel} />
    </div>
  );
}
