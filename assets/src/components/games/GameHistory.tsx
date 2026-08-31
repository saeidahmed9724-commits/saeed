import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Language } from '../../types';
import { GameMatch, GAME_META } from '../../gameTypes';

interface Props {
  lang: Language;
  matches: GameMatch[];
}

export default function GameHistory({ lang, matches }: Props) {
  const isAr = lang === 'ar';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (matches.length === 0) {
    return (
      <div className="text-center py-10">
        <span className="text-4xl">📜</span>
        <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500">
          {isAr ? 'لسه مفيش مباريات متسجلة.' : 'No matches recorded yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => {
        const meta = GAME_META[m.gameType];
        const isOpen = expandedId === m.id;
        const dateLabel = new Date(m.playedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const timeLabel = new Date(m.playedAt).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <button
            key={m.id}
            onClick={() => setExpandedId(isOpen ? null : m.id)}
            className="w-full text-left rtl:text-right rounded-2xl glass p-3 border border-white/30 dark:border-white/5 block cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{meta.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200 truncate">
                    {isAr ? meta.nameAr : meta.nameEn}
                  </p>
                  <p className="text-[9px] text-neutral-400 dark:text-neutral-500">{dateLabel} · {timeLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">{m.score}</span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
              {m.draw ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold">
                  🤝 {isAr ? 'تعادل' : 'Draw'}
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-gold-50 dark:bg-rose-gold-950/40 text-rose-gold-600 dark:text-rose-gold-300 font-bold">
                  🏆 {m.winner === 'Dodo' ? (isAr ? 'سعيد' : 'Saeed') : (isAr ? 'سهيلة' : 'Sohila')}
                </span>
              )}
            </div>

            {isOpen && (
              <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-white/5 text-[10px] text-neutral-500 dark:text-neutral-400 space-y-1">
                <p>{isAr ? 'سعيد' : 'Saeed'} {isAr ? 'مقابل' : 'vs'} {isAr ? 'سهيلة' : 'Sohila'}</p>
                <p>{isAr ? 'النتيجة النهائية' : 'Final score'}: {m.score || '—'}</p>
                {m.details && (
                  <p className="break-words">{isAr ? 'تفاصيل' : 'Details'}: {JSON.stringify(m.details)}</p>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
