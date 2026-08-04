const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    teacherId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'created', 'active'],
      default: 'pending',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    profileComplete: {
      type: Boolean,
      default: true,
    },
    profilePicture: { type: String, trim: true },
    gender: {
      type: String,
      enum: ['Male', 'Female', ''],
      default: '',
    },
    branch: { type: String, trim: true },
    teacherRole: { type: String, trim: true },
    grades: [{ type: String, trim: true }],
    // Teacher & Profile additional details
    experience: { type: String, trim: true },
    subject: { type: String, trim: true },
    coursesTaught: [{ type: String, trim: true }],
    qualification: { type: String, trim: true },
    city: { type: String, trim: true },
    wereda: { type: String, trim: true },
    kebele: { type: String, trim: true },
    emergencyPersonName: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    bio: { type: String, trim: true },

    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    //status: {
    //type: String,
   // enum: ['pending', 'approved', 'rejected', 'Active'],
    //default: 'pending',
//},
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
