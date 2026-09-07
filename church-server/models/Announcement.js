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

// Indexes for feed and target filtering
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetType: 1, targetGrade: 1, createdAt: -1 });
announcementSchema.index({ targetCourse: 1 }, { sparse: true });
announcementSchema.index({ targetStudent: 1 }, { sparse: true });

module.exports = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
