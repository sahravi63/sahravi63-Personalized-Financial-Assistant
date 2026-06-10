const mongoose = require('mongoose');

/**
 * Standalone Income document — previously an embedded subdocument on User.
 * Indexed on userId + date for efficient per-user queries and chart aggregation.
 */
const incomeSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description: { type: String, required: true, trim: true },
  amount:      { type: Number, required: true, min: 0 },
  category:    { type: String, default: 'General', trim: true },
  date:        { type: Date, default: Date.now, index: true },
}, { timestamps: true });

incomeSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);
