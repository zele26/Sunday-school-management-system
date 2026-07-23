const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  fullName: String,
  date: { type: String, default: () => new Date().toLocaleDateString() },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  status: { type: String, default: "Present" }
});

module.exports = mongoose.models.Scan || mongoose.model('Scan', scanSchema);