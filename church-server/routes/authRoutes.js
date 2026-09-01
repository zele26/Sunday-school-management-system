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
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    const { generateAccessToken } = require('../controllers/authControllers');
    // generateAccessToken is defined in the controller file; call it to make a fresh access token
    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '7d' });

    return res.json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        assignedDepartments: user.assignedDepartments || [],
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
  res.json({
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      departmentId: req.user.departmentId,
      assignedDepartments: req.user.assignedDepartments || [],
      mustChangePassword: req.user.mustChangePassword,
    },
  });
});

module.exports = router;