const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },   // e.g., "Weekend"
  code: { type: String, required: true, unique: true, uppercase: true },
}, { timestamps: true });

module.exports = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);