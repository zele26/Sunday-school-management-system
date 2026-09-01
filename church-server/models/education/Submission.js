const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', default: null },
  content: { type: String },
  attachmentUrl: { type: String },
  submittedAt: { type: Date, default: Date.now },
  score: { type: Number },
  feedback: { type: String },
  status: { type: String, enum: ['Submitted', 'Graded', 'Late'], default: 'Submitted' },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
