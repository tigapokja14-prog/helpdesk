import type { APIRoute } from 'astro';
import { addReply, getTicketById } from '../../../lib/sheets';
import { requireAuth } from '../../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  const auth = requireAuth(request);
  if (auth instanceof Response) return auth;

  try {
    const { ticketId, text } = await request.json();

    if (!ticketId || !text?.trim()) {
      return new Response(JSON.stringify({ error: 'ticketId dan text wajib diisi' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const ticket = await getTicketById(ticketId);
    if (!ticket) {
      return new Response(JSON.stringify({ error: 'Tiket tidak ditemukan' }), {
        status: 404, headers: { 'Content-Type': 'application/json' },
      });
    }

    const reply = await addReply(ticketId, auth.nama, text.trim());
    return new Response(JSON.stringify(reply), {
      status: 201, headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'Gagal mengirim balasan', detail: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};