const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Task = require('../db/Task');
const Reminder = require('../db/Reminder');
const Notification = require('../db/Notification');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/dashboard/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/dashboard/tasks', authenticateToken, body('text').trim().notEmpty(), validate, async (req, res) => {
  try {
    const task = await Task.create({ userId: req.user._id, text: req.body.text, done: false });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add task' });
  }
});

router.put('/dashboard/tasks/:id', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/dashboard/tasks/:id', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

router.get('/dashboard/reminders', authenticateToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

router.post('/dashboard/reminders', authenticateToken, body('text').trim().notEmpty(), validate, async (req, res) => {
  try {
    const reminder = await Reminder.create({
      userId: req.user._id,
      text: req.body.text,
      due: req.body.due || 'TBD',
      done: false,
      priority: req.body.priority || 'med',
    });
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add reminder' });
  }
});

router.put('/dashboard/reminders/:id', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

router.delete('/dashboard/reminders/:id', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

router.get('/dashboard/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/dashboard/notifications', authenticateToken, body('title').trim().notEmpty(), body('message').trim().notEmpty(), validate, async (req, res) => {
  try {
    const notification = await Notification.create({
      userId: req.user._id,
      title: req.body.title,
      message: req.body.message,
      status: req.body.status || 'Pending',
      timeLabel: req.body.timeLabel || 'Just now',
      avatar: req.body.avatar || 'NT',
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add notification' });
  }
});

module.exports = router;
