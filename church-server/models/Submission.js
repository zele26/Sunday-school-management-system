const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  fileUrl: { type: String },                 // uploaded answer
  comment: { type: String },
  submittedAt: { type: Date, default: Date.now },
  score: { type: Number },
  feedback: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: { type: Date },
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
