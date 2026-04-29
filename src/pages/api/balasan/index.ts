import type { APIRoute } from 'astro';
import { addReply, getTicketById } from '../../../lib/sheets';

function verifyToken(request: Request): boolean {
  const adminToken = process.env.ADMIN_SECRET_TOKEN ?? '';
  const authHeader = request.headers.get('Authorization') ?? '';
  const sentToken  = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();
  try {
    const decoded = Buffer.from(sentToken, 'base64').toString('utf8');
    return adminToken !== '' && decoded.includes(adminToken);
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!verifyToken(request)) {
      return new Response(JSON.stringify({ error: 'Token tidak valid, akses ditolak' }), {
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
    return new Response(JSON.stringify({ error: 'Gagal mengirim balasan', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};