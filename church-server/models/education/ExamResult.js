const mongoose = require('mongoose');

// Sub-schema for student question answers
const answerItemSubSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedAnswer: { type: String, trim: true },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0, min: 0 },
}, { _id: false });

const examResultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', default: null },
  answers: [answerItemSubSchema],
  totalScore: { type: Number, default: 0, min: 0 },
  submittedAt: { type: Date, default: Date.now },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // if manually graded
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

// Indexes for student quiz submissions & teacher grading
examResultSchema.index({ quiz: 1, student: 1 });
examResultSchema.index({ student: 1, submittedAt: -1 });

module.exports = mongoose.models.ExamResult || mongoose.model('ExamResult', examResultSchema);
