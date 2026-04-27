import type { APIRoute } from 'astro';
import {
  getTicketById,
  updateTicketStatus,
  getRepliesByTicketId,
} from '../../../lib/sheets';

// GET /api/tiket/:id
export const GET: APIRoute = async ({ params }) => {
  try {
    const id = params.id!;
    const ticket = await getTicketById(id);

    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Tiket tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const replies = await getRepliesByTicketId(id);
    return new Response(JSON.stringify({ ...ticket, replies }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[GET /api/tiket/:id]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal mengambil tiket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/tiket/:id
export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    // Baca token dari semua kemungkinan sumber
    const adminToken =
      import.meta.env.ADMIN_SECRET_TOKEN ||
      process.env.ADMIN_SECRET_TOKEN;

    const authHeader = request.headers.get('Authorization') || '';
    const sentToken = authHeader.replace('Bearer ', '').trim();

    console.log('[PATCH] adminToken dari env:', adminToken);
    console.log('[PATCH] token dari request :', sentToken);

    if (!adminToken) {
      return new Response(JSON.stringify({ error: 'ADMIN_SECRET_TOKEN tidak dikonfigurasi di server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (sentToken !== adminToken) {
      return new Response(JSON.stringify({ error: 'Token tidak valid, akses ditolak' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { status } = body;

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
    console.error('[PATCH /api/tiket/:id]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal memperbarui status', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};