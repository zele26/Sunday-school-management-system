const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
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
    // Address fields (common to all roles)
    city: { type: String, trim: true },
    wereda: { type: String, trim: true },
    kebele: { type: String, trim: true },
    address: { type: String, trim: true },
    // Emergency contact (common to all roles)
    emergencyPersonName: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
    // Password reset
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);