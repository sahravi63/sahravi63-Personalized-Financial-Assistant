const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Goal = require('../db/Goal');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/goals',
  authenticateToken,
  body('name').trim().notEmpty(),
  body('targetAmount').isFloat({ min: 0 }),
  body('currentAmount').optional().isFloat({ min: 0 }),
  body('targetDate').isISO8601(),
  body('category').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const goal = await Goal.create({
        userId: req.user._id,
        name: req.body.name,
        targetAmount: req.body.targetAmount,
        currentAmount: req.body.currentAmount || 0,
        targetDate: req.body.targetDate,
        category: req.body.category || 'General',
      });
      res.status(201).json(goal);
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Failed to create goal' });
    }
  }
);

router.put('/goals/:id',
  authenticateToken,
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('targetAmount').optional().isFloat({ min: 0 }),
  body('currentAmount').optional().isFloat({ min: 0 }),
  body('targetDate').optional().isISO8601(),
  body('category').optional().trim(),
  validate,
  async (req, res) => {
    try {
      const goal = await Goal.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!goal) return res.status(404).json({ error: 'Goal not found' });
      res.json(goal);
    } catch (error) {
      console.error('Error updating goal:', error);
      res.status(500).json({ error: 'Failed to update goal' });
    }
  }
);

router.delete('/goals/:id', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

router.get('/goals/:id/progress', authenticateToken, param('id').isMongoId(), validate, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const today = new Date();
    const monthsRemaining = Math.max(1, (goal.targetDate.getFullYear() - today.getFullYear()) * 12 + (goal.targetDate.getMonth() - today.getMonth()));
    const amountRemaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
    const requiredMonthlyContribution = amountRemaining / monthsRemaining;
    const progressPercent = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;

    res.json({
      goal,
      monthsRemaining,
      amountRemaining,
      requiredMonthlyContribution,
      progressPercent,
    });
  } catch (error) {
    console.error('Error computing goal progress:', error);
    res.status(500).json({ error: 'Failed to compute goal progress' });
  }
});

module.exports = router;
