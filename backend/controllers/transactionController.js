const Transaction = require('../models/Transaction');

// GET /api/transactions?month=5&year=2025&type=expense&category=Food
const getTransactions = async (req, res) => {
  try {
    const { month, year, type, category, limit = 100 } = req.query;
    const filter = { user: req.user._id };

    if (month !== undefined && year !== undefined) {
      const start = new Date(year, month, 1);
      const end = new Date(year, parseInt(month) + 1, 1);
      filter.date = { $gte: start, $lt: end };
    }
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/transactions
const createTransaction = async (req, res) => {
  try {
    const { type, amount, description, category, date, notes } = req.body;
    if (!type || !amount || !description || !category) {
      return res.status(400).json({ error: 'type, amount, description, and category are required.' });
    }
    const txn = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      description,
      category,
      date: date || new Date(),
      notes,
    });
    res.status(201).json({ transaction: txn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!txn) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ transaction: txn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res) => {
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ error: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/summary?month=5&year=2025
// Returns totals + category breakdown for charts
const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month, 1);
    const end = new Date(year, parseInt(month) + 1, 1);

    const result = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Organise into a clean summary object
    const summary = { income: 0, expense: 0, byCategory: {} };
    result.forEach((r) => {
      const { type, category } = r._id;
      summary[type] = (summary[type] || 0) + r.total;
      if (!summary.byCategory[category]) summary.byCategory[category] = { income: 0, expense: 0, count: 0 };
      summary.byCategory[category][type] += r.total;
      summary.byCategory[category].count += r.count;
    });
    summary.savings = summary.income - summary.expense;
    summary.savingsRate = summary.income > 0 ? Math.round((summary.savings / summary.income) * 100) : 0;

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/transactions/trend?months=6
// Returns last N months income vs expense for trend chart
const getTrend = async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const result = await Transaction.aggregate([
      { $match: { user: req.user._id, date: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ trend: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction, getMonthlySummary, getTrend };
