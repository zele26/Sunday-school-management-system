// routes/admin/registrationRoutes.js
const express = require('express');
const router = express.Router();
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const Student = require('../../models/Student');
const crypto = require('crypto');

// List pending
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'Pending Verification' }).sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve – uses the School ID generated at registration
router.put('/:id/approve', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg || reg.status !== 'Pending Verification')
      return res.status(400).json({ message: 'ምዝገባው ለማጽደቅ ዝግጁ አይደለም' });

    // Duplicate checks (optional)
    if (reg.email && reg.email.trim() !== '') {
      const existingUser = await User.findOne({ email: reg.email.toLowerCase() });
      if (existingUser) return res.status(400).json({ success: false, message: `ኢሜይል "${reg.email}" ቀድሞውኑ ሌላ ተጠቃሚ ይጠቀምበታል።` });
    }
    const existingPhoneUser = await User.findOne({ phone: reg.phone });
    if (existingPhoneUser) return res.status(400).json({ success: false, message: `ስልክ ቁጥር "${reg.phone}" ቀድሞውኑ ተመዝግቧል።` });

    // Create the user account
    const user = await User.create({
      fullName: reg.fullName,
      phone: reg.phone,
      email: reg.email || undefined,
      password: reg.password,
      role: 'student',
      status: 'approved',
    });

    // Generate QR code
    const qrCodeValue = crypto.randomUUID();

    // Create the student document – REUSE the already‑generated School ID
    const student = await Student.create({
      userId: user._id,
      studentId: reg.studentId,               // ✅ CARRY OVER the School ID
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

    // Update registration status
    reg.status = 'Approved';
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'ምዝገባው ጸድቋል። የተማሪ መለያ ተሰጥቷል።', studentId: reg.studentId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    reg.status = 'Rejected';
    reg.rejectionReason = reason || '';
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'ምዝገባው ውድቅ ተደርጓል' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;