const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Budget = require('../db/Budget');
const Expense = require('../db/Expense');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/budgets', authenticateToken, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ month: 1, category: 1 });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

router.post('/budgets',
  authenticateToken,
  body('category').trim().notEmpty(),
  body('monthlyLimit').isFloat({ min: 0 }),
  body('month').trim().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const budget = await Budget.create({
        userId: req.user._id,
        category: req.body.category,
        monthlyLimit: req.body.monthlyLimit,
        month: req.body.month,
      });
      res.status(201).json(budget);
    } catch (error) {
      console.error('Error creating budget:', error);
      res.status(500).json({ error: 'Failed to create budget' });
    }
  }
);

router.put('/budgets/:id',
  authenticateToken,
  param('id').isMongoId(),
  body('category').optional().trim().notEmpty(),
  body('monthlyLimit').optional().isFloat({ min: 0 }),
  body('month').optional().trim().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!budget) return res.status(404).json({ error: 'Budget not found' });
      res.json(budget);
    } catch (error) {
      console.error('Error updating budget:', error);
      res.status(500).json({ error: 'Failed to update budget' });
    }
  }
);

router.delete('/budgets/:id', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

router.get('/budgets/status', authenticateToken, async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const [budgets, expenses] = await Promise.all([
      Budget.find({ userId: req.user._id, month }),
      Expense.find({ userId: req.user._id, date: { $gte: start, $lt: end } }),
    ]);

    const totals = expenses.reduce((acc, item) => {
      const key = item.category || 'General';
      acc[key] = (acc[key] || 0) + item.amount;
      return acc;
    }, {});

    const status = budgets.map((budget) => {
      const spent = totals[budget.category] || 0;
      const remaining = budget.monthlyLimit - spent;
      const percentUsed = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
      return {
        _id: budget._id,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        spent,
        remaining,
        percentUsed,
        status: spent > budget.monthlyLimit ? 'over' : 'under',
      };
    });

    res.json({ month, status });
  } catch (error) {
    console.error('Error computing budget status:', error);
    res.status(500).json({ error: 'Failed to compute budget status' });
  }
});

module.exports = router;
