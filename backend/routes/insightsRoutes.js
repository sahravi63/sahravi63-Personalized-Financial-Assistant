const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Expense = require('../db/Expense');
const Income = require('../db/Income');
const { getAIResponse } = require('../services/aiService');

const router = express.Router();

router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const since = new Date();
    since.setMonth(since.getMonth() - 3);

    const [expenses, incomes] = await Promise.all([
      Expense.find({ userId, date: { $gte: since } }),
      Income.find({ userId, date: { $gte: since } }),
    ]);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const savings = totalIncome - totalExpenses;
    const spendRatio = totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : '0.0';

    const categoryTotals = expenses.reduce((totals, expense) => {
      const category = expense.category || 'General';
      totals[category] = (totals[category] || 0) + expense.amount;
      return totals;
    }, {});

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategoryText = topCategory
      ? `${topCategory[0]} at $${topCategory[1].toFixed(2)}`
      : 'no expenses recorded';

    const fallbackInsight = [
      `Over the last 3 months you spent ${spendRatio}% of your income.`,
      savings >= 0
        ? `You saved $${savings.toFixed(2)} during this period. Keep protecting that gap.`
        : `Your expenses exceeded income by $${Math.abs(savings).toFixed(2)}. Review flexible categories first.`,
      `Top spending category: ${topCategoryText}.`,
    ].join('\n');

    const aiPrompt = `You are a concise financial advisor. Analyze the user's recent spending and income summary. Return a short, practical insight in plain English. Do not mention you are an AI.\n\nInputs:\n- totalExpenses: ${totalExpenses.toFixed(2)}\n- totalIncome: ${totalIncome.toFixed(2)}\n- savings: ${savings.toFixed(2)}\n- spendRatio: ${spendRatio}%\n- topCategory: ${topCategoryText}\n- categories: ${JSON.stringify(categoryTotals)}`;

    let insight = fallbackInsight;
    try {
      const aiText = await getAIResponse(
        'You are a helpful personal finance advisor for a student budget app.',
        aiPrompt
      );

      const cleaned = (aiText || '').replace(/```json|```/g, '').trim();
      if (cleaned) {
        const parsed = (() => {
          try {
            return JSON.parse(cleaned);
          } catch (error) {
            return null;
          }
        })();

        if (parsed && typeof parsed === 'object') {
          const recommendations = Array.isArray(parsed.recommendations) && parsed.recommendations.length
            ? parsed.recommendations.join(' ')
            : '';
          insight = [parsed.insight || parsed.summary || fallbackInsight, recommendations].filter(Boolean).join('\n');
        } else if (cleaned) {
          insight = cleaned;
        }
      }
    } catch (aiError) {
      console.warn('AI insights unavailable, using fallback insight:', aiError.message || aiError);
    }

    res.json({ insight });
  } catch (err) {
    console.error('Error generating insights:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

module.exports = router;
