const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const Investment = require('../db/Investment');
const InvestmentProfile = require('../db/InvestmentProfile');
const Goal = require('../db/Goal');
const { getAIResponse } = require('../services/aiService');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

router.get('/investments', authenticateToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

router.post('/investments',
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Investment name is required'),
  body('type').trim().notEmpty().withMessage('Asset type is required'),
  body('investedAmount').isFloat({ min: 0 }).withMessage('Invested amount must be a number'),
  body('currentValue').isFloat({ min: 0 }).withMessage('Current value must be a number'),
  body('date').isISO8601().withMessage('Date is required'),
  validate,
  async (req, res) => {
    try {
      const investment = await Investment.create({
        userId: req.user._id,
        name: req.body.name,
        type: req.body.type,
        investedAmount: Number(req.body.investedAmount),
        currentValue: Number(req.body.currentValue),
        date: new Date(req.body.date),
        notes: req.body.notes || '',
      });
      res.status(201).json(investment);
    } catch (error) {
      console.error('Error creating investment:', error);
      res.status(500).json({ error: 'Failed to create investment' });
    }
  }
);

router.delete('/investments/:id',
  authenticateToken,
  param('id').isMongoId(),
  validate,
  async (req, res) => {
    try {
      const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
      if (!investment) return res.status(404).json({ error: 'Investment not found' });
      res.json({ message: 'Investment deleted successfully' });
    } catch (error) {
      console.error('Error deleting investment:', error);
      res.status(500).json({ error: 'Failed to delete investment' });
    }
  }
);

router.get('/investment-insights', authenticateToken, async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.user._id });
    const total = investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
    const invested = investments.reduce((sum, item) => sum + Number(item.investedAmount || 0), 0);
    const gain = total - invested;
    const gainPct = invested > 0 ? ((gain / invested) * 100).toFixed(1) : 0;

    const insight = investments.length === 0
      ? 'Add your first investment to get a portfolio insight.'
      : `Your portfolio is ${gain >= 0 ? 'up' : 'down'} ${Math.abs(gainPct)}% overall (${gain >= 0 ? '+' : ''}${gain.toLocaleString('en-IN')} ₹). Keep monitoring your highest-weight holdings.`;

    res.json({ insight });
  } catch (error) {
    console.error('Error fetching investment insight:', error);
    res.status(500).json({ error: 'Failed to fetch investment insight' });
  }
});

router.post('/investment/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await InvestmentProfile.create({
      userId: req.user._id,
      riskTolerance: req.body.riskTolerance || 'moderate',
      horizon: req.body.horizon || 12,
      availableFunds: req.body.availableFunds || 0,
    });

    const goals = await Goal.find({ userId: req.user._id });
    const ai = await getAIResponse(
      'You are a financial planner. Recommend a simple investment allocation mix for a user based on goals and risk profile.',
      `Risk tolerance: ${profile.riskTolerance}\nHorizon months: ${profile.horizon}\nAvailable funds: ${profile.availableFunds}\nGoals: ${goals.map((goal) => `${goal.name}:${goal.targetAmount}`).join(', ') || 'none'}`
    );

    res.json({ profile, recommendation: ai || 'A balanced allocation is a sensible starting point.' });
  } catch (error) {
    console.error('Investment route error:', error);
    res.status(500).json({ error: 'Failed to generate investment recommendation' });
  }
});

module.exports = router;
