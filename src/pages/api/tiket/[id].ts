import type { APIRoute } from 'astro';
import { getTicketById, updateTicketStatus, getRepliesByTicketId } from '../../../lib/sheets';

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

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    if (!verifyToken(request)) {
      return new Response(JSON.stringify({ error: 'Token tidak valid, akses ditolak' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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