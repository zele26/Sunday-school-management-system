// routes/telegramRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const {
  validateTelegramInitData,
  getBotStatus,
  broadcastToStudents,
  getBotInstance,
} = require('../services/telegramBotService');

// Helper to generate access token
const generateAccessToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );
};

// ---------- 1. Telegram WebApp Seamless Login ----------
router.post('/auth', async (req, res) => {
  try {
    const { initData, telegramUserId, phone } = req.body;

    let tgUser = null;

    // A. If initData is provided, validate cryptographically with HMAC-SHA256
    if (initData) {
      const validation = validateTelegramInitData(initData);
      if (validation.isValid && validation.user) {
        tgUser = validation.user;
      }
    }

    // B. Fallback to passed telegramUserId or user data in dev
    const targetTgId = tgUser?.id ? String(tgUser.id) : (telegramUserId ? String(telegramUserId) : null);

    if (!targetTgId && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Telegram authentication payload (initData or telegramId required).'
      });
    }

    let user = null;
    let student = null;

    // 1. Find by telegramChatId
    if (targetTgId) {
      user = await User.findOne({ telegramChatId: targetTgId });
      student = await Student.findOne({ telegramChatId: targetTgId });
    }

    // 2. If student found but user not yet resolved
    if (student && !user && student.userId) {
      user = await User.findById(student.userId);
    }

    // 3. Fallback by phone if provided
    if (!user && phone) {
      const cleanDigits = String(phone).replace(/\D/g, '').slice(-9);
      if (cleanDigits.length >= 8) {
        const phoneRegex = new RegExp(cleanDigits + '$');
        user = await User.findOne({ phone: phoneRegex });
        if (!student) {
          student = await Student.findOne({
            $or: [{ studentPhone: phoneRegex }, { contactPhone: phoneRegex }]
          });
        }
      }
    }

    // If still no account is linked to this Telegram user
    if (!user && !student) {
      return res.status(404).json({
        success: false,
        isLinked: false,
        message: 'Your Telegram account is not linked to any Sunday school student profile yet. Please share your phone number in the Telegram bot first.',
        telegramUser: tgUser
      });
    }

    // If user document exists, create access token
    if (user) {
      // Ensure student is linked if present
      if (!student) {
        student = await Student.findOne({ userId: user._id });
      }

      const accessToken = generateAccessToken(user._id, user.role);

      return res.json({
        success: true,
        isLinked: true,
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          roles: user.roles || [user.role],
          permissions: user.permissions || [],
          studentId: student?.studentId || undefined,
          studentProfileId: student?._id || user.studentProfileId || undefined,
          grade: student?.grade || student?.batch || undefined,
        },
        student: student ? {
          id: student._id,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
          studentType: student.studentType,
        } : null,
      });
    }

    return res.status(404).json({ success: false, message: 'User account not found' });
  } catch (err) {
    console.error('Telegram auth error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 2. Bot Status & Info ----------
router.get('/status', async (req, res) => {
  try {
    const status = await getBotStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 3. Admin Broadcast to Telegram Users ----------
router.post('/broadcast', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { message, filterGrade, filterShift, filterStudentType } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Broadcast message text is required' });
    }

    const result = await broadcastToStudents(message.trim(), {
      filterGrade,
      filterShift,
      filterStudentType
    });

    res.json(result);
  } catch (err) {
    console.error('Telegram broadcast error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 4. Link Telegram to Logged In User ----------
router.post('/link-current-user', protect, async (req, res) => {
  try {
    const { telegramChatId, telegramUsername } = req.body;
    if (!telegramChatId) {
      return res.status(400).json({ success: false, message: 'telegramChatId is required' });
    }

    await User.findByIdAndUpdate(req.user._id, {
      telegramChatId: String(telegramChatId),
      telegramUsername: telegramUsername || '',
      telegramLinkedAt: new Date(),
    });

    await Student.findOneAndUpdate(
      { userId: req.user._id },
      {
        telegramChatId: String(telegramChatId),
        telegramUsername: telegramUsername || '',
      }
    );

    res.json({ success: true, message: 'Telegram account successfully linked!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
