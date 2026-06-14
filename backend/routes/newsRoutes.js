const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const { getAIResponse } = require('../services/aiService');

router.get('/news', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY || '';
    if (!apiKey) {
      return res.json({ articles: [], summary: 'News API key not configured.' });
    }

    const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`);
    const data = await response.json();
    const articles = (data.articles || []).slice(0, 5);

    const summary = articles.length
      ? await getAIResponse('Summarize financial news briefly for a finance app user.', articles.map((article) => `${article.title}: ${article.description || ''}`).join('\n\n'))
      : 'No top stories available.';

    res.json({ articles, summary: summary || 'Summary unavailable.' });
  } catch (error) {
    console.error('News route error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
