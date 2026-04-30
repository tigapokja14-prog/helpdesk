import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import { loginAdmin } from '../../../lib/sheets';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Username dan password wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const admin = await loginAdmin(username, password);

    if (!admin) {
      // Pesan error yang sama untuk username/password salah
      // agar tidak bisa ditebak mana yang salah
      return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_SECRET_TOKEN || '';
    if (!jwtSecret) throw new Error('JWT_SECRET tidak dikonfigurasi');

    // Buat JWT token dengan expiry 8 jam
    const token = jwt.sign(
      {
        username: admin.username,
        role:     admin.role,
        nama:     admin.nama,
      },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return new Response(JSON.stringify({
      success:  true,
      token,
      nama:     admin.nama,
      role:     admin.role,
      username: admin.username,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[POST /api/auth/login]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal login', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};