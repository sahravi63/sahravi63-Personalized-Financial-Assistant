import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chat-widget-history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-widget-history', JSON.stringify(history));
  }, [history]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    const nextHistory = [...history, { role: 'user', content: message.trim() }];
    setHistory(nextHistory);
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', { message: message.trim(), history: nextHistory });
      setHistory([...nextHistory, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setHistory([...nextHistory, { role: 'assistant', content: 'I could not answer right now. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const bubbleStyle = useMemo(() => ({
    position: 'fixed', right: 12, bottom: 12, width: 'min(340px, calc(100vw - 24px))', maxHeight: 'calc(100vh - 24px)', overflow: 'hidden', borderRadius: 8, background: 'linear-gradient(145deg, #111827, #1f2937)', border: '1px solid #334155', color: '#fff', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.45)', zIndex: 1000,
  }), []);

  return (
    <div style={bubbleStyle}>
      <button type="button" onClick={() => setOpen((prev) => !prev)} style={{ width: '100%', minHeight: 44, border: 'none', background: 'linear-gradient(135deg, #60a5fa, #8b5cf6)', color: '#fff', padding: 12, borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
        {open ? 'Close finance chat' : 'Open finance chat'}
      </button>
      {open && (
        <div style={{ padding: 12 }}>
          <div style={{ maxHeight: 'min(260px, 48vh)', overflowY: 'auto', display: 'grid', gap: 8, marginBottom: 8 }}>
            {history.length === 0 && <p style={{ color: '#cbd5e1', fontSize: 13 }}>Ask about savings, budgets, or goals.</p>}
            {history.map((item, index) => (
              <div key={`${item.role}-${index}`} style={{ padding: '8px 10px', borderRadius: 12, background: item.role === 'assistant' ? '#172554' : '#111827', border: '1px solid #334155', fontSize: 13, whiteSpace: 'pre-wrap' }}>
                <strong>{item.role === 'assistant' ? 'Advisor' : 'You'}:</strong> {item.content}
              </div>
            ))}
            {loading && <div style={{ color: '#bfdbfe', fontSize: 13 }}>Thinking…</div>}
          </div>
          <form onSubmit={sendMessage} style={{ display: 'grid', gap: 8 }}>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask a finance question" style={{ width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#fff', padding: '10px 12px' }} />
            <button type="submit" disabled={loading} style={{ minHeight: 44, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #34d399, #22d3ee)', color: '#0f172a', padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
