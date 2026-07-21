const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  grade: { type: String },               // e.g., "Grade 10"
  description: { type: String },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   // optional
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);