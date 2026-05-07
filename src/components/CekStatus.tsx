import { useState } from "react";

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
    "Menunggu": { bg: "#FFF3CD", text: "#856404", dot: "#FFC107", icon: "⏳" },
    "Dalam Proses": { bg: "#CCE5FF", text: "#004085", dot: "#0D6EFD", icon: "🔄" },
    "Selesai": { bg: "#D4EDDA", text: "#155724", dot: "#28A745", icon: "✅" },
    "Ditolak": { bg: "#F8D7DA", text: "#721C24", dot: "#DC3545", icon: "❌" },
    "Butuh Tindak Lanjut": { bg: "#E8D5FF", text: "#5B21B6", dot: "#8B5CF6", icon: "🔔" },
};

const PRIORITY_COLOR: Record<string, { color: string; bg: string; label: string }> = {
    "Tinggi": { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "🔴 Tinggi" },
    "Sedang": { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "🟡 Sedang" },
    "Rendah": { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "🟢 Rendah" },
};

const formatDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

function StatusBadge({ status }: { status: string }) {
    const c = STATUS_COLOR[status] || { bg: "#eee", text: "#333", dot: "#999", icon: "❓" };
    return (
        <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
            {c.icon} {status}
        </span>
    );
}

// ─── Step verifikasi ─────────────────────────────────────────
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

    // Tanggapi state
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

    // ── Cek tiket ───────────────────────────────────────────────
    const handleCek = async () => {
        if (!ticketId.trim()) { setError("Masukkan ID tiket terlebih dahulu."); return; }
        setError(""); setTicket(null); setSearched(false);
        setVerifyStep("idle"); setSubmitSuccess(false);
        setLoading(true);
        try {
            const res = await fetch(`/api/tiket/${ticketId.trim().toUpperCase()}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data);
                window.history.replaceState({}, "", `/cek-status?id=${ticketId.trim().toUpperCase()}`);
            } else {
                setError("Tiket tidak ditemukan. Pastikan ID tiket sudah benar.");
            }
        } catch {
            setError("Gagal terhubung ke server. Coba lagi.");
        } finally { setLoading(false); setSearched(true); }
    };

    // ── Kirim OTP ───────────────────────────────────────────────
    const handleKirimOtp = async () => {
        if (!verifyEmail.trim()) { setVerifyError("Masukkan email Anda."); return; }
        setVerifyError(""); setVerifyLoading(true);
        try {
            const res = await fetch("/api/otp/kirim", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId: ticket.id, email: verifyEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                setVerifyStep("input_otp");
                showToast("OTP dikirim ke email Anda. Berlaku 10 menit.");
            } else {
                setVerifyError(data.error || "Gagal mengirim OTP");
            }
        } catch { setVerifyError("Gagal terhubung ke server."); }
        finally { setVerifyLoading(false); }
    };

    // ── Verifikasi OTP ──────────────────────────────────────────
    const handleVerifikasiOtp = async () => {
        if (otpCode.length !== 6) { setVerifyError("Masukkan 6 digit kode OTP."); return; }
        setVerifyError(""); setVerifyLoading(true);
        try {
            const res = await fetch("/api/otp/verifikasi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId: ticket.id, email: verifyEmail, otp: otpCode }),
            });
            const data = await res.json();
            if (res.ok) {
                setVerifyStep("verified");
                showToast("Verifikasi berhasil! Anda bisa menanggapi tiket.");
            } else {
                setVerifyError(data.error || "OTP tidak valid");
            }
        } catch { setVerifyError("Gagal verifikasi."); }
        finally { setVerifyLoading(false); }
    };

    // ── Kirim tanggapan ─────────────────────────────────────────
    const handleKirimTanggapan = async () => {
        if (!replyText.trim() && !newStatus) {
            showToast("Tulis tanggapan atau pilih status terlebih dahulu.", "error"); return;
        }
        setSubmitLoading(true);
        try {
            const res = await fetch("/api/user/tanggapi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticketId: ticket.id, text: replyText, status: newStatus }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitSuccess(true);
                setVerifyStep("idle");
                setReplyText(""); setNewStatus(""); setOtpCode(""); setVerifyEmail("");
                // Refresh data tiket
                const refreshRes = await fetch(`/api/tiket/${ticket.id}`);
                const refreshData = await refreshRes.json();
                if (refreshRes.ok) setTicket(refreshData);
                showToast("Tanggapan berhasil dikirim! Tim kami akan segera merespons.");
            } else {
                showToast(data.error || "Gagal mengirim tanggapan.", "error");
            }
        } catch { showToast("Gagal terhubung ke server.", "error"); }
        finally { setSubmitLoading(false); }
    };

    const handleReset = () => {
        setTicket(null); setTicketId(""); setError(""); setSearched(false);
        setVerifyStep("idle"); setSubmitSuccess(false);
        window.history.replaceState({}, "", "/cek-status");
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "12px 16px", borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
        color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif",
        boxSizing: "border-box", outline: "none",
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0" }}>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder { color: #475569; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .pulse { animation: pulse 1.5s infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
      `}</style>

            {/* TOAST */}
            {toast && (
                <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "14px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxWidth: 360, animation: "fadeIn 0.3s ease" }}>
                    {toast.msg}
                </div>
            )}

            {/* NAV */}
            <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "sticky", top: 0, zIndex: 10, background: "rgba(15,23,42,0.9)", backdropFilter: "blur(12px)" }}>
                <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                    <img src="/logo_b.png" alt="Kemendikdasmen - Unit Layanan Terpadu"
                        style={{ height: 44, objectFit: "contain" }} />
                </a>
                <a href="/" style={{ padding: "8px 18px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
                    ← Kirim Tiket
                </a>
            </nav>

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 80px" }}>

                {/* HEADER */}
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🔍</div>
                    <h1 style={{ fontSize: "clamp(24px, 5vw, 34px)", fontWeight: 800, marginBottom: 10 }}>Cek Status Tiket</h1>
                    <p style={{ color: "#94A3B8", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
                        Masukkan ID tiket yang Anda terima melalui email setelah mengirim laporan.
                    </p>
                </div>

                {/* SEARCH BOX */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "24px", marginBottom: 24, backdropFilter: "blur(20px)" }}>
                    <label style={{ display: "block", fontSize: 12, color: "#94A3B8", fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>ID Tiket</label>
                    <div style={{ display: "flex", gap: 10 }}>
                        <input value={ticketId} onChange={e => setTicketId(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === "Enter" && handleCek()}
                            placeholder="Contoh: TKT-ABC123"
                            style={{ ...inputStyle, flex: 1, fontSize: 16, letterSpacing: 1, fontWeight: 600, border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}` }} />
                        <button onClick={handleCek} disabled={loading}
                            style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
                            {loading ? <span className="pulse">Mencari...</span> : "Cek →"}
                        </button>
                    </div>
                    {error && (
                        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 13 }}>
                            ❌ {error}
                        </div>
                    )}
                    <p style={{ margin: "10px 0 0", fontSize: 12, color: "#475569", textAlign: "center" }}>
                        Format ID Tiket: TKT-XXXXXX • Cek email konfirmasi Anda
                    </p>
                </div>

                {/* HASIL */}
                {ticket && (
                    <div className="fade-in">
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>

                            {/* HEADER TIKET */}
                            <div style={{ background: "rgba(56,189,248,0.06)", padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>ID Tiket</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: "#38BDF8", letterSpacing: 2, marginBottom: 8 }}>{ticket.id}</div>
                                        <div style={{ fontSize: 17, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{ticket.subject}</div>
                                        <div style={{ fontSize: 12, color: "#64748B" }}>Dikirim {formatDate(ticket.created)}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                        <StatusBadge status={ticket.status} />
                                        {ticket.priority && (
                                            <span style={{ background: PRIORITY_COLOR[ticket.priority]?.bg, color: PRIORITY_COLOR[ticket.priority]?.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 }}>
                                                {PRIORITY_COLOR[ticket.priority]?.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* INFO GRID */}
                            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Informasi Pelapor</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                                    {[
                                        ["👤 Nama", ticket.name],
                                        ["📧 Email", ticket.email],
                                        ["🎭 Peran", ticket.peran],
                                        ["📋 Jenis", ticket.jenisLaporan],
                                        ["🗂️ Kategori", ticket.category],
                                        ["🕐 Diperbarui", formatDate(ticket.updated)],
                                    ].map(([l, v]) => (
                                        <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginBottom: 4 }}>{l}</div>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0", wordBreak: "break-all" }}>{v || "-"}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DESKRIPSI */}
                            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📝 Deskripsi Laporan</div>
                                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "14px", border: "1px solid rgba(255,255,255,0.06)", fontSize: 14, color: "#CBD5E1", lineHeight: 1.8 }}>
                                    {ticket.description}
                                </div>
                            </div>

                            {/* LAMPIRAN */}
                            {ticket.attachment && (
                                <div style={{ padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📎 Lampiran</div>
                                    <a href={ticket.attachment} target="_blank" rel="noopener noreferrer"
                                        style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 16px", textDecoration: "none" }}>
                                        <span style={{ fontSize: 18 }}>📎</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#38BDF8" }}>Lihat File Lampiran</div>
                                            <div style={{ fontSize: 11, color: "#64748B" }}>Klik untuk membuka</div>
                                        </div>
                                    </a>
                                </div>
                            )}

                            {/* BALASAN */}
                            <div style={{ padding: "20px 28px", borderBottom: ticket.status !== "Selesai" && ticket.status !== "Ditolak" ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                                    💬 Percakapan {ticket.replies?.length > 0 && `(${ticket.replies.length})`}
                                </div>
                                {ticket.replies?.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {ticket.replies.map((r: any, i: number) => {
                                            const isAdmin = r.from === "Admin" || !ticket.name?.includes(r.from);
                                            return (
                                                <div key={i} style={{
                                                    background: isAdmin ? "rgba(59,130,246,0.06)" : "rgba(16,185,129,0.06)",
                                                    border: `1px solid ${isAdmin ? "rgba(59,130,246,0.15)" : "rgba(16,185,129,0.15)"}`,
                                                    borderRadius: 12, padding: "14px 16px",
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: isAdmin ? "linear-gradient(135deg, #3B82F6, #06B6D4)" : "linear-gradient(135deg, #10B981, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                                                                {r.from?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span style={{ fontSize: 13, fontWeight: 700, color: isAdmin ? "#38BDF8" : "#10B981" }}>
                                                                {r.from} {isAdmin ? "🛡️" : "👤"}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: 11, color: "#64748B" }}>{formatDate(r.time)}</span>
                                                    </div>
                                                    <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.7 }}>{r.text}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "28px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.08)" }}>
                                        <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 4 }}>Belum ada balasan</div>
                                        <div style={{ fontSize: 12, color: "#334155" }}>Tim kami akan merespons dalam 1×24 jam kerja.</div>
                                    </div>
                                )}
                            </div>

                            {/* FORM TANGGAPI — sembunyikan jika tiket Selesai atau Ditolak */}
                            {ticket.status !== "Ditolak" && (
                                <div style={{ padding: "20px 28px" }}>
                                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                                        ✍️ Tanggapi Tiket
                                    </div>

                                    {/* STEP 1: Tombol mulai */}
                                    {verifyStep === "idle" && (
                                        <div>
                                            {submitSuccess && (
                                                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#6EE7B7", fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                                                    ✅ Tanggapan Anda berhasil dikirim!
                                                </div>
                                            )}
                                            <button onClick={() => { setVerifyStep("input_email"); setVerifyError(""); setVerifyEmail(ticket.email || ""); }}
                                                style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.08)", color: "#38BDF8", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                                                ✍️ Tulis Tanggapan / Ubah Status
                                            </button>
                                            <p style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                                                Verifikasi email diperlukan untuk keamanan.
                                            </p>
                                        </div>
                                    )}

                                    {/* STEP 2: Input email */}
                                    {verifyStep === "input_email" && (
                                        <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 14, padding: "20px" }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "#38BDF8", marginBottom: 6 }}>🔐 Verifikasi Email</div>
                                            <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 14 }}>
                                                Masukkan email yang Anda gunakan saat mengirim tiket ini. Kami akan mengirim kode OTP untuk verifikasi.
                                            </p>
                                            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                                <input value={verifyEmail} onChange={e => setVerifyEmail(e.target.value)}
                                                    placeholder="email@contoh.com" type="email"
                                                    onKeyDown={e => e.key === "Enter" && handleKirimOtp()}
                                                    style={{ ...inputStyle, flex: 1 }} />
                                                <button onClick={handleKirimOtp} disabled={verifyLoading}
                                                    style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: verifyLoading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: verifyLoading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
                                                    {verifyLoading ? "Mengirim..." : "Kirim OTP"}
                                                </button>
                                            </div>
                                            {verifyError && <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#FCA5A5", fontSize: 13 }}>{verifyError}</div>}
                                            <button onClick={() => setVerifyStep("idle")} style={{ background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer", marginTop: 8 }}>← Batal</button>
                                        </div>
                                    )}

                                    {/* STEP 3: Input OTP */}
                                    {verifyStep === "input_otp" && (
                                        <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 14, padding: "20px" }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "#38BDF8", marginBottom: 6 }}>📧 Masukkan Kode OTP</div>
                                            <p style={{ fontSize: 13, color: "#94A3B8", marginBottom: 14 }}>
                                                Kode 6 digit telah dikirim ke <strong style={{ color: "#E2E8F0" }}>{verifyEmail}</strong>. Berlaku 10 menit.
                                            </p>
                                            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                                                <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                    placeholder="123456" maxLength={6}
                                                    onKeyDown={e => e.key === "Enter" && handleVerifikasiOtp()}
                                                    style={{ ...inputStyle, flex: 1, fontSize: 24, letterSpacing: 8, fontWeight: 700, textAlign: "center" }} />
                                                <button onClick={handleVerifikasiOtp} disabled={verifyLoading || otpCode.length !== 6}
                                                    style={{ padding: "12px 20px", borderRadius: 10, border: "none", background: verifyLoading || otpCode.length !== 6 ? "#334155" : "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: verifyLoading || otpCode.length !== 6 ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
                                                    {verifyLoading ? "Memverifikasi..." : "Verifikasi"}
                                                </button>
                                            </div>
                                            {verifyError && <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "#FCA5A5", fontSize: 13 }}>{verifyError}</div>}
                                            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                                                <button onClick={() => { setVerifyStep("input_email"); setOtpCode(""); setVerifyError(""); }} style={{ background: "none", border: "none", color: "#64748B", fontSize: 13, cursor: "pointer" }}>← Ganti Email</button>
                                                <button onClick={handleKirimOtp} disabled={verifyLoading} style={{ background: "none", border: "none", color: "#38BDF8", fontSize: 13, cursor: "pointer" }}>🔄 Kirim ulang OTP</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: Form tanggapan */}
                                    {verifyStep === "verified" && (
                                        <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 14, padding: "20px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                                <span style={{ fontSize: 16 }}>✅</span>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#10B981" }}>Terverifikasi sebagai {ticket.name}</span>
                                            </div>

                                            {/* Tulis tanggapan */}
                                            <div style={{ marginBottom: 16 }}>
                                                <label style={{ display: "block", fontSize: 13, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Tulis Tanggapan (opsional)</label>
                                                <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                                    placeholder="Tulis tanggapan atau pertanyaan tambahan Anda di sini..."
                                                    rows={4}
                                                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                                            </div>

                                            {/* Ubah status */}
                                            <div style={{ marginBottom: 20 }}>
                                                <label style={{ display: "block", fontSize: 13, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Ubah Status Tiket (opsional)</label>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                                    {[
                                                        { value: "Selesai", icon: "✅", desc: "Masalah sudah teratasi", color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
                                                        { value: "Butuh Tindak Lanjut", icon: "🔔", desc: "Perlu respons lebih lanjut", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" },
                                                    ].map(s => (
                                                        <button key={s.value} onClick={() => setNewStatus(newStatus === s.value ? "" : s.value)}
                                                            style={{ padding: "14px", borderRadius: 10, border: `2px solid ${newStatus === s.value ? s.color : s.border}`, background: newStatus === s.value ? s.bg : "transparent", cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "left", transition: "all 0.2s" }}>
                                                            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: newStatus === s.value ? s.color : "#E2E8F0" }}>{s.value}</div>
                                                            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{s.desc}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: 10 }}>
                                                <button onClick={handleKirimTanggapan} disabled={submitLoading || (!replyText.trim() && !newStatus)}
                                                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: "none", background: submitLoading || (!replyText.trim() && !newStatus) ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitLoading || (!replyText.trim() && !newStatus) ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                                    {submitLoading ? "Mengirim..." : "Kirim Tanggapan →"}
                                                </button>
                                                <button onClick={() => setVerifyStep("idle")}
                                                    style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#64748B", fontSize: 14, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                                    Batal
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tiket sudah Selesai */}
                            {ticket.status === "Selesai" && (
                                <div style={{ padding: "20px 28px" }}>
                                    <div style={{ textAlign: "center", padding: "20px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12 }}>
                                        <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>Tiket Telah Diselesaikan</div>
                                        <div style={{ fontSize: 13, color: "#64748B" }}>Terima kasih telah menggunakan layanan kami.</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACTIONS */}
                        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                            <button onClick={handleReset}
                                style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                🔍 Cek Tiket Lain
                            </button>
                            <button onClick={handleCek}
                                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "rgba(56,189,248,0.1)", color: "#38BDF8", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", border: "1px solid rgba(56,189,248,0.2)" as any }}>
                                🔄 Refresh Status
                            </button>
                            <a href="/"
                                style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
                                ✉️ Kirim Tiket Baru
                            </a>
                        </div>
                    </div>
                )}

                {/* PANDUAN */}
                {!searched && !loading && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, maxWidth: 560, margin: "0 auto" }}>
                        {[
                            { icon: "📧", title: "Cek Email", desc: "ID tiket dikirim ke email saat laporan berhasil dikirim" },
                            { icon: "🔍", title: "Masukkan ID", desc: "Ketik ID tiket format TKT-XXXXXX di kolom di atas" },
                            { icon: "💬", title: "Tanggapi", desc: "Balas dan ubah status tiket setelah verifikasi email" },
                        ].map(c => (
                            <div key={c.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>{c.title}</div>
                                <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{c.desc}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
