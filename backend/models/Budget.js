const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true }, // 0-11 (JS month)
    year: { type: Number, required: true },
    categories: [
      {
        name: { type: String, required: true },
        limit: { type: Number, required: true, min: 0 },
      },
    ],
  },
  { timestamps: true }
);

// One budget doc per user per month
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
