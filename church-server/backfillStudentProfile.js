// church-server/backfillStudentProfile.js
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');
const Registration = require('./models/Registration');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const students = await Student.find({});
    console.log(`Found ${students.length} students`);

    for (const student of students) {
      const user = await User.findById(student.userId);
      let registration = null;

      // Try to find matching registration
      if (student.registrationNumber) {
        registration = await Registration.findOne({ registrationNumber: student.registrationNumber });
      }
      if (!registration && student.studentId) {
        registration = await Registration.findOne({ studentId: student.studentId });
      }
      if (!registration && user) {
        registration = await Registration.findOne({ phone: user.phone });
      }

      // Update from User
      if (user) {
        if (!student.studentPhone) student.studentPhone = user.phone || '';
        if (!student.email && user.email) student.email = user.email.toLowerCase();
        if (!student.userId) student.userId = user._id;
      }

      // Update from Registration
      if (registration) {
        if (!student.registrationNumber) student.registrationNumber = registration.registrationNumber || '';
        if (!student.parentName) student.parentName = registration.parentName || '';
        if (!student.parentPhone) student.parentPhone = registration.parentPhone || '';
        if (!student.parentEmail) student.parentEmail = registration.parentEmail || '';
        if (!student.educationLevel) student.educationLevel = registration.educationLevel || '';
        if (!student.profession) student.profession = registration.profession || '';
        if (!student.batch) student.batch = registration.batch || null;
        if (!student.gender) student.gender = registration.gender || 'Male';
        if (!student.dob) student.dob = registration.dateOfBirth || '';
        if (!student.address) student.address = registration.address || '';
      }

      await student.save({ validateBeforeSave: false });
      console.log(`Updated student: ${student.studentId}`);
    }

    console.log('✅ Backfill completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Backfill error:', err);
    process.exit(1);
  }
}

run();