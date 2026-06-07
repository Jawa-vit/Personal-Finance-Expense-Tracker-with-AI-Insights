const express = require('express');
const { protect } = require('../middleware/auth');
const Budget = require('../models/Budget');

const router = express.Router();
router.use(protect);

// GET /api/budgets?month=5&year=2025
router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    const budget = await Budget.findOne({ user: req.user._id, month: parseInt(month), year: parseInt(year) });
    res.json({ budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets  (upsert — create or update)
router.post('/', async (req, res) => {
  try {
    const { month, year, categories } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month, year },
      { categories },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ budget });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
