import type { APIRoute } from 'astro';
import { getAllAdmins, addAdmin, deleteAdmin } from '../../../lib/sheets';
import { requireAuth } from '../../../lib/auth';

// GET — Ambil semua admin
export const GET: APIRoute = async ({ request }) => {
  const auth = requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const admins = await getAllAdmins();
    const safe   = admins.map(({ username, nama, role }) => ({ username, nama, role }));
    return new Response(JSON.stringify(safe), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

// POST — Tambah admin baru (superadmin only)
export const POST: APIRoute = async ({ request }) => {
  const auth = requireAuth(request);
  if (auth instanceof Response) return auth;

  if (auth.role !== 'superadmin') {
    return new Response(JSON.stringify({ error: 'Hanya superadmin yang dapat menambah admin' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
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

// DELETE — Hapus admin (superadmin only)
export const DELETE: APIRoute = async ({ request }) => {
  const auth = requireAuth(request);
  if (auth instanceof Response) return auth;

  if (auth.role !== 'superadmin') {
    return new Response(JSON.stringify({ error: 'Hanya superadmin yang dapat menghapus admin' }), {
      status: 403, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { username } = await request.json();
    if (!username) {
      return new Response(JSON.stringify({ error: 'Username wajib diisi' }), { status: 400 });
    }
    // Cegah hapus diri sendiri
    if (username === auth.username) {
      return new Response(JSON.stringify({ error: 'Tidak bisa menghapus akun sendiri' }), { status: 400 });
    }
    await deleteAdmin(username);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};