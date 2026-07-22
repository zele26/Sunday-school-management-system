const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // References (optional, kept for relational integrity)
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

  // Embedded data – stored at scan time so no further lookups are needed
  studentName: { type: String, required: true },
  grade: { type: String },
  courseName: { type: String },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  teacherName: { type: String },

  // Timestamps
  date: { type: Date, default: Date.now },          // attendance day
  checkInTime: { type: Date, default: Date.now },   // exact scan time

  // Status
  status: {
    type: String,
    enum: ['Present', 'Late', 'Absent'],
    default: 'Present',
  },

  // Recorded by
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Academic period
  academicYear: { type: String },   // e.g., "2026/2027"
  semester: {
    type: String,
    enum: ['First', 'Second'],
    default: 'First',
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);