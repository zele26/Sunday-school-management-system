const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  teacherId: { type: String, unique: true, sparse: true },
  fullName: { type: String, required: true },      // Added fullName directly
  firstName: String,
  middleName: String,
  lastName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  subject: String,
  qualification: String,
  experience: String,
  bio: String,
  address: String,
  city: String,
  gender: { type: String, enum: ['Male', 'Female', ''], default: '' },
  dateOfBirth: String,
  profilePicture: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  coursesTaught: [{ type: String }],   // ✅ Changed to strings (course names)
  isActive: { type: Boolean, default: true },
  registrationDate: { type: Date, default: Date.now },
}, { collection: 'teachers' });

// Auto-generate teacherId
teacherSchema.pre('save', async function() {
  if (!this.teacherId) {
    const count = await mongoose.model('Teacher').countDocuments();
    const year = new Date().getFullYear();
    this.teacherId = `TCH-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);