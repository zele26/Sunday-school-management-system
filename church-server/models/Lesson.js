const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: Number, default: 0 },
  weekNumber: { type: Number },
  lessonNumber: { type: String },
  topic: { type: String },
  objectives: { type: String },
  bibleReferences: [{ type: String }],
  activities: { type: String },
  homework: { type: String },
  resources: [{ type: String }],
  grade: { type: String },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Draft' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
