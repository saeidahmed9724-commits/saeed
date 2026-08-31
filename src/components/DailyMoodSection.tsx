import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, BarChart3, SmilePlus, Edit3, Check } from 'lucide-react';
import { Language, UserRole } from '../types';
import { MOOD_CATALOG, getMoodById } from '../moodCatalog';

interface DailyMoodEntry {
  moodId: string;
  emoji: string;
  labelAr: string;
  labelEn: string;
  rating: number;
  note?: string;
  timestamp: number;
}

interface DailyMoodDay {
  Dodo?: DailyMoodEntry;
  SO?: DailyMoodEntry;
}

type DailyMoodEntries = { [date: string]: DailyMoodDay };

interface DailyMoodSectionProps {
  lang: Language;
  currentUserRole: UserRole;
  liveState: any;
}

type ViewMode = 'today' | 'calendar' | 'stats';

// --- date helpers (no external date library — keeps in local timezone) ---
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function todayKey(): string {
  return toDateKey(new Date());
}
function daysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateKey(d);
}

export default function DailyMoodSection({ lang, currentUserRole, liveState }: DailyMoodSectionProps) {
  const isAr = lang === 'ar';
  const myKey: UserRole = currentUserRole;
  const partnerKey: UserRole = currentUserRole === 'Dodo' ? 'SO' : 'Dodo';
  const myName = currentUserRole === 'Dodo' ? (isAr ? 'سعيد' : 'Saeed') : (isAr ? 'سهيلة' : 'Sohila');
  const partnerName = currentUserRole === 'Dodo' ? (isAr ? 'سهيلة' : 'Sohila') : (isAr ? 'سعيد' : 'Saeed');

  const [view, setView] = useState<ViewMode>('today');
  const [entries, setEntries] = useState<DailyMoodEntries>({});

  // --- today form state ---
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(7);
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- calendar state ---
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Read from the single app-wide poll (App.tsx) instead of running our own
  // interval — avoids piling extra requests onto Vercel's function traffic.
  const loading = !liveState;
  useEffect(() => {
    if (liveState) setEntries(liveState.dailyMoodEntries || {});
  }, [liveState]);

  const todaysDay = entries[todayKey()] || {};
  const myTodayEntry = todaysDay[myKey];
  const partnerTodayEntry = todaysDay[partnerKey];

  useEffect(() => {
    if (myTodayEntry && !isEditing) {
      setSelectedMoodId(myTodayEntry.moodId);
      setRating(myTodayEntry.rating);
      setNote(myTodayEntry.note || '');
    }
  }, [myTodayEntry, isEditing]);

  const selectedMood = selectedMoodId ? getMoodById(selectedMoodId) : null;

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/interaction-state/daily-mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: currentUserRole,
          date: todayKey(),
          moodId: selectedMood.id,
          emoji: selectedMood.emoji,
          labelAr: selectedMood.labelAr,
          labelEn: selectedMood.labelEn,
          rating,
          note: note.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => ({ ...prev, [todayKey()]: data.dayEntry }));
        setIsEditing(false);
      }
    } catch (err) {
      console.log('Error submitting daily mood:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- STATS ----------------
  const stats = useMemo(() => computeStats(entries, myKey, partnerKey), [entries, myKey, partnerKey]);
  const patterns = useMemo(() => computeOurPatterns(entries, myKey, partnerKey), [entries, myKey, partnerKey]);

  // ---------------- CALENDAR ----------------
  const calendarCells = useMemo(() => buildCalendarCells(calendarMonth), [calendarMonth]);
  const selectedDayEntry = selectedDay ? entries[selectedDay] : null;

  const monthLabel = calendarMonth.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });

  const weekDaysAr = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
  const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-lg mx-auto py-2">
      {/* Tabs */}
      <div className="flex items-center gap-1.5 mb-4 rounded-2xl glass p-1 border border-white/30 dark:border-white/5">
        <TabButton active={view === 'today'} onClick={() => setView('today')} icon={<SmilePlus size={14} />} label={isAr ? 'اليوم' : 'Today'} />
        <TabButton active={view === 'calendar'} onClick={() => setView('calendar')} icon={<CalendarDays size={14} />} label={isAr ? 'التقويم' : 'Calendar'} />
        <TabButton active={view === 'stats'} onClick={() => setView('stats')} icon={<BarChart3 size={14} />} label={isAr ? 'إحصائيات' : 'Stats'} />
      </div>

      {loading ? (
        <div className="text-center py-10 text-sm text-neutral-400">{isAr ? 'جارِ التحميل...' : 'Loading...'}</div>
      ) : view === 'today' ? (
        <div className="space-y-4">
          {myTodayEntry && !isEditing ? (
            <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  {isAr ? 'تقييمك النهارده' : `${myName}'s check-in today`}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-rose-gold-500 hover:text-rose-gold-600"
                >
                  <Edit3 size={12} /> {isAr ? 'تعديل' : 'Edit'}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{myTodayEntry.emoji}</span>
                <div>
                  <p className="font-serif font-bold text-neutral-900 dark:text-neutral-100">
                    {isAr ? myTodayEntry.labelAr : myTodayEntry.labelEn}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{myTodayEntry.rating}/10</p>
                </div>
              </div>
              {myTodayEntry.note && (
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 italic">"{myTodayEntry.note}"</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5 space-y-4">
              <p className="text-sm font-bold text-neutral-700 dark:text-neutral-200">
                {isAr ? 'اختر المود اللي بيعبر عن يومك' : 'Pick the mood that fits your day'}
              </p>
              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {MOOD_CATALOG.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMoodId(m.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl p-2 border text-center transition-all ${
                      selectedMoodId === m.id
                        ? 'border-rose-gold-400 bg-rose-gold-50 dark:bg-rose-gold-950/40 scale-105'
                        : 'border-white/30 dark:border-white/5 hover:scale-105'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[9px] font-semibold leading-tight text-neutral-600 dark:text-neutral-300">
                      {isAr ? m.labelAr : m.labelEn}
                    </span>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                        {isAr ? 'يومك كان عامل إزاي؟' : 'How was your day?'}
                      </label>
                      <span className="text-sm font-bold text-rose-gold-500">{rating}/10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full accent-rose-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300 block mb-1">
                      {isAr ? 'إيه اللي خلى يومك كده؟ (اختياري)' : "What made your day like this? (optional)"}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={500}
                      rows={2}
                      className="w-full rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-neutral-900/60 p-2 text-sm outline-none focus:border-rose-gold-400"
                      placeholder={isAr ? 'اكتب ملاحظة صغيرة...' : 'Write a small note...'}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-gold-500 hover:bg-rose-gold-600 disabled:opacity-60 text-white font-bold py-2.5 text-sm transition-colors"
                  >
                    <Check size={16} /> {submitting ? (isAr ? 'جارِ الحفظ...' : 'Saving...') : (isAr ? 'حفظ تقييم اليوم' : 'Save today\'s mood')}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Partner reveal — only shown once I've submitted for today */}
          {myTodayEntry && (
            <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 block mb-2">
                {isAr ? `مزاج ${partnerName} النهارده` : `${partnerName}'s mood today`}
              </span>
              {partnerTodayEntry ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{partnerTodayEntry.emoji}</span>
                  <div>
                    <p className="font-serif font-bold text-neutral-900 dark:text-neutral-100">
                      {isAr ? partnerTodayEntry.labelAr : partnerTodayEntry.labelEn}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{partnerTodayEntry.rating}/10</p>
                    {partnerTodayEntry.note && (
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300 italic">"{partnerTodayEntry.note}"</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">
                  {isAr ? `${partnerName} لسه ما سجلتش مزاجها النهارده` : `${partnerName} hasn't checked in yet`}
                </p>
              )}
            </div>
          )}
        </div>
      ) : view === 'calendar' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              className="text-sm px-2 py-1 rounded-lg hover:bg-white/30 dark:hover:bg-white/5"
            >
              ‹
            </button>
            <span className="font-serif font-bold text-sm text-neutral-800 dark:text-neutral-100">{monthLabel}</span>
            <button
              onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              className="text-sm px-2 py-1 rounded-lg hover:bg-white/30 dark:hover:bg-white/5"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-neutral-400">
            {(isAr ? weekDaysAr : weekDaysEn).map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell) return <div key={idx} />;
              const day = entries[cell.key];
              const mine = day?.[myKey];
              const partner = day?.[partnerKey];
              const unlocked = !!mine; // partner's mood only visible once I've logged mine for this day
              return (
                <button
                  key={cell.key}
                  onClick={() => setSelectedDay(cell.key)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center border text-[10px] transition-all ${
                    selectedDay === cell.key
                      ? 'border-rose-gold-400 bg-rose-gold-50 dark:bg-rose-gold-950/40'
                      : 'border-white/20 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-[9px] text-neutral-400">{cell.day}</span>
                  <span className="text-sm leading-none">
                    {mine?.emoji || (unlocked ? partner?.emoji : partner ? '🔒' : '') || ''}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDay && (
            <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5 space-y-3">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{selectedDay}</span>
              <DayDetail label={myName} entry={selectedDayEntry?.[myKey]} isAr={isAr} />
              {selectedDayEntry?.[myKey] ? (
                <DayDetail label={partnerName} entry={selectedDayEntry?.[partnerKey]} isAr={isAr} />
              ) : selectedDayEntry?.[partnerKey] ? (
                <div className="flex items-center gap-3 opacity-70">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{partnerName}</p>
                    <p className="text-xs text-neutral-400">
                      {isAr
                        ? `سجّل مزاجك في اليوم ده الأول عشان تشوف مزاج ${partnerName}`
                        : `Log your own mood for this day to see ${partnerName}'s`}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <StatsBlock
            title={isAr ? `إحصائيات ${myName}` : `${myName}'s stats`}
            s={stats.mine}
            isAr={isAr}
          />
          <StatsBlock
            title={isAr ? `إحصائيات ${partnerName}` : `${partnerName}'s stats`}
            s={stats.partner}
            isAr={isAr}
          />
          <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5">
            <p className="font-serif font-bold text-sm text-neutral-800 dark:text-neutral-100 mb-3">
              ❤️ {isAr ? 'إحصائياتكم مع بعض' : 'Together'}
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <MiniStat label={isAr ? 'متوسط مشترك' : 'Average together'} value={stats.together.avg !== null ? `${stats.together.avg}/10` : '—'} />
              <MiniStat
                label={isAr ? 'توافق المزاج' : 'Mood compatibility'}
                value={stats.together.compatibility !== null ? `${stats.together.compatibility}%` : '—'}
              />
              <MiniStat label={isAr ? 'أيام سُجّلت مع بعض' : 'Days both checked in'} value={String(stats.together.sharedDays)} />
              {stats.together.bestSharedMood && (
                <MiniStat
                  label={isAr ? 'المود المشترك الأكثر' : 'Most common shared mood'}
                  value={`${stats.together.bestSharedMood.emoji} ${isAr ? stats.together.bestSharedMood.labelAr : stats.together.bestSharedMood.labelEn}`}
                />
              )}
            </div>
          </div>

          {patterns.hasEnoughData && (
            <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5">
              <p className="font-serif font-bold text-sm text-neutral-800 dark:text-neutral-100 mb-3">
                ✨ {isAr ? 'أنماطكم' : 'Our Patterns'}
              </p>
              <div className="space-y-2.5">
                {patterns.bestWeekday && (
                  <PatternRow
                    emoji="❤️"
                    text={
                      isAr
                        ? `أعلى متوسط ليكم يوم ${patterns.bestWeekday.labelAr} — ${patterns.bestWeekday.avg}/10`
                        : `Your highest average day is ${patterns.bestWeekday.labelEn} — ${patterns.bestWeekday.avg}/10`
                    }
                  />
                )}
                {patterns.longestStreak > 1 && (
                  <PatternRow
                    emoji="🔥"
                    text={
                      isAr
                        ? `أطول سلسلة أيام سجّلتوا فيها مع بعض: ${patterns.longestStreak} يوم متتالي`
                        : `Longest streak checking in together: ${patterns.longestStreak} days in a row`
                    }
                  />
                )}
                {patterns.bestWeek && (
                  <PatternRow
                    emoji="📈"
                    text={
                      isAr
                        ? `أفضل أسبوع ليكم: ${patterns.bestWeek.start} إلى ${patterns.bestWeek.end} (متوسط ${patterns.bestWeek.avg}/10)`
                        : `Your best week: ${patterns.bestWeek.start} to ${patterns.bestWeek.end} (avg ${patterns.bestWeek.avg}/10)`
                    }
                  />
                )}
                {patterns.notesCount > 0 && (
                  <PatternRow
                    emoji="💬"
                    text={
                      isAr
                        ? `كتبتوا ملاحظات في ${patterns.notesCount} يوم من أيام التقييم`
                        : `You wrote notes on ${patterns.notesCount} of your check-in days`
                    }
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PatternRow({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-base leading-none">{emoji}</span>
      <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-snug">{text}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition-all ${
        active ? 'bg-rose-gold-500 text-white shadow-sm' : 'text-neutral-500 dark:text-neutral-400 hover:bg-white/30 dark:hover:bg-white/5'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function DayDetail({ label, entry, isAr }: { label: string; entry?: DailyMoodEntry; isAr: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl">{entry?.emoji || '—'}</span>
      <div>
        <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{label}</p>
        {entry ? (
          <>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {isAr ? entry.labelAr : entry.labelEn} · {entry.rating}/10
            </p>
            {entry.note && <p className="text-xs italic text-neutral-500 dark:text-neutral-400 mt-0.5">"{entry.note}"</p>}
          </>
        ) : (
          <p className="text-xs text-neutral-400">{isAr ? 'لا يوجد تقييم' : 'No check-in'}</p>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/40 dark:bg-white/5 p-2.5">
      <p className="text-[10px] font-semibold text-neutral-400">{label}</p>
      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mt-0.5">{value}</p>
    </div>
  );
}

interface PersonStats {
  avg7: number | null;
  avg30: number | null;
  avgAll: number | null;
  best: { date: string; entry: DailyMoodEntry } | null;
  worst: { date: string; entry: DailyMoodEntry } | null;
  mostFrequentMood: DailyMoodEntry | null;
  daysCount: number;
}

function StatsBlock({ title, s, isAr }: { title: string; s: PersonStats; isAr: boolean }) {
  return (
    <div className="rounded-2xl glass p-4 border border-white/30 dark:border-white/5">
      <p className="font-serif font-bold text-sm text-neutral-800 dark:text-neutral-100 mb-3">{title}</p>
      <div className="grid grid-cols-2 gap-3 text-center">
        <MiniStat label={isAr ? 'متوسط 7 أيام' : 'Last 7 days'} value={s.avg7 !== null ? `${s.avg7}/10` : '—'} />
        <MiniStat label={isAr ? 'متوسط 30 يوم' : 'Last 30 days'} value={s.avg30 !== null ? `${s.avg30}/10` : '—'} />
        <MiniStat label={isAr ? 'عدد الأيام' : 'Days logged'} value={String(s.daysCount)} />
        <MiniStat
          label={isAr ? 'أكتر مود متكرر' : 'Most frequent mood'}
          value={s.mostFrequentMood ? `${s.mostFrequentMood.emoji} ${isAr ? s.mostFrequentMood.labelAr : s.mostFrequentMood.labelEn}` : '—'}
        />
      </div>
    </div>
  );
}

// ---------------- helpers ----------------

function buildCalendarCells(monthDate: Date): Array<{ key: string; day: number } | null> {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ key: string; day: number } | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: toDateKey(new Date(year, month, d)), day: d });
  }
  return cells;
}

function computeStats(entries: DailyMoodEntries, myKey: UserRole, partnerKey: UserRole) {
  const mine = computePersonStats(entries, myKey);
  const partner = computePersonStats(entries, partnerKey);

  // Together stats
  const sharedDates = Object.keys(entries).filter((d) => entries[d][myKey] && entries[d][partnerKey]);
  let togetherAvg: number | null = null;
  let compatibility: number | null = null;
  let bestSharedMood: { emoji: string; labelAr: string; labelEn: string } | null = null;

  if (sharedDates.length > 0) {
    let sumAvg = 0;
    let closeCount = 0;
    const moodFreq: { [id: string]: { count: number; entry: DailyMoodEntry } } = {};

    sharedDates.forEach((d) => {
      const mine_ = entries[d][myKey]!;
      const partner_ = entries[d][partnerKey]!;
      sumAvg += (mine_.rating + partner_.rating) / 2;
      if (Math.abs(mine_.rating - partner_.rating) <= 2) closeCount++;
      if (mine_.moodId === partner_.moodId) {
        if (!moodFreq[mine_.moodId]) moodFreq[mine_.moodId] = { count: 0, entry: mine_ };
        moodFreq[mine_.moodId].count++;
      }
    });

    togetherAvg = round1(sumAvg / sharedDates.length);
    compatibility = Math.round((closeCount / sharedDates.length) * 100);

    const topShared = Object.values(moodFreq).sort((a, b) => b.count - a.count)[0];
    if (topShared) bestSharedMood = topShared.entry;
  }

  return {
    mine,
    partner,
    together: {
      avg: togetherAvg,
      compatibility,
      sharedDays: sharedDates.length,
      bestSharedMood
    }
  };
}

function computePersonStats(entries: DailyMoodEntries, key: UserRole): PersonStats {
  const dates = Object.keys(entries).filter((d) => entries[d][key]).sort();
  if (dates.length === 0) {
    return { avg7: null, avg30: null, avgAll: null, best: null, worst: null, mostFrequentMood: null, daysCount: 0 };
  }

  const from7 = daysAgoKey(7);
  const from30 = daysAgoKey(30);

  let sumAll = 0;
  let sum7 = 0, count7 = 0;
  let sum30 = 0, count30 = 0;
  let best: { date: string; entry: DailyMoodEntry } | null = null;
  let worst: { date: string; entry: DailyMoodEntry } | null = null;
  const moodFreq: { [id: string]: { count: number; entry: DailyMoodEntry } } = {};

  dates.forEach((d) => {
    const entry = entries[d][key]!;
    sumAll += entry.rating;

    if (d >= from7) { sum7 += entry.rating; count7++; }
    if (d >= from30) { sum30 += entry.rating; count30++; }

    if (!best || entry.rating > best.entry.rating) best = { date: d, entry };
    if (!worst || entry.rating < worst.entry.rating) worst = { date: d, entry };

    if (!moodFreq[entry.moodId]) moodFreq[entry.moodId] = { count: 0, entry };
    moodFreq[entry.moodId].count++;
  });

  const mostFrequentMood = Object.values(moodFreq).sort((a, b) => b.count - a.count)[0]?.entry || null;

  return {
    avg7: count7 > 0 ? round1(sum7 / count7) : null,
    avg30: count30 > 0 ? round1(sum30 / count30) : null,
    avgAll: round1(sumAll / dates.length),
    best,
    worst,
    mostFrequentMood,
    daysCount: dates.length
  };
}

interface OurPatterns {
  hasEnoughData: boolean;
  bestWeekday: { labelAr: string; labelEn: string; avg: number } | null;
  longestStreak: number;
  bestWeek: { start: string; end: string; avg: number } | null;
  notesCount: number;
}

const WEEKDAY_LABELS = [
  { ar: 'الأحد', en: 'Sunday' },
  { ar: 'الإثنين', en: 'Monday' },
  { ar: 'الثلاثاء', en: 'Tuesday' },
  { ar: 'الأربعاء', en: 'Wednesday' },
  { ar: 'الخميس', en: 'Thursday' },
  { ar: 'الجمعة', en: 'Friday' },
  { ar: 'السبت', en: 'Saturday' }
];

function computeOurPatterns(entries: DailyMoodEntries, myKey: UserRole, partnerKey: UserRole): OurPatterns {
  const sharedDates = Object.keys(entries)
    .filter((d) => entries[d][myKey] && entries[d][partnerKey])
    .sort();

  if (sharedDates.length < 5) {
    return { hasEnoughData: false, bestWeekday: null, longestStreak: 0, bestWeek: null, notesCount: 0 };
  }

  // Best weekday (average combined rating grouped by day of week)
  const weekdaySum: number[] = [0, 0, 0, 0, 0, 0, 0];
  const weekdayCount: number[] = [0, 0, 0, 0, 0, 0, 0];
  sharedDates.forEach((d) => {
    const [y, m, day] = d.split('-').map(Number);
    const weekday = new Date(y, m - 1, day).getDay();
    const combined = (entries[d][myKey]!.rating + entries[d][partnerKey]!.rating) / 2;
    weekdaySum[weekday] += combined;
    weekdayCount[weekday]++;
  });
  let bestWeekdayIdx = -1;
  let bestWeekdayAvg = -1;
  weekdaySum.forEach((sum, idx) => {
    if (weekdayCount[idx] === 0) return;
    const avg = sum / weekdayCount[idx];
    if (avg > bestWeekdayAvg) {
      bestWeekdayAvg = avg;
      bestWeekdayIdx = idx;
    }
  });
  const bestWeekday =
    bestWeekdayIdx >= 0
      ? { labelAr: WEEKDAY_LABELS[bestWeekdayIdx].ar, labelEn: WEEKDAY_LABELS[bestWeekdayIdx].en, avg: round1(bestWeekdayAvg) }
      : null;

  // Longest streak of consecutive shared days
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sharedDates.length; i++) {
    const prev = new Date(sharedDates[i - 1]);
    const curr = new Date(sharedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Best 7-day rolling window
  let bestWeek: { start: string; end: string; avg: number } | null = null;
  if (sharedDates.length >= 3) {
    const dateToCombined: { [d: string]: number } = {};
    sharedDates.forEach((d) => {
      dateToCombined[d] = (entries[d][myKey]!.rating + entries[d][partnerKey]!.rating) / 2;
    });
    let bestSum = -1;
    for (let i = 0; i < sharedDates.length; i++) {
      const windowStart = new Date(sharedDates[i]);
      const windowEnd = new Date(windowStart);
      windowEnd.setDate(windowEnd.getDate() + 6);
      const windowDates = sharedDates.filter((d) => {
        const dt = new Date(d);
        return dt >= windowStart && dt <= windowEnd;
      });
      if (windowDates.length < 3) continue;
      const sum = windowDates.reduce((acc, d) => acc + dateToCombined[d], 0) / windowDates.length;
      if (sum > bestSum) {
        bestSum = sum;
        bestWeek = { start: windowDates[0], end: windowDates[windowDates.length - 1], avg: round1(sum) };
      }
    }
  }

  const notesCount = sharedDates.filter((d) => entries[d][myKey]!.note || entries[d][partnerKey]!.note).length;

  return { hasEnoughData: true, bestWeekday, longestStreak, bestWeek, notesCount };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
