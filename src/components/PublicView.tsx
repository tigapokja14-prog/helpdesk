import { useState, useRef } from "react";

const PRIORITY_COLOR: Record<string, string> = {
  "Tinggi": "#E65100",
  "Sedang": "#F59E0B",
  "Rendah": "#2E7D32",
};

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  "Menunggu": { bg: "#FFF3E0", text: "#E65100", dot: "#FF6D00" },
  "Dalam Proses": { bg: "#E3F2FD", text: "#1565C0", dot: "#1976D2" },
  "Selesai": { bg: "#E8F5E9", text: "#2E7D32", dot: "#388E3C" },
  "Ditolak": { bg: "#FFEBEE", text: "#C62828", dot: "#D32F2F" },
  "Butuh Tindak Lanjut": { bg: "#F3E5F5", text: "#6A1B9A", dot: "#7B1FA2" },
};

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] || { bg: "#F5F5F5", text: "#616161", dot: "#9E9E9E" };
  return (
    <span style={{ background: c.bg, color: c.text, borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

export default function PublicView() {
  const [tab, setTab] = useState<"kirim" | "cek">("kirim");
  const [form, setForm] = useState({
    name: "", email: "", peran: "Guru/Dosen",
    jenisLaporan: "Pertanyaan/Informasi", category: "Umum",
    subject: "", description: "", priority: "Sedang",
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

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.subject || !form.description) {
      setError("Mohon lengkapi semua field yang wajib diisi."); return;
    }
    setLoading(true);
    try {
      let fileUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", "helpdesk_unsigned");
        fd.append("folder", "helpdesk-lampiran");
        const cloudName = "dg5h79mpx";
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Gagal upload file");
        fileUrl = uploadData.secure_url;
      }
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
    } finally { setLoading(false); }
  };

  const handleTrack = async () => {
    setTrackError(""); setTrackedTicket(null);
    if (!trackId.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tiket/${trackId.trim()}`);
      const data = await res.json();
      if (res.ok) setTrackedTicket(data);
      else setTrackError("Tiket tidak ditemukan. Pastikan ID tiket sudah benar.");
    } catch { setTrackError("Gagal menghubungi server. Coba lagi."); }
    finally { setLoading(false); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 6,
    border: "1.5px solid #E0E0E0", background: "#FAFAFA",
    color: "#1A1A2E", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxSizing: "border-box", outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, color: "#455A64",
    marginBottom: 6, fontWeight: 600,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F7FA", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1A1A2E" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder, textarea::placeholder, select { color: #90A4AE; }
        input:focus, textarea:focus, select:focus { border-color: #1565C0 !important; background: #fff !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #CFD8DC; border-radius: 3px; }
        @media (max-width: 640px) {
          .top-bar-right { display: none; }
          .nav-links { gap: 4px !important; }
          .nav-links a, .nav-links button { padding: 6px 10px !important; font-size: 11px !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .stats-row { gap: 16px !important; }
          .info-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 16px !important; }
          .footer-links { flex-wrap: wrap !important; gap: 12px !important; }
          .hero-badges { justify-content: center !important; }
        }
      `}</style>

      {/* TOP BAR */}
      <div style={{ background: "#1565C0", color: "#fff", padding: "6px 20px", fontSize: 12 }}>
        <div className="top-bar-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <span>Balai Penjaminan Mutu Pendidikan (BPMP) DKI Jakarta — Unit Layanan Terpadu</span>
          <span className="top-bar-right">📞 Layanan: Senin–Jumat, 08.00–16.00 WIB</span>
        </div>
      </div>

      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E0E0E0", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo_b.png" alt="Kemendikdasmen ULT" style={{ height: 44, objectFit: "contain" }} />
        </a>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <a href="/panduan"
            style={{ padding: "8px 16px", borderRadius: 6, border: "1.5px solid #E0E0E0", background: "transparent", color: "#455A64", textDecoration: "none", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
            📖 Panduan
          </a>
          <button onClick={() => { setTab("kirim"); setSubmitted(null); setError(""); }}
            style={{
              padding: "8px 18px", borderRadius: 6, border: "1.5px solid #1565C0", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.2s",
              background: tab === "kirim" ? "#1565C0" : "transparent", color: tab === "kirim" ? "#fff" : "#1565C0"
            }}>
            Kirim Laporan
          </button>
          <a href="/cek-status"
            style={{
              padding: "8px 18px", borderRadius: 6, border: "1.5px solid #E65100", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center",
              background: "#E65100", color: "#fff"
            }}>
            Cek Status
          </a>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, #1565C0 0%, #1976D2 60%, #0288D1 100%)", color: "#fff", padding: "clamp(32px,5vw,32px) 20px clamp(32px,5vw,32px)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 600, marginBottom: 20, letterSpacing: 0.5 }}>
            🏛️ UNIT LAYANAN TERPADU — BPMP JAKARTA
          </div>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Layanan Pengaduan &
            <span style={{ color: "#FFB300" }}> Bantuan</span>
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 1.2, marginBottom: 16 }}>Sampaikan pertanyaan, permintaan, keluhan, atau aspirasi Anda kepada kami.
            <br />Tim kami siap membantu.</p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
            {[
              { icon: "⏱️", label: "Respons 1×24 Jam" },
              { icon: "🔒", label: "Data Aman & Terlindungi" },
              { icon: "📧", label: "Notifikasi via Email" },
            ].map(b => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E0E0E0", padding: "10px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "Jenis Layanan", value: "5" },
            { label: "Kategori Laporan", value: "4" },
            { label: "Jam Layanan", value: "8 Jam/Hari" },
            { label: "Waktu Respons", value: "≤ 24 Jam" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1565C0" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#90A4AE", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* TAB BUTTONS */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "#fff", borderRadius: 8, padding: 4, border: "1.5px solid #E0E0E0", width: "fit-content" }}>
          {[
            { id: "kirim", label: "✉️ Kirim Laporan Baru" },
            { id: "cek", label: "🔍 Cek Status Laporan" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as any); setSubmitted(null); setTrackedTicket(null); setTrackError(""); setError(""); }}
              style={{
                padding: "10px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, transition: "all 0.2s",
                background: tab === t.id ? "#1565C0" : "transparent",
                color: tab === t.id ? "#fff" : "#90A4AE"
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* CARD */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E0E0E0", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* CARD HEADER */}
          <div style={{ background: tab === "kirim" ? "#1565C0" : "#E65100", padding: "20px 28px" }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: 0 }}>
              {tab === "kirim" ? "✉️ Form Pengiriman Laporan" : "🔍 Cek Status Laporan"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: "4px 0 0" }}>
              {tab === "kirim"
                ? "Lengkapi formulir berikut. Field bertanda (*) wajib diisi."
                : "Masukkan ID Laporan yang Anda terima melalui email konfirmasi."}
            </p>
          </div>

          <div style={{ padding: "28px" }}>

            {/* ── KIRIM TIKET ── */}
            {tab === "kirim" && !submitted && (
              <div className="fade-up">
                {error && (
                  <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 8, background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", fontSize: 13 }}>
                    ⚠️ {error}
                  </div>
                )}
                <div style={{ display: "grid", gap: 16 }}>

                  {/* Nama & Email */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Nama Lengkap *</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Masukkan nama lengkap" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Alamat Email *</label>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="contoh@email.com" style={inputStyle} />
                    </div>
                  </div>

                  {/* Peran */}
                  <div>
                    <label style={labelStyle}>Peran *</label>
                    <select value={form.peran} onChange={e => setForm(f => ({ ...f, peran: e.target.value }))}
                      style={{ ...inputStyle, background: "#FAFAFA" }}>
                      {["Guru/Dosen", "Orang Tua Murid/Wali", "Operator Sekolah", "Mahasiswa", "Murid", "Yayasan", "Pribadi", "Lainnya"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>

                  {/* Jenis & Kategori */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Jenis Laporan *</label>
                      <select value={form.jenisLaporan} onChange={e => setForm(f => ({ ...f, jenisLaporan: e.target.value }))}
                        style={{ ...inputStyle, background: "#FAFAFA" }}>
                        {["Pertanyaan/Informasi", "Permintaan", "Keluhan/Kendala", "Aspirasi/Saran", "Pengaduan"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Kategori *</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                        style={{ ...inputStyle, background: "#FAFAFA" }}>
                        {["Lembaga/Fasilitas", "Pendidikan", "Umum", "Lainnya"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Subjek & Prioritas */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Subjek/Judul Laporan *</label>
                      <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Tuliskan judul singkat laporan Anda" style={inputStyle} />
                    </div>
                    <div style={{ minWidth: 150 }}>
                      <label style={labelStyle}>Prioritas *</label>
                      <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                        style={{ ...inputStyle, background: "#FAFAFA" }}>
                        {[{ v: "Rendah", l: "🟢 Rendah" }, { v: "Sedang", l: "🟡 Sedang" }, { v: "Tinggi", l: "🔴 Tinggi" }].map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label style={labelStyle}>Deskripsi Masalah *</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Jelaskan laporan atau pertanyaan Anda secara lengkap dan jelas..." rows={5}
                      style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
                  </div>

                  {/* Upload */}
                  <div>
                    <label style={labelStyle}>Lampiran (opsional)</label>
                    <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      style={{ border: `2px dashed ${dragging ? "#1565C0" : "#CFD8DC"}`, borderRadius: 8, padding: "24px 20px", textAlign: "center", cursor: "pointer", background: dragging ? "#E3F2FD" : "#FAFAFA", transition: "all 0.2s" }}>
                      <input ref={fileRef} type="file" style={{ display: "none" }}
                        accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx"
                        onChange={e => setFile(e.target.files?.[0] || null)} />
                      {file ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ fontSize: 24 }}>📎</span>
                          <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#1565C0" }}>{file.name}</div>
                            <div style={{ fontSize: 12, color: "#90A4AE" }}>{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button onClick={e => { e.stopPropagation(); setFile(null); }}
                            style={{ background: "#FFEBEE", border: "none", color: "#C62828", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                            Hapus
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>☁️</div>
                          <div style={{ fontSize: 14, color: "#455A64" }}>Drag & drop atau <span style={{ color: "#1565C0", fontWeight: 600 }}>klik untuk pilih file</span></div>
                          <div style={{ fontSize: 12, color: "#90A4AE", marginTop: 4 }}>PNG, JPG, PDF, DOC — maks. 10MB</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button onClick={handleSubmit} disabled={loading}
                    style={{ padding: "13px", borderRadius: 8, border: "none", background: loading ? "#B0BEC5" : "#1565C0", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? "Mengirim..." : "✉️ Kirim Laporan →"}
                  </button>
                </div>
              </div>
            )}

            {/* ── SUKSES ── */}
            {tab === "kirim" && submitted && (
              <div className="fade-up" style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 72, height: 72, background: "#E8F5E9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>✅</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#2E7D32" }}>Laporan Berhasil Dikirim!</h2>
                <p style={{ color: "#607D8B", marginBottom: 24 }}>Tim kami akan segera menangani laporan Anda.</p>
                <div style={{ background: "#E3F2FD", border: "1.5px solid #90CAF9", borderRadius: 10, padding: "20px 28px", display: "inline-block", marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: "#1565C0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>ID Laporan Anda</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#1565C0", letterSpacing: 3 }}>{submitted}</div>
                </div>
                <p style={{ color: "#90A4AE", fontSize: 13, marginBottom: 24 }}>Simpan ID ini untuk mengecek status laporan Anda. Email konfirmasi telah dikirim.</p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => { setSubmitted(null); setForm({ name: "", email: "", peran: "Guru/Dosen", jenisLaporan: "Pertanyaan/Informasi", category: "Umum", subject: "", description: "", priority: "Sedang" }); setFile(null); }}
                    style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #E0E0E0", background: "transparent", color: "#455A64", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14 }}>
                    + Kirim Laporan Baru
                  </button>
                  <a href={`/cek-status?id=${submitted}`}
                    style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#E65100", color: "#fff", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                    🔍 Cek Status →
                  </a>
                </div>
              </div>
            )}

            {/* ── CEK STATUS ── */}
            {tab === "cek" && (
              <div className="fade-up">
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                  <input value={trackId} onChange={e => setTrackId(e.target.value)}
                    placeholder="Contoh: TKT-ABC123"
                    onKeyDown={e => e.key === "Enter" && handleTrack()}
                    style={{ ...inputStyle, flex: 1, fontSize: 15, fontWeight: 600, letterSpacing: 1 }} />
                  <button onClick={handleTrack} disabled={loading}
                    style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: loading ? "#B0BEC5" : "#E65100", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap", fontSize: 14 }}>
                    {loading ? "..." : "Cek →"}
                  </button>
                </div>

                {trackError && (
                  <div style={{ padding: "12px 16px", borderRadius: 8, background: "#FFEBEE", border: "1px solid #FFCDD2", color: "#C62828", fontSize: 13, marginBottom: 16 }}>
                    ❌ {trackError}
                  </div>
                )}

                {trackedTicket && (
                  <div style={{ border: "1.5px solid #E0E0E0", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ background: "#F5F7FA", padding: "18px 20px", borderBottom: "1px solid #E0E0E0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>ID Laporan</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#1565C0", letterSpacing: 2 }}>{trackedTicket.id}</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginTop: 6 }}>{trackedTicket.subject}</div>
                          <div style={{ fontSize: 12, color: "#90A4AE", marginTop: 4 }}>Dikirim {formatDate(trackedTicket.created)}</div>
                        </div>
                        <StatusBadge status={trackedTicket.status} />
                      </div>
                    </div>
                    <div style={{ padding: "18px 20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 16 }}>
                        {[["Kategori", trackedTicket.category], ["Prioritas", trackedTicket.priority], ["Jenis", trackedTicket.jenisLaporan], ["Diperbarui", formatDate(trackedTicket.updated)]].map(([l, v]) => (
                          <div key={l} style={{ background: "#F5F7FA", borderRadius: 8, padding: "10px 12px", border: "1px solid #E0E0E0" }}>
                            <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: l === "Prioritas" ? PRIORITY_COLOR[v] : "#1A1A2E" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "#F5F7FA", borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: "1px solid #E0E0E0" }}>
                        <div style={{ fontSize: 11, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Deskripsi</div>
                        <div style={{ fontSize: 14, color: "#455A64", lineHeight: 1.7 }}>{trackedTicket.description}</div>
                      </div>
                      {trackedTicket.replies?.length > 0 ? (
                        <div>
                          <div style={{ fontSize: 12, color: "#90A4AE", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Balasan Tim</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {trackedTicket.replies.map((r: any, i: number) => (
                              <div key={i} style={{ background: "#E3F2FD", border: "1px solid #90CAF9", borderRadius: 8, padding: "10px 14px" }}>
                                <div style={{ fontSize: 12, color: "#1565C0", fontWeight: 700, marginBottom: 4 }}>{r.from} · {formatDate(r.time)}</div>
                                <div style={{ fontSize: 14, color: "#1A1A2E" }}>{r.text}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px", background: "#F5F7FA", borderRadius: 8, border: "1px dashed #CFD8DC" }}>
                          <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                          <div style={{ fontSize: 14, color: "#607D8B" }}>Belum ada balasan dari tim.</div>
                          <div style={{ fontSize: 12, color: "#90A4AE", marginTop: 4 }}>Tim kami akan merespons dalam 1×24 jam kerja.</div>
                        </div>
                      )}
                      <div style={{ marginTop: 16, textAlign: "center" }}>
                        <a href={`/cek-status?id=${trackedTicket.id}`}
                          style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, border: "none", background: "#E65100", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                          Lihat Detail Lengkap & Tanggapi →
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* INFO BOXES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28 }}>
          {[
            { icon: "⏱️", title: "Waktu Respons Cepat", desc: "Laporan Anda akan direspons maksimal 1×24 jam kerja oleh tim kami.", color: "#1565C0" },
            { icon: "🔒", title: "Data Terlindungi", desc: "Informasi yang Anda sampaikan dijaga kerahasiaannya dan tidak dibagikan kepada pihak ketiga.", color: "#2E7D32" },
            { icon: "📧", title: "Notifikasi Real-time", desc: "Dapatkan notifikasi email otomatis saat ada pembaruan status laporan Anda.", color: "#E65100" },
            { icon: "📖", title: "Butuh Bantuan?", desc: "Baca panduan lengkap penggunaan layanan ini sebelum mengirim laporan.", color: "#6A1B9A", link: "/panduan" },
          ].map(b => (
            <div key={b.title} style={{ background: "#fff", borderRadius: 10, padding: "20px", border: "1.5px solid #E0E0E0", borderTop: `3px solid ${b.color}` }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{b.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 13, color: "#607D8B", lineHeight: 1.6 }}>{b.desc}</div>
              {b.link && <a href={b.link} style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: b.color, fontWeight: 700, textDecoration: "none" }}>Baca Panduan →</a>}
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#1A237E", color: "#fff", padding: "32px 20px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 24 }}>
            <div>
              <img src="/logo_b2.png" alt="Kemendikdasmen" style={{ height: 40, objectFit: "contain", marginBottom: 12, filter: "brightness(0) invert(1)" }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", maxWidth: 320, lineHeight: 1.6 }}>
                Unit Layanan Terpadu Kementerian Pendidikan Dasar dan Menengah. Melayani dengan sepenuh hati.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Layanan</div>
              {[["✉️ Kirim Laporan", "/"], ["🔍 Cek Status", "/cek-status"], ["📖 Panduan", "/panduan"]].map(([l, h]) => (
                <a key={l} href={h} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none", fontWeight: 500 }}>{l}</a>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Jam Operasional</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
                Senin – Jumat<br />08.00 – 17.00 WIB<br />
                <span style={{ color: "rgba(255,255,255,0.4)" }}>Sabtu, Minggu & Libur Nasional: Tutup</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              © {new Date().getFullYear()} BPMP Jakarta — Unit Layanan Terpadu. Hak cipta dilindungi.
            </div>
            <a href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>Portal Admin</a>
          </div>
        </div>
      </footer>
    </div >
  );
}
