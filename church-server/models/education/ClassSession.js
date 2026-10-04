const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: '',
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSchedule',
    default: null,
  },
  grade: {
    type: String,
    required: [true, 'Class / Grade is required'],
    trim: true,
  },
  gradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grade',
    default: null,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationCourse',
    default: null,
  },
  studentType: {
    type: String,
    enum: ['regular', 'distance'],
    default: 'regular',
  },
  shift: {
    type: String,
    enum: ['weekend', 'night', 'all', ''],
    default: 'weekend',
  },
  sessionDate: {
    type: String,
    required: [true, 'Session date (YYYY-MM-DD) is required'],
    trim: true,
  },
  startTime: {
    type: String,
    required: [true, 'Start time (e.g. 17:00) is required'],
    trim: true,
  },
  endTime: {
    type: String,
    required: [true, 'End time (e.g. 19:00) is required'],
    trim: true,
  },
  lateThresholdMinutes: {
    type: Number,
    default: 15,
    min: 0,
  },
  status: {
    type: String,
    enum: ['scheduled', 'open', 'closed', 'cancelled', 'rescheduled'],
    default: 'scheduled',
  },
  isCombinedSession: {
    type: Boolean,
    default: false,
  },
  sessionType: {
    type: String,
    enum: ['standard', 'combined', 'assembly', 'holiday', 'exam'],
    default: 'standard',
  },
  targetGrades: [{
    type: String,
    trim: true,
  }],
  targetStudentTypes: [{
    type: String,
    trim: true,
  }],
  targetShifts: [{
    type: String,
    trim: true,
  }],
  isMakeUp: {
    type: Boolean,
    default: false,
  },
  assignedTakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  openedAt: {
    type: Date,
    default: null,
  },
  openedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  closedAt: {
    type: Date,
    default: null,
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  cancellationReason: {
    type: String,
    trim: true,
    default: '',
  },
  rescheduledToDate: {
    type: String,
    trim: true,
    default: '',
  },
  rescheduledToTime: {
    type: String,
    trim: true,
    default: '',
  },
  location: {
    type: String,
    trim: true,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  stats: {
    expectedCount: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    lateCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    excusedCount: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Indexes for fast lookup of today's sessions, authorized taker queries, and session management
classSessionSchema.index({ sessionDate: 1, grade: 1 });
classSessionSchema.index({ sessionDate: 1, status: 1 });
classSessionSchema.index({ assignedTakers: 1, sessionDate: 1, status: 1 });
classSessionSchema.index({ scheduleId: 1, sessionDate: 1 });
classSessionSchema.index({ status: 1 });

module.exports = mongoose.models.ClassSession || mongoose.model('ClassSession', classSessionSchema);
