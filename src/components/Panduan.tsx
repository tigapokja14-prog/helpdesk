import { useState } from "react";

const STEPS_KIRIM = [
  {
    no: 1, icon: "📝", title: "Isi Form Laporan",
    desc: "Lengkapi semua field yang bertanda bintang (*) pada form pengiriman laporan.",
    details: [
      { label: "Nama Lengkap", desc: "Isi dengan nama lengkap Anda sesuai identitas." },
      { label: "Alamat Email", desc: "Gunakan email aktif karena notifikasi akan dikirim ke sini." },
      { label: "Peran", desc: "Pilih peran Anda: Guru/Dosen, Orang Tua, Operator, Mahasiswa, Murid, dll." },
      { label: "Jenis Laporan", desc: "Pilih jenis: Pertanyaan, Permintaan, Keluhan, Aspirasi, atau Pengaduan." },
      { label: "Kategori", desc: "Pilih kategori yang sesuai: Lembaga/Fasilitas, Pendidikan, Umum, dll." },
      { label: "Prioritas", desc: "Pilih tingkat urgensi: Rendah, Sedang, atau Tinggi." },
      { label: "Subjek/Judul", desc: "Tulis judul singkat yang menggambarkan isi laporan Anda." },
      { label: "Deskripsi", desc: "Jelaskan masalah atau pertanyaan secara lengkap dan jelas." },
    ],
  },
  {
    no: 2, icon: "📎", title: "Lampirkan File (Opsional)",
    desc: "Lampirkan file pendukung seperti foto, dokumen, atau tangkapan layar.",
    details: [
      { label: "Format didukung", desc: "PNG, JPG, JPEG, GIF, PDF, DOC, DOCX" },
      { label: "Ukuran maksimal", desc: "10 MB per file" },
      { label: "Cara upload", desc: "Klik area upload atau drag & drop file ke area yang tersedia." },
    ],
  },
  {
    no: 3, icon: "🚀", title: "Kirim Laporan",
    desc: "Klik tombol 'Kirim Laporan' dan tunggu konfirmasi.",
    details: [
      { label: "Konfirmasi layar", desc: "Muncul halaman sukses dengan ID Laporan unik Anda." },
      { label: "Konfirmasi email", desc: "Email konfirmasi otomatis dikirim ke alamat email Anda." },
      { label: "Simpan ID", desc: "Catat ID Laporan (contoh: TKT-ABC123) untuk cek status nanti." },
    ],
  },
  {
    no: 4, icon: "📬", title: "Tunggu Respons",
    desc: "Tim kami akan memproses laporan Anda secepatnya.",
    details: [
      { label: "Waktu respons", desc: "Maksimal 1×24 jam kerja (Senin–Jumat, 08.00–17.00)." },
      { label: "Notifikasi email", desc: "Anda akan mendapat email saat ada balasan dari tim kami." },
      { label: "Cek status", desc: "Gunakan ID Laporan untuk memantau perkembangan laporan." },
    ],
  },
];

const STEPS_CEK = [
  {
    no: 1, icon: "🔍", title: "Buka Halaman Cek Status",
    desc: "Klik tombol 'Cek Status' di bagian navigasi atas halaman.",
    details: [
      { label: "Akses langsung", desc: "Kunjungi halaman cek status melalui menu navigasi atas." },
      { label: "Link dari email", desc: "Klik link di email konfirmasi untuk langsung cek status." },
    ],
  },
  {
    no: 2, icon: "🔑", title: "Masukkan ID Laporan",
    desc: "Ketik ID Laporan yang Anda terima saat mengirim laporan.",
    details: [
      { label: "Format ID", desc: "TKT-XXXXXX (contoh: TKT-ABC123)" },
      { label: "Cek email", desc: "ID ada di email konfirmasi yang dikirim otomatis." },
      { label: "Tekan Enter", desc: "Atau klik tombol 'Cek →' untuk mencari laporan." },
    ],
  },
  {
    no: 3, icon: "📊", title: "Lihat Detail Laporan",
    desc: "Informasi lengkap laporan akan muncul termasuk status terkini dan balasan tim.",
    details: [
      { label: "Status Menunggu", desc: "Laporan sudah diterima dan menunggu diproses tim." },
      { label: "Status Dalam Proses", desc: "Tim sedang menangani laporan Anda." },
      { label: "Status Selesai", desc: "Laporan telah ditangani dan diselesaikan." },
      { label: "Status Ditolak", desc: "Laporan tidak dapat diproses, lihat alasan di balasan." },
      { label: "Status Butuh Tindak Lanjut", desc: "Tim membutuhkan informasi tambahan dari Anda." },
    ],
  },
  {
    no: 4, icon: "💬", title: "Tanggapi Balasan Tim",
    desc: "Verifikasi email Anda lalu kirim tanggapan atau ubah status laporan.",
    details: [
      { label: "Klik Tulis Tanggapan", desc: "Klik tombol 'Tulis Tanggapan / Ubah Status'." },
      { label: "Verifikasi email", desc: "Masukkan email Anda, kode OTP akan dikirim untuk verifikasi." },
      { label: "Masukkan OTP", desc: "Cek email, masukkan 6 digit kode OTP (berlaku 10 menit)." },
      { label: "Kirim tanggapan", desc: "Tulis balasan dan/atau ubah status laporan." },
    ],
  },
];

const FAQ = [
  { q: "Berapa lama waktu respons tim?", a: "Tim kami merespons dalam 1×24 jam kerja (Senin–Jumat, 08.00–17.00 WIB). Untuk laporan prioritas Tinggi, kami berusaha merespons lebih cepat." },
  { q: "Saya lupa ID Laporan, bagaimana mendapatkannya?", a: "ID Laporan ada di email konfirmasi yang dikirim otomatis saat Anda berhasil mengirim laporan. Cek folder Inbox atau Spam di email Anda." },
  { q: "Apakah saya bisa mengirim lebih dari satu laporan?", a: "Ya, Anda bisa mengirim laporan sebanyak yang diperlukan. Setiap laporan memiliki ID unik masing-masing." },
  { q: "Format file apa saja yang bisa dilampirkan?", a: "Anda bisa melampirkan file berformat PNG, JPG, JPEG, GIF, PDF, DOC, dan DOCX dengan ukuran maksimal 10 MB." },
  { q: "Bagaimana cara menanggapi balasan dari tim?", a: "Buka halaman Cek Status, masukkan ID Laporan, lalu klik 'Tulis Tanggapan'. Verifikasi email dengan kode OTP yang dikirim, kemudian tulis tanggapan Anda." },
  { q: "Apakah saya bisa mengubah status laporan?", a: "Ya. Setelah verifikasi email, Anda bisa mengubah status menjadi 'Selesai' jika masalah teratasi, atau 'Butuh Tindak Lanjut' jika masih memerlukan bantuan." },
  { q: "Laporan saya berstatus 'Ditolak', apa artinya?", a: "Laporan ditolak jika tidak sesuai layanan kami atau informasi tidak lengkap. Lihat alasan di balasan tim, lalu kirim laporan baru dengan informasi lebih lengkap." },
  { q: "Apakah data saya aman?", a: "Ya. Data Anda hanya digunakan untuk keperluan penanganan laporan dan tidak dibagikan ke pihak ketiga. Sistem kami menggunakan enkripsi dan autentikasi yang aman." },
];


// ─── Shared Navbar ────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div style={{ background: "#1565C0", color: "#fff", fontSize: 11, padding: "5px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <span>BPMP Jakarta | Kemendikdasmen — Unit Layanan Terpadu</span>
          <span className="topbar-jam">📞 Senin–Jumat, 08.00–16.00 WIB</span>
        </div>
      </div>
      <nav style={{ background: "#fff", borderBottom: "1px solid #E0E0E0", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
          <img src="/logo_b.png" alt="Kemendikdasmen ULT" style={{ height: 36, objectFit: "contain", maxWidth: 200 }} />
        </a>
        <div className="nav-desktop" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <a href="/panduan" style={{ padding: "7px 12px", borderRadius: 6, border: "1.5px solid #E0E0E0", background: "transparent", color: "#455A64", textDecoration: "none", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>📖 Panduan</a>
          <a href="/" style={{ padding: "7px 12px", borderRadius: 6, border: "1.5px solid #1565C0", background: "transparent", color: "#1565C0", textDecoration: "none", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>✉️ Kirim Laporan</a>
          <a href="/cek-status" style={{ padding: "7px 12px", borderRadius: 6, border: "1.5px solid #E65100", background: "#E65100", color: "#fff", textDecoration: "none", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>🔍 Cek Status</a>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-mobile-btn" suppressHydrationWarning
          style={{ background: "none", border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 20, color: "#455A64", lineHeight: 1 }}>
          ☰
        </button>
      </nav>
      <div suppressHydrationWarning style={{ display: mobileOpen ? "block" : "none", background: "#fff", borderBottom: "2px solid #E65100", position: "sticky", top: 57, zIndex: 199, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {[["✉️ Kirim Laporan", "/", "#1565C0"], ["🔍 Cek Status", "/cek-status", "#E65100"], ["📖 Panduan", "/panduan", "#455A64"]].map(([l, h, c]) => (
          <a key={h} href={h} style={{ display: "block", padding: "14px 16px", color: c, textDecoration: "none", fontSize: 14, fontWeight: 700, borderBottom: "1px solid #F5F7FA" }}>{l}</a>
        ))}
      </div>
    </>
  );
}

// ─── Shared Footer ────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#1A237E", color: "#fff", padding: "28px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <img src="/logo_b2.png" alt="Kemendikdasmen" style={{ height: 34, objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: 6, display: "block" }} />
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>© 2026</div>
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[["Beranda", "/"], ["Kirim Laporan", "/"], ["Cek Status", "/cek-status"], ["Panduan", "/panduan"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function Panduan() {
  const [activeTab, setActiveTab] = useState<"kirim" | "cek" | "faq">("kirim");
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const steps = activeTab === "kirim" ? STEPS_KIRIM : STEPS_CEK;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A2E" }} suppressHydrationWarning>
      <Navbar />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease; }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .topbar-jam { display: none !important; }
          .form-2col { grid-template-columns: 1fr !important; }
          .form-3col { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .nav-desktop { display: flex !important; }
          .nav-mobile-btn { display: none !important; }
          .topbar-jam { display: inline !important; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CFD8DC; border-radius: 3px; }
        .top-bar-text { display: flex; justify-content: space-between; }
        @media (max-width: 640px) {
          .top-bar-text { flex-direction: column; gap: 2px; }
          .top-bar-text span:last-child { display: none; }
          .nav-links { gap: 4px !important; }
          .nav-links a, .nav-links button { padding: 6px 10px !important; font-size: 11px !important; }
          .hero-section { padding: 32px 20px 40px !important; }
          .main-padding { padding: 24px 16px 60px !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .progress-bar { display: none !important; }
        }
      `}</style>

      {/* HERO */}
      <div className="hero-section" style={{ background: "linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #0288D1 100%)", color: "#fff", padding: "30px 20px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
          📖 PETUNJUK PENGGUNAAN
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800, marginBottom: 12 }}>
          Panduan Lengkap <span style={{ color: "#FFB300" }}>ULTonline</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", maxWidth: 520, margin: "0 auto", lineHeight: 1.2 }}>
          Pelajari cara mengirim laporan, memantau status, dan berkomunikasi dengan tim layanan kami.
        </p>
      </div>


      {/* QUICK LINKS */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E0E0E0", padding: "16px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { href: "/", icon: "✉️", title: "Kirim Laporan", desc: "Buat laporan baru", color: "#1565C0" },
            { href: "/cek-status", icon: "🔍", title: "Cek Status", desc: "Pantau laporan Anda", color: "#E65100" },
            { href: "#faq", icon: "❓", title: "FAQ", desc: "Pertanyaan umum", color: "#2E7D32" },
          ].map(l => (
            <a key={l.title} href={l.href}
              onClick={l.href === "#faq" ? (e) => { e.preventDefault(); setActiveTab("faq"); setOpenStep(null); setOpenFaq(null); } : undefined}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 10, background: "#F5F7FA", border: `1.5px solid #E0E0E0`, textDecoration: "none", borderTop: `3px solid ${l.color}`, transition: "all 0.2s" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${l.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{l.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>{l.title}</div>
                <div style={{ fontSize: 12, color: "#90A4AE" }}>{l.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="main-padding" style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* TABS */}
        <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: 8, padding: 4, border: "1.5px solid #E0E0E0", marginBottom: 24, overflowX: "auto" }}>
          {[
            { id: "kirim", label: "📤 Cara Kirim Laporan" },
            { id: "cek", label: "🔍 Cara Cek Status" },
            { id: "faq", label: "❓ FAQ" },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id as any); setOpenStep(null); setOpenFaq(null); }}
              style={{
                flex: 1, padding: "10px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s", whiteSpace: "nowrap",
                background: activeTab === t.id ? "#1565C0" : "transparent",
                color: activeTab === t.id ? "#fff" : "#90A4AE"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* KIRIM / CEK STEPS */}
        {(activeTab === "kirim" || activeTab === "cek") && (
          <div className="fade-up">
            {/* PROGRESS */}
            <div className="progress-bar" style={{ display: "flex", alignItems: "center", marginBottom: 24, padding: "0 8px" }}>
              {steps.map((s, i) => (
                <div key={s.no} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.no}</div>
                    <div style={{ fontSize: 10, color: "#90A4AE", textAlign: "center", maxWidth: 70, lineHeight: 1.3 }}>{s.title}</div>
                  </div>
                  {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: "#E0E0E0", margin: "0 4px", marginBottom: 20 }} />}
                </div>
              ))}
            </div>

            {/* STEPS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map(step => (
                <div key={step.no} style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #E0E0E0", overflow: "hidden", borderLeft: `4px solid #1565C0` }}>
                  <div onClick={() => setOpenStep(openStep === step.no ? null : step.no)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", cursor: "pointer" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{step.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "#1565C0", fontWeight: 700, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>LANGKAH {step.no}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: "#607D8B", marginTop: 2 }}>{step.desc}</div>
                    </div>
                    <div style={{ fontSize: 18, color: "#90A4AE", transition: "transform 0.2s", transform: openStep === step.no ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>▾</div>
                  </div>
                  {openStep === step.no && (
                    <div className="fade-up" style={{ borderTop: "1px solid #E0E0E0", padding: "16px 20px 20px", background: "#F5F7FA" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {step.details.map((d, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1565C0", flexShrink: 0, marginTop: 6 }} />
                            <div><span style={{ fontSize: 13, fontWeight: 700, color: "#1565C0" }}>{d.label}: </span><span style={{ fontSize: 13, color: "#607D8B" }}>{d.desc}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: 24, padding: "24px", background: "#E3F2FD", border: "1.5px solid #90CAF9", borderRadius: 12, textAlign: "center" }}>
              {activeTab === "kirim" ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>Siap mengirim laporan?</div>
                  <p style={{ fontSize: 13, color: "#607D8B", marginBottom: 16 }}>Klik tombol di bawah untuk langsung membuka form pengiriman laporan.</p>
                  <a href="/" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 8, background: "#1565C0", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>✉️ Kirim Laporan Sekarang →</a>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>Punya ID Laporan?</div>
                  <p style={{ fontSize: 13, color: "#607D8B", marginBottom: 16 }}>Langsung cek status laporan Anda sekarang.</p>
                  <a href="/cek-status" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 8, background: "#E65100", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>🔍 Cek Status Laporan →</a>
                </>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="fade-up">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FAQ.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, border: "1.5px solid #E0E0E0", overflow: "hidden", borderLeft: `4px solid ${i % 2 === 0 ? "#1565C0" : "#E65100"}` }}>
                  <div onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E3F2FD", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#1565C0", flexShrink: 0 }}>?</div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{item.q}</span>
                    </div>
                    <div style={{ fontSize: 16, color: "#90A4AE", transition: "transform 0.2s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>▾</div>
                  </div>
                  {openFaq === i && (
                    <div className="fade-up" style={{ padding: "0 20px 18px 60px", borderTop: "1px solid #E0E0E0", background: "#F5F7FA" }}>
                      <p style={{ fontSize: 14, color: "#607D8B", lineHeight: 1.7, paddingTop: 14 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: "24px", background: "#FFF3E0", border: "1.5px solid #FFCC80", borderRadius: 12, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>Masih ada pertanyaan?</div>
              <p style={{ fontSize: 13, color: "#607D8B", marginBottom: 16 }}>Kirim laporan dengan jenis "Pertanyaan/Informasi" dan tim kami siap membantu.</p>
              <a href="/" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 8, background: "#E65100", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>✉️ Kirim Pertanyaan →</a>
            </div>
          </div>
        )}

        {/* STATUS LEGEND */}
        <div style={{ marginTop: 32, padding: "24px", background: "#fff", border: "1.5px solid #E0E0E0", borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#455A64", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>📊 Keterangan Status Laporan</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { status: "Menunggu", icon: "⏳", bg: "#FFF3E0", text: "#E65100", border: "#FFCC80", desc: "Laporan diterima, menunggu diproses" },
              { status: "Dalam Proses", icon: "🔄", bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9", desc: "Sedang ditangani oleh tim" },
              { status: "Selesai", icon: "✅", bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7", desc: "Laporan telah diselesaikan" },
              { status: "Ditolak", icon: "❌", bg: "#FFEBEE", text: "#C62828", border: "#FFCDD2", desc: "Tidak dapat diproses" },
              { status: "Butuh Tindak Lanjut", icon: "🔔", bg: "#F3E5F5", text: "#6A1B9A", border: "#CE93D8", desc: "Perlu informasi tambahan" },
            ].map(s => (
              <div key={s.status} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 8, background: s.bg, border: `1px solid ${s.border}` }}>
                <span style={{ color: s.text, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", flexShrink: 0 }}>{s.icon} {s.status}</span>
                <span style={{ fontSize: 12, color: "#607D8B", lineHeight: 1.4 }}>— {s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FLOATING WA BUTTON */}
      <a href="https://wa.me/6282116314866?text=Halo%2C%20saya%20ingin%20bertanya%20mengenai%20layanan%20ULT%20BPMP Jakarta"
        target="_blank" rel="noopener noreferrer"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
          textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseOver={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.1)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 28px rgba(37,211,102,0.6)"; }}
        onMouseOut={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(37,211,102,0.4)"; }}>
        {/* WA Icon SVG */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      <Footer />
    </div>
  );
}
