import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import fs from 'fs';

const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID
  || process.env.GOOGLE_SHEET_ID || '';

// ─── Inisialisasi Auth ────────────────────────────────────────
function getAuth() {
  const credPath = import.meta.env.GOOGLE_CREDENTIALS_PATH
    || process.env.GOOGLE_CREDENTIALS_PATH;

  if (!credPath) throw new Error('GOOGLE_CREDENTIALS_PATH tidak ditemukan di .env');

  const credentials = JSON.parse(
    fs.readFileSync(credPath, 'utf8')
  );
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

// ─── Tipe Data ────────────────────────────────────────────────
export interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  attachment?: string;
  created: string;
  updated: string;
}

export interface Reply {
  ticketId: string;
  from: string;
  text: string;
  time: string;
}

// ─── Ambil semua tiket ───────────────────────────────────────
export async function getAllTickets(): Promise<Ticket[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: 'Tiket!A2:K',
  });

  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: row[0] || '',
    name: row[1] || '',
    email: row[2] || '',
    subject: row[3] || '',
    category: row[4] || '',
    priority: row[5] || '',
    status: row[6] || '',
    description: row[7] || '',
    attachment: row[8] || '',
    created: row[9] || '',
    updated: row[10] || '',
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
  subject: string;
  category: string;
  priority: string;
  description: string;
  attachment?: string;
}): Promise<{ id: string; status: string; created: string }> {
  const sheets = getSheets();
  const id = 'TKT-' + nanoid(6).toUpperCase();
  const now = new Date().toISOString();

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Tiket!A:K',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[
        id,
        data.name,
        data.email,
        data.subject,
        data.category,
        data.priority,
        'Menunggu',
        data.description,
        data.attachment || '',
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
        { range: `Tiket!G${sheetRow}`, values: [[status]] },
        { range: `Tiket!K${sheetRow}`, values: [[new Date().toISOString()]] },
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
      ticketId: row[0],
      from: row[1],
      text: row[2],
      time: row[3],
    }));
}

// ─── Tambah balasan ──────────────────────────────────────────
export async function addReply(
  ticketId: string,
  from: string,
  text: string
): Promise<Reply> {
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

// ─── Upload file ke Google Drive ─────────────────────────────
export async function uploadFileToDrive(
  file: File
): Promise<{ fileId: string; fileName: string; fileUrl: string }> {
  const credPath = import.meta.env.GOOGLE_CREDENTIALS_PATH
    || process.env.GOOGLE_CREDENTIALS_PATH;
  const credentials = JSON.parse(
    fs.readFileSync(credPath, 'utf8')
  );
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { Readable } = await import('stream');

  const res = await drive.files.create({
    requestBody: {
      name: file.name,
      mimeType: file.type,
    },
    media: {
      mimeType: file.type,
      body: Readable.from(buffer),
    },
    fields: 'id, name, webViewLink',
  });

  return {
    fileId: res.data.id!,
    fileName: res.data.name!,
    fileUrl: res.data.webViewLink!,
  };
}
