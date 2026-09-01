const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  quizType: { type: String, enum: ['Weekly Quiz', 'Mid-Term Exam', 'Final Exam', 'Practical', 'Oral'], default: 'Weekly Quiz' },
  duration: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  maxScore: { type: Number, default: 100 },
  passingMark: { type: Number, default: 50 },
  maxAttempts: { type: Number, default: 1 },
  randomQuestions: { type: Boolean, default: false },
  published: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
