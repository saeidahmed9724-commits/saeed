import { DailyQuestion } from './types';

const rawQuestions = [
  {
    questionAr: "لو كان عندنا يوم كامل بدون أي مسؤوليات، تحب نعمل إيه؟",
    questionEn: "If we had one whole day with no responsibilities, how would you like us to spend it?"
  },
  {
    questionAr: "إيه أكتر حاجة خلتك تبتسم النهارده؟",
    questionEn: "What made you smile the most today?"
  },
  {
    questionAr: "لو تقدر ترجع تعيش يوم واحد من حياتك تاني، هيكون أي يوم؟",
    questionEn: "If you could relive one day of your life, which day would it be?"
  },
  {
    questionAr: "إيه أكتر مكان نفسك نزوره مع بعض؟",
    questionEn: "What's the one place you dream of visiting together?"
  },
  {
    questionAr: "إيه أكتر أكلة نفسك ناكلها مع بعض قريب؟",
    questionEn: "What's one meal you'd love for us to have together soon?"
  },
  {
    questionAr: "إيه أكتر صفة بتحبها فيا؟",
    questionEn: "What's your favorite quality about me?"
  },
  {
    questionAr: "إيه أكتر ذكرى بتضحكك كل ما تفتكرها؟",
    questionEn: "What's the funniest memory that always makes you laugh?"
  },
  {
    questionAr: "إيه أغنية بتحس إنها شبهنا؟",
    questionEn: "Which song reminds you of us?"
  },
  {
    questionAr: "لو نقدر نسافر بكرة، هنروح فين؟",
    questionEn: "If we could travel tomorrow, where would we go?"
  },
  {
    questionAr: "إيه أكتر حلم نفسك تحققه؟",
    questionEn: "What's your biggest dream?"
  },
  {
    questionAr: "إيه الحاجة اللي نفسك تتعلمها؟",
    questionEn: "What's something you've always wanted to learn?"
  },
  {
    questionAr: "إيه أكتر فيلم ممكن تتفرج عليه ألف مرة؟",
    questionEn: "What's one movie you could watch forever?"
  },
  {
    questionAr: "لو كسبنا مليون دولار، أول حاجة هنعملها إيه؟",
    questionEn: "If we won a million dollars, what's the first thing we'd do?"
  },
  {
    questionAr: "إيه أكتر عادة حابب تغيرها؟",
    questionEn: "What's one habit you'd like to change?"
  },
  {
    questionAr: "إيه أكتر حاجة بتخليك تحس بالراحة؟",
    questionEn: "What makes you feel the most peaceful?"
  },
  {
    questionAr: "إيه أكتر حاجة بتخوفك؟",
    questionEn: "What's one thing that scares you?"
  },
  {
    questionAr: "لو عندك قوة خارقة، هتختار إيه؟",
    questionEn: "If you had a superpower, what would it be?"
  },
  {
    questionAr: "إيه أكتر فصل بتحبه؟ وليه؟",
    questionEn: "What's your favorite season and why?"
  },
  {
    questionAr: "إيه أكتر هدية نفسك تجيلك؟",
    questionEn: "What's your dream gift?"
  },
  {
    questionAr: "لو هنقضي يوم كامل في البيت، هنعمله إزاي؟",
    questionEn: "If we stayed home all day, how would we spend it?"
  },
  {
    questionAr: "إيه أكتر حاجة ممتن ليها النهارده؟",
    questionEn: "What are you most grateful for today?"
  },
  {
    questionAr: "إيه أكتر كلمة بتحب تسمعها؟",
    questionEn: "What's your favorite word to hear?"
  },
  {
    questionAr: "إيه أكتر موقف خلاك فخور بنفسك؟",
    questionEn: "What's a moment that made you proud of yourself?"
  },
  {
    questionAr: "لو تقدر تحقق أمنية واحدة، هتكون إيه؟",
    questionEn: "If you had one wish, what would it be?"
  },
  {
    questionAr: "إيه أكتر رياضة نفسك تجربها؟",
    questionEn: "What's a sport you'd love to try?"
  },
  {
    questionAr: "إيه أكتر لون بتحبه؟ وليه؟",
    questionEn: "What's your favorite color and why?"
  },
  {
    questionAr: "إيه أكتر عادة صغيرة بتخلي يومك أحسن؟",
    questionEn: "What's a small habit that makes your day better?"
  },
  {
    questionAr: "إيه أكتر شخصية خيالية شبهك؟",
    questionEn: "Which fictional character do you relate to the most?"
  },
  {
    questionAr: "لو تقدر توصف علاقتنا في ثلاث كلمات، هتقول إيه؟",
    questionEn: "If you had to describe our relationship in three words, what would they be?"
  },
  {
    questionAr: "إيه الحاجة اللي نفسك نحققها مع بعض خلال السنة دي؟",
    questionEn: "What's one goal you'd love for us to achieve together this year?"
  },
  {
    questionAr: "لو كان لازم نوصف علاقتنا بفيلم، هيكون إيه؟",
    questionEn: "If our relationship were a movie, which one would it be?"
  },
  {
    questionAr: "إيه أكتر عادة صغيرة بتحبها فيا؟",
    questionEn: "What's a little habit of mine that you secretly love?"
  },
  {
    questionAr: "لو هنطبخ مع بعض، هنعمل إيه؟",
    questionEn: "If we cooked together today, what would we make?"
  },
  {
    questionAr: "إيه أكتر مكان بتحس فيه بالراحة؟",
    questionEn: "Where do you feel the most at peace?"
  },
  {
    questionAr: "لو عندك ساعة إضافية كل يوم، هتستغلها في إيه؟",
    questionEn: "If you had one extra hour every day, how would you spend it?"
  },
  {
    questionAr: "إيه أكتر حاجة نفسك تجربها لأول مرة؟",
    questionEn: "What's something you've always wanted to experience for the first time?"
  },
  {
    questionAr: "لو نقدر نعيش في أي دولة لمدة سنة، هتختار فين؟",
    questionEn: "If we could live in any country for a year, where would you choose?"
  },
  {
    questionAr: "إيه أكتر ريحة بتحبها؟",
    questionEn: "What's your favorite smell?"
  },
  {
    questionAr: "إيه أكتر حاجة بتخليك تضحك من قلبك؟",
    questionEn: "What always makes you laugh out loud?"
  },
  {
    questionAr: "لو تقدر ترسل رسالة لنفسك قبل خمس سنين، هتقول إيه؟",
    questionEn: "If you could send a message to yourself five years ago, what would it say?"
  },
  {
    questionAr: "إيه أكتر إنجاز نفسك تحققه قبل نهاية السنة؟",
    questionEn: "What's one achievement you want before the end of this year?"
  },
  {
    questionAr: "إيه أكتر عادة نفسك نعملها مع بعض كل أسبوع؟",
    questionEn: "What's one habit you'd like us to do together every week?"
  },
  {
    questionAr: "لو هنسافر من غير تخطيط، هتوافق؟ وليه؟",
    questionEn: "Would you go on a completely unplanned trip? Why?"
  },
  {
    questionAr: "إيه أكتر ذكرى بتحب ترجع تعيشها؟",
    questionEn: "Which memory would you relive if you could?"
  },
  {
    questionAr: "إيه أكتر أكلة بتفكرك بطفولتك؟",
    questionEn: "Which food reminds you of your childhood?"
  },
  {
    questionAr: "لو لازم تسمع أغنية واحدة لمدة أسبوع، هتختار إيه؟",
    questionEn: "If you could only listen to one song for a week, what would it be?"
  },
  {
    questionAr: "إيه أكتر حاجة نفسك أعملها عشان أفرحك؟",
    questionEn: "What's one thing you'd love me to do to make you happy?"
  },
  {
    questionAr: "إيه أكتر يوم مستنيه بفارغ الصبر؟",
    questionEn: "Which day are you looking forward to the most?"
  },
  {
    questionAr: "إيه أكتر مهارة نفسك تتقنها؟",
    questionEn: "What's one skill you wish you could master?"
  },
  {
    questionAr: "لو عندك يوم إجازة مفاجئ، هتقضيه إزاي؟",
    questionEn: "If you suddenly had a free day, how would you spend it?"
  },
  {
    questionAr: "إيه أكتر حاجة بتديك طاقة إيجابية؟",
    questionEn: "What gives you the most positive energy?"
  },
  {
    questionAr: "لو هنبدأ هواية جديدة مع بعض، هتختار إيه؟",
    questionEn: "If we started a new hobby together, what would it be?"
  },
  {
    questionAr: "إيه أكتر كتاب أو قصة أثرت فيك؟",
    questionEn: "What's a book or story that changed you?"
  },
  {
    questionAr: "إيه أكتر عادة صحية نفسك تحافظ عليها؟",
    questionEn: "What's one healthy habit you want to keep?"
  },
  {
    questionAr: "لو عندك فرصة تقابل أي شخصية في العالم، هتختار مين؟",
    questionEn: "If you could meet anyone in the world, who would it be?"
  },
  {
    questionAr: "إيه أكتر حاجة بتخليك تحس بالفخر بعيلتك؟",
    questionEn: "What makes you proud of your family?"
  },
  {
    questionAr: "لو هنقفل موبايلاتنا يوم كامل، هنقضي الوقت إزاي؟",
    questionEn: "If we turned off our phones for a whole day, how would we spend it?"
  },
  {
    questionAr: "إيه أكتر تحدي حابب تتغلب عليه؟",
    questionEn: "What's the biggest challenge you want to overcome?"
  },
  {
    questionAr: "لو معاك كاميرا ليوم واحد، إيه أول حاجة هتصورها؟",
    questionEn: "If you had a camera for one day, what would you photograph first?"
  },
  {
    questionAr: "إيه أكتر حاجة نفسك نحققها مع بعض خلال الخمس سنين الجاية؟",
    questionEn: "What's one dream you'd like us to achieve together in the next five years?"
  },
  {
    questionAr: "إيه أكتر حاجة نفسك نتعلمها مع بعض؟",
    questionEn: "What's one thing you'd love for us to learn together?"
  },
  {
    questionAr: "لو هنعيش يوم كامل في فيلم، هتختار فيلم إيه؟",
    questionEn: "If we could live inside a movie for one day, which movie would you choose?"
  },
  {
    questionAr: "إيه أكتر لحظة بسيطة خلت يومك أحسن؟",
    questionEn: "What's a small moment that made your day better?"
  },
  {
    questionAr: "لو هنعمل قائمة أمنيات جديدة، إيه أول حاجة هتكتبها؟",
    questionEn: "If we made a new bucket list, what would be the first thing on it?"
  },
  {
    questionAr: "إيه أكتر حاجة بتحب تعملها في يوم الإجازة؟",
    questionEn: "What's your favorite way to spend a day off?"
  },
  {
    questionAr: "لو تقدر تتقن أي لغة فورًا، هتختار إيه？",
    questionEn: "If you could instantly master any language, which one would you choose?"
  },
  {
    questionAr: "إيه أكتر حاجة بتخليك تفتخر بنفسك؟",
    questionEn: "What makes you feel most proud of yourself?"
  },
  {
    questionAr: "لو هنقضي ليلة تحت النجوم، إيه أول حاجة هنتكلم عنها؟",
    questionEn: "If we spent a night under the stars, what would be our first conversation?"
  },
  {
    questionAr: "إيه أكتر مكان نفسك تزوره في مصر؟",
    questionEn: "What's one place in Egypt you'd love to visit?"
  },
  {
    questionAr: "لو عندك فرصة تبدأ مشروع، هيكون عن إيه؟",
    questionEn: "If you could start a business, what would it be about?"
  },
  {
    questionAr: "إيه أكتر صفة نفسك الناس تفتكرك بيها؟",
    questionEn: "What's one quality you'd like people to remember you for?"
  },
  {
    questionAr: "لو لازم تاكل أكلة واحدة لمدة أسبوع، هتختار إيه؟",
    questionEn: "If you had to eat one meal for a week, what would it be?"
  },
  {
    questionAr: "إيه أكتر تطبيق بتستخدمه في موبايلك؟ وليه؟",
    questionEn: "What's the app you use the most, and why?"
  },
  {
    questionAr: "لو هنهرب من الزحمة ليوم واحد، هنروح فين؟",
    questionEn: "If we escaped the busy world for one day, where would we go?"
  },
  {
    questionAr: "إيه أكتر إنجاز عملته ولسه فخور بيه؟",
    questionEn: "What's an achievement you're still proud of?"
  },
  {
    questionAr: "لو عندك آلة زمن، هتسافر للماضي ولا المستقبل؟",
    questionEn: "If you had a time machine, would you travel to the past or the future?"
  },
  {
    questionAr: "إيه أكتر عادة يومية مستحيل تستغنى عنها؟",
    questionEn: "What's one daily habit you can't live without?"
  },
  {
    questionAr: "إيه أكتر مكان بتحب تشوف فيه الغروب؟",
    questionEn: "Where's your favorite place to watch the sunset?"
  },
  {
    questionAr: "لو عندك يوم بدون إنترنت، هتعمل إيه؟",
    questionEn: "If you had a day without the internet, how would you spend it?"
  },
  {
    questionAr: "إيه أكتر حاجة نفسك تحقيقها قبل عيد ميلادك الجاي؟",
    questionEn: "What's one goal you want to achieve before your next birthday?"
  },
  {
    questionAr: "لو تقدر تختار موهبة جديدة، هتختار إيه؟",
    questionEn: "If you could instantly gain one talent, what would it be?"
  },
  {
    questionAr: "إيه أكتر ذكرى من المدرسة لسه فاكرها؟",
    questionEn: "What's one school memory you'll never forget?"
  },
  {
    questionAr: "لو هنتفرج على مسلسل مع بعض، تختار إيه؟",
    questionEn: "If we started a TV series together, what would you pick?"
  },
  {
    questionAr: "إيه أكتر صوت بتحب تسمعه؟",
    questionEn: "What's your favorite sound in the world?"
  },
  {
    questionAr: "لو عندك فرصة تساعد شخص واحد، مين هيكون؟",
    questionEn: "If you could help one person today, who would it be?"
  },
  {
    questionAr: "إيه أكتر قرار غيّر حياتك؟",
    questionEn: "What's one decision that changed your life?"
  },
  {
    questionAr: "لو هنصور فيديو يفضل معانا للأبد، هيكون عن إيه؟",
    questionEn: "If we made one video to keep forever, what would it be about?"
  },
  {
    questionAr: "إيه أكتر حلم كان مستحيل وبقى حقيقة؟",
    questionEn: "What's a dream you once thought impossible that came true?"
  },
  {
    questionAr: "لو عندك فرصة تعيش يوم مثالي، احكيلي هيكون عامل إزاي؟",
    questionEn: "If you could design your perfect day, what would it look like?"
  },
  {
    questionAr: "إيه أكتر حاجة تتمنى تحصل قبل نهاية السنة؟",
    questionEn: "What's the one thing you hope happens before the end of this year?"
  }
];

export const getDefaultDailyQuestions = (): DailyQuestion[] => {
  const startDate = new Date('2026-07-01');
  return rawQuestions.map((q, index) => {
    const qDate = new Date(startDate);
    qDate.setDate(startDate.getDate() + index);
    const dateStr = qDate.toISOString().split('T')[0];
    return {
      id: `default-dq-${index + 1}`,
      dateStr,
      questionEn: q.questionEn,
      questionAr: q.questionAr
    };
  });
};
