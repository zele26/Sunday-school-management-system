const mongoose = require('mongoose');

const studyModeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },   // REGULAR, DISTANCE
}, { timestamps: true });

module.exports = mongoose.models.StudyMode || mongoose.model('StudyMode', studyModeSchema);