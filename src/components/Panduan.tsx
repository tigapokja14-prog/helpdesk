import { useState } from "react";

const STEPS_KIRIM = [
  {
    no: 1,
    icon: "📝",
    title: "Isi Form Laporan",
    desc: "Lengkapi semua field yang bertanda bintang (*) pada form pengiriman tiket.",
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
    no: 2,
    icon: "📎",
    title: "Lampirkan File (Opsional)",
    desc: "Jika perlu, lampirkan file pendukung seperti foto, dokumen, atau tangkapan layar.",
    details: [
      { label: "Format didukung", desc: "PNG, JPG, JPEG, GIF, PDF, DOC, DOCX" },
      { label: "Ukuran maksimal", desc: "10 MB per file" },
      { label: "Cara upload", desc: "Klik area upload atau drag & drop file ke area yang tersedia." },
    ],
  },
  {
    no: 3,
    icon: "🚀",
    title: "Kirim Tiket",
    desc: "Klik tombol 'Kirim Laporan' dan tunggu konfirmasi.",
    details: [
      { label: "Konfirmasi layar", desc: "Muncul halaman sukses dengan ID Tiket unik Anda." },
      { label: "Konfirmasi email", desc: "Email konfirmasi otomatis dikirim ke alamat email Anda." },
      { label: "Simpan ID Tiket", desc: "Catat ID Tiket (contoh: TKT-ABC123) untuk cek status nanti." },
    ],
  },
  {
    no: 4,
    icon: "📬",
    title: "Tunggu Respons",
    desc: "Tim kami akan memproses laporan Anda secepatnya.",
    details: [
      { label: "Waktu respons", desc: "Maksimal 1×24 jam kerja (Senin–Jumat, 08.00–17.00)." },
      { label: "Notifikasi email", desc: "Anda akan mendapat email saat ada balasan dari tim kami." },
      { label: "Cek status kapan saja", desc: "Gunakan ID Tiket untuk memantau perkembangan laporan." },
    ],
  },
];

const STEPS_CEK = [
  {
    no: 1,
    icon: "🔍",
    title: "Buka Halaman Cek Status",
    desc: "Klik tombol 'Cek Status' di bagian atas halaman utama.",
    details: [
      { label: "Akses langsung", desc: "Kunjungi halaman cek status melalui menu navigasi atas." },
      { label: "Link dari email", desc: "Klik link di email konfirmasi untuk langsung cek status tiket Anda." },
    ],
  },
  {
    no: 2,
    icon: "🔑",
    title: "Masukkan ID Tiket",
    desc: "Ketik ID Tiket yang Anda terima saat mengirim laporan.",
    details: [
      { label: "Format ID", desc: "TKT-XXXXXX (contoh: TKT-ABC123) — 6 karakter setelah TKT-" },
      { label: "Cek email", desc: "ID Tiket ada di email konfirmasi yang dikirim saat laporan dikirim." },
      { label: "Tekan Enter", desc: "Atau klik tombol 'Cek →' untuk mencari tiket." },
    ],
  },
  {
    no: 3,
    icon: "📊",
    title: "Lihat Detail Tiket",
    desc: "Informasi lengkap tiket akan muncul termasuk status terkini dan balasan tim.",
    details: [
      { label: "Status Menunggu", desc: "Tiket sudah diterima dan menunggu diproses tim." },
      { label: "Status Dalam Proses", desc: "Tim sedang menangani laporan Anda." },
      { label: "Status Selesai", desc: "Laporan telah ditangani dan diselesaikan." },
      { label: "Status Ditolak", desc: "Laporan tidak dapat diproses, lihat alasan di balasan." },
      { label: "Status Butuh Tindak Lanjut", desc: "Tim membutuhkan informasi tambahan dari Anda." },
    ],
  },
  {
    no: 4,
    icon: "💬",
    title: "Tanggapi Balasan Tim",
    desc: "Jika ada balasan dari tim, Anda bisa menanggapi atau mengubah status tiket.",
    details: [
      { label: "Klik Tulis Tanggapan", desc: "Klik tombol 'Tulis Tanggapan / Ubah Status'." },
      { label: "Verifikasi email", desc: "Masukkan email Anda, kode OTP akan dikirim untuk verifikasi." },
      { label: "Masukkan OTP", desc: "Cek email, masukkan 6 digit kode OTP (berlaku 10 menit)." },
      { label: "Kirim tanggapan", desc: "Tulis balasan dan/atau ubah status tiket sesuai kondisi." },
    ],
  },
];

const FAQ = [
  {
    q: "Berapa lama waktu respons tim?",
    a: "Tim kami merespons dalam 1×24 jam kerja (Senin–Jumat, 08.00–17.00 WIB). Untuk laporan prioritas Tinggi, kami berusaha merespons lebih cepat.",
  },
  {
    q: "Saya lupa ID Tiket, bagaimana cara mendapatkannya?",
    a: "ID Tiket ada di email konfirmasi yang dikirim otomatis saat Anda berhasil mengirim laporan. Cek folder Inbox atau Spam di email Anda.",
  },
  {
    q: "Apakah saya bisa mengirim lebih dari satu tiket?",
    a: "Ya, Anda bisa mengirim tiket sebanyak yang diperlukan. Setiap tiket memiliki ID unik masing-masing.",
  },
  {
    q: "Format file apa saja yang bisa dilampirkan?",
    a: "Anda bisa melampirkan file berformat PNG, JPG, JPEG, GIF, PDF, DOC, dan DOCX dengan ukuran maksimal 10 MB.",
  },
  {
    q: "Bagaimana cara menanggapi balasan dari tim?",
    a: "Buka halaman Cek Status, masukkan ID Tiket, lalu klik 'Tulis Tanggapan'. Verifikasi email Anda dengan kode OTP yang dikirim, kemudian tulis tanggapan Anda.",
  },
  {
    q: "Apakah saya bisa mengubah status tiket?",
    a: "Ya. Setelah verifikasi email, Anda bisa mengubah status tiket menjadi 'Selesai' jika masalah sudah teratasi, atau 'Butuh Tindak Lanjut' jika masih memerlukan bantuan.",
  },
  {
    q: "Tiket saya berstatus 'Ditolak', apa artinya?",
    a: "Tiket ditolak jika laporan tidak sesuai dengan layanan kami atau informasi tidak lengkap. Lihat alasan penolakan di bagian balasan tim, lalu kirim tiket baru dengan informasi yang lebih lengkap jika diperlukan.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Ya. Data Anda hanya digunakan untuk keperluan penanganan laporan dan tidak dibagikan ke pihak ketiga. Sistem kami menggunakan enkripsi dan autentikasi yang aman.",
  },
];

export default function Panduan() {
  const [activeTab, setActiveTab] = useState<"kirim" | "cek" | "faq">("kirim");
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = activeTab === "kirim" ? STEPS_KIRIM : STEPS_CEK;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

      {/* NAV */}
      <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 10, background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo_b.png" alt="Kemendikdasmen - Unit Layanan Terpadu"
            style={{ height: 44, objectFit: "contain" }} />
        </a>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/" style={{ padding: "8px 16px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#94A3B8", textDecoration: "none", fontSize: 13, fontWeight: 500 }}>
            ← Beranda
          </a>
          <a href="/cek-status" style={{ padding: "8px 16px", borderRadius: 30, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            Cek Status
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 20px 80px" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ width: 68, height: 68, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 30 }}>
            📖
          </div>
          <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, marginBottom: 12 }}>
            Petunjuk Penggunaan
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 16, maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            Panduan lengkap cara menggunakan layanan HelpDeskID untuk mengirim laporan dan memantau statusnya.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 36 }}>
          {[
            { href: "/", icon: "✉️", title: "Kirim Tiket", desc: "Buat laporan baru", color: "#3B82F6" },
            { href: "/cek-status", icon: "🔍", title: "Cek Status", desc: "Pantau tiket Anda", color: "#06B6D4" },
            { href: "#faq", icon: "❓", title: "FAQ", desc: "Pertanyaan umum", color: "#8B5CF6" },
          ].map(l => (
            <a key={l.title} href={l.href} onClick={l.href === "#faq" ? (e) => { e.preventDefault(); setActiveTab("faq"); } : undefined}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none", transition: "all 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${l.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                {l.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0" }}>{l.title}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{l.desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4, marginBottom: 28 }}>
          {[
            { id: "kirim", label: "📤 Cara Kirim Tiket" },
            { id: "cek", label: "🔍 Cara Cek Status" },
            { id: "faq", label: "❓ FAQ" },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id as any); setOpenStep(null); setOpenFaq(null); }}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                background: activeTab === t.id ? "linear-gradient(135deg, #3B82F6, #06B6D4)" : "transparent",
                color: activeTab === t.id ? "#fff" : "#64748B"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* KIRIM / CEK STEPS */}
        {(activeTab === "kirim" || activeTab === "cek") && (
          <div className="fade-in">
            {/* PROGRESS BAR */}
            <div style={{ display: "flex", alignItems: "center", marginBottom: 28, padding: "0 8px" }}>
              {steps.map((s, i) => (
                <div key={s.no} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {s.no}
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", maxWidth: 70, lineHeight: 1.3 }}>{s.title}</div>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.08)", margin: "0 4px", marginBottom: 20 }} />
                  )}
                </div>
              ))}
            </div>

            {/* STEPS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {steps.map((step) => (
                <div key={step.no} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", transition: "all 0.2s" }}>
                  {/* HEADER */}
                  <div onClick={() => setOpenStep(openStep === step.no ? null : step.no)}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", cursor: "pointer" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#38BDF8", fontWeight: 700 }}>LANGKAH {step.no}</span>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#E2E8F0" }}>{step.title}</div>
                      <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{step.desc}</div>
                    </div>
                    <div style={{ fontSize: 18, color: "#64748B", transition: "transform 0.2s", transform: openStep === step.no ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                      ▾
                    </div>
                  </div>

                  {/* DETAIL */}
                  {openStep === step.no && (
                    <div className="fade-in" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 20px 20px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {step.details.map((d, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#38BDF8", flexShrink: 0, marginTop: 6 }} />
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#38BDF8" }}>{d.label}: </span>
                              <span style={{ fontSize: 13, color: "#94A3B8" }}>{d.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: 28, padding: "24px", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 16, textAlign: "center" }}>
              {activeTab === "kirim" ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>Siap mengirim laporan?</div>
                  <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Klik tombol di bawah untuk langsung membuka form pengiriman tiket.</p>
                  <a href="/" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                    ✉️ Kirim Tiket Sekarang →
                  </a>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>Punya ID Tiket?</div>
                  <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Langsung cek status tiket Anda sekarang.</p>
                  <a href="/cek-status" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                    🔍 Cek Status Tiket →
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === "faq" && (
          <div className="fade-in">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FAQ.map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
                  <div onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(56,189,248,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#38BDF8", flexShrink: 0 }}>
                        ?
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>{item.q}</span>
                    </div>
                    <div style={{ fontSize: 16, color: "#64748B", transition: "transform 0.2s", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
                      ▾
                    </div>
                  </div>
                  {openFaq === i && (
                    <div className="fade-in" style={{ padding: "0 20px 18px 60px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.7, paddingTop: 14 }}>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Masih ada pertanyaan */}
            <div style={{ marginTop: 28, padding: "24px", background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>Masih ada pertanyaan?</div>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>Kirim tiket dengan jenis laporan "Pertanyaan/Informasi" dan tim kami siap membantu.</p>
              <a href="/" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #3B82F6)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                ✉️ Kirim Pertanyaan →
              </a>
            </div>
          </div>
        )}

        {/* STATUS LEGEND */}
        <div style={{ marginTop: 40, padding: "24px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>📊 Keterangan Status Tiket</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { status: "Menunggu", icon: "⏳", bg: "#FFF3CD", text: "#856404", desc: "Tiket diterima, menunggu diproses" },
              { status: "Dalam Proses", icon: "🔄", bg: "#CCE5FF", text: "#004085", desc: "Sedang ditangani oleh tim" },
              { status: "Selesai", icon: "✅", bg: "#D4EDDA", text: "#155724", desc: "Laporan telah diselesaikan" },
              { status: "Ditolak", icon: "❌", bg: "#F8D7DA", text: "#721C24", desc: "Tidak dapat diproses" },
              { status: "Butuh Tindak Lanjut", icon: "🔔", bg: "#E8D5FF", text: "#5B21B6", desc: "Perlu informasi tambahan" },
            ].map(s => (
              <div key={s.status} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ background: s.bg, color: s.text, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {s.icon} {s.status}
                </span>
                <span style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
