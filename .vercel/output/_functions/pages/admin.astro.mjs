import { e as createComponent, k as renderHead, l as renderComponent, r as renderTemplate } from '../chunks/astro/server_DJLMGM8A.mjs';
import 'piccolore';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
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
const formatDate = (iso) => new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
function StatusBadge({ status }) {
  const c = STATUS_COLOR[status] || { bg: "#eee", text: "#333", dot: "#999" };
  return /* @__PURE__ */ jsxs("span", { style: { background: c.bg, color: c.text, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }, children: [
    /* @__PURE__ */ jsx("span", { style: { width: 7, height: 7, borderRadius: "50%", background: c.dot, display: "inline-block" } }),
    status
  ] });
}
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setErr("");
    if (!username.trim() || !password.trim()) {
      setErr("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.token, data.nama, data.role);
      } else {
        setErr(data.error || "Login gagal");
      }
    } catch {
      setErr("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box",
    outline: "none"
  };
  return /* @__PURE__ */ jsx("div", { style: { minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif" }, children: /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "48px 40px", width: 380, backdropFilter: "blur(20px)" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", marginBottom: 32 }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: 52, height: 52, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }, children: /* @__PURE__ */ jsx("svg", { width: "26", height: "26", viewBox: "0 0 24 24", fill: "white", children: /* @__PURE__ */ jsx("path", { d: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" }) }) }),
      /* @__PURE__ */ jsx("h2", { style: { color: "#fff", margin: "0 0 6px", fontSize: 22, fontWeight: 700 }, children: "Admin Panel" }),
      /* @__PURE__ */ jsx("p", { style: { color: "#64748B", fontSize: 14, margin: 0 }, children: "Masuk dengan akun admin Anda" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 14 }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { style: { fontSize: 13, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }, children: "Username" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "Masukkan username",
            style: inputStyle,
            onKeyDown: (e) => e.key === "Enter" && handleLogin()
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { style: { fontSize: 13, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }, children: "Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            placeholder: "Masukkan password",
            style: inputStyle,
            onKeyDown: (e) => e.key === "Enter" && handleLogin()
          }
        )
      ] }),
      err && /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#F87171", textAlign: "center", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }, children: err }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleLogin,
          disabled: loading,
          style: { padding: "13px", borderRadius: 10, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 4 },
          children: loading ? "Memverifikasi..." : "Masuk →"
        }
      )
    ] })
  ] }) });
}
function ManajemenAdmin({ token, role }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", nama: "", role: "admin" });
  const [formErr, setFormErr] = useState("");
  const [toast, setToast] = useState(null);
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  };
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admins", { headers });
      const data = await res.json();
      if (res.ok) setAdmins(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAdmins();
  }, []);
  const handleTambah = async () => {
    setFormErr("");
    if (!form.username || !form.password || !form.nama) {
      setFormErr("Semua field wajib diisi.");
      return;
    }
    if (form.password.length < 6) {
      setFormErr("Password minimal 6 karakter.");
      return;
    }
    try {
      const res = await fetch("/api/auth/admins", {
        method: "POST",
        headers,
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Admin berhasil ditambahkan");
        setShowForm(false);
        setForm({ username: "", password: "", nama: "", role: "admin" });
        fetchAdmins();
      } else {
        setFormErr(data.error || "Gagal menambahkan admin");
      }
    } catch {
      setFormErr("Tidak dapat terhubung ke server.");
    }
  };
  const handleHapus = async (username) => {
    if (!confirm(`Hapus admin "${username}"?`)) return;
    try {
      const res = await fetch("/api/auth/admins", {
        method: "DELETE",
        headers,
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Admin "${username}" berhasil dihapus`);
        fetchAdmins();
      } else {
        showToast(data.error || "Gagal menghapus", "error");
      }
    } catch {
      showToast("Tidak dapat terhubung ke server.", "error");
    }
  };
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0",
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box",
    outline: "none"
  };
  const ROLE_COLOR = {
    superadmin: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA" },
    admin: { bg: "rgba(56,189,248,0.12)", text: "#38BDF8" }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    toast && /* @__PURE__ */ jsx("div", { style: { position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }, children: toast.msg }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: 20, fontWeight: 700 }, children: "Manajemen Admin" }),
        /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: 13, color: "#64748B" }, children: "Kelola akun admin yang dapat mengakses panel ini" })
      ] }),
      role === "superadmin" && /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setShowForm(!showForm);
            setFormErr("");
          },
          style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
          children: showForm ? "✕ Batal" : "+ Tambah Admin"
        }
      )
    ] }),
    showForm && role === "superadmin" && /* @__PURE__ */ jsxs("div", { style: { background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 16, padding: "24px", marginBottom: 24 }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#38BDF8" }, children: "+ Tambah Admin Baru" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Nama Lengkap" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form.nama,
              onChange: (e) => setForm((f) => ({ ...f, nama: e.target.value })),
              placeholder: "contoh: Budi Santoso",
              style: inputStyle
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Username" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form.username,
              onChange: (e) => setForm((f) => ({ ...f, username: e.target.value })),
              placeholder: "contoh: budi123",
              style: inputStyle
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              value: form.password,
              onChange: (e) => setForm((f) => ({ ...f, password: e.target.value })),
              placeholder: "minimal 6 karakter",
              style: inputStyle
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { style: { display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }, children: "Role" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.role,
              onChange: (e) => setForm((f) => ({ ...f, role: e.target.value })),
              style: { ...inputStyle, background: "#1E293B" },
              children: [
                /* @__PURE__ */ jsx("option", { value: "admin", children: "Admin" }),
                /* @__PURE__ */ jsx("option", { value: "superadmin", children: "Superadmin" })
              ]
            }
          )
        ] })
      ] }),
      formErr && /* @__PURE__ */ jsx("div", { style: { marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 13 }, children: formErr }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleTambah,
          style: { marginTop: 16, padding: "11px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
          children: "Simpan Admin →"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { style: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }, children: loading ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "60px", color: "#475569" }, children: "Memuat data admin..." }) : /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { style: { background: "rgba(255,255,255,0.04)" }, children: ["Nama", "Username", "Role", "Aksi"].map((h) => /* @__PURE__ */ jsx("th", { style: { padding: "14px 20px", textAlign: "left", fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxs("tbody", { children: [
        admins.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, style: { textAlign: "center", padding: "40px", color: "#475569" }, children: "Belum ada data admin." }) }),
        admins.map((a, i) => {
          const rc = ROLE_COLOR[a.role] || ROLE_COLOR["admin"];
          return /* @__PURE__ */ jsxs("tr", { style: { borderTop: "1px solid rgba(255,255,255,0.05)" }, children: [
            /* @__PURE__ */ jsx("td", { style: { padding: "16px 20px" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
              /* @__PURE__ */ jsx("div", { style: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }, children: a.nama?.charAt(0).toUpperCase() }),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 14, fontWeight: 600 }, children: a.nama })
            ] }) }),
            /* @__PURE__ */ jsxs("td", { style: { padding: "16px 20px", fontSize: 14, color: "#94A3B8" }, children: [
              "@",
              a.username
            ] }),
            /* @__PURE__ */ jsx("td", { style: { padding: "16px 20px" }, children: /* @__PURE__ */ jsx("span", { style: { background: rc.bg, color: rc.text, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }, children: a.role }) }),
            /* @__PURE__ */ jsx("td", { style: { padding: "16px 20px" }, children: role === "superadmin" ? /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleHapus(a.username),
                style: { padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
                children: "Hapus"
              }
            ) : /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: "#475569" }, children: "—" }) })
          ] }, i);
        })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { style: { marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
      { role: "superadmin", color: "#A78BFA", desc: "Dapat melihat semua tiket, update status, balas tiket, tambah & hapus admin." },
      { role: "admin", color: "#38BDF8", desc: "Dapat melihat semua tiket, update status, dan balas tiket. Tidak dapat kelola admin." }
    ].map((r) => /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px" }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 700, color: r.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }, children: r.role }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#64748B", lineHeight: 1.5 }, children: r.desc })
    ] }, r.role)) })
  ] });
}
function Dashboard({ token, nama, role, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterPriority, setFilterPriority] = useState("Semua");
  const [reply, setReply] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [toast, setToast] = useState(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [menu, setMenu] = useState("tiket");
  console.log("Token yang dipakai:", token);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3e3);
  };
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/tiket");
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch {
    } finally {
      setLoadingTickets(false);
    }
  };
  const fetchTicketDetail = async (id) => {
    const res = await fetch(`/api/tiket/${id}`);
    const data = await res.json();
    if (res.ok) {
      setSelected(data);
      setNewStatus(data.status);
      setReply("");
    }
  };
  useEffect(() => {
    fetchTickets();
  }, []);
  const filtered = tickets.filter((t) => {
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
      console.log("Update status dengan token:", token);
      const res = await fetch(`/api/tiket/${selected.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      console.log("Response update status:", res.status, data);
      if (res.ok) {
        await fetchTickets();
        await fetchTicketDetail(selected.id);
        showToast(`Status diperbarui ke "${newStatus}"`);
      } else {
        showToast(`Gagal: ${data.error || data.detail}`, "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoadingAction(false);
    }
  };
  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setLoadingAction(true);
    try {
      console.log("Mengirim balasan dengan token:", token);
      const res = await fetch("/api/balasan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ticketId: selected.id, text: reply })
      });
      const data = await res.json();
      console.log("Response balasan:", res.status, data);
      if (res.ok) {
        setReply("");
        await fetchTicketDetail(selected.id);
        showToast("Balasan berhasil dikirim");
      } else {
        showToast(`Gagal: ${data.error || data.detail}`, "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    } finally {
      setLoadingAction(false);
    }
  };
  const handleExport = async () => {
    showToast("Menyiapkan data export...");
    try {
      const ticketsWithReplies = await Promise.all(
        tickets.map(async (t) => {
          const res = await fetch(`/api/tiket/${t.id}`);
          const data = await res.json();
          return { ...t, replies: data.replies || [] };
        })
      );
      const tiketHeader = [
        "ID Tiket",
        "Nama",
        "Email",
        "Subjek",
        "Kategori",
        "Prioritas",
        "Status",
        "Deskripsi",
        "Lampiran",
        "Dibuat",
        "Diperbarui"
      ];
      const tiketRows = ticketsWithReplies.map((t) => [
        t.id,
        t.name,
        t.email,
        t.subject,
        t.category,
        t.priority,
        t.status,
        t.description,
        t.attachment || "",
        t.created,
        t.updated
      ]);
      const balasanHeader = ["ID Tiket", "Subjek", "Dari", "Pesan", "Waktu"];
      const balasanRows = [];
      ticketsWithReplies.forEach((t) => {
        if (t.replies.length === 0) {
          balasanRows.push([t.id, t.subject, "-", "(Belum ada balasan)", ""]);
        } else {
          t.replies.forEach((r) => {
            balasanRows.push([t.id, t.subject, r.from, r.text, r.time]);
          });
        }
      });
      const toCSV = (header, rows) => [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const csvContent = "DATA TIKET\n" + toCSV(tiketHeader, tiketRows) + "\n\n\nDATA BALASAN\n" + toCSV(balasanHeader, balasanRows);
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const tgl = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      a.href = url;
      a.download = `helpdesk-export-${tgl}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Export berhasil — ${tickets.length} tiket, ${balasanRows.length} balasan`);
    } catch (err) {
      showToast("Gagal export: " + err.message, "error");
    }
  };
  const stats = [
    { label: "Total Tiket", value: tickets.length, color: "#3B82F6" },
    { label: "Menunggu", value: tickets.filter((t) => t.status === "Menunggu").length, color: "#F59E0B" },
    { label: "Dalam Proses", value: tickets.filter((t) => t.status === "Dalam Proses").length, color: "#0EA5E9" },
    { label: "Selesai", value: tickets.filter((t) => t.status === "Selesai").length, color: "#10B981" }
  ];
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", background: "#0F172A", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0", display: "flex" }, children: [
    toast && /* @__PURE__ */ jsx("div", { style: { position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }, children: toast.msg }),
    /* @__PURE__ */ jsxs("aside", { style: { width: 240, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "24px 16px", display: "flex", flexDirection: "column", minHeight: "100vh" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, marginBottom: 36, padding: "0 8px" }, children: [
        /* @__PURE__ */ jsx("div", { style: { width: 34, height: 34, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "white", children: /* @__PURE__ */ jsx("path", { d: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" }) }) }),
        /* @__PURE__ */ jsxs("span", { style: { fontWeight: 700, fontSize: 17 }, children: [
          "ULT",
          /* @__PURE__ */ jsx("span", { style: { color: "#38BDF8" }, children: " | BPMP JKT" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10, padding: "10px 12px", marginBottom: 20 }, children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 700, color: "#E2E8F0" }, children: nama }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#38BDF8", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }, children: role })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }, children: "Menu" }),
      [
        { id: "tiket", label: "Semua Tiket", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        { id: "admin", label: "Kelola Admin", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
      ].map((m) => (
        // Sembunyikan menu Kelola Admin untuk role bukan superadmin
        m.id === "admin" && role !== "superadmin" ? null : /* @__PURE__ */ jsxs(
          "div",
          {
            onClick: () => setMenu(m.id),
            style: {
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 4,
              cursor: "pointer",
              transition: "all 0.15s",
              background: menu === m.id ? "rgba(56,189,248,0.1)" : "transparent",
              color: menu === m.id ? "#38BDF8" : "#64748B",
              fontWeight: menu === m.id ? 600 : 400,
              fontSize: 14
            },
            children: [
              /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: m.icon }) }),
              m.label
            ]
          },
          m.id
        )
      )),
      /* @__PURE__ */ jsx("div", { style: { marginTop: "auto" }, children: /* @__PURE__ */ jsxs("button", { onClick: onLogout, style: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }, children: [
        /* @__PURE__ */ jsx("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" }) }),
        "Keluar"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { style: { flex: 1, overflow: "auto" }, children: [
      /* @__PURE__ */ jsxs("div", { style: { padding: "24px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { style: { margin: 0, fontSize: 22, fontWeight: 700 }, children: "Dashboard Admin" }),
          /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: 13, color: "#64748B" }, children: "Kelola semua tiket bantuan" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 10 }, children: [
          /* @__PURE__ */ jsx("button", { onClick: fetchTickets, style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }, children: "🔄 Refresh" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleExport,
              style: { display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
              children: "⬇️ Export CSV"
            }
          ),
          "          "
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { padding: "28px 32px" }, children: [
        menu === "tiket" && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }, children: stats.map((s) => /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", position: "relative", overflow: "hidden" }, children: [
            /* @__PURE__ */ jsx("div", { style: { position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: s.color, opacity: 0.08 } }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 32, fontWeight: 800, color: s.color }, children: s.value }),
            /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#64748B", marginTop: 4 }, children: s.label })
          ] }, s.label)) }),
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 200, position: "relative" }, children: [
              /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "#64748B", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }, children: [
                /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
                /* @__PURE__ */ jsx("path", { d: "M21 21l-4.35-4.35" })
              ] }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  value: search,
                  onChange: (e) => setSearch(e.target.value),
                  placeholder: "Cari ID, nama, atau subjek...",
                  style: { width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", outline: "none" }
                }
              )
            ] }),
            [["filterStatus", filterStatus, setFilterStatus, ["Semua", "Menunggu", "Dalam Proses", "Selesai", "Ditolak"]], ["filterPriority", filterPriority, setFilterPriority, ["Semua", "Rendah", "Sedang", "Tinggi"]]].map(([key, val, setter, opts]) => /* @__PURE__ */ jsx(
              "select",
              {
                value: val,
                onChange: (e) => setter(e.target.value),
                style: { padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "#1E293B", color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" },
                children: opts.map((o) => /* @__PURE__ */ jsx("option", { children: o }, o))
              },
              key
            ))
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }, children: [
            /* @__PURE__ */ jsx("div", { style: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }, children: loadingTickets ? /* @__PURE__ */ jsx("div", { style: { textAlign: "center", padding: "60px", color: "#475569" }, children: "Memuat data tiket..." }) : /* @__PURE__ */ jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { style: { background: "rgba(255,255,255,0.04)" }, children: ["ID Tiket", "Nama / Subjek", "Kategori", "Prioritas", "Status", "Tanggal"].map((h) => /* @__PURE__ */ jsx("th", { style: { padding: "14px 16px", textAlign: "left", fontSize: 12, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }, children: h }, h)) }) }),
              /* @__PURE__ */ jsxs("tbody", { children: [
                filtered.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, style: { textAlign: "center", padding: "40px", color: "#475569" }, children: "Tidak ada tiket ditemukan." }) }),
                filtered.map((t) => /* @__PURE__ */ jsxs(
                  "tr",
                  {
                    onClick: () => fetchTicketDetail(t.id),
                    style: { borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: selected?.id === t.id ? "rgba(56,189,248,0.07)" : "transparent", transition: "background 0.15s" },
                    children: [
                      /* @__PURE__ */ jsx("td", { style: { padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#38BDF8" }, children: t.id }),
                      /* @__PURE__ */ jsxs("td", { style: { padding: "14px 16px" }, children: [
                        /* @__PURE__ */ jsx("div", { style: { fontSize: 14, fontWeight: 600 }, children: t.name }),
                        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#64748B" }, children: t.subject })
                      ] }),
                      /* @__PURE__ */ jsx("td", { style: { padding: "14px 16px", fontSize: 13, color: "#94A3B8" }, children: t.category }),
                      /* @__PURE__ */ jsx("td", { style: { padding: "14px 16px" }, children: /* @__PURE__ */ jsxs("span", { style: { fontSize: 13, fontWeight: 700, color: PRIORITY_COLOR[t.priority] }, children: [
                        "● ",
                        t.priority
                      ] }) }),
                      /* @__PURE__ */ jsx("td", { style: { padding: "14px 16px" }, children: /* @__PURE__ */ jsx(StatusBadge, { status: t.status }) }),
                      /* @__PURE__ */ jsx("td", { style: { padding: "14px 16px", fontSize: 12, color: "#64748B" }, children: formatDate(t.created) })
                    ]
                  },
                  t.id
                ))
              ] })
            ] }) }),
            selected && /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }, children: [
              /* @__PURE__ */ jsxs("div", { style: { padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#38BDF8", fontWeight: 700, marginBottom: 4 }, children: selected.id }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 16, fontWeight: 700, lineHeight: 1.3 }, children: selected.subject })
                ] }),
                /* @__PURE__ */ jsx("button", { onClick: () => setSelected(null), style: { background: "rgba(255,255,255,0.08)", border: "none", color: "#94A3B8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16 }, children: "✕" })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { padding: "16px 20px", maxHeight: "80vh", overflowY: "auto" }, children: [
                /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }, children: [["Nama", selected.name], ["Email", selected.email], ["Kategori", selected.category], ["Prioritas", selected.priority]].map(([l, v]) => /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }, children: l }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: l === "Prioritas" ? PRIORITY_COLOR[v] : "#E2E8F0", wordBreak: "break-all" }, children: v })
                ] }, l)) }),
                /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }, children: "Deskripsi" }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }, children: selected.description })
                ] }),
                selected.attachment && /* @__PURE__ */ jsxs(
                  "a",
                  {
                    href: selected.attachment,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: { display: "flex", alignItems: "center", gap: 10, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, textDecoration: "none" },
                    children: [
                      /* @__PURE__ */ jsx("span", { style: { fontSize: 20 }, children: "📎" }),
                      /* @__PURE__ */ jsxs("div", { children: [
                        /* @__PURE__ */ jsx("div", { style: { fontSize: 13, fontWeight: 600, color: "#38BDF8" }, children: "Lihat Lampiran" }),
                        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: "#64748B" }, children: "Klik untuk membuka" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: { background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "14px", marginBottom: 16 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 10 }, children: "Update Status" }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
                    /* @__PURE__ */ jsx(
                      "select",
                      {
                        value: newStatus,
                        onChange: (e) => setNewStatus(e.target.value),
                        style: { flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#1E293B", color: "#E2E8F0", fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: "none" },
                        children: ["Menunggu", "Dalam Proses", "Selesai", "Ditolak"].map((s) => /* @__PURE__ */ jsx("option", { children: s }, s))
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: handleUpdateStatus,
                        disabled: loadingAction,
                        style: { padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" },
                        children: "Simpan"
                      }
                    )
                  ] })
                ] }),
                selected.replies?.length > 0 && /* @__PURE__ */ jsxs("div", { style: { marginBottom: 16 }, children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 10 }, children: "Riwayat Balasan" }),
                  /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: selected.replies.map((r, i) => /* @__PURE__ */ jsxs("div", { style: { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "10px 12px" }, children: [
                    /* @__PURE__ */ jsxs("div", { style: { fontSize: 11, color: "#38BDF8", fontWeight: 700, marginBottom: 4 }, children: [
                      r.from,
                      " · ",
                      formatDate(r.time)
                    ] }),
                    /* @__PURE__ */ jsx("div", { style: { fontSize: 13 }, children: r.text })
                  ] }, i)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }, children: "Kirim Balasan" }),
                  /* @__PURE__ */ jsx(
                    "textarea",
                    {
                      value: reply,
                      onChange: (e) => setReply(e.target.value),
                      placeholder: "Tulis balasan ke pengguna...",
                      rows: 3,
                      style: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#E2E8F0", fontSize: 13, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", outline: "none", resize: "none", marginBottom: 8 }
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: handleReply,
                      disabled: loadingAction,
                      style: { width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" },
                      children: loadingAction ? "Mengirim..." : "Kirim Balasan"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] }),
        menu === "admin" && /* @__PURE__ */ jsx(ManajemenAdmin, { token, role })
      ] })
    ] })
  ] });
}
function AdminView() {
  const [token, setToken] = useState(null);
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");
  return token ? /* @__PURE__ */ jsx(
    Dashboard,
    {
      token,
      nama,
      role,
      onLogout: () => {
        setToken(null);
        setNama("");
        setRole("");
      }
    }
  ) : /* @__PURE__ */ jsx(LoginScreen, { onLogin: (t, n, r) => {
    setToken(t);
    setNama(n);
    setRole(r);
  } });
}

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="id" data-astro-cid-u2h3djql> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HelpDeskID — Panel Admin</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-u2h3djql> ${renderComponent($$result, "AdminView", AdminView, { "client:load": true, "client:component-hydration": "load", "client:component-path": "G:/web/helpdesk/src/components/AdminView", "client:component-export": "default", "data-astro-cid-u2h3djql": true })} </body></html>`;
}, "G:/web/helpdesk/src/pages/admin/index.astro", void 0);

const $$file = "G:/web/helpdesk/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
