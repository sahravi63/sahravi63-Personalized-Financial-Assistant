const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Income = require('../db/Income');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /api/income
router.post('/income',
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
      const income = await Income.create({
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
      res.status(201).json(income);
    } catch (error) {
      console.error('Error adding income:', error);
      res.status(500).json({ error: 'Failed to add income' });
    }
  }
);

// GET /api/income
router.get('/income', authenticateToken, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(incomes);
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// PUT /api/income/:id
router.put('/income/:id',
  authenticateToken,
  param('id').isMongoId(),
  body('description').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ gt: 0 }),
  body('category').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const income = await Income.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!income) return res.status(404).json({ error: 'Income not found' });
      res.status(200).json(income);
    } catch (error) {
      console.error('Error updating income:', error);
      res.status(500).json({ error: 'Failed to update income' });
    }
  }
);

// DELETE /api/income/:id
router.delete('/income/:id',
  authenticateToken,
  param('id').isMongoId(),
  validate,
  async (req, res) => {
    try {
      const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!income) return res.status(404).json({ error: 'Income not found' });
      res.status(200).json({ message: 'Income deleted successfully' });
    } catch (error) {
      console.error('Error deleting income:', error);
      res.status(500).json({ error: 'Failed to delete income' });
    }
  }
);

module.exports = router;
