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
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coursesTaught: [{ type: String }],   // ✅ Changed to strings (course names)
  isActive: { type: Boolean, default: true },
  registrationDate: { type: Date, default: Date.now },
}, {
  collection: 'teachers',
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

// Auto-generate teacherId
teacherSchema.pre('save', async function() {
  if (!this.teacherId) {
    const count = await mongoose.model('Teacher').countDocuments();
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    this.teacherId = `TCH-${year}-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
  }
});

// Virtual for Ethiopian three-part full name
teacherSchema.virtual('displayName').get(function () {
  return this.fullName || [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
});

// Teacher query indexes
teacherSchema.index({ isActive: 1 });
teacherSchema.index({ userId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);