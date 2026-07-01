import { useState, useEffect, useRef } from "react";

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

// ─── Donut Chart ──────────────────────────────────────────────
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const radius = 54;
  const cx = 70; const cy = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width="140" height="140" style={{ flexShrink: 0 }}>
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="16" />
        ) : (
          data.map((d, i) => {
            const pct = d.value / total;
            const dash = pct * circumference;
            const offset = cumulative * circumference;
            cumulative += pct;
            return (
              <circle key={i} cx={cx} cy={cy} r={radius} fill="none"
                stroke={d.color} strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset + circumference * 0.25}
                style={{ transition: "stroke-dasharray 0.6s ease" }} />
            );
          })
        )}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#E2E8F0" fontSize="22" fontWeight="800">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748B" fontSize="11">Total</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#94A3B8" }}>{d.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginLeft: "auto" }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: d.color }}>{d.value}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(d.value / max) * 100}%`, background: d.color, borderRadius: 4, transition: "width 0.8s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Monthly Recap ───────────────────────────────────────────
const BULAN_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function MonthlyRecap({ tickets }: { tickets: any[] }) {
  const years = Array.from(new Set(tickets.map(t => new Date(t.created).getFullYear()))).sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(years.includes(currentYear) ? currentYear : (years[0] || currentYear));

  const monthlyData = BULAN_ID.map((label, i) => {
    const mo = tickets.filter(t => {
      const d = new Date(t.created);
      return d.getFullYear() === selectedYear && d.getMonth() === i;
    });
    return {
      label,
      total: mo.length,
      menunggu: mo.filter(t => t.status === "Menunggu").length,
      proses: mo.filter(t => t.status === "Dalam Proses").length,
      selesai: mo.filter(t => t.status === "Selesai").length,
      ditolak: mo.filter(t => t.status === "Ditolak").length,
    };
  });

  const maxVal = Math.max(...monthlyData.map(d => d.total), 1);
  const totalYear = monthlyData.reduce((s, d) => s + d.total, 0);
  const totalSelesai = monthlyData.reduce((s, d) => s + d.selesai, 0);

  const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0" }}>📅 Rekap Bulanan</div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Total {totalYear} tiket di tahun {selectedYear} · {totalSelesai} selesai</div>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}
          style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "#1E293B", color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
          {!years.includes(currentYear) && <option value={currentYear}>{currentYear}</option>}
        </select>
      </div>

      {/* Bar Chart */}
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📊 Jumlah Tiket per Bulan ({selectedYear})</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, overflowX: "auto" }}>
          {monthlyData.map((d, i) => (
            <div key={i} style={{ flex: 1, minWidth: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, color: "#38BDF8", fontWeight: 700, visibility: d.total > 0 ? "visible" : "hidden" }}>{d.total}</span>
              <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: d.total > 0 ? "linear-gradient(180deg,#38BDF8,#3B82F6)" : "rgba(255,255,255,0.05)", height: `${(d.total / maxVal) * 100}px`, minHeight: 4, transition: "height 0.6s ease" }} />
              <span style={{ fontSize: 10, color: "#475569", whiteSpace: "nowrap" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📋 Detail per Bulan ({selectedYear})</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {["Bulan", "Total", "Menunggu", "Dalam Proses", "Selesai", "Ditolak", "Tingkat Selesai"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", opacity: d.total === 0 ? 0.4 : 1 }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "#E2E8F0" }}>{BULAN_ID[i]}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 800, color: "#38BDF8" }}>{d.total}</td>
                  <td style={{ padding: "10px 12px", color: "#F59E0B" }}>{d.menunggu}</td>
                  <td style={{ padding: "10px 12px", color: "#3B82F6" }}>{d.proses}</td>
                  <td style={{ padding: "10px 12px", color: "#10B981" }}>{d.selesai}</td>
                  <td style={{ padding: "10px 12px", color: "#EF4444" }}>{d.ditolak}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 40 }}>
                        <div style={{ height: "100%", width: `${d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0}%`, background: "#10B981", borderRadius: 3, transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, minWidth: 32 }}>{d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(255,255,255,0.1)", background: "rgba(56,189,248,0.04)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 800, color: "#38BDF8" }}>TOTAL</td>
                <td style={{ padding: "10px 12px", fontWeight: 800, color: "#38BDF8" }}>{totalYear}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#F59E0B" }}>{monthlyData.reduce((s, d) => s + d.menunggu, 0)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#3B82F6" }}>{monthlyData.reduce((s, d) => s + d.proses, 0)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10B981" }}>{totalSelesai}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#EF4444" }}>{monthlyData.reduce((s, d) => s + d.ditolak, 0)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10B981" }}>{totalYear > 0 ? Math.round((totalSelesai / totalYear) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PERAN PER BULAN */}
      {(() => {
        const allPeran = Array.from(new Set(tickets.filter(t => {
          const d = new Date(t.created);
          return d.getFullYear() === selectedYear;
        }).map(t => t.peran).filter(Boolean)));
        if (allPeran.length === 0) return null;
        const peranMonthly = allPeran.map((p, pi) => ({
          peran: p,
          color: PERAN_COLORS[pi % 8],
          counts: BULAN_ID.map((_, mi) => tickets.filter(t => {
            const d = new Date(t.created);
            return d.getFullYear() === selectedYear && d.getMonth() === mi && t.peran === p;
          }).length),
        }));
        const maxBar = Math.max(...BULAN_ID.map((_, mi) => allPeran.reduce((s, p) => s + tickets.filter(t => {
          const d = new Date(t.created); return d.getFullYear() === selectedYear && d.getMonth() === mi && t.peran === p;
        }).length, 0)), 1);
        const H2 = 110;
        return (
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 14 }}>👥 Peran Pengirim per Bulan ({selectedYear})</div>
            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              {peranMonthly.map(p => (
                <div key={p.peran} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{p.peran}</span>
                </div>
              ))}
            </div>
            {/* Stacked bar */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: H2 + 22, marginBottom: 14 }}>
              {BULAN_ID.map((lbl, mi) => {
                const colTotal = peranMonthly.reduce((s, p) => s + p.counts[mi], 0);
                return (
                  <div key={mi} style={{ flex: 1, minWidth: 30, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 9, color: "#64748B", fontWeight: 600 }}>{colTotal > 0 ? colTotal : ""}</span>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column-reverse", height: `${(colTotal / maxBar) * H2}px`, minHeight: colTotal > 0 ? 4 : 3, borderRadius: "4px 4px 0 0", overflow: "hidden", background: colTotal === 0 ? "rgba(255,255,255,0.04)" : "transparent" }}>
                      {peranMonthly.map(p => {
                        const pct = colTotal > 0 ? (p.counts[mi] / colTotal) * 100 : 0;
                        return pct > 0 ? <div key={p.peran} title={`${p.peran}: ${p.counts[mi]}`} style={{ width: "100%", height: `${pct}%`, background: p.color, flexShrink: 0 }} /> : null;
                      })}
                    </div>
                    <span style={{ fontSize: 9, color: "#475569", whiteSpace: "nowrap" }}>{lbl}</span>
                  </div>
                );
              })}
            </div>
            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    <th style={{ padding: "7px 10px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>Peran</th>
                    {BULAN_ID.map(m => <th key={m} style={{ padding: "7px 8px", textAlign: "center", color: "#475569", fontWeight: 700, fontSize: 10 }}>{m}</th>)}
                    <th style={{ padding: "7px 10px", textAlign: "center", color: "#38BDF8", fontWeight: 700, fontSize: 10 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {peranMonthly.map(p => (
                    <tr key={p.peran} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "7px 10px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} /><span style={{ color: "#CBD5E1", fontWeight: 600, whiteSpace: "nowrap" }}>{p.peran}</span></div></td>
                      {p.counts.map((c, mi) => <td key={mi} style={{ padding: "7px 8px", textAlign: "center", color: c > 0 ? p.color : "#334155", fontWeight: c > 0 ? 700 : 400 }}>{c}</td>)}
                      <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: p.color }}>{p.counts.reduce((s, c) => s + c, 0)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid rgba(255,255,255,0.08)", background: "rgba(56,189,248,0.03)" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 800, color: "#38BDF8", fontSize: 11 }}>TOTAL</td>
                    {BULAN_ID.map((_, mi) => <td key={mi} style={{ padding: "7px 8px", textAlign: "center", fontWeight: 800, color: "#38BDF8" }}>{peranMonthly.reduce((s, p) => s + p.counts[mi], 0)}</td>)}
                    <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: "#38BDF8" }}>{peranMonthly.reduce((s, p) => s + p.counts.reduce((a, c) => a + c, 0), 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Yearly Recap ──────────────────────────────────────────────
function YearlyRecap({ tickets }: { tickets: any[] }) {
  const years = Array.from(new Set(tickets.map(t => new Date(t.created).getFullYear()))).sort((a, b) => a - b);
  if (years.length === 0) years.push(new Date().getFullYear());

  const yearlyData = years.map(y => {
    const yt = tickets.filter(t => new Date(t.created).getFullYear() === y);
    return {
      year: y,
      total: yt.length,
      menunggu: yt.filter(t => t.status === "Menunggu").length,
      proses: yt.filter(t => t.status === "Dalam Proses").length,
      selesai: yt.filter(t => t.status === "Selesai").length,
      ditolak: yt.filter(t => t.status === "Ditolak").length,
    };
  });

  const maxVal = Math.max(...yearlyData.map(d => d.total), 1);
  const grandTotal = yearlyData.reduce((s, d) => s + d.total, 0);
  const grandSelesai = yearlyData.reduce((s, d) => s + d.selesai, 0);

  const cardStyle: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#E2E8F0" }}>📆 Rekap Tahunan</div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>Total {grandTotal} tiket dari {years[0]} s/d {years[years.length - 1]} · {grandSelesai} selesai</div>
      </div>

      {/* Stat cards per year */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {yearlyData.map(d => (
          <div key={d.year} style={{ ...cardStyle, padding: "16px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -16, right: -16, width: 64, height: 64, borderRadius: "50%", background: "#38BDF8", opacity: 0.08 }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: "#38BDF8", marginBottom: 2 }}>{d.total}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 8 }}>Tahun {d.year}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: "#F59E0B" }}>Menunggu</span><span style={{ fontWeight: 700, color: "#F59E0B" }}>{d.menunggu}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: "#3B82F6" }}>Dalam Proses</span><span style={{ fontWeight: 700, color: "#3B82F6" }}>{d.proses}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: "#10B981" }}>Selesai</span><span style={{ fontWeight: 700, color: "#10B981" }}>{d.selesai}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}><span style={{ color: "#EF4444" }}>Ditolak</span><span style={{ fontWeight: 700, color: "#EF4444" }}>{d.ditolak}</span></div>
            </div>
            <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ height: "100%", width: `${d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0}%`, background: "#10B981", borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10, color: "#10B981", marginTop: 4, fontWeight: 700 }}>{d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0}% selesai</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📊 Tren Tiket per Tahun</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 140 }}>
          {yearlyData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13, color: "#38BDF8", fontWeight: 700 }}>{d.total}</span>
              <div style={{ width: "100%", maxWidth: 80, borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg,#38BDF8,#3B82F6)", height: `${(d.total / maxVal) * 100}px`, minHeight: 4, transition: "height 0.6s ease" }} />
              <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>{d.year}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📋 Tabel Rekap Tahunan</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                {["Tahun", "Total", "Menunggu", "Dalam Proses", "Selesai", "Ditolak", "Tingkat Selesai"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((d, i) => (
                <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "#E2E8F0" }}>{d.year}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 800, color: "#38BDF8" }}>{d.total}</td>
                  <td style={{ padding: "10px 12px", color: "#F59E0B" }}>{d.menunggu}</td>
                  <td style={{ padding: "10px 12px", color: "#3B82F6" }}>{d.proses}</td>
                  <td style={{ padding: "10px 12px", color: "#10B981" }}>{d.selesai}</td>
                  <td style={{ padding: "10px 12px", color: "#EF4444" }}>{d.ditolak}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", minWidth: 60 }}>
                        <div style={{ height: "100%", width: `${d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0}%`, background: "#10B981", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700, minWidth: 36 }}>{d.total > 0 ? Math.round((d.selesai / d.total) * 100) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid rgba(255,255,255,0.1)", background: "rgba(56,189,248,0.04)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 800, color: "#38BDF8" }}>TOTAL</td>
                <td style={{ padding: "10px 12px", fontWeight: 800, color: "#38BDF8" }}>{grandTotal}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#F59E0B" }}>{yearlyData.reduce((s, d) => s + d.menunggu, 0)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#3B82F6" }}>{yearlyData.reduce((s, d) => s + d.proses, 0)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10B981" }}>{grandSelesai}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#EF4444" }}>{yearlyData.reduce((s, d) => s + d.ditolak, 0)}</td>
                <td style={{ padding: "10px 12px", fontWeight: 700, color: "#10B981" }}>{grandTotal > 0 ? Math.round((grandSelesai / grandTotal) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PERAN PER TAHUN */}
      {(() => {
        const allPeran = Array.from(new Set(tickets.map(t => t.peran).filter(Boolean)));
        if (allPeran.length === 0) return null;
        const peranYearly = allPeran.map((p, pi) => ({
          peran: p,
          color: PERAN_COLORS[pi % 8],
          counts: years.map(y => tickets.filter(t => new Date(t.created).getFullYear() === y && t.peran === p).length),
        }));
        const maxBar = Math.max(...years.map((y, yi) => allPeran.reduce((s, p) => s + peranYearly.find(r => r.peran === p)!.counts[yi], 0)), 1);
        const H2 = 120;
        return (
          <div style={cardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 14 }}>👥 Peran Pengirim per Tahun</div>
            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              {peranYearly.map(p => (
                <div key={p.peran} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{p.peran}</span>
                </div>
              ))}
            </div>
            {/* Stacked bar */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: H2 + 24, marginBottom: 14 }}>
              {years.map((y, yi) => {
                const colTotal = peranYearly.reduce((s, p) => s + p.counts[yi], 0);
                return (
                  <div key={y} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>{colTotal > 0 ? colTotal : ""}</span>
                    <div style={{ width: "100%", maxWidth: 80, display: "flex", flexDirection: "column-reverse", height: `${(colTotal / maxBar) * H2}px`, minHeight: colTotal > 0 ? 6 : 4, borderRadius: "5px 5px 0 0", overflow: "hidden", background: colTotal === 0 ? "rgba(255,255,255,0.05)" : "transparent" }}>
                      {peranYearly.map(p => {
                        const pct = colTotal > 0 ? (p.counts[yi] / colTotal) * 100 : 0;
                        return pct > 0 ? <div key={p.peran} title={`${p.peran}: ${p.counts[yi]}`} style={{ width: "100%", height: `${pct}%`, background: p.color, flexShrink: 0 }} /> : null;
                      })}
                    </div>
                    <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{y}</span>
                  </div>
                );
              })}
            </div>
            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    <th style={{ padding: "7px 10px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 10, textTransform: "uppercase", whiteSpace: "nowrap" }}>Peran</th>
                    {years.map(y => <th key={y} style={{ padding: "7px 10px", textAlign: "center", color: "#475569", fontWeight: 700, fontSize: 10 }}>{y}</th>)}
                    <th style={{ padding: "7px 10px", textAlign: "center", color: "#38BDF8", fontWeight: 700, fontSize: 10 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {peranYearly.map(p => (
                    <tr key={p.peran} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "7px 10px" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} /><span style={{ color: "#CBD5E1", fontWeight: 600, whiteSpace: "nowrap" }}>{p.peran}</span></div></td>
                      {p.counts.map((c, yi) => <td key={yi} style={{ padding: "7px 10px", textAlign: "center", color: c > 0 ? p.color : "#334155", fontWeight: c > 0 ? 700 : 400 }}>{c}</td>)}
                      <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: p.color }}>{p.counts.reduce((s, c) => s + c, 0)}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "2px solid rgba(255,255,255,0.08)", background: "rgba(56,189,248,0.03)" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 800, color: "#38BDF8", fontSize: 11 }}>TOTAL</td>
                    {years.map((y, yi) => <td key={yi} style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: "#38BDF8" }}>{peranYearly.reduce((s, p) => s + p.counts[yi], 0)}</td>)}
                    <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: "#38BDF8" }}>{peranYearly.reduce((s, p) => s + p.counts.reduce((a, c) => a + c, 0), 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── Trend Chart (7 hari terakhir) ───────────────────────────
function TrendChart({ tickets }: { tickets: any[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: d.toLocaleDateString("id-ID", { weekday: "short" }),
      date: d.toISOString().slice(0, 10),
      count: 0,
    };
  });

  tickets.forEach(t => {
    const date = t.created?.slice(0, 10);
    const day = days.find(d => d.date === date);
    if (day) day.count++;
  });

  const max = Math.max(...days.map(d => d.count), 1);
  const H = 80;
  const W = 100 / days.length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: H + 24 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11, color: "#38BDF8", fontWeight: 700 }}>{d.count > 0 ? d.count : ""}</span>
            <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: d.count > 0 ? "linear-gradient(180deg, #38BDF8, #3B82F6)" : "rgba(255,255,255,0.06)", height: `${(d.count / max) * H}px`, minHeight: 4, transition: "height 0.6s ease" }} />
            <span style={{ fontSize: 10, color: "#475569" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tren Peran Pengirim ─────────────────────────────────────
const PERAN_COLORS = ["#38BDF8", "#818CF8", "#F472B6", "#34D399", "#F59E0B", "#EF4444", "#A78BFA", "#FB923C"];

function PeranTrendChart({ tickets }: { tickets: any[] }) {
  const [range, setRange] = useState<6 | 12>(6);

  // Buat daftar bulan (range bulan terakhir)
  const months = Array.from({ length: range }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (range - 1 - i));
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
    };
  });

  // Semua peran unik (max 8)
  const allPeran = Array.from(new Set(tickets.map(t => t.peran).filter(Boolean))).slice(0, 8);

  // Hitung tiket per bulan per peran
  const data: Array<Record<string, any>> = months.map(m => {
    const row: Record<string, number> = { total: 0 };
    allPeran.forEach(p => {
      const count = tickets.filter(t => {
        const mk = t.created?.slice(0, 7);
        return mk === m.key && t.peran === p;
      }).length;
      row[p] = count;
      row.total += count;
    });
    return { ...m, ...row };
  });

  const maxTotal = Math.max(...data.map(d => d.total), 1);
  const H = 120;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {allPeran.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: PERAN_COLORS[i % 8], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#94A3B8" }}>{p}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {([6, 12] as const).map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{
                padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 600,
                background: range === r ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.05)",
                color: range === r ? "#38BDF8" : "#64748B",
                outline: range === r ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.06)"
              }}>
              {r} Bulan
            </button>
          ))}
        </div>
      </div>

      {/* Stacked bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: H + 28 }}>
        {data.map((d, mi) => (
          <div key={mi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: "#64748B", fontWeight: 600 }}>{d.total > 0 ? d.total : ""}</span>
            {/* Stacked segments */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column-reverse", height: `${(d.total / maxTotal) * H}px`, minHeight: d.total > 0 ? 6 : 3, borderRadius: "4px 4px 0 0", overflow: "hidden", background: d.total === 0 ? "rgba(255,255,255,0.05)" : "transparent" }}>
              {allPeran.map((p, i) => {
                const val = d[p] as number || 0;
                const pct = d.total > 0 ? (val / d.total) * 100 : 0;
                return pct > 0 ? (
                  <div key={p} title={`${p}: ${val}`}
                    style={{ width: "100%", height: `${pct}%`, background: PERAN_COLORS[i % 8], flexShrink: 0, transition: "height 0.6s ease" }} />
                ) : null;
              })}
            </div>
            <span style={{ fontSize: 9, color: "#475569", whiteSpace: "nowrap", textAlign: "center" }}>{d.label}</span>
          </div>
        ))}
      </div>

      {/* Mini table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.03)" }}>
              <th style={{ padding: "7px 10px", textAlign: "left", color: "#475569", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6, whiteSpace: "nowrap" }}>Peran</th>
              {months.map(m => (
                <th key={m.key} style={{ padding: "7px 8px", textAlign: "center", color: "#475569", fontWeight: 700, fontSize: 10, whiteSpace: "nowrap" }}>{m.label}</th>
              ))}
              <th style={{ padding: "7px 10px", textAlign: "center", color: "#38BDF8", fontWeight: 700, fontSize: 10 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {allPeran.map((p, i) => {
              const rowTotal = data.reduce((s, d) => s + (d[p] as number || 0), 0);
              return (
                <tr key={p} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "7px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: PERAN_COLORS[i % 8], flexShrink: 0 }} />
                    <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{p}</span>
                  </td>
                  {data.map(d => (
                    <td key={d.key} style={{ padding: "7px 8px", textAlign: "center", color: (d[p] as number) > 0 ? PERAN_COLORS[i % 8] : "#334155", fontWeight: (d[p] as number) > 0 ? 700 : 400 }}>{d[p] as number || 0}</td>
                  ))}
                  <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: PERAN_COLORS[i % 8] }}>{rowTotal}</td>
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid rgba(255,255,255,0.08)", background: "rgba(56,189,248,0.03)" }}>
              <td style={{ padding: "7px 10px", fontWeight: 800, color: "#38BDF8", fontSize: 11 }}>TOTAL</td>
              {data.map(d => (
                <td key={d.key} style={{ padding: "7px 8px", textAlign: "center", fontWeight: 800, color: "#38BDF8" }}>{d.total}</td>
              ))}
              <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 800, color: "#38BDF8" }}>{data.reduce((s, d) => s + d.total, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Dashboard Statistik ──────────────────────────────────────
function StatsDashboard({ tickets }: { tickets: any[] }) {
  const [activeTab, setActiveTab] = useState<"overview" | "bulanan" | "tahunan">("overview");
  const statusData = [
    { label: "Menunggu", value: tickets.filter(t => t.status === "Menunggu").length, color: "#F59E0B" },
    { label: "Dalam Proses", value: tickets.filter(t => t.status === "Dalam Proses").length, color: "#3B82F6" },
    { label: "Selesai", value: tickets.filter(t => t.status === "Selesai").length, color: "#10B981" },
    { label: "Ditolak", value: tickets.filter(t => t.status === "Ditolak").length, color: "#EF4444" },
  ];

  const kategoriMap: Record<string, number> = {};
  tickets.forEach(t => { kategoriMap[t.category] = (kategoriMap[t.category] || 0) + 1; });
  const kategoriData = Object.entries(kategoriMap).map(([label, value], i) => ({
    label, value, color: ["#38BDF8", "#818CF8", "#F472B6", "#34D399"][i % 4],
  }));

  const jenisMap: Record<string, number> = {};
  tickets.forEach(t => { jenisMap[t.jenisLaporan] = (jenisMap[t.jenisLaporan] || 0) + 1; });
  const jenisData = Object.entries(jenisMap).map(([label, value], i) => ({
    label, value, color: ["#F59E0B", "#3B82F6", "#EF4444", "#10B981", "#8B5CF6"][i % 5],
  }));

  const peranMap: Record<string, number> = {};
  tickets.forEach(t => { peranMap[t.peran] = (peranMap[t.peran] || 0) + 1; });
  const peranData = Object.entries(peranMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value], i) => ({
      label, value, color: ["#38BDF8", "#818CF8", "#F472B6", "#34D399", "#F59E0B", "#EF4444"][i],
    }));

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: "20px 24px",
  };

  const selesaiPct = tickets.length > 0
    ? Math.round((tickets.filter(t => t.status === "Selesai").length / tickets.length) * 100)
    : 0;

  const tabStyle = (id: string): React.CSSProperties => ({
    padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
    fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
    background: activeTab === id ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
    color: activeTab === id ? "#38BDF8" : "#64748B",
    outline: activeTab === id ? "1px solid rgba(56,189,248,0.3)" : "1px solid rgba(255,255,255,0.06)",
  });

  // ─── Cetak Laporan ───────────────────────────────────────────
  const handlePrint = () => {
    const now = new Date();
    const tglCetak = now.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const currentYear = now.getFullYear();

    // Hitung data bulanan tahun ini
    const monthlyRows = BULAN_ID.map((bln, mi) => {
      const mo = tickets.filter(t => { const d = new Date(t.created); return d.getFullYear() === currentYear && d.getMonth() === mi; });
      const selesai = mo.filter(t => t.status === "Selesai").length;
      return { bln, total: mo.length, menunggu: mo.filter(t => t.status === "Menunggu").length, proses: mo.filter(t => t.status === "Dalam Proses").length, selesai, ditolak: mo.filter(t => t.status === "Ditolak").length, pct: mo.length > 0 ? Math.round((selesai / mo.length) * 100) : 0 };
    });

    // Hitung data tahunan
    const years = Array.from(new Set(tickets.map(t => new Date(t.created).getFullYear()))).sort((a, b) => a - b);
    if (!years.includes(currentYear)) years.push(currentYear);
    const yearlyRows = years.map(y => {
      const yt = tickets.filter(t => new Date(t.created).getFullYear() === y);
      const selesai = yt.filter(t => t.status === "Selesai").length;
      return { year: y, total: yt.length, menunggu: yt.filter(t => t.status === "Menunggu").length, proses: yt.filter(t => t.status === "Dalam Proses").length, selesai, ditolak: yt.filter(t => t.status === "Ditolak").length, pct: yt.length > 0 ? Math.round((selesai / yt.length) * 100) : 0 };
    });

    // Hitung peran
    const peranMap: Record<string, number> = {};
    tickets.forEach(t => { if (t.peran) peranMap[t.peran] = (peranMap[t.peran] || 0) + 1; });
    const peranRows = Object.entries(peranMap).sort((a, b) => b[1] - a[1]);

    // Hitung kategori
    const katMap: Record<string, number> = {};
    tickets.forEach(t => { if (t.category) katMap[t.category] = (katMap[t.category] || 0) + 1; });
    const katRows = Object.entries(katMap).sort((a, b) => b[1] - a[1]);

    const totalSelesai = tickets.filter(t => t.status === "Selesai").length;
    const totalMenunggu = tickets.filter(t => t.status === "Menunggu").length;
    const totalProses = tickets.filter(t => t.status === "Dalam Proses").length;
    const totalDitolak = tickets.filter(t => t.status === "Ditolak").length;
    const pctSelesai = tickets.length > 0 ? Math.round((totalSelesai / tickets.length) * 100) : 0;

    const mkRow = (d: any) => `
      <tr>
        <td>${d.bln || d.year}</td>
        <td style="text-align:center;font-weight:700;color:#1d4ed8">${d.total}</td>
        <td style="text-align:center;color:#92400e">${d.menunggu}</td>
        <td style="text-align:center;color:#1e40af">${d.proses}</td>
        <td style="text-align:center;color:#065f46">${d.selesai}</td>
        <td style="text-align:center;color:#991b1b">${d.ditolak}</td>
        <td style="text-align:center">
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:6px;border-radius:3px;background:#e5e7eb;overflow:hidden;min-width:50px">
              <div style="height:100%;width:${d.pct}%;background:#10b981;border-radius:3px"></div>
            </div>
            <span style="font-size:11px;font-weight:700;color:#065f46">${d.pct}%</span>
          </div>
        </td>
      </tr>`;

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Laporan HelpDesk — ${tglCetak}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 13px; }
  .page { max-width: 960px; margin: 0 auto; padding: 32px 40px; }
  .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 28px; }
  .header-left h1 { font-size: 22px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
  .header-left p { font-size: 12px; color: #64748b; }
  .header-right { text-align: right; font-size: 12px; color: #64748b; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 14px; font-weight: 800; color: #1e3a8a; border-left: 4px solid #1d4ed8; padding-left: 10px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px; }
  .stat-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; text-align: center; }
  .stat-card .val { font-size: 28px; font-weight: 800; }
  .stat-card .lbl { font-size: 11px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  thead tr { background: #f1f5f9; }
  th { padding: 9px 10px; text-align: left; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 10px; letter-spacing: 0.6px; border-bottom: 2px solid #e2e8f0; }
  td { padding: 9px 10px; border-bottom: 1px solid #f1f5f9; }
  tr:last-child td { border-bottom: none; }
  .total-row td { background: #eff6ff; font-weight: 800; color: #1d4ed8; border-top: 2px solid #bfdbfe; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 20px; }
    .no-break { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="header-left">
      <h1>Laporan Helpdesk</h1>
      <p>Unit Layanan Terpadu — Kemendikdasmen</p>
    </div>
    <div class="header-right">
      <div style="font-weight:700;font-size:13px;color:#1e293b">Tanggal Cetak</div>
      <div>${tglCetak}</div>
      <div style="margin-top:6px">Total Tiket: <strong style="color:#1d4ed8">${tickets.length}</strong></div>
    </div>
  </div>

  <!-- STATISTIK UTAMA -->
  <div class="section no-break">
    <div class="section-title">Statistik Utama</div>
    <div class="stat-grid">
      <div class="stat-card"><div class="val" style="color:#1d4ed8">${tickets.length}</div><div class="lbl">Total Tiket</div></div>
      <div class="stat-card"><div class="val" style="color:#d97706">${totalMenunggu}</div><div class="lbl">Menunggu</div></div>
      <div class="stat-card"><div class="val" style="color:#2563eb">${totalProses}</div><div class="lbl">Dalam Proses</div></div>
      <div class="stat-card"><div class="val" style="color:#059669">${totalSelesai}</div><div class="lbl">Selesai</div></div>
      <div class="stat-card"><div class="val" style="color:#7c3aed">${pctSelesai}%</div><div class="lbl">Tingkat Selesai</div></div>
    </div>
  </div>

  <!-- REKAP BULANAN -->
  <div class="section no-break">
    <div class="section-title">Rekap Bulanan — Tahun ${currentYear}</div>
    <table>
      <thead><tr><th>Bulan</th><th style="text-align:center">Total</th><th style="text-align:center">Menunggu</th><th style="text-align:center">Dalam Proses</th><th style="text-align:center">Selesai</th><th style="text-align:center">Ditolak</th><th style="text-align:center">Tingkat Selesai</th></tr></thead>
      <tbody>
        ${monthlyRows.map(mkRow).join('')}
        <tr class="total-row">
          <td>TOTAL</td>
          <td style="text-align:center">${monthlyRows.reduce((s, d) => s + d.total, 0)}</td>
          <td style="text-align:center">${monthlyRows.reduce((s, d) => s + d.menunggu, 0)}</td>
          <td style="text-align:center">${monthlyRows.reduce((s, d) => s + d.proses, 0)}</td>
          <td style="text-align:center">${monthlyRows.reduce((s, d) => s + d.selesai, 0)}</td>
          <td style="text-align:center">${monthlyRows.reduce((s, d) => s + d.ditolak, 0)}</td>
          <td style="text-align:center">${pctSelesai}%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- REKAP TAHUNAN -->
  <div class="section no-break">
    <div class="section-title">Rekap Tahunan</div>
    <table>
      <thead><tr><th>Tahun</th><th style="text-align:center">Total</th><th style="text-align:center">Menunggu</th><th style="text-align:center">Dalam Proses</th><th style="text-align:center">Selesai</th><th style="text-align:center">Ditolak</th><th style="text-align:center">Tingkat Selesai</th></tr></thead>
      <tbody>
        ${yearlyRows.map(mkRow).join('')}
        <tr class="total-row">
          <td>TOTAL</td>
          <td style="text-align:center">${yearlyRows.reduce((s, d) => s + d.total, 0)}</td>
          <td style="text-align:center">${yearlyRows.reduce((s, d) => s + d.menunggu, 0)}</td>
          <td style="text-align:center">${yearlyRows.reduce((s, d) => s + d.proses, 0)}</td>
          <td style="text-align:center">${yearlyRows.reduce((s, d) => s + d.selesai, 0)}</td>
          <td style="text-align:center">${yearlyRows.reduce((s, d) => s + d.ditolak, 0)}</td>
          <td style="text-align:center">${tickets.length > 0 ? Math.round((totalSelesai / tickets.length) * 100) : 0}%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PERAN & KATEGORI -->
  <div class="section two-col no-break">
    <div>
      <div class="section-title">Peran Pengirim</div>
      <table>
        <thead><tr><th>Peran</th><th style="text-align:center">Jumlah</th><th style="text-align:center">%</th></tr></thead>
        <tbody>
          ${peranRows.map(([p, v]) => `<tr><td>${p}</td><td style="text-align:center;font-weight:700">${v}</td><td style="text-align:center;color:#64748b">${tickets.length > 0 ? Math.round((v / tickets.length) * 100) : 0}%</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div>
      <div class="section-title">Kategori Laporan</div>
      <table>
        <thead><tr><th>Kategori</th><th style="text-align:center">Jumlah</th><th style="text-align:center">%</th></tr></thead>
        <tbody>
          ${katRows.map(([k, v]) => `<tr><td>${k}</td><td style="text-align:center;font-weight:700">${v}</td><td style="text-align:center;color:#64748b">${tickets.length > 0 ? Math.round((v / tickets.length) * 100) : 0}%</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <div class="footer">Dicetak dari Sistem HelpDesk — ${tglCetak} &nbsp;|&nbsp; Dokumen ini dibuat secara otomatis</div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=1000,height=700");
    if (w) { w.document.write(html); w.document.close(); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* TAB SWITCHER + CETAK */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={tabStyle("overview")} onClick={() => setActiveTab("overview")}>📊 Overview</button>
          <button style={tabStyle("bulanan")} onClick={() => setActiveTab("bulanan")}>📅 Rekap Bulanan</button>
          <button style={tabStyle("tahunan")} onClick={() => setActiveTab("tahunan")}>📆 Rekap Tahunan</button>
        </div>
        <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg,#3B82F6,#06B6D4)", color: "#fff", boxShadow: "0 4px 12px rgba(59,130,246,0.3)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
          Cetak Laporan
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && <>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Tiket", value: tickets.length, color: "#3B82F6", icon: "📋" },
            { label: "Menunggu", value: tickets.filter(t => t.status === "Menunggu").length, color: "#F59E0B", icon: "⏳" },
            { label: "Dalam Proses", value: tickets.filter(t => t.status === "Dalam Proses").length, color: "#0EA5E9", icon: "🔄" },
            { label: "Selesai", value: tickets.filter(t => t.status === "Selesai").length, color: "#10B981", icon: "✅" },
            { label: "Tingkat Selesai", value: `${selesaiPct}%`, color: "#8B5CF6", icon: "📊" },
          ].map(s => (
            <div key={s.label} style={{ ...cardStyle, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -16, right: -16, width: 64, height: 64, borderRadius: "50%", background: s.color, opacity: 0.1 }} />
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW 1 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Donut Status */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📊 Status Tiket</div>
            <DonutChart data={statusData} />
          </div>

          {/* Trend 7 Hari */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📈 Tiket 7 Hari Terakhir</div>
            <TrendChart tickets={tickets} />
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Kategori */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>🗂️ Kategori Laporan</div>
            {kategoriData.length > 0
              ? <BarChart data={kategoriData} />
              : <div style={{ color: "#475569", fontSize: 13 }}>Belum ada data</div>}
          </div>

          {/* Jenis Laporan */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>📝 Jenis Laporan</div>
            {jenisData.length > 0
              ? <BarChart data={jenisData} />
              : <div style={{ color: "#475569", fontSize: 13 }}>Belum ada data</div>}
          </div>

          {/* Peran Pelapor */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>👥 Peran Pelapor</div>
            {peranData.length > 0
              ? <BarChart data={peranData} />
              : <div style={{ color: "#475569", fontSize: 13 }}>Belum ada data</div>}
          </div>
        </div>

        {/* TREN PERAN PENGIRIM */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#E2E8F0", marginBottom: 16 }}>👥 Tren Peran Pengirim Tiket</div>
          {tickets.length > 0
            ? <PeranTrendChart tickets={tickets} />
            : <div style={{ color: "#475569", fontSize: 13 }}>Belum ada data</div>}
        </div>

      </> /* end overview */}

      {/* MONTHLY RECAP TAB */}
      {activeTab === "bulanan" && <MonthlyRecap tickets={tickets} />}

      {/* YEARLY RECAP TAB */}
      {activeTab === "tahunan" && <YearlyRecap tickets={tickets} />}

    </div>
  );
}

// ─── Manajemen Admin ──────────────────────────────────────────
function ManajemenAdmin({ token, role }: { token: string; role: string }) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", nama: "", role: "admin" });
  const [formErr, setFormErr] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin", { headers });
      const data = await res.json();
      if (res.ok) setAdmins(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleTambah = async () => {
    setFormErr("");
    if (!form.username || !form.password || !form.nama) { setFormErr("Semua field wajib diisi."); return; }
    if (form.password.length < 6) { setFormErr("Password minimal 6 karakter."); return; }
    const res = await fetch("/api/auth/admin", { method: "POST", headers, body: JSON.stringify(form) });
    const data = await res.json();
    if (res.ok) {
      showToast("Admin berhasil ditambahkan");
      setShowForm(false);
      setForm({ username: "", password: "", nama: "", role: "admin" });
      fetchAdmins();
    } else { setFormErr(data.error || "Gagal menambahkan admin"); }
  };

  const handleHapus = async (username: string) => {
    if (!confirm(`Hapus admin "${username}"?`)) return;
    const res = await fetch("/api/auth/admin", { method: "DELETE", headers, body: JSON.stringify({ username }) });
    const data = await res.json();
    if (res.ok) { showToast(`Admin "${username}" dihapus`); fetchAdmins(); }
    else showToast(data.error || "Gagal menghapus", "error");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box", outline: "none",
  };

  const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
    superadmin: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA" },
    admin: { bg: "rgba(56,189,248,0.12)", text: "#38BDF8" },
  };

  return (
    <div>
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {toast.msg}
        </div>
      )}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Manajemen Admin</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Kelola akun admin panel</p>
        </div>
        {role === "superadmin" && (
          <button onClick={() => { setShowForm(!showForm); setFormErr(""); }}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
            {showForm ? "✕ Batal" : "+ Tambah Admin"}
          </button>
        )}
      </div>

      {showForm && role === "superadmin" && (
        <div style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#38BDF8" }}>+ Tambah Admin Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[["nama", "Nama Lengkap", "text"], ["username", "Username", "text"], ["password", "Password", "password"]].map(([k, l, t]) => (
              <div key={k}>
                <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>{l}</label>
                <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6, fontWeight: 500 }}>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, background: "#1E293B" }}>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
          </div>
          {formErr && <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 13 }}>{formErr}</div>}
          <button onClick={handleTambah} style={{ marginTop: 16, padding: "11px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
            Simpan Admin →
          </button>
        </div>
      )}

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Memuat data admin...</div>
        ) : (
          <div>
            {admins.map((a, i) => {
              const rc = ROLE_COLOR[a.role] || ROLE_COLOR["admin"];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < admins.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {a.nama?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{a.nama}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>@{a.username}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ background: rc.bg, color: rc.text, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{a.role}</span>
                    {role === "superadmin" && (
                      <button onClick={() => handleHapus(a.username)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {admins.length === 0 && <div style={{ textAlign: "center", padding: "40px", color: "#475569" }}>Belum ada data admin.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (token: string, nama: string, role: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErr("");
    if (!username.trim() || !password.trim()) { setErr("Username dan password wajib diisi."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok) onLogin(data.token, data.nama, data.role);
      else setErr(data.error || "Login gagal");
    } catch { setErr("Tidak dapat terhubung ke server."); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)",
    color: "#E2E8F0", fontSize: 14, fontFamily: "'Outfit', sans-serif",
    boxSizing: "border-box", outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit', sans-serif", padding: 20 }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "clamp(32px, 5vw, 48px) clamp(24px, 5vw, 40px)", width: "100%", maxWidth: 380, backdropFilter: "blur(20px)" }}>

        <img src="/logo_b3.png" alt="Kemendikdasmen - Unit Layanan Terpadu" style={{ width: "100%", maxHeight: 44, objectFit: "contain", objectPosition: "center", margin: "0 auto 16px" }} />

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* <div style={{ width: 52, height: 52, background: "linear-gradient(135deg, #3B82F6, #06B6D4)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>
          </div> */}
          <h2 style={{ color: "#fff", margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>Admin Panel</h2>
          <p style={{ color: "#64748B", fontSize: 14, margin: 0 }}>Masuk dengan akun admin Anda</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan username" style={inputStyle} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" style={inputStyle} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {err && <div style={{ fontSize: 13, color: "#F87171", textAlign: "center", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>{err}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ padding: "13px", borderRadius: 10, border: "none", background: loading ? "#334155" : "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>
            {loading ? "Memverifikasi..." : "Masuk →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ token, nama, role, onLogout }: { token: string; nama: string; role: string; onLogout: () => void }) {
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
  const [menu, setMenu] = useState<"dashboard" | "tiket" | "admin">("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/tiket");
      const data = await res.json();
      if (res.ok) setTickets(data);
    } finally { setLoadingTickets(false); }
  };

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
      const res = await fetch(`/api/tiket/${selected.id}`, { method: "PATCH", headers, body: JSON.stringify({ status: newStatus }) });
      const data = await res.json();
      if (res.ok) { await fetchTickets(); await fetchTicketDetail(selected.id); showToast(`Status diperbarui ke "${newStatus}"`); }
      else showToast(data.error || "Gagal memperbarui status", "error");
    } finally { setLoadingAction(false); }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setLoadingAction(true);
    try {
      const res = await fetch("/api/balasan", { method: "POST", headers, body: JSON.stringify({ ticketId: selected.id, text: reply }) });
      const data = await res.json();
      if (res.ok) { setReply(""); await fetchTicketDetail(selected.id); showToast("Balasan berhasil dikirim"); }
      else showToast(data.error || "Gagal mengirim balasan", "error");
    } finally { setLoadingAction(false); }
  };

  const handleHapusTicket = async (id: string) => {
    if (!confirm(`Hapus tiket ${id}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/tiket/${id}`, { method: "DELETE", headers });
      const data = await res.json();
      if (res.ok) {
        setSelected(null);
        await fetchTickets();
        showToast(`Tiket ${id} berhasil dihapus`);
      } else {
        showToast(data.error || "Gagal menghapus tiket", "error");
      }
    } catch (err: any) {
      showToast("Error: " + err.message, "error");
    } finally { setLoadingAction(false); }
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
      const tiketHeader = ["ID", "Nama", "Email", "Peran", "Jenis Laporan", "Subjek", "Kategori", "Prioritas", "Status", "Deskripsi", "Lampiran", "Dibuat", "Diperbarui"];
      const tiketRows = ticketsWithReplies.map(t => [t.id, t.name, t.email, t.peran, t.jenisLaporan, t.subject, t.category, t.priority, t.status, t.description, t.attachment || "", t.created, t.updated]);
      const balasanHeader = ["ID Tiket", "Subjek", "Dari", "Pesan", "Waktu"];
      const balasanRows: string[][] = [];
      ticketsWithReplies.forEach(t => {
        if (t.replies.length === 0) balasanRows.push([t.id, t.subject, "-", "(Belum ada balasan)", ""]);
        else t.replies.forEach((r: any) => balasanRows.push([t.id, t.subject, r.from, r.text, r.time]));
      });
      const toCSV = (h: string[], r: string[][]) => [h, ...r].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const csv = "DATA TIKET\n" + toCSV(tiketHeader, tiketRows) + "\n\n\nDATA BALASAN\n" + toCSV(balasanHeader, balasanRows);
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `helpdesk-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      showToast(`Export berhasil — ${tickets.length} tiket`);
    } catch (err: any) { showToast("Gagal export: " + err.message, "error"); }
  };

  const MENU_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "tiket", label: "Semua Tiket", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { id: "admin", label: "Kelola Admin", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M13 7a4 4 0 11-8 0 4 4 0 018 0z", superadminOnly: true },
  ];

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{ marginBottom: 20, padding: "0 4px" }}>
        <img src="/logo_b3.png" alt="Kemendikdasmen - Unit Layanan Terpadu"
          style={{ width: "100%", maxHeight: 44, objectFit: "contain", objectPosition: "left" }} />
      </div>
      {/* Info Admin */}
      <div style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)", borderRadius: 10, padding: "10px 12px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{nama}</div>
        <div style={{ fontSize: 11, color: "#38BDF8", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{role}</div>
      </div>

      {/* Menu */}
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Menu</div>
      {MENU_ITEMS.map(m => (
        (m.superadminOnly && role !== "superadmin") ? null :
          <div key={m.id} onClick={() => { setMenu(m.id as any); setSidebarOpen(false); }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 4, cursor: "pointer", transition: "all 0.15s",
              background: menu === m.id ? "rgba(56,189,248,0.1)" : "transparent",
              color: menu === m.id ? "#38BDF8" : "#64748B",
              fontWeight: menu === m.id ? 600 : 400, fontSize: 14
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={m.icon} />
            </svg>
            {m.label}
          </div>
      ))}

      {/* Divider + Logout langsung setelah menu */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />

      <button onClick={onLogout}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Keluar
      </button>

      {/* Spacer fleksibel di bawah */}
      <div style={{ flex: 1 }} />


    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", fontFamily: "'Outfit', sans-serif", color: "#E2E8F0", display: "flex" }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-header { display: flex !important; }
          .main-content { padding: 16px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .detail-panel { position: fixed !important; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; overflow-y: auto; border-radius: 0 !important; }
        }
        @media (min-width: 769px) {
          .mobile-header { display: none !important; }
          .mobile-overlay { display: none !important; }
        }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: toast.type === "success" ? "#10B981" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
          {toast.msg}
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 199 }} />
      )}

      {/* MOBILE SIDEBAR */}
      <div style={{ position: "fixed", top: 0, left: sidebarOpen ? 0 : "-280px", width: 260, height: "100vh", background: "#0F172A", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "24px 16px", zIndex: 200, transition: "left 0.3s ease", display: "flex", flexDirection: "column" }}>
        {sidebarContent}
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="desktop-sidebar" style={{ width: 240, background: "rgba(255,255,255,0.03)", borderRight: "1px solid rgba(255,255,255,0.08)", padding: "24px 16px", display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        {sidebarContent}
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {/* MOBILE HEADER */}
        <div className="mobile-header" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#E2E8F0", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 18 }}>☰</button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>HelpDesk<span style={{ color: "#38BDF8" }}>ID</span></span>
          <button onClick={fetchTickets} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#E2E8F0", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 14 }}>🔄</button>
        </div>

        {/* DESKTOP HEADER */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(16px, 3vw, 22px)", fontWeight: 700 }}>
              {menu === "dashboard" ? "Dashboard Statistik" : menu === "tiket" ? "Semua Tiket" : "Kelola Admin"}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>{tickets.length} tiket terdaftar</p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={fetchTickets} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              🔄 Refresh
            </button>
            <button onClick={handleExport} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#E2E8F0", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              ⬇️ Export CSV
            </button>
          </div>
        </div>

        <div className="main-content" style={{ padding: "24px 28px" }}>

          {/* DASHBOARD */}
          {menu === "dashboard" && (
            loadingTickets
              ? <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Memuat statistik...</div>
              : <StatsDashboard tickets={tickets} />
          )}

          {/* TIKET */}
          {menu === "tiket" && (
            <div>
              {/* FILTERS */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
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

              <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 16, alignItems: "start" }}>
                {/* TABLE / CARD LIST */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                  {loadingTickets ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Memuat tiket...</div>
                  ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#475569" }}>Tidak ada tiket ditemukan.</div>
                  ) : (
                    <div>
                      {/* Desktop table header */}
                      <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 80px 110px 120px", gap: 8, padding: "12px 16px", background: "rgba(255,255,255,0.04)", fontSize: 11, color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                        {["ID", "Nama / Subjek", "Kategori", "Prioritas", "Status", "Tanggal"].map(h => <div key={h}>{h}</div>)}
                      </div>
                      {filtered.map(t => (
                        <div key={t.id} onClick={() => { fetchTicketDetail(t.id); }}
                          style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 80px 110px 120px", gap: 8, padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: selected?.id === t.id ? "rgba(56,189,248,0.07)" : "transparent", transition: "background 0.15s", alignItems: "center" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#38BDF8" }}>{t.id}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.name}</div>
                            <div style={{ fontSize: 11, color: "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject}</div>
                          </div>
                          <div style={{ fontSize: 12, color: "#94A3B8" }}>{t.category}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: PRIORITY_COLOR[t.priority] }}>● {t.priority}</div>
                          <div><StatusBadge status={t.status} /></div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{formatDate(t.created)}</div>
                          {role === "superadmin" && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <button onClick={e => { e.stopPropagation(); handleHapusTicket(t.id); }} disabled={loadingAction}
                                style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 12, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
                                🗑️
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DETAIL PANEL */}
                {selected && (
                  <div className="detail-panel" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 12, color: "#38BDF8", fontWeight: 700, marginBottom: 4 }}>{selected.id}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{selected.subject}</div>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#94A3B8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
                    </div>
                    <div style={{ padding: "16px 20px", maxHeight: "75vh", overflowY: "auto" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                        {[["Nama", selected.name], ["Email", selected.email], ["Peran", selected.peran], ["Jenis", selected.jenisLaporan], ["Kategori", selected.category], ["Prioritas", selected.priority]].map(([l, v]) => (
                          <div key={l} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{l}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: l === "Prioritas" ? PRIORITY_COLOR[v] : "#E2E8F0", wordBreak: "break-all" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
                        <div style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Deskripsi</div>
                        <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.6 }}>{selected.description}</div>
                      </div>
                      {selected.attachment && (
                        <a href={selected.attachment} target="_blank" rel="noopener noreferrer"
                          style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textDecoration: "none" }}>
                          <span style={{ fontSize: 18 }}>📎</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#38BDF8" }}>Lihat Lampiran</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>Klik untuk membuka</div>
                          </div>
                        </a>
                      )}
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "12px", marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Update Status</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                            style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "#1E293B", color: "#E2E8F0", fontSize: 13, fontFamily: "'Outfit', sans-serif", outline: "none" }}>
                            {["Menunggu", "Dalam Proses", "Selesai", "Ditolak"].map(s => <option key={s}>{s}</option>)}
                          </select>
                          <button onClick={handleUpdateStatus} disabled={loadingAction}
                            style={{ padding: "9px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #3B82F6, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                            Simpan
                          </button>
                        </div>
                      </div>
                      {selected.replies?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Riwayat Balasan</div>
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
                      <div>
                        <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, marginBottom: 8 }}>Kirim Balasan</div>
                        <textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Tulis balasan..." rows={3}
                          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#E2E8F0", fontSize: 13, fontFamily: "'Outfit', sans-serif", boxSizing: "border-box", outline: "none", resize: "none", marginBottom: 8 }} />
                        <button onClick={handleReply} disabled={loadingAction}
                          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #10B981, #06B6D4)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}>
                          {loadingAction ? "Mengirim..." : "Kirim Balasan"}
                        </button>
                      </div>

                      {/* Hapus Tiket — superadmin only */}
                      {role === "superadmin" && (
                        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          <button onClick={() => handleHapusTicket(selected.id)} disabled={loadingAction}
                            style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#F87171", fontSize: 13, fontWeight: 600, cursor: loadingAction ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            🗑️ Hapus Tiket Ini
                          </button>
                          <p style={{ fontSize: 11, color: "#475569", textAlign: "center", margin: "6px 0 0" }}>
                            Hanya superadmin • Tidak bisa dibatalkan
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADMIN */}
          {menu === "admin" && <ManajemenAdmin token={token} role={role} />}
        </div>
      </main>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────
export default function AdminView() {
  const [token, setToken] = useState<string | null>(null);
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");

  return token
    ? <Dashboard token={token} nama={nama} role={role} onLogout={() => { setToken(null); setNama(""); setRole(""); }} />
    : <LoginScreen onLogin={(t, n, r) => { setToken(t); setNama(n); setRole(r); }} />;
}