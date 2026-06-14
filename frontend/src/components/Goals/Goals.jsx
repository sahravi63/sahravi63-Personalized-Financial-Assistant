import React, { useEffect, useState } from 'react';
import api from '../../api';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [progress, setProgress] = useState({});
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '0', targetDate: '', category: 'General' });
  const [message, setMessage] = useState('');

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/api/goals');
      setGoals(data || []);
      const progressMap = {};
      for (const goal of data || []) {
        const res = await api.get(`/api/goals/${goal._id}/progress`);
        progressMap[goal._id] = res.data;
      }
      setProgress(progressMap);
    } catch (error) {
      setMessage('Could not load goals.');
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const createGoal = async (event) => {
    event.preventDefault();
    try {
      await api.post('/api/goals', {
        name: form.name,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        targetDate: form.targetDate,
        category: form.category,
      });
      setForm({ name: '', targetAmount: '', currentAmount: '0', targetDate: '', category: 'General' });
      setMessage('Goal saved.');
      fetchGoals();
    } catch (error) {
      setMessage('Please complete the goal details.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h2>Goals</h2>
      <p style={{ color: '#cbd5e1' }}>Create savings targets and see the monthly amount needed to stay on track.</p>
      {message ? <p style={{ color: '#bfdbfe' }}>{message}</p> : null}
      <div style={{ display: 'grid', gap: 18, gridTemplateColumns: '1fr 1fr' }}>
        <section style={panelStyle}>
          <h3>Add goal</h3>
          <form onSubmit={createGoal} style={{ display: 'grid', gap: 10 }}>
            <input style={inputStyle} placeholder="Goal name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input style={inputStyle} type="number" step="0.01" placeholder="Target amount" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
            <input style={inputStyle} type="number" step="0.01" placeholder="Current amount" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} />
            <input style={inputStyle} type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
            <input style={inputStyle} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <button style={buttonStyle} type="submit">Save goal</button>
          </form>
        </section>
        <section style={panelStyle}>
          <h3>Goal progress</h3>
          {goals.length === 0 ? <p style={{ color: '#cbd5e1' }}>Add a goal to see progress here.</p> : goals.map((goal) => {
            const item = progress[goal._id] || {};
            return <article key={goal._id} style={itemStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>{goal.name}</strong>
                <span style={{ color: '#86efac' }}>{(item.progressPercent || 0).toFixed(0)}%</span>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 13, marginBottom: 8 }}>{goal.category}</div>
              <div style={meter}><span style={{ ...fill, width: `${Math.min(item.progressPercent || 0, 100)}%` }} /></div>
              <div style={{ color: '#bfdbfe', fontSize: 13, marginTop: 8 }}>Required monthly contribution: ₹{(item.requiredMonthlyContribution || 0).toFixed(2)}</div>
            </article>;
          })}
        </section>
      </div>
    </div>
  );
}

const panelStyle = { background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #334155', borderRadius: 18, padding: 18 };
const inputStyle = { borderRadius: 10, border: '1px solid #334155', background: '#0f172a', color: '#fff', padding: '10px 12px' };
const buttonStyle = { borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)', color: '#fff', padding: '10px 12px', cursor: 'pointer', fontWeight: 700 };
const itemStyle = { background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #334155', borderRadius: 14, padding: 12, marginBottom: 10 };
const meter = { height: 8, background: '#1f2937', borderRadius: 999, overflow: 'hidden' };
const fill = { display: 'block', height: '100%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)' };
