const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100 },
  attachmentUrl: { type: String },
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// Indexes for course assignments and deadlines
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ createdBy: 1 });

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
