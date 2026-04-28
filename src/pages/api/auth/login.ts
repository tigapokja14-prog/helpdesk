import type { APIRoute } from 'astro';
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
            return new Response(JSON.stringify({ error: 'Username atau password salah' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Buat session token: username|role|timestamp
        const sessionToken = Buffer.from(
            `${admin.username}|${admin.role}|${Date.now()}|${process.env.ADMIN_SECRET_TOKEN}`
        ).toString('base64');

        return new Response(JSON.stringify({
            success: true,
            token: sessionToken,
            nama: admin.nama,
            role: admin.role,
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