// routes/telegramRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const TelegramGroup = require('../models/TelegramGroup');
const {
  validateTelegramInitData,
  getBotStatus,
  broadcastToStudents,
  sendMessageToGroups,
  getBotInstance,
  autoDetectClassAndShift,
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

// ---------- 3. Admin Broadcast to Direct Telegram Users ----------
router.post('/broadcast', protect, authorize('admin', 'superadmin', 'teacher'), async (req, res) => {
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

// ---------- 4. List Connected Telegram Groups ----------
router.get('/groups', protect, authorize('admin', 'superadmin', 'teacher'), async (req, res) => {
  try {
    const { search, grade, isActive } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }
    if (grade && grade !== 'all' && grade !== 'All') {
      query.assignedGrade = grade;
    }
    if (isActive !== undefined && isActive !== '') {
      query.isActive = isActive === 'true';
    }

    const groups = await TelegramGroup.find(query).sort({ lastActivityAt: -1, createdAt: -1 });
    res.json({ success: true, count: groups.length, groups });
  } catch (err) {
    console.error('Fetch Telegram groups error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 5. Update Telegram Group Class Assignment ----------
router.put('/groups/:id', protect, authorize('admin', 'superadmin', 'teacher'), async (req, res) => {
  try {
    const { assignedGrade, shift, studentType, isActive, description, title } = req.body;
    const group = await TelegramGroup.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Telegram group not found' });
    }

    if (assignedGrade !== undefined) group.assignedGrade = assignedGrade;
    if (shift !== undefined) group.shift = shift;
    if (studentType !== undefined) group.studentType = studentType;
    if (isActive !== undefined) group.isActive = Boolean(isActive);
    if (description !== undefined) group.description = description;
    if (title !== undefined && title.trim()) group.title = title.trim();

    group.lastActivityAt = new Date();
    await group.save();

    res.json({
      success: true,
      message: 'የቴሌግራም ግሩፕ መረጃ በተሳካ ሁኔታ ተሻሽሏል! (Group updated successfully)',
      group,
    });
  } catch (err) {
    console.error('Update Telegram group error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 6. Delete / Unlink Telegram Group ----------
router.delete('/groups/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const group = await TelegramGroup.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Telegram group not found' });
    }
    res.json({ success: true, message: 'የቴሌግራም ግሩፕ በተሳካ ሁኔታ ተሰርዟል (Group unlinked successfully)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 7. Send Message to Groups Based on Student Class / Grade ----------
router.post('/groups/send-message', protect, authorize('admin', 'superadmin', 'teacher'), async (req, res) => {
  try {
    const { message, targetGrade, targetShift, targetGroupId, targetGroupIds, sendToGroups = true, sendToDirectStudents } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'የመልእክት ጽሑፍ ያስፈልጋል (Message text is required)' });
    }

    const result = await sendMessageToGroups({
      messageText: message.trim(),
      targetGrade: targetGrade || null,
      targetShift: targetShift || null,
      targetGroupId: targetGroupId || null,
      targetGroupIds: targetGroupIds || null,
      sendToGroups: sendToGroups !== false,
      sendToDirectStudents: Boolean(sendToDirectStudents),
    });

    res.json(result);
  } catch (err) {
    console.error('Send message to groups error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 8. Sync / Refresh Connected Groups with Telegram API ----------
router.post('/groups/sync', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const bot = getBotInstance();
    if (!bot) {
      return res.status(400).json({ success: false, message: 'Telegram Bot is not active' });
    }

    const groups = await TelegramGroup.find();
    let updated = 0;

    for (const grp of groups) {
      try {
        const chat = await bot.getChat(grp.chatId).catch(() => null);
        if (chat) {
          if (chat.title) grp.title = chat.title;
          const count = await bot.getChatMemberCount(grp.chatId).catch(() => null);
          if (count) grp.memberCount = count;
          grp.isActive = true;
          grp.lastActivityAt = new Date();

          const detected = autoDetectClassAndShift(grp.title);
          if (detected.assignedGrade && (grp.assignedGrade === 'All Classes' || !grp.assignedGrade)) {
            grp.assignedGrade = detected.assignedGrade;
          }
          if (detected.shift && (grp.shift === 'all' || !grp.shift)) {
            grp.shift = detected.shift;
          }

          await grp.save();
          updated++;
        }
      } catch (e) {
        console.warn(`Could not sync group ${grp.chatId}:`, e.message);
      }
    }

    res.json({
      success: true,
      total: groups.length,
      updated,
      message: `${updated} የቴሌግራም ግሩፖች መረጃ ታድሷል (Groups synced successfully)`,
    });
  } catch (err) {
    console.error('Sync groups error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 9. Link Telegram to Logged In User ----------
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

