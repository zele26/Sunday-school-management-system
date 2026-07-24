// controllers/authControllers.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ---------- Helpers ----------

// Long‑lived access token (7 days) – stored in localStorage
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '7d',
  });
};

// ---------- Register ----------
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      status: role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      data: { id: newUser._id, fullName: newUser.fullName, email: newUser.email, role: newUser.role, status: newUser.status },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ---------- Login (returns long‑lived token – no cookie) ----------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ success: false, message: 'Your account registration request was declined.' });
    }

    // Generate a single long‑lived token
    const accessToken = generateAccessToken(user._id, user.role);

    // Return the token directly – frontend will store it in localStorage
    res.status(200).json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ---------- Refresh Token – removed (not needed) ----------
exports.refreshToken = async (req, res) => {
  res.status(410).json({ success: false, message: 'Refresh not used. Please log in again.' });
};

// ---------- Logout (nothing to clear) ----------
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// ---------- Forgot Password (unchanged) ----------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset token has been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`🔑 [DEV ONLY] Reset Token for ${user.email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset token has been generated.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset request.' });
  }
};