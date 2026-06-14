import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';

const monthValue = () => new Date().toISOString().slice(0, 7);

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [status, setStatus] = useState([]);
  const [month, setMonth] = useState(monthValue());
  const [form, setForm] = useState({ category: '', monthlyLimit: '', month: monthValue() });
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async (selectedMonth = month) => {
    try {
      const [budgetsRes, statusRes] = await Promise.all([
        api.get('/api/budgets'),
        api.get(`/api/budgets/status?month=${selectedMonth}`),
      ]);
      setBudgets(budgetsRes.data || []);
      setStatus(statusRes.data?.status || []);
    } catch (error) {
      setMessage('Could not load budget data right now.');
    }
  }, [month]);

  useEffect(() => {
    fetchData(month);
  }, [fetchData, month]);

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/budgets', {
        category: form.category,
        monthlyLimit: Number(form.monthlyLimit),
        month: form.month,
      });
      setForm({ category: '', monthlyLimit: '', month: monthValue() });
      setMessage('Budget saved.');
      fetchData(form.month);
    } catch (error) {
      setMessage('Please enter a valid budget limit and category.');
    }
  };

  const summary = useMemo(() => {
    const totalLimit = budgets.reduce((sum, item) => sum + Number(item.monthlyLimit || 0), 0);
    const totalSpent = status.reduce((sum, item) => sum + Number(item.spent || 0), 0);
    return { totalLimit, totalSpent, remaining: totalLimit - totalSpent };
  }, [budgets, status]);

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h2>Budgets</h2>
      <p style={{ color: '#cbd5e1' }}>Track monthly caps by category and compare them with actual spend.</p>
      {message ? <p style={{ color: '#93c5fd' }}>{message}</p> : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        <article style={cardStyle}><strong>Total limit</strong><div style={bigText}>₹{summary.totalLimit.toFixed(2)}</div></article>
        <article style={cardStyle}><strong>Total spent</strong><div style={bigText}>₹{summary.totalSpent.toFixed(2)}</div></article>
        <article style={cardStyle}><strong>Remaining</strong><div style={bigText}>₹{summary.remaining.toFixed(2)}</div></article>
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <section style={panelStyle}>
          <h3>Create budget</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gap: 12 }}>
            <input style={inputStyle} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input style={inputStyle} type="number" min="0" step="0.01" placeholder="Monthly limit" value={form.monthlyLimit} onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })} />
            <input style={inputStyle} type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} />
            <button type="submit" style={buttonStyle}>Save budget</button>
          </form>
        </section>

        <section style={panelStyle}>
          <h3>Month</h3>
          <input style={inputStyle} type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          {status.map((item) => (
            <div key={item._id} style={itemCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <strong>{item.category}</strong>
                <span style={{ color: item.status === 'over' ? '#fca5a5' : '#86efac' }}>{item.status.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>Spent ₹{item.spent.toFixed(2)} of ₹{item.monthlyLimit.toFixed(2)}</div>
              <div style={meterStyle}><span style={{ ...fillStyle, width: `${Math.min(item.percentUsed, 100)}%` }} /></div>
              <div style={{ fontSize: 13, color: '#bfdbfe' }}>Remaining ₹{item.remaining.toFixed(2)}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

const cardStyle = { background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #334155', borderRadius: 18, padding: 16 };
const bigText = { fontSize: 28, fontWeight: 700, marginTop: 6 };
const panelStyle = { background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #334155', borderRadius: 18, padding: 18 };
const inputStyle = { borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff', padding: '10px 12px' };
const buttonStyle = { borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)', color: '#fff', padding: '10px 12px', cursor: 'pointer' };
const itemCardStyle = { marginTop: 12, background: 'rgba(15,23,42,0.7)', border: '1px solid #334155', borderRadius: 14, padding: 12 };
const meterStyle = { height: 8, background: '#1f2937', borderRadius: 999, overflow: 'hidden', marginTop: 8 };
const fillStyle = { display: 'block', height: '100%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)' };
