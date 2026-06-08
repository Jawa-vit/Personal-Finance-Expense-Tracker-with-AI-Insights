const express = require('express');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { GoogleGenerativeAI } = require("@google/generative-ai");
console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    
    const result = await model.generateContent(prompt);
    
    const text = result.response.text();
    
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(
      `You are a helpful personal finance advisor. User's finances: ${JSON.stringify(
        context
      )}. Answer concisely in 2-3 sentences: ${question}`
    );
      
    const answer = result.response.text();
      
    res.json({ answer });

  } catch (err) {
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

module.exports = router;
