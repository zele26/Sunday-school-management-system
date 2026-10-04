const mongoose = require('mongoose');

const classScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: '',
  },
  grade: {
    type: String,
    required: [true, 'Class / Grade name is required'],
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
  academicYear: {
    type: String,
    trim: true,
    default: '',
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
  // Day of week: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  dayOfWeek: {
    type: Number,
    required: [true, 'Day of week (0-6) is required'],
    min: 0,
    max: 6,
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
  earlyCheckInWindowMinutes: {
    type: Number,
    default: 20,
    min: 0,
  },
  assignedTakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
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
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes for high performance timetable queries
classScheduleSchema.index({ grade: 1, dayOfWeek: 1, isActive: 1 });
classScheduleSchema.index({ assignedTakers: 1, dayOfWeek: 1, isActive: 1 });
classScheduleSchema.index({ isActive: 1 });

module.exports = mongoose.models.ClassSchedule || mongoose.model('ClassSchedule', classScheduleSchema);
