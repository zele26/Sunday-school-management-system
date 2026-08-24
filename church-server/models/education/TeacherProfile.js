const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  teacherNumber: { type: String, unique: true, sparse: true },
  subject: { type: String, default: '' },
  qualification: { type: String, default: '' },
  experience: { type: String, default: '' },
  bio: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  legacyTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
}, { timestamps: true });

module.exports = mongoose.models.TeacherProfile || mongoose.model('TeacherProfile', teacherProfileSchema);