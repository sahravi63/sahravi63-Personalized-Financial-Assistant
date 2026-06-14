const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Expense = require('../db/Expense');
const Income = require('../db/Income');
const Goal = require('../db/Goal');
const Budget = require('../db/Budget');
const { getAIResponse } = require('../services/aiService');

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { message, history = [] } = req.body;

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
    const savings = totalIncome - totalExpenses;

    const systemPrompt = `You are a personal finance assistant in a budgeting app. Use the user's recent finances and goals to answer clearly and briefly. If you are unsure, suggest simple next steps.\n\nContext:\n- 3-month expenses: ${totalExpenses.toFixed(2)}\n- 3-month income: ${totalIncome.toFixed(2)}\n- savings gap: ${savings.toFixed(2)}\n- goals: ${goals.map((g) => `${g.name} (${g.currentAmount}/${g.targetAmount})`).join(', ') || 'none'}\n- budgets: ${budgets.map((b) => `${b.category}:${b.monthlyLimit}`).join(', ') || 'none'}`;

    const historyText = history.map((item) => `${item.role}: ${item.content}`).join('\n');
    const aiText = await getAIResponse(systemPrompt, `Conversation history:\n${historyText}\n\nUser question:\n${message}`);

    const answer = (aiText || '').trim() || 'I can help with that. Start by reviewing your recent spending and savings targets.';

    res.json({ answer, context: { totalExpenses, totalIncome, savings } });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate chatbot response' });
  }
});

module.exports = router;
