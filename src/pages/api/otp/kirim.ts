import type { APIRoute } from 'astro';
import { getTicketById, saveOtp } from '../../../lib/sheets';
import { sendOtpEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { ticketId, email } = await request.json();

        if (!ticketId || !email) {
            return new Response(JSON.stringify({ error: 'ticketId dan email wajib diisi' }), {
                status: 400, headers: { 'Content-Type': 'application/json' },
            });
        }

        // Cek tiket ada dan email cocok
        const ticket = await getTicketById(ticketId);
        if (!ticket) {
            return new Response(JSON.stringify({ error: 'Tiket tidak ditemukan' }), {
                status: 404, headers: { 'Content-Type': 'application/json' },
            });
        }

        if (ticket.email.toLowerCase() !== email.toLowerCase()) {
            return new Response(JSON.stringify({ error: 'Email tidak sesuai dengan data tiket' }), {
                status: 403, headers: { 'Content-Type': 'application/json' },
            });
        }

        // Generate OTP 6 digit
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        saveOtp(ticketId, email, otp);

        // Kirim OTP via email
        await sendOtpEmail({ toName: ticket.name, toEmail: email, ticketId, otp });

        return new Response(JSON.stringify({ success: true, message: 'OTP dikirim ke email Anda' }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        console.error('[POST /api/otp/kirim]', err.message);
        return new Response(JSON.stringify({ error: 'Gagal mengirim OTP', detail: err.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }
};