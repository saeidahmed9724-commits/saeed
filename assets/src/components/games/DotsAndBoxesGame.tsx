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
  onStart: (board: any, turn: UserRole, extra?: any) => Promise<void>;
  onMove: (patch: any) => Promise<void>;
  onFinish: (patch: any, finish: { winner: UserRole | null; draw: boolean; matchScore: string }) => Promise<void>;
  onCancel: () => Promise<void>;
}

const SIZE = 3; // 3x3 boxes = 4x4 dots — keeps the round quick on mobile

interface DotsBoard {
  hEdges: boolean[][]; // (SIZE+1) rows x SIZE cols
  vEdges: boolean[][]; // SIZE rows x (SIZE+1) cols
  boxes: (UserRole | null)[][]; // SIZE x SIZE
}

function emptyBoard(): DotsBoard {
  return {
    hEdges: Array.from({ length: SIZE + 1 }, () => Array(SIZE).fill(false)),
    vEdges: Array.from({ length: SIZE }, () => Array(SIZE + 1).fill(false)),
    boxes: Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  };
}

function isBoxComplete(board: DotsBoard, r: number, c: number): boolean {
  return !!(board.hEdges[r][c] && board.hEdges[r + 1][c] && board.vEdges[r][c] && board.vEdges[r][c + 1]);
}

export default function DotsAndBoxesGame({ lang, myRole, session, suggestedStarter, onStart, onMove, onFinish, onCancel }: Props) {
  const isAr = lang === 'ar';
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
        extraLabel={isAr ? `لوحة ${SIZE}×${SIZE} مربعات — قفل مربع تلعب تاني!` : `${SIZE}×${SIZE} board — close a box, go again!`}
        onStart={async () => {
          setBusy(true);
          await onStart(emptyBoard(), suggestedStarter, { roundScore: { Dodo: 0, SO: 0 } });
          setBusy(false);
        }}
      />
    );
  }

  const board: DotsBoard = session.board || emptyBoard();
  const isFinished = session.status === 'finished';
  const myTurn = session.turn === myRole && !isFinished;
  const scores = session.roundScore || { Dodo: 0, SO: 0 };
  const totalBoxes = SIZE * SIZE;
  const claimedBoxes = scores.Dodo + scores.SO;

  const applyEdge = async (kind: 'h' | 'v', r: number, c: number) => {
    if (busy || isFinished || !myTurn) return;
    if (kind === 'h' && board.hEdges[r][c]) return;
    if (kind === 'v' && board.vEdges[r][c]) return;
    setBusy(true);

    const nextBoard: DotsBoard = {
      hEdges: board.hEdges.map((row) => [...row]),
      vEdges: board.vEdges.map((row) => [...row]),
      boxes: board.boxes.map((row) => [...row])
    };
    if (kind === 'h') nextBoard.hEdges[r][c] = true;
    else nextBoard.vEdges[r][c] = true;

    // Check adjacent box(es) touched by this edge.
    let boxesClaimedThisMove = 0;
    const boxesToCheck: [number, number][] =
      kind === 'h'
        ? [[r - 1, c], [r, c]] // horizontal edge borders box above (r-1,c) and below (r,c)
        : [[r, c - 1], [r, c]]; // vertical edge borders box left (r,c-1) and right (r,c)

    boxesToCheck.forEach(([br, bc]) => {
      if (br < 0 || br >= SIZE || bc < 0 || bc >= SIZE) return;
      if (board.boxes[br][bc]) return; // already owned before this move
      if (isBoxComplete(nextBoard, br, bc)) {
        nextBoard.boxes[br][bc] = myRole;
        boxesClaimedThisMove++;
      }
    });

    const claimedAny = boxesClaimedThisMove > 0;
    const newScores = { ...scores, [myRole]: scores[myRole] + boxesClaimedThisMove };

    const nowClaimed = newScores.Dodo + newScores.SO;
    if (nowClaimed >= totalBoxes) {
      const winner: UserRole | null = newScores.Dodo === newScores.SO ? null : newScores.Dodo > newScores.SO ? 'Dodo' : 'SO';
      await onFinish(
        { board: nextBoard, roundScore: newScores },
        { winner, draw: winner === null, matchScore: `${newScores.Dodo}-${newScores.SO}` }
      );
    } else {
      await onMove({
        board: nextBoard,
        roundScore: newScores,
        turn: claimedAny ? myRole : partnerOf(myRole)
      });
    }
    setBusy(false);
  };

  const handleRematch = async () => {
    setBusy(true);
    const starter: UserRole = session.winner ? partnerOf(session.winner) : partnerOf(session.turn);
    await onStart(emptyBoard(), starter, { roundScore: { Dodo: 0, SO: 0 } });
    setBusy(false);
  };

  // Build a (2*SIZE+1) x (2*SIZE+1) grid: dots at even/even, h-edges at
  // even/odd, v-edges at odd/even, boxes at odd/odd.
  const gridDim = SIZE * 2 + 1;
  const cellPx = SIZE >= 4 ? 26 : 32;

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

      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(${gridDim}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${gridDim}, ${cellPx}px)`
        }}
      >
        {Array.from({ length: gridDim }).map((_, gr) =>
          Array.from({ length: gridDim }).map((_, gc) => {
            const isDotRow = gr % 2 === 0;
            const isDotCol = gc % 2 === 0;
            const key = `${gr}-${gc}`;

            if (isDotRow && isDotCol) {
              return (
                <div key={key} className="flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                </div>
              );
            }
            if (isDotRow && !isDotCol) {
              // horizontal edge at hEdges[gr/2][ (gc-1)/2 ]
              const r = gr / 2;
              const c = (gc - 1) / 2;
              const filled = board.hEdges[r]?.[c];
              return (
                <button
                  key={key}
                  onClick={() => applyEdge('h', r, c)}
                  disabled={busy || isFinished || !myTurn || filled}
                  className="flex items-center justify-center"
                >
                  <span className={`w-full h-1.5 rounded-full transition-all ${filled ? 'bg-rose-gold-400' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-rose-gold-200'}`} />
                </button>
              );
            }
            if (!isDotRow && isDotCol) {
              // vertical edge at vEdges[(gr-1)/2][gc/2]
              const r = (gr - 1) / 2;
              const c = gc / 2;
              const filled = board.vEdges[r]?.[c];
              return (
                <button
                  key={key}
                  onClick={() => applyEdge('v', r, c)}
                  disabled={busy || isFinished || !myTurn || filled}
                  className="flex items-center justify-center"
                >
                  <span className={`h-full w-1.5 rounded-full transition-all ${filled ? 'bg-rose-gold-400' : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-rose-gold-200'}`} />
                </button>
              );
            }
            // box interior
            const r = (gr - 1) / 2;
            const c = (gc - 1) / 2;
            const owner = board.boxes[r]?.[c];
            return (
              <div key={key} className="flex items-center justify-center">
                {owner && (
                  <span className={`text-[10px] font-black ${owner === 'Dodo' ? 'text-rose-gold-500' : 'text-arcade-cyan-500'}`}>
                    {owner === 'Dodo' ? (isAr ? 'س' : 'S') : (isAr ? 'هـ' : 'H')}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <GameFooter lang={lang} isFinished={isFinished} busy={busy} onRematch={handleRematch} onCancel={onCancel} />
    </div>
  );
}
