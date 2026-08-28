import { createClient } from '@supabase/supabase-js';

// Public/anon key - safe to expose in the browser (different from the secret key used on the server).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const STORAGE_BUCKET = 'user-media';

export interface UploadFileItem {
  file: File;
  title?: string;
  artist?: string;
}

export interface UploadMetadata {
  title?: string;
  description?: string;
  date?: string;
  artist?: string;
}

/**
 * Uploads one or more files directly from the browser to Supabase Storage,
 * then tells the backend (which uses Redis) to record the new items.
 * This avoids Vercel's ~4.5MB request size limit entirely, since the file
 * bytes never pass through the Vercel serverless function.
 */
export async function uploadFilesDirect(
  role: 'Dodo' | 'SO',
  category: 'gallery' | 'song' | 'video' | 'memory',
  items: UploadFileItem[],
  metadata: UploadMetadata = {}
): Promise<any> {
  if (!items || items.length === 0) {
    throw new Error('No files provided');
  }

  // Step 1: Ask the backend for a signed upload URL for each file.
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      category,
      files: items.map((it) => ({
        fileName: it.file.name,
        contentType: it.file.type
      }))
    })
  });

  const signData = await signRes.json();
  if (!signRes.ok || !signData.success) {
    throw new Error(signData.error || 'Failed to get signed upload URL');
  }

  // Step 2: Upload each file directly to Supabase Storage using its signed token.
  const uploadedItems: Array<{ path: string; fileName: string }> = [];

  for (let i = 0; i < signData.items.length; i++) {
    const { path, token } = signData.items[i];
    const file = items[i].file;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .uploadToSignedUrl(path, token, file);

    if (uploadError) {
      throw uploadError;
    }

    uploadedItems.push({ path, fileName: file.name });
  }

  // Step 3: Tell the backend the uploads are done, so it can save the metadata
  // (title, description, date, artist, public URL) into the shared state.
  const completeRes = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      category,
      title: metadata.title || '',
      description: metadata.description || '',
      date: metadata.date || new Date().toISOString().split('T')[0],
      artist: metadata.artist || '',
      items: uploadedItems
    })
  });

  const completeData = await completeRes.json();
  if (!completeRes.ok || !completeData.success) {
    throw new Error(completeData.error || 'Failed to save uploaded file metadata');
  }

  return completeData;
}
