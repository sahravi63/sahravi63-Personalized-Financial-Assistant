const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { getAIResponse } = require('../services/aiService');

router.get('/stocks/:symbol', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY || '';
    if (!apiKey) {
      return res.json({ quote: null, summary: 'Stock API key not configured.' });
    }

    const quoteRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${req.params.symbol}&token=${apiKey}`);
    const quote = await quoteRes.json();
    const summary = await getAIResponse('Explain stock metrics in simple financial language.', `Symbol: ${req.params.symbol}\nCurrent price: ${quote.c}\nChange: ${quote.d}\nPercent change: ${quote.dp}`);

    res.json({ quote, summary: summary || 'Market summary unavailable.' });
  } catch (error) {
    console.error('Stock route error:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

module.exports = router;
