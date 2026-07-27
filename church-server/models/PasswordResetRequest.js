const mongoose = require('mongoose');

const passwordResetRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, trim: true },
    identifier: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    tempPasswordIssued: { type: String, trim: true },
    adminNote: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.PasswordResetRequest ||
  mongoose.model('PasswordResetRequest', passwordResetRequestSchema);
