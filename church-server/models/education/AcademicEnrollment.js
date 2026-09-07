const mongoose = require('mongoose');

const academicEnrollmentSchema = new mongoose.Schema({
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  gradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Grade', default: null },
  academicTermId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicTerm', default: null },
  studyModeId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyMode', required: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', default: null },
  status: { type: String, enum: ['active', 'completed', 'dropped', 'paused'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  completionStatus: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

// Prevent duplicate annual enrollments & optimize class rosters
academicEnrollmentSchema.index({ studentProfileId: 1, academicYearId: 1, programId: 1 }, { unique: true });
academicEnrollmentSchema.index({ programId: 1, gradeId: 1, status: 1 });
academicEnrollmentSchema.index({ academicYearId: 1, status: 1 });

module.exports = mongoose.models.AcademicEnrollment || mongoose.model('AcademicEnrollment', academicEnrollmentSchema);