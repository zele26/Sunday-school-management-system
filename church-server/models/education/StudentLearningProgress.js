const mongoose = require('mongoose');

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
  moduleProgress: [{
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    status: { 
      type: String, 
      enum: ['locked', 'in_progress', 'completed'], 
      default: 'locked' 
    },
    progressPct: { type: Number, default: 0 },
    completedActivitiesCount: { type: Number, default: 0 },
    totalActivitiesCount: { type: Number, default: 0 },
    unlockedAt: { type: Date },
    completedAt: { type: Date, default: null },
  }],

  // Granular Lesson Progress (Videos, Readings, Audio)
  lessonProgress: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    videoWatchedSeconds: { type: Number, default: 0 },
    videoWatchedPct: { type: Number, default: 0 },
    videoCompleted: { type: Boolean, default: false },
    readingScrollPct: { type: Number, default: 0 },
    readingCompleted: { type: Boolean, default: false },
    audioCompleted: { type: Boolean, default: false },
    isFullyCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    lastAccessedAt: { type: Date, default: Date.now },
  }],

  // Assessment & Quiz Mastery Records
  assessmentRecords: [{
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    bestScore: { type: Number, default: 0 },
    maxScore: { type: Number, default: 100 },
    passingScore: { type: Number, default: 70 },
    passed: { type: Boolean, default: false },
    attemptsCount: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
  }],

  // Assignment Submissions
  assignmentSubmissions: [{
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
    status: { 
      type: String, 
      enum: ['pending_submission', 'submitted', 'graded', 'revision_requested'], 
      default: 'pending_submission' 
    },
    score: { type: Number, default: null },
    submittedAt: { type: Date },
    gradedAt: { type: Date },
  }],

  // Overall Course Progress & Certificate Clearance
  overallCourseProgressPct: { type: Number, default: 0 },
  isCourseCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

studentLearningProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
studentLearningProgressSchema.index({ userId: 1, courseId: 1 });

module.exports = mongoose.models.StudentLearningProgress || mongoose.model('StudentLearningProgress', studentLearningProgressSchema);
