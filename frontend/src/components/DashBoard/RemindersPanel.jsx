import React, { useState } from 'react';

const INITIAL_REMINDERS = [
  { id: 1, text: 'Pay credit card bill', due: 'Jun 15', done: false, priority: 'high' },
  { id: 2, text: 'Review monthly budget', due: 'Jun 30', done: false, priority: 'med' },
  { id: 3, text: 'Renew subscription', due: 'Jul 2', done: false, priority: 'low' },
  { id: 4, text: 'File tax returns', due: 'Jul 31', done: false, priority: 'high' },
];

const priorityColor = { high: '#f87171', med: '#fbbf24', low: '#4ade80' };

const RemindersPanel = () => {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [newText, setNewText] = useState('');

  const toggle = (id) => {
    setReminders((items) => items.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    )));
  };

  const dismiss = (id) => {
    setReminders((items) => items.filter((item) => item.id !== id));
  };

  const add = () => {
    const text = newText.trim();
    if (!text) return;
    setReminders((items) => [
      ...items,
      { id: Date.now(), text, due: 'TBD', done: false, priority: 'med' },
    ]);
    setNewText('');
  };

  return (
    <section className="side-card glass">
      <h3 className="side-card-title">Reminders</h3>
      <div className="reminder-list">
        {reminders.map((reminder) => (
          <article key={reminder.id} className={`reminder-item ${reminder.done ? 'reminder-done' : ''}`}>
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
              <button type="button" onClick={() => toggle(reminder.id)} className="rem-btn">
                {reminder.done ? 'Undo' : 'Done'}
              </button>
              <button type="button" onClick={() => dismiss(reminder.id)} className="rem-btn rem-btn--del">
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
