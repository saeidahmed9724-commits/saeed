import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, X, Edit3, Save, Sparkles, User, Brain, HelpCircle, 
  Share2, CheckCircle2, Award, Gift, ShieldAlert, Smile, FileText,
  Utensils, Coffee, Palette, Music, Film, Tv, Gamepad2, MapPin, Sun, Dog, Sparkle,
  ThumbsDown, AlertCircle, Clock, Users, Flame, ShoppingBag, Calendar, Compass, Lock,
  ArrowRight, RefreshCw, XCircle
} from 'lucide-react';
import { Language, UserRole, KnowledgeBaseData, KnowledgeBaseMap } from '../types';
import { DataStore } from '../dataStore';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentRole: UserRole;
  onDataChanged: () => void;
  onShareToChat?: (text: string) => void;
}

// Calculate Partner Knowledge Scores from saved quiz history
export function getPartnerKnowledgeScores(kbMap?: KnowledgeBaseMap) {
  const quizScores = DataStore.getKnowledgeQuizScores();
  const dodoKnowsSo = quizScores.Dodo?.percentage ?? 0;
  const soKnowsDodo = quizScores.SO?.percentage ?? 0;
  return { 
    dodoKnowsSo, 
    soKnowsDodo, 
    dodoQuiz: quizScores.Dodo, 
    soQuiz: quizScores.SO 
  };
}

// Distractor Pools for question choices
const DISTRACTOR_POOLS: Record<string, string[]> = {
  favoriteColor: ['الأحمر الداكن 🔴', 'الأصفر البرتقالي 💛', 'الأخضر الزيتوني 🟢', 'البنفسجي الهادئ 💜', 'الأزرق الملكي 💙', 'الوردي الروز 💖', 'الأسود الفخم 🖤'],
  favoriteFood: ['كشري مصري بصلصة زيادة 🍲', 'بيتزا مارجريتا 🍕', 'معكرونة بشاميل 🍝', 'شاورما عربي دجاج 🌯', 'ملوخية بالأرانب 🍲', 'برجر سينجل خشابي 🍔'],
  favoriteDrink: ['آيس ماتشا وشاي باللبن 🧋', 'قهوة مانجو وشاي بالنعناع ☕', 'عصير قصب بالثلج 🥤', 'كابتشينو فانيليا ☕', 'موهيتو ليمون ونعناع 🍹'],
  favoriteSinger: ['عمرو دياب 🎵', 'تامر حسني 🎶', 'إليسا 🎵', 'تامر عاشور 🎶', 'أصالة 🎵', 'محمد حماقي 🎶'],
  favoriteSong: ['أول كل حاجة', 'حالة حب', 'تملي معاك', 'يا بتاعات المصايف', 'يا عايش بقلبك'],
  favoriteMovie: ['Interstellar 🎬', 'The Notebook 🎬', 'كيرة والجن 🎬', 'عسل أسود 🎬', 'Titanic 🎬'],
  favoriteSeries: ['Game of Thrones 📺', 'Friends 📺', 'الكبير أوي 📺', 'موضوع عائلي 📺', 'Breaking Bad 📺'],
  favoriteGame: ['FIFA (FC25) 🎮', 'PUBG 🎮', 'Ludo Star 🎲', 'Subway Surfers 📱', 'Chess ♟️'],
  favoritePlace: ['البحر وقت الغروب 🌊', 'كافيه هادي بحديقة 🌸', 'السينما 🍿', 'المطعم المفضّل 🍝', 'البيت والهدوء 🏠'],
  favoriteSeason: ['الشتاء والجو المغيم ❄️', 'الصيف والبحر ☀️', 'الربيع والأشجار 🌸', 'الخريف والهدوء 🍂'],
  favoriteAnimal: ['القطط الصغيورة 🐱', 'الكلاب الهاسكي 🐶', 'الخيول العربية 🐴', 'العصافير 🐦'],
  favoritePerfume: ['Sauvage 🧴', 'Bleu de Chanel 🧴', 'Miss Dior 🧴', "Victoria's Secret Velvet Petals 🧴", 'Black Opium 🧴'],
  hatedFood: ['الأسماك النيئة 🦪', 'البامية 🍲', 'الكبدة 🍲', 'الأكل الحار جداً 🌶️', 'الكوارع 🍲'],
  petPeeve: ['التأخير والانتظار ⏳', 'الردود المختصرة الباردة 📱', 'الصوت العالي 🔊', 'عدم الترتيب 🧹'],
  hatedBehavior: ['التجاهل والتكبير 🙅‍♂️', 'البرود والعصبية 🚫', 'الكتمان وعدم الصراحة 🤐', 'قلة التقدير 💔'],
  dislikedMovieGenre: ['الرعب الدموي القاسي 🩸', 'أفلام العنف الشديد 👻', 'الأفلام الوثائقية الطويلة 🎬'],
  dislikedPlaces: ['الأماكن المزدحمة المزعجة 🔊', 'الأماكن المقفولة المكتومة 🏢', 'الأماكن الباردة جداً ❄️'],
  wakeUpTime: ['بصحى بدري وبحب الصباح 🌅', 'سهرانية وبحب الليل 🌙', 'بصحى حسب ظروف اليوم ⏰'],
  socialType: ['اجتماعي جداً بحب الناس 🤝', 'هادي وبفضل المقربين فقط 🌸', 'انطوائي بحب العزلة 🧘'],
  likesSurprises: ['جداً بتطيرني من الفرحة 🎁', 'مش بحب المفاجآت وبفضل التخطيط 📅', 'عادي حسب نوع المفاجأة ✨'],
  likesGifts: ['بحب الهدايا جداً 🎁', 'بفضل الوقت الممتع أكتر من الهدايا ⏳', 'بحب الهدايا اليدوية البسيطة 💖'],
  whenSad: ['أفضل أسكت وأسمع ميوزيك 🎧', 'أحب حد يسمعني ويطبطب عليا 🥺', 'أفضل أخرج وأتمشى لوحدي 🚶‍♂️'],
  whenStressed: ['أحب أتمشى أو أعمل حاجة بإيدي 🚶‍♂️', 'آكل حاجة حلوة وأتفرج على مسلسل 🍫', 'أنام وأفصل عن كل حاجة 💤'],
  feelsCaredForBy: ['السؤال عن التفاصيل الصغيرة 💬', 'الرسايل الطويلة الكيوت 💌', 'الهدايا المفاجئة 🎁', 'المساعدة والدعم 🤝'],
  relationshipTurnOff: ['الكتمان وعدم التعبير 🤐', 'الإهمال والردود الباردة 💔', 'الشك وعدم الثقة 🛡️', 'العصبية الزائدة 🚫'],
  makesMeHappy: ['لما ألاقي شريكي مبسوط ونضحك سوا ✨', 'لما يجيلي وردة وشوكولاتة 🌹', 'لما نسافر مكان جديد ✈️'],
  makesMeSad: ['لما يكون فيه زعل وما نتكلمش 😔', 'لما أحس إني مش أولوية 💔', 'لما تتلغي خروجة متفقين عليها 🚫'],
  loveLanguage: ['قضاء وقت ممتع (Quality Time) 🥰', 'كلام التقدير والحب (Words) 💬', 'الهدايا والاهتمام (Gifts) 🎁', 'المساعدة والدعم (Acts) 🤝'],
  reconcileWay: ['حضن دافي وكلام حنين صريح 🫂', 'وردة وشوكولاتة واعتذار رقيق 💌', 'خروجة هادية وأكل حلو سوا 🍝'],
  wantToBuy: ['ساعة أنيقة وسماعة رايقة 🎧', 'كاميرا فوري ورينج لايت 📸', 'لابتوب قوي وبلايستيشن 🎮'],
  wantToGo: ['دهب وسيوة وإيطاليا ✈️', 'تركيا والمالديف والزمالك 🌸', 'باريس وسويسرا 🏔️'],
  wantToTry: ['الغوص والتخييم تحت النجوم 🌌', 'نعمل كيكة سوا وكونسرت 🎂', 'القفز بالمظلات Skydive 🪂'],
  clothingSize: ['Medium (M)', 'Large (L)', 'X-Large (XL)', 'Small (S)'],
  birthdate: ['2006-03-20', '2006-08-15', '2005-11-10', '2007-01-05'],
  zodiac: ['الحوت ♓', 'الأسد ♌', 'العقرب ♏', 'الثور ♉'],
  bloodType: ['O+', 'A+', 'B+', 'AB+'],
  shoeSize: ['43', '38', '40', '42']
};

// Question templates per field
const FIELD_QUESTION_TITLES: Record<string, { ar: (p: string) => string; en: (p: string) => string }> = {
  favoriteFood: { ar: (p) => `ما هي الوجبة المفضلة لـ ${p}؟`, en: (p) => `What is ${p}'s favorite food?` },
  favoriteDrink: { ar: (p) => `ما هو المشروب المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite drink?` },
  favoriteColor: { ar: (p) => `ما هو اللون المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite color?` },
  favoriteSinger: { ar: (p) => `من هو المطرب المفضل لـ ${p}؟`, en: (p) => `Who is ${p}'s favorite singer?` },
  favoriteSong: { ar: (p) => `ما هي الأغنية المفضلة لـ ${p}؟`, en: (p) => `What is ${p}'s favorite song?` },
  favoriteMovie: { ar: (p) => `ما هو الفيلم المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite movie?` },
  favoriteSeries: { ar: (p) => `ما هو المسلسل المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite series?` },
  favoriteGame: { ar: (p) => `ما هي اللعبة المفضلة لـ ${p}؟`, en: (p) => `What is ${p}'s favorite game?` },
  favoritePlace: { ar: (p) => `ما هو المكان المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite place?` },
  favoriteSeason: { ar: (p) => `ما هو الفصل المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite season?` },
  favoriteAnimal: { ar: (p) => `ما هو الحيوان المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite animal?` },
  favoritePerfume: { ar: (p) => `ما هو العطر المفضل لـ ${p}؟`, en: (p) => `What is ${p}'s favorite perfume?` },
  hatedFood: { ar: (p) => `ما هو الأكل الذي يكرهه / تكرهه ${p}؟`, en: (p) => `What food does ${p} hate?` },
  petPeeve: { ar: (p) => `أكثر شيء يضايق ${p} في اليوم؟`, en: (p) => `What is ${p}'s pet peeve?` },
  hatedBehavior: { ar: (p) => `أكثر تصرف يكرهه / تكرهه ${p}؟`, en: (p) => `What behavior does ${p} dislike most?` },
  dislikedMovieGenre: { ar: (p) => `نوع الأفلام الذي لا يفضله / تفضله ${p}؟`, en: (p) => `Which movie genre does ${p} dislike?` },
  dislikedPlaces: { ar: (p) => `الأماكن التي لا يحبها / تحبها ${p}؟`, en: (p) => `Which places does ${p} dislike?` },
  wakeUpTime: { ar: (p) => `طبيعة الاستيقاظ والنوم لـ ${p}؟`, en: (p) => `How is ${p}'s sleep schedule?` },
  socialType: { ar: (p) => `طبيعة شخصية ${p} الاجتماعية؟`, en: (p) => `What is ${p}'s social personality?` },
  likesSurprises: { ar: (p) => `ما موقف ${p} من المفاجآت؟`, en: (p) => `Does ${p} like surprises?` },
  likesGifts: { ar: (p) => `نظرة ${p} للهدايا؟`, en: (p) => `How does ${p} view gifts?` },
  whenSad: { ar: (p) => `ماذا يفضل / تفضل ${p} عند الشعور بالحزن؟`, en: (p) => `What does ${p} prefer when sad?` },
  whenStressed: { ar: (p) => `ماذا يفضل / تفضل ${p} عند الضغط العصبي؟`, en: (p) => `What does ${p} do when stressed?` },
  feelsCaredForBy: { ar: (p) => `أكثر شيء يشعر ${p} بالاهتمام؟`, en: (p) => `What makes ${p} feel cared for?` },
  relationshipTurnOff: { ar: (p) => `أكثر شيء يضايق ${p} في العلاقة؟`, en: (p) => `What turns off ${p} in a relationship?` },
  makesMeHappy: { ar: (p) => `أكثر شيء يسعد ${p}؟`, en: (p) => `What makes ${p} happy?` },
  makesMeSad: { ar: (p) => `أكثر شيء يسبب الحزن لـ ${p}؟`, en: (p) => `What makes ${p} sad?` },
  loveLanguage: { ar: (p) => `ما هي لغة الحب المفضلة لـ ${p}؟`, en: (p) => `What is ${p}'s love language?` },
  reconcileWay: { ar: (p) => `ما هي طريقة الصلح المفضلة لـ ${p}؟`, en: (p) => `How does ${p} prefer to reconcile?` },
  wantToBuy: { ar: (p) => `ما هو الشيء الموجود في قائمة أمنيات ${p} للشراء؟`, en: (p) => `What is on ${p}'s wishlist to buy?` },
  wantToGo: { ar: (p) => `المكان الذي يتمنى / تتمنى ${p} زيارته؟`, en: (p) => `Where does ${p} want to visit?` },
  wantToTry: { ar: (p) => `التجربة التي يتمنى / تتمنى ${p} تجريبها؟`, en: (p) => `What experience does ${p} want to try?` },
  clothingSize: { ar: (p) => `ما هو مقاس ملابس ${p}؟`, en: (p) => `What is ${p}'s clothing size?` },
  birthdate: { ar: (p) => `ما هو تاريخ ميلاد ${p}؟`, en: (p) => `What is ${p}'s birthdate?` },
  zodiac: { ar: (p) => `ما هو برج ${p}؟`, en: (p) => `What is ${p}'s zodiac sign?` },
  bloodType: { ar: (p) => `ما هي فصيلة دم ${p}؟`, en: (p) => `What is ${p}'s blood type?` },
  shoeSize: { ar: (p) => `ما هو مقاس حذاء ${p}؟`, en: (p) => `What is ${p}'s shoe size?` }
};

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentRole,
  onDataChanged,
  onShareToChat
}) => {
  const [kbMap, setKbMap] = useState<KnowledgeBaseMap>(DataStore.getKnowledgeBase());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const isEditingRef = React.useRef(isEditing);
  isEditingRef.current = isEditing;
  const [formData, setFormData] = useState<KnowledgeBaseData>({});
  const [activeCategory, setActiveCategory] = useState<string>('likes');
  
  // Quiz states
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizSelectedOpt, setQuizSelectedOpt] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    field: string;
    title: string;
    correct: string;
    options: string[];
  }>>([]);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const loadKb = () => {
        const data = DataStore.getKnowledgeBase();
        setKbMap(data);
        if (!isEditingRef.current) {
          setFormData(data[currentRole] || {});
        }
      };

      loadKb();
      setIsEditing(false);
      setQuizMode(false);

      window.addEventListener('datastore_synced', loadKb);
      return () => window.removeEventListener('datastore_synced', loadKb);
    }
    // Intentionally NOT depending on `isEditing`: including it caused this
    // effect to re-run every time the user entered edit mode, which
    // immediately called setIsEditing(false) and kicked them right back
    // out — making the profile look like it "can't be edited".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentRole]);

  if (!isOpen) return null;

  const personName = currentRole === 'Dodo' ? (lang === 'ar' ? 'سعيد (دودي)' : 'Saeed (Dodo)') : (lang === 'ar' ? 'سهيلة (سو)' : 'Sohila (SO)');
  const partnerRole: UserRole = currentRole === 'Dodo' ? 'SO' : 'Dodo';
  const partnerName = partnerRole === 'Dodo' ? (lang === 'ar' ? 'سعيد' : 'Saeed') : (lang === 'ar' ? 'سهيلة' : 'Sohila');

  const { dodoKnowsSo, soKnowsDodo } = getPartnerKnowledgeScores();
  const myScore = currentRole === 'Dodo' ? dodoKnowsSo : soKnowsDodo;
  const partnerScore = currentRole === 'Dodo' ? soKnowsDodo : dodoKnowsSo;

  const handleInputChange = (field: keyof KnowledgeBaseData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedMap: KnowledgeBaseMap = {
      ...kbMap,
      [currentRole]: formData
    };
    setKbMap(updatedMap);
    DataStore.saveKnowledgeBase(updatedMap, {
      type: 'buzz',
      titleAr: `تحديث إجابات ${personName} في "اعرفني" ❤️`,
      titleEn: `Updated ${personName}'s answers in "Know Me" ❤️`,
      descAr: `قام ${personName} بتحديث معلوماته الشخصية.`,
      descEn: `${personName} updated personal profile answers.`
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    onDataChanged();
  };

  // Generate dynamic quiz strictly from partner's real saved answers
  const startQuiz = () => {
    const partnerData = kbMap[partnerRole] || {};
    const filledKeys = (Object.keys(partnerData) as (keyof KnowledgeBaseData)[]).filter(
      k => partnerData[k] && partnerData[k]?.trim() !== ''
    );

    if (filledKeys.length === 0) {
      setQuizQuestions([]);
      setQuizMode(true);
      return;
    }

    const generated = filledKeys.map(key => {
      const correctVal = partnerData[key]!.trim();
      const titleFn = FIELD_QUESTION_TITLES[key];
      const title = titleFn 
        ? (lang === 'ar' ? titleFn.ar(partnerName) : titleFn.en(partnerName))
        : (lang === 'ar' ? `ما هي إجابة ${partnerName} عن ${key}؟` : `What is ${partnerName}'s answer for ${key}?`);

      // Pick distractors from pool
      const pool = DISTRACTOR_POOLS[key] || ['إجابة تانية 1', 'إجابة تانية 2', 'إجابة تانية 3', 'إجابة تانية 4'];
      const filteredPool = pool.filter(opt => opt.toLowerCase() !== correctVal.toLowerCase());
      
      // Pick 3 random distractors
      const shuffledDistractors = [...filteredPool].sort(() => 0.5 - Math.random()).slice(0, 3);
      const allOptions = [correctVal, ...shuffledDistractors].sort(() => 0.5 - Math.random());

      return {
        field: key,
        title,
        correct: correctVal,
        options: allOptions
      };
    });

    // Shuffle question order
    const finalQuestions = generated.sort(() => 0.5 - Math.random());

    setQuizQuestions(finalQuestions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelectedOpt(null);
    setQuizFinished(false);
    setQuizMode(true);
  };

  const handleSelectAnswer = (opt: string) => {
    if (quizSelectedOpt !== null) return; // prevent re-clicking
    setQuizSelectedOpt(opt);
    const currentQ = quizQuestions[quizIndex];
    if (opt === currentQ.correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(prev => prev + 1);
      setQuizSelectedOpt(null);
    } else {
      // Quiz finished - save score
      const finalCorrect = quizSelectedOpt === quizQuestions[quizIndex].correct ? quizScore + 0 : quizScore;
      DataStore.saveKnowledgeQuizScore(currentRole, quizQuestions.length, finalCorrect, {
        type: 'quiz',
        titleAr: `اختبار جديد في "اعرفني" 🧩`,
        titleEn: `New "Know Me" Quiz Result 🧩`,
        descAr: `حصل ${personName} على ${finalCorrect}/${quizQuestions.length} في معرفة ${partnerName}!`,
        descEn: `${personName} scored ${finalCorrect}/${quizQuestions.length} about ${partnerName}!`
      });
      setQuizFinished(true);
      onDataChanged();
    }
  };

  const categories = [
    { id: 'likes', nameAr: '❤️ بحب', nameEn: '❤️ Likes', icon: Heart },
    { id: 'dislikes', nameAr: '🚫 مبحبش', nameEn: '🚫 Dislikes', icon: ThumbsDown },
    { id: 'personality', nameAr: '😊 شخصيتي', nameEn: '😊 Personality', icon: Smile },
    { id: 'relationship', nameAr: '❤️ في العلاقة', nameEn: '❤️ In Relationship', icon: Flame },
    { id: 'wishlist', nameAr: '🎁 Wishlist', nameEn: '🎁 Wishlist', icon: Gift },
    { id: 'quickFacts', nameAr: '📝 معلومات سريعة', nameEn: '📝 Quick Facts', icon: FileText },
  ];

  const currentData = isEditing ? formData : (kbMap[currentRole] || {});

  const renderField = (field: keyof KnowledgeBaseData, labelAr: string, labelEn: string, placeholderAr: string, icon: any) => {
    const IconComp = icon;
    const value = currentData[field] || '';

    return (
      <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-md p-3.5 rounded-2xl border border-rose-gold-100/30 dark:border-white/10 shadow-3xs flex flex-col gap-1.5 transition-all hover:border-rose-gold-300/50">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <IconComp size={15} className="text-rose-gold-500" />
            <span>{lang === 'ar' ? labelAr : labelEn}</span>
          </label>
          {!isEditing && value && onShareToChat && (
            <button
              onClick={() => onShareToChat(`📌 معلومة من ملف ${personName}: ${labelAr} ➔ ${value}`)}
              className="text-[10px] text-rose-gold-500 hover:text-rose-gold-600 font-medium flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-gold-50 dark:bg-rose-gold-950/40 cursor-pointer"
              title={lang === 'ar' ? 'مشاركة في الشات' : 'Share to chat'}
            >
              <Share2 size={11} />
              <span>{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholderAr}
            className="w-full text-xs p-2.5 rounded-xl border border-rose-gold-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-rose-gold-400 outline-none"
          />
        ) : (
          <p className={`text-xs ${value ? 'text-neutral-800 dark:text-neutral-200 font-medium' : 'text-neutral-400 italic'}`}>
            {value || (lang === 'ar' ? 'لم تجب بعد...' : 'Not answered yet...')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-3xl max-h-[92vh] bg-neutral-50 dark:bg-neutral-900 rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 flex flex-col overflow-hidden dir-rtl"
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-gold-500/15 via-pink-500/10 to-purple-500/15 border-b border-rose-gold-100/30 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-gold-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-gold-500/20">
              <Brain size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{lang === 'ar' ? 'نظام "اعرفني" (ملفي الخاص) ❤️' : '"Know Me" System (Private Profile)'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold flex items-center gap-1">
                  <Lock size={10} />
                  <span>{lang === 'ar' ? 'سرية تامّة 🔒' : 'Private'}</span>
                </span>
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {lang === 'ar' 
                  ? `ملفك شخصي وسري.. إجاباتك تُستخدم فقط لإنشاء اختبارات حقيقية لـ ${partnerName}!`
                  : `Your answers are private and used only to build real quizzes for ${partnerName}!`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* SAVE NOTIFICATION */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-emerald-500 text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>{lang === 'ar' ? 'تم حفظ إجاباتك بنجاح! ستُحدّث أسئلة الاختبارات تلقائيًا 💖' : 'Answers saved! Quizzes will auto-update.'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SCORE & QUIZ BANNER */}
        <div className="p-4 bg-white/50 dark:bg-neutral-800/50 border-b border-rose-gold-100/20 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* My Knowledge Index Display */}
          <div className="bg-gradient-to-r from-rose-gold-500/10 to-pink-500/10 p-3 rounded-2xl border border-rose-gold-200/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={20} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {lang === 'ar' ? `نسبة معرفتك بـ ${partnerName}` : `Your Knowledge of ${partnerName}`}
                </p>
                <p className="text-xs font-extrabold text-rose-gold-600 dark:text-rose-gold-400 mt-0.5">
                  {myScore > 0 ? `${myScore}%` : (lang === 'ar' ? 'لم تُجرِ اختبارًا بعد (0%)' : 'No quiz taken yet (0%)')}
                </p>
              </div>
            </div>

            <span className="text-[10px] px-2 py-1 rounded-lg bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-300 font-bold border border-rose-gold-200/30">
              {currentRole === 'Dodo' 
                ? (lang === 'ar' ? `سهيلة تعرفك: ${soKnowsDodo}%` : `SO knows you: ${soKnowsDodo}%`)
                : (lang === 'ar' ? `سعيد يعرفك: ${dodoKnowsSo}%` : `Dodo knows you: ${dodoKnowsSo}%`)}
            </span>
          </div>

          {/* Test Knowledge Button */}
          <button
            onClick={startQuiz}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-gold-500 via-pink-500 to-purple-500 hover:from-rose-gold-600 hover:to-purple-600 text-white text-xs font-bold shadow-md shadow-rose-gold-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles size={16} />
            <span>{lang === 'ar' ? `اختبر معرفتك بـ ${partnerName}! 🧩` : `Test Knowledge of ${partnerName}!`}</span>
          </button>
        </div>

        {/* QUIZ MODE MODAL OVERLAY */}
        {quizMode ? (
          <div className="p-6 flex-1 overflow-y-auto flex flex-col justify-center items-center">
            {quizQuestions.length === 0 ? (
              /* NO QUESTIONS FILLED YET */
              <div className="w-full max-w-lg bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-rose-gold-200 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 mx-auto flex items-center justify-center">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {lang === 'ar' ? `لا توجد إجابات محفوظة لـ ${partnerName} بعد!` : `No saved answers for ${partnerName} yet!`}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {lang === 'ar' 
                    ? `يتطلب الاختبار أن يقوم ${partnerName} بالإجابة على أسئلة ملفه الشخصي في نظام "اعرفني". اطلب منه/منها ملء إجاباته للبدء!`
                    : `${partnerName} needs to fill out their private profile answers first. Ask them to complete it!`}
                </p>
                <button
                  onClick={() => setQuizMode(false)}
                  className="py-2.5 px-6 rounded-xl bg-rose-gold-500 text-white text-xs font-bold cursor-pointer"
                >
                  {lang === 'ar' ? 'العودة' : 'Back'}
                </button>
              </div>
            ) : !quizFinished ? (
              /* ACTIVE QUIZ QUESTION */
              <div className="w-full max-w-lg bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-rose-gold-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
                  <span>{lang === 'ar' ? `السؤال ${quizIndex + 1} من ${quizQuestions.length}` : `Question ${quizIndex + 1} of ${quizQuestions.length}`}</span>
                  <button onClick={() => setQuizMode(false)} className="text-rose-500 hover:underline cursor-pointer">
                    {lang === 'ar' ? 'خروج' : 'Exit'}
                  </button>
                </div>

                <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-gold-500 h-full transition-all duration-300"
                    style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2 leading-relaxed">
                  {quizQuestions[quizIndex].title}
                </h3>

                <div className="space-y-2.5 pt-2">
                  {quizQuestions[quizIndex].options.map((opt, i) => {
                    const isSelected = quizSelectedOpt === opt;
                    const isCorrect = opt === quizQuestions[quizIndex].correct;
                    const hasAnswered = quizSelectedOpt !== null;

                    let btnStyle = 'border-neutral-200 dark:border-neutral-700 hover:border-rose-gold-400 hover:bg-rose-gold-50/50 dark:hover:bg-neutral-700/50 text-neutral-800 dark:text-neutral-200';
                    
                    if (hasAnswered) {
                      if (isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold';
                      } else {
                        btnStyle = 'border-neutral-200 opacity-50 text-neutral-400';
                      }
                    }

                    return (
                      <button
                        key={i}
                        disabled={hasAnswered}
                        onClick={() => handleSelectAnswer(opt)}
                        className={`w-full p-3.5 text-right rounded-2xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {hasAnswered && isCorrect && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
                        {hasAnswered && isSelected && !isCorrect && <XCircle size={16} className="text-rose-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* FEEDBACK BANNER & NEXT BUTTON */}
                {quizSelectedOpt !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-3 border-t border-neutral-100 dark:border-neutral-700 flex flex-col gap-3"
                  >
                    {quizSelectedOpt === quizQuestions[quizIndex].correct ? (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        <span>{lang === 'ar' ? 'إجابتك صحيحة! 🎉 ممتاز يا بطل' : 'Correct answer! 🎉 Great job'}</span>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <XCircle size={18} />
                          <span>{lang === 'ar' ? 'إجابة خاطئة! ❌' : 'Incorrect answer! ❌'}</span>
                        </div>
                        <span className="text-[11px] font-normal text-neutral-700 dark:text-neutral-300 dir-rtl">
                          {lang === 'ar' 
                            ? `الإجابة الصحيحة التي كتبها ${partnerName} هي: "${quizQuestions[quizIndex].correct}"`
                            : `The correct answer written by ${partnerName} is: "${quizQuestions[quizIndex].correct}"`}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-gold-500 to-pink-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{quizIndex + 1 < quizQuestions.length ? (lang === 'ar' ? 'السؤال التالي ➔' : 'Next Question ➔') : (lang === 'ar' ? 'إنهاء الاختبار ومشاهدة النتيجة 🏆' : 'Finish Quiz 🏆')}</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              /* FINAL QUIZ RESULT */
              <div className="w-full max-w-lg bg-white dark:bg-neutral-800 p-6 rounded-3xl border border-rose-gold-200 shadow-xl text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-500 mx-auto flex items-center justify-center">
                  <Award size={36} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {lang === 'ar' ? `نتيجة اختبار معرفتك بـ ${partnerName} 🎉` : `Knowledge Result for ${partnerName} 🎉`}
                </h3>

                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-gold-500/10 to-pink-500/10 border border-rose-gold-200">
                  <p className="text-2xl font-black text-rose-gold-600 dark:text-rose-gold-400">
                    {Math.round((quizScore / quizQuestions.length) * 100)}%
                  </p>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                    {lang === 'ar' 
                      ? `جاوبت صح على ${quizScore} من أصل ${quizQuestions.length} أسئلة!`
                      : `You answered ${quizScore} out of ${quizQuestions.length} questions correctly!`}
                  </p>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {quizScore / quizQuestions.length >= 0.8 
                    ? (lang === 'ar' ? `ما شاء الله عليك! حافظ تفاصيل ${partnerName} بالمللي ❤️` : `Amazing! You know ${partnerName} inside out!`)
                    : (lang === 'ar' ? `جهد ممتاز! تقدر تحسن النسبة مع التكرار والاستماع للتفاصيل ✨` : `Great effort! Retake to keep learning details!`)}
                </p>

                <div className="pt-3 flex gap-3 justify-center">
                  <button
                    onClick={startQuiz}
                    className="py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} />
                    <span>{lang === 'ar' ? 'إعادة الاختبار' : 'Retake Quiz'}</span>
                  </button>
                  <button
                    onClick={() => setQuizMode(false)}
                    className="py-2.5 px-5 rounded-xl bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-xs font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'العودة لملفي الخاص' : 'Back to My Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* NORMAL PRIVATE PROFILE EDITING CONTENT */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">
            {/* ACTION BAR */}
            <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-3 rounded-2xl border border-rose-gold-100/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  {lang === 'ar' ? `ملفك الشخصي الخاص (${personName})` : `Your Private Profile (${personName})`}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center gap-1">
                  <Lock size={10} />
                  <span>{lang === 'ar' ? 'سري وخاص بك' : 'Private to you'}</span>
                </span>
              </div>

              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setIsEditing(false); setFormData(kbMap[currentRole] || {}); }}
                    className="py-1.5 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleSave}
                    className="py-1.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Save size={14} />
                    <span>{lang === 'ar' ? 'حفظ إجاباتي 💾' : 'Save My Answers'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsEditing(true); setFormData(kbMap[currentRole] || {}); }}
                  className="py-1.5 px-4 rounded-xl bg-rose-gold-500 hover:bg-rose-gold-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                >
                  <Edit3 size={14} />
                  <span>{lang === 'ar' ? 'تعديل إجاباتي ✏️' : 'Edit My Answers'}</span>
                </button>
              )}
            </div>

            {/* CATEGORY SELECTOR PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-rose-gold-500 text-white shadow-md shadow-rose-gold-500/20'
                        : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-rose-gold-50 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <CatIcon size={14} />
                    <span>{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
                  </button>
                );
              })}
            </div>

            {/* CATEGORY FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeCategory === 'likes' && (
                <>
                  {renderField('favoriteFood', 'الأكل المفضل 🍕', 'Favorite Food', 'مثلاً: بيتزا مارجريتا وبشاميل...', Utensils)}
                  {renderField('favoriteDrink', 'المشروب المفضل ☕', 'Favorite Drink', 'مثلاً: آيس ماتشا وشاي بالنعناع...', Coffee)}
                  {renderField('favoriteColor', 'اللون المفضل 💙', 'Favorite Color', 'مثلاً: الأزرق والوردي...', Palette)}
                  {renderField('favoriteSinger', 'المطرب المفضل 🎵', 'Favorite Singer', 'مثلاً: عمرو دياب وإليسا...', Music)}
                  {renderField('favoriteSong', 'الأغنية المفضلة 🎶', 'Favorite Song', 'مثلاً: أول كل حاجة...', Sparkle)}
                  {renderField('favoriteMovie', 'الفيلم المفضل 🎬', 'Favorite Movie', 'مثلاً: Interstellar و The Notebook...', Film)}
                  {renderField('favoriteSeries', 'المسلسل المفضل 📺', 'Favorite Series', 'مثلاً: Friends وموضوع عائلي...', Tv)}
                  {renderField('favoriteGame', 'اللعبة المفضلة 🎮', 'Favorite Game', 'مثلاً: Ludo و FIFA...', Gamepad2)}
                  {renderField('favoritePlace', 'المكان المفضل 🌊', 'Favorite Place', 'مثلاً: كافيه هادي والبحر...', MapPin)}
                  {renderField('favoriteSeason', 'الفصل المفضل ❄️', 'Favorite Season', 'مثلاً: الشتاء والربيع...', Sun)}
                  {renderField('favoriteAnimal', 'الحيوان المفضل 🐶', 'Favorite Animal', 'مثلاً: القطط الصغيورة والهاسكي...', Dog)}
                  {renderField('favoritePerfume', 'العطر المفضل 🧴', 'Favorite Perfume', 'مثلاً: Sauvage و Miss Dior...', Sparkles)}
                </>
              )}

              {activeCategory === 'dislikes' && (
                <>
                  {renderField('hatedFood', 'أكل بكرهه 🍲', 'Hated Food', 'مثلاً: البامية والأسماك النيئة...', ThumbsDown)}
                  {renderField('petPeeve', 'حاجة بتضايقني ⏳', 'Pet Peeve', 'مثلاً: الانتظار والرد المقتضب...', AlertCircle)}
                  {renderField('hatedBehavior', 'تصرف بكرهه 🚫', 'Hated Behavior', 'مثلاً: التجاهل والعصبية الزايدة...', ShieldAlert)}
                  {renderField('dislikedMovieGenre', 'نوع أفلام مبحبوش 👻', 'Disliked Genre', 'مثلاً: الرعب الدموي والعنف...', Film)}
                  {renderField('dislikedPlaces', 'أماكن مبحبهاش 🏢', 'Disliked Places', 'مثلاً: الأماكن المكتومة الزحمة...', MapPin)}
                </>
              )}

              {activeCategory === 'personality' && (
                <>
                  {renderField('wakeUpTime', 'بصحى بدري ولا متأخر 🌅', 'Wake Up Time', 'مثلاً: بصحى بدري وبحب الصباح...', Clock)}
                  {renderField('socialType', 'اجتماعي ولا هادي 🤝', 'Social Type', 'مثلاً: اجتماعي مع المقربين فقط...', Users)}
                  {renderField('likesSurprises', 'بحب المفاجآت؟ 🎁', 'Likes Surprises?', 'مثلاً: جداً بتطيرني من الفرحة...', Gift)}
                  {renderField('likesGifts', 'بحب الهدايا؟ 💖', 'Likes Gifts?', 'مثلاً: أكيد قيمتها بالاهتمام...', ShoppingBag)}
                  {renderField('whenSad', 'لما أزعل أفضل إيه؟ 🥺', 'When Sad', 'مثلاً: أفضل أسكت شوية لحد ما أهدا...', Smile)}
                  {renderField('whenStressed', 'لما أكون مضغوط أفضل إيه؟ 🍫', 'When Stressed', 'مثلاً: أتمشى أو آكل حاجة حلوة...', Flame)}
                </>
              )}

              {activeCategory === 'relationship' && (
                <>
                  {renderField('feelsCaredForBy', 'أكتر حاجة بتحسسني بالاهتمام 💬', 'Feels Cared For', 'مثلاً: السؤال عن تفاصيل يومي...', Heart)}
                  {renderField('relationshipTurnOff', 'أكتر حاجة بتضايقني 💔', 'Relationship Turn Off', 'مثلاً: الكتمان أو الإهمال...', ShieldAlert)}
                  {renderField('makesMeHappy', 'إيه اللي يخليني أفرح ✨', 'Makes Me Happy', 'مثلاً: شوكولاتة مفاجأة أو كلمة حلوة...', Sparkles)}
                  {renderField('makesMeSad', 'إيه اللي يخليني أزعل 😔', 'Makes Me Sad', 'مثلاً: لما نحس ببعد وما نتكلمش...', AlertCircle)}
                  {renderField('loveLanguage', 'لغة الحب المفضلة 🥰', 'Love Language', 'مثلاً: قضاء وقت ممتع والهدايا...', Flame)}
                  {renderField('reconcileWay', 'أحب أتصالح إزاي 💌', 'How to Reconcile', 'مثلاً: وردة واعتذار رقيق وحضن...', Gift)}
                </>
              )}

              {activeCategory === 'wishlist' && (
                <>
                  {renderField('wantToBuy', 'نفسي أجيب... 🛍️', 'Want to Buy', 'مثلاً: كاميرا فوري وساعة أنيقة...', ShoppingBag)}
                  {renderField('wantToGo', 'نفسي أروح... ✈️', 'Want to Visit', 'مثلاً: دهب وسيوة وإيطاليا...', Compass)}
                  {renderField('wantToTry', 'نفسي أجرب... 🌌', 'Want to Try', 'مثلاً: التخييم والغوص وتجربة كيكة سوا...', Sparkle)}
                </>
              )}

              {activeCategory === 'quickFacts' && (
                <>
                  {renderField('clothingSize', 'المقاس / الملابس 👕', 'Clothing Size', 'مثلاً: Large (L)...', User)}
                  {renderField('birthdate', 'تاريخ ميلادي 🎂', 'Birthdate', 'مثلاً: 2006-03-20...', Calendar)}
                  {renderField('zodiac', 'البرج ♓', 'Zodiac Sign', 'مثلاً: الحوت ♓ أو الأسد ♌...', Sparkles)}
                  {renderField('bloodType', 'فصيلة الدم 🩸', 'Blood Type', 'مثلاً: O+ أو A+ (اختياري)...', Heart)}
                  {renderField('shoeSize', 'رقم الحذاء 👟', 'Shoe Size', 'مثلاً: 43 أو 38...', FileText)}
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
