require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

async function testLogin03() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const rawInput = '0911000003';
  const password = '123456';

  let user = null;

  // 3. Search by Phone or general credential (User table + Student table)
  const cleanPhoneDigits = rawInput.replace(/\D/g, '').slice(-9);

  user = await User.findOne({
    $or: [
      { phone: rawInput },
      { phoneNumber: rawInput },
      { username: rawInput },
      ...(cleanPhoneDigits.length >= 8
        ? [{ phone: new RegExp(cleanPhoneDigits + '$') }, { phoneNumber: new RegExp(cleanPhoneDigits + '$') }]
        : []),
    ],
  }).select('+password');

  if (!user) {
    const studentOrConditions = [
      { studentPhone: rawInput },
      { phone: rawInput },
      { parentPhone: rawInput },
      { contactPhone: rawInput },
      { emergencyPhone: rawInput },
      { studentId: rawInput },
      { studentId: rawInput.toUpperCase() },
      { registrationNumber: rawInput },
    ];

    if (cleanPhoneDigits.length >= 8) {
      const phoneRegex = new RegExp(cleanPhoneDigits + '$');
      studentOrConditions.push(
        { studentPhone: phoneRegex },
        { phone: phoneRegex },
        { parentPhone: phoneRegex },
        { contactPhone: phoneRegex },
        { emergencyPhone: phoneRegex }
      );
    }

    const matchedStudent = await Student.findOne({ $or: studentOrConditions });
    console.log('Matched Student:', matchedStudent ? {
      name: matchedStudent.firstName + ' ' + matchedStudent.lastName,
      studentId: matchedStudent.studentId,
      studentPhone: matchedStudent.studentPhone,
      parentPhone: matchedStudent.parentPhone,
      userId: matchedStudent.userId,
    } : null);

    if (matchedStudent && matchedStudent.userId) {
      user = await User.findById(matchedStudent.userId).select('+password');
    }
  }

  console.log('Found User:', user ? {
    id: user._id,
    name: user.fullName,
    phone: user.phone,
    role: user.role,
    status: user.status,
  } : null);

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password "123456" matches:', isMatch);
  }

  await mongoose.disconnect();
}

testLogin03().catch(console.error);
