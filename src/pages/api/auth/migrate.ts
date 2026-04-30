import type { APIRoute } from 'astro';
import { getAllAdmins, hashExistingPassword } from '../../../lib/sheets';

// GET /api/auth/migrate — jalankan SEKALI lalu hapus file ini
export const GET: APIRoute = async ({ request }) => {
  // Proteksi dengan secret key
  const key = new URL(request.url).searchParams.get('key');
  if (key !== process.env.ADMIN_SECRET_TOKEN) {
    return new Response(JSON.stringify({ error: 'Akses ditolak' }), { status: 401 });
  }

  try {
    const admins  = await getAllAdmins();
    const results = [];

    for (const admin of admins) {
      if (!admin.password.startsWith('$2')) {
        await hashExistingPassword(admin.username);
        results.push({ username: admin.username, status: 'hashed' });
      } else {
        results.push({ username: admin.username, status: 'already_hashed' });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};