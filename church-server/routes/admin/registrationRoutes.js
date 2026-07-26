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

// Approve
router.put('/:id/approve', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    if (registration.status !== 'Pending Verification') {
      return res.status(400).json({ message: 'ምዝገባው ለማጽደቅ ዝግጁ አይደለም' });
    }

    const user = await User.create({
      fullName: registration.fullName,
      email: registration.email,
      password: registration.password,
      role: 'student',
      status: 'approved',
    });

    const qrCodeValue = crypto.randomUUID();

    const student = await Student.create({
      userId: user._id,
      firstName: registration.fullName,
      grade: registration.grade,
      dob: registration.dateOfBirth || '',
      address: registration.address || '',
      parentName: registration.parentName || '',
      parentPhone: registration.parentPhone || '',
      parentEmail: registration.parentEmail || '',
      qrCode: qrCodeValue,
      studentType: registration.studentType,   // carry over
    });

    registration.status = 'Approved';
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();
    await registration.save();

    res.json({ success: true, message: 'ምዝገባው ጸድቋል። የተማሪ መለያ ተፈጥሯል' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reject
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    registration.status = 'Rejected';
    registration.rejectionReason = reason || '';
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();
    await registration.save();

    res.json({ success: true, message: 'ምዝገባው ውድቅ ተደርጓል' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;