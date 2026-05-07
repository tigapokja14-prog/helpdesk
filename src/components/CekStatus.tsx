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
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.icon} {status}
    </span>
  );
}

type VerifyStep = "idle" | "input_email" | "input_otp" | "verified";

export default function CekStatus() {
  const [ticketId, setTicketId] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("id") || "";
    }
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

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCek = async () => {
    if (!ticketId.trim()) { setError("Masukkan ID laporan terlebih dahulu."); return; }
    setError(""); setTicket(null); setSearched(false);
    setVerifyStep("idle"); setSubmitSuccess(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/tiket/${ticketId.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setTicket(data);
        window.history.replaceState({}, "", `/cek-status?id=${ticketId.trim().toUpperCase()}`);
      } else { setError("Laporan tidak ditemukan. Pastikan ID laporan sudah benar."); }
    } catch { setError("Gagal terhubung ke server. Coba lagi."); }
    finally { setLoading(false); setSearched(true); }
  };

  const handleKirimOtp = async () => {
    if (!verifyEmail.trim()) { setVerifyError("Masukkan email Anda."); return; }
    setVerifyError(""); setVerifyLoading(true);
    try {
      const res = await fetch("/api/otp/kirim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: ticket.id, email: verifyEmail }) });
      const data = await res.json();
      if (res.ok) { setVerifyStep("input_otp"); showToast("Kode OTP dikirim ke email Anda. Berlaku 10 menit."); }
      else setVerifyError(data.error || "Gagal mengirim OTP");
    } catch { setVerifyError("Gagal terhubung ke server."); }
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
    if (!replyText.trim() && !newStatus) { showToast("Tulis tanggapan atau pilih status terlebih dahulu.", "error"); return; }
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/user/tanggapi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ticketId: ticket.id, text: replyText, status: newStatus }) });
      const data = await res.json();
      if (res.ok) {
        setSubmitSuccess(true); setVerifyStep("idle");
        setReplyText(""); setNewStatus(""); setOtpCode(""); setVerifyEmail("");
        const refreshRes = await fetch(`/api/tiket/${ticket.id}`);
        const refreshData = await refreshRes.json();
        if (refreshRes.ok) setTicket(refreshData);
        showToast("Tanggapan berhasil dikirim!");
      } else showToast(data.error || "Gagal mengirim.", "error");
    } catch { showToast("Gagal terhubung.", "error"); }
    finally { setSubmitLoading(false); }
  };

  const handleReset = () => {
    setTicket(null); setTicketId(""); setError(""); setSearched(false);
    setVerifyStep("idle"); setSubmitSuccess(false);
    window.history.replaceState({}, "", "/cek-status");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 6,
    border: "1.5px solid #E0E0E0", background: "#FAFAFA",
    color: "#1A1A2E", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A2E" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #90A4AE; }
        input:focus, textarea:focus { border-color: #1565C0 !important; background: #fff !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .pulse { animation: pulse 1.5s infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CFD8DC; border-radius: 3px; }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#2E7D32" : "#C62828", color: "#fff", padding: "14px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.15)", maxWidth: 360 }}>
          {toast.msg}
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ background: "#1565C0", color: "#fff", padding: "6px 40px", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>BPMP DKI Jakarta — Unit Layanan Terpadu</span>
        <span>📞 Layanan: Senin–Jumat, 08.00–17.00 WIB</span>
      </div>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E0E0E0", padding: "12px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo_b.png" alt="Kemendikdasmen ULT" style={{ height: 44, objectFit: "contain" }} />
        </a>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <a href="/panduan" style={{ padding: "8px 16px", borderRadius: 6, border: "1.5px solid #E0E0E0", background: "transparent", color: "#455A64", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            📖 Panduan
          </a>
          <a href="/" style={{ padding: "8px 18px", borderRadius: 6, border: "1.5px solid #1565C0", background: "transparent", color: "#1565C0", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            Kirim Laporan
          </a>
          <a href="/cek-status" style={{ padding: "8px 18px", borderRadius: 6, border: "none", background: "#E65100", color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
            Cek Status
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #0288D1 100%)", color: "#fff", padding: "40px 40px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, marginBottom: 16, letterSpacing: 0.5 }}>
            🔍 CEK STATUS LAPORAN
          </div>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, marginBottom: 10 }}>Status Laporan Anda</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
            Masukkan ID Laporan yang Anda terima melalui email konfirmasi untuk melihat perkembangan laporan Anda.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* SEARCH BOX */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E0E0E0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", padding: "24px 28px", marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#455A64", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>ID Laporan</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={ticketId} onChange={e => setTicketId(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleCek()}
              placeholder="Contoh: TKT-ABC123"
              style={{ ...inputStyle, flex: 1, fontSize: 16, fontWeight: 700, letterSpacing: 2, border: `1.5px solid ${error ? "#D32F2F" : "#E0E0E0"}` }} />
            <button onClick={handleCek} disabled={loading}
              style={{ padding: "10px 28px", borderRadius: 6, border: "none", background: loading ? "#B0BEC5" : "#E65100", color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
              {loading ? <span className="pulse">Mencari...</span> : "Cek →"}
            </button>
          </div>
          {error && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 6, background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", fontSize: 13 }}>
              ❌ {error}
            </div>
          )}
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#90A4AE", textAlign: "center" }}>
            Format: TKT-XXXXXX • ID Laporan ada di email konfirmasi Anda
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }} className="pulse">🔍</div>
            <div style={{ color: "#607D8B" }}>Mencari laporan...</div>
          </div>
        )}

        {/* HASIL */}
        {ticket && (
          <div className="fade-up">
            <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E0E0E0", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 16 }}>

              {/* HEADER */}
              <div style={{ background: "linear-gradient(135deg, #1565C0, #1976D2)", padding: "22px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>ID Laporan</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#FFB300", letterSpacing: 2, marginBottom: 8 }}>{ticket.id}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{ticket.subject}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Dikirim {formatDate(ticket.created)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <StatusBadge status={ticket.status} />
                    {ticket.priority && (
                      <span style={{ background: PRIORITY_COLOR[ticket.priority]?.bg, color: PRIORITY_COLOR[ticket.priority]?.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>
                        {PRIORITY_COLOR[ticket.priority]?.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* INFO GRID */}
              <div style={{ padding: "20px 28px", borderBottom: "1px solid #F0F0F0" }}>
                <div style={{ fontSize: 12, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Informasi Pelapor</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                  {[
                    ["👤 Nama", ticket.name],
                    ["📧 Email", ticket.email],
                    ["🎭 Peran", ticket.peran],
                    ["📋 Jenis", ticket.jenisLaporan],
                    ["🗂️ Kategori", ticket.category],
                    ["🕐 Diperbarui", formatDate(ticket.updated)],
                  ].map(([l, v]) => (
                    <div key={l} style={{ background: "#F5F7FA", borderRadius: 8, padding: "10px 12px", border: "1px solid #E0E0E0" }}>
                      <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 600, marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", wordBreak: "break-all" }}>{v || "-"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESKRIPSI */}
              <div style={{ padding: "20px 28px", borderBottom: "1px solid #F0F0F0" }}>
                <div style={{ fontSize: 12, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📝 Deskripsi Laporan</div>
                <div style={{ background: "#F5F7FA", borderRadius: 8, padding: "14px", border: "1px solid #E0E0E0", fontSize: 14, color: "#455A64", lineHeight: 1.8 }}>
                  {ticket.description}
                </div>
              </div>

              {/* LAMPIRAN */}
              {ticket.attachment && (
                <div style={{ padding: "16px 28px", borderBottom: "1px solid #F0F0F0" }}>
                  <div style={{ fontSize: 12, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📎 Lampiran</div>
                  <a href={ticket.attachment} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: "10px 16px", textDecoration: "none" }}>
                    <span style={{ fontSize: 18 }}>📎</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1565C0" }}>Lihat File Lampiran</div>
                      <div style={{ fontSize: 11, color: "#90A4AE" }}>Klik untuk membuka</div>
                    </div>
                  </a>
                </div>
              )}

              {/* PERCAKAPAN */}
              <div style={{ padding: "20px 28px", borderBottom: ticket.status !== "Selesai" && ticket.status !== "Ditolak" ? "1px solid #F0F0F0" : "none" }}>
                <div style={{ fontSize: 12, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                  💬 Percakapan {ticket.replies?.length > 0 && `(${ticket.replies.length})`}
                </div>
                {ticket.replies?.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {ticket.replies.map((r: any, i: number) => {
                      const isAdmin = r.from === "Admin" || !ticket.name?.includes(r.from);
                      return (
                        <div key={i} style={{ background: isAdmin ? "#E3F2FD" : "#E8F5E9", border: `1px solid ${isAdmin ? "#90CAF9" : "#A5D6A7"}`, borderRadius: 10, padding: "14px 16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isAdmin ? "#1565C0" : "#2E7D32", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                                {r.from?.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: isAdmin ? "#1565C0" : "#2E7D32" }}>
                                {r.from} {isAdmin ? "🛡️" : "👤"}
                              </span>
                            </div>
                            <span style={{ fontSize: 11, color: "#90A4AE" }}>{formatDate(r.time)}</span>
                          </div>
                          <div style={{ fontSize: 14, color: "#1A1A2E", lineHeight: 1.7 }}>{r.text}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "28px", background: "#F5F7FA", borderRadius: 10, border: "1px dashed #CFD8DC" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#607D8B", marginBottom: 4 }}>Belum ada balasan</div>
                    <div style={{ fontSize: 13, color: "#90A4AE" }}>Tim kami akan merespons dalam 1×24 jam kerja.</div>
                  </div>
                )}
              </div>

              {/* FORM TANGGAPI */}
              {ticket.status !== "Ditolak" && (
                <div style={{ padding: "20px 28px" }}>
                  <div style={{ fontSize: 12, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>✍️ Tanggapi Laporan</div>

                  {verifyStep === "idle" && (
                    <div>
                      {submitSuccess && (
                        <div style={{ padding: "12px 16px", borderRadius: 8, background: "#E8F5E9", border: "1px solid #A5D6A7", color: "#2E7D32", fontSize: 13, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                          ✅ Tanggapan Anda berhasil dikirim!
                        </div>
                      )}
                      <button onClick={() => { setVerifyStep("input_email"); setVerifyError(""); setVerifyEmail(ticket.email || ""); }}
                        style={{ padding: "11px 22px", borderRadius: 8, border: "1.5px solid #1565C0", background: "transparent", color: "#1565C0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}>
                        ✍️ Tulis Tanggapan / Ubah Status
                      </button>
                      <p style={{ fontSize: 12, color: "#90A4AE", marginTop: 8 }}>Verifikasi email diperlukan untuk keamanan.</p>
                    </div>
                  )}

                  {verifyStep === "input_email" && (
                    <div style={{ background: "#E3F2FD", border: "1.5px solid #90CAF9", borderRadius: 10, padding: "20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1565C0", marginBottom: 6 }}>🔐 Verifikasi Email</div>
                      <p style={{ fontSize: 13, color: "#607D8B", marginBottom: 14 }}>
                        Masukkan email yang digunakan saat mengirim laporan. Kami akan mengirim kode OTP.
                      </p>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)}
                          placeholder="email@contoh.com" type="email"
                          onKeyDown={e => e.key === "Enter" && handleKirimOtp()}
                          style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={handleKirimOtp} disabled={verifyLoading}
                          style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: verifyLoading ? "#B0BEC5" : "#1565C0", color: "#fff", fontWeight: 700, fontSize: 13, cursor: verifyLoading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                          {verifyLoading ? "Mengirim..." : "Kirim OTP"}
                        </button>
                      </div>
                      {verifyError && <div style={{ padding: "10px 12px", borderRadius: 6, background: "#FFEBEE", color: "#C62828", fontSize: 13 }}>{verifyError}</div>}
                      <button onClick={() => setVerifyStep("idle")} style={{ background: "none", border: "none", color: "#607D8B", fontSize: 13, cursor: "pointer", marginTop: 8 }}>← Batal</button>
                    </div>
                  )}

                  {verifyStep === "input_otp" && (
                    <div style={{ background: "#E3F2FD", border: "1.5px solid #90CAF9", borderRadius: 10, padding: "20px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1565C0", marginBottom: 6 }}>📧 Masukkan Kode OTP</div>
                      <p style={{ fontSize: 13, color: "#607D8B", marginBottom: 14 }}>
                        Kode 6 digit dikirim ke <strong style={{ color: "#1A1A2E" }}>{verifyEmail}</strong>. Berlaku 10 menit.
                      </p>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000" maxLength={6}
                          onKeyDown={e => e.key === "Enter" && handleVerifikasiOtp()}
                          style={{ ...inputStyle, flex: 1, fontSize: 24, letterSpacing: 10, fontWeight: 800, textAlign: "center" }} />
                        <button onClick={handleVerifikasiOtp} disabled={verifyLoading || otpCode.length !== 6}
                          style={{ padding: "10px 20px", borderRadius: 6, border: "none", background: verifyLoading || otpCode.length !== 6 ? "#B0BEC5" : "#2E7D32", color: "#fff", fontWeight: 700, fontSize: 13, cursor: verifyLoading || otpCode.length !== 6 ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                          {verifyLoading ? "Memverifikasi..." : "Verifikasi"}
                        </button>
                      </div>
                      {verifyError && <div style={{ padding: "10px 12px", borderRadius: 6, background: "#FFEBEE", color: "#C62828", fontSize: 13 }}>{verifyError}</div>}
                      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                        <button onClick={() => { setVerifyStep("input_email"); setOtpCode(""); setVerifyError(""); }} style={{ background: "none", border: "none", color: "#607D8B", fontSize: 13, cursor: "pointer" }}>← Ganti Email</button>
                        <button onClick={handleKirimOtp} disabled={verifyLoading} style={{ background: "none", border: "none", color: "#1565C0", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>🔄 Kirim Ulang OTP</button>
                      </div>
                    </div>
                  )}

                  {verifyStep === "verified" && (
                    <div style={{ background: "#E8F5E9", border: "1.5px solid #A5D6A7", borderRadius: 10, padding: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <span style={{ fontSize: 16 }}>✅</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#2E7D32" }}>Terverifikasi sebagai {ticket.name}</span>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#455A64", fontWeight: 600, marginBottom: 8 }}>Tulis Tanggapan (opsional)</label>
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder="Tulis tanggapan atau pertanyaan tambahan..." rows={4}
                          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, background: "#fff" }} />
                      </div>
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: "block", fontSize: 13, color: "#455A64", fontWeight: 600, marginBottom: 10 }}>Ubah Status Laporan (opsional)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            { value: "Selesai", icon: "✅", desc: "Masalah sudah teratasi", color: "#2E7D32", bg: "#E8F5E9", border: "#A5D6A7" },
                            { value: "Butuh Tindak Lanjut", icon: "🔔", desc: "Perlu respons lebih lanjut", color: "#6A1B9A", bg: "#F3E5F5", border: "#CE93D8" },
                          ].map(s => (
                            <button key={s.value} onClick={() => setNewStatus(newStatus === s.value ? "" : s.value)}
                              style={{ padding: "14px", borderRadius: 8, border: `2px solid ${newStatus === s.value ? s.color : s.border}`, background: newStatus === s.value ? s.bg : "#fff", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left", transition: "all 0.2s" }}>
                              <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: newStatus === s.value ? s.color : "#1A1A2E" }}>{s.value}</div>
                              <div style={{ fontSize: 11, color: "#90A4AE", marginTop: 2 }}>{s.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleKirimTanggapan} disabled={submitLoading || (!replyText.trim() && !newStatus)}
                          style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: submitLoading || (!replyText.trim() && !newStatus) ? "#B0BEC5" : "#1565C0", color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitLoading || (!replyText.trim() && !newStatus) ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {submitLoading ? "Mengirim..." : "Kirim Tanggapan →"}
                        </button>
                        <button onClick={() => setVerifyStep("idle")}
                          style={{ padding: "12px 16px", borderRadius: 8, border: "1.5px solid #E0E0E0", background: "#fff", color: "#607D8B", fontSize: 14, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Batal
                        </button>
                      </div>
                    </div>
                  )}

                  {ticket.status === "Selesai" && (
                    <div style={{ textAlign: "center", padding: "20px", background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: 10 }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#2E7D32", marginBottom: 4 }}>Laporan Telah Diselesaikan</div>
                      <div style={{ fontSize: 13, color: "#607D8B" }}>Terima kasih telah menggunakan layanan kami.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={handleReset}
                style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E0E0E0", background: "#fff", color: "#455A64", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                🔍 Cek Laporan Lain
              </button>
              <button onClick={handleCek}
                style={{ padding: "10px 20px", borderRadius: 8, border: "1.5px solid #1565C0", background: "transparent", color: "#1565C0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                🔄 Refresh Status
              </button>
              <a href="/"
                style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#E65100", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                ✉️ Kirim Laporan Baru
              </a>
            </div>
          </div>
        )}

        {/* PANDUAN SINGKAT */}
        {!searched && !loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { icon: "📧", title: "Cek Email", desc: "ID laporan dikirim ke email Anda saat laporan berhasil dikirim.", color: "#1565C0" },
              { icon: "🔍", title: "Masukkan ID", desc: "Ketik ID laporan format TKT-XXXXXX di kolom pencarian di atas.", color: "#E65100" },
              { icon: "💬", title: "Tanggapi", desc: "Balas dan ubah status laporan setelah verifikasi email OTP.", color: "#2E7D32" },
            ].map(c => (
              <div key={c.title} style={{ background: "#fff", borderRadius: 10, padding: "20px", border: "1.5px solid #E0E0E0", borderTop: `3px solid ${c.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: "#607D8B", lineHeight: 1.6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1A237E", color: "#fff", padding: "24px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          © {new Date().getFullYear()} BPMP DKI Jakarta — Unit Layanan Terpadu. Hak cipta dilindungi. •{" "}
          <a href="/admin" style={{ color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Portal Admin</a>
        </div>
      </footer>
    </div>
  );
}
