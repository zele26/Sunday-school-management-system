const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // … your existing fields … (unchanged)
  // …
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

// ✅ Correct safe export
module.exports = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);