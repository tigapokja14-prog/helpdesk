import type { APIRoute } from 'astro';
import { addReply, getTicketById } from '../../../lib/sheets';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Baca langsung dari process.env saja
    const adminToken = process.env.ADMIN_SECRET_TOKEN ?? '';
    const authHeader = request.headers.get('Authorization') ?? '';
    const sentToken = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : authHeader.trim();


    if (!adminToken) {
      return new Response(JSON.stringify({ error: 'ADMIN_SECRET_TOKEN belum diset di server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (sentToken !== adminToken) {
      return new Response(JSON.stringify({ error: 'Akses ditolak' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { ticketId, text } = await request.json();

    if (!ticketId || !text?.trim()) {
      return new Response(JSON.stringify({ error: 'ticketId dan text wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Tiket tidak ditemukan' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const reply = await addReply(ticketId, 'Admin', text.trim());
    return new Response(JSON.stringify(reply), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[POST /api/balasan]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal mengirim balasan', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};