const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  academicEnrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicEnrollment', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },   // reuse existing Course model
  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
  finalResult: { type: String, default: '' },
  mark: { type: Number, default: null },
  completionDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', courseEnrollmentSchema);