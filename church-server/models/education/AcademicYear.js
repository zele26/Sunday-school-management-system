const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },   // e.g., "2017 ዓ.ም"
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'archived', 'completed'], default: 'active' },
  description: { type: String, trim: true },
}, { timestamps: true });

// Index for active academic year lookup
academicYearSchema.index({ status: 1 });

module.exports = mongoose.models.AcademicYear || mongoose.model('AcademicYear', academicYearSchema);