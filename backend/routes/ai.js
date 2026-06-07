const express = require('express');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();
router.use(protect);

// POST /api/ai/insights
// Generates AI financial insights for the current month
router.post('/insights', async (req, res) => {
  try {
    const { month, year } = req.body;
    const start = new Date(year, month, 1);
    const end = new Date(year, parseInt(month) + 1, 1);

    const txns = await Transaction.find({ user: req.user._id, date: { $gte: start, $lt: end } });

    const income = txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const catMap = {};
    txns.filter((t) => t.type === 'expense').forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const prompt = `You are a personal finance advisor. Analyze this monthly financial data for a user.

Income: ₹${income} | Expenses: ₹${expense} | Savings: ₹${income - expense}
Savings rate: ${income > 0 ? Math.round(((income - expense) / income) * 100) : 0}%
Spending by category: ${Object.entries(catMap).map(([k, v]) => `${k}: ₹${v}`).join(', ')}

Return exactly 4 financial insights as a JSON array (no markdown, no backticks):
[{"icon":"emoji","title":"Short title","insight":"2 specific actionable sentences","type":"tip|warning|good|info"}]`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content.map((c) => c.text || '').join('');
    const insights = JSON.parse(text);
    res.json({ insights });
  } catch (err) {
    console.error('AI insights error:', err.message);
    res.status(500).json({ error: 'Failed to generate AI insights.' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { question, context } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content: `You are a helpful personal finance advisor. User's finances: ${JSON.stringify(context)}. Answer concisely in 2-3 sentences: ${question}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const answer = data.content.map((c) => c.text || '').join('');
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

module.exports = router;
