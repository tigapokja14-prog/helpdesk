import { useState } from "react";

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
  "Menunggu": { bg: "#FFF3E0", text: "#E65100", dot: "#FF6D00", icon: "⏳" },
  "Dalam Proses": { bg: "#E3F2FD", text: "#1565C0", dot: "#1976D2", icon: "🔄" },
  "Selesai": { bg: "#E8F5E9", text: "#2E7D32", dot: "#388E3C", icon: "✅" },
  "Ditolak": { bg: "#FFEBEE", text: "#C62828", dot: "#D32F2F", icon: "❌" },
  "Butuh Tindak Lanjut": { bg: "#F3E5F5", text: "#6A1B9A", dot: "#7B1FA2", icon: "🔔" },
};

const PRIORITY_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  "Tinggi": { color: "#C62828", bg: "#FFEBEE", label: "🔴 Tinggi" },
  "Sedang": { color: "#E65100", bg: "#FFF3E0", label: "🟡 Sedang" },
  "Rendah": { color: "#2E7D32", bg: "#E8F5E9", label: "🟢 Rendah" },
};

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] || { bg: "#F5F5F5", text: "#616161", dot: "#9E9E9E", icon: "❓" };
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.icon} {status}
    </span>
  );
}

type VerifyStep = "idle" | "input_email" | "input_otp" | "verified";


// ─── Shared Navbar ────────────────────────────────────────────
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <div style={{ background: "#1565C0", color: "#fff", fontSize: 11, padding: "5px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <span>BPMP Jakarta — Unit Layanan Terpadu</span>
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
        <button onClick={() => setMobileOpen(!mobileOpen)} className="nav-mobile-btn"
          style={{ background: "none", border: "1.5px solid #E0E0E0", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 20, color: "#455A64", lineHeight: 1 }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </nav>
      {mobileOpen && (
        <div style={{ background: "#fff", borderBottom: "2px solid #E65100", position: "sticky", top: 57, zIndex: 199, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {[["✉️ Kirim Laporan", "/", "#1565C0"], ["🔍 Cek Status", "/cek-status", "#E65100"], ["📖 Panduan", "/panduan", "#455A64"]].map(([l, h, c]) => (
            <a key={h} href={h} style={{ display: "block", padding: "14px 16px", color: c, textDecoration: "none", fontSize: 14, fontWeight: 700, borderBottom: "1px solid #F5F7FA" }}>{l}</a>
          ))}
        </div>
      )}
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
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Unit Layanan Terpadu - BPMP Jakarta © {new Date().getFullYear()}</div>
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

export default function CekStatus() {
  const [ticketId, setTicketId] = useState(() => {
    if (typeof window !== "undefined") return new URLSearchParams(window.location.search).get("id") || "";
    return "";
  });
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [verifyStep, setVerifyStep] = useState<VerifyStep>("idle");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [replyText, setReplyText] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const handleCek = async () => {
    if (!ticketId.trim()) { setError("Masukkan ID laporan terlebih dahulu."); return; }
    setError(""); setTicket(null); setSearched(false); setVerifyStep("idle"); setSubmitSuccess(false); setLoading(true);
    try {
      const res = await fetch(`/api/tiket/${ticketId.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) { setTicket(data); window.history.replaceState({}, "", `/cek-status?id=${ticketId.trim().toUpperCase()}`); }
      else setError("Laporan tidak ditemukan. Pastikan ID laporan sudah benar.");
    } catch { setError("Gagal terhubung ke server."); }
    finally { setLoading(false); setSearched(true); }
  };

  const handleKirimOtp = async () => {
    if (!verifyEmail.trim()) { setVerifyError("Masukkan email Anda."); return; }
    setVerifyError(""); setVerifyLoading(true);
    try {
      const res = await fetch("/api/otp/kirim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: ticket.id, email: verifyEmail }) });
      const data = await res.json();
      if (res.ok) { setVerifyStep("input_otp"); showToast("OTP dikirim ke email Anda. Berlaku 10 menit."); }
      else setVerifyError(data.error || "Gagal mengirim OTP");
    } catch { setVerifyError("Gagal terhubung."); }
    finally { setVerifyLoading(false); }
  };

  const handleVerifikasiOtp = async () => {
    if (otpCode.length !== 6) { setVerifyError("Masukkan 6 digit kode OTP."); return; }
    setVerifyError(""); setVerifyLoading(true);
    try {
      const res = await fetch("/api/otp/verifikasi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: ticket.id, email: verifyEmail, otp: otpCode }) });
      const data = await res.json();
      if (res.ok) { setVerifyStep("verified"); showToast("Verifikasi berhasil!"); }
      else setVerifyError(data.error || "OTP tidak valid");
    } catch { setVerifyError("Gagal verifikasi."); }
    finally { setVerifyLoading(false); }
  };

  const handleKirimTanggapan = async () => {
    if (!replyText.trim() && !newStatus) { showToast("Tulis tanggapan atau pilih status.", "error"); return; }
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/user/tanggapi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: ticket.id, text: replyText, status: newStatus }) });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true); setVerifyStep("idle"); setReplyText(""); setNewStatus(""); setOtpCode(""); setVerifyEmail("");
        const r = await fetch(`/api/tiket/${ticket.id}`); const d = await r.json(); if (r.ok) setTicket(d);
        showToast("Tanggapan berhasil dikirim!");
      } else showToast(data.error || "Gagal.", "error");
    } catch { showToast("Gagal terhubung.", "error"); }
    finally { setSubmitLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 6, border: "1.5px solid #E0E0E0", background: "#FAFAFA", color: "#1A1A2E", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box", outline: "none" };

  const [mobileMenu, setMobileMenu] = useState(false);


  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A2E" }}>
      <Navbar />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #90A4AE; }
        input:focus, textarea:focus { border-color: #1565C0 !important; background: #fff !important; }
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
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .topbar-right { display: none !important; }
        }
        @media (min-width: 641px) {
          .mobile-menu-btn { display: none !important; }
          #mobile-menu-cs { display: none !important; }
          .topbar-right { display: inline !important; }
        }
      `}</style>

      {toast && <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#2E7D32" : "#C62828", color: "#fff", padding: "14px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>{toast.msg}</div>}

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #0288D1 100%)", color: "#fff", padding: "30px 40px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, marginBottom: 16 }}>🔍 CEK STATUS LAPORAN</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, marginBottom: 10 }}>Pantau Status <span style={{ color: "#FFB300" }}>Laporan Anda</span></h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>Masukkan ID laporan yang Anda terima melalui email konfirmasi.</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* SEARCH BOX */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E0E0E0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ background: "#E65100", padding: "16px 24px" }}>
            <h2 style={{ color: "#fff", fontSize: 16, fontWeight: 800, margin: 0 }}>🔍 Masukkan ID Laporan</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "4px 0 0" }}>ID laporan tersedia di email konfirmasi Anda.</p>
          </div>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={ticketId} onChange={e => setTicketId(e.target.value.toUpperCase())} onKeyDown={e => e.key === "Enter" && handleCek()} placeholder="Contoh: TKT-ABC123" style={{ ...inputStyle, flex: 1, fontSize: 16, fontWeight: 700, letterSpacing: 1.5 }} />
              <button onClick={handleCek} disabled={loading} style={{ padding: "10px 28px", borderRadius: 6, border: "none", background: loading ? "#B0BEC5" : "#E65100", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                {loading ? "Mencari..." : "Cek →"}
              </button>
            </div>
            {error && <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 6, background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", fontSize: 13 }}>❌ {error}</div>}
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#90A4AE", textAlign: "center" }}>Format: TKT-XXXXXX • Cek email konfirmasi Anda</p>
          </div>
        </div>

        {/* HASIL */}
        {ticket && (
          <div className="fade-up">
            <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E0E0E0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 16 }}>

              {/* HEADER TIKET */}
              <div style={{ background: "#F5F7FA", padding: "20px 24px", borderBottom: "1px solid #E0E0E0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>ID Laporan</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#1565C0", letterSpacing: 2, marginBottom: 6 }}>{ticket.id}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>{ticket.subject}</div>
                    <div style={{ fontSize: 12, color: "#90A4AE" }}>Dikirim {formatDate(ticket.created)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <StatusBadge status={ticket.status} />
                    {ticket.priority && <span style={{ background: PRIORITY_COLOR[ticket.priority]?.bg, color: PRIORITY_COLOR[ticket.priority]?.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>{PRIORITY_COLOR[ticket.priority]?.label}</span>}
                  </div>
                </div>
              </div>

              {/* INFO */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E0E0" }}>
                <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Informasi Pelapor</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 10 }}>
                  {[["👤 Nama", ticket.name], ["📧 Email", ticket.email], ["🎭 Peran", ticket.peran], ["📋 Jenis", ticket.jenisLaporan], ["🗂️ Kategori", ticket.category], ["🕐 Diperbarui", formatDate(ticket.updated)]].map(([l, v]) => (
                    <div key={l} style={{ background: "#F5F7FA", borderRadius: 8, padding: "10px 12px", border: "1px solid #E0E0E0" }}>
                      <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 600, marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1A1A2E", wordBreak: "break-all" }}>{v || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESKRIPSI */}
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #E0E0E0" }}>
                <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📝 Deskripsi Laporan</div>
                <div style={{ background: "#F5F7FA", borderRadius: 8, padding: "14px", border: "1px solid #E0E0E0", fontSize: 14, color: "#455A64", lineHeight: 1.8 }}>{ticket.description}</div>
              </div>

              {/* LAMPIRAN */}
              {ticket.attachment && (
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #E0E0E0" }}>
                  <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📎 Lampiran</div>
                  <a href={ticket.attachment} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: "10px 16px", textDecoration: "none" }}>
                    <span>📎</span>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: "#1565C0" }}>Lihat File Lampiran</div><div style={{ fontSize: 11, color: "#90A4AE" }}>Klik untuk membuka</div></div>
                  </a>
                </div>
              )}

              {/* BALASAN */}
              <div style={{ padding: "20px 24px", borderBottom: ticket.status !== "Selesai" && ticket.status !== "Ditolak" ? "1px solid #E0E0E0" : "none" }}>
                <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>💬 Percakapan {ticket.replies?.length > 0 && `(${ticket.replies.length})`}</div>
                {ticket.replies?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {ticket.replies.map((r: any, i: number) => {
                      const isAdmin = r.from === "Admin" || !ticket.name?.includes(r.from);
                      return (
                        <div key={i} style={{ background: isAdmin ? "#E3F2FD" : "#E8F5E9", border: `1px solid ${isAdmin ? "#90CAF9" : "#A5D6A7"}`, borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isAdmin ? "#1565C0" : "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{r.from?.charAt(0).toUpperCase()}</div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isAdmin ? "#1565C0" : "#2E7D32" }}>{r.from} {isAdmin ? "🛡️" : "👤"}</span>
                            </div>
                            <span style={{ fontSize: 11, color: "#90A4AE" }}>{formatDate(r.time)}</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#1A1A2E", lineHeight: 1.7 }}>{r.text}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "28px", background: "#F5F7FA", borderRadius: 8, border: "1px dashed #CFD8DC" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#607D8B", marginBottom: 4 }}>Belum ada balasan</div>
                    <div style={{ fontSize: 13, color: "#90A4AE" }}>Tim kami akan merespons dalam 1×24 jam kerja.</div>
                  </div>
                )}
              </div>

              {/* FORM TANGGAPI */}
              {ticket.status !== "Ditolak" && (
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>✍️ Tanggapi Laporan</div>
                  {verifyStep === "idle" && (
                    <div>
                      {submitSuccess && <div style={{ padding: "12px 16px", borderRadius: 8, background: "#E8F5E9", border: "1px solid #A5D6A7", color: "#2E7D32", fontSize: 14, marginBottom: 14 }}>✅ Tanggapan Anda berhasil dikirim!</div>}
                      <button onClick={() => { setVerifyStep("input_email"); setVerifyError(""); setVerifyEmail(ticket.email || ""); }}
                        style={{ padding: "11px 22px", borderRadius: 8, border: "1.5px solid #1565C0", background: "transparent", color: "#1565C0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        ✍️ Tulis Tanggapan / Ubah Status
                      </button>
                      <p style={{ fontSize: 12, color: "#90A4AE", marginTop: 8 }}>Verifikasi email diperlukan untuk keamanan.</p>
                    </div>
                  )}
                  {verifyStep === "input_email" && (
                    <div style={{ background: "#E3F2FD", border: "1.5px solid #90CAF9", borderRadius: 10, padding: "20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1565C0", marginBottom: 6 }}>🔐 Verifikasi Email</div>
                      <p style={{ fontSize: 13, color: "#455A64", marginBottom: 14 }}>Masukkan email yang digunakan saat mengirim laporan ini.</p>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)} placeholder="email@contoh.com" type="email" onKeyDown={e => e.key === "Enter" && handleKirimOtp()} style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={handleKirimOtp} disabled={verifyLoading} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: verifyLoading ? "#B0BEC5" : "#1565C0", color: "#fff", fontWeight: 700, fontSize: 14, cursor: verifyLoading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                          {verifyLoading ? "Mengirim..." : "Kirim OTP"}
                        </button>
                      </div>
                      {verifyError && <div style={{ padding: "10px 12px", borderRadius: 6, background: "#FFEBEE", color: "#C62828", fontSize: 13 }}>{verifyError}</div>}
                      <button onClick={() => setVerifyStep("idle")} style={{ background: "none", border: "none", color: "#90A4AE", fontSize: 13, cursor: "pointer", marginTop: 8 }}>← Batal</button>
                    </div>
                  )}
                  {verifyStep === "input_otp" && (
                    <div style={{ background: "#E3F2FD", border: "1.5px solid #90CAF9", borderRadius: 10, padding: "20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1565C0", marginBottom: 6 }}>📧 Masukkan Kode OTP</div>
                      <p style={{ fontSize: 13, color: "#455A64", marginBottom: 14 }}>Kode 6 digit dikirim ke <strong>{verifyEmail}</strong>. Berlaku 10 menit.</p>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" maxLength={6} onKeyDown={e => e.key === "Enter" && handleVerifikasiOtp()} style={{ ...inputStyle, flex: 1, fontSize: 24, letterSpacing: 8, fontWeight: 800, textAlign: "center" }} />
                        <button onClick={handleVerifikasiOtp} disabled={verifyLoading || otpCode.length !== 6} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: verifyLoading || otpCode.length !== 6 ? "#B0BEC5" : "#2E7D32", color: "#fff", fontWeight: 700, fontSize: 14, cursor: verifyLoading || otpCode.length !== 6 ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                          {verifyLoading ? "Memverifikasi..." : "Verifikasi"}
                        </button>
                      </div>
                      {verifyError && <div style={{ padding: "10px 12px", borderRadius: 6, background: "#FFEBEE", color: "#C62828", fontSize: 13 }}>{verifyError}</div>}
                      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <button onClick={() => { setVerifyStep("input_email"); setOtpCode(""); setVerifyError(""); }} style={{ background: "none", border: "none", color: "#90A4AE", fontSize: 13, cursor: "pointer" }}>← Ganti Email</button>
                        <button onClick={handleKirimOtp} disabled={verifyLoading} style={{ background: "none", border: "none", color: "#1565C0", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>🔄 Kirim Ulang OTP</button>
                      </div>
                    </div>
                  )}
                  {verifyStep === "verified" && (
                    <div style={{ background: "#E8F5E9", border: "1.5px solid #A5D6A7", borderRadius: 10, padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <span>✅</span><span style={{ fontSize: 14, fontWeight: 700, color: "#2E7D32" }}>Terverifikasi sebagai {ticket.name}</span>
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#455A64", fontWeight: 600, marginBottom: 8 }}>Tulis Tanggapan (opsional)</label>
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Tulis tanggapan Anda..." rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                      </div>
                      <div style={{ marginBottom: 20 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#455A64", fontWeight: 600, marginBottom: 8 }}>Ubah Status (opsional)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[{ value: "Selesai", icon: "✅", desc: "Masalah sudah teratasi", color: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7" }, { value: "Butuh Tindak Lanjut", icon: "🔔", desc: "Perlu respons lebih lanjut", color: "#6A1B9A", bg: "#F3E5F5", border: "#CE93D8" }].map(s => (
                            <button key={s.value} onClick={() => setNewStatus(newStatus === s.value ? "" : s.value)} style={{ padding: "14px", borderRadius: 8, border: `2px solid ${newStatus === s.value ? s.color : s.border}`, background: newStatus === s.value ? s.bg : "#fff", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left", transition: "all 0.2s" }}>
                              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: newStatus === s.value ? s.color : "#455A64" }}>{s.value}</div>
                              <div style={{ fontSize: 11, color: "#90A4AE", marginTop: 2 }}>{s.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleKirimTanggapan} disabled={submitLoading || (!replyText.trim() && !newStatus)} style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: submitLoading || (!replyText.trim() && !newStatus) ? "#B0BEC5" : "#1565C0", color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitLoading || (!replyText.trim() && !newStatus) ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {submitLoading ? "Mengirim..." : "Kirim Tanggapan →"}
                        </button>
                        <button onClick={() => setVerifyStep("idle")} style={{ padding: "12px 16px", borderRadius: 8, border: "1.5px solid #E0E0E0", background: "transparent", color: "#607D8B", fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Batal</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {ticket.status === "Selesai" && (
                <div style={{ padding: "20px 24px" }}>
                  <div style={{ textAlign: "center", padding: "20px", background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 10 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2E7D32", marginBottom: 4 }}>Laporan Telah Diselesaikan</div>
                    <div style={{ fontSize: 13, color: "#607D8B" }}>Terima kasih telah menggunakan layanan kami.</div>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => { setTicket(null); setTicketId(""); setError(""); setSearched(false); setVerifyStep("idle"); window.history.replaceState({}, "", "/cek-status"); }} style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E0E0E0", background: "#fff", color: "#455A64", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🔍 Cek Laporan Lain</button>
              <button onClick={handleCek} style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #1565C0", background: "#E3F2FD", color: "#1565C0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>🔄 Refresh Status</button>
              <a href="/" style={{ padding: "10px 20px", borderRadius: 8, background: "#E65100", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: "none" }}>✉️ Kirim Laporan Baru</a>
            </div>
          </div>
        )}

        {/* PANDUAN SINGKAT */}
        {!searched && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 14 }}>
            {[{ icon: "📧", title: "Cek Email", desc: "ID laporan dikirim ke email Anda saat laporan berhasil dikirim.", color: "#1565C0" }, { icon: "🔑", title: "Masukkan ID", desc: "Ketik ID laporan format TKT-XXXXXX di kolom pencarian di atas.", color: "#E65100" }, { icon: "💬", title: "Tanggapi", desc: "Balas dan ubah status laporan setelah verifikasi email.", color: "#2E7D32" }].map(c => (
              <div key={c.title} style={{ background: "#fff", borderRadius: 10, padding: "20px", border: "1.5px solid #E0E0E0", borderTop: `3px solid ${c.color}` }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#607D8B", lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
