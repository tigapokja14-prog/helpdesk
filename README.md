# HelpDeskID — Aplikasi Helpdesk

Aplikasi helpdesk modern dengan backend Astro dan database Google Sheets.

## Fitur
- 🌐 **Halaman Publik**: Kirim tiket dengan upload dokumen, cek status tiket by ID
- 🔐 **Panel Admin**: Dashboard statistik, filter & search, update status, balas tiket, export CSV

## Cara Menjalankan

### 1. Install dependensi
```bash
npm install
```

### 2. Konfigurasi environment
```bash
cp .env.example .env
# Edit .env dan isi GOOGLE_SHEET_ID dan ADMIN_SECRET_TOKEN
```

### 3. Tambahkan credentials Google
- Unduh file JSON dari Google Cloud Console
- Simpan sebagai `credentials.json` di root folder ini

### 4. Jalankan development server
```bash
npm run dev
```

Buka:
- **Publik**: http://localhost:4321
- **Admin**: http://localhost:4321/admin

### 5. Build untuk produksi
```bash
npm run build
npm start
```

## Struktur Google Sheet

**Tab "Tiket"** — header kolom:
```
A: ID | B: Nama | C: Email | D: Subjek | E: Kategori
F: Prioritas | G: Status | H: Deskripsi | I: Attachment | J: Dibuat | K: Diperbarui
```

**Tab "Balasan"** — header kolom:
```
A: Tiket_ID | B: Dari | C: Pesan | D: Waktu
```

## Keamanan
- Jangan commit `.env` dan `credentials.json` ke Git
- Ganti `ADMIN_SECRET_TOKEN` dengan string acak yang kuat
- Gunakan HTTPS di produksi
