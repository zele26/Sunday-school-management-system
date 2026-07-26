const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  dob: String,
  address: String,
  grade: String,
  regYear: String,
  emergencyFirstName: String,
  emergencyMiddleName: String,
  emergencyLastName: String,
  relationship: String,
  contactPhone: String,
  contactAddress: String,
  contactEmail: String,
  registrationDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  studentPhone: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  qrCode: { type: String, unique: true, sparse: true },
  studentType: { type: String, enum: ['regular', 'distance'], default: 'regular' }, // NEW
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);