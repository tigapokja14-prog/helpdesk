import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  return new Response(JSON.stringify({ 
    ok: true,
    message: 'Upload endpoint aktif',
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'kosong'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    ok: true,
    message: 'Upload endpoint aktif via GET'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};