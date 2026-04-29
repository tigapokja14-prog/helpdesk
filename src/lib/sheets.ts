import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import fs from 'fs';

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
    id:           row[0]  || '',
    name:         row[1]  || '',
    email:        row[2]  || '',
    peran:        row[3]  || '',
    jenisLaporan: row[4]  || '',
    subject:      row[5]  || '',
    category:     row[6]  || '',
    priority:     row[7]  || '',
    status:       row[8]  || '',
    description:  row[9]  || '',
    attachment:   row[10] || '',
    created:      row[11] || '',
    updated:      row[12] || '',
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
  const id  = 'TKT-' + nanoid(6).toUpperCase();
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

  const rows     = res.data.values || [];
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
      from:     row[1] || '',
      text:     row[2] || '',
      time:     row[3] || '',
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
    nama:     row[2] || '',
    role:     row[3] || 'admin',
  }));
}

// ─── Login admin ──────────────────────────────────────────────
export async function loginAdmin(username: string, password: string): Promise<Admin | null> {
  const admins = await getAllAdmins();
  return admins.find((a) => a.username === username && a.password === password) || null;
}

// ─── Tambah admin baru ────────────────────────────────────────
export async function addAdmin(data: {
  username: string;
  password: string;
  nama: string;
  role: string;
}): Promise<void> {
  const sheets  = getSheets();
  const existing = await getAllAdmins();

  if (existing.find((a) => a.username === data.username)) {
    throw new Error(`Username "${data.username}" sudah digunakan`);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Admin!A:D',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[data.username, data.password, data.nama, data.role]],
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

  const rows     = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === username);
  if (rowIndex === -1) throw new Error('Admin tidak ditemukan');

  const sheetMeta  = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const adminSheet = sheetMeta.data.sheets?.find((s) => s.properties?.title === 'Admin');
  const sheetId    = adminSheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension:  'ROWS',
            startIndex: rowIndex,
            endIndex:   rowIndex + 1,
          },
        },
      }],
    },
  });
}