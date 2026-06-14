import React, { useState } from 'react';
import api from '../../api';

export default function Investment() {
  const [form, setForm] = useState({ riskTolerance: 'moderate', horizon: 12, availableFunds: 10000 });
  const [recommendation, setRecommendation] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post('/api/investment/profile', form);
      setRecommendation(data.recommendation || '');
    } catch (error) {
      setRecommendation('Unable to generate a recommendation right now.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h2>Investment Recommendations</h2>
      <p style={{ color: '#cbd5e1' }}>Answer a quick risk profile to get a starter allocation suggestion.</p>
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr 1fr' }}>
        <section style={panelStyle}>
          <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <label style={labelStyle}>Risk tolerance
              <select style={inputStyle} value={form.riskTolerance} onChange={(e) => setForm({ ...form, riskTolerance: e.target.value })}><option value="low">Low</option><option value="moderate">Moderate</option><option value="high">High</option></select>
            </label>
            <label style={labelStyle}>Horizon (months)
              <input style={inputStyle} type="number" value={form.horizon} onChange={(e) => setForm({ ...form, horizon: Number(e.target.value) })} />
            </label>
            <label style={labelStyle}>Available funds
              <input style={inputStyle} type="number" value={form.availableFunds} onChange={(e) => setForm({ ...form, availableFunds: Number(e.target.value) })} />
            </label>
            <button style={buttonStyle} type="submit">Generate recommendation</button>
          </form>
        </section>
        <section style={panelStyle}>
          <h3>Recommendation</h3>
          <p style={{ color: '#e5eefb', whiteSpace: 'pre-wrap' }}>{recommendation || 'Complete the form to see an AI-assisted allocation suggestion.'}</p>
        </section>
      </div>
    </div>
  );
}

const panelStyle = { background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #334155', borderRadius: 18, padding: 18 };
const labelStyle = { display: 'grid', gap: 6, color: '#bfdbfe', fontSize: 13 };
const inputStyle = { borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff', padding: '10px 12px' };
const buttonStyle = { borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)', color: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 700 };
