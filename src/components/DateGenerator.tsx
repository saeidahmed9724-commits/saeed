import { useRef, useState, useEffect } from 'react';
import { Sparkles, Trophy, Heart, Gift, HelpCircle, Utensils, Compass, Laugh, Camera, Target, RotateCcw, Play, X, ArrowLeft, HeartHandshake, Eye } from 'lucide-react';
import { Language, DateActivity } from '../types';
import { DataStore } from '../dataStore';
import { translations } from '../translations';
import { motion, AnimatePresence } from 'motion/react';

interface DateGeneratorProps {
  lang: Language;
  currentUserRole: 'Dodo' | 'SO';
  initialItemName?: string | null;
}

interface WheelItem {
  id: string;
  nameAr: string;
  nameEn: string;
  actionType: 'open_when' | 'random_memory' | 'random_gallery' | 'random_video' | 'love_letter' | 'quote' | 'secret_question' | 'another_question' | 'none';
}

interface WheelCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  bgColorClass: string;     // Tailwind color class for active button
  textColorClass: string;   // Tailwind text color class
  borderColorClass: string; // Tailwind border class
  accentColor: string;      // Active category accent hex code
  pointerColor: string;     // Hex code for outer pointer & circle ring
  wheelColors: string[];    // Array of segment fill hex codes (alternating)
  textColorWheel: string;   // Hex code for text on slices
  items: WheelItem[];
}

// 1. Core Secret Questions List (8 high-quality items)
const secretQuestions = [
  { id: 'sq-1', nameAr: 'إيه الحركات الصغنونة اللي بعملها وتخليك تبتسم لوحدك؟', nameEn: 'What is a small thing I do that makes you smile automatically?' },
  { id: 'sq-2', nameAr: 'لو تقدر تختار لحظة واحدة سوا تعيش فيها على طول، هتكون أنهي؟', nameEn: 'If you could freeze one moment we spent together forever, what would it be?' },
  { id: 'sq-3', nameAr: 'إيه الأغنية اللي أول ما تسمعها تفتكرني على طول؟ وليه؟', nameEn: 'What song immediately reminds you of me when you hear it and why?' },
  { id: 'sq-4', nameAr: 'لو نطلع سفرية بكرة سوا، تحب نروح فين؟', nameEn: 'If we could travel anywhere together right now, where would we go?' },
  { id: 'sq-5', nameAr: 'إيه أكتر كلمة بحب أقولهالك وتفرح بيها؟', nameEn: 'What is your favorite word that I always say to you?' },
  { id: 'sq-6', nameAr: 'إيه أكتر حاجة بتحبها في طريقتي وشخصيتي؟', nameEn: 'What is the trait you love most about me?' },
  { id: 'sq-7', nameAr: 'أول مرة اتأبلنا فيها.. يوصفها 3 كلمات إيه؟', nameEn: 'Describe the first day we met in only 3 words!' },
  { id: 'sq-8', nameAr: 'إيه التغيير اللطيف اللي حسيته من يوم ما عرفنا بعض؟', nameEn: 'How did things get nicer since we met?' }
];

// 2. Core Love Letters List (5 deeply touching letters)
const loveLetters = [
  {
    id: 'll-1',
    nameAr: 'وجودك بيخلي اليوم أخف بكثير، وضحكتنا سوا هي أحلى حاجة في يومي ❤️',
    nameEn: 'Your presence makes every day so much lighter, and our laughs together are the best part of my day.'
  },
  {
    id: 'll-2',
    nameAr: 'كل قعدة معاك بتبقى رايقة ومن غير أي تكلف. شكراً إنك دايماً جنب وبتفهمني.',
    nameEn: 'Every time we sit together feels so cozy and genuine. Thank you for always being there and understanding me.'
  },
  {
    id: 'll-3',
    nameAr: 'وجودك جنبي بيفرق كتير في كل يوم، ومبسوط جداً بحكايتنا وتفاصيلنا سوا.',
    nameEn: 'Having you by my side means so much every day, and I love our simple story and details together.'
  },
  {
    id: 'll-4',
    nameAr: 'الراحة النفسية والأمان هي أهم حاجة، وإنت بتخليني أحس بالراحة دي دايماً.',
    nameEn: 'Peace of mind and comfort are everything, and you always make me feel so at ease.'
  },
  {
    id: 'll-5',
    nameAr: 'مهما زحمة اليوم خدتنا، دايماً بنرجع نتكلم ونطمن على بعض والضحكة تملى المكان.',
    nameEn: 'No matter how busy the day gets, we always connect and share a genuine smile.'
  }
];

export default function DateGenerator({ lang, currentUserRole, initialItemName }: DateGeneratorProps) {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Define Category Wheels Configuration
  const wheelCategories: WheelCategory[] = [
    {
      id: 'love',
      nameAr: 'الحب',
      nameEn: 'Love',
      icon: '❤️',
      bgColorClass: 'bg-rose-500 hover:bg-rose-600 text-white',
      textColorClass: 'text-rose-600 dark:text-rose-400',
      borderColorClass: 'border-rose-200 dark:border-rose-900/40',
      accentColor: '#f43f5e',
      pointerColor: '#e11d48',
      wheelColors: ['#FFF0F2', '#FDE2E4', '#FFCAD4', '#FFF0F2'],
      textColorWheel: '#be123c',
      items: [
        { id: 'l1', nameAr: 'حضن دافئ طويل', nameEn: 'Warm long hug', actionType: 'love_letter' },
        { id: 'l2', nameAr: 'رسالة غزل مفاجئة', nameEn: 'Surprise love message', actionType: 'love_letter' },
        { id: 'l3', nameAr: 'عشاء رومانسي معاً', nameEn: 'Romantic dinner together', actionType: 'none' },
        { id: 'l4', nameAr: 'رقصة هادئة معاً', nameEn: 'Cozy dance together', actionType: 'none' },
        { id: 'l5', nameAr: 'كتابة رسالة حب صادقة', nameEn: 'Write a sincere love letter', actionType: 'love_letter' },
        { id: 'l6', nameAr: 'جلسة تدليك مسترخية', nameEn: 'Relaxing massage session', actionType: 'none' },
        { id: 'l7', nameAr: 'مكالمة فيديو رومانسية', nameEn: 'Romantic video call', actionType: 'none' },
        { id: 'l8', nameAr: 'كلمة حلوة من القلب', nameEn: 'Sweet heartfelt words', actionType: 'love_letter' }
      ]
    },
    {
      id: 'surprises',
      nameAr: 'المفاجآت',
      nameEn: 'Surprises',
      icon: '🎁',
      bgColorClass: 'bg-amber-500 hover:bg-amber-600 text-white',
      textColorClass: 'text-amber-600 dark:text-amber-400',
      borderColorClass: 'border-amber-200 dark:border-amber-900/40',
      accentColor: '#f59e0b',
      pointerColor: '#d97706',
      wheelColors: ['#FFF8E7', '#FFEAA7', '#FFD27F', '#FFF8E7'],
      textColorWheel: '#b45309',
      items: [
        { id: 's1', nameAr: 'فتح رسالة من قسم Open When', nameEn: 'Open an Envelope from Open When', actionType: 'open_when' },
        { id: 's2', nameAr: 'عرض ذكرى عشوائية قديمة', nameEn: 'Show a random old memory', actionType: 'random_memory' },
        { id: 's3', nameAr: 'عرض صورة عشوائية لنا', nameEn: 'Show a random photo of us', actionType: 'random_gallery' },
        { id: 's4', nameAr: 'عرض فيديو عشوائي مميز', nameEn: 'Show a random video of us', actionType: 'random_video' },
        { id: 's5', nameAr: 'رسالة حب سرية من دودي', nameEn: 'Secret love letter reward', actionType: 'love_letter' },
        { id: 's6', nameAr: 'عرض اقتباس رومانسي ملهم', nameEn: 'Show a romantic quote', actionType: 'quote' },
        { id: 's7', nameAr: 'سؤال رومانسي سري', nameEn: 'Romantic secret question', actionType: 'secret_question' },
        { id: 's8', nameAr: 'سؤال عشوائي من دايلي كويستشن', nameEn: 'Random Daily Question', actionType: 'another_question' }
      ]
    },
    {
      id: 'questions',
      nameAr: 'الأسئلة',
      nameEn: 'Questions',
      icon: '❓',
      bgColorClass: 'bg-sky-500 hover:bg-sky-600 text-white',
      textColorClass: 'text-sky-600 dark:text-sky-400',
      borderColorClass: 'border-sky-200 dark:border-sky-900/40',
      accentColor: '#0ea5e9',
      pointerColor: '#0284c7',
      wheelColors: ['#F0F9FF', '#E0F2FE', '#BAE6FD', '#F0F9FF'],
      textColorWheel: '#0369a1',
      items: [
        { id: 'q1', nameAr: 'إيه انطباعك الأول عني؟', nameEn: 'What was your first impression of me?', actionType: 'secret_question' },
        { id: 'q2', nameAr: 'إيه أكتر حاجة بتعجبك فيا؟', nameEn: 'What is the quality that makes you love me most?', actionType: 'secret_question' },
        { id: 'q3', nameAr: 'امتى حسيت بإننا متفاهمين أوي؟', nameEn: 'When did you first feel our bond?', actionType: 'secret_question' },
        { id: 'q4', nameAr: 'إيه أكتر كلمة بتحبها مني؟', nameEn: 'What is your favorite word from me?', actionType: 'secret_question' },
        { id: 'q5', nameAr: 'إيه أحلى يوم قضيناه سوا؟', nameEn: 'What is your favorite day we spent?', actionType: 'secret_question' },
        { id: 'q6', nameAr: 'لو نسافر بكرة، تحب نروح فين؟', nameEn: 'If we could travel now, where to?', actionType: 'secret_question' },
        { id: 'q7', nameAr: 'إيه أكتر حاجة بتحبها في علاقتنا؟', nameEn: 'What are you most proud of in our bond?', actionType: 'secret_question' },
        { id: 'q8', nameAr: 'إيه الأغنية اللي بتفكرك بيا؟', nameEn: 'Which song reminds you of me?', actionType: 'secret_question' }
      ]
    },
    {
      id: 'food',
      nameAr: 'الطعام',
      nameEn: 'Food',
      icon: '🍔',
      bgColorClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      textColorClass: 'text-emerald-600 dark:text-emerald-400',
      borderColorClass: 'border-emerald-200 dark:border-emerald-900/40',
      accentColor: '#10b981',
      pointerColor: '#059669',
      wheelColors: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#ECFDF5'],
      textColorWheel: '#047857',
      items: [
        { id: 'f1', nameAr: 'بيتزا إيطالية شهية', nameEn: 'Delicious Pizza', actionType: 'none' },
        { id: 'f2', nameAr: 'برجر كلاسيكي مشوي', nameEn: 'Classic Burger', actionType: 'none' },
        { id: 'f3', nameAr: 'باستا بصلصة لذيذة', nameEn: 'Tasty Pasta', actionType: 'none' },
        { id: 'f4', nameAr: 'شاورما عربية أصيلة', nameEn: 'Authentic Shawarma', actionType: 'none' },
        { id: 'f5', nameAr: 'سوشي رائع وجميل', nameEn: 'Amazing Sushi', actionType: 'none' },
        { id: 'f6', nameAr: 'حلويات كيك وشوكولاتة', nameEn: 'Cake & Sweets', actionType: 'none' },
        { id: 'f7', nameAr: 'قهوة مختصة مع قطعة حلا', nameEn: 'Specialty Coffee & Treat', actionType: 'none' },
        { id: 'f8', nameAr: 'وجبة عشوائية بمزاج الشريك', nameEn: 'Surprise choice by partner', actionType: 'love_letter' }
      ]
    },
    {
      id: 'outings',
      nameAr: 'الخروجات',
      nameEn: 'Outings',
      icon: '✈️',
      bgColorClass: 'bg-violet-500 hover:bg-violet-600 text-white',
      textColorClass: 'text-violet-600 dark:text-violet-400',
      borderColorClass: 'border-violet-200 dark:border-violet-900/40',
      accentColor: '#8b5cf6',
      pointerColor: '#7c3aed',
      wheelColors: ['#F9F5FF', '#F3E8FF', '#D8B4FE', '#F9F5FF'],
      textColorWheel: '#6d28d9',
      items: [
        { id: 'o1', nameAr: 'مقهى هادئ دافئ', nameEn: 'Cozy Quiet Cafe', actionType: 'none' },
        { id: 'o2', nameAr: 'مطعم رومانسي راقٍ', nameEn: 'Elegant Restaurant', actionType: 'none' },
        { id: 'o3', nameAr: 'نزهة جميلة سيراً على الأقدام', nameEn: 'Scenic Walking Date', actionType: 'none' },
        { id: 'o4', nameAr: 'شاطئ البحر ومنظر الغروب', nameEn: 'Seaside Sunset View', actionType: 'none' },
        { id: 'o5', nameAr: 'جولة تسوق ومرح بالمول', nameEn: 'Mall & Fun Shopping', actionType: 'none' },
        { id: 'o6', nameAr: 'حديقة خضراء نزهة وبساط', nameEn: 'Picnic in Green Park', actionType: 'none' },
        { id: 'o7', nameAr: 'تناول الآيس كريم معاً', nameEn: 'Eating Ice Cream Together', actionType: 'none' },
        { id: 'o8', nameAr: 'خروجة مفاجئة يقررها الأكبر', nameEn: 'Surprise Date Adventure', actionType: 'love_letter' }
      ]
    },
    {
      id: 'fun',
      nameAr: 'المرح',
      nameEn: 'Fun',
      icon: '😂',
      bgColorClass: 'bg-yellow-500 hover:bg-yellow-600 text-neutral-900',
      textColorClass: 'text-yellow-600 dark:text-yellow-400',
      borderColorClass: 'border-yellow-200 dark:border-yellow-900/40',
      accentColor: '#facc15',
      pointerColor: '#ca8a04',
      wheelColors: ['#FEFCE8', '#FEF9C3', '#FEF08A', '#FEFCE8'],
      textColorWheel: '#a16207',
      items: [
        { id: 'fn1', nameAr: 'قل نكتة مضحكة فوراً', nameEn: 'Tell a funny joke right now', actionType: 'none' },
        { id: 'fn2', nameAr: 'تحدي دغدغة 10 ثوانٍ', nameEn: '10-second tickle challenge', actionType: 'none' },
        { id: 'fn3', nameAr: 'تقليد شخصية معروفة بلطف', nameEn: 'Imitate someone famous gently', actionType: 'none' },
        { id: 'fn4', nameAr: 'لعب لعبة إلكترونية سريعة', nameEn: 'Play a quick digital game', actionType: 'none' },
        { id: 'fn5', nameAr: 'سؤال صراحة قوي ومحرج', nameEn: 'Powerful truth question', actionType: 'secret_question' },
        { id: 'fn6', nameAr: 'طلب غريب يطلبه شريكك حالاً', nameEn: 'Partner commands a weird task', actionType: 'none' },
        { id: 'fn7', nameAr: 'غناء مقطع مضحك من أغنية', nameEn: 'Sing a silly lyric aloud', actionType: 'none' },
        { id: 'fn8', nameAr: 'مزحة خفيفة صادقة من القلب', nameEn: 'A light-hearted sweet prank', actionType: 'none' }
      ]
    },
    {
      id: 'memories',
      nameAr: 'الذكريات',
      nameEn: 'Memories',
      icon: '📸',
      bgColorClass: 'bg-slate-500 hover:bg-slate-600 text-white',
      textColorClass: 'text-slate-600 dark:text-slate-400',
      borderColorClass: 'border-slate-200 dark:border-slate-900/40',
      accentColor: '#64748b',
      pointerColor: '#475569',
      wheelColors: ['#F8FAFC', '#F1F5F9', '#CBD5E1', '#F8FAFC'],
      textColorWheel: '#334155',
      items: [
        { id: 'm1', nameAr: 'أول صورة التقطناها معاً', nameEn: 'Our first photo together', actionType: 'random_gallery' },
        { id: 'm2', nameAr: 'أول خروجة مميزة بيننا', nameEn: 'Our first special outing', actionType: 'random_memory' },
        { id: 'm3', nameAr: 'أول هدية تبادلناها بسعادة', nameEn: 'Our first happy gift exchange', actionType: 'random_memory' },
        { id: 'm4', nameAr: 'أول مكالمة هاتفية طويلة جداً', nameEn: 'Our first super long phone call', actionType: 'random_memory' },
        { id: 'm5', nameAr: 'أول ضحكة من القلب معاً', nameEn: 'Our first shared deep laugh', actionType: 'random_memory' },
        { id: 'm6', nameAr: 'عرض ذكرى عشوائية قديمة', nameEn: 'Show a random old memory', actionType: 'random_memory' },
        { id: 'm7', nameAr: 'صورة اليوم الأجمل بيننا', nameEn: 'Beautiful photo of the day', actionType: 'random_gallery' },
        { id: 'm8', nameAr: 'فيديو قديم ورائع من الأرشيف', nameEn: 'A lovely retro video clip', actionType: 'random_video' }
      ]
    },
    {
      id: 'challenges',
      nameAr: 'التحديات',
      nameEn: 'Challenges',
      icon: '🎯',
      bgColorClass: 'bg-red-500 hover:bg-red-600 text-white',
      textColorClass: 'text-red-600 dark:text-red-400',
      borderColorClass: 'border-red-200 dark:border-red-900/40',
      accentColor: '#ef4444',
      pointerColor: '#dc2626',
      wheelColors: ['#FEF2F2', '#FEE2E2', '#FECACA', '#FEF2F2'],
      textColorWheel: '#991b1b',
      items: [
        { id: 'c1', nameAr: 'تحدي تصوير سيلفي مجنون', nameEn: 'Crazy selfie photo challenge', actionType: 'none' },
        { id: 'c2', nameAr: 'تحدي الإجابة على 3 أسئلة سريعة', nameEn: 'Answer 3 fast questions challenge', actionType: 'secret_question' },
        { id: 'c3', nameAr: 'تحدي عدم الضحك لنصف دقيقة كاملة', nameEn: 'Try not to laugh for 30s challenge', actionType: 'none' },
        { id: 'c4', nameAr: 'تحدي كتابة رسالة حب في دقيقة واحدة', nameEn: 'Write a love note in 60s challenge', actionType: 'love_letter' },
        { id: 'c5', nameAr: 'تحدي إرسال مقطع فويس غنائي قصير', nameEn: 'Send a short singing voice note', actionType: 'none' },
        { id: 'c6', nameAr: 'تحدي رسم ملامح شريكك في دقيقة', nameEn: 'Draw your partner in 60s', actionType: 'none' },
        { id: 'c7', nameAr: 'تحدي تخمين الرقم السري بمخيلتك', nameEn: 'Guess the secret number game', actionType: 'none' },
        { id: 'c8', nameAr: 'تحدي عشوائي مفاجئ يحدده الخصم', nameEn: 'Surprise custom opponent challenge', actionType: 'love_letter' }
      ]
    }
  ];

  // Component States
  const [activeCategory, setActiveCategory] = useState<WheelCategory>(wheelCategories[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  
  // Modal Overlay States
  const [selectedItem, setSelectedItem] = useState<WheelItem | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    type: string;
    data: any;
    fallbackMsgAr?: string;
    fallbackMsgEn?: string;
  } | null>(null);

  // Redraw the canvas wheel whenever category, rotation, or language changes
  useEffect(() => {
    drawWheel();
  }, [activeCategory, rotationAngle, lang]);

  // Deep Link triggered selection
  useEffect(() => {
    if (initialItemName) {
      for (const cat of wheelCategories) {
        const found = cat.items.find(
          (item) => item.nameAr === initialItemName || item.nameEn === initialItemName
        );
        if (found) {
          setActiveCategory(cat);
          setSelectedItem(found);
          setShowResultModal(true);
          break;
        }
      }
    }
  }, [initialItemName]);

  // Redraw helper for Canvas element
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const items = activeCategory.items;
    const numSegments = items.length;
    const segmentAngle = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, size, size);

    items.forEach((item, index) => {
      const startAngle = index * segmentAngle + rotationAngle;
      const endAngle = startAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Use alternating category specific wheel colors
      ctx.fillStyle = activeCategory.wheelColors[index % activeCategory.wheelColors.length];
      ctx.fill();

      // Delicate inner slice borders
      ctx.lineWidth = 1;
      ctx.strokeStyle = activeCategory.accentColor + '30'; // subtle alpha border
      ctx.stroke();

      // Slices Text drawing
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      
      // Select appropriate typography
      ctx.font = lang === 'ar' ? '600 10.5px "Alexandria"' : '700 11px "Inter"';
      ctx.fillStyle = activeCategory.textColorWheel;

      const displayName = lang === 'ar' ? item.nameAr : item.nameEn;
      const displayString = displayName.length > 15 ? displayName.substring(0, 13) + '..' : displayName;
      
      ctx.fillText(displayString, radius - 15, 0);
      ctx.restore();
    });

    // Premium Solid outer ring matching category theme
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = activeCategory.pointerColor;
    ctx.stroke();

    // Central circular glowing button
    ctx.beginPath();
    ctx.arc(center, center, 14, 0, 2 * Math.PI);
    ctx.fillStyle = activeCategory.pointerColor;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
  };

  // Switch category
  const handleCategoryChange = (category: WheelCategory) => {
    if (isSpinning) return;
    setActiveCategory(category);
    setSelectedItem(null);
    setExecutionResult(null);
  };

  // Dynamic Spinning logic with deterministic angle target
  const spin = () => {
    if (isSpinning || activeCategory.items.length === 0) return;

    setIsSpinning(true);
    setSelectedItem(null);
    setExecutionResult(null);
    setShowResultModal(false);

    const spinDuration = 3500; // ms
    const startTime = performance.now();
    
    // Calculate deterministic total rotation (5-8 full spins + random offset)
    const extraSpins = (5 + Math.random() * 3) * 2 * Math.PI;
    const randomOffset = Math.random() * 2 * Math.PI;
    const startAngle = rotationAngle;
    const targetAngle = startAngle + extraSpins + randomOffset;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Luxurious cubic ease-out deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;
      
      setRotationAngle(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        setRotationAngle(targetAngle);
        
        // Calculate stopping item under pointer (pointing right, at 0 degrees)
        const items = activeCategory.items;
        const numSegments = items.length;
        const segmentAngle = (2 * Math.PI) / numSegments;
        
        const normalizedAngle = (2 * Math.PI - (targetAngle % (2 * Math.PI))) % (2 * Math.PI);
        const index = Math.floor(normalizedAngle / segmentAngle) % numSegments;
        
        if (index >= 0 && index < items.length) {
          const wonItem = items[index];
          setSelectedItem(wonItem);
          setShowResultModal(true);

          // Broadcast wheel spin to partner
          fetch('/api/interaction-state/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: currentUserRole,
              type: 'wheel_spin',
              titleAr: 'لف عجلة الحب والقرارات 🎡',
              titleEn: 'Spun the Date & Decision Wheel 🎡',
              descAr: `قام شريكك بلف العجلة على فئة "${activeCategory.nameAr}" وربح: "${wonItem.nameAr}"!`,
              descEn: `Your partner spun the "${activeCategory.nameEn}" wheel and got: "${wonItem.nameEn}"!`
            })
          }).catch(err => console.log('Error logging wheel spin:', err));
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  // Execute Reward Result Action
  const handleExecuteResult = () => {
    if (!selectedItem) return;
    setIsExecuting(true);

    // Simulate delightful micro loading
    setTimeout(() => {
      const type = selectedItem.actionType;

      if (type === 'random_memory') {
        const memories = DataStore.getMemories();
        if (memories.length > 0) {
          const rand = memories[Math.floor(Math.random() * memories.length)];
          setExecutionResult({ type, data: rand });
        } else {
          setExecutionResult({
            type,
            data: null,
            fallbackMsgAr: 'لا توجد ذكريات مسجلة بعد في مذكرات الحب! اذهب لقسم المذكرات بالأسفل وسجل ذكرى جميلة لتظهر هنا لاحقاً ❤️',
            fallbackMsgEn: 'No memories added yet in the Love Diary! Visit the diary section below to add your first beautiful memory ❤️'
          });
        }
      } 
      else if (type === 'random_gallery') {
        const gallery = DataStore.getGallery();
        if (gallery.length > 0) {
          const rand = gallery[Math.floor(Math.random() * gallery.length)];
          setExecutionResult({ type, data: rand });
        } else {
          setExecutionResult({
            type,
            data: null,
            fallbackMsgAr: 'لم يتم رفع صور بعد في معرض الصور! قم بإضافة لحظة مصورة في المعرض بالأسفل ❤️',
            fallbackMsgEn: 'No pictures uploaded to the gallery yet! Add a beautiful photo in the gallery below ❤️'
          });
        }
      } 
      else if (type === 'random_video') {
        const videos = DataStore.getVideos();
        if (videos.length > 0) {
          const rand = videos[Math.floor(Math.random() * videos.length)];
          setExecutionResult({ type, data: rand });
        } else {
          setExecutionResult({
            type,
            data: null,
            fallbackMsgAr: 'لا توجد فيديوهات مسجلة بعد! أضف فيديو رومانسياً في قسم الفيديوهات بالأسفل ❤️',
            fallbackMsgEn: 'No videos uploaded yet! Add a romantic clip in the video section below ❤️'
          });
        }
      } 
      else if (type === 'quote') {
        const quotes = DataStore.getQuotes();
        if (quotes.length > 0) {
          const rand = quotes[Math.floor(Math.random() * quotes.length)];
          setExecutionResult({ type, data: rand });
        } else {
          setExecutionResult({
            type,
            data: null,
            fallbackMsgAr: 'لا توجد اقتباسات مسجلة بعد! أضف اقتباساً لطيفاً في قبو الحب بالأسفل ❤️',
            fallbackMsgEn: 'No quotes recorded yet! Write a sweet quote inside the Love Vault settings below ❤️'
          });
        }
      } 
      else if (type === 'open_when') {
        const envelopes = DataStore.getEnvelopes();
        if (envelopes.length > 0) {
          const rand = envelopes[Math.floor(Math.random() * envelopes.length)];
          setExecutionResult({ type, data: rand });
        } else {
          setExecutionResult({
            type,
            data: null,
            fallbackMsgAr: 'لم يتم العثور على أظرف في قسم "افتح عندما"! يمكنك إنشاء أظرف ومفاجآت مخصصة ❤️',
            fallbackMsgEn: 'No envelopes found in Open When! You can create custom envelopes in the admin dashboard ❤️'
          });
        }
      } 
      else if (type === 'secret_question') {
        const rand = secretQuestions[Math.floor(Math.random() * secretQuestions.length)];
        setExecutionResult({ type, data: rand });
      } 
      else if (type === 'another_question') {
        const daily = DataStore.getDailyQuestions();
        if (daily.length > 0) {
          const rand = daily[Math.floor(Math.random() * daily.length)];
          setExecutionResult({ type, data: rand });
        } else {
          const rand = secretQuestions[Math.floor(Math.random() * secretQuestions.length)];
          setExecutionResult({ type: 'secret_question', data: rand });
        }
      } 
      else if (type === 'love_letter') {
        const rand = loveLetters[Math.floor(Math.random() * loveLetters.length)];
        setExecutionResult({ type, data: rand });
      }

      setIsExecuting(false);
    }, 800);
  };

  // Re-spin trigger inside popup
  const handleReSpinFromModal = () => {
    setShowResultModal(false);
    setSelectedItem(null);
    setExecutionResult(null);
    // Add micro delay for smooth closure animation before launching spin
    setTimeout(() => {
      spin();
    }, 250);
  };

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Dynamic Category Scrollable Header Bar */}
      <div className="w-full select-none mb-6">
        <span className="text-[10px] font-bold text-rose-gold-500 uppercase tracking-widest block text-center mb-2.5">
          {lang === 'ar' ? 'اختر فئة العجلة' : 'Select Wheel Category'}
        </span>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-rose-gold-200 scrollbar-track-transparent w-full snap-x snap-mandatory">
          {wheelCategories.map((cat) => {
            const isActive = activeCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat)}
                disabled={isSpinning}
                className={`snap-center flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-300 border shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                  isActive
                    ? `${cat.bgColorClass} shadow-md border-transparent scale-102`
                    : 'bg-white/60 dark:bg-black/20 text-neutral-600 dark:text-neutral-400 border-neutral-200/50 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wheel Container Area */}
      <div className="relative py-2 flex flex-col items-center max-w-sm mx-auto w-full">
        
        {/* Dynamic Category Ribbon Label */}
        <div className="absolute top-[-8px] z-10 animate-fade-in">
          <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 bg-white/95 dark:bg-neutral-900/95 ${activeCategory.textColorClass} ${activeCategory.borderColorClass}`}>
            <span>{activeCategory.icon}</span>
            <span>{lang === 'ar' ? activeCategory.nameAr : activeCategory.nameEn}</span>
          </div>
        </div>

        {/* Spinner wheel stage */}
        <div className="relative my-4 flex items-center justify-center">
          
          {/* Physical Pointer on right */}
          <div className="absolute right-[-14px] top-1/2 transform -translate-y-1/2 z-10 filter drop-shadow-md">
            <div 
              className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-r-[18px]" 
              style={{ borderRightColor: activeCategory.pointerColor }}
            />
          </div>

          <div className="p-1 rounded-full border border-neutral-100 dark:border-neutral-800 shadow-xl bg-white/5 dark:bg-black/10">
            <canvas
              ref={canvasRef}
              width={260}
              height={260}
              className="w-[260px] h-[260px] transition-transform duration-100"
            />
          </div>
        </div>

        {/* Trigger Spin Button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          style={{ backgroundColor: activeCategory.pointerColor }}
          className="mt-4 px-8 py-3 rounded-full text-white font-bold text-sm transition-all duration-300 shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          <Sparkles size={16} className={isSpinning ? 'animate-pulse' : ''} />
          {isSpinning ? (lang === 'ar' ? 'جاري اللف...' : 'Spinning...') : (lang === 'ar' ? 'أدر العجلة' : 'Spin the Wheel')}
        </button>
      </div>

      {/* High-Fidelity Result & Actions Modal */}
      <AnimatePresence>
        {showResultModal && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col"
            >
              
              {/* Golden confetti background aesthetics */}
              <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Close Button */}
              <button
                onClick={() => setShowResultModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors z-20"
              >
                <X size={16} />
              </button>

              {/* Modal Core Scrollable Content */}
              <div className="overflow-y-auto pr-1 flex-1 py-2">
                
                {!executionResult ? (
                  /* --- Standard Winner Announcement View --- */
                  <div className="text-center flex flex-col items-center">
                    
                    {/* Glowing Star/Gift Emblem */}
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-500 mb-4 border border-amber-100 dark:border-amber-900/20 animate-bounce">
                      <Trophy size={32} />
                    </div>

                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                      {lang === 'ar' ? 'نتيجة لف العجلة!' : 'Spin Result!'}
                    </span>
                    
                    <h3 className="text-sm font-bold text-neutral-400 dark:text-neutral-500 mb-4">
                      {lang === 'ar' ? `فئة: ${activeCategory.nameAr}` : `Category: ${activeCategory.nameEn}`}
                    </h3>

                    {/* Highly stylized prize block */}
                    <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 border border-amber-100/60 dark:border-amber-900/20 mb-6 relative">
                      <span className="absolute top-2 left-2 text-xl opacity-20">✨</span>
                      <span className="absolute bottom-2 right-2 text-xl opacity-20">✨</span>
                      
                      <p className="text-xl md:text-2xl font-black text-neutral-900 dark:text-neutral-50 font-serif leading-relaxed px-2">
                        {lang === 'ar' ? selectedItem.nameAr : selectedItem.nameEn}
                      </p>
                    </div>

                    {/* Action buttons row */}
                    <div className="flex flex-col gap-3 w-full">
                      
                      {/* Execute Reward Action if interactive */}
                      {selectedItem.actionType !== 'none' && (
                        <button
                          onClick={handleExecuteResult}
                          disabled={isExecuting}
                          className="w-full py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs md:text-sm shadow-md hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                        >
                          {isExecuting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>{lang === 'ar' ? 'جاري التحضير...' : 'Unveiling...'}</span>
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>{lang === 'ar' ? 'تنفيذ النتيجة المذهلة' : 'Reveal/Execute Result'}</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Re-spin Button */}
                      <button
                        onClick={handleReSpinFromModal}
                        className="w-full py-3 px-5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 font-bold text-xs md:text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={15} />
                        <span>{lang === 'ar' ? 'إعادة لف العجلة 🎲' : 'Spin Again 🎲'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* --- Reward Content View (Executed Action) --- */
                  <div className="flex flex-col">
                    
                    {/* Back header navigation */}
                    <button
                      onClick={() => setExecutionResult(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors mb-4"
                    >
                      <ArrowLeft size={14} />
                      <span>{lang === 'ar' ? 'العودة للنتيجة' : 'Back to result'}</span>
                    </button>

                    <div className="text-center mb-4">
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-gold-500 block mb-0.5">
                        {lang === 'ar' ? 'محتوى الجائزة المُفعّل' : 'Activated Reward Content'}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {lang === 'ar' ? selectedItem.nameAr : selectedItem.nameEn}
                      </h4>
                    </div>

                    {/* Action execution rendering block */}
                    <div className="w-full mb-6">
                      
                      {!executionResult.data ? (
                        /* Case: No records found (Fallback message with CTA) */
                        <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 text-center">
                          <span className="text-2xl block mb-2">❤️</span>
                          <p className="text-xs md:text-sm font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {lang === 'ar' ? executionResult.fallbackMsgAr : executionResult.fallbackMsgEn}
                          </p>
                        </div>
                      ) : (
                        /* Case: Database Record loaded correctly */
                        <div className="w-full">
                          
                          {/* Case A: Random Memory Card */}
                          {executionResult.type === 'random_memory' && (
                            <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg text-left">
                              <span className="text-[10px] font-bold text-rose-gold-500 block mb-1">
                                📅 {executionResult.data.date}
                              </span>
                              <h5 className="font-serif text-base font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                                {executionResult.data.title}
                              </h5>
                              
                              {executionResult.data.imageUrl && (
                                <img
                                  src={executionResult.data.imageUrl}
                                  alt="Memory"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-40 object-cover rounded-xl mb-3 border border-neutral-100 dark:border-neutral-900"
                                />
                              )}
                              
                              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                {executionResult.data.content}
                              </p>
                            </div>
                          )}

                          {/* Case B: Random Gallery Photo Frame */}
                          {executionResult.type === 'random_gallery' && (
                            <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-2xl border border-amber-100 dark:border-amber-950/40 shadow-inner flex flex-col items-center">
                              <div className="bg-white dark:bg-neutral-900 p-2 pb-5 rounded-lg shadow-md border border-neutral-200/50 dark:border-neutral-800 max-w-[280px]">
                                <img
                                  src={executionResult.data.url}
                                  alt="Polaroid frame"
                                  referrerPolicy="no-referrer"
                                  className="w-full aspect-square object-cover rounded mb-2 border border-neutral-100"
                                />
                                <span className="text-[9px] font-mono text-neutral-400 block text-center">
                                  📸 {executionResult.data.date}
                                </span>
                                {executionResult.data.caption && (
                                  <p className="text-[11px] font-serif font-bold text-neutral-700 dark:text-neutral-300 text-center mt-1 italic px-1">
                                    "{executionResult.data.caption}"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Case C: Random Video Clip player */}
                          {executionResult.type === 'random_video' && (
                            <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-md">
                              <span className="text-[10px] font-mono text-neutral-400 block mb-1">
                                📅 {executionResult.data.date}
                              </span>
                              <h5 className="text-xs md:text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-3">
                                {executionResult.data.title || (lang === 'ar' ? 'فيديو ذكرياتنا الدافئة' : 'Our Memory Clip')}
                              </h5>
                              
                              {executionResult.data.url.includes('youtube.com') || executionResult.data.url.includes('youtu.be') ? (
                                <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-900 shadow-inner">
                                  <iframe
                                    src={executionResult.data.url.replace('watch?v=', 'embed/')}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Memory Video"
                                  />
                                </div>
                              ) : (
                                <video
                                  src={executionResult.data.url}
                                  controls
                                  className="w-full aspect-video rounded-xl bg-black border border-neutral-100 dark:border-neutral-900"
                                />
                              )}
                            </div>
                          )}

                          {/* Case D: Romantic Quote Display */}
                          {executionResult.type === 'quote' && (
                            <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-800 text-center relative">
                              <span className="absolute top-2 left-4 text-4xl text-rose-gold-200 font-serif select-none pointer-events-none">“</span>
                              <p className="text-base md:text-lg font-medium text-neutral-800 dark:text-neutral-100 leading-relaxed font-serif px-4 relative z-10 italic">
                                {executionResult.data.text}
                              </p>
                              <span className="absolute bottom-2 right-4 text-4xl text-rose-gold-200 font-serif select-none pointer-events-none">”</span>
                              
                              <div className="mt-4 flex items-center justify-center gap-1.5">
                                <span className="h-px w-6 bg-rose-gold-200" />
                                <span className="text-xs font-bold text-rose-gold-500">
                                  {executionResult.data.author === 'Dodo' ? 'دودي 🌸' : 'شريك روحي 🌟'}
                                </span>
                                <span className="h-px w-6 bg-rose-gold-200" />
                              </div>
                            </div>
                          )}

                          {/* Case E: Open When Envelope flap */}
                          {executionResult.type === 'open_when' && (
                            <div className="p-5 rounded-2xl bg-orange-50/40 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/20 text-center">
                              <span className="text-3xl block mb-2">{executionResult.data.emoji || '✉️'}</span>
                              <h5 className="text-sm font-black text-orange-800 dark:text-orange-300 mb-3">
                                {lang === 'ar' ? executionResult.data.titleAr : executionResult.data.titleEn}
                              </h5>
                              <p className="text-xs md:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap px-1">
                                {lang === 'ar' ? executionResult.data.contentAr : executionResult.data.contentEn}
                              </p>
                            </div>
                          )}

                          {/* Case F: Secret Couple Question Card */}
                          {(executionResult.type === 'secret_question' || executionResult.type === 'another_question') && (
                            <div className="p-6 rounded-2xl bg-gradient-to-tr from-sky-50 to-indigo-50/40 dark:from-sky-950/10 dark:to-indigo-950/10 border border-sky-100 dark:border-sky-900/20 text-center shadow-md">
                              <span className="text-2xl block mb-2 animate-pulse">🌟</span>
                              <h5 className="text-xs font-bold text-sky-500 uppercase tracking-widest block mb-2">
                                {lang === 'ar' ? 'سؤال رومانسي حميمي للزوجين' : 'Intimate Couple Question'}
                              </h5>
                              <p className="text-sm md:text-base font-bold text-neutral-800 dark:text-neutral-100 leading-relaxed font-serif px-1 mb-4">
                                {lang === 'ar' ? executionResult.data.nameAr || executionResult.data.questionAr : executionResult.data.nameEn || executionResult.data.questionEn}
                              </p>
                              
                              <button
                                onClick={handleExecuteResult}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors text-[10px] font-bold"
                              >
                                <span>🔄</span>
                                <span>{lang === 'ar' ? 'سؤال سري آخر' : 'Another Secret Question'}</span>
                              </button>
                            </div>
                          )}

                          {/* Case G: Sincere Love letter Scroll */}
                          {executionResult.type === 'love_letter' && (
                            <div className="p-6 rounded-2xl bg-[#FFFBF0] dark:bg-neutral-950 border-2 border-amber-100 dark:border-amber-900/40 shadow-inner relative text-center">
                              {/* Left & Right scroll handles effect */}
                              <div className="absolute top-0 bottom-0 left-1.5 w-1 bg-amber-200/50 dark:bg-amber-900/10 rounded" />
                              <div className="absolute top-0 bottom-0 right-1.5 w-1 bg-amber-200/50 dark:bg-amber-900/10 rounded" />
                              
                              <span className="text-2xl block mb-2">📜</span>
                              <p className="text-xs md:text-sm font-semibold text-neutral-700 dark:text-neutral-200 leading-relaxed font-serif px-3">
                                {lang === 'ar' ? executionResult.data.nameAr : executionResult.data.nameEn}
                              </p>
                              
                              <p className="mt-4 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                {lang === 'ar' ? 'بكل الحب، شريك دربك ❤️' : 'With all my love, your forever partner ❤️'}
                              </p>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 justify-center w-full">
                      <button
                        onClick={handleReSpinFromModal}
                        className="py-2.5 px-4 rounded-xl bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw size={14} />
                        <span>{lang === 'ar' ? 'لف العجلة مجدداً 🎲' : 'Spin Again 🎲'}</span>
                      </button>
                      <button
                        onClick={() => setShowResultModal(false)}
                        className="py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold transition-colors"
                      >
                        <span>{lang === 'ar' ? 'إغلاق النافذة' : 'Close Window'}</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
