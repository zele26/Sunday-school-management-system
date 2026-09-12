const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    unique: true, 
    sparse: true, 
    default: null 
  },
  registrationNumber: { type: String, default: '' },
  firstName: { type: String, required: true },
  middleName: { type: String, default: '' },
  lastName: { type: String, required: true },
  educationLevel: { type: String, default: '' },
  profession: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
  dob: { type: String, default: '' },
  age: { type: Number, default: null },
  subcity: { type: String, default: '' },      // ክፍለ ከተማ
  woreda: { type: String, default: '' },       // ወረዳ
  kebele: { type: String, default: '' },       // ቀበሌ / የቤት ቁጥር
  shift: { type: String, default: '' },        // የቀን (weekend) ወይም የማታ (night)
  address: { type: String, default: '' },
  grade: { type: String, required: true },
  batch: { type: String, default: null },          // for distance students
  regYear: { type: String },
  studentPhone: { type: String, default: '' },     // main phone (login)
  email: { type: String, lowercase: true, default: '' },
  parentName: { type: String, default: '' },
  parentPhone: { type: String, default: '' },
  parentEmail: { type: String, default: '' },
  // New emergency contact fields
  emergencyFirstName: { type: String, default: '' },
  emergencyMiddleName: { type: String, default: '' },
  emergencyLastName: { type: String, default: '' },
  relationship: {
    type: String,
    enum: ['Father', 'Mother', 'Brother', 'Sister', 'Relative'],
    default: 'Father',
  },
  emergencyPhone: { type: String, default: '' },
  emergencyEmail: { type: String, default: '' },
  emergencyAddress: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  registrationDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse' }],
  qrCode: { type: String, unique: true, sparse: true },
  studentType: { type: String, enum: ['regular', 'distance'], default: 'regular' },
}, {
  collection: 'students',
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
});

// ✅ Collision-safe Auto-generate studentId before saving if not provided
studentSchema.pre('save', async function() {
  if (!this.studentId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Student').countDocuments({});
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    this.studentId = `STU-${year}-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
  }
});

// Virtual for Ethiopian three-part full name
studentSchema.virtual('fullName').get(function () {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
});

// Indexes for high-performance student lookups & filters
studentSchema.index({ grade: 1, studentType: 1 });
studentSchema.index({ studentType: 1 });
studentSchema.index({ batch: 1 }, { sparse: true });
studentSchema.index({ studentPhone: 1 }, { sparse: true });
studentSchema.index({ teacher: 1 }, { sparse: true });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);