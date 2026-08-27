// src/uploadService.ts - النسخة النهائية المحسنة
// يحل مشكلة 4.5MB بتاعة فيرسل نهائيا

type UploadItemInput = {
  file: File;
  title?: string;
  artist?: string;
  description?: string;
  date?: string;
};

export async function uploadFilesDirect(
  section: string,
  category: string,
  items: UploadItemInput[],
  onProgress?: (msg: string) => void
) {
  if (!items.length) return null;

  onProgress?.('جاري طلب روابط الرفع الآمنة...');

  // 1. اطلب Signed URLs - JSON وزنه بايتات بس
  const signRes = await fetch('/api/upload/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: items.map(i => ({
        name: i.file.name,
        type: i.file.type,
        section,
      })),
      section,
      category,
    }),
  });

  if (!signRes.ok) {
    const t = await signRes.text();
    throw new Error(`Sign failed: ${t}`);
  }

  const { signed } = await signRes.json() as {
    signed: { path: string; signedUrl: string; token: string }[]
  };

  onProgress?.(`جاري رفع ${items.length} ملفات مباشرة لـ Supabase...`);

  // 2. ارفع مباشر من المتصفح لـ Supabase (مبيعديش على فيرسل)
  // نرفعهم واحد واحد عشان نقدر نعمل progress
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const target = signed[idx];
    
    onProgress?.(`رفع ${idx + 1}/${items.length}: ${item.file.name} (${(item.file.size / 1024 / 1024).toFixed(2)} MB)`);

    const uploadRes = await fetch(target.signedUrl, {
      method: 'PUT',
      body: item.file,
      headers: {
        'Content-Type': item.file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
    });

    if (!uploadRes.ok) {
      throw new Error(`فشل رفع ${item.file.name}: ${uploadRes.statusText}`);
    }
  }

  onProgress?.('جاري حفظ البيانات...');

  // 3. بلغ الباك اند ان الرفع خلص عشان يسجل في Redis / DB
  const completeRes = await fetch('/api/upload/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: section, // الدور القديم
      section,
      category,
      title: items[0]?.title || '',
      description: items[0]?.description || '',
      date: items[0]?.date || new Date().toISOString().split('T')[0],
      artist: items[0]?.artist || '',
      files: items.map((item, idx) => ({
        path: signed[idx].path,
        fileName: item.file.name,
        title: item.title,
        artist: item.artist,
      })),
    }),
  });

  if (!completeRes.ok) {
    const t = await completeRes.text();
    throw new Error(`Complete failed: ${t}`);
  }

  const data = await completeRes.json();
  return data; // فيه data.state و data.success
}
