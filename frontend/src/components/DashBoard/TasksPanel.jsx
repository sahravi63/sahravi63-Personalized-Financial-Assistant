import React, { useState } from 'react';

const INITIAL_TASKS = [
  { id: 1, text: 'Review Q2 budget report', done: true },
  { id: 2, text: 'Set up auto-pay for utilities', done: true },
  { id: 3, text: 'Transfer $500 to savings', done: false },
  { id: 4, text: 'Compare insurance quotes', done: false },
  { id: 5, text: 'Update emergency fund goal', done: false },
];

const TasksPanel = () => {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [newText, setNewText] = useState('');

  const toggle = (id) => {
    setTasks((items) => items.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    )));
  };

  const add = () => {
    const text = newText.trim();
    if (!text) return;
    setTasks((items) => [...items, { id: Date.now(), text, done: false }]);
    setNewText('');
  };

  const done = tasks.filter((task) => task.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <section className="side-card glass">
      <div className="tasks-header">
        <h3 className="side-card-title">Tasks</h3>
        <span className="tasks-count">{done}/{tasks.length}</span>
      </div>

      <div className="tasks-progress-bar">
        <div className="tasks-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="tasks-pct">{pct}% complete</p>

      <div className="tasks-list">
        {tasks.map((task) => (
          <label key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggle(task.id)}
              className="task-checkbox"
            />
            <span className={`task-text ${task.done ? 'task-text--done' : ''}`}>{task.text}</span>
          </label>
        ))}
      </div>

      <div className="reminder-add">
        <input
          placeholder="Add task"
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

export default TasksPanel;
