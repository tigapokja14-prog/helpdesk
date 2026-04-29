import type { APIRoute } from 'astro';
import { getAllTickets, createTicket } from '../../../lib/sheets';

// GET /api/tiket — Ambil semua tiket
export const GET: APIRoute = async () => {
  try {
    const tickets = await getAllTickets();
    return new Response(JSON.stringify(tickets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[GET /api/tiket]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal mengambil data tiket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/tiket — Buat tiket baru
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      name, email, subject, description, attachment,
      peran, jenisLaporan, category, priority,
    } = body;

    if (!name || !email || !subject || !description) {
      return new Response(
        JSON.stringify({ error: 'Field nama, email, subjek, dan deskripsi wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format email tidak valid' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await createTicket({
      name,
      email,
      subject,
      description,
      peran:        peran        || 'Lainnya',
      jenisLaporan: jenisLaporan || 'Pertanyaan/Informasi',
      category:     category     || 'Umum',
      priority:     priority     || 'Sedang',
      attachment:   attachment   || '',
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[POST /api/tiket]', err.message);
    return new Response(JSON.stringify({ error: 'Gagal membuat tiket', detail: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};