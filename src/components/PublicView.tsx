import { useState, useRef } from "react";

const ADMIN_TOKEN = import.meta.env.PUBLIC_ADMIN_TOKEN || "";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] || { bg: "#eee", text: "#333", dot: "#999" };
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function PublicView() {
  const [tab, setTab] = useState<"kirim" | "cek">("kirim");
  const [form, setForm] = useState({
    name: "",
    email: "",
    peran: "Guru/Dosen",
    jenisLaporan: "Pertanyaan/Informasi",
    category: "Umum",
    subject: "",
    description: "",
    priority: "Sedang",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [trackId, setTrackId] = useState("");
  const [trackedTicket, setTrackedTicket] = useState<any>(null);
  const [trackError, setTrackError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Kirim tiket ke API ───────────────────────────────────
  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.subject || !form.description) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload file langsung ke Cloudinary dari browser
      let fileUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "helpdesk_unsigned");
        fd.append("folder", "helpdesk-lampiran");

        const cloudName = "dg5h79mpx";  // ← ganti dengan cloud name Anda
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          { method: "POST", body: fd }
        );
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Gagal upload file");
        fileUrl = uploadData.secure_url;
      }

      // 2. Kirim data tiket ke server
      const res = await fetch("/api/tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attachment: fileUrl }),
      });

      const rawText = await res.text();
      const data = JSON.parse(rawText);
      if (res.ok) setSubmitted(data.id);
      else throw new Error(data.error || "Gagal mengirim tiket");

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Cek status tiket dari API ────────────────────────────
  const handleTrack = async () => {
    setTrackError("");
    setTrackedTicket(null);
    if (!trackId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tiket/${trackId.trim()}`);
      const data = await res.json();
      if (res.ok) setTrackedTicket(data);
      else setTrackError(data.error || "Tiket tidak ditemukan.");
    } catch {
      setTrackError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0" }}>
      {/* NAV */}
      <nav style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>BPMP JAKARTA<span style={{ color: "#38BDF8" }}> | Unit Layanan Terpadu</span></span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setTab("kirim"); setSubmitted(null); setError(""); }}
            style={{
              padding: "8px 22px", borderRadius: 30, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14,
              background: tab === "kirim" ? "linear-gradient(135deg, #3B82F6, #06B6D4)" : "rgba(255,255,255,0.08)",
              color: tab === "kirim" ? "#fff" : "#94A3B8"
            }}>
            Kirim Tiket
          </button>

          {/* ← TAMBAHKAN INI */}
          <a href="/panduan"
            style={{ padding: "8px 18px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94A3B8", textDecoration: "none", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 4 }}>
            📖 Panduan
          </a>

          <a href="/cek-status"
            style={{
              padding: "8px 22px", borderRadius: 30, border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14,
              background: "rgba(255,255,255,0.08)", color: "#94A3B8", textDecoration: "none", display: "inline-flex", alignItems: "center"
            }}>
            Cek Status
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }}>
          Ada yang bisa kami<br />
          <span style={{ background: "linear-gradient(90deg, #38BDF8, #818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>bantu?</span>
        </h1>
        <p style={{ color: "#94A3B8", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>Kirim tiket bantuan atau cek status tiket Anda dengan cepat dan mudah.</p>
      </div>

      {/* CARD */}
      <div style={{ maxWidth: 680, margin: "0 auto 60px", padding: "0 20px" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px", backdropFilter: "blur(20px)" }}>

          {/* ── KIRIM TIKET ── */}
          <div style={{ display: "grid", gap: 16 }}>

            {/* Nama & Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Nama Lengkap *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Masukkan nama lengkap" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Alamat Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="contoh@email.com" style={inputStyle} />
              </div>
            </div>

            {/* Peran */}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Peran *</label>
              <select value={form.peran} onChange={e => setForm(f => ({ ...f, peran: e.target.value }))}
                style={{ ...inputStyle, background: "#1E293B" }}>
                {["Guru/Dosen", "Orang Tua Murid/Wali", "Operator Sekolah", "Mahasiswa", "Murid", "Yayasan", "Pribadi", "Lainnya"].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Jenis Laporan & Kategori */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Jenis Laporan *</label>
                <select value={form.jenisLaporan} onChange={e => setForm(f => ({ ...f, jenisLaporan: e.target.value }))}
                  style={{ ...inputStyle, background: "#1E293B" }}>
                  {["Pertanyaan/Informasi", "Permintaan", "Keluhan/Kendala", "Aspirasi/Saran", "Pengaduan"].map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Kategori *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    style={{ ...inputStyle, background: "#1E293B" }}>
                    {["Lembaga/Fasilitas", "Pendidikan", "Umum", "Lainnya"].map(o => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Prioritas *</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    style={{ ...inputStyle, background: "#1E293B" }}>
                    {[
                      { value: "Rendah", label: "🟢 Rendah — Tidak mendesak" },
                      { value: "Sedang", label: "🟡 Sedang — Perlu ditangani" },
                      { value: "Tinggi", label: "🔴 Tinggi — Mendesak" },
                    ].map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Subjek */}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Subjek/Judul Laporan *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                placeholder="Tuliskan judul laporan Anda" style={inputStyle} />
            </div>

            {/* Deskripsi */}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Deskripsi Masalah *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Jelaskan masalah atau laporan Anda secara detail..." rows={5}
                style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {/* Upload Lampiran */}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Lampiran (opsional)</label>
              <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border: `2px dashed ${dragging ? "#38BDF8" : "rgba(255,255,255,0.15)"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(56,189,248,0.05)" : "transparent", transition: "all 0.2s" }}>
                <input ref={fileRef} type="file" style={{ display: "none" }}
                  accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx"
                  onChange={e => setFile(e.target.files?.[0] || null)} />
                {file ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>📎</span>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#38BDF8" }}>{file.name}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }}
                      style={{ background: "rgba(239,68,68,0.2)", border: "none", color: "#EF4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 }}>
                      Hapus
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
                    <div style={{ fontSize: 14, color: "#94A3B8" }}>Drag & drop atau <span style={{ color: "#38BDF8" }}>klik untuk pilih</span></div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>PNG, JPG, PDF, DOC — maks. 10MB</div>
                  </>
                )}
              </div>
            </div>

            {/* Tombol Kirim */}
            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: "14px", borderRadius: 12, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
              {loading ? "Mengirim..." : "Kirim Laporan →"}
            </button>

          </div>
          {/* ── SUKSES ── */}
          {tab === "kirim" && submitted && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, #10B981, #06B6D4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✓</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tiket Berhasil Dikirim!</h2>
              <p style={{ color: "#94A3B8", marginBottom: 24 }}>Tim kami akan segera menangani masalah Anda.</p>
              <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 12, padding: "16px 24px", display: "inline-block" }}>
                <div style={{ fontSize: 13, color: "#94A3B8", marginBottom: 4 }}>ID Tiket Anda</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#38BDF8", letterSpacing: 2 }}>{submitted}</div>
              </div>
              <p style={{ color: "#64748B", fontSize: 13, marginTop: 16 }}>Simpan ID ini untuk mengecek status tiket Anda.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                <button onClick={() => { setSubmitted(null); setForm({ name: "", email: "", peran: "Guru/Dosen", jenisLaporan: "Pertanyaan/Informasi", category: "Umum", subject: "", description: "", priority: "Sedang" });; setFile(null); }}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#E2E8F0", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
                  Kirim Tiket Baru
                </button>
                <a href={`/cek-status?id=${submitted}`}
                  style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
                  Cek Status
                </a>              </div>
            </div>
          )}

          {/* ── CEK STATUS ── */}
          {tab === "cek" && (
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Cek Status Tiket</h2>
              <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 20 }}>
                Masukkan ID tiket yang Anda terima saat mengirim laporan.
              </p>

              {/* FORM CEK — selalu di atas */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <input value={trackId} onChange={e => setTrackId(e.target.value)}
                  placeholder="Contoh: TKT-ABC123"
                  onKeyDown={e => e.key === "Enter" && handleTrack()}
                  style={{ ...inputStyle, flex: 1, fontSize: 15 }} />
                <button onClick={handleTrack} disabled={loading}
                  style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" }}>
                  {loading ? "..." : "Cek →"}
                </button>
              </div>

              {/* ERROR */}
              {trackError && (
                <div style={{ padding: "14px 18px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 14, marginBottom: 16 }}>
                  ❌ {trackError}
                </div>
              )}

              {/* HASIL CEK STATUS */}
              {trackedTicket && (
                <div style={{ border: "1px solid rgba(56,189,248,0.2)", borderRadius: 16, overflow: "hidden" }}>

                  {/* HEADER TIKET */}
                  <div style={{ background: "rgba(56,189,248,0.08)", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>ID Tiket</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#38BDF8", letterSpacing: 1 }}>{trackedTicket.id}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0", marginTop: 6 }}>{trackedTicket.subject}</div>
                        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>Dikirim {formatDate(trackedTicket.created)}</div>
                      </div>
                      <StatusBadge status={trackedTicket.status} />
                    </div>
                  </div>

                  <div style={{ padding: "20px 24px" }}>

                    {/* INFO GRID */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
                      {[
                        ["Nama", trackedTicket.name],
                        ["Email", trackedTicket.email],
                        ["Peran", trackedTicket.peran],
                        ["Jenis", trackedTicket.jenisLaporan],
                        ["Kategori", trackedTicket.category],
                        ["Prioritas", trackedTicket.priority],
                      ].map(([l, v]) => (
                        <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                          <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: l === "Prioritas" ? (PRIORITY_COLOR[v] ?? "#E2E8F0") : "#E2E8F0",
                            wordBreak: "break-all"
                          }}>{v || "-"}</div>
                        </div>
                      ))}
                    </div>

                    {/* DIPERBARUI */}
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>
                      Terakhir diperbarui: <span style={{ color: "#94A3B8" }}>{formatDate(trackedTicket.updated)}</span>
                    </div>

                    {/* DESKRIPSI PERTANYAAN */}
                    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px", marginBottom: 20 }}>
                      <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                        📝 Deskripsi Laporan
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: "#CBD5E1", lineHeight: 1.7 }}>
                        {trackedTicket.description}
                      </p>
                    </div>

                    {/* LAMPIRAN */}
                    {trackedTicket.attachment && (
                      <a href={trackedTicket.attachment} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, textDecoration: "none" }}>
                        <span style={{ fontSize: 20 }}>📎</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#38BDF8" }}>Lihat Lampiran</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>Klik untuk membuka file</div>
                        </div>
                      </a>
                    )}

                    {/* BALASAN ADMIN */}
                    {trackedTicket.replies?.length > 0 ? (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", marginBottom: 12 }}>
                          💬 Balasan Tim ({trackedTicket.replies.length})
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {trackedTicket.replies.map((r: any, i: number) => (
                            <div key={i} style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "14px 16px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                                <div style={{ fontSize: 13, color: "#38BDF8", fontWeight: 700 }}>👤 {r.from}</div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>{formatDate(r.time)}</div>
                              </div>
                              <div style={{ fontSize: 14, color: "#E2E8F0", lineHeight: 1.6 }}>{r.text}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", padding: "20px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                        <div style={{ fontSize: 14, color: "#475569" }}>Belum ada balasan dari tim.</div>
                        <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>Tim kami akan merespons dalam 1x24 jam kerja.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>  {/* tutup card */}
      </div>    {/* tutup maxWidth container */}
    </div>
  );
}