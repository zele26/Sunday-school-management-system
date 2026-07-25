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
  contactPhone: String,      // emergency phone
  contactAddress: String,
  contactEmail: String,
  registrationDate: { type: Date, default: Date.now },
  // new fields for management
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },  // link to login
  studentPhone: String,         // student's own phone
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // assigned teacher (User with role teacher)
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],  // enrolled courses
  qrCode: { type: String, unique: true, sparse: true },
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);