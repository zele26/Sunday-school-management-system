const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['regular', 'distance', 'other'], required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

// Program query indexes
programSchema.index({ type: 1, status: 1 });
programSchema.index({ status: 1 });

module.exports = mongoose.models.Program || mongoose.model('Program', programSchema);