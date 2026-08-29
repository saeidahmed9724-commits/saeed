export interface CardAttribute {
  id: string;
  emoji: string;
  labelAr: string;
  labelEn: string;
}

export interface CardSection {
  id: string;
  emoji: string;
  nameAr: string;
  nameEn: string;
  weight: number; // contribution to OVR, all sections should sum to 1
  attributes: CardAttribute[];
}

export const CARD_SECTIONS: CardSection[] = [
  {
    id: 'love',
    emoji: '❤️',
    nameAr: 'الحب',
    nameEn: 'Love',
    weight: 0.30,
    attributes: [
      { id: 'love', emoji: '❤️', labelAr: 'الحب', labelEn: 'Love' },
      { id: 'affection', emoji: '🫂', labelAr: 'الحنية', labelEn: 'Affection' },
      { id: 'embrace', emoji: '🥹', labelAr: 'الاحتواء', labelEn: 'Embrace' },
      { id: 'romance', emoji: '💌', labelAr: 'الرومانسية', labelEn: 'Romance' },
      { id: 'expression', emoji: '💗', labelAr: 'التعبير عن الحب', labelEn: 'Expressing Love' },
      { id: 'pampering', emoji: '🥰', labelAr: 'الدلع', labelEn: 'Pampering' },
      { id: 'attentiveness', emoji: '💞', labelAr: 'الاهتمام', labelEn: 'Attentiveness' }
    ]
  },
  {
    id: 'relationship',
    emoji: '🛡️',
    nameAr: 'العلاقة',
    nameEn: 'Relationship',
    weight: 0.25,
    attributes: [
      { id: 'safety', emoji: '🛡️', labelAr: 'الأمان', labelEn: 'Safety' },
      { id: 'trust', emoji: '🤝', labelAr: 'الثقة', labelEn: 'Trust' },
      { id: 'understanding', emoji: '🧠', labelAr: 'فهم الشريك', labelEn: 'Understanding' },
      { id: 'communication', emoji: '💬', labelAr: 'التواصل', labelEn: 'Communication' },
      { id: 'patience', emoji: '🧘', labelAr: 'الصبر', labelEn: 'Patience' },
      { id: 'support', emoji: '🫶', labelAr: 'الدعم', labelEn: 'Support' },
      { id: 'problem-solving', emoji: '🧩', labelAr: 'حل المشاكل', labelEn: 'Problem Solving' }
    ]
  },
  {
    id: 'vibe',
    emoji: '😂',
    nameAr: 'الشخصية والجو',
    nameEn: 'Vibe',
    weight: 0.15,
    attributes: [
      { id: 'humor', emoji: '😂', labelAr: 'خفة الدم', labelEn: 'Humor' },
      { id: 'goofiness', emoji: '😈', labelAr: 'الرخامة', labelEn: 'Goofiness' },
      { id: 'craziness', emoji: '🤪', labelAr: 'الجنون', labelEn: 'Craziness' },
      { id: 'spontaneity', emoji: '✨', labelAr: 'العفوية', labelEn: 'Spontaneity' },
      { id: 'energy', emoji: '🔥', labelAr: 'الطاقة', labelEn: 'Energy' },
      { id: 'talkativeness', emoji: '🗣️', labelAr: 'الرغي', labelEn: 'Talkativeness' },
      { id: 'curiosity', emoji: '👀', labelAr: 'الفضول', labelEn: 'Curiosity' }
    ]
  },
  {
    id: 'personality',
    emoji: '🧠',
    nameAr: 'الشخصية',
    nameEn: 'Personality',
    weight: 0.10,
    attributes: [
      { id: 'intelligence', emoji: '🧠', labelAr: 'الذكاء', labelEn: 'Intelligence' },
      { id: 'focus', emoji: '🎯', labelAr: 'التركيز', labelEn: 'Focus' },
      { id: 'calmness', emoji: '🧘', labelAr: 'الهدوء', labelEn: 'Calmness' },
      { id: 'strength', emoji: '💪', labelAr: 'القوة الشخصية', labelEn: 'Personal Strength' },
      { id: 'wisdom', emoji: '🪷', labelAr: 'الحكمة', labelEn: 'Wisdom' },
      { id: 'creativity', emoji: '🎨', labelAr: 'الإبداع', labelEn: 'Creativity' },
      { id: 'responsibility', emoji: '🧭', labelAr: 'المسؤولية', labelEn: 'Responsibility' }
    ]
  },
  {
    id: 'danger',
    emoji: '😏',
    nameAr: 'الجانب الخطير 😂',
    nameEn: 'Danger Zone 😂',
    weight: 0.05,
    attributes: [
      { id: 'jealousy', emoji: '🔥', labelAr: 'الغيرة', labelEn: 'Jealousy' },
      { id: 'stubbornness', emoji: '😤', labelAr: 'العند', labelEn: 'Stubbornness' },
      { id: 'moodiness', emoji: '🙄', labelAr: 'الزعل', labelEn: 'Moodiness' },
      { id: 'teasing', emoji: '😈', labelAr: 'الاستفزاز', labelEn: 'Teasing' },
      { id: 'investigation', emoji: '🕵️', labelAr: 'التحقيق', labelEn: 'Investigation' },
      { id: 'coldness', emoji: '🧊', labelAr: 'البرود وقت الخناق', labelEn: 'Coldness in Fights' },
      { id: 'silliness-when-mad', emoji: '💀', labelAr: 'الرخامة وقت الزعل', labelEn: 'Silliness When Mad' }
    ]
  },
  {
    id: 'special',
    emoji: '💎',
    nameAr: 'حاجات خاصة',
    nameEn: 'Special',
    weight: 0.15,
    attributes: [
      { id: 'heart-melting', emoji: '🥹', labelAr: 'القدرة على تذويب القلب', labelEn: 'Heart Melting Power' },
      { id: 'knowing-partner', emoji: '👀', labelAr: 'معرفة الشريك', labelEn: 'Knowing the Partner' },
      { id: 'hug-quality', emoji: '🫂', labelAr: 'جودة الحضن', labelEn: 'Hug Quality' },
      { id: 'mood-changer', emoji: '😂', labelAr: 'القدرة على تغيير المود', labelEn: 'Mood Changing Power' },
      { id: 'late-night-talks', emoji: '🌙', labelAr: 'كلام آخر الليل', labelEn: 'Late Night Talks' },
      { id: 'photo-quality', emoji: '📸', labelAr: 'جودة الصور سوا', labelEn: 'Photo Quality Together' },
      { id: 'chemistry', emoji: '❤️', labelAr: 'Chemistry', labelEn: 'Chemistry' }
    ]
  }
];

export function calculateOVR(ratings: Record<string, number>): number {
  let total = 0;
  CARD_SECTIONS.forEach((section) => {
    const values = section.attributes.map((attr) => ratings[attr.id] ?? 0);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    total += avg * section.weight;
  });
  return Math.round(total);
}
