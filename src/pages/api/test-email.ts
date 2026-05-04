import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({
        GMAIL_USER: process.env.GMAIL_USER || 'KOSONG',
        GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'ada' : 'KOSONG',
        EMAIL_ADMIN: process.env.EMAIL_ADMIN || 'KOSONG',
        PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || 'KOSONG',
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};