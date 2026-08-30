import express from 'express';
import { createClient as createRedisClient } from 'redis';
import { createClient } from '@supabase/supabase-js';
import {
  defaultSaeedProfile,
  defaultSohilaProfile,
  defaultKnowledgeBase,
  defaultEnvelopes,
  defaultDateActivities,
  defaultGalleryItems,
  defaultMemories,
  defaultVideos,
  defaultSongs,
  defaultChatMemories
} from '../src/dataStore.js';
import { getDefaultDailyQuestions } from '../src/defaultQuestions.js';
import { Profile, Memory, GalleryItem, VideoItem, Song, Quote, Envelope, DailyQuestion, QuizQuestion, VoiceMessage, DateActivity, KnowledgeBaseMap, ChatMemoryConversation } from '../src/types.js';

const app = express();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const STORAGE_BUCKET = 'user-media';

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Redis client - reads REDIS_URL automatically from environment variables
// once the Redis integration is connected to this project in Vercel.
const STATE_KEY = 'interaction_state';

let redisClient: ReturnType<typeof createRedisClient> | null = null;

async function getRedis() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }
  redisClient = createRedisClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
  return redisClient;
}

// Persistent state structure
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

interface LiveActivity {
  id: string;
  sender: 'Dodo' | 'SO';
  type: 'buzz' | 'mood' | 'sticky_note' | 'wheel_spin' | 'quiz' | 'daily_question' | 'achievement' | 'chat';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  timestamp: number;
}

interface ChatMessage {
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

interface UserStatus {
  typing: boolean;
  recording: boolean;
  choosing: boolean;
}

// --- DAILY MOOD TRACKER ---
interface DailyMoodEntry {
  moodId: string;
  emoji: string;
  labelAr: string;
  labelEn: string;
  rating: number; // 1-10
  note?: string;
  timestamp: number;
}

interface DailyMoodDay {
  Dodo?: DailyMoodEntry;
  SO?: DailyMoodEntry;
}

interface InteractionState {
  dodoMood: string;
  soMood: string;
  dodoLastUpdated: string;
  soLastUpdated: string;
  dodoLastActive?: string;
  soLastActive?: string;
  pendingBuzzes: Buzz[];
  stickyNotes: StickyNote[];
  activityFeed: LiveActivity[];
  loveQuizAnswers: {
    [questionId: string]: {
      dodoAnswer?: string;
      soAnswer?: string;
      dodoTimestamp?: number;
      soTimestamp?: number;
    }
  };
  chatMessages: ChatMessage[];
  dodoStatus?: UserStatus;
  soStatus?: UserStatus;
  saeedProfile?: Profile;
  sohilaProfile?: Profile;
  knowledgeBase?: KnowledgeBaseMap;
  knowledgeQuizScores?: any;
  memories?: Memory[];
  galleryItems?: GalleryItem[];
  videoItems?: VideoItem[];
  songs?: Song[];
  quotes?: Quote[];
  envelopes?: Envelope[];
  dailyQuestions?: DailyQuestion[];
  quizQuestions?: QuizQuestion[];
  voiceMessages?: VoiceMessage[];
  dateActivities?: DateActivity[];
  dailyMoodEntries?: { [date: string]: DailyMoodDay }; // key = 'YYYY-MM-DD'
  chatMemories?: ChatMemoryConversation[]; // "محادثاتنا المهمة" - archived WhatsApp-style saved conversations
}

function buildDefaultState(): InteractionState {
  return {
    dodoMood: 'سعيد 🌸',
    soMood: 'مشتاقة 💕',
    dodoLastUpdated: new Date().toISOString(),
    soLastUpdated: new Date().toISOString(),
    dodoLastActive: new Date().toISOString(),
    soLastActive: new Date().toISOString(),
    pendingBuzzes: [],
    stickyNotes: [
      {
        id: 'note-1',
        sender: 'Dodo',
        text: 'مرحباً بكِ في قبو حبنا التفاعلي يا سو! ♾️❤️',
        color: 'from-pink-100 to-pink-200 dark:from-pink-950/40 dark:to-pink-900/40',
        emoji: '💖',
        timestamp: Date.now()
      },
      {
        id: 'note-2',
        sender: 'SO',
        text: 'يا أهلاً يا دودي! سعيدة جداً بوجودنا هنا معاً دائماً 🥰',
        color: 'from-rose-100 to-rose-200 dark:from-rose-950/40 dark:to-rose-900/40',
        emoji: '✨',
        timestamp: Date.now() + 1000
      }
    ],
    activityFeed: [
      {
        id: 'act-1',
        sender: 'Dodo',
        type: 'sticky_note',
        titleAr: 'رسالة معلقة جديدة 📌',
        titleEn: 'New Sticky Note 📌',
        descAr: 'تم تعليق رسالة ترحيب أولى بنجاح!',
        descEn: 'A welcoming note was successfully pinned!',
        timestamp: Date.now()
      }
    ],
    loveQuizAnswers: {},
    chatMessages: [],
    dodoStatus: { typing: false, recording: false, choosing: false },
    soStatus: { typing: false, recording: false, choosing: false },
    saeedProfile: defaultSaeedProfile,
    sohilaProfile: defaultSohilaProfile,
    knowledgeBase: defaultKnowledgeBase,
    knowledgeQuizScores: {},
    memories: defaultMemories,
    galleryItems: defaultGalleryItems,
    videoItems: defaultVideos,
    songs: defaultSongs,
    envelopes: defaultEnvelopes,
    dateActivities: defaultDateActivities,
    dailyQuestions: getDefaultDailyQuestions(),
    quotes: [],
    quizQuestions: [],
    voiceMessages: [],
    dailyMoodEntries: {},
    chatMemories: defaultChatMemories
  };
}

// --- State read/write backed by Redis (node-redis client) instead of a local file ---

async function readState(): Promise<InteractionState> {
  try {
    const redis = await getRedis();
    const raw = await redis.get(STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InteractionState;
      parsed.activityFeed = parsed.activityFeed || [];
      parsed.pendingBuzzes = parsed.pendingBuzzes || [];
      parsed.stickyNotes = parsed.stickyNotes || [];
      parsed.loveQuizAnswers = parsed.loveQuizAnswers || {};
      parsed.chatMessages = parsed.chatMessages || [];
      parsed.dodoStatus = parsed.dodoStatus || { typing: false, recording: false, choosing: false };
      parsed.soStatus = parsed.soStatus || { typing: false, recording: false, choosing: false };

      const defaults = buildDefaultState();
      if (!parsed.saeedProfile) parsed.saeedProfile = defaults.saeedProfile;
      if (!parsed.sohilaProfile) parsed.sohilaProfile = defaults.sohilaProfile;
      if (!parsed.knowledgeBase) parsed.knowledgeBase = defaults.knowledgeBase;
      if (!parsed.knowledgeQuizScores) parsed.knowledgeQuizScores = {};
      if (!parsed.memories || parsed.memories.length === 0) parsed.memories = defaults.memories;
      if (!parsed.galleryItems || parsed.galleryItems.length === 0) parsed.galleryItems = defaults.galleryItems;
      if (!parsed.videoItems || parsed.videoItems.length === 0) parsed.videoItems = defaults.videoItems;
      if (!parsed.songs || parsed.songs.length === 0) parsed.songs = defaults.songs;
      if (!parsed.envelopes || parsed.envelopes.length === 0) parsed.envelopes = defaults.envelopes;
      if (!parsed.dateActivities || parsed.dateActivities.length === 0) parsed.dateActivities = defaults.dateActivities;
      if (!parsed.dailyQuestions || parsed.dailyQuestions.length === 0) parsed.dailyQuestions = defaults.dailyQuestions;
      if (!parsed.quotes) parsed.quotes = [];
      if (!parsed.quizQuestions) parsed.quizQuestions = [];
      if (!parsed.voiceMessages) parsed.voiceMessages = [];
      if (!parsed.dailyMoodEntries) parsed.dailyMoodEntries = {};
      if (!parsed.chatMemories) parsed.chatMemories = [];

      // Auto-clear activities older than 24 hours
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
      const originalLength = parsed.activityFeed.length;
      parsed.activityFeed = parsed.activityFeed.filter((act: any) => act.timestamp > oneDayAgo);
      if (parsed.activityFeed.length !== originalLength) {
        await redis.set(STATE_KEY, JSON.stringify(parsed));
      }

      return parsed;
    }
  } catch (err) {
    console.error('Error reading interaction state from Redis, falling back to default:', err);
  }

  const defaultState = buildDefaultState();
  try {
    const redis = await getRedis();
    await redis.set(STATE_KEY, JSON.stringify(defaultState));
  } catch (err) {
    console.error('Error writing default state to Redis:', err);
  }
  return defaultState;
}

async function writeState(state: InteractionState) {
  try {
    const redis = await getRedis();
    await redis.set(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error writing interaction state to Redis:', err);
  }
}

// --- API ENDPOINTS & HELPERS ---

function pushActivity(
  state: InteractionState,
  sender: 'Dodo' | 'SO',
  type: 'buzz' | 'mood' | 'sticky_note' | 'wheel_spin' | 'quiz' | 'daily_question' | 'achievement' | 'chat',
  titleAr: string,
  titleEn: string,
  descAr: string,
  descEn: string
) {
  const newActivity: LiveActivity = {
    id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    sender,
    type,
    titleAr,
    titleEn,
    descAr,
    descEn,
    timestamp: Date.now()
  };
  state.activityFeed = state.activityFeed || [];
  state.activityFeed.unshift(newActivity);
  if (state.activityFeed.length > 50) {
    state.activityFeed.pop();
  }
}

// Get current live state
app.get('/api/interaction-state', async (req, res) => {
  const activeState = await readState();
  res.json(activeState);
});

// Update shared database collection (Single Source of Truth)
app.post('/api/shared/update', async (req, res) => {
  const { key, data, sender, activity } = req.body;
  if (!key) {
    return res.status(400).json({ error: 'Key is required' });
  }

  const activeState = await readState();
  (activeState as any)[key] = data;

  if (activity && sender) {
    const senderName = sender === 'Dodo' ? 'سعيد' : 'سهيلة';
    pushActivity(
      activeState,
      sender,
      activity.type || 'buzz',
      activity.titleAr || `تحديث من ${senderName} 💖`,
      activity.titleEn || `Update from ${sender} 💖`,
      activity.descAr || `قام ${senderName} بتحديث المحتوى المشترك.`,
      activity.descEn || `${sender} updated shared content.`
    );
  }

  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// Direct Media & Memory Upload Endpoint (stores files in Supabase Storage)
// Kept for small files / backward compatibility.
app.post('/api/upload', async (req, res) => {
  const { role, category, title, description, date, artist, location, fileData, fileName, filesBatch } = req.body;

  const itemsToUpload: Array<{ fileData: string; fileName: string }> =
    Array.isArray(filesBatch) && filesBatch.length > 0
      ? filesBatch
      : fileData ? [{ fileData, fileName }] : [];

  if (!category || itemsToUpload.length === 0) {
    return res.status(400).json({ error: 'Missing category or file data' });
  }

  try {
    const activeState = await readState();
    const senderName = role === 'Dodo' ? 'سعيد' : 'سهيلة';
    const createdItems: any[] = [];

    for (let idx = 0; idx < itemsToUpload.length; idx++) {
      const item: any = itemsToUpload[idx];
      const timestamp = Date.now() + idx;
      const safeName = (item.fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
      const storedFileName = `${timestamp}_${safeName}`;

      let fileBuffer: Buffer;
      const dataStr = item.fileData;
      if (typeof dataStr === 'string' && dataStr.startsWith('data:')) {
        const matches = dataStr.match(/^data:(.+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          fileBuffer = Buffer.from(matches[2], 'base64');
        } else {
          fileBuffer = Buffer.from(dataStr.replace(/^data:.*;base64,/, ''), 'base64');
        }
      } else {
        fileBuffer = Buffer.from(dataStr, 'base64');
      }

      // Upload to Supabase Storage - returns a permanent public URL
      const filePath = `${role || 'unknown'}/${category}/${storedFileName}`;

      const contentType =
        typeof dataStr === 'string' && dataStr.startsWith('data:')
          ? dataStr.match(/^data:(.+);base64,/)?.[1] || 'application/octet-stream'
          : 'application/octet-stream';

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      const fileUrl = publicUrlData.publicUrl;

      if (category === 'gallery') {
        const newItem: GalleryItem = {
          id: `gal-${timestamp}`,
          url: fileUrl,
          date: date || new Date().toISOString().split('T')[0],
          caption: (title ? title + ': ' : '') + (description || '')
        };
        activeState.galleryItems = activeState.galleryItems || [];
        activeState.galleryItems.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'song') {
        const newItem: Song = {
          id: `song-${timestamp}`,
          title: title || '',
          artist: artist || '',
          url: fileUrl,
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
        };
        activeState.songs = activeState.songs || [];
        activeState.songs.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'video') {
        const newItem: VideoItem = {
          id: `vid-${timestamp}`,
          url: fileUrl,
          title: title || (itemsToUpload.length > 1 ? `فيديو ${idx + 1}` : 'فيديو جديد 🎬'),
          date: date || new Date().toISOString().split('T')[0]
        };
        activeState.videoItems = activeState.videoItems || [];
        activeState.videoItems.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'memory') {
        const newItem: Memory = {
          id: `mem-${timestamp}`,
          title: title || 'ذكرى جديدة 💖',
          date: date || new Date().toISOString().split('T')[0],
          content: description || 'ذكرى رومانسية مميزة تم تسجيلها.',
          imageUrl: fileUrl
        };
        activeState.memories = activeState.memories || [];
        activeState.memories.unshift(newItem);
        createdItems.push(newItem);
      }
    }

    const count = itemsToUpload.length;
    let actTitleAr = 'محتوى جديد 📤';
    let actTitleEn = 'New Content Uploaded 📤';
    let actDescAr = `قام ${senderName} برفع ${count} ملف جديد.`;
    let actDescEn = `${role} uploaded ${count} new files.`;

    if (category === 'gallery') {
      actTitleAr = count > 1 ? `صور جديدة للمعرض (${count}) 📸` : `صورة جديدة للمعرض 📸`;
      actTitleEn = count > 1 ? `New Gallery Photos (${count}) 📸` : `New Gallery Photo 📸`;
      actDescAr = `قام ${senderName} برفع ${count} صورة جديدة إلى المعرض المشترك.`;
      actDescEn = `${role} uploaded ${count} new photos to gallery.`;
    } else if (category === 'song') {
      actTitleAr = count > 1 ? `أغاني جديدة (${count}) 🎵` : `أغنية جديدة 🎵`;
      actTitleEn = count > 1 ? `New Songs (${count}) 🎵` : `New Song 🎵`;
      actDescAr = `قام ${senderName} برفع ${count} أغنية جديدة في المكتبة الموسيقية.`;
      actDescEn = `${role} uploaded ${count} new songs.`;
    } else if (category === 'video') {
      actTitleAr = count > 1 ? `فيديوهات جديدة (${count}) 🎬` : `فيديو جديد 🎬`;
      actTitleEn = count > 1 ? `New Videos (${count}) 🎬` : `New Video Reel 🎬`;
      actDescAr = `قام ${senderName} برفع ${count} فيديو جديد في ريلز الذكريات.`;
      actDescEn = `${role} uploaded ${count} new videos.`;
    } else if (category === 'memory') {
      actTitleAr = `ذكريات رومانسية جديدة 💖`;
      actTitleEn = `New Memories 💖`;
      actDescAr = `قام ${senderName} بإضافة ${count} ذكرى جديدة في سجل اللحظات.`;
      actDescEn = `${role} added ${count} new romantic memories.`;
    }

    pushActivity(
      activeState,
      role || 'Dodo',
      'buzz',
      actTitleAr,
      actTitleEn,
      actDescAr,
      actDescEn
    );

    await writeState(activeState);
    return res.json({ success: true, items: createdItems, item: createdItems[0], state: activeState });
  } catch (err: any) {
    console.error('Error during file upload:', err);
    return res.status(500).json({ error: 'Failed to save uploaded file(s)' });
  }
});

// --- DIRECT-TO-SUPABASE UPLOAD FLOW (bypasses Vercel's ~4.5MB request limit) ---
// Step 1: Frontend asks for a signed upload URL for each file (no file bytes sent here).
app.post('/api/upload/sign', async (req, res) => {
  const { role, category, files } = req.body;

  if (!category || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'Missing category or files list' });
  }

  try {
    const signedItems: Array<{ path: string; token: string; fileName: string }> = [];

    for (const f of files) {
      const timestamp = Date.now() + Math.floor(Math.random() * 1000);
      const safeName = (f.fileName || 'file').replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${role || 'unknown'}/${category}/${timestamp}_${safeName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(filePath);

      if (error) {
        throw error;
      }

      signedItems.push({ path: filePath, token: data.token, fileName: f.fileName });
    }

    return res.json({ success: true, items: signedItems });
  } catch (err: any) {
    console.error('Error creating signed upload URLs:', err);
    return res.status(500).json({ error: 'Failed to create signed upload URLs' });
  }
});

// Step 2: After the browser uploads each file directly to Supabase Storage using the
// signed URL/token, it calls this endpoint with just the resulting paths + metadata,
// so the server can save the item into the shared state (Redis) as before.
app.post('/api/upload/complete', async (req, res) => {
  const { role, category, title, description, date, artist, location, items } = req.body;

  if (!category || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing category or completed items list' });
  }

  try {
    const activeState = await readState();
    const senderName = role === 'Dodo' ? 'سعيد' : 'سهيلة';
    const createdItems: any[] = [];

    items.forEach((it: { path: string; fileName?: string }, idx: number) => {
      const timestamp = Date.now() + idx;
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(it.path);
      const fileUrl = publicUrlData.publicUrl;

      if (category === 'gallery') {
        const newItem: GalleryItem = {
          id: `gal-${timestamp}`,
          url: fileUrl,
          date: date || new Date().toISOString().split('T')[0],
          caption: (title ? title + ': ' : '') + (description || ''),
          location: location || ''
        };
        activeState.galleryItems = activeState.galleryItems || [];
        activeState.galleryItems.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'song') {
        const newItem: Song = {
          id: `song-${timestamp}`,
          title: title || '',
          artist: artist || '',
          url: fileUrl,
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
        };
        activeState.songs = activeState.songs || [];
        activeState.songs.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'recording') {
        const newItem: VoiceMessage = {
          id: `voice-${timestamp}`,
          title: title || (items.length > 1 ? `ريكورد ${idx + 1}` : 'ريكورد صوتي جديد 🎙️'),
          url: fileUrl,
          date: date || new Date().toISOString().split('T')[0],
          sender: role || 'Dodo'
        };
        activeState.voiceMessages = activeState.voiceMessages || [];
        activeState.voiceMessages.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'video') {
        const newItem: VideoItem = {
          id: `vid-${timestamp}`,
          url: fileUrl,
          title: title || (items.length > 1 ? `فيديو ${idx + 1}` : 'فيديو جديد 🎬'),
          date: date || new Date().toISOString().split('T')[0]
        };
        activeState.videoItems = activeState.videoItems || [];
        activeState.videoItems.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'memory') {
        const newItem: Memory = {
          id: `mem-${timestamp}`,
          title: title || 'ذكرى جديدة 💖',
          date: date || new Date().toISOString().split('T')[0],
          content: description || 'ذكرى رومانسية مميزة تم تسجيلها.',
          imageUrl: fileUrl
        };
        activeState.memories = activeState.memories || [];
        activeState.memories.unshift(newItem);
        createdItems.push(newItem);
      } else if (category === 'chat-memory') {
        // Media attached to a "Chat Memories" message. It's stored in Supabase like everything
        // else, but is NOT pushed into any shared list here — the frontend attaches the returned
        // url directly to a ChatMemoryMessage and saves the whole conversation via
        // DataStore.saveChatMemories() -> /api/shared/update, same as every other entity type.
        createdItems.push({ id: `chatmem-media-${timestamp}`, url: fileUrl, fileName: it.fileName || '' });
      }
    });

    // "chat-memory" uploads are just raw media for a message the user is composing/importing —
    // return immediately without touching shared state or logging an activity notification.
    if (category === 'chat-memory') {
      return res.json({ success: true, items: createdItems, item: createdItems[0] });
    }

    const count = items.length;
    let actTitleAr = 'محتوى جديد 📤';
    let actTitleEn = 'New Content Uploaded 📤';
    let actDescAr = `قام ${senderName} برفع ${count} ملف جديد.`;
    let actDescEn = `${role} uploaded ${count} new files.`;

    if (category === 'gallery') {
      actTitleAr = count > 1 ? `صور جديدة للمعرض (${count}) 📸` : `صورة جديدة للمعرض 📸`;
      actTitleEn = count > 1 ? `New Gallery Photos (${count}) 📸` : `New Gallery Photo 📸`;
      actDescAr = `قام ${senderName} برفع ${count} صورة جديدة إلى المعرض المشترك.`;
      actDescEn = `${role} uploaded ${count} new photos to gallery.`;
    } else if (category === 'song') {
      actTitleAr = count > 1 ? `أغاني جديدة (${count}) 🎵` : `أغنية جديدة 🎵`;
      actTitleEn = count > 1 ? `New Songs (${count}) 🎵` : `New Song 🎵`;
      actDescAr = `قام ${senderName} برفع ${count} أغنية جديدة في المكتبة الموسيقية.`;
      actDescEn = `${role} uploaded ${count} new songs.`;
    } else if (category === 'recording') {
      actTitleAr = count > 1 ? `تسجيلات صوتية جديدة (${count}) 🎙️` : `ريكورد صوتي جديد 🎙️`;
      actTitleEn = count > 1 ? `New Voice Recordings (${count}) 🎙️` : `New Voice Recording 🎙️`;
      actDescAr = `قام ${senderName} برفع ${count} تسجيل صوتي جديد.`;
      actDescEn = `${role} uploaded ${count} new voice recordings.`;
    } else if (category === 'video') {
      actTitleAr = count > 1 ? `فيديوهات جديدة (${count}) 🎬` : `فيديو جديد 🎬`;
      actTitleEn = count > 1 ? `New Videos (${count}) 🎬` : `New Video Reel 🎬`;
      actDescAr = `قام ${senderName} برفع ${count} فيديو جديد في ريلز الذكريات.`;
      actDescEn = `${role} uploaded ${count} new videos.`;
    } else if (category === 'memory') {
      actTitleAr = `ذكريات رومانسية جديدة 💖`;
      actTitleEn = `New Memories 💖`;
      actDescAr = `قام ${senderName} بإضافة ${count} ذكرى جديدة في سجل اللحظات.`;
      actDescEn = `${role} added ${count} new romantic memories.`;
    }

    pushActivity(activeState, role || 'Dodo', 'buzz', actTitleAr, actTitleEn, actDescAr, actDescEn);

    await writeState(activeState);
    return res.json({ success: true, items: createdItems, item: createdItems[0], state: activeState });
  } catch (err: any) {
    console.error('Error completing upload:', err);
    return res.status(500).json({ error: 'Failed to save uploaded file metadata' });
  }
});

// Update user presence
app.post('/api/interaction-state/presence', async (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }
  const activeState = await readState();
  const nowStr = new Date().toISOString();
  if (role === 'Dodo') {
    activeState.dodoLastActive = nowStr;
  } else if (role === 'SO') {
    activeState.soLastActive = nowStr;
  }
  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// Update current partner mood
app.post('/api/interaction-state/mood', async (req, res) => {
  const { role, mood } = req.body;
  if (!role || !mood) {
    return res.status(400).json({ error: 'Role and mood are required' });
  }

  const activeState = await readState();
  const nameAr = role === 'Dodo' ? 'سعيد (دودي)' : 'سهيلة (سو)';
  const nameEn = role === 'Dodo' ? 'Saeed (Dodo)' : 'Sohila (SO)';

  if (role === 'Dodo') {
    activeState.dodoMood = mood;
    activeState.dodoLastUpdated = new Date().toISOString();
  } else if (role === 'SO') {
    activeState.soMood = mood;
    activeState.soLastUpdated = new Date().toISOString();
  }

  pushActivity(
    activeState,
    role,
    'mood',
    'تعديل الحالة المزاجية 💭',
    'Updated Mood 💭',
    `قام الشريك ${nameAr} بتعديل حالته المزاجية إلى: "${mood}"`,
    `Partner ${nameEn} changed their mood to: "${mood}"`
  );

  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// Send a love heartbeat buzz
app.post('/api/interaction-state/buzz', async (req, res) => {
  const { sender, type } = req.body;
  if (!sender || !type) {
    return res.status(400).json({ error: 'Sender and buzz type are required' });
  }

  const activeState = await readState();
  const newBuzz: Buzz = {
    id: 'buzz-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    sender,
    type,
    timestamp: Date.now()
  };

  activeState.pendingBuzzes.push(newBuzz);
  if (activeState.pendingBuzzes.length > 5) {
    activeState.pendingBuzzes.shift();
  }

  const emojiMap: any = { heart: '❤️', kiss: '💋', hug: '🫂', poke: '👉' };
  const typeArMap: any = { heart: 'نبضة حب', kiss: 'قبلة رقيقة', hug: 'حضن دافئ', poke: 'نغزة مشاكسة' };
  const typeEnMap: any = { heart: 'love heartbeat', kiss: 'sweet kiss', hug: 'warm hug', poke: 'playful poke' };

  const emoji = emojiMap[type] || '❤️';
  const typeAr = typeArMap[type] || 'نبضة حب';
  const typeEn = typeEnMap[type] || 'love heartbeat';

  const partnerNameAr = sender === 'Dodo' ? 'دودي' : 'سو';
  const partnerNameEn = sender === 'Dodo' ? 'Dodo' : 'SO';

  pushActivity(
    activeState,
    sender,
    'buzz',
    `تفاعل جديد ${emoji}`,
    `New Interaction ${emoji}`,
    `أرسل الشريك ${partnerNameAr} ${typeAr} فورية!`,
    `${partnerNameEn} sent an instant ${typeEn}!`
  );

  await writeState(activeState);
  res.json({ success: true, newBuzz, state: activeState });
});

// Acknowledge a buzz so it is cleared on receiver's end
app.post('/api/interaction-state/buzz/ack', async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Buzz ID is required for acknowledgment' });
  }

  const activeState = await readState();
  activeState.pendingBuzzes = activeState.pendingBuzzes.filter(b => b.id !== id);
  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// Add a sticky love note
app.post('/api/interaction-state/note', async (req, res) => {
  const { sender, text, color, emoji } = req.body;
  if (!sender || !text) {
    return res.status(400).json({ error: 'Sender and text are required' });
  }

  const activeState = await readState();
  const newNote: StickyNote = {
    id: 'note-' + Date.now(),
    sender,
    text,
    color: color || 'from-rose-100 to-rose-200 dark:from-rose-950/40 dark:to-rose-900/40',
    emoji: emoji || '🌸',
    timestamp: Date.now()
  };

  activeState.stickyNotes.unshift(newNote);
  if (activeState.stickyNotes.length > 30) {
    activeState.stickyNotes.pop();
  }

  const partnerNameAr = sender === 'Dodo' ? 'سعيد (دودي)' : 'سهيلة (سو)';
  const partnerNameEn = sender === 'Dodo' ? 'Saeed (Dodo)' : 'Sohila (SO)';

  pushActivity(
    activeState,
    sender,
    'sticky_note',
    'رسالة لاصقة جديدة 📌',
    'New Sticky Note 📌',
    `علق ${partnerNameAr} ورقة لاصقة جديدة: "${text}"`,
    `Partner ${partnerNameEn} pinned a new love note: "${text}"`
  );

  await writeState(activeState);
  res.json({ success: true, newNote, state: activeState });
});

// Delete a sticky love note
app.delete('/api/interaction-state/note/:id', async (req, res) => {
  const { id } = req.params;
  const activeState = await readState();
  activeState.stickyNotes = activeState.stickyNotes.filter(n => n.id !== id);
  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// Submit a quiz or question answer
app.post('/api/interaction-state/quiz-answer', async (req, res) => {
  const { questionId, role, answer, questionAr, questionEn } = req.body;
  if (!questionId || !role || !answer) {
    return res.status(400).json({ error: 'Question ID, role, and answer are required' });
  }

  const activeState = await readState();
  if (!activeState.loveQuizAnswers[questionId]) {
    activeState.loveQuizAnswers[questionId] = {};
  }

  const qAns = activeState.loveQuizAnswers[questionId];
  if (role === 'Dodo') {
    qAns.dodoAnswer = answer;
    qAns.dodoTimestamp = Date.now();
  } else if (role === 'SO') {
    qAns.soAnswer = answer;
    qAns.soTimestamp = Date.now();
  }

  const partnerNameAr = role === 'Dodo' ? 'سعيد (دودي)' : 'سهيلة (سو)';
  const partnerNameEn = role === 'Dodo' ? 'Saeed (Dodo)' : 'Sohila (SO)';

  const questionTitleAr = questionAr || 'سؤال اليوم';
  const questionTitleEn = questionEn || 'daily question';

  if (qAns.dodoAnswer && qAns.soAnswer) {
    pushActivity(
      activeState,
      role,
      'daily_question',
      'الكشف عن إجابة سؤال اليوم 🔓',
      'Daily Question Answers Revealed 🔓',
      `تم الكشف عن إجابة كلاكما لسؤال اليوم: "${questionTitleAr}"! 🎉`,
      `Both you and your partner answered the daily question: "${questionTitleEn}"! 🎉`
    );
  } else {
    pushActivity(
      activeState,
      role,
      'daily_question',
      'إجابة سؤال اليوم 📝',
      'Daily Question Answered 📝',
      `أجاب ${partnerNameAr} على سؤال اليوم: "${questionTitleAr}". بانتظار إجابتك للكشف!`,
      `Partner ${partnerNameEn} answered the question: "${questionTitleEn}". Awaiting your response!`
    );
  }

  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// Submit / update today's (or any date's) mood check-in
app.post('/api/interaction-state/daily-mood', async (req, res) => {
  const { role, date, moodId, emoji, labelAr, labelEn, rating, note } = req.body;
  if (!role || !date || !moodId || !emoji || rating === undefined) {
    return res.status(400).json({ error: 'role, date, moodId, emoji and rating are required' });
  }
  const numericRating = Number(rating);
  if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 10) {
    return res.status(400).json({ error: 'rating must be a number between 1 and 10' });
  }

  const activeState = await readState();
  activeState.dailyMoodEntries = activeState.dailyMoodEntries || {};
  if (!activeState.dailyMoodEntries[date]) {
    activeState.dailyMoodEntries[date] = {};
  }

  const dayEntry = activeState.dailyMoodEntries[date];
  const wasAlreadySet = role === 'Dodo' ? !!dayEntry.Dodo : !!dayEntry.SO;

  const entry: DailyMoodEntry = {
    moodId,
    emoji,
    labelAr: labelAr || '',
    labelEn: labelEn || '',
    rating: numericRating,
    note: note ? String(note).slice(0, 500) : undefined,
    timestamp: Date.now()
  };

  if (role === 'Dodo') {
    dayEntry.Dodo = entry;
  } else if (role === 'SO') {
    dayEntry.SO = entry;
  } else {
    return res.status(400).json({ error: 'role must be Dodo or SO' });
  }

  const partnerNameAr = role === 'Dodo' ? 'سعيد (دودي)' : 'سهيلة (سو)';
  const partnerNameEn = role === 'Dodo' ? 'Saeed (Dodo)' : 'Sohila (SO)';

  if (dayEntry.Dodo && dayEntry.SO && !wasAlreadySet) {
    pushActivity(
      activeState,
      role,
      'mood',
      'اكتمل تقييم مزاج اليوم 💞',
      "Today's Mood Check-in Complete 💞",
      `أنت و${partnerNameAr === 'سعيد (دودي)' ? 'سهيلة' : 'سعيد'} قيّمتوا مزاجكم النهارده!`,
      `You and your partner both checked in your mood today!`
    );
  } else if (!wasAlreadySet) {
    pushActivity(
      activeState,
      role,
      'mood',
      'تقييم مزاج جديد 💭',
      'New Mood Check-in 💭',
      `قام ${partnerNameAr} بتسجيل تقييم مزاجه اليوم: "${entry.labelAr}" (${entry.rating}/10)`,
      `Partner ${partnerNameEn} logged their mood today: "${entry.labelEn}" (${entry.rating}/10)`
    );
  }

  await writeState(activeState);
  res.json({ success: true, dayEntry: activeState.dailyMoodEntries[date], state: activeState });
});

// Log a custom action / activity (wheel spin, game score, envelope open)
app.post('/api/interaction-state/activity', async (req, res) => {
  const { sender, type, titleAr, titleEn, descAr, descEn } = req.body;
  if (!sender || !type || !titleAr || !titleEn || !descAr || !descEn) {
    return res.status(400).json({ error: 'Missing required activity fields' });
  }

  const activeState = await readState();
  pushActivity(activeState, sender, type, titleAr, titleEn, descAr, descEn);
  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

// --- PRIVATE CHAT SYSTEM ENDPOINTS ---

// Send a chat message
app.post('/api/chat/message', async (req, res) => {
  const { sender, text, mediaUrl, mediaType, voiceDuration, replyToId, replyToText, replyToSender, sharedItem } = req.body;
  if (!sender) {
    return res.status(400).json({ error: 'Sender is required' });
  }

  const activeState = await readState();
  const newMessage: ChatMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    sender,
    text,
    mediaUrl,
    mediaType,
    voiceDuration,
    replyToId,
    replyToText,
    replyToSender,
    reactions: {},
    isPinned: false,
    isEdited: false,
    timestamp: Date.now(),
    sharedItem
  };

  activeState.chatMessages = activeState.chatMessages || [];
  activeState.chatMessages.push(newMessage);

  if (activeState.chatMessages.length > 100000) {
    activeState.chatMessages.shift();
  }

  const partnerNameAr = sender === 'Dodo' ? 'سعيد' : 'سهيلة';
  const partnerNameEn = sender === 'Dodo' ? 'Saeed' : 'Sohila';

  let titleAr = 'رسالة جديدة 💬';
  let titleEn = 'New Message 💬';
  let descAr = `وصلتك رسالة جديدة.`;
  let descEn = `You received a new message.`;

  if (mediaType === 'image') {
    descAr = sender === 'Dodo' ? `أرسل لك سعيد صورة جديدة 📸` : `أرسلت لكِ سهيلة صورة جديدة 📸`;
    descEn = `${partnerNameEn} sent you a photo 📸`;
  } else if (mediaType === 'video') {
    descAr = sender === 'Dodo' ? `أرسل لك سعيد مقطع فيديو جديد 🎥` : `أرسلت لكِ سهيلة مقطع فيديو جديد 🎥`;
    descEn = `${partnerNameEn} sent you a video 🎥`;
  } else if (mediaType === 'voice') {
    descAr = sender === 'Dodo' ? `أرسل لك سعيد رسالة صوتية 🎙️` : `أرسلت لكِ سهيلة رسالة صوتية 🎙️`;
    descEn = `${partnerNameEn} sent you a voice message 🎙️`;
  } else if (sharedItem) {
    descAr = sender === 'Dodo' ? `شارك معك سعيد بطاقة مميزة: "${sharedItem.title}" 💌` : `شاركت معكِ سهيلة بطاقة مميزة: "${sharedItem.title}" 💌`;
    descEn = `${partnerNameEn} shared a special card with you: "${sharedItem.title}" 💌`;
  } else if (text) {
    descAr = sender === 'Dodo' ? `سعيد: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"` : `سهيلة: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
    descEn = `${partnerNameEn}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
  }

  pushActivity(activeState, sender, 'chat', titleAr, titleEn, descAr, descEn);
  await writeState(activeState);
  res.json({ success: true, newMessage, state: activeState });
});

// Edit a chat message
app.put('/api/chat/message/:id', async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for editing' });
  }

  const activeState = await readState();
  const msg = activeState.chatMessages.find(m => m.id === id);
  if (msg) {
    msg.text = text;
    msg.isEdited = true;
    await writeState(activeState);
    return res.json({ success: true, message: msg, state: activeState });
  }
  res.status(404).json({ error: 'Message not found' });
});

// Delete a chat message
app.delete('/api/chat/message/:id', async (req, res) => {
  const { id } = req.params;
  const activeState = await readState();
  const initialLength = activeState.chatMessages.length;
  activeState.chatMessages = activeState.chatMessages.filter(m => m.id !== id);
  if (activeState.chatMessages.length !== initialLength) {
    await writeState(activeState);
    return res.json({ success: true, state: activeState });
  }
  res.status(404).json({ error: 'Message not found' });
});

// React to a message
app.post('/api/chat/message/:id/react', async (req, res) => {
  const { id } = req.params;
  const { role, emoji } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const activeState = await readState();
  const msg = activeState.chatMessages.find(m => m.id === id);
  if (msg) {
    msg.reactions = msg.reactions || {};
    if (!emoji) {
      delete msg.reactions[role];
    } else {
      msg.reactions[role] = emoji;
    }
    await writeState(activeState);
    return res.json({ success: true, message: msg, state: activeState });
  }
  res.status(404).json({ error: 'Message not found' });
});

// Pin or unpin a message
app.post('/api/chat/message/:id/pin', async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body;

  const activeState = await readState();
  const msg = activeState.chatMessages.find(m => m.id === id);
  if (msg) {
    if (isPinned) {
      activeState.chatMessages.forEach(m => {
        m.isPinned = false;
      });
    }
    msg.isPinned = isPinned;
    await writeState(activeState);
    return res.json({ success: true, message: msg, state: activeState });
  }
  res.status(404).json({ error: 'Message not found' });
});

// Update dynamic typing / recording / choosing status
app.post('/api/chat/status', async (req, res) => {
  const { role, typing, recording, choosing } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  const activeState = await readState();
  const statusUpdate = {
    typing: !!typing,
    recording: !!recording,
    choosing: !!choosing
  };

  if (role === 'Dodo') {
    activeState.dodoStatus = statusUpdate;
  } else if (role === 'SO') {
    activeState.soStatus = statusUpdate;
  }

  await writeState(activeState);
  res.json({ success: true, state: activeState });
});

export default app;
