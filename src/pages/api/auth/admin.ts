import type { APIRoute } from 'astro';
import { getAllAdmins, addAdmin, deleteAdmin } from '../../../lib/sheets';

function verifyToken(request: Request): boolean {
    const auth = request.headers.get('Authorization') ?? '';
    const token = auth.replace('Bearer ', '').trim();
    if (!token) return false;
    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        return decoded.includes(process.env.ADMIN_SECRET_TOKEN ?? '');
    } catch {
        return false;
    }
}

// GET /api/auth/admins — Ambil semua admin
export const GET: APIRoute = async ({ request }) => {
    if (!verifyToken(request)) {
        return new Response(JSON.stringify({ error: 'Akses ditolak' }), { status: 401 });
    }
    try {
        const admins = await getAllAdmins();
        // Jangan kirim password ke frontend
        const safe = admins.map(({ username, nama, role }) => ({ username, nama, role }));
        return new Response(JSON.stringify(safe), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

// POST /api/auth/admins — Tambah admin baru (hanya superadmin)
export const POST: APIRoute = async ({ request }) => {
    if (!verifyToken(request)) {
        return new Response(JSON.stringify({ error: 'Akses ditolak' }), { status: 401 });
    }
    try {
        const { username, password, nama, role } = await request.json();
        if (!username || !password || !nama) {
            return new Response(JSON.stringify({ error: 'Username, password, dan nama wajib diisi' }), { status: 400 });
        }
        await addAdmin({ username, password, nama, role: role || 'admin' });
        return new Response(JSON.stringify({ success: true }), { status: 201 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};

// DELETE /api/auth/admins — Hapus admin
export const DELETE: APIRoute = async ({ request }) => {
    if (!verifyToken(request)) {
        return new Response(JSON.stringify({ error: 'Akses ditolak' }), { status: 401 });
    }
    try {
        const { username } = await request.json();
        if (!username) {
            return new Response(JSON.stringify({ error: 'Username wajib diisi' }), { status: 400 });
        }
        await deleteAdmin(username);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
};