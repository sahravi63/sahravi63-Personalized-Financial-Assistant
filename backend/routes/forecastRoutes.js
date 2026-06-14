const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Expense = require('../db/Expense');
const Income = require('../db/Income');
const { getAIResponse } = require('../services/aiService');

router.get('/forecast', authenticateToken, async (req, res) => {
  try {
    const since = new Date();
    since.setMonth(since.getMonth() - 6);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId: req.user._id, date: { $gte: since } }).sort({ date: 1 }),
      Income.find({ userId: req.user._id, date: { $gte: since } }).sort({ date: 1 }),
    ]);

    const monthlyExpenseTotals = [];
    const monthlyIncomeTotals = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    expenses.forEach((item) => {
      const key = `${item.date.getFullYear()}-${item.date.getMonth()}`;
      monthlyExpenseTotals[key] = (monthlyExpenseTotals[key] || 0) + item.amount;
    });
    incomes.forEach((item) => {
      const key = `${item.date.getFullYear()}-${item.date.getMonth()}`;
      monthlyIncomeTotals[key] = (monthlyIncomeTotals[key] || 0) + item.amount;
    });

    const forecast = {
      expenseTrend: Object.entries(monthlyExpenseTotals).slice(-3).map(([key, value]) => ({ month: monthNames[Number(key.split('-')[1])], value })),
      incomeTrend: Object.entries(monthlyIncomeTotals).slice(-3).map(([key, value]) => ({ month: monthNames[Number(key.split('-')[1])], value })),
    };

    const aiText = await getAIResponse('Explain a simple forecast in plain language.', `Expense trend: ${JSON.stringify(forecast.expenseTrend)}\nIncome trend: ${JSON.stringify(forecast.incomeTrend)}`);

    res.json({ forecast, explanation: aiText || 'Your spending trend appears stable enough for a simple budget review.' });
  } catch (error) {
    console.error('Forecast route error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

module.exports = router;
