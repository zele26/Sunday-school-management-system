const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  name: { type: String, required: true },                 // e.g., "Grade 7"
  level: { type: Number, required: true },                // e.g., 7 for ordering
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

// Unique grade per program (if program-specific)
gradeSchema.index({ name: 1, programId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Grade || mongoose.model('Grade', gradeSchema);