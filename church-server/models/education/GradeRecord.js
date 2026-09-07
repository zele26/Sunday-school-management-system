const mongoose = require('mongoose');

const gradeRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', default: null },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignmentScore: { type: Number, default: 0, min: 0, max: 100 },
  quizScore: { type: Number, default: 0, min: 0, max: 100 },
  midExamScore: { type: Number, default: 0, min: 0, max: 100 },
  finalExamScore: { type: Number, default: 0, min: 0, max: 100 },
  participationScore: { type: Number, default: 0, min: 0, max: 100 },
  attendanceScore: { type: Number, default: 0, min: 0, max: 100 },
  totalScore: { type: Number, default: 0, min: 0, max: 100 },
  average: { type: Number, default: 0, min: 0, max: 100 },
  letterGrade: { type: String, trim: true },
  passFail: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
  academicYear: { type: String, trim: true },
  semester: { type: String, enum: ['First', 'Second'], default: 'First' },
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
});

// Auto calculate total and pass status before saving if scores are updated
gradeRecordSchema.pre('save', function() {
  if (this.isModified('assignmentScore') || this.isModified('quizScore') || this.isModified('midExamScore') || this.isModified('finalExamScore') || this.isModified('attendanceScore') || this.isModified('participationScore')) {
    this.totalScore = Number((this.assignmentScore + this.quizScore + this.midExamScore + this.finalExamScore + this.attendanceScore + this.participationScore).toFixed(2));
    if (this.passFail === 'Pending' && this.totalScore > 0) {
      this.passFail = this.totalScore >= 50 ? 'Pass' : 'Fail';
    }
  }
});

gradeRecordSchema.index({ student: 1, course: 1, academicYear: 1, semester: 1 }, { unique: true });
gradeRecordSchema.index({ course: 1, academicYear: 1, semester: 1 });
gradeRecordSchema.index({ teacher: 1, course: 1 });
gradeRecordSchema.index({ student: 1, academicYear: 1 });

module.exports = mongoose.models.GradeRecord || mongoose.model('GradeRecord', gradeRecordSchema);
