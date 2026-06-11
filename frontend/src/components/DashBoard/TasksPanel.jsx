import React, { useEffect, useState } from 'react';
import api from '../../api';

const TasksPanel = () => {
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/dashboard/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggle = async (id) => {
    const task = tasks.find((item) => item._id === id);
    if (!task) return;
    try {
      await api.put(`/api/dashboard/tasks/${id}`, { done: !task.done });
      await fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const add = async () => {
    const text = newText.trim();
    if (!text) return;
    try {
      await api.post('/api/dashboard/tasks', { text });
      setNewText('');
      await fetchTasks();
    } catch (error) {
      console.error('Failed to add task', error);
    }
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
          <label key={task._id} className="task-item">
            <input
              type="checkbox"
              checked={Boolean(task.done)}
              onChange={() => toggle(task._id)}
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
