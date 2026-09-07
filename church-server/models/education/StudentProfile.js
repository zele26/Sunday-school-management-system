const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  studentNumber: { type: String, unique: true, required: true },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },
}, { timestamps: true });

// Core student lookup indexes
studentProfileSchema.index({ personId: 1 });
studentProfileSchema.index({ status: 1 });

module.exports = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema);