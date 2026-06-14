const dotenv = require('dotenv');

dotenv.config();

async function getAIResponse(systemPrompt, userPrompt) {
  const provider = process.env.GROQ_API_KEY
    ? 'groq'
    : process.env.GEMINI_API_KEY
      ? 'gemini'
      : process.env.OPENAI_API_KEY
        ? 'openai'
        : process.env.ANTHROPIC_API_KEY
          ? 'anthropic'
          : null;

  if (!provider) {
    return '';
  }

  try {
    if (provider === 'groq') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || '';
    }

    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });

      const data = await response.json();
      return data?.content?.[0]?.text || '';
    }

    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
          }),
        }
      );

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  } catch (error) {
    console.warn('AI response generation failed:', error.message || error);
    return '';
  }
}

module.exports = { getAIResponse };
