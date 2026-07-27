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
      sparse: true,          // ✅ allows multiple null / missing values
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,          // ✅ allows multiple null / missing values
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
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
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
  },
  { timestamps: true }
);

// ✅ Safe export – never overwrite an already compiled model
module.exports = mongoose.models.User || mongoose.model('User', userSchema);