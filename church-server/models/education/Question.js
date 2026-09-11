const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: {
    type: String,
    enum: ['Multiple Choice', 'True/False', 'Short Answer', 'Essay', 'Fill in the Blank'],
    default: 'Multiple Choice',
  },
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String },
  explanation: { type: String },
  points: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for questionText compatibility
questionSchema.virtual('questionText').get(function () {
  return this.text;
});

// Index for fast test loading & ordered question rendering
questionSchema.index({ quiz: 1, order: 1 });

module.exports = mongoose.models.Question || mongoose.model('Question', questionSchema);
