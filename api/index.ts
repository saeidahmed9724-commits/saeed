import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';

// --- ENV ---
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SECRET_KEY!; // service_role key - server only
const SUPABASE_BUCKET = 'user-media';

const redis = Redis.fromEnv(); // needs UPSTASH_REDIS_REST_URL + TOKEN
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ده للميتاداتا بس، مش للملفات

// 1. القديم - سيبه شغال للملفات الصغيرة جدا
app.post('/api/upload', async (req, res) => {
  // ... الكود القديم بتاعك يفضل هنا زي ما هو
  // ده fallback للملفات < 2MB لو حابب
  res.status(400).json({ error: 'Use /api/upload/sign for large files' });
});

// 2. الجديد: يطلع Signed URLs
app.post('/api/upload/sign', async (req, res) => {
  try {
    const { files } = req.body as { files: { name: string; type: string; section: string }[] };
    
    if (!files || !files.length) return res.status(400).json({ error: 'No files' });

    const signed = await Promise.all(files.map(async (f) => {
      const ext = f.name.split('.').pop() || 'bin';
      const path = `${f.section}/${Date.now()}-${uuidv4()}.${ext}`;
      
      const { data, error } = await supabaseAdmin.storage
        .from(SUPABASE_BUCKET)
        .createSignedUploadUrl(path);

      if (error) throw error;

      return {
        originalName: f.name,
        path,
        signedUrl: data.signedUrl,
        token: data.token,
      };
    }));

    res.json({ signed });
  } catch (e: any) {
    console.error('sign error', e);
    res.status(500).json({ error: e.message });
  }
});

// 3. الجديد: بعد ما المتصفح رفع مباشرة لـ Supabase، سجل في Redis
app.post('/api/upload/complete', async (req, res) => {
  try {
    const { section, type, files } = req.body as {
      section: string;
      type: 'image' | 'song' | 'video';
      files: { path: string; title?: string; artist?: string }[];
    };

    if (!section || !files?.length) return res.status(400).json({ error: 'Missing data' });

    // بناء الـ public URL
    const filesWithUrl = files.map(f => ({
      id: uuidv4(),
      url: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${f.path}`,
      path: f.path,
      title: f.title || f.path.split('/').pop(),
      artist: f.artist,
      section,
      type,
      createdAt: new Date().toISOString(),
    }));

    // نفس طريقة التخزين القديمة بتاعتك - Redis list per section
    const redisKey = `media:${section}:${type}`;
    for (const file of filesWithUrl) {
      await redis.lpush(redisKey, JSON.stringify(file));
    }

    res.json({ success: true, files: filesWithUrl });
  } catch (e: any) {
    console.error('complete error', e);
    res.status(500).json({ error: e.message });
  }
});

export default app;
