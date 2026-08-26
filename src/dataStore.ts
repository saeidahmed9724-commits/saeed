import { Profile, Memory, GalleryItem, VideoItem, Song, Quote, Envelope, DailyQuestion, QuizQuestion, VoiceMessage, DateActivity, KnowledgeBaseData, KnowledgeBaseMap, KnowledgeQuizScoresMap, UserRole } from './types';
import { getDefaultDailyQuestions } from './defaultQuestions';

// Default Knowledge Base ("اعرفني أكتر ❤️")
export const defaultKnowledgeBase: KnowledgeBaseMap = {
  Dodo: {
    // ❤️ بحب
    favoriteFood: 'بيتزا مارجريتا وبرجر سينجل 🍕',
    favoriteDrink: 'قهوة مانجو وشاي بالنعناع ☕',
    favoriteColor: 'الأزرق الملكي والأسود 💙',
    favoriteSinger: 'عمرو دياب وتامر حسني 🎵',
    favoriteSong: 'أول كل حاجة - عمرو دياب 🎵',
    favoriteMovie: 'Interstellar و كيرة والجن 🎬',
    favoriteSeries: 'Game of Thrones و الكبير أوي 📺',
    favoriteGame: 'FIFA (FC25) و PUBG 🎮',
    favoritePlace: 'البحر وقت الغروب وقعدة كافيه هادية 🌊',
    favoriteSeason: 'الشتاء والجو المغيم ❄️',
    favoriteAnimal: 'الكلاب الهاسكي والقطط الصغيورة 🐶',
    favoritePerfume: 'Sauvage و Bleu de Chanel 🧴',

    // 🚫 مبحبش
    hatedFood: 'الأسماك النيئة والأكل الحار جداً 🦪',
    petPeeve: 'التأخير والانتظار الكتير بدون سبب ⏳',
    hatedBehavior: 'التجاهل والتكبير وقلة التقدير 🙅‍♂️',
    dislikedMovieGenre: 'الرعب الدموي القاسي 🩸',
    dislikedPlaces: 'الأماكن المزدحمة المزعجة جداً 🔊',

    // 😊 شخصيتي
    wakeUpTime: 'بصحى بدري وبحب أستغل الصباح 🌅',
    socialType: 'اجتماعي مع المقربين وهادي في العادة 🤝',
    likesSurprises: 'جداً! بالذات لما تكون غير متوقعة ومن حد بحبه 🎁',
    likesGifts: 'أكيد، قيمتها في التفكير والاهتمام ❤️',
    whenSad: 'أفضل أسكت شوية وأسمع رايق لحد ما أهدا 🎧',
    whenStressed: 'أحب أتمشى أو أعمل حاجة بإيدي تلهيني 🚶‍♂️',

    // ❤️ في العلاقة
    feelsCaredForBy: 'السؤال عن التفاصيل الصغيرة ورسايل الاهتمام 💬',
    relationshipTurnOff: 'الكتمان وعدم التعبير بصراحة 🤐',
    makesMeHappy: 'لما ألاقي سهيلة مبسوطة وبنضحك سوا ✨',
    makesMeSad: 'لما أكون حاسس إن فيه زعل وما اتكلمناش 💔',
    loveLanguage: 'قضاء وقت ممتع والكلام الطيب (Quality Time) 🥰',
    reconcileWay: 'حضن دافي، كلام حنين صريح واعتذار هادي 🫂',

    // 🎁 Wishlist
    wantToBuy: 'ساعة أنيقة، لابتوب قوي وسماعة رايقة 🎧',
    wantToGo: 'دهب، سيوة، وإيطاليا ونلفها سوا ✈️',
    wantToTry: 'الغوص والتخييم تحت النجوم 🌌',

    // 📝 معلومات سريعة
    clothingSize: 'Large (L)',
    birthdate: '2006-03-20',
    zodiac: 'الحوت ♓',
    bloodType: 'O+',
    shoeSize: '43'
  },
  SO: {
    // ❤️ بحب
    favoriteFood: 'معكرونة بشاميل ووافل بالشوكولاتة 🍝',
    favoriteDrink: 'آيس ماتشا وشاي باللبن 🧋',
    favoriteColor: 'الوردي والزهري الروز جولد 💖',
    favoriteSinger: 'إليسا وتامر عاشور وأصالة 🎶',
    favoriteSong: 'حالة حب - إليسا 🎵',
    favoriteMovie: 'The Notebook و عسل أسود 🎬',
    favoriteSeries: 'Friends و موضوع عائلي 📺',
    favoriteGame: 'Ludo Star و Subway Surfers 🎲',
    favoritePlace: 'كافيه هادي بشجر ورد وركن مريح 🌸',
    favoriteSeason: 'الربيع والخريف 🌸',
    favoriteAnimal: 'القطط الكيوت البيضاء 🐱',
    favoritePerfume: "Miss Dior و Victoria's Secret Velvet Petals 🧴",

    // 🚫 مبحبش
    hatedFood: 'البامية والكبدة 🍲',
    petPeeve: 'الردود المختصرة السريعة من غير اهتمام 📱',
    hatedBehavior: 'البرود والعصبية الزيادة بدون داعي 🚫',
    dislikedMovieGenre: 'أفلام العنف الشديد والرعب القاسي 👻',
    dislikedPlaces: 'الأماكن المقفولة المكتومة والمزحومة 🏢',

    // 😊 شخصيتي
    wakeUpTime: 'سهرانية وبحب الهدوء بالليل 🌙',
    socialType: 'اجتماعية مع اللي بحبهم وبخجل شوية مع الغرباء 🌸',
    likesSurprises: 'جداً جداً! بتطيرني من الفرحة ✨',
    likesGifts: 'بحب الهدايا اللطيفة البسيطة اليدوية أو الذوق 🎁',
    whenSad: 'أحب حد يسمعني بحنية ويطبطب عليا 🥺',
    whenStressed: 'آكل حاجة حلوة أو آخد شاور دافي وأتفرج على مسلسل خفيف 🍫',

    // ❤️ في العلاقة
    feelsCaredForBy: 'الاهتمام المفاجئ والرسايل الطويلة الكيوت 💌',
    relationshipTurnOff: 'الإهمال أو الردود الباردة 💔',
    makesMeHappy: 'لما نعمل حاجة سوا أو يجيلي وردة وشوكولاتة 🌹',
    makesMeSad: 'لما أحس إني مش أولوية أو مقبولة 😔',
    loveLanguage: 'الهدايا اللطيفة، كلام التقدير، والاهتمام الدائم 🎁',
    reconcileWay: 'وردة وشوكولاتة ورسالة حلوة واعتذار رقيق 💌',

    // 🎁 Wishlist
    wantToBuy: 'كاميرا فوري بولاروايد وبيانو صغير ورينج لايت 📸',
    wantToGo: 'تركيا، المالديف، وجولة في شوارع المعادي والزمالك القديمة 🌸',
    wantToTry: 'نعمل كيكة سوا في المطبخ ونحضر كونسرت للمطرب المفضل 🎂',

    // 📝 معلومات سريعة
    clothingSize: 'Medium (M)',
    birthdate: '2006-08-15',
    zodiac: 'الأسد ♌',
    bloodType: 'A+',
    shoeSize: '38'
  }
};

export const defaultKnowledgeQuizScores: KnowledgeQuizScoresMap = {
  Dodo: { totalQuestions: 0, correctAnswers: 0, percentage: 0, lastUpdated: Date.now() },
  SO: { totalQuestions: 0, correctAnswers: 0, percentage: 0, lastUpdated: Date.now() }
};

// Default Profiles (Pre-filled with natural Egyptian details)
export const defaultSaeedProfile: Profile = {
  name: 'Saeed',
  nickname: 'Dodo',
  birthday: '2006-03-20',
  avatarUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784470798/WhatsApp_Image_2026-05-31_at_3.46.04_PM_junpuw.jpg',
  bio: 'سعيد 💙 بيحب الموسيقى والقعدات الرايقة واللحظات البسيطة',
  zodiac: 'الحوت ♓',
  favoriteSong: 'أول كل حاجة - عمرو دياب 🎵',
  loveLanguage: 'قضاء وقت ممتع والكلام الحلو ❤️',
  customFields: [
    { id: 'cf-1', label: 'الأكلة المفضلة 🍕', value: 'البيتزا والأكلات الإيطالية 🍕' },
    { id: 'cf-2', label: 'اللون المفضل 💙', value: 'الأزرق الملكي والأسود 💙' },
    { id: 'cf-3', label: 'أمنية مشتركة 🌍', value: 'نسافر سوا ونلف العالم 🌍' }
  ]
};

export const defaultSohilaProfile: Profile = {
  name: 'Sohila',
  nickname: 'SO',
  birthday: '2006-08-15',
  avatarUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784470919/WhatsApp_Image_2026-07-14_at_1.22.32_AM_rgtj6f.jpg',
  bio: 'سهيلة 🌸 بتحب الصور والذكريات والأوقات الحلوة سوا',
  zodiac: 'الأسد ♌',
  favoriteSong: 'حالة حب - إليسا 🎵',
  loveLanguage: 'الاهتمام والهدايا اللطيفة 🎁',
  customFields: [
    { id: 'cf-1', label: 'الأكلة المفضلة 🍰', value: 'المعكرونة بالبشاميل والحلويات 🍰' },
    { id: 'cf-2', label: 'اللون المفضل 💖', value: 'الوردي والزهري الروز جولد 💖' },
    { id: 'cf-3', label: 'أمنية مشتركة 🏡', value: 'نعمل بيت هادي ونكون مبسوطين فيه سوا 🏡' }
  ]
};

// Default Envelopes as required
export const defaultEnvelopes: Envelope[] = [
  {
    id: 'envelope-1',
    titleEn: 'Open when you miss me',
    titleAr: 'لما توحشني',
    contentEn: "Missing someone means they have a special place in your heart. Close your eyes for a moment and remember one memory that made you smile.",
    contentAr: "لما توحشني افتكر إننا عملنا ذكريات كتير حلوة سوا. افتكر موقف يضحكنا أو خروجة حلوة وابتسم لحد ما نتكلم.",
    emoji: '💖'
  },
  {
    id: 'envelope-2',
    titleEn: "Open when you're sad",
    titleAr: 'لما تكون متضايق',
    contentEn: "Bad days don't last forever. Whatever made today difficult, remember that tomorrow is another chance.",
    contentAr: "الأيام التقيلة بتعدي على طول. هدي نفسك وماتشيلش هم، أنا جنبك وهنتخطى أي حاجة سوا.",
    emoji: '🩹'
  },
  {
    id: 'envelope-3',
    titleEn: "Open when you're happy",
    titleAr: 'لما تكون مبسوط',
    contentEn: "Enjoy every happy moment, because these are the memories worth keeping.",
    contentAr: "يا رب دايماً تكون مبسوط وضحكتك مالية الدنيا! افرح واستمتع باللحظة الحلوة دي.",
    emoji: '☀️'
  },
  {
    id: 'envelope-4',
    titleEn: "Open when you can't sleep",
    titleAr: 'لما مش عارف تنام',
    contentEn: "Don't fight your thoughts too much tonight. Tomorrow will come and feel lighter.",
    contentAr: "ما تفكرش كتير بالليل، سيب أفكارك تهدا وغمض عينك. بكره يوم جديد ولطيف.",
    emoji: '🌙'
  },
  {
    id: 'envelope-5',
    titleEn: "Open when you're lonely",
    titleAr: 'لما تحس إنك لوحدك',
    contentEn: "Even if we're far apart, someone is thinking about you and hoping you're okay.",
    contentAr: "افتكر دايماً إن فيه حد بيحبك ويفكر فيك في كل لحظة، حتى لو مش جنب بعض دلوقتي.",
    emoji: '🫂'
  },
  {
    id: 'envelope-6',
    titleEn: "Open when you're smiling",
    titleAr: 'لما تبتسم',
    contentEn: "Keep that smile for a little longer.",
    contentAr: "خلي الابتسامة دي على وشك، شكلك بيبقى أحلى كتير وإنت مبتسم.",
    emoji: '✨'
  },
  {
    id: 'envelope-7',
    titleEn: "Open when you're stressed",
    titleAr: 'لما تكون مضغوط',
    contentEn: "Take one step at a time. You don't have to solve everything today.",
    contentAr: "خدها خطوة خطوة، مش لازم تخلص كل حاجة في نفس اليوم. هدي نفسك شوية.",
    emoji: '🌿'
  },
  {
    id: 'envelope-8',
    titleEn: "Open when you need a hug",
    titleAr: 'لما تعوز حضن',
    contentEn: "If I could, I'd give you the longest hug right now.",
    contentAr: "أنا باعتلك أكبر حضن في الدنيا دلوقتي، اتخيله لحد ما نتجمع سوا!",
    emoji: '🤗'
  },
  {
    id: 'envelope-9',
    titleEn: "Open when you're overthinking",
    titleAr: 'لما تفكر زيادة عن اللزوم',
    contentEn: "Give your mind a little rest.",
    contentAr: "ريح دماغك شوية وما تكبرش المواضيع. أوقات كتير كل حاجة بتتحل بالراحة.",
    emoji: '💭'
  },
  {
    id: 'envelope-10',
    titleEn: "Open when you need motivation",
    titleAr: 'لما تشجع نفسك',
    contentEn: "Start with one small step.",
    contentAr: "ابدا بخطوة صغيرة وكل حاجة هتظبط. إنت قدها وبتقدر تعمل حاجات شاطرة جداً.",
    emoji: '💪'
  },
  {
    id: 'envelope-11',
    titleEn: "Open when you're angry",
    titleAr: 'لما تكون متعصب',
    contentEn: "Take a deep breath before making any decision.",
    contentAr: "خد نفس عميق قبل ما تقول أو تعمل أي حاجة. الهدوء دايماً بيخلينا نشوف الصح.",
    emoji: '🌊'
  },
  {
    id: 'envelope-12',
    titleEn: "Open when you're sick",
    titleAr: 'لما تكون تعبان',
    contentEn: "Rest well and take care of yourself.",
    contentAr: "ارتاح شوية واشرب حاجة دافية. جسمك محتاج راحة عشان ترجع صحتك تمام.",
    emoji: '🍵'
  },
  {
    id: 'envelope-13',
    titleEn: "Open when you're scared",
    titleAr: 'لما تكون خايف',
    contentEn: "Courage means moving forward.",
    contentAr: "عادي كلنا بنخاف أوقات، بس المهم إنك تعافر وتعدي، وأنا جنبك دايماً.",
    emoji: '🛡️'
  },
  {
    id: 'envelope-14',
    titleEn: "Open when you're proud of yourself",
    titleAr: 'لما تفخر بنفسك',
    contentEn: "Celebrate every achievement, even small ones.",
    contentAr: "انبسط بنفسك وبأي خطوة كويسة تعملها! كل حاجة بتنجزها بتفرق.",
    emoji: '🏆'
  },
  {
    id: 'envelope-15',
    titleEn: "Open when you need hope",
    titleAr: 'لما تدور على الأمل',
    contentEn: "Every sunrise brings a new start.",
    contentAr: "كل يوم جديد فيه فرصة تانية وحاجات أحسن جاية في الطريق.",
    emoji: '🌱'
  },
  {
    id: 'envelope-16',
    titleEn: "Open when it's raining",
    titleAr: 'لما الدنيا تمطر',
    contentEn: "Listen to the rain for a moment.",
    contentAr: "اسمع صوت المطر شوية واستمتع بالهدوء ده. القعدة في المطر أو ورى الشباك بتبقى رايقة.",
    emoji: '🌧️'
  },
  {
    id: 'envelope-17',
    titleEn: "Open when you see the sunset",
    titleAr: 'لما تشوف الغروب',
    contentEn: "Enjoy the peaceful view.",
    contentAr: "الغروب دايماً بيفكرنا إن نهاية اليوم ممكن تكون هادية وجميلة.",
    emoji: '🌅'
  },
  {
    id: 'envelope-18',
    titleEn: "Open when you see the stars",
    titleAr: 'لما تبص على النجوم',
    contentEn: "Look at the sky and smile.",
    contentAr: "بص للجمال ده وافتكر إننا تحت نفس السماء بنفكر في بعض.",
    emoji: '🌌'
  },
  {
    id: 'envelope-19',
    titleEn: "Open when you need to smile",
    titleAr: 'لما تعوز تضحك',
    contentEn: "Remember a funny memory.",
    contentAr: "افتكر أكتر موقف هبل يضحك حصل بيننا أو في يومنا.. يا رب تضحك من قلبك!",
    emoji: '🎈'
  },
  {
    id: 'envelope-20',
    titleEn: "Open when you need a reminder",
    titleAr: 'لما تعوز تفتكر إنك مهم',
    contentEn: "You matter and your happiness matters.",
    contentAr: "وجودك بيفرق جداً، وأحلامك وراحتك أهم حاجة.",
    emoji: '📌'
  },
  {
    id: 'envelope-21',
    titleEn: "Open when you're crying",
    titleAr: 'لما تعيط',
    contentEn: "It's okay to cry. Tears don't make you weak; they remind you that your heart is alive. Don't rush yourself to feel better. Give yourself time, and remember that every storm eventually passes.",
    contentAr: "عادي إنك تعيط وتطلع اللي جواك. العياط مش ضعف، ده معناه إن قلبك حاسس وبيحس بجد. ما تضغطش على نفسك عشان تروق بسرعة، خد وقتك وافتكر إن كل فترة صعبة وربنا بيعديها.",
    emoji: '💧'
  },
  {
    id: 'envelope-22',
    titleEn: "Open when you doubt yourself",
    titleAr: 'لما تشك في نفسك',
    contentEn: "You've already overcome things you once thought were impossible. Don't let one difficult moment convince you that you're not enough.",
    contentAr: "افتكر إنك عديت بظروف وشغلات كنت فاكرها مستحيلة ونجحت فيها. ما تخليش لحظة صعبة أو كلمة تحسسك إنك مش كفاية.. إنت شاطر ومميز جداً.",
    emoji: '✨'
  },
  {
    id: 'envelope-23',
    titleEn: "Open when you're bored",
    titleAr: 'لما تحس بالملل',
    contentEn: "Go for a walk, listen to your favorite song, watch the sunset, or simply smile for no reason. Sometimes happiness hides in the simplest moments.",
    contentAr: "انزل اتمشى شوية، شغل أكتر أغنية بتحبها، اتفرج على الغروب، أو ابتسم من غير سبب! ساعات السعادة والتغيير بيستخبوا في أبسط التفاصيل.",
    emoji: '🛹'
  },
  {
    id: 'envelope-24',
    titleEn: "Open when you're excited",
    titleAr: 'لما تكون متحمس',
    contentEn: "I hope whatever made your heart race today becomes one of your favorite memories. Enjoy every second of this feeling.",
    contentAr: "يا رب الحماس ده يفضل ماليك! أي حاجة فرحتك النهارده وخليت قلبك يدق بسرعة احتفظ بيها في ذكرياتك الحلوة واستمتع بكل ثانية.",
    emoji: '⚡'
  },
  {
    id: 'envelope-25',
    titleEn: "Open when you accomplish something",
    titleAr: 'لما تعمل إنجاز',
    contentEn: "I'm proud of you. No matter how big or small your achievement is, it deserves to be celebrated. Keep going—you've earned this moment.",
    contentAr: "أنا فخور بيك جداً! أي خطوة حلوة أو إنجاز كبر أو صغر يستاهل نفرح بيه ونحتفل. كمل يا بطل وإنت تستاهل كل خير.",
    emoji: '🎉'
  },
  {
    id: 'envelope-26',
    titleEn: "Open when you fail",
    titleAr: 'لما تتكعبل في حاجة',
    contentEn: "Failure isn't the opposite of success—it's part of the journey. Learn, stand up, and try again. I believe in you.",
    contentAr: "ما فيش حد بيتعلم من غير ما يتكعبل. الفشل ده مش نهاية السكة، دي مجرد محطة بنتعلم منها ونقوم أقوى. أنا مؤمن بيك وشايفك إدها.",
    emoji: '🕯️'
  },
  {
    id: 'envelope-27',
    titleEn: "Open when you feel lost",
    titleAr: 'لما تحس إنك تايه',
    contentEn: "You don't have to know every answer today. Sometimes life only asks you to take the next small step.",
    contentAr: "مش لازم تعرف كل الإجابات النهاردة. ساعات كل المطلوب منك إنك تاخد خطوة واحدة صغيرة بس لقدام وكل حاجة هتوضح لوحدها.",
    emoji: '🧭'
  },
  {
    id: 'envelope-28',
    titleEn: "Open when you need peace",
    titleAr: 'لما تعوز راحة بال',
    contentEn: "Turn off the noise around you for a while. Breathe slowly, close your eyes, and remind yourself that peace starts from within.",
    contentAr: "افصل عن دوشة الدنيا شوية.. خد نفس عميق، غمض عينك، وافتكر إن الهدوء والسلام بيبدأ من جواك إنت.",
    emoji: '🕊️'
  },
  {
    id: 'envelope-29',
    titleEn: "Open when you remember us",
    titleAr: 'لما تفتكرنا',
    contentEn: "Every memory we've made is a little treasure. I hope remembering us always brings warmth to your heart.",
    contentAr: "كل ذكرى عملناها سوا هي كنز غالي بجد. يا رب دايماً سيرتنا مع بعض تجيب لك الدفا والابتسامة الرايقة.",
    emoji: '📸'
  },
  {
    id: 'envelope-30',
    titleEn: "Open when you hear our song",
    titleAr: 'لما تسمع أغنيتنا',
    contentEn: "Let the music take you back to the moments that made us smile. Some songs become memories long before they become favorites.",
    contentAr: "سيب المزيكا ترجعك للحظات اللي ضحكنا فيها سوا.. فيه أغاني بتبقى ذكريات متفصلة عشاننا.",
    emoji: '🎵'
  },
  {
    id: 'envelope-31',
    titleEn: "Open when you drink coffee",
    titleAr: 'لما تشرب القهوة',
    contentEn: "Take your time with every sip. Good coffee, like good memories, should never be rushed.",
    contentAr: "استمتع ببراد القهوة وكل بق على مهلك.. القهوة الحلوة والذكريات الجميلة محتاجة مزاج وراحة بال.",
    emoji: '☕'
  },
  {
    id: 'envelope-32',
    titleEn: "Open when you're watching the moon",
    titleAr: 'لما تبص للقمر',
    contentEn: "No matter where we are, we're looking at the same moon. Let that remind you that distance can never erase connection.",
    contentAr: "مهما كانت المسافة بيننا، إحنا بنبص على نفس القمر.. وافتكر إن القلوب القريبة ما بتفرقهاش مسافات.",
    emoji: '🌕'
  },
  {
    id: 'envelope-33',
    titleEn: "Open when you're having a bad day",
    titleAr: 'لما يكون يومك مش ظابط',
    contentEn: "One bad day doesn't define your life. Tomorrow is waiting to surprise you with something better.",
    contentAr: "يوم واحد بايخ مش معناه إن حياتك كلها وحشة.. بكرة يوم جديد وممكن يفاجئك بحاجات تفتح نفسك.",
    emoji: '🧸'
  },
  {
    id: 'envelope-34',
    titleEn: "Open when you're celebrating",
    titleAr: 'لما تفرح وتحتفل',
    contentEn: "Celebrate with your whole heart. Life gives us these moments so we can remember them forever.",
    contentAr: "انبسط وافرح من قلبك! الحياة بتدينا اللحظات الحلوة دي عشان نعيشها ونفتكرها ونتبسط بيها.",
    emoji: '🥳'
  },
  {
    id: 'envelope-35',
    titleEn: "Open when you feel grateful",
    titleAr: 'لما تكون ممتن',
    contentEn: "Take a moment to notice everything that went right today. Gratitude has a quiet way of making life feel fuller.",
    contentAr: "خد ثانية افتكر فيها الحاجات الحلوة اللي حصلت معاك النهارده.. الامتنان بيخلي أبسط الحاجات تملا قلبك فرحة.",
    emoji: '🙏'
  },
  {
    id: 'envelope-36',
    titleEn: "Open when you need confidence",
    titleAr: 'لما تعوز ثقة بنفسك',
    contentEn: "Walk into the room knowing you deserve to be there. Believe in yourself before asking anyone else to.",
    contentAr: "ادخل أي مكان وإنت واثق إنك تستاهل تكون فيه وأكتر كمان.. صدق في نفسك الأول والناس كلها هتصدق فيك.",
    emoji: '💫'
  },
  {
    id: 'envelope-37',
    titleEn: "Open when you're nervous",
    titleAr: 'لما تكون متوتر',
    contentEn: "Take a slow breath. Most things that scare us become much smaller once we face them.",
    contentAr: "خد نفس هادي كدة بالراحة.. معظم الحاجات اللي بنقلق منها بتطلع أصغر بكتير أول ما بنواجهها.",
    emoji: '🌬️'
  },
  {
    id: 'envelope-38',
    titleEn: "Open when you're traveling",
    titleAr: 'لما تكون مسافر',
    contentEn: "Take lots of pictures, notice the little details, and don't forget to enjoy the journey—not just the destination.",
    contentAr: "صور كتير، وركز في التفاصيل الصغيرة، واستمتع بالطريق والقعدة مش بس بالوصول!",
    emoji: '✈️'
  },
  {
    id: 'envelope-39',
    titleEn: "Open when you can't make a decision",
    titleAr: 'لما تكون محتار في قرار',
    contentEn: "If both choices scare you a little, choose the one that helps you grow.",
    contentAr: "لو الخيارين مخوفينك شوية، اختار الخيار اللي هيخليك تكبر وتتعلم أكتر وتتطور.",
    emoji: '⚖️'
  },
  {
    id: 'envelope-40',
    titleEn: "Open when you need to remember you're loved",
    titleAr: 'لما تعوز تفتكر إنك محبوب',
    contentEn: "No matter what kind of day you're having, never forget this: you are appreciated, you are valued, and you deserve kindness—especially from yourself.",
    contentAr: "مهما كان يومك عامل إزاي، أوعى تنسى إنك شخص غالي جداً ومتقدر، وتستاهل كل حنية وحب في الدنيا.",
    emoji: '❤️'
  },
  {
    id: 'envelope-41',
    titleEn: "Open when you wake up early",
    titleAr: 'لما تصحى بدري',
    contentEn: "Good morning. I hope today surprises you with something beautiful. Start slowly, smile, drink some water, and remember that every new day is another opportunity to create memories you'll be proud of.",
    contentAr: "صباح الخير والجمال! يا رب يومك النهارده يفاجئك بحاجة تسعدك.. ابدأ بالراحة، ابتسم، واشرب قهوتك أو مايتك، وافتكر إن كل يوم فرصة جديدة.",
    emoji: '🌅'
  },
  {
    id: 'envelope-42',
    titleEn: "Open when you can't stop smiling",
    titleAr: 'لما مش عارف تبطل ابتسام',
    contentEn: "Whatever made you smile today, hold on to it. Happiness deserves to be remembered.",
    contentAr: "أي حاجة خلتك تبتسم النهارده تمسك بيها! السعادة تستاهل نعيشها ونحافظ عليها.",
    emoji: '🥰'
  },
  {
    id: 'envelope-43',
    titleEn: "Open when you miss our conversations",
    titleAr: 'لما توحشك كلامنا',
    contentEn: "Some conversations stay with us forever. I hope ours will always be among the ones that make your heart feel at home.",
    contentAr: "فيه كلام وحكايات بتفضل محفورة جوا القلوب.. يا رب دايماً كلامنا يكون هو الحاجة اللي بتطمنك وتريحك.",
    emoji: '💬'
  },
  {
    id: 'envelope-44',
    titleEn: "Open when you need to laugh",
    titleAr: 'لما تعوز تضحك',
    contentEn: "Think about the funniest thing that has ever happened to you. If you laughed just now, then this letter already did its job.",
    contentAr: "افتكر أكتر موقف هبل يضحك حصلك أو عملناه سوا.. لو ابتسمت دلوقتي يبقى الرسالة دي عملت شغلها الصح!",
    emoji: '😆'
  },
  {
    id: 'envelope-45',
    titleEn: "Open when you feel invisible",
    titleAr: 'لما تحس إن محدش حاسس بيك',
    contentEn: "You matter more than you realize. The way you speak, smile, and care about others leaves a bigger impact than you think.",
    contentAr: "إنت مهم جداً أكتر مما تتخيل.. طريقة كلامك، ضحكتك، وحنيتك على اللي حواليك بتسيب أثر كبير أوي.",
    emoji: '💎'
  },
  {
    id: 'envelope-46',
    titleEn: "Open when you're waiting for good news",
    titleAr: 'لما تكون مستني خبر حلو',
    contentEn: "Waiting is never easy, but don't let it steal today's peace. Whatever happens, you'll find a way forward.",
    contentAr: "الانتظار بيبقى صعب بس ما تخليش القلق يسرق منك راحة اليوم.. مهما كانت النتيجة، إنت بطل وهتعرف تتصرف.",
    emoji: '✉️'
  },
  {
    id: 'envelope-47',
    titleEn: "Open when you feel thankful",
    titleAr: 'لما تكون فرحان وممتن',
    contentEn: "Take a moment to appreciate how far you've come. Even the smallest blessings deserve a smile.",
    contentAr: "بص وراك وشوف عديت إزاي والمشوار اللي مشيته.. حتى أصغر النعم تستاهل نحمد ربنا عليها ونبتسم.",
    emoji: '💛'
  },
  {
    id: 'envelope-48',
    titleEn: "Open when you're standing in front of the sea",
    titleAr: 'لما تكون واقف قدام البحر',
    contentEn: "Watch the waves for a while. They remind us that even after every retreat, there is always another return.",
    contentAr: "اتفرج على الموج شوية واستمتع بريحة البحر.. الموج بيفكرنا إن بعد كل تراجع فيه رجوع ورجعة أقوى.",
    emoji: '🌊'
  },
  {
    id: 'envelope-49',
    titleEn: "Open when you're looking at old photos",
    titleAr: 'لما تتفرج على صور قديمة',
    contentEn: "Photos freeze moments, but feelings keep them alive. Smile at how much you've grown.",
    contentAr: "الصور بتمسك اللحظة، بس المشاعر هي اللي بتفضل حية.. ابتسم وشوف إنت كبرت واحلويت قد إيه.",
    emoji: '🖼️'
  },
  {
    id: 'envelope-50',
    titleEn: "Open when you need a fresh start",
    titleAr: 'لما تعوز تبدأ من جديد',
    contentEn: "You don't need a new year or a new month to begin again. Sometimes all you need is one brave decision.",
    contentAr: "مش محتاج سنة جديدة ولا شهر جديد عشان تبدأ.. كل اللي محتاجه قرار شجاع صغير ويا بخت من بدأ!",
    emoji: '🍃'
  },
  {
    id: 'envelope-51',
    titleEn: "Open when you feel like giving up",
    titleAr: 'لما تفكر تستسلم',
    contentEn: "Rest if you need to, but don't quit. The version of you in the future will be thankful that you kept going.",
    contentAr: "ارتاح لو تعبت، بس أوعى تستسلم! بكرة النسخة القادمة منك هتشكرك جداً إنك كملت وما وقفتش.",
    emoji: '⚓'
  },
  {
    id: 'envelope-52',
    titleEn: "Open when you're thinking about the future",
    titleAr: 'لما تفكر في اللي جاي',
    contentEn: "Dream big, but don't forget to enjoy where you are today. Every dream begins with today's small steps.",
    contentAr: "احلم براحتك وأعلى بطموحك، بس ما تنساش تستمتع باللحظة اللي إنت فيها النهارده.. أصل المستقبل بيبدأ من خطوات النهارده.",
    emoji: '🔮'
  },
  {
    id: 'envelope-53',
    titleEn: "Open when you're watching the sunrise",
    titleAr: 'لما تشوف شروق الشمس',
    contentEn: "Every sunrise whispers the same message: today is another chance.",
    contentAr: "كل شروق شمس بيهمسلك ونقولك: النهارده فرصة جديدة وأمل جديد، استغلها وتفاءل.",
    emoji: '🌇'
  },
  {
    id: 'envelope-54',
    titleEn: "Open when you finish a difficult task",
    titleAr: 'لما تخلص حاجة صعبة',
    contentEn: "Take a deep breath and be proud of yourself. Hard work always leaves something valuable behind.",
    contentAr: "خذ نفس عميق وافخر بنفسك أوي! التعب والمجهود الصادق دايماً بيبان وبيسيب نتيجة حلوة.",
    emoji: '🎯'
  },
  {
    id: 'envelope-55',
    titleEn: "Open when you feel misunderstood",
    titleAr: 'لما تحس إن محدش فاهمك',
    contentEn: "Not everyone will understand your journey, and that's okay. Keep being true to yourself.",
    contentAr: "مش شرط كل الناس تفهم طريقك ولا أسلوبك، وده عادي جداً.. خليك على طبيعتك وسلكك النظيف.",
    emoji: '🧩'
  },
  {
    id: 'envelope-56',
    titleEn: "Open when you're making an important decision",
    titleAr: 'لما تاخد قرار مهم',
    contentEn: "Choose the path that gives you peace, not just comfort.",
    contentAr: "اختار السكة اللي بتجيب لك راحة بال وسلام نفسي، مش بس السكة السهلة.",
    emoji: '🗺️'
  },
  {
    id: 'envelope-57',
    titleEn: "Open when you're feeling nostalgic",
    titleAr: 'لما يجيلك حنين للقديم',
    contentEn: "Memories are beautiful visitors, but don't let them stop you from creating new ones.",
    contentAr: "الذكريات ضيوف حلوة أوي، بس ما تخليهاش تعطلك عن إنك تعمل ذكريات جديدة أحلى وأحلى.",
    emoji: '📻'
  },
  {
    id: 'envelope-58',
    titleEn: "Open when you're trying something new",
    titleAr: 'لما تجرب حاجة جديدة',
    contentEn: "Every expert was once a beginner. Be patient with yourself.",
    contentAr: "كل شاطر في حاجة بدأ وهو مش عارف أي حاجة وخايف.. اصبر على نفسك وهتظبط.",
    emoji: '🚀'
  },
  {
    id: 'envelope-59',
    titleEn: "Open when you need to forgive yourself",
    titleAr: 'لما تعوز تسامح نفسك',
    contentEn: "You've made mistakes because you're human. Learn from them, then let yourself move forward.",
    contentAr: "غلطت عشان إنت إنسان مش ملاك.. اتعلم من الغلطة، وسامح نفسك، وكمل طريقك قدام.",
    emoji: '🕊️'
  },
  {
    id: 'envelope-60',
    titleEn: "Open when you simply need a reminder that everything will be okay",
    titleAr: 'لما تعوز تفتكر إن كل حاجة هتبقى تمام',
    contentEn: "Maybe today isn't perfect, and maybe tomorrow won't be either. But little by little, things find their place. Hold on to hope, keep your heart kind, and trust that brighter days are already on their way.",
    contentAr: "يمكن النهاردة مش ألطف حاجة، ويمكن بكرة برضه مش كمل، بس بالراحة ومع الوقت كل حاجة بتركب في مكانها الصح. تفاءل، وخلي قلبك أبيض، وأبشر بالأيام الجاية!",
    emoji: '💫'
  }
];

// Default editable date activities
export const defaultDateActivities: DateActivity[] = [
  { id: '1', nameEn: 'Movie', nameAr: 'مشاهدة فيلم', category: 'Entertainment' },
  { id: '2', nameEn: 'Coffee', nameAr: 'شرب قهوة', category: 'Relax' },
  { id: '3', nameEn: 'Pizza', nameAr: 'تناول بيتزا', category: 'Food' },
  { id: '4', nameEn: 'Beach', nameAr: 'الذهاب للبحر', category: 'Nature' },
  { id: '5', nameEn: 'Walk', nameAr: 'نزهة سيرًا على الأقدام', category: 'Nature' },
  { id: '6', nameEn: 'Shopping', nameAr: 'التسوق', category: 'Shopping' },
  { id: '7', nameEn: 'Game Night', nameAr: 'ليلة ألعاب', category: 'Fun' },
  { id: '8', nameEn: 'Stay Home', nameAr: 'البقاء في المنزل معًا', category: 'Cozy' }
];

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    if (typeof localStorage === 'undefined') return defaultValue;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key "${key}" to localStorage:`, error);
  }
};

// Default gallery items requested by the user
export const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'gal-init-1',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479431/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_06_22_49_%D9%85_xzxxfq.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-2',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479427/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_31_04_%D9%85_bdsx6g.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-3',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479427/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_09_17_%D9%85_ir0ltf.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-4',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479427/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_23_10_%D9%85_rd5yts.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-5',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479420/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_06_28_44_%D9%85_byylgn.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-6',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479416/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_54_27_%D9%85_c3f3vx.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-7',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479408/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_28_45_%D9%85_yd9vmn.png',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-8',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479401/IMG-20260704-WA0062_xrmn08.jpg',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-9',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479400/IMG-20260703-WA0087_vobywx.jpg',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-10',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479400/IMG-20260703-WA0081_hzyayz.jpg',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-11',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479399/IMG-20260703-WA0082_mlqlxa.jpg',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-12',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479398/IMG-20260703-WA0074_cqu8mi.jpg',
    date: '2026-07-03'
  },
  {
    id: 'gal-init-13',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784487905/IMG-20260607-WA0137_xshpnl.jpg',
    date: '2026-06-07'
  },
  // Sohila's new photos
  {
    id: 'gal-sohila-1',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490476/WhatsApp_Image_2026-07-14_at_1.54.29_AM_1_owfjl8.jpg',
    date: '2026-07-14',
    caption: 'جمال سهيلة 🌸 Sohila'
  },
  {
    id: 'gal-sohila-2',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490477/WhatsApp_Image_2026-07-14_at_1.54.29_AM_2_maetb2.jpg',
    date: '2026-07-14',
    caption: 'ابتسامة رايقة 💕 Soft Smile'
  },
  {
    id: 'gal-sohila-3',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490477/WhatsApp_Image_2026-07-14_at_1.54.29_AM_3_ungkcq.jpg',
    date: '2026-07-14',
    caption: 'شياكة وبساطة ✨ Simple Elegance'
  },
  {
    id: 'gal-sohila-4',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490480/WhatsApp_Image_2026-07-14_at_1.54.29_AM_4_lh4rog.jpg',
    date: '2026-07-14',
    caption: 'أحلى صورة 💖 Favorite Pic'
  },
  {
    id: 'gal-sohila-5',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490481/WhatsApp_Image_2026-07-14_at_1.22.32_AM_yuozdr.jpg',
    date: '2026-07-14',
    caption: 'قعدة حلوة 🥰 Good Times'
  },
  {
    id: 'gal-sohila-6',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490483/WhatsApp_Image_2026-07-14_at_1.22.33_AM_5_sgs6fy.jpg',
    date: '2026-07-14',
    caption: 'تفاصيل لطيفة 🌷 Cute Details'
  },
  {
    id: 'gal-sohila-7',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490485/WhatsApp_Image_2026-07-14_at_1.54.30_AM_1_yewlbl.jpg',
    date: '2026-07-14',
    caption: 'صورة عفوية 📸 Candid Shot'
  },
  {
    id: 'gal-sohila-8',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490486/WhatsApp_Image_2026-07-14_at_1.22.33_AM_3_qlfjp8.jpg',
    date: '2026-07-14',
    caption: 'ضحكة من القلب ☀️ Genuine Laughter'
  },
  {
    id: 'gal-sohila-9',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490488/WhatsApp_Image_2026-07-14_at_1.54.30_AM_q7dvpg.jpg',
    date: '2026-07-14',
    caption: 'يوم جميل سوا ✨ Nice Day'
  },
  {
    id: 'gal-sohila-10',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490496/WhatsApp_Image_2026-07-14_at_1.22.33_AM_1_b8agnb.jpg',
    date: '2026-07-14',
    caption: 'صورة بحبها 🌸 Lovely Frame'
  },
  // Saeed's new photos
  {
    id: 'gal-saeed-1',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490766/0_69_fjkxuf.jpg',
    date: '2026-07-14',
    caption: 'سعيد ودودي 😎 Saeed Vibe'
  },
  {
    id: 'gal-saeed-2',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490768/retouch_%D9%A2%D9%A0%D9%A2%D9%A5%D9%A0%D9%A8%D9%A2%D9%A9%D9%A0%D9%A1%D9%A2%D9%A4%D9%A0%D9%A7%D9%A6%D9%A1_qe35xj.jpg',
    date: '2026-07-14',
    caption: 'طقم جامد 🔥 Sharp Fit'
  },
  {
    id: 'gal-saeed-3',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490769/5564_kojd1v.jpg',
    date: '2026-07-14',
    caption: 'صورة في الخروجة ❤️ Outing Shot'
  },
  {
    id: 'gal-saeed-4',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490773/.4_oc9mia.jpg',
    date: '2026-07-14',
    caption: 'يوم اتبسطنا فيه ✨ Great Day'
  },
  {
    id: 'gal-saeed-5',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490775/0_12_hdnngo.jpg',
    date: '2026-07-14',
    caption: 'لحظة رايقة 💖 Chill Moment'
  },
  {
    id: 'gal-saeed-6',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490875/hjhjkjhnkjh_vjnmin.jpg',
    date: '2026-07-14',
    caption: 'ضحكة دافية 🥰 Warm Smile'
  },
  {
    id: 'gal-saeed-7',
    url: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490930/55916_piqfbr.jpg',
    date: '2026-07-14',
    caption: 'سعادة وبساطة 💫 Simple Joy'
  }
];

// Default memories requested by the user
export const defaultMemories: Memory[] = [
  {
    id: 'mem-init-1',
    date: '2026-07-03',
    title: 'اليوم ده كان جامد بجد ✨',
    content: 'الوقت بيعدي بسرعة وإحنا مع بعض، واليوم ده كان من أكتر الأيام الخفيفة واللي اتمشينا وانبسطنا فيها سوا.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479431/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_06_22_49_%D9%85_xzxxfq.png'
  },
  {
    id: 'mem-init-2',
    date: '2026-07-03',
    title: 'قعدة حلوة ❤️',
    content: 'الصورة دي من أكتر الصور اللي بحبها، كان فيها ضحك بجد وراحة بال.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479427/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_31_04_%D9%85_bdsx6g.png'
  },
  {
    id: 'mem-init-3',
    date: '2026-07-03',
    title: 'تفاصيلنا اللطيفة 🌸',
    content: 'الضحك العفوي واللحظات البسيطة هي اللي بتفضل علامة في يومنا وتخلينا نرجع من الخروجة مبسوطين.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479427/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_09_17_%D9%85_ir0ltf.png'
  },
  {
    id: 'mem-init-4',
    date: '2026-07-03',
    title: 'أحلى خروجة 🗺️',
    content: 'كل خروجة بنطلعها مع بعض بنرجع منها بمواقف كتير تفضل تضحكنا بعدين.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479427/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_23_10_%D9%85_rd5yts.png'
  },
  {
    id: 'mem-init-5',
    date: '2026-07-03',
    title: 'خطوة حلوة سوا 💫',
    content: 'ماشيين مع بعض خطوة بخطوة وبنسند بعض في كل حاجة صغيرة وكبيرة.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479420/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_06_28_44_%D9%85_byylgn.png'
  },
  {
    id: 'mem-init-6',
    date: '2026-07-03',
    title: 'ضحكة من القلب ☀️',
    content: 'ضحكتك العفوية بتغير مود اليوم كله للأحسن وتفتح النفس.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479416/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_54_27_%D9%85_c3f3vx.png'
  },
  {
    id: 'mem-init-7',
    date: '2026-07-03',
    title: 'يوم مميز 🌟',
    content: 'اليوم ده مكانش متخططله أوي بس طلع أحسن وأروق من أي خطة عملناها.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479408/ChatGPT_Image_4_%D9%8A%D9%88%D9%84%D9%8A%D9%88_2026_05_28_45_%D9%85_yd9vmn.png'
  },
  {
    id: 'mem-init-8',
    date: '2026-07-03',
    title: 'صورة للذكرى 📸',
    content: 'لقطة سريعة بالموبايل بس فيها كمية راحة وابتسامات حقيقية جداً.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479401/IMG-20260704-WA0062_xrmn08.jpg'
  },
  {
    id: 'mem-init-9',
    date: '2026-07-03',
    title: 'خروجة يوليو 🌿',
    content: 'أيام الصيف الخفيفة والقعدات الرايقة مع بعض في الهوا.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479400/IMG-20260703-WA0087_vobywx.jpg'
  },
  {
    id: 'mem-init-10',
    date: '2026-07-03',
    title: 'لحظة دافية 💞',
    content: 'أحلى حاجة إننا بنفهم بعض من غير ما نتكلم كلام كتير.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479400/IMG-20260703-WA0081_hzyayz.jpg'
  },
  {
    id: 'mem-init-11',
    date: '2026-07-03',
    title: 'حكايتنا البسيطة 📖',
    content: 'بنكتب أيامنا سوا بطريقتنا البسيطة ومن غير أي تكلف أو تصنع.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479399/IMG-20260703-WA0082_mlqlxa.jpg'
  },
  {
    id: 'mem-init-12',
    date: '2026-07-03',
    title: 'دايماً سوا ♾️',
    content: 'العلاقة الحلوة هي اللي تخليك على طبيعتك ومبسوط وانت معاها.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784479398/IMG-20260703-WA0074_cqu8mi.jpg'
  },
  {
    id: 'mem-init-13',
    date: '2026-06-07',
    title: 'ذكريات يونيو 🌸',
    content: 'يوم لطيف أوي من مذكراتنا وقعداتنا سوا.',
    imageUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784487905/IMG-20260607-WA0137_xshpnl.jpg'
  }
];

// Default video items requested by the user for Reels
export const defaultVideos: VideoItem[] = [
  {
    id: 'vid-init-1',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784481070/0555_ggk4en.mp4',
    title: 'ضحك وهزار من القلب ❤️',
    date: '2026-07-03'
  },
  {
    id: 'vid-init-2',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784480937/022_omlzqb.mp4',
    title: 'فيديو خفيف من خروجتنا ✨',
    date: '2026-07-03'
  },
  {
    id: 'vid-init-3',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784488450/VID-20260712-WA0175_trefta.mp4',
    title: 'لحظات يومية لطيفة 💖',
    date: '2026-07-12'
  },
  {
    id: 'vid-init-4',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784488526/VID-20260702-WA0052_pxszin.mp4',
    title: 'موقف يضحك سوا ✨',
    date: '2026-07-02'
  },
  {
    id: 'vid-init-5',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489119/VID-20260604-WA0053_1_bu24vl.mp4',
    title: 'يوم كان رايق أوي 🌟',
    date: '2026-06-04'
  },
  {
    id: 'vid-init-6',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489165/VID-20260710-WA0066_nreo5p.mp4',
    title: 'مستمتعين بوقتنا 💕',
    date: '2026-07-10'
  },
  {
    id: 'vid-init-7',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489177/VID-20260710-WA0069_kvxhko.mp4',
    title: 'تفاصيل بسيطة بنحبها 🌸',
    date: '2026-07-10'
  },
  {
    id: 'vid-init-8',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489197/VID-20260710-WA0009_wtlxh5.mp4',
    title: 'فيديو عفوي جداً 🥰',
    date: '2026-07-10'
  },
  {
    id: 'vid-init-9',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489257/VID-20260621-WA0004_wnjhcv.mp4',
    title: 'أوقات رايقة سوا 💗',
    date: '2026-06-21'
  },
  {
    id: 'vid-init-10',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489263/VID-20260628-WA0062_x7bgs4.mp4',
    title: 'حركات وشقاوة 🗺️',
    date: '2026-06-28'
  },
  {
    id: 'vid-init-11',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489284/VID-20260627-WA0189_ayuelp.mp4',
    title: 'أيام ما تتنسيش ⏳',
    date: '2026-06-27'
  },
  {
    id: 'vid-init-12',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489306/VID-20260628-WA0063_alnnqa.mp4',
    title: 'نظرة وابتسامة حلوة 😍',
    date: '2026-06-28'
  },
  {
    id: 'vid-init-13',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489450/VID-20260618-WA0185_1_ulyois.mp4',
    title: 'ضحكة نورت المكان ☀️',
    date: '2026-06-18'
  },
  {
    id: 'vid-init-14',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489459/VID-20260626-WA0232_xn5wdt.mp4',
    title: 'أغنية بنحبها 🎵',
    date: '2026-06-26'
  },
  {
    id: 'vid-init-15',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784489647/VID-20260627-WA0180_bbbdis.mp4',
    title: 'فيديو ذكريات جامد ♾️',
    date: '2026-06-27'
  }
];

export const defaultSongs: Song[] = [
  {
    id: 'song-1',
    title: 'زي ما انا مونامور',
    artist: 'زياد ظاظا',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784491739/rOpTvw3yD1g_bvqjj1.webm',
    coverUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490476/WhatsApp_Image_2026-07-14_at_1.54.29_AM_1_owfjl8.jpg'
  },
  {
    id: 'song-2',
    title: 'نور عيني',
    artist: 'ويجز - حمود السمه',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784491872/0w9MylneTso_yzp3gd.mp4',
    coverUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490481/WhatsApp_Image_2026-07-14_at_1.22.32_AM_yuozdr.jpg'
  },
  {
    id: 'song-3',
    title: 'مشكلة',
    artist: 'ويجز',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784491879/6emT5atuSM4_uwbijt.mp4',
    coverUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490768/retouch_%D9%A2%D9%A0%D9%A2%D9%A5%D9%A0%D9%A8%D9%A2%D9%A9%D9%A0%D9%A1%D9%A2%D9%A4%D9%A0%D9%A7%D9%A6%D9%A1_qe35xj.jpg'
  },
  {
    id: 'song-4',
    title: 'سيبي نفسك خالص',
    artist: 'ليجي سي',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784492145/H38-fCMuwSY_pw54mc.webm',
    coverUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490477/WhatsApp_Image_2026-07-14_at_1.54.29_AM_3_ungkcq.jpg'
  },
  {
    id: 'song-5',
    title: 'ازاي بعيش',
    artist: 'خالد علي',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784492278/KgTMfQwj44s_afzoyo.webm',
    coverUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490769/5564_kojd1v.jpg'
  },
  {
    id: 'song-6',
    title: 'يا حلوة بالليل',
    artist: 'ديزي توسكيني',
    url: 'https://res.cloudinary.com/utefkiln/video/upload/v1784492287/JATTfBixM6U_ci5w1k.webm',
    coverUrl: 'https://res.cloudinary.com/utefkiln/image/upload/v1784490485/WhatsApp_Image_2026-07-14_at_1.54.30_AM_1_yewlbl.jpg'
  }
];

// Master Data Store
export class DataStore {
  private static postSharedUpdate(key: string, data: any, activity?: any): void {
    try {
      if (typeof window === 'undefined') return;
      const sender = (typeof localStorage !== 'undefined' && localStorage.getItem('user_role')) || 'Dodo';
      fetch('/api/shared/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data, sender, activity })
      }).catch(err => console.error('Error posting shared update:', err));
    } catch (e) {
      console.error('Error sending shared update:', e);
    }
  }

  static syncFromRemote(serverState: any): void {
    if (!serverState) return;

    let updatedAny = false;

    const syncItem = (storageKey: string, remoteData: any) => {
      if (remoteData !== undefined && remoteData !== null) {
        const currentStr = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
        const newStr = JSON.stringify(remoteData);
        if (currentStr !== newStr) {
          saveToStorage(storageKey, remoteData);
          updatedAny = true;
        }
      }
    };

    syncItem('saeed_profile', serverState.saeedProfile);
    syncItem('sohila_profile', serverState.sohilaProfile);
    syncItem('knowledge_base', serverState.knowledgeBase);
    syncItem('knowledge_quiz_scores', serverState.knowledgeQuizScores);
    syncItem('memories', serverState.memories);
    syncItem('gallery_items', serverState.galleryItems);
    syncItem('video_items', serverState.videoItems);
    syncItem('songs', serverState.songs);
    syncItem('quotes', serverState.quotes);
    syncItem('envelopes', serverState.envelopes);
    syncItem('daily_questions', serverState.dailyQuestions);
    syncItem('quiz_questions', serverState.quizQuestions);
    syncItem('voice_messages', serverState.voiceMessages);
    syncItem('date_activities', serverState.dateActivities);

    if (updatedAny && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('datastore_synced'));
    }
  }

  static getSaeedProfile(): Profile {
    const p = loadFromStorage('saeed_profile', defaultSaeedProfile);
    return {
      ...defaultSaeedProfile,
      ...p,
      bio: p.bio || defaultSaeedProfile.bio,
      zodiac: p.zodiac || defaultSaeedProfile.zodiac,
      favoriteSong: p.favoriteSong || defaultSaeedProfile.favoriteSong,
      loveLanguage: p.loveLanguage || defaultSaeedProfile.loveLanguage,
      customFields: (p.customFields && p.customFields.length > 0) ? p.customFields : defaultSaeedProfile.customFields
    };
  }

  static saveSaeedProfile(profile: Profile, activity?: any): void {
    saveToStorage('saeed_profile', profile);
    this.postSharedUpdate('saeedProfile', profile, activity || {
      type: 'buzz',
      titleAr: 'تحديث بروفايل سعيد 👤',
      titleEn: "Updated Saeed's Profile 👤",
      descAr: 'تم تحديث البيانات الشخصية لسعيد بنجاح.',
      descEn: "Saeed's profile details were updated."
    });
  }

  static getSohilaProfile(): Profile {
    const p = loadFromStorage('sohila_profile', defaultSohilaProfile);
    return {
      ...defaultSohilaProfile,
      ...p,
      bio: p.bio || defaultSohilaProfile.bio,
      zodiac: p.zodiac || defaultSohilaProfile.zodiac,
      favoriteSong: p.favoriteSong || defaultSohilaProfile.favoriteSong,
      loveLanguage: p.loveLanguage || defaultSohilaProfile.loveLanguage,
      customFields: (p.customFields && p.customFields.length > 0) ? p.customFields : defaultSohilaProfile.customFields
    };
  }

  static saveSohilaProfile(profile: Profile, activity?: any): void {
    saveToStorage('sohila_profile', profile);
    this.postSharedUpdate('sohilaProfile', profile, activity || {
      type: 'buzz',
      titleAr: 'تحديث بروفايل سهيلة 👤',
      titleEn: "Updated Sohila's Profile 👤",
      descAr: 'تم تحديث البيانات الشخصية لسهيلة بنجاح.',
      descEn: "Sohila's profile details were updated."
    });
  }

  static getKnowledgeBase(): KnowledgeBaseMap {
    const stored = loadFromStorage<KnowledgeBaseMap>('knowledge_base', defaultKnowledgeBase);
    if (!stored || !stored.Dodo || !stored.SO) {
      return {
        Dodo: { ...defaultKnowledgeBase.Dodo, ...(stored?.Dodo || {}) },
        SO: { ...defaultKnowledgeBase.SO, ...(stored?.SO || {}) }
      };
    }
    return {
      Dodo: { ...defaultKnowledgeBase.Dodo, ...stored.Dodo },
      SO: { ...defaultKnowledgeBase.SO, ...stored.SO }
    };
  }

  static saveKnowledgeBase(kbMap: KnowledgeBaseMap, activity?: any): void {
    saveToStorage('knowledge_base', kbMap);
    this.postSharedUpdate('knowledgeBase', kbMap, activity || {
      type: 'buzz',
      titleAr: 'تحديث قاعدة المعرفة ❤️',
      titleEn: 'Updated Knowledge Base ❤️',
      descAr: 'تم تحديث معلومات "اعرفني أكتر".',
      descEn: 'Updated "Know Me Better" information.'
    });
  }

  static getKnowledgeQuizScores(): KnowledgeQuizScoresMap {
    const stored = loadFromStorage<KnowledgeQuizScoresMap>('knowledge_quiz_scores', defaultKnowledgeQuizScores);
    return {
      Dodo: stored?.Dodo || defaultKnowledgeQuizScores.Dodo,
      SO: stored?.SO || defaultKnowledgeQuizScores.SO
    };
  }

  static saveKnowledgeQuizScore(role: UserRole, total: number, correct: number, activity?: any): void {
    const current = this.getKnowledgeQuizScores();
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const updated: KnowledgeQuizScoresMap = {
      ...current,
      [role]: {
        totalQuestions: total,
        correctAnswers: correct,
        percentage: pct,
        lastUpdated: Date.now()
      }
    };
    saveToStorage('knowledge_quiz_scores', updated);
    this.postSharedUpdate('knowledgeQuizScores', updated, activity || {
      type: 'quiz',
      titleAr: `نتيجة اختبار معرفة جديد 🧩`,
      titleEn: `New Knowledge Quiz Result 🧩`,
      descAr: `أكمل ${role === 'Dodo' ? 'سعيد' : 'سهيلة'} اختبار المعرفة وحقق نسبة ${pct}%!`,
      descEn: `${role} completed a knowledge quiz with ${pct}%!`
    });
  }

  static getMemories(): Memory[] {
    const stored = loadFromStorage<Memory[]>('memories', defaultMemories);
    const items = (!stored || stored.length === 0) ? defaultMemories : stored;
    const unique: Memory[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || !item.imageUrl || item.imageUrl.trim() === '') {
        continue;
      }
      let id = item?.id ? item.id : `mem-init-${i + 1}`;
      if (seen.has(id)) {
        id = `${id}-${i}`;
      }
      seen.add(id);
      unique.push({ ...item, id });
    }
    return unique;
  }

  static saveMemories(memories: Memory[], activity?: any): void {
    const validMemories = (memories || []).filter((m) => m && m.imageUrl && m.imageUrl.trim() !== '');
    saveToStorage('memories', validMemories);
    this.postSharedUpdate('memories', validMemories, activity || {
      type: 'buzz',
      titleAr: 'تحديث قسم الذكريات 🌸',
      titleEn: 'Updated Memories 🌸',
      descAr: 'تم تحديث الذكريات المشتركة.',
      descEn: 'Shared memories list was updated.'
    });
  }

  static getGallery(): GalleryItem[] {
    const stored = loadFromStorage<GalleryItem[]>('gallery_items', defaultGalleryItems);
    const items = (!stored || stored.length === 0) ? defaultGalleryItems : stored;
    const unique: GalleryItem[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let id = item?.id ? item.id : `gal-init-${i + 1}`;
      if (seen.has(id)) {
        id = `${id}-${i}`;
      }
      seen.add(id);
      unique.push({ ...item, id });
    }
    return unique;
  }

  static saveGallery(items: GalleryItem[], activity?: any): void {
    saveToStorage('gallery_items', items);
    this.postSharedUpdate('galleryItems', items, activity || {
      type: 'buzz',
      titleAr: 'تحديث معرض الصور 📸',
      titleEn: 'Updated Gallery 📸',
      descAr: 'تم تحديث معرض الصور المشترك.',
      descEn: 'Shared photo gallery was updated.'
    });
  }

  static getVideos(): VideoItem[] {
    const stored = loadFromStorage<VideoItem[]>('video_items', defaultVideos);
    const items = (!stored || stored.length === 0) ? defaultVideos : stored;
    const unique: VideoItem[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let id = item?.id ? item.id : `vid-init-${i + 1}`;
      if (seen.has(id)) {
        id = `${id}-${i}`;
      }
      seen.add(id);
      unique.push({ ...item, id });
    }
    return unique;
  }

  static saveVideos(items: VideoItem[], activity?: any): void {
    saveToStorage('video_items', items);
    this.postSharedUpdate('videoItems', items, activity || {
      type: 'buzz',
      titleAr: 'تحديث ريلز الفيديو 🎥',
      titleEn: 'Updated Video Reels 🎥',
      descAr: 'تم تحديث مقاطع الفيديو المشتركة.',
      descEn: 'Shared video reels were updated.'
    });
  }

  static getSongs(): Song[] {
    const stored = loadFromStorage<Song[]>('songs', defaultSongs);
    const items = (!stored || stored.length === 0) ? defaultSongs : stored;
    const unique: Song[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let id = item?.id ? item.id : `song-init-${i + 1}`;
      if (seen.has(id)) {
        id = `${id}-${i}`;
      }
      seen.add(id);
      unique.push({ ...item, id });
    }
    return unique;
  }

  static saveSongs(songs: Song[], activity?: any): void {
    saveToStorage('songs', songs);
    this.postSharedUpdate('songs', songs, activity || {
      type: 'buzz',
      titleAr: 'تحديث قائمة الأغاني 🎵',
      titleEn: 'Updated Songs 🎵',
      descAr: 'تم تحديث قائمة الأغاني المشتركة.',
      descEn: 'Shared song playlist was updated.'
    });
  }

  static getQuotes(): Quote[] {
    const stored = loadFromStorage<Quote[]>('quotes', []);
    const unique: Quote[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < stored.length; i++) {
      const item = stored[i];
      let id = item?.id ? item.id : `quote-init-${i + 1}`;
      if (seen.has(id)) {
        id = `${id}-${i}`;
      }
      seen.add(id);
      unique.push({ ...item, id });
    }
    return unique;
  }

  static saveQuotes(quotes: Quote[], activity?: any): void {
    saveToStorage('quotes', quotes);
    this.postSharedUpdate('quotes', quotes, activity || {
      type: 'buzz',
      titleAr: 'تحديث الاقتباسات 💬',
      titleEn: 'Updated Quotes 💬',
      descAr: 'تم تحديث الاقتباسات المشتركة.',
      descEn: 'Shared quotes list was updated.'
    });
  }

  static getEnvelopes(): Envelope[] {
    const stored = loadFromStorage<Envelope[]>('envelopes', []);
    // Clean up old empty templates if present
    const cleaned = stored.filter(e => !['miss-me', 'sad', 'happy', 'graduation', 'one-year'].includes(e.id) || e.contentEn || e.contentAr);
    
    let updated = [...cleaned];
    let changed = stored.length !== cleaned.length;

    defaultEnvelopes.forEach(defEnv => {
      const existingIdx = updated.findIndex(e => e.id === defEnv.id);
      if (existingIdx === -1) {
        updated.push(defEnv);
        changed = true;
      }
    });

    if (changed || stored.length === 0) {
      saveToStorage('envelopes', updated);
    }
    return updated;
  }

  static saveEnvelopes(envelopes: Envelope[], activity?: any): void {
    saveToStorage('envelopes', envelopes);
    this.postSharedUpdate('envelopes', envelopes, activity || {
      type: 'buzz',
      titleAr: 'تحديث خطابات افتح عندما 💌',
      titleEn: 'Updated Envelopes 💌',
      descAr: 'تم تحديث الخطابات المشتركة.',
      descEn: 'Shared envelopes were updated.'
    });
  }

  static getDailyQuestions(): DailyQuestion[] {
    const stored = loadFromStorage<DailyQuestion[]>('daily_questions', []);
    const defaults = getDefaultDailyQuestions();
    
    const merged: DailyQuestion[] = [...stored];
    let changed = false;

    defaults.forEach(defQ => {
      const existingIdx = merged.findIndex(q => q.id === defQ.id);
      if (existingIdx === -1) {
        const duplicateIdx = merged.findIndex(q => q.dateStr === defQ.dateStr && q.questionEn === defQ.questionEn);
        if (duplicateIdx !== -1) {
          merged[duplicateIdx] = {
            ...defQ,
            answerDodo: merged[duplicateIdx].answerDodo,
            answerSO: merged[duplicateIdx].answerSO
          };
        } else {
          merged.push(defQ);
        }
        changed = true;
      } else {
        const existing = merged[existingIdx];
        if (existing.questionEn !== defQ.questionEn || existing.questionAr !== defQ.questionAr || existing.dateStr !== defQ.dateStr) {
          merged[existingIdx] = {
            ...existing,
            questionEn: defQ.questionEn,
            questionAr: defQ.questionAr,
            dateStr: defQ.dateStr
          };
          changed = true;
        }
      }
    });

    merged.sort((a, b) => a.dateStr.localeCompare(b.dateStr));

    if (changed || stored.length === 0) {
      saveToStorage('daily_questions', merged);
    }

    return merged;
  }

  static saveDailyQuestions(questions: DailyQuestion[], activity?: any): void {
    saveToStorage('daily_questions', questions);
    this.postSharedUpdate('dailyQuestions', questions, activity || {
      type: 'daily_question',
      titleAr: 'تحديث أسئلة اليوم ❓',
      titleEn: 'Updated Daily Questions ❓',
      descAr: 'تم تحديث إجابات/أسئلة اليوم المشتركة.',
      descEn: 'Shared daily questions/answers were updated.'
    });
  }

  static getQuizQuestions(): QuizQuestion[] {
    return loadFromStorage('quiz_questions', []);
  }

  static saveQuizQuestions(questions: QuizQuestion[], activity?: any): void {
    saveToStorage('quiz_questions', questions);
    this.postSharedUpdate('quizQuestions', questions, activity || {
      type: 'quiz',
      titleAr: 'تحديث اختبار الحب 🧩',
      titleEn: 'Updated Quiz Questions 🧩',
      descAr: 'تم تحديث اختبار الحب المشترك.',
      descEn: 'Shared quiz questions were updated.'
    });
  }

  static getVoiceMessages(): VoiceMessage[] {
    return loadFromStorage('voice_messages', []);
  }

  static saveVoiceMessages(messages: VoiceMessage[], activity?: any): void {
    saveToStorage('voice_messages', messages);
    this.postSharedUpdate('voiceMessages', messages, activity || {
      type: 'buzz',
      titleAr: 'تحديث التسجيلات الصوتية 🎙️',
      titleEn: 'Updated Voice Notes 🎙️',
      descAr: 'تم تحديث التسجيلات الصوتية المشتركة.',
      descEn: 'Shared voice notes were updated.'
    });
  }

  static getDateActivities(): DateActivity[] {
    return loadFromStorage('date_activities', defaultDateActivities);
  }

  static saveDateActivities(activities: DateActivity[], activity?: any): void {
    saveToStorage('date_activities', activities);
    this.postSharedUpdate('dateActivities', activities, activity || {
      type: 'wheel_spin',
      titleAr: 'تحديث خيارات العجلة 🎡',
      titleEn: 'Updated Wheel Options 🎡',
      descAr: 'تم تحديث خيارات عجلة القرارات المشتركة.',
      descEn: 'Shared wheel activities were updated.'
    });
  }
}
