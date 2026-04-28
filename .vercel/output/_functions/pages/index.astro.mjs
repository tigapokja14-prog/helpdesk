import { e as createComponent, k as renderHead, l as renderComponent, r as renderTemplate } from '../chunks/astro/server_DJLMGM8A.mjs';
import 'piccolore';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useRef } from 'react';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const STATUS_COLOR = {
  "Menunggu": { bg: "#FFF3CD", text: "#856404", dot: "#FFC107" },
  "Dalam Proses": { bg: "#CCE5FF", text: "#004085", dot: "#0D6EFD" },
  "Selesai": { bg: "#D4EDDA", text: "#155724", dot: "#28A745" },
  "Ditolak": { bg: "#F8D7DA", text: "#721C24", dot: "#DC3545" }
};
const PRIORITY_COLOR = {
  "Tinggi": "#EF4444",
  "Sedang": "#F59E0B",
  "Rendah": "#10B981"
};
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || { bg: "#eee", text: "#333", dot: "#999" };
  return /* @__PURE__ */ jsxs("span", { style: { background: c.bg, color: c.text, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }, children: [
    /* @__PURE__ */ jsx("span", { style: { width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" } }),
    status
  ] });
}
function PublicView() {
  const [tab, setTab] = useState("kirim");
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "Teknis", priority: "Sedang", description: "" });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [trackId, setTrackId] = useState("");
  const [trackedTicket, setTrackedTicket] = useState(null);
  const [trackError, setTrackError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.subject || !form.description) {
      setError("Mohon lengkapi semua field yang wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      let fileUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal upload file");
        fileUrl = uploadData.fileUrl;
      }
      const res = await fetch("/api/tiket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, attachment: fileUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim tiket");
      setSubmitted(data.id);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };
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
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };
  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box",
    outline: "none"
  };
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%)", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0" }, children: [
    /* @__PURE__ */ jsxs("nav", { style: { padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 36, height: 36, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "white", children: /* @__PURE__ */ jsx("path", { d: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" }) }) }),
        /* @__PURE__ */ jsxs("span", { style: { fontWeight: 700, fontSize: 20, color: "#fff" }, children: [
          "BPMP JAKARTA",
          /* @__PURE__ */ jsx("span", { style: { color: "#38BDF8" }, children: " | Unit Layanan Terpadu" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: 8 }, children: ["kirim", "cek"].map((t) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setTab(t);
            setSubmitted(null);
            setTrackedTicket(null);
            setTrackError("");
            setError("");
          },
          style: {
            padding: "8px 22px",
            borderRadius: 30,
            border: "none",
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            background: tab === t ? "linear-gradient(135deg, #3B82F6, #06B6D4)" : "rgba(255,255,255,0.08)",
            color: tab === t ? "#fff" : "#94A3B8"
          },
          children: t === "kirim" ? "Kirim Tiket" : "Cek Status"
        },
        t
      )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "60px 20px 40px" }, children: [
      /* @__PURE__ */ jsxs("h1", { style: { fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1 }, children: [
        "Ada yang bisa kami",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("span", { style: { background: "linear-gradient(90deg, #38BDF8, #818CF8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }, children: "bantu?" })
      ] }),
      /* @__PURE__ */ jsx("p", { style: { color: "#94A3B8", fontSize: 17, maxWidth: 500, margin: "0 auto" }, children: "Kirim tiket bantuan atau cek status tiket Anda dengan cepat dan mudah." })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { maxWidth: 680, margin: "0 auto 60px", padding: "0 20px" }, children: /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px", backdropFilter: "blur(20px)" }, children: [
      tab === "kirim" && !submitted && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { style: { margin: "0 0 28px", fontSize: 22, fontWeight: 700 }, children: "Kirim Tiket Baru" }),
        error && /* @__PURE__ */ jsx("div", { style: { marginBottom: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 14 }, children: error }),
        /* @__PURE__ */ jsxs("div", { style: { display: "grid", gap: 16 }, children: [
          /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: [["name", "Nama Lengkap *", "text"], ["email", "Alamat Email *", "email"]].map(([k, l, t]) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: l }),
            /* @__PURE__ */ jsx("input", { type: t, value: form[k], onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })), style: inputStyle })
          ] }, k)) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Subjek *" }),
            /* @__PURE__ */ jsx("input", { value: form.subject, onChange: (e) => setForm((f) => ({ ...f, subject: e.target.value })), style: inputStyle })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }, children: [["category", "Kategori", ["Teknis", "Akun", "Billing", "Lainnya"]], ["priority", "Prioritas", ["Rendah", "Sedang", "Tinggi"]]].map(([k, l, opts]) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: l }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: form[k],
                onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
                style: { ...inputStyle, background: "#1E293B" },
                children: opts.map((o) => /* @__PURE__ */ jsx("option", { children: o }, o))
              }
            )
          ] }, k)) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Deskripsi Masalah *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: form.description,
                onChange: (e) => setForm((f) => ({ ...f, description: e.target.value })),
                rows: 4,
                style: { ...inputStyle, resize: "vertical" }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Lampiran (opsional)" }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                onDragOver: (e) => {
                  e.preventDefault();
                  setDragging(true);
                },
                onDragLeave: () => setDragging(false),
                onDrop: handleDrop,
                onClick: () => fileRef.current?.click(),
                style: { border: `2px dashed ${dragging ? "#38BDF8" : "rgba(255,255,255,0.15)"}`, borderRadius: 12, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(56,189,248,0.05)" : "transparent", transition: "all 0.2s" },
                children: [
                  /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", style: { display: "none" }, accept: ".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx", onChange: (e) => setFile(e.target.files?.[0] || null) }),
                  file ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }, children: [
                    /* @__PURE__ */ jsx("span", { style: { fontSize: 24 }, children: "📎" }),
                    /* @__PURE__ */ jsxs("div", { style: { textAlign: "left" }, children: [
                      /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600, color: "#38BDF8" }, children: file.name }),
                      /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#64748B" }, children: [
                        (file.size / 1024).toFixed(1),
                        " KB"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          setFile(null);
                        },
                        style: { background: "rgba(239,68,68,0.2)", border: "none", color: "#EF4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 },
                        children: "Hapus"
                      }
                    )
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 32, marginBottom: 8 }, children: "☁️" }),
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 14, color: "#94A3B8" }, children: [
                      "Drag & drop atau ",
                      /* @__PURE__ */ jsx("span", { style: { color: "#38BDF8" }, children: "klik untuk pilih" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#475569", marginTop: 4 }, children: "PNG, JPG, PDF, DOC — maks. 10MB" })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSubmit,
              disabled: loading,
              style: { padding: "14px", borderRadius: 12, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" },
              children: loading ? "Mengirim..." : "Kirim Tiket →"
            }
          )
        ] })
      ] }),
      tab === "kirim" && submitted && /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "20px 0" }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 72, height: 72, background: "linear-gradient(135deg, #10B981, #06B6D4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }, children: "✓" }),
        /* @__PURE__ */ jsx("h2", { style: { fontSize: 24, fontWeight: 700, marginBottom: 8 }, children: "Tiket Berhasil Dikirim!" }),
        /* @__PURE__ */ jsx("p", { style: { color: "#94A3B8", marginBottom: 24 }, children: "Tim kami akan segera menangani masalah Anda." }),
        /* @__PURE__ */ jsxs("div", { style: { background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 12, padding: "16px 24px", display: "inline-block" }, children: [
          /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#94A3B8", marginBottom: 4 }, children: "ID Tiket Anda" }),
          /* @__PURE__ */ jsx("div", { style: { fontSize: 24, fontWeight: 800, color: "#38BDF8", letterSpacing: 2 }, children: submitted })
        ] }),
        /* @__PURE__ */ jsx("p", { style: { color: "#64748B", fontSize: 13, marginTop: 16 }, children: "Simpan ID ini untuk mengecek status tiket Anda." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setSubmitted(null);
                setForm({ name: "", email: "", subject: "", category: "Teknis", priority: "Sedang", description: "" });
                setFile(null);
              },
              style: { padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#E2E8F0", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
              children: "Kirim Tiket Baru"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setTab("cek");
                setTrackId(submitted);
                setSubmitted(null);
              },
              style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
              children: "Cek Status"
            }
          )
        ] })
      ] }),
      tab === "cek" && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { style: { margin: "0 0 8px", fontSize: 22, fontWeight: 700 }, children: "Cek Status Tiket" }),
        /* @__PURE__ */ jsx("p", { style: { color: "#94A3B8", fontSize: 14, marginBottom: 28 }, children: "Masukkan ID tiket yang Anda terima saat mengirim laporan." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10, marginBottom: 24 }, children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              value: trackId,
              onChange: (e) => setTrackId(e.target.value),
              placeholder: "Contoh: TKT-ABC123",
              onKeyDown: (e) => e.key === "Enter" && handleTrack(),
              style: { ...inputStyle, flex: 1, fontSize: 15 }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleTrack,
              disabled: loading,
              style: { padding: "12px 24px", borderRadius: 10, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", whiteSpace: "nowrap" },
              children: loading ? "..." : "Cek →"
            }
          )
        ] }),
        trackError && /* @__PURE__ */ jsx("div", { style: { padding: "14px 18px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 14 }, children: trackError }),
        trackedTicket && /* @__PURE__ */ jsxs("div", { style: { border: "1px solid rgba(56,189,248,0.2)", borderRadius: 16, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsx("div", { style: { background: "rgba(56,189,248,0.08)", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }, children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#64748B", marginBottom: 4 }, children: trackedTicket.id }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 18, fontWeight: 700 }, children: trackedTicket.subject }),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: 13, color: "#94A3B8", marginTop: 4 }, children: [
                "Dikirim ",
                formatDate(trackedTicket.created)
              ] })
            ] }),
            /* @__PURE__ */ jsx(StatusBadge, { status: trackedTicket.status })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { style: { padding: "20px 24px" }, children: [
            /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }, children: [["Kategori", trackedTicket.category], ["Prioritas", trackedTicket.priority], ["Diperbarui", formatDate(trackedTicket.updated)]].map(([l, v]) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }, children: l }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: l === "Prioritas" ? PRIORITY_COLOR[v] : "#E2E8F0" }, children: v })
            ] }, l)) }),
            trackedTicket.replies?.length > 0 ? /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 10 }, children: "Balasan Admin" }),
              /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: trackedTicket.replies.map((r, i) => /* @__PURE__ */ jsxs("div", { style: { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "12px 16px" }, children: [
                /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: "#38BDF8", fontWeight: 600, marginBottom: 4 }, children: [
                  r.from,
                  " · ",
                  formatDate(r.time)
                ] }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: 14 }, children: r.text })
              ] }, i)) })
            ] }) : /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "20px", color: "#475569", fontSize: 14 }, children: "Belum ada balasan dari admin." })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="id" data-astro-cid-j7pv25f6> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HelpDeskID — Kirim & Cek Tiket</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-j7pv25f6> ${renderComponent($$result, "PublicView", PublicView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "G:/web/helpdesk/src/components/PublicView", "client:component-export": "default", "data-astro-cid-j7pv25f6": true })} </body></html>`;
}, "G:/web/helpdesk/src/pages/index.astro", void 0);

const $$file = "G:/web/helpdesk/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
