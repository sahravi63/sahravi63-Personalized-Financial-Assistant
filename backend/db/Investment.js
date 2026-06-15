const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true },
  investedAmount: { type: Number, required: true, min: 0 },
  currentValue: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  notes: { type: String, default: '', trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
