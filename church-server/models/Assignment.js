const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null,
  },
  studentName: { type: String, required: true },
  grade: { type: String },
  courseName: { type: String },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  teacherName: { type: String },
  date: { type: Date, default: Date.now },
  checkInTime: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent'],
    default: 'Present',
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
});

// Unique indexes
attendanceSchema.index(
  { student: 1, date: 1, course: 1 },
  { unique: true, partialFilterExpression: { course: { $ne: null } } }
);
attendanceSchema.index(
  { student: 1, date: 1 },
  { unique: true, partialFilterExpression: { course: null } }
);

// ✅ Safe export – never recompile
module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);