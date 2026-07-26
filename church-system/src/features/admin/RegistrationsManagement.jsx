const express = require('express');
const router = express.Router();
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const Student = require('../../models/Student');
const crypto = require('crypto');

// ---------- List pending ----------
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'Pending Verification' }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Approve ----------
router.put('/:id/approve', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg || reg.status !== 'Pending Verification')
      return res.status(400).json({ message: 'ምዝገባው ለማጽደቅ ዝግጁ አይደለም' });

    // Check duplicate email if provided
    if (reg.email && reg.email.trim() !== '') {
      const existingUser = await User.findOne({ email: reg.email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `ኢሜይል "${reg.email}" ቀድሞውኑ ሌላ ተጠቃሚ ይጠቀምበታል።`,
        });
      }
    }

    // Check duplicate phone
    const existingPhoneUser = await User.findOne({ phone: reg.phone });
    if (existingPhoneUser) {
      return res.status(400).json({
        success: false,
        message: `ስልክ ቁጥር "${reg.phone}" ቀድሞውኑ ተመዝግቧል።`,
      });
    }

    // Create User
    const user = await User.create({
      fullName: reg.fullName,
      phone: reg.phone,
      email: reg.email || undefined,
      password: reg.password,
      role: 'student',
      status: 'approved',
    });

    // Generate Student ID and QR
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

    // Update registration status – skip validation (old records may miss required fields)
    reg.status = 'Approved';
    reg.studentId = studentId;
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save({ validateBeforeSave: false });   // ✅ FIXED

    res.json({ success: true, message: 'ምዝገባው ጸድቋል። የተማሪ መለያ ተሰጥቷል።', studentId });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ---------- Reject ----------
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    reg.status = 'Rejected';
    reg.rejectionReason = reason || '';
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save({ validateBeforeSave: false });   // ✅ FIXED

    res.json({ success: true, message: 'ምዝገባው ውድቅ ተደርጓል' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;