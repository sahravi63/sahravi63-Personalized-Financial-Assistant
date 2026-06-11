const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String, required: true, trim: true },
  due: { type: String, default: 'TBD', trim: true },
  done: { type: Boolean, default: false },
  priority: { type: String, enum: ['high', 'med', 'low'], default: 'med' },
}, { timestamps: true });

reminderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Reminder', reminderSchema);
