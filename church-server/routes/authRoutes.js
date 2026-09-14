// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, changePassword } = require('../controllers/authControllers');
const { protect } = require('../middleware/auth');

// Refresh access token using httpOnly refresh cookie
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'No refresh token' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET || 'fallback_secret_key'));
    const User = require('../models/User');
    const Student = require('../models/Student');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });

    // Lookup student link if available
    let studentIdValue = null;
    let studentProfileIdValue = user.studentProfileId || null;
    let studentGradeValue = null;
    try {
      const rawPhone = user.phone ? String(user.phone).trim() : '';
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '').slice(-9);
      const orConds = [{ userId: user._id }];
      if (studentProfileIdValue) orConds.push({ _id: studentProfileIdValue });
      if (user.email) orConds.push({ email: user.email.toLowerCase() });
      if (rawPhone) {
        orConds.push({ studentPhone: rawPhone });
        orConds.push({ contactPhone: rawPhone });
      }
      if (cleanPhoneDigits && cleanPhoneDigits.length >= 8) {
        const phoneRegex = new RegExp(cleanPhoneDigits + '$');
        orConds.push({ studentPhone: phoneRegex });
        orConds.push({ contactPhone: phoneRegex });
      }
      const studentDoc = await Student.findOne({ $or: orConds }).select('studentId grade batch _id');
      if (studentDoc) {
        studentIdValue = studentDoc.studentId;
        studentProfileIdValue = studentDoc._id;
        studentGradeValue = studentDoc.grade || studentDoc.batch || null;
      }
    } catch (e) {}

    return res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roles: user.roles || (user.role ? [user.role] : []),
        permissions: user.permissions || [],
        departmentId: user.departmentId,
        assignedDepartments: user.assignedDepartments || [],
        studentId: studentIdValue || undefined,
        studentProfileId: studentProfileIdValue || undefined,
        grade: studentGradeValue || undefined,
        mustChangePassword: user.mustChangePassword,
      }
    });
  } catch (err) {
    console.error('Refresh token error:', err.message || err);
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/change-password', protect, changePassword);

// GET /api/auth/me – return current user based on token
router.get('/me', protect, async (req, res) => {
  const Student = require('../models/Student');
  let studentIdValue = null;
  let studentProfileIdValue = req.user.studentProfileId || null;
  let studentGradeValue = null;
  try {
    const rawPhone = req.user.phone ? String(req.user.phone).trim() : '';
    const cleanPhoneDigits = rawPhone.replace(/\D/g, '').slice(-9);
    const orConds = [{ userId: req.user._id }];
    if (studentProfileIdValue) orConds.push({ _id: studentProfileIdValue });
    if (req.user.email) orConds.push({ email: req.user.email.toLowerCase() });
    if (rawPhone) {
      orConds.push({ studentPhone: rawPhone });
      orConds.push({ contactPhone: rawPhone });
    }
    if (cleanPhoneDigits && cleanPhoneDigits.length >= 8) {
      const phoneRegex = new RegExp(cleanPhoneDigits + '$');
      orConds.push({ studentPhone: phoneRegex });
      orConds.push({ contactPhone: phoneRegex });
    }
    const studentDoc = await Student.findOne({ $or: orConds }).select('studentId grade batch _id');
    if (studentDoc) {
      studentIdValue = studentDoc.studentId;
      studentProfileIdValue = studentDoc._id;
      studentGradeValue = studentDoc.grade || studentDoc.batch || null;
    }
  } catch (e) {}

  res.json({
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      roles: req.user.roles || (req.user.role ? [req.user.role] : []),
      permissions: req.user.permissions || [],
      departmentId: req.user.departmentId,
      assignedDepartments: req.user.assignedDepartments || [],
      studentId: studentIdValue || undefined,
      studentProfileId: studentProfileIdValue || undefined,
      grade: studentGradeValue || undefined,
      mustChangePassword: req.user.mustChangePassword,
    },
  });
});

module.exports = router;