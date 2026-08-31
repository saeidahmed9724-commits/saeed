import { useEffect, useState } from 'react';
import { Calendar, Heart, MessageCircle, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface TimelineCardsProps {
  lang: Language;
}

interface TimerState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function TimelineCards({ lang }: TimelineCardsProps) {
  const [firstChat, setFirstChat] = useState<TimerState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [firstDate, setFirstDate] = useState<TimerState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [anniversary, setAnniversary] = useState<TimerState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [saeedBday, setSaeedBday] = useState<TimerState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sohilaBday, setSohilaBday] = useState<TimerState>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const calculateTime = (dateStr: string, mode: 'elapsed' | 'countdown') => {
    const now = new Date();
    let targetDate = new Date(dateStr);

    if (mode === 'countdown') {
      const currentYear = now.getFullYear();
      const month = targetDate.getMonth();
      const date = targetDate.getDate();
      
      let nextBday = new Date(currentYear, month, date);
      if (nextBday.getTime() < now.getTime()) {
        nextBday.setFullYear(currentYear + 1);
      }
      targetDate = nextBday;
    }

    const diff = mode === 'elapsed' 
      ? now.getTime() - targetDate.getTime()
      : targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds };
  };

  useEffect(() => {
    const updateTimers = () => {
      // First Chat: 19 May 2026
      setFirstChat(calculateTime('2026-05-19T00:00:00', 'elapsed'));
      // First Date: 3 July 2026
      setFirstDate(calculateTime('2026-07-03T00:00:00', 'elapsed'));
      // Anniversary: 3 July 2026
      setAnniversary(calculateTime('2026-07-03T00:00:00', 'elapsed'));
      // Saeed Birthday: 20 March 2006
      setSaeedBday(calculateTime('2006-03-20T00:00:00', 'countdown'));
      // Sohila Birthday: 15 August 2006
      setSohilaBday(calculateTime('2006-08-15T00:00:00', 'countdown'));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const renderTimerBlock = (val: number, label: string) => (
    <div className="flex flex-col items-center flex-1 min-w-[50px] p-2 rounded-xl bg-white/40 dark:bg-black/20 backdrop-blur-xs shadow-xs border border-white/20">
      <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-rose-gold-500 dark:text-rose-gold-300">
        {val.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
        {label}
      </span>
    </div>
  );

  const cardClass = "relative overflow-hidden rounded-3xl glass p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-white/50 dark:border-white/10 flex flex-col justify-between min-h-[200px] shadow-sm";

  return (
    <div className="flex flex-col gap-8 w-full py-4">



      {/* --- LIVE COUNTERS SECTION --- */}

      {/* First Chat Card */}
      <div id="first-chat-card" className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-gold-500">
            <MessageCircle size={20} />
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">
              {lang === 'ar' ? 'عداد أول محادثة 💬' : 'First Chat Counter 💬'}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">19 May 2026</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {lang === 'ar' ? 'الوقت المنقضي منذ أول رسالة تبادلناها بنظرات الدفء:' : 'Time elapsed since our very first message:'}
        </p>
        <div className="flex gap-2">
          {renderTimerBlock(firstChat.days, lang === 'ar' ? 'يوم' : 'Days')}
          {renderTimerBlock(firstChat.hours, lang === 'ar' ? 'ساعة' : 'Hours')}
          {renderTimerBlock(firstChat.minutes, lang === 'ar' ? 'دقيقة' : 'Mins')}
          {renderTimerBlock(firstChat.seconds, lang === 'ar' ? 'ثانية' : 'Secs')}
        </div>
      </div>

      {/* First Date Card */}
      <div id="first-date-card" className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-gold-500">
            <Calendar size={20} />
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">
              {lang === 'ar' ? 'عداد أول لقاء ☕' : 'First Date Counter ☕'}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">03 July 2026</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {lang === 'ar' ? 'الوقت المنقضي منذ أول مرة التقت فيها أعيننا:' : 'Time elapsed since our very first meeting:'}
        </p>
        <div className="flex gap-2">
          {renderTimerBlock(firstDate.days, lang === 'ar' ? 'يوم' : 'Days')}
          {renderTimerBlock(firstDate.hours, lang === 'ar' ? 'ساعة' : 'Hours')}
          {renderTimerBlock(firstDate.minutes, lang === 'ar' ? 'دقيقة' : 'Mins')}
          {renderTimerBlock(firstDate.seconds, lang === 'ar' ? 'ثانية' : 'Secs')}
        </div>
      </div>

      {/* Anniversary Card */}
      <div id="anniversary-card" className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-gold-500">
            <Heart size={20} className="fill-rose-gold-500" />
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">
              {lang === 'ar' ? 'عداد ذكرى الحب ❤️' : 'Love Anniversary Counter ❤️'}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">03 July 2026</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {lang === 'ar' ? 'رحلة الحب الخالدة التي نبنيها معاً يوماً بعد يوم:' : 'Our everlasting journey of love together:'}
        </p>
        <div className="flex gap-2">
          {renderTimerBlock(anniversary.days, lang === 'ar' ? 'يوم' : 'Days')}
          {renderTimerBlock(anniversary.hours, lang === 'ar' ? 'ساعة' : 'Hours')}
          {renderTimerBlock(anniversary.minutes, lang === 'ar' ? 'دقيقة' : 'Mins')}
          {renderTimerBlock(anniversary.seconds, lang === 'ar' ? 'ثانية' : 'Secs')}
        </div>
      </div>

      {/* Saeed Birthday Card */}
      <div id="saeed-bday-card" className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-gold-500">
            <Sparkles size={20} />
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">
              {lang === 'ar' ? 'العد التنازلي لعيد ميلاد سعيد (دودي) 🎂' : 'Saeed (Dodo) Birthday Countdown 🎂'}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">20 March</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {lang === 'ar' ? 'المتبقي على يوم ميلاد حبيب العمر:' : 'Remaining time until his special day:'}
        </p>
        <div className="flex gap-2">
          {renderTimerBlock(saeedBday.days, lang === 'ar' ? 'يوم' : 'Days')}
          {renderTimerBlock(saeedBday.hours, lang === 'ar' ? 'ساعة' : 'Hours')}
          {renderTimerBlock(saeedBday.minutes, lang === 'ar' ? 'دقيقة' : 'Mins')}
          {renderTimerBlock(saeedBday.seconds, lang === 'ar' ? 'ثانية' : 'Secs')}
        </div>
      </div>

      {/* Sohila Birthday Card */}
      <div id="sohila-bday-card" className={cardClass}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-rose-gold-500">
            <Sparkles size={20} />
            <h3 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-50">
              {lang === 'ar' ? 'العد التنازلي لعيد ميلاد سهيلة (SO) 🎉' : 'Sohila (SO) Birthday Countdown 🎉'}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">15 August</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {lang === 'ar' ? 'المتبقي على يوم ميلاد أميرة الفؤاد:' : 'Remaining time until her special day:'}
        </p>
        <div className="flex gap-2">
          {renderTimerBlock(sohilaBday.days, lang === 'ar' ? 'يوم' : 'Days')}
          {renderTimerBlock(sohilaBday.hours, lang === 'ar' ? 'ساعة' : 'Hours')}
          {renderTimerBlock(sohilaBday.minutes, lang === 'ar' ? 'دقيقة' : 'Mins')}
          {renderTimerBlock(sohilaBday.seconds, lang === 'ar' ? 'ثانية' : 'Secs')}
        </div>
      </div>

    </div>
  );
}
