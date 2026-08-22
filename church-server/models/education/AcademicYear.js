const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },   // e.g., "2026"
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema);