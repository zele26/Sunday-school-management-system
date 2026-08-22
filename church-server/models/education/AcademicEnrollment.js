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

module.exports = mongoose.models.AcademicEnrollment || mongoose.model('AcademicEnrollment', academicEnrollmentSchema);