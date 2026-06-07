const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, default: '' },
    // For future OCR bill scanning feature
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index for fast user+date queries (used in monthly reports)
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
