const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  academicEnrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicEnrollment', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // New: multiple teachers per course
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Legacy single teacher (kept for backwards compatibility)
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
  finalResult: { type: String, default: '' },
  mark: { type: Number, default: null },
  completionDate: { type: Date, default: null },
}, { timestamps: true });

// Ensure uniqueness per enrollment + course
courseEnrollmentSchema.index({ academicEnrollmentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', courseEnrollmentSchema);