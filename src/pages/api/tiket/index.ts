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
  } catch (err) {
    console.error('[GET /api/tiket]', err);
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
    const { name, email, subject, category, priority, description, attachment } = body;

    if (!name || !email || !subject || !description) {
      return new Response(
        JSON.stringify({ error: 'Field nama, email, subjek, dan deskripsi wajib diisi' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format email tidak valid' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await createTicket({
      name, email, subject,
      category:    category || 'Lainnya',
      priority:    priority || 'Sedang',
      description,
      attachment:  attachment || '',
    });

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[POST /api/tiket]', err);
    return new Response(JSON.stringify({ error: 'Gagal membuat tiket' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
