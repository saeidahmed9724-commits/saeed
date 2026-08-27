import { createClient } from '@supabase/supabase-js';

// Uses the PUBLIC anon key (safe to expose in the browser bundle) — this is
// different from the SUPABASE_SECRET_KEY used on the server. Add it to your
// Vercel project's environment variables as VITE_SUPABASE_ANON_KEY.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

const STORAGE_BUCKET = 'user-media';

export type UploadCategory = 'gallery' | 'song' | 'video' | 'memory' | 'voice';

export interface DirectUploadItem {
  file: File;
  title?: string;
  description?: string;
  date?: string;
  artist?: string;
}

interface SignedFile {
  fileName: string;
  path: string;
  token: string;
  signedUrl: string;
}

/**
 * Uploads one or more files straight to Supabase Storage from the browser,
 * then registers the resulting URLs with the backend. The raw file bytes
 * never pass through the Vercel serverless function, so this works for
 * songs and videos of any reasonable size (previously blocked by Vercel's
 * ~4.5MB request-body limit on /api/upload).
 */
export async function uploadFilesDirect(
  role: 'Dodo' | 'SO',
  category: UploadCategory,
  items: DirectUploadItem[]
) {
  if (items.length === 0) return;

  // Step 1: ask the server for one signed upload URL per file.
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      category,
      files: items.map(i => ({ fileName: i.file.name, contentType: i.file.type }))
    })
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get signed upload URLs');
  }

  const { signed }: { signed: SignedFile[] } = await signRes.json();

  // Step 2: upload each file directly to Supabase Storage (bypasses Vercel entirely).
  for (let i = 0; i < items.length; i++) {
    const { path, token } = signed[i];
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .uploadToSignedUrl(path, token, items[i].file);

    if (error) {
      throw new Error(`Failed to upload "${items[i].file.name}": ${error.message}`);
    }
  }

  // Step 3: tell the server the uploads are done so it can save metadata
  // (this request body is tiny — just paths and text fields, no file data).
  const first = items[0];
  const completeRes = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      category,
      title: first.title,
      description: first.description,
      date: first.date,
      artist: first.artist,
      items: signed.map((s, idx) => ({ path: s.path, fileName: items[idx].file.name }))
    })
  });

  if (!completeRes.ok) {
    const err = await completeRes.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save uploaded file metadata');
  }

  return completeRes.json();
}
