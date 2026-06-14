const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Goal = require('../db/Goal');
const Budget = require('../db/Budget');
const Expense = require('../db/Expense');
const Income = require('../db/Income');
const HealthScoreLog = require('../db/HealthScoreLog');

router.get('/health-score', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const since = new Date();
    since.setMonth(since.getMonth() - 3);

    const [expenses, incomes, goals, budgets] = await Promise.all([
      Expense.find({ userId, date: { $gte: since } }),
      Income.find({ userId, date: { $gte: since } }),
      Goal.find({ userId }),
      Budget.find({ userId }),
    ]);

    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const savingsRatio = totalIncome > 0 ? (Math.max(totalIncome - totalExpenses, 0) / totalIncome) * 100 : 0;
    const monthlyExpenses = totalExpenses / 3;
    const emergencyFund = totalIncome - totalExpenses;
    const emergencyFundRatio = monthlyExpenses > 0 ? emergencyFund / (monthlyExpenses * 3) : 0;
    const budgetAdherence = budgets.length
      ? budgets.reduce((score, budget) => score + (budget.monthlyLimit > 0 ? Math.max(0, 1 - ((budget.monthlyLimit > 0 ? 0 : 0))) : 0), 0) / budgets.length
      : 0;

    const score = Math.min(100, Math.max(0,
      savingsRatio * 0.35 + Math.min(emergencyFundRatio * 100, 100) * 0.25 + budgetAdherence * 100 * 0.20 + (goals.length ? 20 : 0)
    ));

    const log = await HealthScoreLog.create({
      userId,
      score: Number(score.toFixed(1)),
      breakdown: { savingsRatio, emergencyFundRatio, budgetAdherence, monthlyExpenses, emergencyFund },
    });

    res.json({ score: Number(score.toFixed(1)), breakdown: log.breakdown, logId: log._id });
  } catch (error) {
    console.error('Health score route error:', error);
    res.status(500).json({ error: 'Failed to compute health score' });
  }
});

module.exports = router;
