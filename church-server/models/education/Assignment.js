const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  dueDate: { type: Date },
  maxScore: { type: Number, default: 100 },
  attachmentUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
