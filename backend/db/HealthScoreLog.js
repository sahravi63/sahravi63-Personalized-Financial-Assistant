const mongoose = require('mongoose');

const healthScoreLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  breakdown: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('HealthScoreLog', healthScoreLogSchema);
