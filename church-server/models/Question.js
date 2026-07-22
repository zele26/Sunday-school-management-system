const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: { type: String, enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Essay', 'Fill in the Blank'], required: true },
  text: { type: String, required: true },
  options: [{ type: String }],               // for multiple choice
  correctAnswer: { type: String },           // for auto‑grading
  points: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('Question', questionSchema);