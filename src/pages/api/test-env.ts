import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    GOOGLE_SHEET_ID:        process.env.GOOGLE_SHEET_ID        ? 'ada' : 'KOSONG',
    GOOGLE_CREDENTIALS_JSON:process.env.GOOGLE_CREDENTIALS_JSON? 'ada' : 'KOSONG',
    ADMIN_SECRET_TOKEN:     process.env.ADMIN_SECRET_TOKEN     ? 'ada' : 'KOSONG',
    CLOUDINARY_CLOUD_NAME:  process.env.CLOUDINARY_CLOUD_NAME  || 'KOSONG',
    CLOUDINARY_API_KEY:     process.env.CLOUDINARY_API_KEY     ? 'ada' : 'KOSONG',
    CLOUDINARY_API_SECRET:  process.env.CLOUDINARY_API_SECRET  ? 'ada' : 'KOSONG',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};