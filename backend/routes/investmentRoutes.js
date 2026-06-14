const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const InvestmentProfile = require('../db/InvestmentProfile');
const Goal = require('../db/Goal');
const { getAIResponse } = require('../services/aiService');

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
