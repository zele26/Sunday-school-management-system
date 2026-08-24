const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  legacyCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
}, { timestamps: true });

module.exports = mongoose.models.EducationCourse || mongoose.model('EducationCourse', courseSchema);const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  legacyCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
}, { timestamps: true });

module.exports = mongoose.models.EducationCourse || mongoose.model('EducationCourse', courseSchema);