const mongoose = require('mongoose');

const academicTermSchema = new mongoose.Schema({
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  name: { type: String, required: true },   // e.g., "Semester 1"
  sequence: { type: Number, default: 1 },
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.models.AcademicTerm || mongoose.model('AcademicTerm', academicTermSchema);