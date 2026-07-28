// controllers/authControllers.js
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const PasswordResetRequest = require('../models/PasswordResetRequest');

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
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        mustChangePassword: user.mustChangePassword || false,   // ← ADDED
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ---------- Forgot Password Request (Sends to Admin) ----------
exports.forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;
    const input = (identifier || req.body.email || req.body.phone || '').trim();

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'እባክዎ ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ።',
      });
    }

    let user;
    if (input.includes('@')) {
      user = await User.findOne({ email: input.toLowerCase() });
    } else if (input.toUpperCase().startsWith('STU-')) {
      const student = await Student.findOne({ studentId: input });
      if (student) user = await User.findById(student.userId);
    } else {
      user = await User.findOne({ phone: input });
    }

    if (user) {
      const pendingReq = await PasswordResetRequest.findOne({ user: user._id, status: 'pending' });
      if (!pendingReq) {
        await PasswordResetRequest.create({
          user: user._id,
          fullName: user.fullName,
          email: user.email || '',
          phone: user.phone || '',
          role: user.role,
          identifier: input,
          status: 'pending',
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'ለአስተዳዳሪው የፓስዎርድ ቅያሬ ጥያቄ ተልኳል! አስተዳዳሪው መረጃዎን አረጋግጦ ሲያጸድቀው በጊዜያዊ ፓስዎርድ መግባት ይችላሉ።',
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password reset request.' });
  }
};

// ---------- Change Password (requires current password) ----------
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'አሁኑኑ ያለው ፓስዎርድ እና አዲሱ ፓስዎርድ ያስፈልጋሉ።',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'አዲሱ ፓስዎርድ ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት።',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'ተጠቃሚው አልተገኘም' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'አሁኑኑ ያስገቡት ፓስዎርድ ትክክል አይደለም።' });
    }

    // 🔍 Prevent reusing the current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'አዲሱ ፓስዎርድ አሁን ካለው ጋር አንድ አይነት መሆን የለበትም።',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.mustChangePassword = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'ፓስዎርድዎ በተሳካ ሁኔታ ተቀይሯል!' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error during password change.' });
  }
};