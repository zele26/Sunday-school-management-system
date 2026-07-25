const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationNumber: { type: String, unique: true, required: true },
  // Personal info
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  dateOfBirth: { type: String },
  grade: { type: String, required: true },
  address: { type: String },
  // Parent info
  parentName: { type: String },
  parentPhone: { type: String },
  parentEmail: { type: String },
  // Account info (stored temporarily – will be used to create the User later)
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },   // hashed
  // Payment info
  transactionRef: { type: String },
  receiptUrl: { type: String },                 // uploaded receipt path
  // Status
  status: {
    type: String,
    enum: ['Pending Payment', 'Pending Verification', 'Approved', 'Rejected'],
    default: 'Pending Payment',
  },
  // Admin action
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);