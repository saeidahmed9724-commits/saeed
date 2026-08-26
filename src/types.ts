export type Language = 'en' | 'ar';

export type UserRole = 'Dodo' | 'SO';

export interface KnowledgeBaseData {
  // ❤️ بحب
  favoriteFood?: string;
  favoriteDrink?: string;
  favoriteColor?: string;
  favoriteSinger?: string;
  favoriteSong?: string;
  favoriteMovie?: string;
  favoriteSeries?: string;
  favoriteGame?: string;
  favoritePlace?: string;
  favoriteSeason?: string;
  favoriteAnimal?: string;
  favoritePerfume?: string;

  // 🚫 مبحبش
  hatedFood?: string;
  petPeeve?: string;
  hatedBehavior?: string;
  dislikedMovieGenre?: string;
  dislikedPlaces?: string;

  // 😊 شخصيتي
  wakeUpTime?: string;
  socialType?: string;
  likesSurprises?: string;
  likesGifts?: string;
  whenSad?: string;
  whenStressed?: string;

  // ❤️ في العلاقة
  feelsCaredForBy?: string;
  relationshipTurnOff?: string;
  makesMeHappy?: string;
  makesMeSad?: string;
  loveLanguage?: string;
  reconcileWay?: string;

  // 🎁 Wishlist
  wantToBuy?: string;
  wantToGo?: string;
  wantToTry?: string;

  // 📝 معلومات سريعة
  clothingSize?: string;
  birthdate?: string;
  zodiac?: string;
  bloodType?: string;
  shoeSize?: string;
}

export type KnowledgeBaseMap = {
  Dodo: KnowledgeBaseData;
  SO: KnowledgeBaseData;
};

export interface KnowledgeQuizScore {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  lastUpdated: number;
}

export interface KnowledgeQuizScoresMap {
  Dodo: KnowledgeQuizScore; // Saeed's score testing Sohila
  SO: KnowledgeQuizScore;   // Sohila's score testing Saeed
}

export interface Profile {
  name: string;
  nickname: string;
  birthday: string;
  avatarUrl: string;
  bio: string;
  zodiac: string;
  favoriteSong: string;
  loveLanguage: string;
  customFields: { id: string; label: string; value: string }[];
}

export interface Memory {
  id: string;
  date: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  songId?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption?: string;
  date: string;
}

export interface VideoItem {
  id: string;
  url: string;
  title?: string;
  date: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  coverUrl?: string;
  linkedMemoryId?: string;
}

export interface Quote {
  id: string;
  text: string;
  author: 'Dodo' | 'SO';
  date?: string;
}

export interface Envelope {
  id: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  emoji: string;
}

export interface DailyQuestion {
  id: string;
  dateStr: string; // YYYY-MM-DD
  questionEn: string;
  questionAr: string;
  answerDodo?: string;
  answerSO?: string;
}

export interface QuizQuestion {
  id: string;
  questionEn: string;
  questionAr: string;
  optionsEn: string[];
  optionsAr: string[];
  correctIndex: number;
}

export interface VoiceMessage {
  id: string;
  title: string;
  url: string;
  date: string;
  duration?: string;
  sender: 'Dodo' | 'SO';
}

export interface DateActivity {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
}

export interface LiveActivity {
  id: string;
  sender: 'Dodo' | 'SO';
  type: 'buzz' | 'mood' | 'sticky_note' | 'wheel_spin' | 'quiz' | 'daily_question' | 'achievement' | 'chat';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: 'Dodo' | 'SO';
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'voice';
  voiceDuration?: string;
  timestamp: number;
  replyToId?: string;
  replyToText?: string;
  replyToSender?: 'Dodo' | 'SO';
  reactions?: { [role: string]: string };
  isPinned?: boolean;
  isEdited?: boolean;
  sharedItem?: {
    type: 'memory' | 'photo' | 'video' | 'reel' | 'song' | 'daily_question' | 'quiz' | 'achievement' | 'envelope';
    id: string;
    title: string;
    subTitle?: string;
    imageUrl?: string;
  };
}

export interface UserStatus {
  typing: boolean;
  recording: boolean;
  choosing: boolean;
}

