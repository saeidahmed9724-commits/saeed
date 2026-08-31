import React, { useMemo } from 'react';
import { Language, UserRole } from '../../types';
import { GameMatch, GameType, GAME_META, ALL_GAME_TYPES } from '../../gameTypes';

interface Props {
  lang: Language;
  matches: GameMatch[];
}

function computeStreaks(matches: GameMatch[]): { Dodo: number; SO: number } {
  // matches are stored newest-first; walk oldest-to-newest for streak logic
  const chronological = [...matches].reverse();
  let currentHolder: UserRole | null = null;
  let currentStreak = 0;
  let best: { Dodo: number; SO: number } = { Dodo: 0, SO: 0 };

  chronological.forEach((m) => {
    if (m.draw || !m.winner) {
      currentHolder = null;
      currentStreak = 0;
      return;
    }
    if (m.winner === currentHolder) {
      currentStreak += 1;
    } else {
      currentHolder = m.winner;
      currentStreak = 1;
    }
    if (currentStreak > best[currentHolder]) {
      best[currentHolder] = currentStreak;
    }
  });

  return best;
}

function computeCurrentStreak(matches: GameMatch[]): { holder: UserRole | null; count: number } {
  // matches[0] is the most recent
  let holder: UserRole | null = null;
  let count = 0;
  for (const m of matches) {
    if (m.draw || !m.winner) break;
    if (holder === null) {
      holder = m.winner;
      count = 1;
    } else if (m.winner === holder) {
      count += 1;
    } else {
      break;
    }
  }
  return { holder, count };
}

export default function ArcadeStats({ lang, matches }: Props) {
  const isAr = lang === 'ar';

  const stats = useMemo(() => {
    const total = matches.length;
    const dodoWins = matches.filter((m) => m.winner === 'Dodo').length;
    const soWins = matches.filter((m) => m.winner === 'SO').length;
    const draws = matches.filter((m) => m.draw).length;
    const bestStreaks = computeStreaks(matches);
    const currentStreak = computeCurrentStreak(matches);

    const byType: Record<GameType, number> = { xo: 0, connect4: 0, rps: 0, memory: 0, dots: 0 };
    const dodoWinsByType: Record<GameType, number> = { xo: 0, connect4: 0, rps: 0, memory: 0, dots: 0 };
    const soWinsByType: Record<GameType, number> = { xo: 0, connect4: 0, rps: 0, memory: 0, dots: 0 };
    matches.forEach((m) => {
      byType[m.gameType] = (byType[m.gameType] || 0) + 1;
      if (m.winner === 'Dodo') dodoWinsByType[m.gameType] = (dodoWinsByType[m.gameType] || 0) + 1;
      if (m.winner === 'SO') soWinsByType[m.gameType] = (soWinsByType[m.gameType] || 0) + 1;
    });

    const mostPlayed = ALL_GAME_TYPES.reduce<GameType | null>((best, g) => (best === null || byType[g] > byType[best] ? g : best), null);
    const dodoFav = ALL_GAME_TYPES.reduce<GameType | null>((best, g) => (best === null || dodoWinsByType[g] > dodoWinsByType[best] ? g : best), null);
    const soFav = ALL_GAME_TYPES.reduce<GameType | null>((best, g) => (best === null || soWinsByType[g] > soWinsByType[best] ? g : best), null);

    const lastMatch = matches[0] || null;

    return { total, dodoWins, soWins, draws, bestStreaks, currentStreak, mostPlayed, dodoFav, soFav, lastMatch, byType, dodoWinsByType, soWinsByType };
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="text-center py-10">
        <span className="text-4xl">🕹️</span>
        <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500">
          {isAr ? 'لسه ملعبتوش أي مباراة، ابدأوا وشوفوا الإحصائيات هنا!' : 'No matches yet — play a game to see stats here!'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Head to head cards */}
      <div className="grid grid-cols-2 gap-3">
        <PlayerCard
          name={isAr ? 'سعيد' : 'Saeed'}
          wins={stats.dodoWins}
          streak={stats.bestStreaks.Dodo}
          isAr={isAr}
          accentClass="text-rose-gold-500"
          isCurrentStreakHolder={stats.currentStreak.holder === 'Dodo'}
          currentStreak={stats.currentStreak.count}
        />
        <PlayerCard
          name={isAr ? 'سهيلة' : 'Sohila'}
          wins={stats.soWins}
          streak={stats.bestStreaks.SO}
          isAr={isAr}
          accentClass="text-arcade-cyan-500"
          isCurrentStreakHolder={stats.currentStreak.holder === 'SO'}
          currentStreak={stats.currentStreak.count}
        />
      </div>

      {/* Live streak banner */}
      {stats.currentStreak.holder && stats.currentStreak.count >= 2 && (
        <div className="rounded-2xl bg-gradient-to-r from-rose-gold-500 to-arcade-purple-500 text-white p-3 text-center shadow-lg">
          <p className="text-sm font-black tracking-wide">
            🔥 {stats.currentStreak.holder === 'Dodo' ? (isAr ? 'سعيد' : 'SAEED') : (isAr ? 'سهيلة' : 'SOHILA')} — {stats.currentStreak.count} {isAr ? 'فوز متتالي' : 'WIN STREAK'}
          </p>
        </div>
      )}

      {/* Overall numbers */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat label={isAr ? 'إجمالي المباريات' : 'Total matches'} value={stats.total} />
        <MiniStat label={isAr ? 'تعادلات' : 'Draws'} value={stats.draws} />
        <MiniStat
          label={isAr ? 'أكثر لعبة' : 'Most played'}
          value={stats.mostPlayed ? GAME_META[stats.mostPlayed].icon : '—'}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MiniStat
          label={isAr ? 'أكثر لعبة يفوز بها سعيد' : "Saeed's best game"}
          value={stats.dodoFav ? `${GAME_META[stats.dodoFav].icon} ${isAr ? GAME_META[stats.dodoFav].nameAr : GAME_META[stats.dodoFav].nameEn}` : '—'}
        />
        <MiniStat
          label={isAr ? 'أكثر لعبة تفوز بها سهيلة' : "Sohila's best game"}
          value={stats.soFav ? `${GAME_META[stats.soFav].icon} ${isAr ? GAME_META[stats.soFav].nameAr : GAME_META[stats.soFav].nameEn}` : '—'}
        />
      </div>

      {stats.lastMatch && (
        <div className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 text-center">
          <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mb-1">{isAr ? 'آخر مباراة' : 'Last match'}</p>
          <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            {GAME_META[stats.lastMatch.gameType].icon} {isAr ? GAME_META[stats.lastMatch.gameType].nameAr : GAME_META[stats.lastMatch.gameType].nameEn}
            {' — '}
            {stats.lastMatch.draw
              ? (isAr ? 'تعادل' : 'Draw')
              : `${stats.lastMatch.winner === 'Dodo' ? (isAr ? 'سعيد' : 'Saeed') : (isAr ? 'سهيلة' : 'Sohila')} 🏆`}
          </p>
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  name,
  wins,
  streak,
  isAr,
  accentClass,
  isCurrentStreakHolder,
  currentStreak
}: {
  name: string;
  wins: number;
  streak: number;
  isAr: boolean;
  accentClass: string;
  isCurrentStreakHolder: boolean;
  currentStreak: number;
}) {
  return (
    <div className="rounded-2xl glass p-3 border border-white/30 dark:border-white/5 text-center">
      <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{name}</p>
      <p className={`text-2xl font-black mt-1 ${accentClass}`}>🏆 {wins}</p>
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
        {isAr ? 'أطول سلسلة انتصارات' : 'Best streak'}: {streak}🔥
      </p>
      {isCurrentStreakHolder && currentStreak >= 1 && (
        <p className="text-[10px] font-bold text-rose-gold-500 mt-0.5">{isAr ? 'شغّال دلوقتي' : 'active now'}</p>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl glass p-2.5 border border-white/30 dark:border-white/5 text-center">
      <p className="text-sm font-black text-neutral-800 dark:text-neutral-100">{value}</p>
      <p className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5 leading-tight">{label}</p>
    </div>
  );
}
