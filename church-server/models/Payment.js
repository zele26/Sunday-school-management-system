const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  contributionAmount: { type: Number, required: true, min: 0 },
  resourceFee: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'ETB', uppercase: true, trim: true },
  instructions: { type: String, trim: true },         // any extra text
  instructionsAmharic: { type: String, trim: true },
  bankAccounts: [{
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    accountHolder: { type: String, trim: true },
  }],
  telebirrNumber: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
});

// Index for active fee structure lookup
paymentSchema.index({ isActive: 1 });

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);