const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  category: { type: String, required: true },
  description: { type: String },
  currency: { type: String, default: 'HKD' },
  recurring: { type: Boolean, default: false },
  recurrence: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly', 'yearly', 'custom'], required: false },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
