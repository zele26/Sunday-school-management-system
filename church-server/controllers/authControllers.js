// controllers/authControllers.js
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ---------- Helpers ----------

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '7d',
  });
};

// ---------- Register (phone required, email optional) ----------
exports.register = async (req, res) => {
  try {
    const { fullName, phone, email, password, role } = req.body;

    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'ሙሉ ስም፣ ስልክ ቁጥር እና ፓስዎርድ ያስፈልጋሉ።',
      });
    }

    // Check duplicate phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ተመዝግቧል' });
    }

    // If email is provided, check uniqueness
    if (email && email.trim() !== '') {
      const existingEmail = await User.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'ይህ ኢሜይል ቀድሞውኑ ተመዝግቧል' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      phone,
      email: email?.toLowerCase() || '',
      password: hashedPassword,
      role: role || 'student',
      status: role === 'admin' ? 'approved' : 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'ምዝገባዎ ተሳክቷል! ማረጋገጫ በመጠበቅ ላይ።',
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ---------- Login (email, phone, or studentId) ----------
exports.login = async (req, res) => {
  try {
    const { email, phone, studentId, password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: 'Password is required' });

    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    } else if (phone) {
      user = await User.findOne({ phone }).select('+password');
    } else if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) user = await User.findById(student.userId).select('+password');
    } else {
      return res.status(400).json({ success: false, message: 'Email, phone, or student ID required' });
    }

    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.status === 'pending') return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
    if (user.status === 'rejected') return res.status(403).json({ success: false, message: 'Your account registration request was declined.' });

    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({
      success: true,
      accessToken,
      user: { id: user._id, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ---------- Forgot Password ----------
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

// ---------- Refresh token & Logout are NOT used (removed) ----------
// The routes for these have also been removed from authRoutes.js