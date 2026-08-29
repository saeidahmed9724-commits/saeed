// src/moodCatalog.ts
// Catalog of 50 moods for the Daily Mood check-in feature.
// Each mood has a stable id (never change ids once used in production —
// past entries reference them), an emoji, and Arabic/English labels.

export interface MoodDefinition {
  id: string;
  emoji: string;
  labelAr: string;
  labelEn: string;
  // Rough polarity used only for lightweight UI grouping/coloring.
  // Not used in statistics math (the 1-10 rating drives all stats).
  tone: 'positive' | 'neutral' | 'negative';
}

export const MOOD_CATALOG: MoodDefinition[] = [
  { id: 'm01', emoji: '🤩', labelAr: 'مبسوط جدًا', labelEn: 'Super happy', tone: 'positive' },
  { id: 'm02', emoji: '🥰', labelAr: 'عاشق', labelEn: 'In love', tone: 'positive' },
  { id: 'm03', emoji: '😌', labelAr: 'هادئ', labelEn: 'Calm', tone: 'positive' },
  { id: 'm04', emoji: '🙏', labelAr: 'ممتن', labelEn: 'Grateful', tone: 'positive' },
  { id: 'm05', emoji: '🤗', labelAr: 'متحمس', labelEn: 'Excited', tone: 'positive' },
  { id: 'm06', emoji: '😩', labelAr: 'مرهق', labelEn: 'Exhausted', tone: 'negative' },
  { id: 'm07', emoji: '😖', labelAr: 'مضغوط', labelEn: 'Stressed', tone: 'negative' },
  { id: 'm08', emoji: '😢', labelAr: 'زعلان', labelEn: 'Sad', tone: 'negative' },
  { id: 'm09', emoji: '🥺', labelAr: 'وحيد', labelEn: 'Lonely', tone: 'negative' },
  { id: 'm10', emoji: '🙁', labelAr: 'محتاج اهتمام', labelEn: 'Needs attention', tone: 'negative' },
  { id: 'm11', emoji: '😤', labelAr: 'فخور', labelEn: 'Proud', tone: 'positive' },
  { id: 'm12', emoji: '🌇', labelAr: 'نوستالجيا', labelEn: 'Nostalgic', tone: 'neutral' },
  { id: 'm13', emoji: '😰', labelAr: 'متوتر', labelEn: 'Anxious', tone: 'negative' },
  { id: 'm14', emoji: '🙂', labelAr: 'راضي', labelEn: 'Content', tone: 'positive' },
  { id: 'm15', emoji: '✨', labelAr: 'يوم مثالي', labelEn: 'Perfect day', tone: 'positive' },
  { id: 'm16', emoji: '💔', labelAr: 'يوم سيئ جدًا', labelEn: 'Terrible day', tone: 'negative' },
  { id: 'm17', emoji: '😄', labelAr: 'مبسوط', labelEn: 'Happy', tone: 'positive' },
  { id: 'm18', emoji: '😐', labelAr: 'عادي', labelEn: 'Neutral', tone: 'neutral' },
  { id: 'm19', emoji: '🥹', labelAr: 'مشتاق', labelEn: 'Missing you', tone: 'neutral' },
  { id: 'm20', emoji: '🌞', labelAr: 'متفائل', labelEn: 'Optimistic', tone: 'positive' },
  { id: 'm21', emoji: '🌧️', labelAr: 'متشائم', labelEn: 'Pessimistic', tone: 'negative' },
  { id: 'm22', emoji: '😠', labelAr: 'غاضب', labelEn: 'Angry', tone: 'negative' },
  { id: 'm23', emoji: '😣', labelAr: 'محبط', labelEn: 'Frustrated', tone: 'negative' },
  { id: 'm24', emoji: '😨', labelAr: 'خايف', labelEn: 'Scared', tone: 'negative' },
  { id: 'm25', emoji: '😎', labelAr: 'مرتاح', labelEn: 'Relaxed', tone: 'positive' },
  { id: 'm26', emoji: '⚡', labelAr: 'نشيط', labelEn: 'Energetic', tone: 'positive' },
  { id: 'm27', emoji: '🦥', labelAr: 'كسول', labelEn: 'Lazy', tone: 'neutral' },
  { id: 'm28', emoji: '💡', labelAr: 'ملهم', labelEn: 'Inspired', tone: 'positive' },
  { id: 'm29', emoji: '🎨', labelAr: 'مبدع', labelEn: 'Creative', tone: 'positive' },
  { id: 'm30', emoji: '😑', labelAr: 'ممل', labelEn: 'Bored', tone: 'neutral' },
  { id: 'm31', emoji: '🚪', labelAr: 'منعزل', labelEn: 'Isolated', tone: 'negative' },
  { id: 'm32', emoji: '🌸', labelAr: 'سعيد بصمت', labelEn: 'Quietly happy', tone: 'positive' },
  { id: 'm33', emoji: '🌿', labelAr: 'متصالح', labelEn: 'At ease', tone: 'positive' },
  { id: 'm34', emoji: '🤔', labelAr: 'فضولي', labelEn: 'Curious', tone: 'neutral' },
  { id: 'm35', emoji: '😲', labelAr: 'مندهش', labelEn: 'Surprised', tone: 'neutral' },
  { id: 'm36', emoji: '🌑', labelAr: 'مكتئب', labelEn: 'Down', tone: 'negative' },
  { id: 'm37', emoji: '😵', labelAr: 'مشوش', labelEn: 'Confused', tone: 'negative' },
  { id: 'm38', emoji: '💌', labelAr: 'رومانسي', labelEn: 'Romantic', tone: 'positive' },
  { id: 'm39', emoji: '💞', labelAr: 'ممتلئ بالحب', labelEn: 'Overflowing with love', tone: 'positive' },
  { id: 'm40', emoji: '🕊️', labelAr: 'مطمئن', labelEn: 'At peace', tone: 'positive' },
  { id: 'm41', emoji: '🥱', labelAr: 'متعب جسديًا', labelEn: 'Physically tired', tone: 'negative' },
  { id: 'm42', emoji: '🌦️', labelAr: 'حزين لكن بخير', labelEn: 'Sad but okay', tone: 'neutral' },
  { id: 'm43', emoji: '🎉', labelAr: 'مستمتع', labelEn: 'Enjoying life', tone: 'positive' },
  { id: 'm44', emoji: '😵‍💫', labelAr: 'مرتبك عاطفيًا', labelEn: 'Emotionally overwhelmed', tone: 'negative' },
  { id: 'm45', emoji: '🏅', labelAr: 'فرحان بإنجاز', labelEn: 'Proud of an achievement', tone: 'positive' },
  { id: 'm46', emoji: '🤍', labelAr: 'حنون', labelEn: 'Affectionate', tone: 'positive' },
  { id: 'm47', emoji: '🧘', labelAr: 'محتاج وقت لنفسي', labelEn: 'Needs alone time', tone: 'neutral' },
  { id: 'm48', emoji: '☁️', labelAr: 'متصالح مع نفسي', labelEn: 'At peace with myself', tone: 'positive' },
  { id: 'm49', emoji: '🔥', labelAr: 'متلهف', labelEn: 'Eager', tone: 'positive' },
  { id: 'm50', emoji: '🌈', labelAr: 'ممتلئ بالأمل', labelEn: 'Hopeful', tone: 'positive' },
];

export function getMoodById(id: string): MoodDefinition | undefined {
  return MOOD_CATALOG.find((m) => m.id === id);
}
