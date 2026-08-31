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

const COLS = 7;
const ROWS = 6;
// Pieces are fixed by design: Dodo (Saeed) = red, SO (Sohila) = yellow.
const PIECE: Record<UserRole, 'R' | 'Y'> = { Dodo: 'R', SO: 'Y' };

function emptyBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function dropInColumn(board: (string | null)[][], col: number, piece: string): { board: (string | null)[][]; row: number } | null {
  const next = board.map((r) => [...r]);
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!next[row][col]) {
      next[row][col] = piece;
      return { board: next, row };
    }
  }
  return null;
}

function checkWinner(board: (string | null)[][]): { piece: string | null; cells: [number, number][] } {
  const dirs = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      for (const [dr, dc] of dirs) {
        const cells: [number, number][] = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const rr = r + dr * i;
          const cc = c + dc * i;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || board[rr][cc] !== piece) break;
          cells.push([rr, cc]);
        }
        if (cells.length === 4) return { piece, cells };
      }
    }
  }
  return { piece: null, cells: [] };
}

export default function ConnectFourGame({ lang, myRole, session, suggestedStarter, onStart, onMove, onFinish, onCancel }: Props) {
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
      <StartScreen lang={lang} myRole={myRole} suggestedStarter={suggestedStarter} busy={busy} onStart={async () => {
        setBusy(true);
        await onStart(emptyBoard(), suggestedStarter);
        setBusy(false);
      }} />
    );
  }

  const board: (string | null)[][] = session.board || emptyBoard();
  const { piece: winPiece, cells: winCells } = checkWinner(board);
  const isDraw = !winPiece && board.every((row) => row.every((c) => c !== null));
  const isFinished = session.status === 'finished';
  const myTurn = session.turn === myRole && !isFinished;
  const isWinCell = (r: number, c: number) => winCells.some(([wr, wc]) => wr === r && wc === c);

  const handleColumnClick = async (col: number) => {
    if (busy || isFinished || session.turn !== myRole) return;
    const dropped = dropInColumn(board, col, PIECE[myRole]);
    if (!dropped) return; // column full
    setBusy(true);
    const { piece: newWinPiece } = checkWinner(dropped.board);
    const drawNow = !newWinPiece && dropped.board.every((row) => row.every((c) => c !== null));

    if (newWinPiece) {
      const winnerRole: UserRole = newWinPiece === PIECE.Dodo ? 'Dodo' : 'SO';
      await onFinish(
        { board: dropped.board, moveCount: (session.moveCount || 0) + 1 },
        { winner: winnerRole, draw: false, matchScore: '1-0' }
      );
    } else if (drawNow) {
      await onFinish(
        { board: dropped.board, moveCount: (session.moveCount || 0) + 1 },
        { winner: null, draw: true, matchScore: '0-0' }
      );
    } else {
      await onMove({ board: dropped.board, turn: partnerRole, moveCount: (session.moveCount || 0) + 1 });
    }
    setBusy(false);
  };

  const handleRematch = async () => {
    setBusy(true);
    const starter: UserRole = session.winner ? partnerOf(session.winner) : partnerOf(session.turn);
    await onStart(emptyBoard(), starter);
    setBusy(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {celebrate && <BirthdayConfetti active={celebrate} />}

      <TurnBanner lang={lang} myRole={myRole} isFinished={isFinished} winner={session.winner ?? null} draw={isDraw} myTurn={myTurn} />

      <div className="w-full overflow-x-auto pb-1">
        <div className="inline-block bg-arcade-purple-500 dark:bg-arcade-purple-800 rounded-2xl p-2 mx-auto">
          <div className="grid grid-cols-7 gap-1">
            {board.map((row, r) =>
              row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleColumnClick(c)}
                  disabled={busy || isFinished || !myTurn || !!board[0][c]}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                    isWinCell(r, c) ? 'ring-2 ring-white' : ''
                  } ${!board[0][c] && myTurn ? 'cursor-pointer' : ''}`}
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <span
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full block transition-all"
                    style={{
                      background: cell === 'R' ? '#e83e86' : cell === 'Y' ? '#3ccddc' : 'rgba(255,255,255,0.15)'
                    }}
                  />
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#e83e86' }} /> {lang === 'ar' ? 'سعيد' : 'Saeed'}</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: '#3ccddc' }} /> {lang === 'ar' ? 'سهيلة' : 'Sohila'}</span>
      </div>

      <GameFooter lang={lang} isFinished={isFinished} busy={busy} onRematch={handleRematch} onCancel={onCancel} />
    </div>
  );
}
