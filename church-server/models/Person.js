const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  dateOfBirth: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, lowercase: true, default: '' },
  address: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes for duplicate prevention
personSchema.index({ phone: 1 }, { unique: true, sparse: true });
personSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Person || mongoose.model('Person', personSchema);