import { Sparkles, Trophy, Lock, Unlock, Heart, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { DataStore } from '../dataStore';

interface AchievementsSectionProps {
  lang: Language;
  highlightedId?: string | null;
  liveState?: any;
}

interface AchievementItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  emoji: string;
  checkUnlocked: (state: any) => boolean;
}

const ACHIEVEMENTS_LIST: AchievementItem[] = [
  {
    id: 'ach-first-buzz',
    titleAr: 'أول حركة بيننا ⚡❤️',
    titleEn: 'First Touch ⚡❤️',
    descAr: 'ابعت حركة خفيفة أو بوسة أو حضن على السريع لشريكك!',
    descEn: 'Send an instant touch, sweet kiss, or warm hug to feel closer!',
    emoji: '💖',
    checkUnlocked: (state) => {
      if (!state || !state.activityFeed) return false;
      return state.activityFeed.some((act: any) => act.type === 'buzz');
    }
  },
  {
    id: 'ach-sticky-note',
    titleAr: 'رسالة على اللوحة 📌',
    titleEn: 'Pinned Note 📌',
    descAr: 'علّق أول نوتة على اللوحة المشتركة فيها كلام لطيف.',
    descEn: 'Pin your first sticky note on the shared interactive board.',
    emoji: '📝',
    checkUnlocked: (state) => {
      return state && state.stickyNotes && state.stickyNotes.length > 0;
    }
  },
  {
    id: 'ach-wheel-spin',
    titleAr: 'لفينا العجلة 🎡',
    titleEn: 'Wheel Spinner 🎡',
    descAr: 'جرب تلف عجلة الخروج والقرارات عشان تختاروا خروجة النهاردة!',
    descEn: 'Spin the date & decision wheel to pick your next plan!',
    emoji: '🎡',
    checkUnlocked: (state) => {
      if (!state || !state.activityFeed) return false;
      return state.activityFeed.some((act: any) => act.type === 'wheel_spin');
    }
  },
  {
    id: 'ach-daily-question',
    titleAr: 'جاوبنا على السؤال 💭',
    titleEn: 'Daily Answer 💭',
    descAr: 'جاوب على سؤال النهاردة واعرف رأي الشريك إيه.',
    descEn: "Answer today's Daily Question and unlock your partner's answer.",
    emoji: '❓',
    checkUnlocked: (state) => {
      return state && state.loveQuizAnswers && Object.keys(state.loveQuizAnswers).length > 0;
    }
  },
  {
    id: 'ach-love-quiz',
    titleAr: 'اختبار عارفني قد إيه؟ 🎮',
    titleEn: 'Love Quiz 🎮',
    descAr: 'حل الاختبار وشوف إنت عارف التفاصيل الصغيرة بينكم إزاي.',
    descEn: 'Complete a Love Quiz and challenge your partner.',
    emoji: '🏆',
    checkUnlocked: (state) => {
      if (!state || !state.activityFeed) return false;
      return state.activityFeed.some((act: any) => act.type === 'quiz');
    }
  },
  {
    id: 'ach-memory',
    titleAr: 'سجلنا ذكرى 📖',
    titleEn: 'Shared Memory 📖',
    descAr: 'سجل أول ذكرى حلوة في سجل الذكريات عشان تفضلوا فاكرينها.',
    descEn: 'Record your first sweet shared memory in the diary.',
    emoji: '💝',
    checkUnlocked: () => {
      return DataStore.getMemories().length > 0;
    }
  },
  {
    id: 'ach-gallery',
    titleAr: 'ضيفنا صورة 📸',
    titleEn: 'Gallery Photo 📸',
    descAr: 'ارفع صورة حلوة من خروجة أو موقف سوا في المعرض.',
    descEn: 'Upload a photo to the shared gallery.',
    emoji: '📸',
    checkUnlocked: () => {
      return DataStore.getGallery().length > 0;
    }
  },
  {
    id: 'ach-music',
    titleAr: 'ربطنا أغنية 🎵',
    titleEn: 'Shared Song 🎵',
    descAr: 'ضيف أغنية بتحبوها سوا في قسم الموسيقى.',
    descEn: 'Link your favorite song in the Music Section.',
    emoji: '🎶',
    checkUnlocked: () => {
      return DataStore.getSongs().length > 0;
    }
  }
];

export default function AchievementsSection({ lang, highlightedId, liveState }: AchievementsSectionProps) {
  const isAr = lang === 'ar';
  
  // Dynamic stats
  const unlockedCount = ACHIEVEMENTS_LIST.filter(ach => ach.checkUnlocked(liveState)).length;
  const totalCount = ACHIEVEMENTS_LIST.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="w-full max-w-lg mx-auto py-2">
      {/* Progress Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-gold-50/60 to-pink-50/60 dark:from-neutral-900/40 dark:to-neutral-950/40 border border-rose-gold-100 dark:border-rose-gold-950/30 text-center mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-gold-400/10 rounded-full blur-xl" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-rose-gold-500/10 rounded-full blur-xl" />
        
        <Trophy className="mx-auto text-amber-500 mb-2 animate-bounce" size={32} />
        <h4 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50 mb-1">
          {isAr ? 'إنجازاتنا وحركاتنا سوا 🏆' : 'Our Achievements 🏆'}
        </h4>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
          {isAr 
            ? 'كل ما نتفاعل ونشارك حاجات سوا بنفتح إنجاز جديد!' 
            : 'Unlock titles together by interacting and updating your shared app.'}
        </p>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between items-center text-xs font-bold text-rose-gold-600 dark:text-rose-gold-300 mb-1.5 px-1 font-mono">
            <span>{unlockedCount} / {totalCount} {isAr ? 'تم كشفها' : 'Unlocked'}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden border border-white/20">
            <div 
              className="bg-linear-to-r from-rose-gold-400 to-rose-gold-600 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Achievement List */}
      <div className="space-y-4">
        {ACHIEVEMENTS_LIST.map((ach) => {
          const isUnlocked = ach.checkUnlocked(liveState);
          const isHighlighted = highlightedId === ach.id;

          return (
            <div
              key={ach.id}
              id={`achievement-${ach.id}`}
              className={`p-4 rounded-3xl border transition-all duration-500 flex gap-4 relative overflow-hidden ${
                isHighlighted 
                  ? 'bg-rose-gold-100/50 dark:bg-rose-gold-950/30 border-rose-gold-400 ring-4 ring-rose-gold-500/30 scale-[1.02] shadow-lg animate-pulse duration-1000' 
                  : 'bg-white/60 dark:bg-neutral-900/30 border-white/40 dark:border-white/5'
              } ${!isUnlocked ? 'opacity-70' : ''}`}
            >
              {/* Highlight Flare */}
              {isHighlighted && (
                <div className="absolute top-1.5 right-2 animate-pulse bg-rose-gold-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {isAr ? 'جديد ✨' : 'NEW ✨'}
                </div>
              )}

              {/* Icon Container */}
              <div className="shrink-0 relative">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                  isUnlocked 
                    ? 'bg-rose-gold-50 dark:bg-rose-gold-950/20 border-rose-gold-100 dark:border-rose-gold-900/20' 
                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                }`}>
                  {isUnlocked ? ach.emoji : '🔒'}
                </div>
                <div className="absolute -bottom-1 -right-1">
                  {isUnlocked ? (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5 block border border-white dark:border-neutral-900 shadow-sm">
                      <CheckCircle2 size={10} />
                    </span>
                  ) : (
                    <span className="bg-neutral-400 text-white rounded-full p-0.5 block border border-white dark:border-neutral-900 shadow-sm">
                      <Lock size={10} />
                    </span>
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h5 className={`font-serif text-sm font-bold flex items-center gap-1.5 ${
                  isUnlocked ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500'
                }`}>
                  {isAr ? ach.titleAr : ach.titleEn}
                  {isUnlocked && <Sparkles size={11} className="text-[#d4af37] animate-pulse" />}
                </h5>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed mt-1">
                  {isAr ? ach.descAr : ach.descEn}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
