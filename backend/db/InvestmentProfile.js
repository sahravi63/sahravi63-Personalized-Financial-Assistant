const mongoose = require('mongoose');

const investmentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  riskTolerance: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
  horizon: { type: Number, default: 12, min: 1 },
  availableFunds: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('InvestmentProfile', investmentProfileSchema);
