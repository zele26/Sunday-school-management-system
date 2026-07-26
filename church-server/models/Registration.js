const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationNumber: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  dateOfBirth: { type: String },
  phone: { type: String, required: true },                  // now required
  grade: { type: String, required: true },
  address: { type: String },
  parentName: { type: String },
  parentPhone: { type: String },
  parentEmail: { type: String },
  email: { type: String, lowercase: true },                 // optional
  password: { type: String, required: true },
  studentType: { type: String, enum: ['regular', 'distance'], required: true },
  transactionRef: { type: String },
  receiptUrl: { type: String },
  status: {
    type: String,
    enum: ['Pending Payment', 'Pending Verification', 'Approved', 'Rejected'],
    default: 'Pending Payment',
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  studentId: { type: String },   // will be set after approval
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);