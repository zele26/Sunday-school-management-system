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
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Exclude password from query results by default
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    refreshToken: { type: String, select: false },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending', // Requires admin approval
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ModelName || mongoose.model('ModelName', schema);