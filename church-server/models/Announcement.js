const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: {
    type: String,
    enum: ['all', 'grade', 'course', 'student'],
    default: 'all',
  },
  targetGrade: { type: String },
  targetCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  targetStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  priority: { type: String, enum: ['normal', 'urgent'], default: 'normal' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
