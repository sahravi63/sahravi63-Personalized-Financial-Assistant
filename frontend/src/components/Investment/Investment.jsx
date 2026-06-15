import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import api from "../../api";
import "./investment.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

// ── constants ────────────────────────────────────────────────────────────────

const ASSET_TYPES = ["Stocks", "Mutual Funds", "Gold", "Real Estate", "Crypto", "Fixed Deposit", "Other"];

const ASSET_COLORS = {
  Stocks:         "#4f83cc",
  "Mutual Funds": "#3dba8a",
  Gold:           "#e9a825",
  "Real Estate":  "#c2595a",
  Crypto:         "#9a6dd7",
  "Fixed Deposit":"#47b5c8",
  Other:          "#888780",
};

const RISK_LABELS = { Stocks: "High", "Mutual Funds": "Medium", Gold: "Low", "Real Estate": "Low", Crypto: "Very High", "Fixed Deposit": "Very Low", Other: "Medium" };
const RISK_CLASS  = { "Very Low": "risk-vl", Low: "risk-l", Medium: "risk-m", High: "risk-h", "Very High": "risk-vh" };

const EMPTY_FORM = { name: "", type: "Stocks", investedAmount: "", currentValue: "", date: "", notes: "" };

// ── helpers ───────────────────────────────────────────────────────────────────

const fmt   = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const pct   = (v, i) => (i === 0 ? 0 : (((v - i) / i) * 100).toFixed(1));
const today = () => new Date().toISOString().split("T")[0];

// ── main component ────────────────────────────────────────────────────────────

export default function Investment() {
  const [investments, setInvestments]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [deleteId, setDeleteId]         = useState(null);
  const [filterType, setFilterType]     = useState("All");
  const [sortBy, setSortBy]             = useState("date");
  const [insight, setInsight]           = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const formRef = useRef(null);

  // ── fetch ─────────────────────────────────────────────────────────────────

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/investments");
      setInvestments(data || []);
    } catch (err) {
      // Graceful fallback: if endpoint doesn't exist yet, show empty state
      if (err.response?.status === 404) {
        setInvestments([]);
      } else {
        setError(err.response?.data?.message || "Failed to load investments.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvestments(); }, [fetchInvestments]);

  // ── AI insight ────────────────────────────────────────────────────────────

  const fetchInsight = async () => {
    if (investments.length === 0) return;
    setInsightLoading(true);
    setInsight("");
    try {
      const { data } = await api.get("/api/investment-insights");
      setInsight(data.insight || "No insight available.");
    } catch {
      // Compute a local insight when the endpoint isn't wired yet
      const total = investments.reduce((s, i) => s + Number(i.currentValue || 0), 0);
      const invested = investments.reduce((s, i) => s + Number(i.investedAmount || 0), 0);
      const gain = total - invested;
      const gainPct = invested > 0 ? ((gain / invested) * 100).toFixed(1) : 0;
      const topType = Object.entries(
        investments.reduce((acc, inv) => {
          acc[inv.type] = (acc[inv.type] || 0) + Number(inv.currentValue || 0);
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0];

      setInsight(
        `Your portfolio is ${gain >= 0 ? "up" : "down"} ${Math.abs(gainPct)}% overall (${fmt(gain)}). ` +
        `${topType ? `${topType[0]} makes up the largest share at ${fmt(topType[1])}.` : ""} ` +
        `${gain < 0 ? "Consider reviewing underperforming assets." : "Keep up the disciplined investing!"}`
      );
    } finally {
      setInsightLoading(false);
    }
  };

  // ── form handlers ─────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFormError("");
  };

  const validate = () => {
    if (!form.name.trim())                      return "Name is required.";
    if (!form.investedAmount || isNaN(Number(form.investedAmount)) || Number(form.investedAmount) <= 0)
                                                return "Enter a valid invested amount.";
    if (!form.currentValue  || isNaN(Number(form.currentValue))  || Number(form.currentValue)  < 0)
                                                return "Enter a valid current value.";
    if (!form.date)                             return "Date is required.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }
    setSubmitting(true);
    try {
      await api.post("/api/investments", {
        ...form,
        investedAmount: Number(form.investedAmount),
        currentValue:   Number(form.currentValue),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchInvestments();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not save investment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/investments/${id}`);
      setDeleteId(null);
      await fetchInvestments();
    } catch {
      setError("Failed to delete investment.");
    }
  };

  // ── derived data ──────────────────────────────────────────────────────────

  const filtered = investments
    .filter((inv) => filterType === "All" || inv.type === filterType)
    .sort((a, b) => {
      if (sortBy === "gain")    return (Number(b.currentValue) - Number(b.investedAmount)) - (Number(a.currentValue) - Number(a.investedAmount));
      if (sortBy === "value")   return Number(b.currentValue) - Number(a.currentValue);
      if (sortBy === "name")    return a.name.localeCompare(b.name);
      return new Date(b.date) - new Date(a.date);
    });

  const totalInvested = investments.reduce((s, i) => s + Number(i.investedAmount || 0), 0);
  const totalCurrent  = investments.reduce((s, i) => s + Number(i.currentValue   || 0), 0);
  const totalGain     = totalCurrent - totalInvested;
  const totalGainPct  = pct(totalCurrent, totalInvested);

  // Allocation doughnut
  const allocationMap = investments.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + Number(inv.currentValue || 0);
    return acc;
  }, {});
  const doughnutData = {
    labels: Object.keys(allocationMap),
    datasets: [{
      data:            Object.values(allocationMap),
      backgroundColor: Object.keys(allocationMap).map((t) => ASSET_COLORS[t] || "#888"),
      borderWidth:     0,
      hoverOffset:     8,
    }],
  };

  // Gain/loss bar
  const barLabels = filtered.slice(0, 10).map((i) => i.name.length > 12 ? i.name.slice(0, 12) + "…" : i.name);
  const barGains  = filtered.slice(0, 10).map((i) => Number(i.currentValue) - Number(i.investedAmount));
  const barData   = {
    labels: barLabels,
    datasets: [{
      label:           "Gain / Loss (₹)",
      data:            barGains,
      backgroundColor: barGains.map((g) => g >= 0 ? "rgba(61, 186, 138, 0.75)" : "rgba(224, 75, 75, 0.75)"),
      borderRadius:    6,
    }],
  };

  // Timeline line chart (by month)
  const timelineMap = investments.reduce((acc, inv) => {
    const month = (inv.date || "").slice(0, 7);
    if (!month) return acc;
    acc[month] = (acc[month] || 0) + Number(inv.investedAmount || 0);
    return acc;
  }, {});
  const sortedMonths = Object.keys(timelineMap).sort();
  let cumulative = 0;
  const lineData = {
    labels: sortedMonths,
    datasets: [{
      label:           "Cumulative Invested (₹)",
      data:            sortedMonths.map((m) => { cumulative += timelineMap[m]; return cumulative; }),
      borderColor:     "#4f83cc",
      backgroundColor: "rgba(79, 131, 204, 0.15)",
      fill:            true,
      tension:         0.4,
      pointRadius:     4,
      pointHoverRadius:6,
    }],
  };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#8b9099", font: { size: 11 } } },
      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#8b9099", font: { size: 11 }, callback: (v) => "₹" + v.toLocaleString("en-IN") } },
    },
  });

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { color: "#c4c7cc", font: { size: 12 }, padding: 14, boxWidth: 14 } },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / totalCurrent) * 100).toFixed(1)}%)` } },
    },
    cutout: "62%",
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="inv-page">
      {/* header */}
      <div className="inv-header">
        <div>
          <h1 className="inv-title">Investment Portfolio</h1>
          <p className="inv-subtitle">Track, analyse, and grow your wealth</p>
        </div>
        <button className="inv-btn-primary" onClick={() => { setShowForm((v) => !v); setFormError(""); formRef.current?.scrollIntoView({ behavior: "smooth" }); }}>
          {showForm ? "✕ Cancel" : "+ Add Investment"}
        </button>
      </div>

      {/* summary cards */}
      <div className="inv-summary-grid">
        <div className="inv-card inv-summary-card">
          <span className="inv-card-label">Total Invested</span>
          <span className="inv-card-value">{fmt(totalInvested)}</span>
        </div>
        <div className="inv-card inv-summary-card">
          <span className="inv-card-label">Current Value</span>
          <span className="inv-card-value">{fmt(totalCurrent)}</span>
        </div>
        <div className={`inv-card inv-summary-card ${totalGain >= 0 ? "inv-gain" : "inv-loss"}`}>
          <span className="inv-card-label">Total Gain / Loss</span>
          <span className="inv-card-value">{totalGain >= 0 ? "+" : ""}{fmt(totalGain)}</span>
          <span className="inv-card-sub">{totalGainPct >= 0 ? "+" : ""}{totalGainPct}%</span>
        </div>
        <div className="inv-card inv-summary-card">
          <span className="inv-card-label">Holdings</span>
          <span className="inv-card-value">{investments.length}</span>
          <span className="inv-card-sub">{Object.keys(allocationMap).length} asset class{Object.keys(allocationMap).length !== 1 ? "es" : ""}</span>
        </div>
      </div>

      {/* add form */}
      {showForm && (
        <div className="inv-card inv-form-card" ref={formRef}>
          <h2 className="inv-section-title">New Investment</h2>
          {formError && <div className="inv-alert inv-alert-error">{formError}</div>}
          <form className="inv-form" onSubmit={handleSubmit}>
            <div className="inv-form-row">
              <div className="inv-form-group">
                <label>Investment Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. HDFC Nifty 50 ETF" />
              </div>
              <div className="inv-form-group">
                <label>Asset Type *</label>
                <select name="type" value={form.type} onChange={handleChange}>
                  {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="inv-form-row">
              <div className="inv-form-group">
                <label>Invested Amount (₹) *</label>
                <input name="investedAmount" type="number" min="1" value={form.investedAmount} onChange={handleChange} placeholder="50000" />
              </div>
              <div className="inv-form-group">
                <label>Current Value (₹) *</label>
                <input name="currentValue" type="number" min="0" value={form.currentValue} onChange={handleChange} placeholder="58000" />
              </div>
              <div className="inv-form-group">
                <label>Date *</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} max={today()} />
              </div>
            </div>
            <div className="inv-form-group inv-form-full">
              <label>Notes</label>
              <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} placeholder="Optional notes about this investment…" />
            </div>
            <div className="inv-form-actions">
              <button type="submit" className="inv-btn-primary" disabled={submitting}>
                {submitting ? "Saving…" : "Save Investment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* error banner */}
      {error && <div className="inv-alert inv-alert-error">{error}</div>}

      {/* loading */}
      {loading ? (
        <div className="inv-loading">
          <div className="inv-spinner" />
          <span>Loading portfolio…</span>
        </div>
      ) : investments.length === 0 ? (
        <div className="inv-empty">
          <div className="inv-empty-icon">📊</div>
          <p>No investments yet. Add your first one above.</p>
        </div>
      ) : (
        <>
          {/* charts row */}
          <div className="inv-charts-grid">
            <div className="inv-card inv-chart-card">
              <h3 className="inv-chart-title">Allocation by asset class</h3>
              <div className="inv-chart-wrap" style={{ height: 220 }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            <div className="inv-card inv-chart-card">
              <h3 className="inv-chart-title">Gain / loss by holding</h3>
              <div className="inv-chart-wrap" style={{ height: 220 }}>
                {filtered.length ? <Bar data={barData} options={chartOptions("Gain/Loss")} /> : <p className="inv-no-data">No data</p>}
              </div>
            </div>

            <div className="inv-card inv-chart-card">
              <h3 className="inv-chart-title">Cumulative invested over time</h3>
              <div className="inv-chart-wrap" style={{ height: 220 }}>
                {sortedMonths.length ? <Line data={lineData} options={chartOptions("Timeline")} /> : <p className="inv-no-data">No timeline data</p>}
              </div>
            </div>
          </div>

          {/* AI insight */}
          <div className="inv-card inv-insight-card">
            <div className="inv-insight-header">
              <h3 className="inv-chart-title" style={{ margin: 0 }}>AI Portfolio Insight</h3>
              <button className="inv-btn-ghost" onClick={fetchInsight} disabled={insightLoading}>
                {insightLoading ? "Analysing…" : "✦ Generate Insight"}
              </button>
            </div>
            {insight ? (
              <p className="inv-insight-text">{insight}</p>
            ) : (
              <p className="inv-insight-hint">Click "Generate Insight" to get a personalised analysis of your portfolio.</p>
            )}
          </div>

          {/* table controls */}
          <div className="inv-table-controls">
            <div className="inv-filter-group">
              <label>Filter</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="All">All types</option>
                {ASSET_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="inv-filter-group">
              <label>Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="date">Date</option>
                <option value="value">Current value</option>
                <option value="gain">Gain / loss</option>
                <option value="name">Name</option>
              </select>
            </div>
            <span className="inv-count">{filtered.length} of {investments.length} holdings</span>
          </div>

          {/* holdings table */}
          <div className="inv-card inv-table-card">
            <div className="inv-table-scroll">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Risk</th>
                    <th className="inv-num">Invested</th>
                    <th className="inv-num">Current</th>
                    <th className="inv-num">Gain / Loss</th>
                    <th className="inv-num">Return %</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const gain    = Number(inv.currentValue) - Number(inv.investedAmount);
                    const gainPct = pct(Number(inv.currentValue), Number(inv.investedAmount));
                    const risk    = RISK_LABELS[inv.type] || "Medium";
                    return (
                      <tr key={inv._id}>
                        <td>
                          <div className="inv-name-cell">
                            <span className="inv-dot" style={{ background: ASSET_COLORS[inv.type] || "#888" }} />
                            <div>
                              <span className="inv-holding-name">{inv.name}</span>
                              {inv.notes && <span className="inv-holding-note">{inv.notes}</span>}
                            </div>
                          </div>
                        </td>
                        <td><span className="inv-badge">{inv.type}</span></td>
                        <td><span className={`inv-risk ${RISK_CLASS[risk]}`}>{risk}</span></td>
                        <td className="inv-num">{fmt(inv.investedAmount)}</td>
                        <td className="inv-num">{fmt(inv.currentValue)}</td>
                        <td className={`inv-num inv-pnl ${gain >= 0 ? "inv-gain-text" : "inv-loss-text"}`}>
                          {gain >= 0 ? "+" : ""}{fmt(gain)}
                        </td>
                        <td className={`inv-num inv-pnl ${gainPct >= 0 ? "inv-gain-text" : "inv-loss-text"}`}>
                          {gainPct >= 0 ? "+" : ""}{gainPct}%
                        </td>
                        <td className="inv-date">{inv.date ? new Date(inv.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td>
                          {deleteId === inv._id ? (
                            <span className="inv-confirm-del">
                              <button className="inv-btn-danger-sm" onClick={() => handleDelete(inv._id)}>Yes</button>
                              <button className="inv-btn-ghost-sm" onClick={() => setDeleteId(null)}>No</button>
                            </span>
                          ) : (
                            <button className="inv-btn-del" title="Delete" onClick={() => setDeleteId(inv._id)}>✕</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}