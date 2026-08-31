import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trophy, History, LayoutGrid, ChevronLeft } from 'lucide-react';
import { Language, UserRole } from '../types';
import { GameMatch, GameSession, GameType, GAME_META, ALL_GAME_TYPES } from '../gameTypes';
import TicTacToeGame from './games/TicTacToeGame';
import ConnectFourGame from './games/ConnectFourGame';
import RockPaperScissorsGame from './games/RockPaperScissorsGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import DotsAndBoxesGame from './games/DotsAndBoxesGame';
import ArcadeStats from './games/ArcadeStats';
import GameHistory from './games/GameHistory';

interface GamesSectionProps {
  lang: Language;
  currentUserRole: UserRole;
  liveState: any;
}

type View = 'arcade' | GameType | 'stats' | 'history';

export default function GamesSection({ lang, currentUserRole, liveState }: GamesSectionProps) {
  const isAr = lang === 'ar';
  const [view, setView] = useState<View>('arcade');
  const [matches, setMatches] = useState<GameMatch[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Read from the single app-wide poll (App.tsx) instead of running our own
  // interval — avoids piling extra requests onto Vercel's function traffic.
  const loading = !liveState;
  useEffect(() => {
    if (!liveState) return;
    setMatches(liveState.gameMatches || []);
    setSession(liveState.activeGameSession || null);
    sessionIdRef.current = liveState.activeGameSession?.id || null;
  }, [liveState]);

  const startSession = async (gameType: GameType, board: any, turn: UserRole, extra?: any) => {
    try {
      const res = await fetch('/api/games/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType, board, turn, ...(extra || {}) })
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        sessionIdRef.current = data.session.id;
      }
    } catch (err) {
      console.log('Error starting game session:', err);
    }
  };

  const updateSession = async (patch: any) => {
    if (!sessionIdRef.current) return;
    try {
      const res = await fetch('/api/games/session/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, role: currentUserRole, patch })
      });
      const data = await res.json();
      if (res.status === 409) {
        // Partner moved first / session changed under us — resync silently.
        setSession(data.session || null);
        sessionIdRef.current = data.session?.id || null;
        return;
      }
      if (data.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.log('Error updating game session:', err);
    }
  };

  const finishSession = async (patch: any, finish: { winner: UserRole | null; draw: boolean; matchScore: string; matchDetails?: any }) => {
    if (!sessionIdRef.current) return;
    try {
      const res = await fetch('/api/games/session/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current, role: currentUserRole, patch, finish })
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      }
      if (data.match) {
        setMatches((prev) => [data.match, ...prev]);
      }
    } catch (err) {
      console.log('Error finishing game session:', err);
    }
  };

  const cancelSession = async () => {
    if (!sessionIdRef.current) return;
    try {
      await fetch('/api/games/session/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionIdRef.current })
      });
    } catch (err) {
      console.log('Error cancelling game session:', err);
    } finally {
      setSession(null);
      sessionIdRef.current = null;
      setView('arcade');
    }
  };

  const matchesByType = useMemo(() => {
    const map: Record<GameType, GameMatch[]> = { xo: [], connect4: [], rps: [], memory: [], dots: [] };
    matches.forEach((m) => {
      if (map[m.gameType]) map[m.gameType].push(m);
    });
    return map;
  }, [matches]);

  const suggestedStarterFor = (gameType: GameType): UserRole => {
    const count = matchesByType[gameType].length;
    return count % 2 === 0 ? 'Dodo' : 'SO';
  };

  const handlePlay = (gameType: GameType) => {
    if (session && session.gameType !== gameType && session.status === 'active') {
      const ok = window.confirm(
        isAr
          ? `في مباراة ${isAr ? GAME_META[session.gameType].nameAr : GAME_META[session.gameType].nameEn} شغالة بالفعل. تحبوا تلغوها وتبدأوا ${GAME_META[gameType].nameAr}؟`
          : `A ${GAME_META[session.gameType].nameEn} match is already in progress. Cancel it and start ${GAME_META[gameType].nameEn}?`
      );
      if (!ok) return;
      sessionIdRef.current = session.id;
      cancelSession().then(() => setView(gameType));
      return;
    }
    setView(gameType);
  };

  if (loading) {
    return <div className="text-center py-10 text-sm text-neutral-400">{isAr ? 'جارِ التحميل...' : 'Loading...'}</div>;
  }

  const activeSessionForCurrentView: GameSession | null = view !== 'arcade' && view !== 'stats' && view !== 'history' && session?.gameType === view ? session : null;

  return (
    <div className="w-full max-w-lg mx-auto py-1">
      {view !== 'arcade' && (
        <button
          onClick={() => setView('arcade')}
          className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-rose-gold-500 mb-3 cursor-pointer"
        >
          <ChevronLeft size={14} className={isAr ? 'rotate-180' : ''} />
          {isAr ? 'رجوع للأركيد' : 'Back to Arcade'}
        </button>
      )}

      {view === 'arcade' && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 rounded-2xl glass p-1 border border-white/30 dark:border-white/5">
            <TabButton active icon={<LayoutGrid size={14} />} label={isAr ? 'الأركيد' : 'Arcade'} onClick={() => {}} />
            <TabButton active={false} icon={<Trophy size={14} />} label={isAr ? 'إحصائيات' : 'Stats'} onClick={() => setView('stats')} />
            <TabButton active={false} icon={<History size={14} />} label={isAr ? 'السجل' : 'History'} onClick={() => setView('history')} />
          </div>

          {session && session.status === 'active' && (
            <button
              onClick={() => setView(session.gameType)}
              className="w-full rounded-2xl bg-gradient-to-r from-rose-gold-500 to-arcade-purple-500 text-white p-3 text-center shadow-lg cursor-pointer"
            >
              <p className="text-xs font-black">
                {GAME_META[session.gameType].icon} {isAr ? 'مباراة شغالة دلوقتي — كمّل اللعب' : 'A match is in progress — tap to continue'}
              </p>
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            {ALL_GAME_TYPES.map((gameType) => {
              const meta = GAME_META[gameType];
              const list = matchesByType[gameType];
              const dodoWins = list.filter((m) => m.winner === 'Dodo').length;
              const soWins = list.filter((m) => m.winner === 'SO').length;
              const last = list[0];

              return (
                <button
                  key={gameType}
                  onClick={() => handlePlay(gameType)}
                  className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 shadow-xs hover:scale-[1.02] active:scale-98 transition-all flex flex-col justify-between items-start text-left rtl:text-right cursor-pointer group min-h-[120px]"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{meta.icon}</span>
                  <div className="w-full">
                    <h4 className="font-serif text-xs font-bold text-neutral-950 dark:text-neutral-100">
                      {isAr ? meta.nameAr : meta.nameEn}
                    </h4>
                    <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5">
                      {isAr ? 'سعيد' : 'Saeed'} {dodoWins} — {soWins} {isAr ? 'سهيلة' : 'Sohila'}
                    </p>
                    {last && (
                      <p className="text-[9px] text-rose-gold-500 font-semibold mt-0.5 truncate">
                        {last.draw ? (isAr ? 'آخر نتيجة: تعادل' : 'Last: draw') : `${isAr ? 'آخر فوز' : 'Last win'}: ${last.winner === 'Dodo' ? (isAr ? 'سعيد' : 'Saeed') : (isAr ? 'سهيلة' : 'Sohila')}`}
                      </p>
                    )}
                    <span className="inline-block mt-2 text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-gold-500 text-white">
                      {isAr ? 'العب ▶' : 'PLAY ▶'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'stats' && <ArcadeStats lang={lang} matches={matches} />}
      {view === 'history' && <GameHistory lang={lang} matches={matches} />}

      {view === 'xo' && (
        <TicTacToeGame
          lang={lang}
          myRole={currentUserRole}
          session={activeSessionForCurrentView}
          suggestedStarter={suggestedStarterFor('xo')}
          onStart={(board, turn) => startSession('xo', board, turn)}
          onMove={updateSession}
          onFinish={finishSession}
          onCancel={cancelSession}
        />
      )}
      {view === 'connect4' && (
        <ConnectFourGame
          lang={lang}
          myRole={currentUserRole}
          session={activeSessionForCurrentView}
          suggestedStarter={suggestedStarterFor('connect4')}
          onStart={(board, turn) => startSession('connect4', board, turn)}
          onMove={updateSession}
          onFinish={finishSession}
          onCancel={cancelSession}
        />
      )}
      {view === 'rps' && (
        <RockPaperScissorsGame
          lang={lang}
          myRole={currentUserRole}
          session={activeSessionForCurrentView}
          suggestedStarter={suggestedStarterFor('rps')}
          onStart={(board, turn, extra) => startSession('rps', board, turn, extra)}
          onMove={updateSession}
          onFinish={finishSession}
          onCancel={cancelSession}
        />
      )}
      {view === 'memory' && (
        <MemoryMatchGame
          lang={lang}
          myRole={currentUserRole}
          session={activeSessionForCurrentView}
          suggestedStarter={suggestedStarterFor('memory')}
          onStart={(board, turn, extra) => startSession('memory', board, turn, extra)}
          onMove={updateSession}
          onFinish={finishSession}
          onCancel={cancelSession}
        />
      )}
      {view === 'dots' && (
        <DotsAndBoxesGame
          lang={lang}
          myRole={currentUserRole}
          session={activeSessionForCurrentView}
          suggestedStarter={suggestedStarterFor('dots')}
          onStart={(board, turn, extra) => startSession('dots', board, turn, extra)}
          onMove={updateSession}
          onFinish={finishSession}
          onCancel={cancelSession}
        />
      )}
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
        active ? 'bg-rose-gold-500 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
