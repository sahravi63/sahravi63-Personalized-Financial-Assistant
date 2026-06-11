const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Expense = require('../db/Expense');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /api/expenses
router.post('/expenses',
  authenticateToken,
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('category').optional().trim(),
  body('paymentMethod').optional().trim(),
  body('paymentProvider').optional().trim(),
  body('upiId').optional().trim(),
  body('cardLast4').optional().trim(),
  body('cardHolder').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const { description, amount, category, date, paymentMethod, paymentProvider, upiId, cardLast4, cardHolder } = req.body;
      const expense = await Expense.create({
        userId: req.user._id,
        description,
        amount,
        category: category || 'General',
        paymentMethod,
        paymentProvider,
        upiId,
        cardLast4,
        cardHolder,
        date: date ? new Date(date) : undefined,
      });
      res.status(201).json(expense);
    } catch (error) {
      console.error('Error adding expense:', error);
      res.status(500).json({ error: 'Failed to add expense' });
    }
  }
);

// GET /api/expenses
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// PUT /api/expenses/:id
router.put('/expenses/:id',
  authenticateToken,
  param('id').isMongoId(),
  body('description').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('category').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!expense) return res.status(404).json({ error: 'Expense not found' });
      res.status(200).json(expense);
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    }
  }
);

// DELETE /api/expenses/:id
router.delete('/expenses/:id',
  authenticateToken,
  param('id').isMongoId(),
  validate,
  async (req, res) => {
    try {
      const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!expense) return res.status(404).json({ error: 'Expense not found' });
      res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({ error: 'Failed to delete expense' });
    }
  }
);

module.exports = router;
