const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    unique: true, 
    sparse: true, 
    default: null 
  },
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
  studentType: { type: String, enum: ['regular', 'distance'], default: 'regular' },
}, { collection: 'students' });

// ✅ Auto-generate studentId before saving if not provided
// Fixed: removed 'next' parameter – Mongoose handles async automatically
studentSchema.pre('save', async function() {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Student').countDocuments({});
    this.studentId = `STU-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);