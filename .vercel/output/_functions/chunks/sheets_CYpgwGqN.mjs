import { google } from 'googleapis';
import { nanoid } from 'nanoid';
import fs from 'fs';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEET_ID || "";
function getAuth() {
  const credsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const credsPath = process.env.GOOGLE_CREDENTIALS_PATH;
  let credentials;
  if (credsJson) {
    credentials = JSON.parse(credsJson);
  } else if (credsPath) {
    credentials = JSON.parse(fs.readFileSync(credsPath, "utf8"));
  } else {
    throw new Error("Google credentials tidak ditemukan");
  }
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });
}
function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}
async function getAllTickets() {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Tiket!A2:K"
  });
  const rows = res.data.values || [];
  return rows.map((row) => ({
    id: row[0] || "",
    name: row[1] || "",
    email: row[2] || "",
    subject: row[3] || "",
    category: row[4] || "",
    priority: row[5] || "",
    status: row[6] || "",
    description: row[7] || "",
    attachment: row[8] || "",
    created: row[9] || "",
    updated: row[10] || ""
  }));
}
async function getTicketById(id) {
  const all = await getAllTickets();
  return all.find((t) => t.id === id) || null;
}
async function createTicket(data) {
  const sheets = getSheets();
  const id = "TKT-" + nanoid(6).toUpperCase();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Tiket!A:K",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        id,
        data.name,
        data.email,
        data.subject,
        data.category,
        data.priority,
        "Menunggu",
        data.description,
        data.attachment || "",
        now,
        now
      ]]
    }
  });
  return { id, status: "Menunggu", created: now };
}
async function updateTicketStatus(id, status) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Tiket!A:A"
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === id);
  if (rowIndex === -1) throw new Error("Tiket tidak ditemukan");
  const sheetRow = rowIndex + 1;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: "RAW",
      data: [
        { range: `Tiket!G${sheetRow}`, values: [[status]] },
        { range: `Tiket!K${sheetRow}`, values: [[(/* @__PURE__ */ new Date()).toISOString()]] }
      ]
    }
  });
}
async function getRepliesByTicketId(ticketId) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Balasan!A2:D"
  });
  const rows = res.data.values || [];
  return rows.filter((row) => row[0] === ticketId).map((row) => ({
    ticketId: row[0],
    from: row[1],
    text: row[2],
    time: row[3]
  }));
}
async function addReply(ticketId, from, text) {
  const sheets = getSheets();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Balasan!A:D",
    valueInputOption: "RAW",
    requestBody: {
      values: [[ticketId, from, text, now]]
    }
  });
  return { ticketId, from, text, time: now };
}
async function getAllAdmins() {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Admin!A2:D"
  });
  const rows = res.data.values || [];
  return rows.map((row) => ({
    username: row[0] || "",
    password: row[1] || "",
    nama: row[2] || "",
    role: row[3] || "admin"
  }));
}
async function loginAdmin(username, password) {
  const admins = await getAllAdmins();
  const found = admins.find(
    (a) => a.username === username && a.password === password
  );
  return found || null;
}
async function addAdmin(data) {
  const sheets = getSheets();
  const existing = await getAllAdmins();
  if (existing.find((a) => a.username === data.username)) {
    throw new Error(`Username "${data.username}" sudah digunakan`);
  }
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Admin!A:D",
    valueInputOption: "RAW",
    requestBody: {
      values: [[data.username, data.password, data.nama, data.role]]
    }
  });
}
async function deleteAdmin(username) {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Admin!A:A"
  });
  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === username);
  if (rowIndex === -1) throw new Error("Admin tidak ditemukan");
  const sheetMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const adminSheet = sheetMeta.data.sheets?.find((s) => s.properties?.title === "Admin");
  const sheetId = adminSheet?.properties?.sheetId;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1
          }
        }
      }]
    }
  });
}

export { addAdmin as a, getTicketById as b, addReply as c, deleteAdmin as d, getRepliesByTicketId as e, getAllTickets as f, getAllAdmins as g, createTicket as h, loginAdmin as l, updateTicketStatus as u };
