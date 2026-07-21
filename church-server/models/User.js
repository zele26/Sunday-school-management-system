// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   role: { type: String, default: 'student' },
//   fullName: { type: String, required: true },
//   email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//   password: { type: String, required: true },
//   phoneNumber: String,
//   city: String,
//   wereda: String,
//   kebele: String,
//   emergencyPersonName: String,
//   emergencyPhone: String,
//   status: { type: String, default: 'Active' },
//   registrationDate: { type: Date, default: Date.now }
// });

// userSchema.pre('save', async function() {
//   if (!this.isModified('password')) return;
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   } catch (err) {
//     throw err; 
//   }
// });

// module.exports = mongoose.model('User', userSchema);


// models/User.js
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

module.exports = mongoose.model('User', userSchema);