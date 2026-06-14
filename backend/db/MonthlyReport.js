const mongoose = require('mongoose');

const monthlyReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true, trim: true },
  summary: { type: Object, default: {} },
  narrative: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('MonthlyReport', monthlyReportSchema);
