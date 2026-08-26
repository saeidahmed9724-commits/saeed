import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Sparkles, Trash2, Smile, Users, Clock, Flame, Zap } from 'lucide-react';
import { Language, UserRole } from '../types';
import { translations } from '../translations';

interface Buzz {
  id: string;
  sender: 'Dodo' | 'SO';
  type: 'heart' | 'hug' | 'kiss' | 'poke';
  timestamp: number;
}

interface StickyNote {
  id: string;
  sender: 'Dodo' | 'SO';
  text: string;
  color: string;
  emoji: string;
  timestamp: number;
}

interface InteractionState {
  dodoMood: string;
  soMood: string;
  dodoLastUpdated: string;
  soLastUpdated: string;
  pendingBuzzes: Buzz[];
  stickyNotes: StickyNote[];
  loveQuizAnswers: {
    [questionId: string]: {
      dodoAnswer?: string;
      soAnswer?: string;
      dodoTimestamp?: number;
      soTimestamp?: number;
    }
  };
}

interface InteractiveBoardProps {
  lang: Language;
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
}

// Custom synthesizer for cute audio cues
const playSynthSound = (type: 'heart' | 'hug' | 'kiss' | 'poke' | 'pop') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'heart') {
      // Double low-frequency thumps
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);

      // Second beat
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(65, now + 0.25);
      osc2.frequency.exponentialRampToValueAtTime(45, now + 0.4);
      gain2.gain.setValueAtTime(0, now + 0.25);
      gain2.gain.linearRampToValueAtTime(0.8, now + 0.27);
      gain2.gain.linearRampToValueAtTime(0, now + 0.4);
      
      osc.start(now);
      osc.stop(now + 0.2);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.45);
    } else if (type === 'kiss') {
      // Quick sweep up then pop down
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'hug') {
      // Warm, soft ascending tone
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(330, now + 0.3);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'poke') {
      // Sharp, fast blip
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Standard click/pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (err) {
    console.error('Audio synthesis failed:', err);
  }
};

export default function InteractiveBoard({ lang, currentUserRole, setCurrentUserRole }: InteractiveBoardProps) {
  const t = translations[lang];
  const [state, setState] = useState<InteractionState | null>(null);
  
  // Local state for sending note
  const [noteText, setNoteText] = useState('');
  const [noteColor, setNoteColor] = useState('from-pink-100 to-pink-200 dark:from-pink-950/40 dark:to-pink-900/40 border-pink-200 dark:border-pink-900/40');
  const [noteEmoji, setNoteEmoji] = useState('❤️');
  const [customMood, setCustomMood] = useState('');
  const [isEditingMood, setIsEditingMood] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  // Ref to track processed buzzes to avoid double activation
  const processedBuzzIds = useRef<Set<string>>(new Set());

  // Available pastel colors for sticky notes
  const noteColors = [
    { class: 'from-pink-100 to-pink-200 dark:from-pink-950/40 dark:to-pink-900/40 border-pink-200 dark:border-pink-900/40', name: 'Pink' },
    { class: 'from-rose-100 to-rose-200 dark:from-rose-950/40 dark:to-rose-900/40 border-rose-200 dark:border-rose-900/40', name: 'Rose' },
    { class: 'from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40 border-amber-200 dark:border-amber-900/40', name: 'Warm' },
    { class: 'from-purple-100 to-purple-200 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-900/40', name: 'Lavender' },
    { class: 'from-blue-100 to-blue-200 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-900/40', name: 'Ocean' },
    { class: 'from-emerald-100 to-emerald-200 dark:from-emerald-950/40 dark:to-emerald-900/40 border-emerald-200 dark:border-emerald-900/40', name: 'Mint' }
  ];

  // Quick emoji selectors
  const noteEmojis = ['❤️', '💖', '🥰', '🌸', '✨', '☕', '💋', '🧸', '🍦', '🍕'];

  const moodTemplates = [
    'سعيد 🌸', 'مشتاق 💕', 'مشغول 📚', 'نايم 😴', 'أفكر بك 💭', 'متحمس ✨', 'شقي 😈', 'تعبان 💤',
    'Happy 🌸', 'Missing you 💕', 'Busy 📚', 'Sleeping 😴', 'Thinking of you 💭', 'Excited ✨'
  ];

  // 1. Fetch state
  const fetchState = async () => {
    try {
      const res = await fetch('/api/interaction-state');
      if (res.ok) {
        const data: InteractionState = await res.json();
        setState(data);
        
        // Detect and play incoming buzzes
        if (data.pendingBuzzes && data.pendingBuzzes.length > 0) {
          const partnerBuzzes = data.pendingBuzzes.filter(b => b.sender !== currentUserRole);
          
          for (const buzz of partnerBuzzes) {
            if (!processedBuzzIds.current.has(buzz.id)) {
              processedBuzzIds.current.add(buzz.id);
              
              // Trigger audio synth
              playSynthSound(buzz.type);
              
              // Trigger floating visual emojis
              triggerFloatingEmojis(buzz.type);
              
              // Immediate acknowledgment so we don't refire
              ackBuzz(buzz.id);
            }
          }
        }
      }
    } catch (err) {
      console.log('Error fetching interaction state:', err);
    }
  };

  // Poll state every 3.5 seconds
  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3500);
    return () => clearInterval(interval);
  }, [currentUserRole]);

  // Acknowledge buzz helper
  const ackBuzz = async (id: string) => {
    try {
      await fetch('/api/interaction-state/buzz/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      console.log('Error acknowledging buzz:', err);
    }
  };

  // Trigger burst of floating emojis on screen
  const triggerFloatingEmojis = (type: 'heart' | 'hug' | 'kiss' | 'poke') => {
    const emojisMap = {
      heart: ['❤️', '💖', '💕', '💘'],
      kiss: ['💋', '😘', '👄', '❤️'],
      hug: ['🫂', '🧸', '🌸', '✨'],
      poke: ['👉', '⚡', '✨', '🎈']
    };
    const list = emojisMap[type] || ['❤️'];
    
    const newEmojis = Array.from({ length: 12 }).map((_, i) => ({
      id: `float-${Date.now()}-${i}-${Math.random()}`,
      emoji: list[Math.floor(Math.random() * list.length)],
      x: 10 + Math.random() * 80, // % from left
      y: 80 + Math.random() * 15  // % from bottom
    }));

    setFloatingEmojis(prev => [...prev, ...newEmojis]);

    // Cleanup after animation completes (3 seconds)
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => !newEmojis.find(ne => ne.id === e.id)));
    }, 3000);
  };

  // Send a heartbeat buzz
  const sendBuzz = async (type: 'heart' | 'hug' | 'kiss' | 'poke') => {
    playSynthSound(type);
    triggerFloatingEmojis(type); // show local feedback too!
    try {
      const res = await fetch('/api/interaction-state/buzz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: currentUserRole, type })
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    } catch (err) {
      console.log('Error sending buzz:', err);
    }
  };

  // Update live mood
  const updateMood = async (mood: string) => {
    playSynthSound('pop');
    setIsEditingMood(false);
    try {
      const res = await fetch('/api/interaction-state/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentUserRole, mood })
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    } catch (err) {
      console.log('Error updating mood:', err);
    }
  };

  // Submit sticky note
  const submitNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    playSynthSound('pop');
    const noteContent = noteText.trim();
    setNoteText('');
    
    try {
      const res = await fetch('/api/interaction-state/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUserRole,
          text: noteContent,
          color: noteColor,
          emoji: noteEmoji
        })
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    } catch (err) {
      console.log('Error creating sticky note:', err);
    }
  };

  // Delete sticky note
  const deleteNote = async (id: string) => {
    playSynthSound('poke');
    try {
      const res = await fetch(`/api/interaction-state/note/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
      }
    } catch (err) {
      console.log('Error deleting note:', err);
    }
  };

  // Format relative time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return lang === 'ar' ? 'الآن' : 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return lang === 'ar' ? `منذ ${minutes} د` : `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return lang === 'ar' ? `منذ ${hours} س` : `${hours}h ago`;
      
      return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const partnerRole: UserRole = currentUserRole === 'Dodo' ? 'SO' : 'Dodo';
  const partnerName = partnerRole === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila');
  const myName = currentUserRole === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila');

  const partnerMood = partnerRole === 'Dodo' ? state?.dodoMood : state?.soMood;
  const partnerLastUpdated = partnerRole === 'Dodo' ? state?.dodoLastUpdated : state?.soLastUpdated;

  const myMood = currentUserRole === 'Dodo' ? state?.dodoMood : state?.soMood;

  return (
    <div className="space-y-6 relative">
      
      {/* REAL-TIME FLOATING PARTY ANIMATION LAYER */}
      <AnimatePresence>
        {floatingEmojis.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, scale: 0.3, y: '0px' }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              scale: [0.5, 1.4, 1.2, 0.8], 
              x: [0, (Math.random() - 0.5) * 80],
              y: '-300px' 
            }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute pointer-events-none text-4xl z-50 select-none"
            style={{ left: `${e.x}%`, bottom: `15%` }}
          >
            {e.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 1. IDENTITY SELECTOR (WHO ARE YOU?) */}
      <div className="rounded-3xl glass p-4 border border-rose-gold-100/30 dark:border-white/5 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="text-[#d4af37]" size={16} />
            <h4 className="font-serif text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {lang === 'ar' ? 'مين بيلعب دلوقتي؟ 🔐' : 'Identify Active Partner 🔐'}
            </h4>
          </div>
          <span className="text-[10px] bg-rose-gold-500/10 text-rose-gold-500 dark:text-rose-gold-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {lang === 'ar' ? `مرحباً ${myName}!` : `Hi ${myName}!`}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setCurrentUserRole('Dodo');
              localStorage.setItem('user_role', 'Dodo');
              playSynthSound('pop');
            }}
            className={`py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentUserRole === 'Dodo'
                ? 'bg-rose-gold-500 border-rose-gold-500 text-white shadow-md'
                : 'bg-white/40 border-white/20 text-neutral-500 hover:bg-white/60 dark:bg-black/20 dark:border-white/5'
            }`}
          >
            🙋‍♂️ {lang === 'ar' ? 'أنا دودي (سعيد)' : 'I am Dodo (Saeed)'}
          </button>
          
          <button
            onClick={() => {
              setCurrentUserRole('SO');
              localStorage.setItem('user_role', 'SO');
              playSynthSound('pop');
            }}
            className={`py-2 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              currentUserRole === 'SO'
                ? 'bg-rose-gold-500 border-rose-gold-500 text-white shadow-md'
                : 'bg-white/40 border-white/20 text-neutral-500 hover:bg-white/60 dark:bg-black/20 dark:border-white/5'
            }`}
          >
            🙋‍♀️ {lang === 'ar' ? 'أنا سو (سهيلة)' : 'I am So (Sohila)'}
          </button>
        </div>
      </div>

      {/* 2. REAL-TIME MOOD & HEARTBEAT BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Partner Mood Card */}
        <div className="rounded-3xl glass p-4 border border-rose-gold-100/30 dark:border-white/5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-rose-gold-500 font-bold text-xs mb-2">
              <Clock size={12} className="animate-spin duration-5000" />
              <span>{lang === 'ar' ? `حالة ${partnerName} الحالية` : `${partnerName}'s Live Mood`}</span>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-rose-gold-100 dark:bg-rose-gold-950/20 text-rose-gold-500 flex items-center justify-center text-xl shadow-xs">
                {partnerMood?.split(' ')?.pop() || '💕'}
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  {partnerMood || (lang === 'ar' ? 'غير محدد' : 'No status yet')}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {lang === 'ar' ? 'آخر تحديث: ' : 'Updated: '} {getRelativeTime(partnerLastUpdated)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 border-t border-rose-gold-100/10 pt-3">
            <p className="text-[10px] text-neutral-400 mb-2 font-bold italic">
              {lang === 'ar' ? `أرسل تفاعلاً فورياً لتنبيه ${partnerName}!` : `Buzz ${partnerName} instantly!`}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => sendBuzz('heart')}
                className="py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500 text-pink-500 hover:text-white transition-all text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                title="Heartbeat"
              >
                <span>❤️</span>
                <span className="text-[8px] uppercase tracking-wider">{lang === 'ar' ? 'نبضة' : 'Heart'}</span>
              </button>
              <button
                onClick={() => sendBuzz('kiss')}
                className="py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white transition-all text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                title="Kiss"
              >
                <span>💋</span>
                <span className="text-[8px] uppercase tracking-wider">{lang === 'ar' ? 'قبلة' : 'Kiss'}</span>
              </button>
              <button
                onClick={() => sendBuzz('hug')}
                className="py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white transition-all text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                title="Warm Hug"
              >
                <span>🫂</span>
                <span className="text-[8px] uppercase tracking-wider">{lang === 'ar' ? 'حضن' : 'Hug'}</span>
              </button>
              <button
                onClick={() => sendBuzz('poke')}
                className="py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white transition-all text-xs font-bold flex flex-col items-center gap-0.5 cursor-pointer"
                title="Gentle Poke"
              >
                <span>👉</span>
                <span className="text-[8px] uppercase tracking-wider">{lang === 'ar' ? 'نغزة' : 'Poke'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* My Mood Card */}
        <div className="rounded-3xl glass p-4 border border-rose-gold-100/30 dark:border-white/5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-rose-gold-500 font-bold text-xs flex items-center gap-1">
                <Smile size={12} />
                {lang === 'ar' ? 'حالتي المزاجية الحالية' : 'My Current Mood'}
              </span>
              <button
                onClick={() => setIsEditingMood(!isEditingMood)}
                className="text-[10px] text-rose-gold-500 hover:underline font-bold"
              >
                {isEditingMood ? (lang === 'ar' ? 'إغلاق' : 'Close') : (lang === 'ar' ? 'تعديل ✍️' : 'Edit ✍️')}
              </button>
            </div>

            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center text-xl shadow-xs">
                {myMood?.split(' ')?.pop() || '🌸'}
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  {myMood || (lang === 'ar' ? 'أنا سعيد اليوم!' : 'I am happy today!')}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {lang === 'ar' ? 'سيراها الطرف الآخر فوراً' : 'Your partner will see this instantly'}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Mood Space */}
          {isEditingMood ? (
            <div className="mt-2 border-t border-rose-gold-100/10 pt-2 animate-fade-in">
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  maxLength={24}
                  placeholder={lang === 'ar' ? 'اكتب حالتك متبوعة بإيموجي...' : 'Write custom status with emoji...'}
                  value={customMood}
                  onChange={(e) => setCustomMood(e.target.value)}
                  className="flex-1 text-[11px] px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/35 outline-none text-neutral-900 dark:text-neutral-50"
                />
                <button
                  onClick={() => {
                    if (customMood.trim()) {
                      updateMood(customMood.trim());
                      setCustomMood('');
                    }
                  }}
                  className="px-3 rounded-xl bg-rose-gold-500 text-white text-xs font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'حفظ' : 'Save'}
                </button>
              </div>
              
              {/* Templates */}
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto py-1 custom-scrollbar">
                {moodTemplates.map((tmp) => (
                  <button
                    key={tmp}
                    onClick={() => updateMood(tmp)}
                    className="text-[9px] px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-rose-gold-100 dark:bg-white/5 dark:hover:bg-rose-gold-950/20 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-white/5 cursor-pointer"
                  >
                    {tmp}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 border-t border-rose-gold-100/10 pt-3 text-[10px] text-neutral-400 italic">
              {lang === 'ar' ? '💡 اضغط على تعديل لتحديث حالتك ليفاجأ بها حبيبك.' : '💡 Update your status anytime to surprise your love.'}
            </div>
          )}
        </div>
      </div>

      {/* 3. SHARED LOVE STICKY BOARD */}
      <div className="rounded-3xl glass p-4 md:p-6 border border-rose-gold-100/30 dark:border-white/5 shadow-md space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-rose-gold-500 animate-pulse" size={18} />
            <h4 className="font-serif text-base font-bold text-neutral-950 dark:text-neutral-50">
              {lang === 'ar' ? 'لوحة الرسائل الصغيرة 📌' : 'Our Shared Love Sticky Board 📌'}
            </h4>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            {state?.stickyNotes?.length || 0} {lang === 'ar' ? 'نوتة' : 'notes pinned'}
          </span>
        </div>

        {/* Pin a Note Form */}
        <form onSubmit={submitNote} className="space-y-3 bg-white/20 dark:bg-black/10 p-3.5 rounded-2xl border border-white/40 dark:border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Smile size={10} />
              {lang === 'ar' ? 'اكتب نوتة جديدة' : 'Pin a sweet love message'}
            </span>
            
            {/* Color Pickers */}
            <div className="flex items-center gap-1">
              {noteColors.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setNoteColor(c.class)}
                  className={`w-3.5 h-3.5 rounded-full border border-white/80 transition-transform ${c.class} ${noteColor === c.class ? 'scale-125 ring-1 ring-rose-gold-500' : 'hover:scale-110'}`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              maxLength={80}
              placeholder={lang === 'ar' ? 'اكتب حاجة لطيفة هنا... ❤️' : 'Pin some sweet words here... ❤️'}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-neutral-200 dark:border-white/10 bg-white/60 dark:bg-black/30 text-neutral-900 dark:text-neutral-50 outline-none placeholder:text-neutral-400"
            />
            
            <button
              type="submit"
              disabled={!noteText.trim()}
              className="px-4 py-2 rounded-xl bg-rose-gold-500 hover:bg-rose-gold-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={12} />
              <span>{lang === 'ar' ? 'تعليق' : 'Pin'}</span>
            </button>
          </div>

          {/* Emoji fast selector */}
          <div className="flex items-center gap-1.5 py-1 overflow-x-auto custom-scrollbar">
            <span className="text-[9px] text-neutral-400 whitespace-nowrap">{lang === 'ar' ? 'اختر رمزاً:' : 'Pick emoji:'}</span>
            {noteEmojis.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setNoteEmoji(e)}
                className={`text-xs p-1 rounded-md transition-all hover:scale-110 cursor-pointer ${noteEmoji === e ? 'bg-rose-gold-100 dark:bg-rose-gold-950 scale-110' : ''}`}
              >
                {e}
              </button>
            ))}
          </div>
        </form>

        {/* Sticky Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
          {state?.stickyNotes && state.stickyNotes.length > 0 ? (
            state.stickyNotes.map(n => {
              const isMine = n.sender === currentUserRole;
              const authorName = isMine 
                ? (lang === 'ar' ? 'أنت' : 'You') 
                : (n.sender === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila'));
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`p-3 rounded-2xl border backdrop-blur-md shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[90px] bg-gradient-to-br ${n.color}`}
                >
                  {/* Pin Circle */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-400/50 shadow-xs" />
                  
                  <div className="pt-2">
                    <p className="text-xs font-serif font-bold text-neutral-800 dark:text-neutral-100 break-words leading-relaxed">
                      {n.emoji} {n.text}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-1.5 mt-2">
                    <span className="text-[9px] font-bold text-neutral-500 dark:text-neutral-400">
                      {authorName} • {getRelativeTime(n.timestamp)}
                    </span>

                    <button
                      onClick={() => deleteNote(n.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                      title={lang === 'ar' ? 'نزع الرسالة' : 'Unpin Note'}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-neutral-400 text-xs">
              {lang === 'ar' ? '📌 الجدار فارغ حالياً. كن أول من يكتب رسالة حب!' : '📌 The sticky wall is empty. Pin a sweet note to start!'}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
