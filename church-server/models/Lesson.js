const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String },               // rich text or plain
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // teacher
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);