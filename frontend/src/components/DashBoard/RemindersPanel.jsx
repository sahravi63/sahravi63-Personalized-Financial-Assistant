import React, { useEffect, useState } from 'react';
import api from '../../api';

const priorityColor = { high: '#f87171', med: '#fbbf24', low: '#4ade80' };

const RemindersPanel = () => {
  const [reminders, setReminders] = useState([]);
  const [newText, setNewText] = useState('');

  const fetchReminders = async () => {
    try {
      const { data } = await api.get('/api/dashboard/reminders');
      setReminders(data);
    } catch (error) {
      console.error('Failed to fetch reminders', error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const toggle = async (id) => {
    const reminder = reminders.find((item) => item._id === id);
    if (!reminder) return;
    try {
      await api.put(`/api/dashboard/reminders/${id}`, { done: !reminder.done });
      await fetchReminders();
    } catch (error) {
      console.error('Failed to update reminder', error);
    }
  };

  const dismiss = async (id) => {
    try {
      await api.delete(`/api/dashboard/reminders/${id}`);
      await fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder', error);
    }
  };

  const add = async () => {
    const text = newText.trim();
    if (!text) return;
    try {
      await api.post('/api/dashboard/reminders', { text });
      setNewText('');
      await fetchReminders();
    } catch (error) {
      console.error('Failed to add reminder', error);
    }
  };

  return (
    <section className="side-card glass">
      <h3 className="side-card-title">Reminders</h3>
      <div className="reminder-list">
        {reminders.map((reminder) => (
          <article key={reminder._id} className={`reminder-item ${reminder.done ? 'reminder-done' : ''}`}>
            <div className="reminder-left">
              <span
                className="reminder-dot"
                style={{ background: priorityColor[reminder.priority] }}
              />
              <div>
                <p className="reminder-text">{reminder.text}</p>
                <p className="reminder-due">Due {reminder.due}</p>
              </div>
            </div>
            <div className="reminder-actions">
              <button type="button" onClick={() => toggle(reminder._id)} className="rem-btn">
                {reminder.done ? 'Undo' : 'Done'}
              </button>
              <button type="button" onClick={() => dismiss(reminder._id)} className="rem-btn rem-btn--del">
                x
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="reminder-add">
        <input
          placeholder="Add reminder"
          value={newText}
          onChange={(event) => setNewText(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && add()}
          className="reminder-input glass"
        />
        <button type="button" onClick={add} className="rem-add-btn">+</button>
      </div>
    </section>
  );
};

export default RemindersPanel;
