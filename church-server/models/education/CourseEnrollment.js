const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  academicEnrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicEnrollment', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile' }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile', default: null },
  status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
  finalResult: { type: String, default: '' },
  mark: { type: Number, default: null },
  completionDate: { type: Date, default: null },
}, { timestamps: true });

courseEnrollmentSchema.index({ academicEnrollmentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.models.CourseEnrollment || mongoose.model('CourseEnrollment', courseEnrollmentSchema);