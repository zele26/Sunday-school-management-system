const mongoose = require('mongoose');
require('./Department');

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
      enum: ['superadmin', 'admin', 'department_admin', 'teacher', 'student', 'member'],
      default: 'student',
    },
    roles: [{
      type: String,
      enum: ['superadmin', 'admin', 'department_admin', 'teacher', 'student', 'member'],
    }],
    roleHistory: [
      {
        role: { type: String, required: true },
        title: { type: String, default: '' },
        status: { type: String, enum: ['Active', 'Completed', 'Graduated', 'Promoted', 'Transferred', 'Archived'], default: 'Active' },
        departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, default: null },
        notes: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
    studentProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      default: null,
    },
    teacherProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      default: null,
    },
    personId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Person',
      default: null,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedDepartments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    }],
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