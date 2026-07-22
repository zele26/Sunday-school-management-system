const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },  // optional – if attendance is per course
  date: { type: Date, default: Date.now },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // admin who scanned
});

module.exports = mongoose.model('Attendance', attendanceSchema);