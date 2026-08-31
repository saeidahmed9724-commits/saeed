// src/gameTypes.ts
// Shared types for the "Our Arcade" games section. Used by both the
// frontend components and (as type-only imports) the API layer.

import { UserRole } from './types';

export type GameType = 'xo' | 'connect4' | 'rps' | 'memory' | 'dots';

export const ALL_GAME_TYPES: GameType[] = ['xo', 'connect4', 'rps', 'memory', 'dots'];

export interface GameMatch {
  id: string;
  gameType: GameType;
  player1: UserRole; // always 'Dodo'
  player2: UserRole; // always 'SO'
  winner: UserRole | null; // null = draw
  draw: boolean;
  score: string; // human readable final score, e.g. "1-0", "3-2", "9-7"
  details?: any; // optional game-specific extra info (round count, board size, etc.)
  playedAt: number;
}

// A single in-progress (or just-finished) match session, synced between
// both devices by polling /api/interaction-state. Only one session can be
// active for the pair at a time, matching the 1-on-1 nature of the app.
export interface GameSession {
  id: string;
  gameType: GameType;
  status: 'active' | 'finished';
  turn: UserRole; // whose move it currently is (ignored by simultaneous-choice games like RPS)
  board: any; // opaque game-specific board/state blob
  moveCount: number;
  winner?: UserRole | null;
  draw?: boolean;
  choices?: { Dodo?: string; SO?: string }; // used by Rock Paper Scissors
  roundScore?: { Dodo: number; SO: number }; // used by Rock Paper Scissors (best-of rounds)
  round?: number;
  createdAt: number;
  updatedAt: number;
}

export interface GameMeta {
  icon: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
}

export const GAME_META: Record<GameType, GameMeta> = {
  xo: {
    icon: '❌⭕',
    nameAr: 'إكس أو',
    nameEn: 'Tic-Tac-Toe',
    descAr: 'ثلاثة متتالية تكسب الجولة',
    descEn: 'Three in a row wins'
  },
  connect4: {
    icon: '🟦',
    nameAr: 'كونكت فور',
    nameEn: 'Connect 4',
    descAr: 'اجمعوا أربعة قطع متتالية',
    descEn: 'Line up four in a row'
  },
  rps: {
    icon: '✋',
    nameAr: 'حجر ورقة مقص',
    nameEn: 'Rock Paper Scissors',
    descAr: 'اختاروا في سرية ثم اكشفوا سوا',
    descEn: 'Pick in secret, then reveal together'
  },
  memory: {
    icon: '🧠',
    nameAr: 'ميموري ماتش',
    nameEn: 'Memory Match',
    descAr: 'دوروا على الأزواج المتطابقة',
    descEn: 'Find the matching pairs'
  },
  dots: {
    icon: '🎯',
    nameAr: 'نقاط ومربعات',
    nameEn: 'Dots & Boxes',
    descAr: 'اقفلوا أكبر عدد من المربعات',
    descEn: 'Claim the most boxes'
  }
};

export function roleDisplayName(role: UserRole, lang: 'ar' | 'en'): string {
  if (role === 'Dodo') return lang === 'ar' ? 'سعيد' : 'Saeed';
  return lang === 'ar' ? 'سهيلة' : 'Sohila';
}
