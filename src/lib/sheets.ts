
import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// ─── Inisialisasi Auth ────────────────────────────────────────
function getAuth() {
  const credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const credsPath = process.env.GOOGLE_CREDENTIALS_PATH;

  let credentials;
  if (credsJson) {
    credentials = JSON.parse(credsJson);
  } else if (credsPath) {
    credentials = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  } else {
    throw new Error('Google credentials tidak ditemukan');
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';

// ─── Tipe Data ────────────────────────────────────────────────
export interface Ticket {
  id: string;
  name: string;
  email: string;
  peran: string;
  jenisLaporan: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  attachment: string;
  created: string;
  updated: string;
}

export interface Reply {
  ticketId: string;
  from: string;
  text: string;
  time: string;
}

export interface Admin {
  username: string;
  password: string;
  nama: string;
  role: string;
}

// ─── Ambil semua tiket ───────────────────────────────────────
export async function getAllTickets(): Promise<Ticket[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tiket!A2:M',
  });

  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: row[0] || '',
    name: row[1] || '',
    email: row[2] || '',
    peran: row[3] || '',
    jenisLaporan: row[4] || '',
    subject: row[5] || '',
    category: row[6] || '',
    priority: row[7] || '',
    status: row[8] || '',
    description: row[9] || '',
    attachment: row[10] || '',
    created: row[11] || '',
    updated: row[12] || '',
  }));
}

// ─── Ambil tiket by ID ───────────────────────────────────────
export async function getTicketById(id: string): Promise<Ticket | null> {
  const all = await getAllTickets();
  return all.find((t) => t.id === id) || null;
}

// ─── Buat tiket baru ─────────────────────────────────────────
export async function createTicket(data: {
  name: string;
  email: string;
  peran: string;
  jenisLaporan: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachment: string;
}): Promise<{ id: string; status: string; created: string }> {
  const sheets = getSheets();
  const id = 'TKT-' + nanoid(6).toUpperCase();
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Tiket!A:M',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        id,
        data.name,
        data.email,
        data.peran,
        data.jenisLaporan,
        data.subject,
        data.category,
        data.priority,
        'Menunggu',
        data.description,
        data.attachment,
        now,
        now,
      ]],
    },
  });

  return { id, status: 'Menunggu', created: now };
}

// ─── Update status tiket ─────────────────────────────────────
export async function updateTicketStatus(id: string, status: string): Promise<void> {
  const sheets = getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tiket!A:A',
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) throw new Error('Tiket tidak ditemukan');

  const sheetRow = rowIndex + 1;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: [
        { range: `Tiket!I${sheetRow}`, values: [[status]] },
        { range: `Tiket!M${sheetRow}`, values: [[new Date().toISOString()]] },
      ],
    },
  });
}

// ─── Ambil balasan by Tiket ID ───────────────────────────────
export async function getRepliesByTicketId(ticketId: string): Promise<Reply[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Balasan!A2:D',
  });

  const rows = res.data.values || [];
  return rows
    .filter((row) => row[0] === ticketId)
    .map((row) => ({
      ticketId: row[0] || '',
      from: row[1] || '',
      text: row[2] || '',
      time: row[3] || '',
    }));
}

// ─── Tambah balasan ──────────────────────────────────────────
export async function addReply(ticketId: string, from: string, text: string): Promise<Reply> {
  const sheets = getSheets();
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Balasan!A:D',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[ticketId, from, text, now]],
    },
  });

  return { ticketId, from, text, time: now };
}

// ─── Ambil semua admin ────────────────────────────────────────
export async function getAllAdmins(): Promise<Admin[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Admin!A2:D',
  });

  const rows = res.data.values || [];
  return rows.map((row) => ({
    username: row[0] || '',
    password: row[1] || '',
    nama: row[2] || '',
    role: row[3] || 'admin',
  }));
}

// ─── Login admin ──────────────────────────────────────────────

export async function loginAdmin(username: string, password: string): Promise<Admin | null> {
  const admins = await getAllAdmins();
  const found = admins.find(a => a.username === username);
  if (!found) return null;

  // Cek apakah password sudah di-hash atau masih plain text
  const isHashed = found.password.startsWith('$2');
  const valid = isHashed
    ? await bcrypt.compare(password, found.password)
    : found.password === password;  // fallback untuk password lama

  return valid ? found : null;
}

// ─── Tambah admin baru ────────────────────────────────────────
export async function addAdmin(data: {
  username: string;
  password: string;
  nama: string;
  role: string;
}): Promise<void> {
  const sheets = getSheets();
  const existing = await getAllAdmins();

  if (existing.find(a => a.username === data.username)) {
    throw new Error(`Username "${data.username}" sudah digunakan`);
  }

  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(data.password, 12);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Admin!A:D',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[data.username, hashedPassword, data.nama, data.role]],
    },
  });
}

// ─── Hapus admin ──────────────────────────────────────────────
export async function deleteAdmin(username: string): Promise<void> {
  const sheets = getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Admin!A:A',
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === username);
  if (rowIndex === -1) throw new Error('Admin tidak ditemukan');

  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const adminSheet = sheetMeta.data.sheets?.find((s) => s.properties?.title === 'Admin');
  const sheetId = adminSheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });
}

// ─── Hash password lama (migrasi) ────────────────────────────
export async function hashExistingPassword(username: string): Promise<void> {
  const sheets = getSheets();
  const admins = await getAllAdmins();
  const idx = admins.findIndex(a => a.username === username);
  if (idx === -1) throw new Error('Admin tidak ditemukan');

  // Skip jika sudah di-hash
  if (admins[idx].password.startsWith('$2')) return;

  const hashed = await bcrypt.hash(admins[idx].password, 12);
  const sheetRow = idx + 2; // +2 karena baris 1 = header, index mulai 0

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `Admin!B${sheetRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[hashed]] },
  });
}

// ─── Hapus tiket ─────────────────────────────────────────────
export async function deleteTicket(id: string): Promise<void> {
  const sheets = getSheets();

  // Cari baris tiket berdasarkan ID
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tiket!A:A',
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex === -1) throw new Error('Tiket tidak ditemukan');

  // Ambil sheetId dari tab Tiket
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const tiketSheet = sheetMeta.data.sheets?.find(s => s.properties?.title === 'Tiket');
  const sheetId = tiketSheet?.properties?.sheetId;

  // Hapus baris
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });

  // Hapus juga semua balasan tiket ini
  await deleteRepliesByTicketId(id);
}

// ─── Hapus semua balasan tiket ────────────────────────────────
export async function deleteRepliesByTicketId(ticketId: string): Promise<void> {
  const sheets = getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Balasan!A:A',
  });

  const rows = res.data.values || [];
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const balasanSheet = sheetMeta.data.sheets?.find(s => s.properties?.title === 'Balasan');
  const sheetId = balasanSheet?.properties?.sheetId;

  // Kumpulkan index baris yang perlu dihapus (dari bawah ke atas)
  const toDelete = rows
    .map((r, i) => ({ val: r[0], idx: i }))
    .filter(r => r.val === ticketId)
    .reverse(); // hapus dari bawah agar index tidak bergeser

  for (const row of toDelete) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: row.idx,
              endIndex: row.idx + 1,
            },
          },
        }],
      },
    });
  }
}