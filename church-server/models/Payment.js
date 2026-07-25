const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  contributionAmount: { type: Number, required: true },
  resourceFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  instructions: { type: String },         // any extra text
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);