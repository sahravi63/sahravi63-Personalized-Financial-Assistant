const mongoose = require('mongoose');

/**
 * Standalone Expense document — previously an embedded subdocument on User.
 * Indexed on userId + date for efficient per-user queries and chart aggregation.
 */
const expenseSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  description:     { type: String, required: true, trim: true },
  amount:          { type: Number, required: true, min: 0 },
  category:        { type: String, default: 'General', trim: true },
  paymentMethod:   { type: String, trim: true },
  paymentProvider: { type: String, trim: true },
  upiId:           { type: String, trim: true },
  cardLast4:       { type: String, trim: true },
  cardHolder:      { type: String, trim: true },
  date:            { type: Date, default: Date.now, index: true },
}, { timestamps: true });

// Compound index for fast per-user date-range queries (charts, summary)
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
