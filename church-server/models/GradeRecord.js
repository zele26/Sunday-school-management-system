const mongoose = require('mongoose');

const gradeRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentScore: { type: Number, default: 0 },
  quizScore: { type: Number, default: 0 },
  midExamScore: { type: Number, default: 0 },
  finalExamScore: { type: Number, default: 0 },
  participationScore: { type: Number, default: 0 },
  attendanceScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  letterGrade: { type: String },
  passFail: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
  academicYear: { type: String },
  semester: { type: String, enum: ['First', 'Second'], default: 'First' },
  updatedAt: { type: Date, default: Date.now },
});

gradeRecordSchema.index({ student: 1, course: 1, academicYear: 1, semester: 1 }, { unique: true });

module.exports = mongoose.models.GradeRecord || mongoose.model('GradeRecord', gradeRecordSchema);
