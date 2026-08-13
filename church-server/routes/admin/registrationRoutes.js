// church-server/routes/admin/registrationRoutes.js
const express = require('express');
const router = express.Router();
const Registration = require('../../models/Registration');
const User = require('../../models/User');
const Student = require('../../models/Student');
const crypto = require('crypto');
const { protect, authorize } = require('../../middleware/auth');

// ---------- Helper: Ethiopian year (full, e.g., 2018) ----------
const getEthiopianYear = () => {
  const now = new Date();
  const gregorianYear = now.getFullYear();
  // Ethiopian New Year is Meskerem 1 (September 11/12)
  const ethiopianYear =
    now >= new Date(gregorianYear, 8, 11)
      ? gregorianYear - 7
      : gregorianYear - 8;
  return ethiopianYear;
};

// ---------- Helper: generate official Student ID ----------
const generateStudentId = async (studentType) => {
  const prefix = studentType === 'distance' ? 'TKD' : 'TKR';
  const year = getEthiopianYear();

  // Find the last student with this prefix, ordered by studentId descending
  const lastStudent = await Registration.findOne({
    studentId: { $regex: `^${prefix}-`, $exists: true, $ne: null },
  })
    .sort({ studentId: -1 })
    .limit(1);

  let lastNumber = 0;
  if (lastStudent && lastStudent.studentId) {
    // Format: PREFIX-YEAR-NUMBER (e.g., TKD-2018-0001)
    const parts = lastStudent.studentId.split('-');
    if (parts.length === 3) {
      lastNumber = parseInt(parts[2]) || 0;
    }
  }

  const newNumber = String(lastNumber + 1).padStart(4, '0');
  return `${prefix}-${year}-${newNumber}`;
};

// ---------- List pending (protected) ----------
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const registrations = await Registration.find({ status: 'Pending Verification' }).sort({ createdAt: -1 });
    res.json({ success: true, registrations });
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching registrations' });
  }
});

// ---------- Approve (protected) ----------
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg || reg.status !== 'Pending Verification')
      return res.status(400).json({ success: false, message: 'ምዝገባው ለማጽደቅ ዝግጁ አይደለም' });

    // Check duplicate email if provided
    if (reg.email && reg.email.trim() !== '') {
      const existingUser = await User.findOne({ email: reg.email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `ኢሜይል "${reg.email}" ቀድሞውኑ ሌላ ተጠቃሚ ይጠቀምበታል።`
        });
      }
    }

    // Check duplicate phone
    const existingPhoneUser = await User.findOne({ phone: reg.phone });
    if (existingPhoneUser) {
      return res.status(400).json({
        success: false,
        message: `ስልክ ቁጥር "${reg.phone}" ቀድሞውኑ ሌላ ተጠቃሚ ይጠቀምበታል።`
      });
    }

    // Create User
    const fullName = [reg.firstName, reg.middleName, reg.lastName].filter(Boolean).join(' ').trim() || reg.fullName;

    const user = await User.create({
      fullName,
      phone: reg.phone,
      email: reg.email || undefined,
      password: reg.password,
      role: 'student',
      status: 'approved',
    });

    // ✅ Generate official student ID using new format
    const studentId = await generateStudentId(reg.studentType);

    const student = await Student.create({
      userId: user._id,
      studentId,
      firstName: reg.firstName || reg.fullName,
      middleName: reg.middleName || '',
      lastName: reg.lastName || '',
      grade: reg.grade,
      educationLevel: reg.educationLevel || '',
      profession: reg.profession || '',
      dob: reg.dateOfBirth || '',
      address: reg.address || '',
      parentName: reg.parentName || '',
      parentPhone: reg.parentPhone || '',
      parentEmail: reg.parentEmail || '',
      qrCode: crypto.randomUUID(),
      studentType: reg.studentType,
      registrationNumber: reg.registrationNumber,
    });

    // Update registration status
    reg.status = 'Approved';
    reg.studentId = studentId;
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'ምዝገባው ጸድቋል። የተማሪ መለያ ተሰጥቷል።', studentId });
  } catch (err) {
    console.error('Approve error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ---------- Reject (protected) ----------
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'ምዝገባ አልተገኘም' });

    reg.status = 'Rejected';
    reg.rejectionReason = reason || '';
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    await reg.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'ምዝገባው ውድቅ ተደርጓል' });
  } catch (err) {
    console.error('Reject error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;