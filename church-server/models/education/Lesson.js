const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  titleAmharic: { type: String, trim: true },
  content: { type: String, default: '' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: Number, default: 1 },
  weekNumber: { type: Number },
  lessonNumber: { type: String },
  topic: { type: String },
  objectives: { type: String },
  bibleReferences: [{ type: String, trim: true }],

  // Rich Media Learning Components
  // 1. Video Lesson (YouTube embed or direct cloud link)
  videoUrl: { type: String, default: '' },
  videoTitle: { type: String, default: '' },
  videoDescription: { type: String, default: '' },
  videoDurationSeconds: { type: Number, default: 0 },
  isVideoMandatory: { type: Boolean, default: false },
  minWatchPct: { type: Number, default: 90 },

  // 2. Interactive Reading Material
  readingContent: { type: String, default: '' },
  readingContentAmharic: { type: String, default: '' },
  readingEstimatedMinutes: { type: Number, default: 10 },
  isReadingMandatory: { type: Boolean, default: false },

  // 3. Audio Chants & Lectures (መዝሙር፣ ስብከት፣ ንባብ)
  audioUrl: { type: String, default: '' },
  audioTitle: { type: String, default: '' },
  audioDurationSeconds: { type: Number, default: 0 },

  // 4. Integrated Assessment & Assignment links
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', default: null },
  attachedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],

  // Pedagogical status
  activities: { type: String },
  homework: { type: String },
  isMandatory: { type: Boolean, default: true },
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Published' },
}, { timestamps: true });

module.exports = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
