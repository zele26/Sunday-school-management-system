const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  registrationNumber: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  educationLevel: { type: String, required: true },
  profession: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  dateOfBirth: { type: String },
  phone: { type: String, required: true },
  grade: { type: String, required: true },
  batch: { type: String, default: null },      // for distance students
  address: { type: String },

  // Emergency contact (new detailed fields)
  emergencyFirstName: { type: String, default: '' },
  emergencyMiddleName: { type: String, default: '' },
  emergencyLastName: { type: String, default: '' },
  relationship: {
    type: String,
    enum: ['Father', 'Mother', 'Brother', 'Sister', 'Relative'],
    default: 'Father',
  },
  emergencyPhone: { type: String, required: true },
  emergencyEmail: { type: String, default: '' },
  emergencyAddress: { type: String, default: '' },

  // Legacy parent fields (optional)
  parentName: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  parentEmail: { type: String, default: '' },

  email: { type: String, lowercase: true, default: '' },   // optional
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
  studentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
