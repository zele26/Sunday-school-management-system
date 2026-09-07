const mongoose = require('mongoose');

// 1. Module Progress Sub-schema
const moduleProgressSubSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  status: { 
    type: String, 
    enum: ['locked', 'in_progress', 'completed'], 
    default: 'locked' 
  },
  progressPct: { type: Number, default: 0, min: 0, max: 100 },
  completedActivitiesCount: { type: Number, default: 0, min: 0 },
  totalActivitiesCount: { type: Number, default: 0, min: 0 },
  unlockedAt: { type: Date },
  completedAt: { type: Date, default: null },
}, { _id: false });

// 2. Lesson Progress Sub-schema
const lessonProgressSubSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  videoWatchedSeconds: { type: Number, default: 0, min: 0 },
  videoWatchedPct: { type: Number, default: 0, min: 0, max: 100 },
  videoCompleted: { type: Boolean, default: false },
  readingScrollPct: { type: Number, default: 0, min: 0, max: 100 },
  readingCompleted: { type: Boolean, default: false },
  audioCompleted: { type: Boolean, default: false },
  isFullyCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  lastAccessedAt: { type: Date, default: Date.now },
}, { _id: false });

// 3. Assessment Record Sub-schema
const assessmentRecordSubSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  bestScore: { type: Number, default: 0, min: 0 },
  maxScore: { type: Number, default: 100, min: 0 },
  passingScore: { type: Number, default: 70, min: 0 },
  passed: { type: Boolean, default: false },
  attemptsCount: { type: Number, default: 0, min: 0 },
  lastAttemptAt: { type: Date },
}, { _id: false });

// 4. Assignment Submission Sub-schema
const assignmentSubmissionSubSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  status: { 
    type: String, 
    enum: ['pending_submission', 'submitted', 'graded', 'revision_requested'], 
    default: 'pending_submission' 
  },
  score: { type: Number, default: null, min: 0 },
  submittedAt: { type: Date },
  gradedAt: { type: Date },
}, { _id: false });

// Main Progress Schema
const studentLearningProgressSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EducationCourse', 
    required: true 
  },

  // Module Level Progression with Lock States
  moduleProgress: [moduleProgressSubSchema],

  // Granular Lesson Progress (Videos, Readings, Audio)
  lessonProgress: [lessonProgressSubSchema],

  // Assessment & Quiz Mastery Records
  assessmentRecords: [assessmentRecordSubSchema],

  // Assignment Submissions
  assignmentSubmissions: [assignmentSubmissionSubSchema],

  // Overall Course Progress & Certificate Clearance
  overallCourseProgressPct: { type: Number, default: 0, min: 0, max: 100 },
  isCourseCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  lastActivityAt: { type: Date, default: Date.now },
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
});

// Compound indexes for high-speed LMS lookups
studentLearningProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
studentLearningProgressSchema.index({ userId: 1, courseId: 1 });
studentLearningProgressSchema.index({ courseId: 1, isCourseCompleted: 1 });

module.exports = mongoose.models.StudentLearningProgress || mongoose.model('StudentLearningProgress', studentLearningProgressSchema);
