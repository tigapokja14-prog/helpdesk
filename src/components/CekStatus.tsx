import { useState } from "react";

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
    "Menunggu": { bg: "#FFF3CD", text: "#856404", dot: "#FFC107", icon: "⏳" },
    "Dalam Proses": { bg: "#CCE5FF", text: "#004085", dot: "#0D6EFD", icon: "🔄" },
    "Selesai": { bg: "#D4EDDA", text: "#155724", dot: "#28A745", icon: "✅" },
    "Ditolak": { bg: "#F8D7DA", text: "#721C24", dot: "#DC3545", icon: "❌" },
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
        <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "6px 16px", fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
            {c.icon} {status}
        </span>
    );
}

export default function CekStatus() {
    const [ticketId, setTicketId] = useState(() => {
        // Ambil dari URL parameter jika ada
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return params.get("id") || "";
        }
        return "";
    });
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);

    const handleCek = async () => {
        if (!ticketId.trim()) { setError("Masukkan ID tiket terlebih dahulu."); return; }
        setError("");
        setTicket(null);
        setSearched(false);
        setLoading(true);
        try {
            const res = await fetch(`/api/tiket/${ticketId.trim().toUpperCase()}`);
            const data = await res.json();
            if (res.ok) {
                setTicket(data);
                // Update URL tanpa reload
                window.history.replaceState({}, "", `/cek-status?id=${ticketId.trim().toUpperCase()}`);
            } else {
                setError("Tiket tidak ditemukan. Pastikan ID tiket sudah benar.");
            }
        } catch {
            setError("Gagal terhubung ke server. Coba lagi.");
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    const handleReset = () => {
        setTicket(null);
        setTicketId("");
        setError("");
        setSearched(false);
        window.history.replaceState({}, "", "/cek-status");
    };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0" }}>
            <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #475569; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 1.5s infinite; }
      `}</style>

            {/* NAV */}
            <nav style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10, background: "rgba(15,23,42,0.8)" }}>
                <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                    <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>HelpDesk<span style={{ color: "#38BDF8" }}>ID</span></span>
                </a>
                <a href="/" style={{ padding: "8px 18px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#94A3B8", textDecoration: "none", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    ← Kirim Tiket
                </a>
            </nav>

            <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 20px 60px" }}>

                {/* HEADER */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ width: 64, height: 64, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>
                        🔍
                    </div>
                    <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 800, marginBottom: 10 }}>Cek Status Tiket</h1>
                    <p style={{ color: "#94A3B8", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
                        Masukkan ID tiket yang Anda terima melalui email setelah mengirim laporan.
                    </p>
                </div>

                {/* SEARCH BOX */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "28px", marginBottom: 28, backdropFilter: "blur(20px)" }}>
                    <label style={{ display: "block", fontSize: 13, color: "#94A3B8", fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                        ID Tiket
                    </label>
                    <div style={{ display: "flex", gap: 10 }}>
                        <input
                            value={ticketId}
                            onChange={e => setTicketId(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === "Enter" && handleCek()}
                            placeholder="Contoh: TKT-ABC123"
                            style={{ flex: 1, padding: "14px 18px", borderRadius: 12, border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.12)"}`, background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 16, fontFamily: "'Outfit', sans-serif", outline: "none", letterSpacing: 1, fontWeight: 600 }}
                        />
                        <button onClick={handleCek} disabled={loading}
                            style={{ padding: "14px 28px", borderRadius: 12, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap", minWidth: 100 }}>
                            {loading ? <span className="pulse">Mencari...</span> : "Cek →"}
                        </button>
                    </div>

                    {error && (
                        <div style={{ marginTop: 12, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                            ❌ {error}
                        </div>
                    )}

                    <p style={{ margin: "12px 0 0", fontSize: 12, color: "#475569", textAlign: "center" }}>
                        ID tiket dikirim ke email Anda saat laporan berhasil dikirim • Format: TKT-XXXXXX
                    </p>
                </div>

                {/* LOADING */}
                {loading && (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }} className="pulse">🔍</div>
                        <div style={{ color: "#64748B" }}>Mencari tiket...</div>
                    </div>
                )}

                {/* HASIL */}
                {ticket && (
                    <div className="fade-in">

                        {/* STATUS BANNER */}
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, overflow: "hidden", marginBottom: 16 }}>

                            {/* TOP HEADER */}
                            <div style={{ background: "rgba(56,189,248,0.06)", padding: "24px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>ID Tiket</div>
                                        <div style={{ fontSize: 24, fontWeight: 800, color: "#38BDF8", letterSpacing: 2, marginBottom: 8 }}>{ticket.id}</div>
                                        <div style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0", marginBottom: 4 }}>{ticket.subject}</div>
                                        <div style={{ fontSize: 13, color: "#64748B" }}>Dikirim pada {formatDate(ticket.created)}</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                                        <StatusBadge status={ticket.status} />
                                        {ticket.priority && (
                                            <span style={{ background: PRIORITY_COLOR[ticket.priority]?.bg, color: PRIORITY_COLOR[ticket.priority]?.color, borderRadius: 20, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>
                                                {PRIORITY_COLOR[ticket.priority]?.label || ticket.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* INFO GRID */}
                            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Informasi Pelapor</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                                    {[
                                        ["👤 Nama", ticket.name],
                                        ["📧 Email", ticket.email],
                                        ["🎭 Peran", ticket.peran],
                                        ["📋 Jenis", ticket.jenisLaporan],
                                        ["🗂️ Kategori", ticket.category],
                                        ["🕐 Diperbarui", formatDate(ticket.updated)],
                                    ].map(([l, v]) => (
                                        <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginBottom: 5 }}>{l}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", wordBreak: "break-all" }}>{v || "-"}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DESKRIPSI */}
                            <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>📝 Deskripsi Laporan</div>
                                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "16px", border: "1px solid rgba(255,255,255,0.06)", fontSize: 14, color: "#CBD5E1", lineHeight: 1.8 }}>
                                    {ticket.description}
                                </div>
                            </div>

                            {/* LAMPIRAN */}
                            {ticket.attachment && (
                                <div style={{ padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>📎 Lampiran</div>
                                    <a href={ticket.attachment} target="_blank" rel="noopener noreferrer"
                                        style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 16px", textDecoration: "none" }}>
                                        <span style={{ fontSize: 20 }}>📎</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "#38BDF8" }}>Lihat File Lampiran</div>
                                            <div style={{ fontSize: 11, color: "#64748B" }}>Klik untuk membuka</div>
                                        </div>
                                    </a>
                                </div>
                            )}

                            {/* BALASAN */}
                            <div style={{ padding: "20px 28px" }}>
                                <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                                    💬 Balasan Tim {ticket.replies?.length > 0 && `(${ticket.replies.length})`}
                                </div>

                                {ticket.replies?.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        {ticket.replies.map((r: any, i: number) => (
                                            <div key={i} style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 12, padding: "16px 18px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                                                            {r.from?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: 14, fontWeight: 700, color: "#38BDF8" }}>{r.from}</span>
                                                    </div>
                                                    <span style={{ fontSize: 12, color: "#64748B" }}>{formatDate(r.time)}</span>
                                                </div>
                                                <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.7 }}>{r.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: "center", padding: "32px 20px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
                                        <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
                                        <div style={{ fontSize: 15, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Belum ada balasan</div>
                                        <div style={{ fontSize: 13, color: "#334155" }}>Tim kami akan merespons dalam 1×24 jam kerja.</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                            <button onClick={handleReset}
                                style={{ padding: "11px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                🔍 Cek Tiket Lain
                            </button>
                            <button onClick={() => { setLoading(true); handleCek(); }}
                                style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                🔄 Refresh Status
                            </button>
                            <a href="/"
                                style={{ padding: "11px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#94A3B8", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textDecoration: "none" }}>
                                ✉️ Kirim Tiket Baru
                            </a>
                        </div>
                    </div>
                )}

                {/* BELUM CARI */}
                {!searched && !loading && !ticket && (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, maxWidth: 560, margin: "0 auto" }}>
                            {[
                                { icon: "📧", title: "Cek Email", desc: "ID tiket dikirim ke email Anda saat laporan dikirim" },
                                { icon: "🔍", title: "Masukkan ID", desc: "Ketik ID tiket format TKT-XXXXXX di kolom di atas" },
                                { icon: "📊", title: "Lihat Status", desc: "Lihat status, deskripsi, dan balasan dari tim kami" },
                            ].map(c => (
                                <div key={c.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                                    <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>{c.title}</div>
                                    <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{c.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
