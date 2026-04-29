import type { APIRoute } from 'astro';
import { v2 as cloudinary } from 'cloudinary';

const ALLOWED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME  || '';
    const apiKey    = process.env.CLOUDINARY_API_KEY     || '';
    const apiSecret = process.env.CLOUDINARY_API_SECRET  || '';

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(JSON.stringify({
        error:  'Konfigurasi Cloudinary tidak lengkap',
        detail: `cloud_name=${cloudName || 'kosong'}`
      }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    // Baca body sebagai text dulu untuk debug
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({
        error: 'Content-Type harus multipart/form-data',
        received: contentType,
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    console.log('File:', file?.name, file?.type, file?.size);

    if (!file) {
      return new Response(JSON.stringify({ error: 'File tidak ditemukan dalam request' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ error: `Tipe file tidak diizinkan: ${file.type}` }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Ukuran file maksimal 10MB' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64      = Buffer.from(arrayBuffer).toString('base64');
    const dataUri     = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder:        'helpdesk-lampiran',
      resource_type: 'auto',
      public_id:     `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    });

    console.log('Upload berhasil:', result.secure_url);

    return new Response(JSON.stringify({
      fileName: file.name,
      fileUrl:  result.secure_url,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[POST /api/upload] ERROR:', err.message);
    return new Response(JSON.stringify({
      error:  'Gagal mengupload file',
      detail: err.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};