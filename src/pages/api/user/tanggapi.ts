import type { APIRoute } from 'astro';
import { getTicketById, addReply, updateTicketStatusByUser } from '../../../lib/sheets';
import { sendAdminNewReplyNotification } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { ticketId, text, status } = await request.json();

        if (!ticketId) {
            return new Response(JSON.stringify({ error: 'ticketId wajib diisi' }), {
                status: 400, headers: { 'Content-Type': 'application/json' },
            });
        }

        const ticket = await getTicketById(ticketId);
        if (!ticket) {
            return new Response(JSON.stringify({ error: 'Tiket tidak ditemukan' }), {
                status: 404, headers: { 'Content-Type': 'application/json' },
            });
        }

        // Simpan balasan user jika ada teks
        if (text?.trim()) {
            await addReply(ticketId, ticket.name, text.trim());

            // Notifikasi ke admin
            sendAdminNewReplyNotification({
                ticketId,
                ticketSubject: ticket.subject,
                fromName: ticket.name,
                fromEmail: ticket.email,
                replyText: text.trim(),
            }).catch(err => console.error('Email notif admin gagal:', err.message));
        }

        // Update status jika ada
        if (status) {
            await updateTicketStatusByUser(ticketId, status);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error('[POST /api/user/tanggapi]', err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }
};