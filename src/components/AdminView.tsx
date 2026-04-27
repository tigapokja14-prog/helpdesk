import { useState, useEffect } from "react";

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  "Menunggu": { bg: "#FFF3CD", text: "#856404", dot: "#FFC107" },
  "Dalam Proses": { bg: "#CCE5FF", text: "#004085", dot: "#0D6EFD" },
  "Selesai": { bg: "#D4EDDA", text: "#155724", dot: "#28A745" },
  "Ditolak": { bg: "#F8D7DA", text: "#721C24", dot: "#DC3545" },
};
const PRIORITY_COLOR: Record<string, string> = {
  "Tinggi": "#EF4444",
  "Sedang": "#F59E0B",
  "Rendah": "#10B981",
};
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] || { bg: "#eee", text: "#333", dot: "#999" };
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

// ─── Login Screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr("");
    if (!token.trim()) { setErr("Masukkan token admin."); return; }
    setLoading(true);
    // Validasi token dengan memanggil API
    const res = await fetch("/api/tiket", { headers: { Authorization: `Bearer ${token}` } });
    setLoading(false);
    if (res.ok) onLogin(token);
    else setErr("Token tidak valid. Coba lagi.");
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "48px 40px", width: 360, backdropFilter: "blur(20px)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
          </div>
          <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Admin Panel</h2>
          <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Masukkan token admin untuk melanjutkan</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Admin Token</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="Masukkan token rahasia"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", outline: "none" }} />
          </div>
          {err && <div style={{ fontSize: 13, color: "#F87171", textAlign: "center" }}>{err}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ padding: "13px", borderRadius: 10, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
            {loading ? "Memverifikasi..." : "Masuk →"}
          </button>
          <p style={{ color: "#475569", fontSize: 12, textAlign: "center", margin: 0 }}>Token diatur di file <code>.env</code> server</p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Admin ──────────────────────────────────────────
function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterPriority, setFilterPriority] = useState("Semua");
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  // Debug — cek token yang dikirim
  console.log('Token yang dipakai:', token);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch semua tiket
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/tiket");
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch { /* silent */ } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch detail tiket + balasan
  const fetchTicketDetail = async (id: string) => {
    const res = await fetch(`/api/tiket/${id}`);
    const data = await res.json();
    if (res.ok) { setSelected(data); setNewStatus(data.status); setReply(""); }
  };

  useEffect(() => { fetchTickets(); }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = t.id?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "Semua" || t.status === filterStatus;
    const matchPriority = filterPriority === "Semua" || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleUpdateStatus = async () => {
    if (!newStatus || !selected) return;
    setLoadingAction(true);
    try {
      console.log('Update status dengan token:', token);
      const res = await fetch(`/api/tiket/${selected.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      console.log('Response update status:', res.status, data);
      if (res.ok) {
        await fetchTickets();
        await fetchTicketDetail(selected.id);
        showToast(`Status diperbarui ke "${newStatus}"`);
      } else {
        showToast(`Gagal: ${data.error || data.detail}`, "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setLoadingAction(true);
    try {
      console.log('Mengirim balasan dengan token:', token);
      const res = await fetch("/api/balasan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: selected.id, text: reply }),
      });
      const data = await res.json();
      console.log('Response balasan:', res.status, data);
      if (res.ok) {
        setReply("");
        await fetchTicketDetail(selected.id);
        showToast("Balasan berhasil dikirim");
      } else {
        showToast(`Gagal: ${data.error || data.detail}`, "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleExport = () => {
    const header = ["ID", "Nama", "Email", "Subjek", "Kategori", "Prioritas", "Status", "Dibuat", "Diperbarui"];
    const rows = tickets.map(t => [t.id, t.name, t.email, t.subject, t.category, t.priority, t.status, t.created, t.updated]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tiket-helpdesk.csv"; a.click();
    showToast("Data berhasil diekspor");
  };

  const stats = [
    { label: "Total Tiket", value: tickets.length, color: "#3B82F6" },
    { label: "Menunggu", value: tickets.filter(t => t.status === "Menunggu").length, color: "#F59E0B" },
    { label: "Dalam Proses", value: tickets.filter(t => t.status === "Dalam Proses").length, color: "#0EA5E9" },
    { label: "Selesai", value: tickets.filter(t => t.status === "Selesai").length, color: "#10B981" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0", display: "flex" }}>
      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {toast.msg}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: 240, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "24px 16px", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, padding: "0 8px" }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>HelpDesk<span style={{ color: "#38BDF8" }}>ID</span></span>
        </div>
        <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Menu</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(56,189,248,0.1)", marginBottom: 4, color: "#38BDF8", fontWeight: 600, fontSize: 14 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Semua Tiket
        </div>
        <div style={{ marginTop: "auto" }}>
          <button onClick={onLogout} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Dashboard Admin</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Kelola semua tiket bantuan</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={fetchTickets} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              🔄 Refresh
            </button>
            <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              ⬇️ Export CSV
            </button>
          </div>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: s.color, opacity: 0.08 }} />
                <div style={{ fontSize: 32, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari ID, nama, atau subjek..."
                style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", outline: "none" }} />
            </div>
            {([["filterStatus", filterStatus, setFilterStatus, ["Semua", "Menunggu", "Dalam Proses", "Selesai", "Ditolak"]], ["filterPriority", filterPriority, setFilterPriority, ["Semua", "Rendah", "Sedang", "Tinggi"]]] as any[]).map(([key, val, setter, opts]) => (
              <select key={key} value={val} onChange={e => setter(e.target.value)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#1E293B", color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }}>
                {opts.map((o: string) => <option key={o}>{o}</option>)}
              </select>
            ))}
          </div>

          {/* TABLE + DETAIL */}
          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
            {/* TABLE */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
              {loadingTickets ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Memuat data tiket...</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                      {["ID Tiket", "Nama / Subjek", "Kategori", "Prioritas", "Status", "Tanggal"].map(h => (
                        <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 && (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#475569" }}>Tidak ada tiket ditemukan.</td></tr>
                    )}
                    {filtered.map(t => (
                      <tr key={t.id} onClick={() => fetchTicketDetail(t.id)}
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: selected?.id === t.id ? "rgba(56,189,248,0.07)" : "transparent", transition: "background 0.15s" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#38BDF8" }}>{t.id}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>{t.subject}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#94A3B8" }}>{t.category}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: PRIORITY_COLOR[t.priority] }}>● {t.priority}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={t.status} /></td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#64748B" }}>{formatDate(t.created)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* DETAIL PANEL */}
            {selected && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#38BDF8", fontWeight: 700, marginBottom: 4 }}>{selected.id}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{selected.subject}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94A3B8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
                <div style={{ padding: "16px 20px", maxHeight: "80vh", overflowY: "auto" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[["Nama", selected.name], ["Email", selected.email], ["Kategori", selected.category], ["Prioritas", selected.priority]].map(([l, v]) => (
                      <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: l === "Prioritas" ? PRIORITY_COLOR[v] : "#E2E8F0", wordBreak: "break-all" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Deskripsi</div>
                    <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>{selected.description}</div>
                  </div>
                  {selected.attachment && (
                    <a href={selected.attachment} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, textDecoration: "none" }}>
                      <span style={{ fontSize: 20 }}>📎</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#38BDF8" }}>Lihat Lampiran</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>Klik untuk membuka di Google Drive</div>
                      </div>
                    </a>
                  )}

                  {/* UPDATE STATUS */}
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 10 }}>Update Status</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                        style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#1E293B", color: "#E2E8F0", fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: "none" }}>
                        {["Menunggu", "Dalam Proses", "Selesai", "Ditolak"].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <button onClick={handleUpdateStatus} disabled={loadingAction}
                        style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                        Simpan
                      </button>
                    </div>
                  </div>

                  {/* BALASAN */}
                  {selected.replies?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 10 }}>Riwayat Balasan</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {selected.replies.map((r: any, i: number) => (
                          <div key={i} style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, color: "#38BDF8", fontWeight: 700, marginBottom: 4 }}>{r.from} · {formatDate(r.time)}</div>
                            <div style={{ fontSize: 13 }}>{r.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORM BALAS */}
                  <div>
                    <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Kirim Balasan</div>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Tulis balasan ke pengguna..." rows={3}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#E2E8F0", fontSize: 13, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", outline: "none", resize: "none", marginBottom: 8 }} />
                    <button onClick={handleReply} disabled={loadingAction}
                      style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                      {loadingAction ? "Mengirim..." : "Kirim Balasan"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export default function AdminView() {
  const [token, setToken] = useState<string | null>(null);
  return token
    ? <Dashboard token={token} onLogout={() => setToken(null)} />
    : <LoginScreen onLogin={setToken} />;
}
