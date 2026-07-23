const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: { type: String },        // student's answer
    isCorrect: { type: Boolean },
    pointsEarned: { type: Number },
  }],
  totalScore: { type: Number },
  submittedAt: { type: Date, default: Date.now },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // if manually graded
});

module.exports = mongoose.models.ModelName || mongoose.model('ModelName', schema);