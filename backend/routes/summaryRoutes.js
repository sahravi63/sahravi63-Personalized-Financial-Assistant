const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Expense = require('../db/Expense');
const Income = require('../db/Income');

/**
 * GET /api/summary
 * Returns monthly totals for the last N months (default 6), plus
 * per-category breakdowns. Used to power the dashboard chart with
 * REAL data instead of hardcoded arrays.
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 6, 24);
    const since = new Date();
    since.setMonth(since.getMonth() - months + 1);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const userId = req.user._id;

    // Aggregate expenses by month
    const expenseByMonth = await Expense.aggregate([
      { $match: { userId, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Aggregate incomes by month
    const incomeByMonth = await Income.aggregate([
      { $match: { userId, date: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Aggregate expenses by category
    const expenseByCategory = await Expense.aggregate([
      { $match: { userId, date: { $gte: since } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    // Build label array for the last N months
    const labels = [];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 0; i < months; i++) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);
    }

    const toMap = (rows) => {
      const m = {};
      rows.forEach(r => { m[`${r._id.year}-${r._id.month}`] = r.total; });
      return m;
    };

    const expMap = toMap(expenseByMonth);
    const incMap = toMap(incomeByMonth);

    const expenseTotals = [];
    const incomeTotals  = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(since);
      d.setMonth(since.getMonth() + i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      expenseTotals.push(expMap[key] || 0);
      incomeTotals.push(incMap[key]  || 0);
    }

    const totalExpenses = expenseTotals.reduce((a, b) => a + b, 0);
    const totalIncome   = incomeTotals.reduce((a, b) => a + b, 0);
    const gaugePercent  = totalIncome > 0
      ? Math.min(totalExpenses / totalIncome, 1)
      : 0;

    res.json({
      labels,
      expenseTotals,
      incomeTotals,
      expenseByCategory: expenseByCategory.map(c => ({ category: c._id, total: c.total })),
      totalExpenses,
      totalIncome,
      netSavings: totalIncome - totalExpenses,
      gaugePercent,
    });
  } catch (err) {
    console.error('Error building summary:', err);
    res.status(500).json({ error: 'Failed to build summary' });
  }
});


module.exports = router;
