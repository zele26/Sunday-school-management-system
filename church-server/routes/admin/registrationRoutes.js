const express = require('express');
const router = express.Router();
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const Student = require('../../models/Student');
const crypto = require('crypto');

// List pending
router.get('/', async (req, res) => {
  const registrations = await Registration.find({ status: 'Pending Verification' }).sort({ createdAt: -1 });
  res.json(registrations);
});

// Approve – creates user with phone, generates Student ID
router.put('/:id/approve', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg || reg.status !== 'Pending Verification')
      return res.status(400).json({ message: 'ምዝገባው ለማጽደቅ ዝግጁ አይደለም' });

    // 🔍 Check for duplicate email if one was provided
    if (reg.email && reg.email.trim() !== '') {
      const existingUser = await User.findOne({ email: reg.email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `ኢሜይል "${reg.email}" ቀድሞውኑ ሌላ ተጠቃሚ ይጠቀምበታል። እባክዎ ይህን ምዝገባ ውድቅ ያድርጉ እና ተማሪው ሌላ ኢሜይል እንዲጠቀም ያሳውቁ።`
        });
      }
    }

    // 🔍 Optionally check for duplicate phone (redundant but safe)
    const existingPhoneUser = await User.findOne({ phone: reg.phone });
    if (existingPhoneUser) {
      return res.status(400).json({
        success: false,
        message: `ስልክ ቁጥር "${reg.phone}" ቀድሞውኑ ሌላ ተጠቃሚ ይጠቀምበታል።`
      });
    }

    // Create User with phone (email optional)
    const user = await User.create({
      fullName: reg.fullName,
      phone: reg.phone,
      email: reg.email || undefined,
      password: reg.password,
      role: 'student',
      status: 'approved',
    });

    // Generate permanent Student ID
    const studentId = `STU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    const qrCodeValue = crypto.randomUUID();

    const student = await Student.create({
      userId: user._id,
      studentId,
      firstName: reg.fullName,
      grade: reg.grade,
      dob: reg.dateOfBirth || '',
      address: reg.address || '',
      parentName: reg.parentName || '',
      parentPhone: reg.parentPhone || '',
      parentEmail: reg.parentEmail || '',
      qrCode: qrCodeValue,
      studentType: reg.studentType,
    });

    // Store Student ID in registration as well
    reg.status = 'Approved';
    reg.studentId = studentId;
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save();

    res.json({ success: true, message: 'ምዝገባው ጸድቋል። የተማሪ መለያ ተሰጥቷል።', studentId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject – unchanged
router.put('/:id/reject', async (req, res) => {
  const { reason } = req.body;
  const reg = await Registration.findById(req.params.id);
  if (!reg) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

  reg.status = 'Rejected';
  reg.rejectionReason = reason || '';
  reg.reviewedBy = req.user._id;
  reg.reviewedAt = new Date();
  await reg.save();

  res.json({ success: true, message: 'ምዝገባው ውድቅ ተደርጓል' });
});

module.exports = router;