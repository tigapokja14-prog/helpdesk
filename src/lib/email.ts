import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const FROM = `HelpDeskID <${process.env.GMAIL_USER}>`;
const ADMIN = process.env.EMAIL_ADMIN || process.env.GMAIL_USER || '';

// ─── Email konfirmasi ke pengirim tiket ──────────────────────
export async function sendTicketConfirmation(ticket: {
    id: string;
    name: string;
    email: string;
    subject: string;
    jenisLaporan: string;
    category: string;
}) {
    await transporter.sendMail({
        from: FROM,
        to: ticket.email,
        subject: `[${ticket.id}] Tiket Anda Berhasil Dikirim`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 24px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">HelpDeskID</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Pusat Bantuan Resmi</p>
        </div>

        <h2 style="color: #1E293B; margin: 0 0 8px;">Tiket Berhasil Dikirim ✅</h2>
        <p style="color: #64748B;">Halo <strong>${ticket.name}</strong>, laporan Anda telah kami terima.</p>

        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748B; font-size: 14px; width: 140px;">ID Tiket</td>
              <td style="padding: 8px 0; font-weight: 700; color: #3B82F6; font-size: 18px; letter-spacing: 1px;">${ticket.id}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Subjek</td>
              <td style="padding: 8px 0; font-weight: 600; color: #1E293B;">${ticket.subject}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Jenis</td>
              <td style="padding: 8px 0; color: #1E293B;">${ticket.jenisLaporan}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Kategori</td>
              <td style="padding: 8px 0; color: #1E293B;">${ticket.category}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Status</td>
              <td style="padding: 8px 0;">
                <span style="background: #FFF3CD; color: #856404; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">⏳ Menunggu</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; color: #1E40AF; font-size: 14px;">
            💡 <strong>Simpan ID Tiket Anda:</strong>
            <code style="background: #DBEAFE; padding: 2px 8px; border-radius: 4px; font-size: 16px; font-weight: 700;">${ticket.id}</code>
            <br/>Gunakan ID ini untuk mengecek status tiket kapan saja.
          </p>
        </div>

        <p style="color: #64748B; font-size: 14px; text-align: center;">
          Tim kami akan merespons dalam <strong>1x24 jam kerja</strong>.
        </p>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Email ini dikirim otomatis. Jangan membalas email ini.
        </p>
      </div>
    `,
    });
}

// ─── Email notifikasi ke admin ────────────────────────────────
export async function sendAdminNotification(ticket: {
    id: string;
    name: string;
    email: string;
    subject: string;
    peran: string;
    jenisLaporan: string;
    category: string;
    description: string;
}) {
    if (!ADMIN) return;

    await transporter.sendMail({
        from: FROM,
        to: ADMIN,
        subject: `[Tiket Baru] ${ticket.id} — ${ticket.subject}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1E293B; margin: 0 0 16px;">🔔 Tiket Baru Masuk</h2>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748B; font-size: 14px; width: 140px;">ID Tiket</td>
              <td style="padding: 8px 0; font-weight: 700; color: #3B82F6;">${ticket.id}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Nama</td>
              <td style="padding: 8px 0; font-weight: 600;">${ticket.name}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Email</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${ticket.email}" style="color: #3B82F6;">${ticket.email}</a>
              </td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Peran</td>
              <td style="padding: 8px 0;">${ticket.peran}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Jenis</td>
              <td style="padding: 8px 0;">${ticket.jenisLaporan}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Kategori</td>
              <td style="padding: 8px 0;">${ticket.category}</td>
            </tr>
            <tr style="border-top: 1px solid #F1F5F9;">
              <td style="padding: 8px 0; color: #64748B; font-size: 14px;">Subjek</td>
              <td style="padding: 8px 0; font-weight: 600;">${ticket.subject}</td>
            </tr>
          </table>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <div style="font-size: 13px; color: #64748B; font-weight: 600; margin-bottom: 8px;">DESKRIPSI</div>
          <p style="margin: 0; color: #1E293B; font-size: 14px; line-height: 1.6;">${ticket.description}</p>
        </div>

        <a href="${process.env.PUBLIC_APP_URL || 'https://helpdesk-pi-azure.vercel.app'}/admin"
          style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #3B82F6, #06B6D4); color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
          Buka Panel Admin →
        </a>
      </div>
    `,
    });
}

// ─── Email balasan ke pengirim tiket ─────────────────────────
export async function sendReplyNotification(data: {
    ticketId: string;
    ticketSubject: string;
    toName: string;
    toEmail: string;
    replyText: string;
    fromName: string;
}) {
    await transporter.sendMail({
        from: FROM,
        to: data.toEmail,
        subject: `[${data.ticketId}] Ada balasan untuk laporan Anda`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 32px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); padding: 24px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">HelpDeskID</h1>
        </div>

        <h2 style="color: #1E293B; margin: 0 0 8px;">Ada Balasan untuk Tiket Anda 💬</h2>
        <p style="color: #64748B;">Halo <strong>${data.toName}</strong>, tim kami telah membalas laporan Anda.</p>

        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="font-size: 12px; color: #64748B; margin-bottom: 4px;">TIKET</div>
          <div style="font-weight: 700; color: #3B82F6; margin-bottom: 4px;">${data.ticketId}</div>
          <div style="font-size: 14px; color: #1E293B;">${data.ticketSubject}</div>
        </div>

        <div style="background: #EFF6FF; border-left: 4px solid #3B82F6; border-radius: 0 10px 10px 0; padding: 16px 20px; margin: 20px 0;">
          <div style="font-size: 12px; color: #3B82F6; font-weight: 700; margin-bottom: 8px;">
            BALASAN DARI ${data.fromName.toUpperCase()}
          </div>
          <p style="margin: 0; color: #1E293B; font-size: 15px; line-height: 1.6;">${data.replyText}</p>
        </div>

        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Email ini dikirim otomatis. Jangan membalas email ini.
        </p>
      </div>
    `,
    });
}