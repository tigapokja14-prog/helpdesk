import type { APIRoute } from 'astro';
import { getTicketById, updateTicketStatus, getRepliesByTicketId, deleteTicket } from '../../../lib/sheets';
import { requireAuth } from '../../../lib/auth';

// GET /api/tiket/:id
export const GET: APIRoute = async ({ params }) => {
  try {
    const ticket = await getTicketById(params.id!);
    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Tiket tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const replies = await getRepliesByTicketId(params.id!);
    return new Response(JSON.stringify({ ...ticket, replies }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Gagal mengambil tiket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/tiket/:id — Update status
export const PATCH: APIRoute = async ({ params, request }) => {
  const auth = requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const { status } = await request.json();
    const validStatuses = ['Menunggu', 'Dalam Proses', 'Selesai', 'Ditolak'];

    if (!status || !validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: `Status tidak valid. Pilih: ${validStatuses.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await updateTicketStatus(params.id!, status);
    return new Response(JSON.stringify({ success: true, status }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Gagal memperbarui status', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/tiket/:id — Hapus tiket (superadmin only)
export const DELETE: APIRoute = async ({ params, request }) => {
  const auth = requireAuth(request);
  if (auth instanceof Response) return auth;

  if (auth.role !== 'superadmin') {
    return new Response(JSON.stringify({ error: 'Hanya superadmin yang dapat menghapus tiket' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await deleteTicket(params.id!);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[DELETE /api/tiket/:id]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal menghapus tiket', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};