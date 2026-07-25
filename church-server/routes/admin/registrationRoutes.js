// routes/admin/registrationRoutes.js
const express = require('express');
const router = express.Router();
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const Student = require('../../models/Student');
const crypto = require('crypto');        // <-- for generating QR code UUID

// All routes are already protected by the admin hub (protect + authorize('admin'))

// ---------- List all pending registrations ----------
router.get('/', async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'Pending Verification' })
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Approve a registration ----------
router.put('/:id/approve', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (registration.status !== 'Pending Verification') {
      return res.status(400).json({ message: 'Registration is not pending verification' });
    }

    // Create the User account (password already hashed)
    const user = await User.create({
      fullName: registration.fullName,
      email: registration.email,
      password: registration.password,
      role: 'student',
      status: 'approved',
    });

    // Generate a unique QR code string
    const qrCodeValue = crypto.randomUUID();

    // Create the Student document – include QR code from the start
    const student = await Student.create({
      userId: user._id,
      firstName: registration.fullName,
      grade: registration.grade,
      dob: registration.dateOfBirth || '',
      address: registration.address || '',
      parentName: registration.parentName || '',
      parentPhone: registration.parentPhone || '',
      parentEmail: registration.parentEmail || '',
      qrCode: qrCodeValue,                    // <-- QR code generated immediately
    });

    // Update registration status
    registration.status = 'Approved';
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();
    await registration.save();

    res.json({
      success: true,
      message: 'Registration approved. Student account created with QR code.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Reject a registration ----------
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.status = 'Rejected';
    registration.rejectionReason = reason || '';
    registration.reviewedBy = req.user._id;
    registration.reviewedAt = new Date();
    await registration.save();

    res.json({ success: true, message: 'Registration rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;