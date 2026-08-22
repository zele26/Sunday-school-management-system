const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  studentNumber: { type: String, unique: true, required: true },  // official Student ID (e.g., TKR-... / TKD-...)
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);