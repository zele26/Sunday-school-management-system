const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  studentProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    default: null,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EducationCourse',
    default: null,
  },
  studentName: { type: String, required: true },
  grade: { type: String },
  courseName: { type: String },
  studentType: {
    type: String,
    enum: ['regular', 'distance', 'Regular', 'Distance'],
    default: 'regular',
  },
  shift: {
    type: String,
    default: '',
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  teacherProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherProfile',
    default: null,
  },
  teacherName: { type: String },
  date: { type: Date, default: Date.now },
  checkInTime: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent', 'Excused'],
    default: 'Present',
  },
  session: { type: String, trim: true },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
    default: null,
    index: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  },
  scanMethod: {
    type: String,
    enum: ['qr_scan', 'manual_override', 'auto_absent_on_close'],
    default: 'qr_scan',
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  academicYear: { type: String },
  semester: {
    type: String,
    enum: ['First', 'Second'],
    default: 'First',
  },
  excuseReason: { type: String, default: '' },
  note: { type: String, default: '' },
}, { timestamps: true });

// Unique index for session-based attendance (one record per student per session)
attendanceSchema.index(
  { sessionId: 1, student: 1 },
  { unique: true, partialFilterExpression: { sessionId: { $ne: null } } }
);

// Unique indexes for legacy course / date based attendance
attendanceSchema.index(
  { student: 1, date: 1, course: 1 },
  { unique: true, partialFilterExpression: { course: { $ne: null }, sessionId: null } }
);
attendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true, partialFilterExpression: { course: null, sessionId: null } }
);

// High-speed compound indexes for roll calls, reports & analytics
attendanceSchema.index({ sessionId: 1, status: 1 });
attendanceSchema.index({ student: 1, course: 1, status: 1 });
attendanceSchema.index({ course: 1, status: 1, student: 1 });
attendanceSchema.index({ student: 1, status: 1 });
attendanceSchema.index({ course: 1, date: 1 }, { sparse: true });
attendanceSchema.index({ grade: 1, date: -1 });
attendanceSchema.index({ teacher: 1, course: 1, date: -1 }, { sparse: true });
attendanceSchema.index({ date: -1, status: 1 });

module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
