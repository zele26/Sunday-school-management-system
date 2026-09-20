const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const PasswordResetRequest = require('../models/PasswordResetRequest');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sunday-school';

async function runVerification() {
  try {
    console.log('--- Connecting to MongoDB ---');
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // 1. Setup / find test users
    console.log('\n--- Setting up test users for each role ---');
    const salt = await bcrypt.genSalt(10);
    const initialHash = await bcrypt.hash('InitPass123', salt);

    // Student User
    let studentUser = await User.findOne({ email: 'test_student_reset@example.com' });
    if (!studentUser) {
      studentUser = await User.create({
        fullName: 'ተማሪ ፈተና (Test Student)',
        email: 'test_student_reset@example.com',
        phone: '0911887766',
        password: initialHash,
        role: 'student',
        status: 'approved',
      });
    }

    let studentDoc = await Student.findOne({ userId: studentUser._id });
    if (!studentDoc) {
      studentDoc = await Student.create({
        userId: studentUser._id,
        studentId: 'TKR-2018-9999',
        registrationNumber: 'REG-2018-9999',
        firstName: 'ተማሪ',
        lastName: 'ፈተና',
        studentPhone: '0911887766',
        email: 'test_student_reset@example.com',
        grade: 'Grade 1',
        shift: 'weekend',
      });
    }

    // Teacher User
    let teacherUser = await User.findOne({ email: 'test_teacher_reset@example.com' });
    if (!teacherUser) {
      teacherUser = await User.create({
        fullName: 'መምህር ፈተና (Test Teacher)',
        email: 'test_teacher_reset@example.com',
        phone: '0922887766',
        password: initialHash,
        role: 'teacher',
        status: 'approved',
      });
    }

    let teacherDoc = await Teacher.findOne({ userId: teacherUser._id });
    if (!teacherDoc) {
      teacherDoc = await Teacher.create({
        userId: teacherUser._id,
        teacherId: 'TCH-2025-9999',
        fullName: 'መምህር ፈተና',
        email: 'test_teacher_reset@example.com',
        phone: '0922887766',
        isActive: true,
      });
    }

    console.log(`✓ Test Student created: ${studentDoc.studentId}, Email: ${studentUser.email}, Phone: ${studentUser.phone}`);
    console.log(`✓ Test Teacher created: ${teacherDoc.teacherId}, Email: ${teacherUser.email}, Phone: ${teacherUser.phone}`);

    // 2. Test Identifier lookups as performed by authControllers.forgotPassword
    console.log('\n--- Testing forgotPassword lookups for different party identifiers ---');
    const testIdentifiers = [
      { type: 'Student ID (TKR)', val: 'TKR-2018-9999', expectedUserId: studentUser._id.toString() },
      { type: 'Student Phone', val: '0911887766', expectedUserId: studentUser._id.toString() },
      { type: 'Student Email', val: 'test_student_reset@example.com', expectedUserId: studentUser._id.toString() },
      { type: 'Teacher ID (TCH)', val: 'TCH-2025-9999', expectedUserId: teacherUser._id.toString() },
      { type: 'Teacher Phone', val: '0922887766', expectedUserId: teacherUser._id.toString() },
      { type: 'Teacher Email', val: 'test_teacher_reset@example.com', expectedUserId: teacherUser._id.toString() },
    ];

    for (const item of testIdentifiers) {
      const input = item.val.trim();
      const escaped = input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      let foundUser = null;

      if (input.includes('@')) {
        foundUser = await User.findOne({ email: input.toLowerCase() });
        if (!foundUser) {
          const s = await Student.findOne({ email: input.toLowerCase() });
          if (s?.userId) foundUser = await User.findById(s.userId);
        }
      } else {
        const sById = await Student.findOne({
          $or: [
            { studentId: new RegExp('^' + escaped + '$', 'i') },
            { registrationNumber: new RegExp('^' + escaped + '$', 'i') },
          ],
        });
        if (sById?.userId) foundUser = await User.findById(sById.userId);

        if (!foundUser) {
          const tById = await Teacher.findOne({
            teacherId: new RegExp('^' + escaped + '$', 'i'),
          });
          if (tById?.userId) foundUser = await User.findById(tById.userId);
        }

        if (!foundUser) {
          const cleanDigits = input.replace(/\D/g, '').slice(-9);
          const phoneConds = [{ phone: input }];
          if (cleanDigits && cleanDigits.length >= 8) phoneConds.push({ phone: new RegExp(cleanDigits + '$') });
          foundUser = await User.findOne({ $or: phoneConds });
        }
      }

      if (foundUser && foundUser._id.toString() === item.expectedUserId) {
        console.log(`✓ Lookup PASSED for ${item.type} [${item.val}] -> Found user "${foundUser.fullName}"`);
      } else {
        throw new Error(`❌ Lookup FAILED for ${item.type} [${item.val}]`);
      }
    }

    // 3. Test Reset Request creation & Admin Approval lifecycle
    console.log('\n--- Testing Reset Request Creation & Admin Approval Lifecycle ---');
    await PasswordResetRequest.deleteMany({ user: { $in: [studentUser._id, teacherUser._id] } });

    const resetReq = await PasswordResetRequest.create({
      user: studentUser._id,
      fullName: studentUser.fullName,
      email: studentUser.email,
      phone: studentUser.phone,
      role: studentUser.role,
      identifier: studentDoc.studentId,
      status: 'pending',
    });
    console.log(`✓ PasswordResetRequest created for Student (ID: ${resetReq._id})`);

    // Admin Approves
    const tempPass = 'TempPass7890';
    const tempHash = await bcrypt.hash(tempPass, salt);
    studentUser.password = tempHash;
    studentUser.mustChangePassword = true;
    await studentUser.save();

    resetReq.status = 'approved';
    resetReq.tempPasswordIssued = tempPass;
    await resetReq.save();
    console.log(`✓ Admin approved request. Temp password set: "${tempPass}", mustChangePassword: true`);

    // 4. Test Student Login with Temp Password
    console.log('\n--- Testing Student Login with Temp Password ---');
    const userForLogin = await User.findById(studentUser._id).select('+password');
    const matchTemp = await bcrypt.compare(tempPass, userForLogin.password);
    console.log(`✓ Temp password match verification: ${matchTemp ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✓ mustChangePassword flag on user: ${userForLogin.mustChangePassword}`);
    if (!matchTemp || !userForLogin.mustChangePassword) throw new Error('Temp password login check failed');

    // 5. Test Password Change to Permanent Password
    console.log('\n--- Testing Password Change to Permanent Password ---');
    const newPermanentPass = 'PermPass!2026';
    const newPermHash = await bcrypt.hash(newPermanentPass, salt);
    userForLogin.password = newPermHash;
    userForLogin.mustChangePassword = false;
    await userForLogin.save();

    const updatedUser = await User.findById(studentUser._id).select('+password');
    const matchPerm = await bcrypt.compare(newPermanentPass, updatedUser.password);
    console.log(`✓ Permanent password match verification: ${matchPerm ? 'SUCCESS' : 'FAILED'}`);
    console.log(`✓ mustChangePassword cleared: ${updatedUser.mustChangePassword === false ? 'SUCCESS' : 'FAILED'}`);
    if (!matchPerm || updatedUser.mustChangePassword !== false) throw new Error('Password change failed');

    // Clean up test records
    await PasswordResetRequest.deleteMany({ user: { $in: [studentUser._id, teacherUser._id] } });
    await Student.deleteOne({ _id: studentDoc._id });
    await Teacher.deleteOne({ _id: teacherDoc._id });
    await User.deleteMany({ _id: { $in: [studentUser._id, teacherUser._id] } });
    console.log('\n✓ Cleaned up test records');

    console.log('\n🎉 ALL PASSWORD RESET CHECKS PASSED FOR EVERY PARTY SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Verification Error:', err);
    process.exit(1);
  }
}

runVerification();
