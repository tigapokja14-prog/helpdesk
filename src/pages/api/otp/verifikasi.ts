import type { APIRoute } from 'astro';
import { verifyOtp } from '../../../lib/sheets';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { ticketId, email, otp } = await request.json();

        if (!ticketId || !email || !otp) {
            return new Response(JSON.stringify({ error: 'ticketId, email, dan otp wajib diisi' }), {
                status: 400, headers: { 'Content-Type': 'application/json' },
            });
        }

        const valid = verifyOtp(ticketId, email, otp);
        if (!valid) {
            return new Response(JSON.stringify({ error: 'OTP tidak valid atau sudah kadaluarsa' }), {
                status: 401, headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Verifikasi berhasil' }), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        });

    } catch (err: any) {
        return new Response(JSON.stringify({ error: 'Gagal verifikasi OTP' }), {
            status: 500, headers: { 'Content-Type': 'application/json' },
        });
    }
};