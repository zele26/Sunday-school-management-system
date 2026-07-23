const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  quizType: { type: String, enum: ['Weekly Quiz', 'Mid-Term Exam', 'Final Exam'], default: 'Weekly Quiz' },
  duration: { type: Number },                // in minutes
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.ModelName || mongoose.model('ModelName', schema);