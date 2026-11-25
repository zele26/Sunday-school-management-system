// services/telegramBotService.js
const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const QRCode = require('qrcode');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/education/Attendance');
const Course = require('../models/education/Course');
const ExamResult = require('../models/education/ExamResult');
const Announcement = require('../models/Announcement');
const Certificate = require('../models/education/Certificate');
const TelegramGroup = require('../models/TelegramGroup');
const ClassSession = require('../models/education/ClassSession');
const { formatEthiopianDate } = require('../utils/ethiopianDate');
const { getEthiopianTimeInfo } = require('./sessionAutoCloseService');

// Deduplicate attendance records per student + session/date (Present/Late/Excused overrides Absent)
const deduplicateBotAttendance = (records) => {
  const map = new Map();
  for (const r of records) {
    const sId = r.student?._id ? r.student._id.toString() : (r.student ? r.student.toString() : (r.studentName || ''));
    const sessKey = r.sessionId?._id
      ? r.sessionId._id.toString()
      : (r.sessionId ? r.sessionId.toString() : (r.session || r.courseName || 'general'));
    const dateKey = r.date ? new Date(r.date).toISOString().split('T')[0] : '';
    const key = r.sessionId ? `${sId}__${sessKey}` : `${sId}__${sessKey}__${dateKey}`;
    if (!map.has(key)) {
      map.set(key, r);
    } else if (map.get(key).status === 'Absent' && r.status !== 'Absent') {
      map.set(key, r);
    }
  }
  return Array.from(map.values());
};

const getStatusBadgeAmharic = (status) => {
  const s = String(status || 'Present').toLowerCase();
  if (s === 'late') return '🟡 አርፍዷል';
  if (s === 'excused') return '🔵 በፈቃድ';
  if (s === 'absent') return '🔴 አልተገኘም';
  return '🟢 ተገኝቷል';
};

let botInstance = null;
let botInfo = null;

/**
 * Clean phone number to Ethiopian standard 9-digit matching string
 */
const normalizePhoneDigits = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.slice(-9); // returns last 9 digits (e.g. 912345678)
};

/**
 * Get configured WebApp URL
 */
const getWebAppUrl = () => {
  const base = process.env.TELEGRAM_WEBAPP_URL || process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
  return base.replace(/\/+$/, '');
};

/**
 * Check if the current WebApp URL is a valid HTTPS URL (required by Telegram for web_app buttons)
 */
const isHttpsUrl = (url) => {
  return typeof url === 'string' && url.trim().toLowerCase().startsWith('https://');
};

/**
 * Visual Progress Bar Generator
 */
const generateProgressBar = (percent, length = 10) => {
  const safePct = Math.min(100, Math.max(0, percent || 0));
  const filled = Math.min(length, Math.max(0, Math.round((safePct / 100) * length)));
  const empty = length - filled;
  return '🟩'.repeat(filled) + '⬜'.repeat(empty);
};

/**
 * Grade Score Badge Generator
 */
const getScoreBadge = (score, total = 100) => {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  if (pct >= 90) return { medal: '🥇', label: 'እጅግ የላቀ (Excellent)', grade: 'A+' };
  if (pct >= 80) return { medal: '🥈', label: 'በጣም ጥሩ (Very Good)', grade: 'A' };
  if (pct >= 70) return { medal: '🥉', label: 'ጥሩ (Good)', grade: 'B' };
  if (pct >= 60) return { medal: '📘', label: 'አጥጋቢ (Satisfactory)', grade: 'C' };
  return { medal: '📝', label: 'የተወሰደ (Completed)', grade: 'Pass' };
};

/**
 * Build standard interactive reply keyboard
 */
const getMainReplyKeyboard = () => {
  const webAppUrl = getWebAppUrl();
  const hasHttps = isHttpsUrl(webAppUrl);

  const topRow = hasHttps
    ? [{ text: '🎓 የተማሪዎች ፖርታል (Open Portal)', web_app: { url: `${webAppUrl}/dashboard?tgWebApp=1` } }]
    : [{ text: '🎓 የተማሪዎች ፖርታል (Open Portal)' }];

  return {
    keyboard: [
      topRow,
      [
        { text: '📱 ስልክ ቁጥር ያገናኙ (Link Phone)', request_contact: true },
        { text: '👤 የእኔ መረጃ (My Profile)' }
      ],
      [
        { text: '📚 ትምህርቶች (Courses)' },
        { text: '🏆 የፈተና ውጤት (Results)' }
      ],
      [
        { text: '📝 ሳምንታዊ ፈተና (Quiz)' },
        { text: '🎵 መዝሙርና ትምህርት (Media)' }
      ],
      [
        { text: '🤖 መንፈሳዊ ረዳት (AI Q&A)' },
        { text: '📅 የዕለታዊ ክትትል (Attendance)' }
      ],
      [
        { text: '📜 ሰርተፊኬት (Certificate)' },
        { text: '📢 ማስታወቂያዎች (Announcements)' }
      ],
      [
        { text: '❓ እርዳታ (Help Guide)' }
      ]
    ],
    resize_keyboard: true,
    is_persistent: true,
  };
};

/**
 * Build inline button for Portal (uses web_app if HTTPS, callback_data if localhost, or standard URL if remote)
 */
const buildPortalInlineButton = (text = '🎓 የተማሪዎች ፖርታል ክፈት (Open Portal)', path = '/dashboard') => {
  const webAppUrl = getWebAppUrl();
  const fullUrl = `${webAppUrl}${path.startsWith('/') ? path : `/${path}`}${path.includes('?') ? '&' : '?'}tgWebApp=1`;
  if (isHttpsUrl(webAppUrl)) {
    return { text, web_app: { url: fullUrl } };
  }
  if (webAppUrl.includes('localhost') || webAppUrl.includes('127.0.0.1')) {
    return { text, callback_data: 'cmd_portal' };
  }
  return { text, url: fullUrl };
};

/**
 * Helper to normalize grade strings (e.g., '7', 'grade 7', 'የ 7ኛ ክፍል' -> 'Grade 7')
 */
const normalizeGradeString = (input) => {
  if (!input) return 'All Classes';
  const str = input.trim();
  if (/^(all|ሁሉም|all classes)$/i.test(str)) return 'All Classes';
  if (/^(distance|የርቀት|ርቀት)$/i.test(str)) return 'Distance';
  const match = str.match(/\d+/);
  if (match) {
    return `Grade ${match[0]}`;
  }
  return str;
};

/**
 * Helper to normalize shift string ('weekend', 'night', 'all')
 */
const normalizeShiftString = (input) => {
  if (!input) return 'all';
  const str = input.toLowerCase().trim();
  if (str.includes('night') || str.includes('ማታ')) return 'night';
  if (str.includes('weekend') || str.includes('day') || str.includes('ቀን') || str.includes('ቅዳሜ') || str.includes('እሑድ')) return 'weekend';
  return 'all';
};

/**
 * Helper to parse combined grade and shift from user input (e.g., "Grade 7 night", "7 ማታ", "8 weekend")
 */
const parseGradeAndShift = (input) => {
  if (!input) return { grade: 'All Classes', shift: 'all' };
  const str = input.trim();
  let shift = 'all';

  if (/(night|ማታ)/i.test(str)) {
    shift = 'night';
  } else if (/(weekend|day|ቀን|ቅዳሜ|እሑድ)/i.test(str)) {
    shift = 'weekend';
  }

  const cleanGrade = str.replace(/(night|weekend|day|all|ማታ|ቀን|ቅዳሜ|እሑድ|ፈረቃ|ክፍል|የማታ|የቀን)/gi, '').trim();
  const grade = normalizeGradeString(cleanGrade || str);

  return { grade, shift };
};

/**
 * Check if a user is an authorized admin in a Telegram group or system admin
 */
const isAuthorizedAdmin = async (chatId, userId, msg = null) => {
  try {
    // 0. Check Anonymous Admin / Channel Posting
    // In Telegram groups, when an admin enables "Remain Anonymous" or sends as channel:
    if (msg) {
      // If sent on behalf of the group (sender_chat matches group id)
      if (msg.sender_chat && String(msg.sender_chat.id) === String(chatId)) {
        return true;
      }
      // If sent by Telegram's official GroupAnonymousBot
      if (
        msg.from?.id === 1087968824 ||
        msg.from?.username === 'GroupAnonymousBot' ||
        (msg.from?.is_bot && msg.from?.first_name === 'Group')
      ) {
        return true;
      }
      // If author_signature exists (often sent by channel admins)
      if (msg.author_signature) {
        return true;
      }
    }

    if (!userId) return false;

    // 1. Check if user is in env TELEGRAM_ADMIN_IDS
    const adminIds = (process.env.TELEGRAM_ADMIN_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (adminIds.includes(String(userId))) return true;

    // 2. Check if user is an Admin/Superadmin in Sunday School DB
    const dbUser = await User.findOne({ telegramChatId: String(userId) }).catch(() => null);
    if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'superadmin' || dbUser.roles?.includes('admin') || dbUser.roles?.includes('superadmin') || dbUser.role === 'teacher')) {
      return true;
    }

    // 3. If in a group, verify if user is Group Creator / Owner or Group Administrator in Telegram
    if (botInstance && chatId && (String(chatId).startsWith('-') || String(chatId).startsWith('-100'))) {
      const member = await botInstance.getChatMember(chatId, userId).catch(() => null);
      if (member && (member.status === 'creator' || member.status === 'administrator')) {
        return true;
      }

      // Fallback: check full group administrator list
      const admins = await botInstance.getChatAdministrators(chatId).catch(() => []);
      if (admins && admins.some((a) => String(a.user?.id) === String(userId))) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.warn('isAuthorizedAdmin check notice:', err.message);
    return false;
  }
};

/**
 * Auto-detect class grade and shift from Telegram Group title
 */
const autoDetectClassAndShift = (title) => {
  if (!title) return {};
  const updates = {};
  
  if (/10ኛ|10\s*ኛ|grade\s*10/i.test(title)) {
    updates.assignedGrade = 'Grade 10';
  } else if (/9ኛ|9\s*ኛ|grade\s*9/i.test(title)) {
    updates.assignedGrade = 'Grade 9';
  } else if (/11ኛ|11\s*ኛ|grade\s*11/i.test(title)) {
    updates.assignedGrade = 'Grade 11';
  } else if (/12ኛ|12\s*ኛ|grade\s*12/i.test(title)) {
    updates.assignedGrade = 'Grade 12';
  } else if (/7ኛ|7\s*ኛ|grade\s*7/i.test(title)) {
    updates.assignedGrade = 'Grade 7';
  } else if (/8ኛ|8\s*ኛ|grade\s*8/i.test(title)) {
    updates.assignedGrade = 'Grade 8';
  } else if (/ርቀት|distance/i.test(title)) {
    updates.assignedGrade = 'Distance';
  }

  if (/ማታ|night/i.test(title)) {
    updates.shift = 'night';
  } else if (/ቀን|ቅዳሜ|እሁድ|እሑድ|day|weekend/i.test(title)) {
    updates.shift = 'weekend';
  }

  return updates;
};

/**
 * Upsert or update a Telegram Group record in MongoDB
 */
const upsertTelegramGroup = async (chat, options = {}) => {
  if (!chat || (chat.type !== 'group' && chat.type !== 'supergroup' && chat.type !== 'channel')) {
    return null;
  }
  try {
    const chatId = String(chat.id);
    const title = chat.title || 'Telegram Group';
    const type = chat.type;
    const detected = autoDetectClassAndShift(title);

    let group = await TelegramGroup.findOne({ chatId });
    if (!group) {
      group = new TelegramGroup({
        chatId,
        title,
        type,
        assignedGrade: options.assignedGrade || detected.assignedGrade || 'All Classes',
        shift: options.shift || detected.shift || 'all',
        isActive: true,
        lastActivityAt: new Date(),
      });
    } else {
      group.title = title;
      group.type = type;
      group.isActive = true;
      group.lastActivityAt = new Date();
      if (options.assignedGrade) {
        group.assignedGrade = options.assignedGrade;
      } else if (group.assignedGrade === 'All Classes' && detected.assignedGrade) {
        group.assignedGrade = detected.assignedGrade;
      }
      if (options.shift) {
        group.shift = options.shift;
      } else if (group.shift === 'all' && detected.shift) {
        group.shift = detected.shift;
      }
    }

    if (botInstance) {
      const count = await botInstance.getChatMemberCount(chatId).catch(() => null);
      if (count) group.memberCount = count;
    }

    await group.save();
    return group;
  } catch (err) {
    console.warn('⚠️ Telegram group upsert notice:', err.message);
    return null;
  }
};

/**
 * Split long text into Telegram-compliant chunks (<= 3900 chars)
 */
const chunkText = (text, maxLength = 3900) => {
  if (!text || typeof text !== 'string') return [];
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }
    let splitIdx = remaining.lastIndexOf('\n\n', maxLength);
    if (splitIdx === -1 || splitIdx < maxLength * 0.4) {
      splitIdx = remaining.lastIndexOf('\n', maxLength);
    }
    if (splitIdx === -1 || splitIdx < maxLength * 0.4) {
      splitIdx = remaining.lastIndexOf(' ', maxLength);
    }
    if (splitIdx === -1 || splitIdx === 0) {
      splitIdx = maxLength;
    }

    chunks.push(remaining.slice(0, splitIdx).trim());
    remaining = remaining.slice(splitIdx).trim();
  }

  return chunks.filter(Boolean);
};

/**
 * Safe message sender with auto-chunking, markdown fallback and error resilience
 */
const safeSendMessage = async (chatId, text, options = {}) => {
  if (!botInstance && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      await initTelegramBot();
    } catch (e) {
      console.warn('Auto-init bot in safeSendMessage failed:', e.message);
    }
  }
  if (!botInstance) {
    console.warn(`safeSendMessage: botInstance is null, cannot send to ${chatId}`);
    return null;
  }

  if (!text || typeof text !== 'string') return null;

  const chunks = chunkText(text, 3900);
  let lastResult = null;

  for (const chunk of chunks) {
    let sent = null;
    try {
      sent = await botInstance.sendMessage(chatId, chunk, options);
    } catch (err) {
      const errMsg = err.message || '';
      const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('too many requests');

      if (isRateLimit) {
        const retryMatch = errMsg.match(/retry after (\d+)/i);
        const waitSec = retryMatch ? Math.min(parseInt(retryMatch[1], 10), 10) : 3;
        console.warn(`⏳ Telegram rate limit for chat ${chatId}: retry after ${waitSec}s...`);
        await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
        try {
          sent = await botInstance.sendMessage(chatId, chunk, options);
        } catch (retryErr) {
          console.error(`❌ Telegram rate-limited sendMessage failed for chat ${chatId}:`, retryErr.message);
        }
      } else {
        console.warn(`⚠️ Telegram sendMessage parse notice for chat ${chatId} (${errMsg}). Retrying plain fallback...`);
        try {
          const fallbackOpts = { ...options };
          delete fallbackOpts.parse_mode;
          sent = await botInstance.sendMessage(chatId, chunk, fallbackOpts);
        } catch (fallbackErr) {
          try {
            sent = await botInstance.sendMessage(chatId, chunk.replace(/[*_`[\]()]/g, ''));
          } catch (finalErr) {
            console.error(`❌ Telegram sendMessage completely failed for chat ${chatId}:`, finalErr.message);
          }
        }
      }
    }

    if (sent) {
      lastResult = sent;
      if (chunks.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 80));
      }
    }
  }

  return lastResult;
};

/**
 * Safe photo sender with text fallback
 */
const safeSendPhoto = async (chatId, photoBuffer, caption, options = {}) => {
  if (!botInstance) return null;
  try {
    return await botInstance.sendPhoto(chatId, photoBuffer, {
      caption,
      ...options,
    });
  } catch (err) {
    console.warn('⚠️ Telegram sendPhoto failed, falling back to message:', err.message);
    return await safeSendMessage(chatId, caption, options);
  }
};

/**
 * Find linked Student by Telegram Chat ID or phone across all schemas (Student, User, Person, StudentProfile, Registration)
 */
const findLinkedStudent = async (chatId, userPhone = null) => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) return null;

  const Person = require('../models/Person');
  const StudentProfile = require('../models/education/StudentProfile');

  // 1. Try by telegramChatId on Student
  let student = await Student.findOne({ telegramChatId: String(chatId) })
    .populate('userId', 'email phone fullName role roles')
    .populate('teacher', 'fullName email phone')
    .catch(() => null);

  if (student) return student;

  // 2. Try by User model linked to this chatId
  const user = await User.findOne({ telegramChatId: String(chatId) }).catch(() => null);
  if (user) {
    student = await Student.findOne({
      $or: [{ userId: user._id }, { phone: user.phone }, { studentPhone: user.phone }]
    })
      .populate('userId', 'email phone fullName role roles')
      .populate('teacher', 'fullName email phone')
      .catch(() => null);

    if (student) {
      student.telegramChatId = String(chatId);
      await student.save().catch(() => {});
      return student;
    }

    // Check if user has a Person / StudentProfile
    if (user.personId || user.studentProfileId) {
      const person = user.personId ? await Person.findById(user.personId).catch(() => null) : null;
      return {
        _id: user._id,
        firstName: person?.firstName || user.fullName?.split(' ')[0] || 'ተማሪ',
        lastName: person?.lastName || user.fullName?.split(' ').slice(1).join(' ') || '',
        studentId: user.studentProfileId?.studentNumber || user.personId || 'STU-USER',
        grade: user.grade || 'መደበኛ',
        studentPhone: user.phone,
        userId: user,
      };
    }
  }

  // 3. Try by phone number if provided
  if (userPhone) {
    const cleanDigits = normalizePhoneDigits(userPhone);
    if (cleanDigits.length >= 8) {
      const phoneRegex = new RegExp(cleanDigits + '$');

      // 3a. Search Student schema
      student = await Student.findOne({
        $or: [
          { studentPhone: phoneRegex },
          { contactPhone: phoneRegex },
          { emergencyPhone: phoneRegex },
          { phone: phoneRegex }
        ]
      })
      .populate('userId', 'email phone fullName role roles')
      .populate('teacher', 'fullName email phone')
      .catch(() => null);

      if (student) {
        student.telegramChatId = String(chatId);
        await student.save().catch(() => {});
        return student;
      }

      // 3b. Search Person schema
      const matchedPerson = await Person.findOne({ phone: phoneRegex }).catch(() => null);
      if (matchedPerson) {
        const studentProfile = await StudentProfile.findOne({ personId: matchedPerson._id }).catch(() => null);
        const linkedUser = await User.findOne({
          $or: [{ personId: matchedPerson._id }, { phone: phoneRegex }]
        }).catch(() => null);

        if (linkedUser) {
          linkedUser.telegramChatId = String(chatId);
          await linkedUser.save().catch(() => {});
        }

        return {
          _id: matchedPerson._id,
          firstName: matchedPerson.firstName,
          middleName: matchedPerson.middleName,
          lastName: matchedPerson.lastName,
          studentId: studentProfile?.studentNumber || 'STU-PERSON',
          grade: 'መደበኛ',
          studentPhone: matchedPerson.phone,
          userId: linkedUser,
        };
      }

      // 3c. Search User schema
      const matchedUser = await User.findOne({ phone: phoneRegex }).catch(() => null);
      if (matchedUser) {
        matchedUser.telegramChatId = String(chatId);
        await matchedUser.save().catch(() => {});

        const parts = (matchedUser.fullName || '').split(' ');
        return {
          _id: matchedUser._id,
          firstName: parts[0] || matchedUser.fullName || 'ተማሪ',
          lastName: parts.slice(1).join(' ') || '',
          studentId: matchedUser.personId || matchedUser._id,
          grade: matchedUser.role === 'student' ? 'መደበኛ' : matchedUser.role,
          studentPhone: matchedUser.phone,
          userId: matchedUser,
        };
      }
    }
  }

  return null;
};

/**
 * Initialize Telegram Bot Service
 */
const initTelegramBot = async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.trim() === '' || token.includes('your_token_here')) {
    console.log('ℹ️ Telegram Bot: TELEGRAM_BOT_TOKEN not provided in .env. Bot service running in passive mode.');
    return null;
  }

  if (botInstance) return botInstance;

  try {
    const isWebhookMode = process.env.NODE_ENV === 'production' && process.env.TELEGRAM_WEBHOOK_URL;
    botInstance = new TelegramBot(token, { polling: !isWebhookMode });

    botInfo = await botInstance.getMe().catch((err) => {
      console.warn('⚠️ Telegram Bot authentication warning:', err.message);
      return null;
    });

    if (botInfo) {
      console.log(`🤖 Telegram Bot initialized successfully: @${botInfo.username} (${botInfo.first_name})`);

      // Set chat menu button to launch WebApp directly if HTTPS is configured
      const webAppUrl = getWebAppUrl();
      if (isHttpsUrl(webAppUrl)) {
        botInstance.setChatMenuButton({
          menu_button: {
            type: 'web_app',
            text: '🎓 የተማሪ ፖርታል',
            web_app: { url: `${webAppUrl}/dashboard?tgWebApp=1` }
          }
        }).catch((e) => console.warn('Could not set Telegram chat menu button:', e.message));
      }

      // Register standard bot commands
      botInstance.setMyCommands([
        { command: 'start', description: 'የቴሌግራም ቦት መነሻ ገጽ (Start & Main Menu)' },
        { command: 'register', description: 'አዲስ የተማሪ ምዝገባ (New Student Registration)' },
        { command: 'profile', description: 'የተማሪ መረጃ እና ዲጂታል QR ባጅ (Student Profile & Badge)' },
        { command: 'quiz', description: 'ሳምንታዊ የመጽሐፍ ቅዱስና የትምህርት ፈተና (Weekly Quiz)' },
        { command: 'mezmur', description: 'መንፈሳዊ መዝሙራትና የድምፅ ትምህርቶች (Audio Mezmurs & Sermons)' },
        { command: 'ask', description: 'የመንፈሳዊ ትምህርት ረዳት (Spiritual AI Q&A Assistant)' },
        { command: 'checkin', description: 'የመምህራን የተማሪ ክትትል መመዝገቢያ (Teacher Roll-Call Check-in)' },
        { command: 'report', description: 'የተገኝነት ሪፖርት — ለመምህራንና አስተዳዳሪዎች (Attendance Reports)' },
        { command: 'absentees', description: 'የዛሬ ያልተገኙ ተማሪዎች ዝርዝር (Today Absentees)' },
        { command: 'certificate', description: 'የምረቃ ሰርተፊኬት ማረጋገጫና ማውረጃ (Graduation Certificate)' },
        { command: 'attendance', description: 'የዕለታዊ ክትትል ታሪክ (Attendance Logs)' },
        { command: 'courses', description: 'የተመዘገቡባቸው ትምህርቶች (Enrolled Courses)' },
        { command: 'results', description: 'የፈተናና የፈተና ውጤት (Exam Results)' },
        { command: 'announcements', description: 'ወቅታዊ የቤተክርስቲያን ማስታወቂያዎች (Announcements)' },
        { command: 'portal', description: 'የተማሪዎች ፖርታል ድረ-ገጽ (Open Student Portal)' },
        { command: 'verify', description: 'የሰርተፊኬት ወይም መታወቂያ ማረጋገጫ (Verify Certificate / ID)' },
        { command: 'help', description: 'የአጠቃቀም መመሪያ እና እርዳታ (Help Guide)' },
      ]).catch(() => {});
    }

    // Global bot error listeners to prevent unhandled crashes
    botInstance.on('polling_error', (error) => {
      console.warn('Telegram Bot polling notice:', error.code || error.message);
    });

    botInstance.on('error', (error) => {
      console.warn('Telegram Bot general notice:', error.message);
    });

    // ---------- Group Activity & Auto-Discovery Listeners ----------
    botInstance.on('message', async (msg) => {
      if (!msg.chat) return;
      const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
      if (!isGroup) return;

      // 1. Auto-discover / update group record
      const group = await upsertTelegramGroup(msg.chat);

      const text = (msg.text || '').trim();

      // Check if this is an administrative command
      const isSetClassCmd = /^\/(setclass|setgrade|linkclass|assignclass)/i.test(text);
      const isSetShiftCmd = /^\/(setshift)/i.test(text);
      const isGroupInfoCmd = /^\/(groupinfo|classinfo|groupstatus)/i.test(text);

      if (isSetClassCmd || isSetShiftCmd || isGroupInfoCmd) {
        // Enforce admin permission: only Group Creator / Admin or Sunday School Admin can configure
        const isAuthorized = await isAuthorizedAdmin(msg.chat.id, msg.from?.id, msg);
        if (!isAuthorized) {
          const warnMsg = `⛔ *ይቅርታ! ይህን ትእዛዝ የማስፈጸም ፈቃድ የተሰጠው ለግሩፑ አስተዳዳሪ (Group Admin) ብቻ ነው።*\n\n_የክፍል እና የፈረቃ ምደባ ማስተካከል የሚችሉት የግሩፑ አስተዳዳሪዎች ብቻ ናቸው።_`;
          await safeSendMessage(msg.chat.id, warnMsg, { parse_mode: 'Markdown' });
          return;
        }
      }

      // 2. Handle /setclass or /setgrade command inside group
      if (isSetClassCmd) {
        const parts = text.split(/\s+/);
        const rawArgs = parts.slice(1).join(' ');

        if (!rawArgs) {
          const currentShiftLabel = group?.shift === 'night' ? 'የማታ (Night)' : (group?.shift === 'weekend' ? 'የቀን (Weekend/Day)' : 'ሁሉም ፈረቃዎች (All Shifts)');
          const helpMsg = `ℹ️ *የክፍል እና የፈረቃ ምደባ ትእዛዝ (Set Class & Shift)*\n\nእባክዎ ክፍሉን እና ፈረቃውን (የቀን ወይም የማታ) ጨምረው ይጻፉ።\n\n*ምሳሌዎች፦*\n👉 \`/setclass Grade 7 weekend\` (ለ 7ኛ ክፍል የቀን/ቅዳሜ)\n👉 \`/setclass Grade 7 night\` (ለ 7ኛ ክፍል የማታ)\n👉 \`/setclass 8 ማታ\`\n👉 \`/setclass Grade 12 all\`\n👉 \`/setclass All\` (ለሁሉም ክፍሎች)\n\nአሁን የተመደበለት፦ *${group?.assignedGrade || 'All Classes'}* (${currentShiftLabel})`;
          await safeSendMessage(msg.chat.id, helpMsg, { parse_mode: 'Markdown' });
          return;
        }

        const { grade: normalizedGrade, shift: normalizedShift } = parseGradeAndShift(rawArgs);
        if (group) {
          group.assignedGrade = normalizedGrade;
          group.shift = normalizedShift;
          group.lastActivityAt = new Date();
          await group.save();
        }

        const shiftAm = normalizedShift === 'night' ? 'የማታ (Night)' : (normalizedShift === 'weekend' ? 'የቀን / ቅዳሜና እሑድ (Weekend/Day)' : 'ሁሉም ፈረቃዎች (All Shifts)');
        const successMsg = `✅ *የቴሌግራም ግሩፕ ከክፍልና ከፈረቃ ጋር ተገናኝቷል!*\n\n🏛️ *ግሩፕ፦* ${msg.chat.title}\n🎓 *ክፍል፦* *${normalizedGrade}*\n⏰ *ፈረቃ፦* *${shiftAm}*\n\n📢 ከአስተዳዳሪው ወይም ከመምህራን ለዚህ ክፍልና ፈረቃ የሚላኩ መልእክቶችና ማስታወቂያዎች በቀጥታ ወደዚህ ግሩፕ ይደርሳሉ።`;
        await safeSendMessage(msg.chat.id, successMsg, { parse_mode: 'Markdown' });
        return;
      }

      // Handle /setshift command directly
      if (isSetShiftCmd) {
        const parts = text.split(/\s+/);
        const rawShift = parts.slice(1).join(' ');
        const normalizedShift = normalizeShiftString(rawShift);
        if (group) {
          group.shift = normalizedShift;
          group.lastActivityAt = new Date();
          await group.save();
        }
        const shiftAm = normalizedShift === 'night' ? 'የማታ (Night)' : (normalizedShift === 'weekend' ? 'የቀን / ቅዳሜና እሑድ (Weekend/Day)' : 'ሁሉም ፈረቃዎች (All Shifts)');
        await safeSendMessage(msg.chat.id, `✅ የግሩፑ ፈረቃ ወደ *${shiftAm}* ተቀይሯል!`, { parse_mode: 'Markdown' });
        return;
      }

      // 3. Handle /groupinfo or /classinfo command
      if (isGroupInfoCmd) {
        const currentGrade = group?.assignedGrade || 'All Classes';
        const currentShiftLabel = group?.shift === 'night' ? '🌙 የማታ (Night)' : (group?.shift === 'weekend' ? '☀️ የቀን / ቅዳሜና እሑድ (Weekend/Day)' : '✨ ሁሉም ፈረቃዎች (All Shifts)');
        const infoMsg = `📋 *የግሩፕ መረጃ (Group Info)*\n\n🏛️ *የግሩፕ ስም፦* ${msg.chat.title}\n🆔 *Chat ID፦* \`${msg.chat.id}\`\n🎓 *የተመደበለት ክፍል፦* *${currentGrade}*\n⏰ *የተመደበለት ፈረቃ፦* *${currentShiftLabel}*\n👥 *የአባላት ብዛት፦* ${group?.memberCount || 'ያልታወቀ'}\n⚡ *ሁኔታ፦* ${group?.isActive ? '✅ ንቁ (Active)' : '❌ ቦዘኔ (Inactive)'}\n\n💡 _ክፍሉን ወይም ፈረቃውን ለመቀየር_ \`/setclass Grade 7 night\` _ብለው ይጻፉ ወይም በአስተዳዳሪው ፖርታል ያስተካክሉ።_`;
        await safeSendMessage(msg.chat.id, infoMsg, { parse_mode: 'Markdown' });
        return;
      }
    });

    // Detect when bot is added to a group
    botInstance.on('new_chat_members', async (msg) => {
      if (!msg.chat || (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup')) return;
      const botUser = botInfo;
      const isBotAdded = msg.new_chat_members?.some(
        (member) => member.id === botUser?.id || member.username === botUser?.username
      );

      if (isBotAdded) {
        await upsertTelegramGroup(msg.chat);
        const welcomeGroupMsg = `🕊️ *ሰላም ለሁላችሁ!* 🕊️\n\nየ *ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት* ይፋዊ የቴሌግራም ቦት ወደዚህ ግሩፕ ተቀላቅሏል! ⛪\n\nይህን ግሩፕ ከተማሪዎች ክፍል ጋር ለማገናኘት፡\n👉 \`/setclass Grade 7\` (ለምሳሌ ለ 7ኛ ክፍል)\n👉 \`/setclass Grade 8\`\n👉 \`/setclass All\` (ለሁሉም ክፍሎች)\n\nወይም በአስተዳዳሪው ፖርታል (Admin Dashboard) ውስጥ በቀላሉ መመደብ ይችላሉ።\n\nመልካም የትምህርት ጊዜ! ✨`;
        await safeSendMessage(msg.chat.id, welcomeGroupMsg, { parse_mode: 'Markdown' });
      }
    });

    // Detect when bot membership status updates in chat/channel/supergroup
    botInstance.on('my_chat_member', async (update) => {
      try {
        if (!update || !update.chat) return;
        const newStatus = update.new_chat_member?.status;
        const chatId = String(update.chat.id);
        if (newStatus === 'member' || newStatus === 'administrator') {
          await upsertTelegramGroup(update.chat);
        } else if (newStatus === 'left' || newStatus === 'kicked') {
          await TelegramGroup.findOneAndUpdate(
            { chatId },
            { isActive: false, lastActivityAt: new Date() }
          ).catch(() => {});
        }
      } catch (err) {
        console.warn('my_chat_member notice:', err.message);
      }
    });

    // Detect posts in channels
    botInstance.on('channel_post', async (msg) => {
      if (msg && msg.chat) {
        await upsertTelegramGroup(msg.chat);
      }
    });

    // Detect when bot is removed from group
    botInstance.on('left_chat_member', async (msg) => {
      if (!msg.chat) return;
      const botUser = botInfo;
      if (msg.left_chat_member?.id === botUser?.id) {
        await TelegramGroup.findOneAndUpdate(
          { chatId: String(msg.chat.id) },
          { isActive: false, lastActivityAt: new Date() }
        ).catch(() => {});
      }
    });

    /**
     * Send polite privacy notice and 1-click private chat redirect button for group interactions
     */
    const sendGroupToPrivateRedirect = async (chatId, fromUser, action = 'start') => {
      const username = botInfo?.username;
      const botLink = username ? `https://t.me/${username}?start=${action}` : 'https://t.me';
      const name = fromUser?.first_name || 'ተማሪ';

      const text = `🔒 *የግል መረጃ ጥበቃ (Private Student Access)*\n\n` +
        `ሰላም *${name}*፣ የእርስዎን የግል የተማሪ ማህደር፣ የፈተና ውጤት፣ የዕለታዊ ክትትልና ሰርተፊኬት ደህንነት ለመጠበቅ አገልግሎቱ የሚሰጠው *በግል (Direct Message)* ብቻ ነው።\n\n` +
        `👇 ከታች ያለውን አዝራር በመጫን በግል አካውንትዎ ይክፈቱ፦`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: '💬 በግል አካውንትዎ ይክፈቱ (Open Private Chat)', url: botLink }
          ]
        ]
      };

      return await safeSendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    };

    // ---------- 1. /start & /menu Commands (With Deep Linking Support) ----------
    botInstance.onText(/\/start(?:\s+(.+))?|\/menu/, async (msg, match) => {
      try {
        const chatId = msg.chat.id;
        const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
        const actionParam = match && match[1] ? match[1].trim().toLowerCase() : null;

        // Group chats should strictly redirect students to private DM
        if (isGroup) {
          return sendGroupToPrivateRedirect(chatId, msg.from, actionParam || 'menu');
        }

        const firstName = msg.from?.first_name || 'ወዳጃችን';
        const student = await findLinkedStudent(chatId).catch(() => null);

        // Instant deep-link routing if arrived from private button or group redirect
        if (actionParam === 'profile') return handleProfile(chatId);
        if (actionParam === 'certificate') return handleCertificate(chatId);
        if (actionParam === 'attendance') return handleAttendance(chatId);
        if (actionParam === 'courses') return handleCourses(chatId);
        if (actionParam === 'results') return handleResults(chatId);
        if (actionParam === 'announcements') return handleAnnouncements(chatId);
        if (actionParam === 'portal') return handlePortal(chatId);
        if (actionParam === 'help') return handleHelp(chatId);

        let welcomeMsg = `╭──────────────────────────────╮\n`;
        welcomeMsg += `    ⛪ *ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት* ⛪\n`;
        welcomeMsg += `    ✝️ *ደብረ መድኃኒት መድኃኔዓለም ቤ/ክ* ✝️\n`;
        welcomeMsg += `╰──────────────────────────────╯\n\n`;
        welcomeMsg += `✨ *በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።*\n\n`;
        welcomeMsg += `ሰላም *${firstName}*፣ እንኳን ወደ *ተክለ ሳዊሮስ ሰንበት ት/ቤት* ይፋዊ የቴሌግራም ዲጂታል አገልግሎት በደህና መጡ! 🕊️\n\n`;

        if (student) {
          const studentName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
          welcomeMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          welcomeMsg += `✅ *የተገናኘ የተማሪ ማህደር (Linked Student)*\n`;
          welcomeMsg += `👤 *ስም፦* ${studentName}\n`;
          welcomeMsg += `🏷️ *መለያ ቁጥር፦* \`${student.studentId || '-'}\`\n`;
          welcomeMsg += `📚 *ክፍል፦* ${student.grade || student.batch || '-'}\n`;
          welcomeMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          welcomeMsg += `ከዚህ በታች ያሉትን አዝራሮች በመጠቀም መረጃዎን ማግኘት ወይም ሙሉውን የተማሪ ፖርታል በቴሌግራም ውስጥ መክፈት ይችላሉ፦`;
        } else {
          welcomeMsg += `✨ *አዲስ ተማሪ ከሆኑ፦*\n`;
          welcomeMsg += `በቀጥታ በኦንላይን ለመመዝገብ ከታች ያለውን *"📝 አዲስ ተማሪ ምዝገባ (Register Now)"* የሚለውን ይጫኑ።\n\n`;
          welcomeMsg += `💡 *ቀድመው የተመዘገቡ ተማሪ ከሆኑ፦*\n`;
          welcomeMsg += `እባክዎ ከታች ያለውን *"📱 ስልክ ቁጥር ያገናኙ (Link Phone)"* የሚለውን አዝራር በመጫን በሰንበት ት/ቤቱ የተመዘገቡበትን ስልክ ቁጥር ያጋሩ።`;
        }

        const inlineKeyboard = {
          inline_keyboard: student
            ? [
                [
                  buildPortalInlineButton('🎓 የተማሪዎች ፖርታል ክፈት (Open Portal)', '/dashboard')
                ],
                [
                  { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' },
                  { text: '📅 የዕለታዊ ክትትል', callback_data: 'cmd_attendance' }
                ],
                [
                  { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' },
                  { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' }
                ],
                [
                  { text: '📜 ሰርተፊኬት', callback_data: 'cmd_certificate' },
                  { text: '📢 ማስታወቂያዎች', callback_data: 'cmd_announcements' }
                ],
                [
                  { text: '❓ እርዳታ', callback_data: 'cmd_help' }
                ]
              ]
            : [
                [
                  buildPortalInlineButton('📝 አዲስ ተማሪ ምዝገባ (Register Now)', '/register-regular')
                ],
                [
                  buildPortalInlineButton('🌐 የርቀት ትምህርት ምዝገባ (Distance)', '/register-distance')
                ],
                [
                  buildPortalInlineButton('🎓 የተማሪዎች ፖርታል (Open Portal)', '/dashboard')
                ],
                [
                  { text: '🔍 የምዝገባ ሁኔታ ማረጋገጫ', callback_data: 'cmd_status_prompt' },
                  { text: '❓ እርዳታ', callback_data: 'cmd_help' }
                ]
              ]
        };

        await safeSendMessage(chatId, welcomeMsg, {
          parse_mode: 'Markdown',
          reply_markup: getMainReplyKeyboard()
        });

        await safeSendMessage(chatId, '👇 *ፈጣን መዳረሻ (Quick Actions)፦*', {
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard
        });
      } catch (err) {
        console.error('Telegram /start error:', err);
      }
    });

    // ---------- 2. Contact Share Handler (Account Linking) ----------
    botInstance.on('contact', async (msg) => {
      try {
        const chatId = msg.chat.id;
        const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

        // If shared inside a group, immediately delete the contact message to protect phone number and redirect to DM
        if (isGroup) {
          if (botInstance.deleteMessage) {
            botInstance.deleteMessage(chatId, msg.message_id).catch(() => {});
          }
          return sendGroupToPrivateRedirect(chatId, msg.from, 'link');
        }

        const contact = msg.contact;
        if (!contact || !contact.phone_number) {
          return safeSendMessage(chatId, '⚠️ ስልክ ቁጥር ማግኘት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
        }

        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
          return safeSendMessage(
            chatId,
            `⏳ *የዳታቤዝ ግንኙነት በመካሄድ ላይ ነው...*\n\nእባክዎ ከጥቂት ሰከንዶች በኋላ እንደገና *"📱 ስልክ ቁጥር ያገናኙ"* የሚለውን ይጫኑ።`,
            { parse_mode: 'Markdown', reply_markup: getMainReplyKeyboard() }
          );
        }

        const rawPhone = contact.phone_number;
        const linked = await findLinkedStudent(chatId, rawPhone);

        if (!linked) {
          return safeSendMessage(
            chatId,
            `❌ *ስልክ ቁጥርዎ (${rawPhone}) በሲስተሙ አልተገኘም።*\n\nእባክዎ በሰንበት ት/ቤቱ የተመዘገቡበትን ትክክለኛ ስልክ ቁጥር ያረጋግጡ ወይም ለአስተዳዳሪው ያሳውቁ።`,
            { parse_mode: 'Markdown', reply_markup: getMainReplyKeyboard() }
          );
        }

        const studentName = [linked.firstName, linked.middleName, linked.lastName].filter(Boolean).join(' ') || 'ተማሪ';
        const studentId = linked.studentId || '-';
        const grade = linked.grade || linked.batch || 'መደበኛ';

        let successMsg = `🎉 *እንኳን ደስ አለዎት! አካውንትዎ በተሳካ ሁኔታ ተገናኝቷል!*\n\n`;
        successMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        successMsg += `👤 *የተማሪ ስም፦* ${studentName}\n`;
        successMsg += `🏷️ *መለያ ቁጥር፦* \`${studentId}\`\n`;
        successMsg += `📚 *ክፍል / ደረጃ፦* ${grade}\n`;
        successMsg += `📱 *ስልክ ቁጥር፦* ${rawPhone}\n`;
        successMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        successMsg += `አሁን ከታች ያሉትን አዝራሮች በመጠቀም መረጃዎን ማግኘት ወይም የተማሪውን ሙሉ ፖርታል መክፈት ይችላሉ፦`;

        await safeSendMessage(chatId, successMsg, {
          parse_mode: 'Markdown',
          reply_markup: getMainReplyKeyboard()
        });

        await safeSendMessage(chatId, '👇 *የተማሪዎች ፖርታል (Student Portal)፦*', {
          reply_markup: {
            inline_keyboard: [
              [
                buildPortalInlineButton('🎓 የተማሪዎች ፖርታል ክፈት (Open Portal)', '/dashboard')
              ],
              [
                { text: '👤 የእኔ መረጃ (Profile)', callback_data: 'cmd_profile' },
                { text: '📅 የዕለታዊ ክትትል (Attendance)', callback_data: 'cmd_attendance' }
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram contact link error:', err);
        safeSendMessage(msg.chat.id, '⚠️ ስህተት ተከስቷል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።');
      }
    });

    // ---------- 3. /profile & "👤 የእኔ መረጃ" (With Digital QR Badge) ----------
    const handleProfile = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        if (!student) {
          return safeSendMessage(
            chatId,
            '⚠️ *የተገናኘ የተማሪ አካውንት አልተገኘም።*\n\nእባክዎ መጀመሪያ *"📱 ስልክ ቁጥር ያገናኙ"* የሚለውን አዝራር በመጫን ስልክ ቁጥርዎን ያጋሩ።',
            { parse_mode: 'Markdown', reply_markup: getMainReplyKeyboard() }
          );
        }

        const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
        const shift = student.shift === 'night' ? 'የማታ (Night)' : 'የቀን / ቅዳሜና እሁድ (Weekend)';
        const track = student.studentType === 'distance' ? 'የርቀት ትምህርት (Distance)' : 'መደበኛ ትምህርት (Regular)';
        const webAppUrl = getWebAppUrl();

        let msg = `╭──────────────────────────────╮\n`;
        msg += `   🎓 *የተማሪ ይፋዊ ዲጂታል ማህደር* 🎓\n`;
        msg += `╰──────────────────────────────╯\n\n`;
        msg += `👤 *ሙሉ ስም፦* ${fullName}\n`;
        if (student.christianName) {
          msg += `✝️ *የክርስትና ስም፦* ${student.christianName}\n`;
        }
        msg += `🏷️ *መለያ ቁጥር፦* \`${student.studentId || '-'}\`\n`;
        msg += `📝 *የማመልከቻ ቁጥር፦* \`${student.registrationNumber || '-'}\`\n`;
        msg += `📚 *ክፍል / ደረጃ፦* ${student.grade || student.batch || '-'}\n`;
        msg += `🏛️ *የትምህርት ዓይነት፦* ${track}\n`;
        msg += `⏰ *ፈረቃ፦* ${shift}\n`;
        if (student.hasConfessionFather) {
          msg += `✝️ *የንስሐ አባት፦* ${student.confessionFatherName || '-'}`;
          if (student.confessionFatherPhone) msg += ` (${student.confessionFatherPhone})`;
          msg += `\n`;
        }
        msg += `📞 *ስልክ ቁጥር፦* ${student.studentPhone || student.contactPhone || '-'}\n`;
        msg += `📍 *አድራሻ፦* ${student.address || student.subcity || '-'}\n`;
        if (student.teacher) {
          msg += `👨‍🏫 *ኃላፊ መምህር፦* ${student.teacher.fullName || student.teacher.email || '-'}\n`;
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        msg += `💡 _ይህንን ዲጂታል QR ባጅ በመጠቀም የትምህርት ቤት አገልግሎቶችንና መታወቂያዎን ማረጋገጥ ይችላሉ።_`;

        const inlineKeyboard = {
          inline_keyboard: [
            [
              buildPortalInlineButton('🎓 ሙሉ ማህደሩን በፖርታል ይመልከቱ', '/dashboard/profile')
            ],
            [
              { text: '📅 የዕለታዊ ክትትል', callback_data: 'cmd_attendance' },
              { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' }
            ],
            [
              { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' },
              { text: '📢 ማስታወቂያዎች', callback_data: 'cmd_announcements' }
            ]
          ]
        };

        // Generate High-Res Student QR Code Verification Badge
        const verifyUrl = `${webAppUrl}/verify-certificate?id=${encodeURIComponent(student.studentId || student._id)}`;
        const qrBuffer = await QRCode.toBuffer(verifyUrl, {
          width: 400,
          margin: 2,
          color: { dark: '#1e3a8a', light: '#ffffff' }
        }).catch(() => null);

        if (qrBuffer) {
          await safeSendPhoto(chatId, qrBuffer, msg, {
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          });
        } else {
          await safeSendMessage(chatId, msg, {
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          });
        }
      } catch (err) {
        console.error('Telegram handleProfile error:', err);
      }
    };

    botInstance.onText(/\/profile|👤 የእኔ መረጃ/, (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'profile');
      }
      handleProfile(msg.chat.id);
    });

    // ---------- 4. /attendance & "📅 የዕለታዊ ክትትል" (Visual Progress Bar + Period Filters) ----------
    const handleAttendance = async (chatId, mode = 'all') => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        if (!student) {
          return safeSendMessage(
            chatId,
            '⚠️ *የተገናኘ የተማሪ አካውንት አልተገኘም።*\n\nእባክዎ መጀመሪያ *"📱 ስልክ ቁጥር ያገናኙ"* የሚለውን ይጫኑ።',
            { reply_markup: getMainReplyKeyboard() }
          );
        }

        const query = { student: student._id };
        let periodLabel = 'ጠቅላላ (All Time)';
        if (mode === 'month') {
          const monthStart = new Date();
          monthStart.setDate(monthStart.getDate() - 30);
          monthStart.setHours(0, 0, 0, 0);
          query.date = { $gte: monthStart };
          periodLabel = 'ያለፉት 30 ቀናት (Last 30 Days)';
        }

        const rawLogs = await Attendance.find(query)
          .populate('sessionId', 'title grade sessionDate startTime')
          .populate('course', 'name code')
          .sort({ date: -1, checkInTime: -1 })
          .lean()
          .catch(() => []);

        const logs = deduplicateBotAttendance(rawLogs);
        const total = logs.length;
        const present = logs.filter((l) => String(l.status || '').toLowerCase() === 'present').length;
        const late = logs.filter((l) => String(l.status || '').toLowerCase() === 'late').length;
        const excused = logs.filter((l) => String(l.status || '').toLowerCase() === 'excused').length;
        const absent = logs.filter((l) => String(l.status || '').toLowerCase() === 'absent').length;

        const effectivePresent = present + late;
        const rate = total > 0 ? Math.round((effectivePresent / total) * 100) : 100;
        const progressBar = generateProgressBar(rate, 10);
        const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ').trim();

        let msg = `╭──────────────────────────────╮\n`;
        msg += `   📅 *የዕለታዊ ክትትል ሁኔታ (Attendance)* 📅\n`;
        msg += `╰──────────────────────────────╯\n\n`;
        msg += `👤 *ተማሪ፦* ${fullName}\n`;
        msg += `🏫 *ክፍል፦* ${student.grade || student.batch || '—'} | 📆 *ጊዜ፦* ${periodLabel}\n`;
        msg += `📊 *አጠቃላይ ክፍለ-ጊዜያት፦* ${total} ቀናት\n`;
        msg += `🟢 *በሰዓቱ የተገኙ፦* ${present} ቀናት\n`;
        if (late > 0) msg += `🟡 *የዘገዩ (Late)፦* ${late} ቀናት\n`;
        if (excused > 0) msg += `🔵 *በፈቃድ የቀሩ (Excused)፦* ${excused} ቀናት\n`;
        if (absent > 0) msg += `🔴 *ያልተገኙ (Absent)፦* ${absent} ቀናት\n`;
        msg += `\n📈 *የተገኝነት ምጣኔ፦* *${rate}%*\n`;
        msg += `\`${progressBar}\`\n`;

        if (total > 0 && rate < 75) {
          msg += `⚠️ _ማሳሰቢያ፦ የተገኝነት ምጣኔዎ ከ75% በታች ነው። እባክዎ ክትትልዎን ያጠናክሩ!_\n`;
        } else if (total >= 3 && rate >= 90) {
          msg += `🌟 _እጅግ በጣም ጥሩ ትጋት! እግዚአብሔር ይባርክዎት!_\n`;
        }

        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        const showCount = mode === 'recent15' ? 15 : 6;
        if (logs.length > 0) {
          msg += `📋 *የቅርብ ጊዜ ክትትሎች (${Math.min(showCount, logs.length)}/${logs.length})፦*\n`;
          logs.slice(0, showCount).forEach((l) => {
            const statusIcon = getStatusBadgeAmharic(l.status);
            const title = l.sessionId?.title || l.session || l.course?.name || l.courseName || 'መደበኛ ትምህርት';
            const reasonSuffix = l.excuseReason ? ` _(${l.excuseReason})_` : '';
            msg += `• ${formatEthiopianDate(l.date)} — *${title}* [${statusIcon}]${reasonSuffix}\n`;
          });
        } else {
          msg += `💡 _በዚህ ጊዜ ውስጥ የተመዘገበ የዕለታዊ ክትትል መረጃ የለም።_\n`;
        }

        await safeSendMessage(chatId, msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: mode === 'month' ? '✅ ያለፉት 30 ቀናት' : '📅 ያለፉት 30 ቀናት', callback_data: 'att_month' },
                { text: mode === 'all' ? '✅ ጠቅላላ' : '📊 ጠቅላላ', callback_data: 'att_all' },
                { text: mode === 'recent15' ? '✅ 15 መዝገብ' : '📋 15 መዝገብ', callback_data: 'att_recent15' },
              ],
              [
                buildPortalInlineButton('📊 ሙሉ የክትትል ዝርዝር በፖርታል ክፈት', '/dashboard/attendance')
              ],
              [
                { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' },
                { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' },
                { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' }
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleAttendance error:', err);
      }
    };

    botInstance.onText(/\/attendance|📅 የዕለታዊ ክትትል/, (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'attendance');
      }
      handleAttendance(msg.chat.id);
    });

    // ---------- 5. /courses & "📚 ትምህርቶች" ----------
    const handleCourses = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        if (!student) {
          return safeSendMessage(chatId, '⚠️ እባክዎ መጀመሪያ ስልክ ቁጥርዎን ያገናኙ።', { reply_markup: getMainReplyKeyboard() });
        }

        const populated = await Student.findById(student._id).populate({
          path: 'courses',
          populate: { path: 'teacher', select: 'fullName phone' }
        }).catch(() => null);

        let courseList = populated?.courses || [];
        if (courseList.length === 0 && student.grade) {
          courseList = await Course.find({
            $or: [{ grade: student.grade }, { grade: `Grade ${student.grade}` }],
            status: { $regex: /^active$/i }
          }).populate('teacher', 'fullName phone').catch(() => []);
        }

        let msg = `╭──────────────────────────────╮\n`;
        msg += `   📚 *የተመዘገቡባቸው ትምህርቶች (Courses)* 📚\n`;
        msg += `╰──────────────────────────────╯\n\n`;
        msg += `👤 *ተማሪ፦* ${student.firstName} ${student.lastName}\n`;
        msg += `🏷️ *ደረጃ / ክፍል፦* ${student.grade || student.batch || '-'}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (courseList.length === 0) {
          msg += `_እስካሁን በሲስተሙ የተመዘገቡበት ትምህርት የለም።_\n`;
        } else {
          courseList.forEach((c, idx) => {
            msg += `${idx + 1}. 📖 *${c.name}*\n`;
            if (c.grade) msg += `   ├ 🏷️ ክፍል፦ ${c.grade}\n`;
            if (c.schedule) msg += `   ├ ⏰ ሰዓት፦ ${c.schedule}\n`;
            if (c.teacher?.fullName) msg += `   └ 👨‍🏫 መምህር፦ ${c.teacher.fullName}\n`;
            msg += `\n`;
          });
        }

        await safeSendMessage(chatId, msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                buildPortalInlineButton('📚 የትምህርት ክፍሎችን በፖርታል ክፈት', '/dashboard/courses')
              ],
              [
                { text: '📅 የዕለታዊ ክትትል', callback_data: 'cmd_attendance' },
                { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' }
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleCourses error:', err);
      }
    };

    botInstance.onText(/\/courses|📚 ትምህርቶች/, (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'courses');
      }
      handleCourses(msg.chat.id);
    });

    // ---------- 6. /results & "🏆 የፈተና ውጤት" (With Medals & Grades) ----------
    const handleResults = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        if (!student) {
          return safeSendMessage(chatId, '⚠️ እባክዎ መጀመሪያ ስልክ ቁጥርዎን ያገናኙ።', { reply_markup: getMainReplyKeyboard() });
        }

        const results = await ExamResult.find({ student: student._id }).populate('quiz', 'title').sort({ submittedAt: -1 }).limit(6).catch(() => []);

        let msg = `╭──────────────────────────────╮\n`;
        msg += `   🏆 *የፈተናና የፈተና ውጤቶች (Results)* 🏆\n`;
        msg += `╰──────────────────────────────╯\n\n`;
        msg += `👤 *ተማሪ፦* ${student.firstName} ${student.lastName}\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (results.length === 0) {
          msg += `_እስካሁን በሲስተሙ የተመዘገበ የፈተና ውጤት የለም።_\n`;
        } else {
          results.forEach((r, idx) => {
            const score = r.score ?? r.totalScore ?? 0;
            const total = r.maxScore ?? 100;
            const pct = total > 0 ? Math.round((score / total) * 100) : 0;
            const badge = getScoreBadge(score, total);

            msg += `${idx + 1}. 📝 *${r.quiz?.title || 'የፈተና ምዘና'}*\n`;
            msg += `   ├ 📊 ውጤት፦ *${score}/${total}* (${pct}%)\n`;
            msg += `   ├ ${badge.medal} ደረጃ፦ *${badge.grade}* (${badge.label})\n`;
            if (r.submittedAt) msg += `   └ 📅 ቀን፦ ${formatEthiopianDate(r.submittedAt)}\n`;
            msg += `\n`;
          });
        }

        await safeSendMessage(chatId, msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                buildPortalInlineButton('🏆 ሙሉ ውጤቶችን በፖርታል ይመልከቱ', '/dashboard/results')
              ],
              [
                { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' },
                { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' }
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleResults error:', err);
      }
    };

    botInstance.onText(/\/results|🏆 የፈተና ውጤት/, (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'results');
      }
      handleResults(msg.chat.id);
    });

    // ---------- 7. /announcements & "📢 ማስታወቂያዎች" ----------
    const handleAnnouncements = async (chatId) => {
      try {
        const anns = await Announcement.find({ status: { $ne: 'archived' } }).sort({ createdAt: -1 }).limit(3).catch(() => []);

        let msg = `╭──────────────────────────────╮\n`;
        msg += `   📢 *ወቅታዊ የቤተክርስቲያን ማስታወቂያዎች* 📢\n`;
        msg += `╰──────────────────────────────╯\n\n`;

        if (anns.length === 0) {
          msg += `_በአሁኑ ሰዓት ምንም አዲስ ማስታወቂያ የለም።_\n`;
        } else {
          anns.forEach((a, idx) => {
            const priorityBadge = a.priority === 'urgent' ? '🔴 አስቸኳይ' : (a.priority === 'high' ? '🟡 አስፈላጊ' : '🔵 መደበኛ');
            msg += `${idx + 1}. 🔔 *${a.title}* [${priorityBadge}]\n`;
            msg += `   ${a.message || a.content || a.description || ''}\n`;
            msg += `   📅 _የተለጠፈበት ቀን፦ ${formatEthiopianDate(a.createdAt)}_\n\n`;
          });
        }
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        await safeSendMessage(chatId, msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                buildPortalInlineButton('📢 ሁሉንም ማስታወቂያዎች በፖርታል ክፈት', '/dashboard/announcements')
              ],
              [
                { text: '🔄 አድስ (Refresh)', callback_data: 'cmd_announcements' },
                { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' }
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleAnnouncements error:', err);
      }
    };

    botInstance.onText(/\/announcements|📢 ማስታወቂያዎች/, async (msg) => {
      const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
      if (isGroup) {
        const isAdmin = await isAuthorizedAdmin(msg.chat.id, msg.from?.id, msg);
        if (!isAdmin) {
          return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'announcements');
        }
      }
      handleAnnouncements(msg.chat.id);
    });

    // ---------- 8. /portal & "🎓 የተማሪዎች ፖርታል" ----------
    const handlePortal = async (chatId) => {
      const webAppUrl = getWebAppUrl();
      const hasHttps = isHttpsUrl(webAppUrl);

      let msg = `╭──────────────────────────────╮\n`;
      msg += `    🎓 *የተክለ ሳዊሮስ ሰንበት ት/ቤት ፖርታል* 🎓\n`;
      msg += `╰──────────────────────────────╯\n\n`;
      msg += `የተማሪዎች ፖርታል አጠቃላይ የትምህርት፣ የፈተና፣ የዕለታዊ ክትትልና የሰርተፊኬት መረጃዎችን በአንድ ቦታ የያዘ ዘመናዊ መተግበሪያ ነው። ✨\n\n`;
      if (!hasHttps) {
        msg += `🔗 *የፖርታሉ አድራሻ፦* ${webAppUrl}/dashboard\n\n`;
        msg += `💡 _በአሳሽዎ (Browser) ወይም ከታች ያለውን አዝራር በመጫን መክፈት ይችላሉ።_`;
      } else {
        msg += `ከታች ያለውን አዝራር በመጫን በቀጥታ በቴሌግራም ውስጥ መክፈት ይችላሉ፦`;
      }

      await safeSendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              buildPortalInlineButton('🎓 የተማሪዎች ፖርታል ክፈት (Launch App)', '/dashboard')
            ]
          ]
        }
      });
    };

    botInstance.onText(/\/portal|🎓 የተማሪዎች ፖርታል/, async (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'portal');
      }
      handlePortal(msg.chat.id);
    });

    // ---------- 9. /verify & Certificate / ID Verification ----------
    botInstance.onText(/\/verify(?:\s+(.+))?|🔍 መታወቂያ \/ ሰርተፊኬት/, async (msg, match) => {
      try {
        const chatId = msg.chat.id;
        const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
        if (isGroup) {
          const isAdmin = await isAuthorizedAdmin(chatId, msg.from?.id, msg);
          if (!isAdmin) {
            return sendGroupToPrivateRedirect(chatId, msg.from, 'verify');
          }
        }

        const certInput = match && match[1] ? match[1].trim() : null;

        if (!certInput) {
          let promptMsg = `🔍 *ሰርተፊኬት ወይም የተማሪ መታወቂያ ለማረጋገጥ፦*\n\n`;
          promptMsg += `እባክዎ ትዕዛዙን ከማረጋገጫ ቁጥሩ ጋር ይላኩ።\n\n`;
          promptMsg += `📌 *ምሳሌዎች፦*\n`;
          promptMsg += `• \`/verify TKS-CERT-2026-1001\`\n`;
          promptMsg += `• \`/verify STU-2026-0042\``;

          return safeSendMessage(chatId, promptMsg, { parse_mode: 'Markdown' });
        }

        // 1. Search Certificate
        const cert = await Certificate.findOne({
          $or: [
            { certificateNumber: certInput },
            { certificateNumber: certInput.toUpperCase() },
            { certNumber: certInput },
          ]
        }).populate('studentId', 'firstName lastName middleName grade studentId').catch(() => null);

        if (cert) {
          const studentName = cert.studentId
            ? `${cert.studentId.firstName} ${cert.studentId.lastName}`
            : cert.recipientName || 'ተማሪ';

          let resMsg = `╭──────────────────────────────╮\n`;
          resMsg += `    📜 *ኦፊሴላዊ የሰርተፊኬት ማረጋገጫ* 📜\n`;
          resMsg += `╰──────────────────────────────╯\n\n`;
          resMsg += `✅ *ይህ ሰርተፊኬት ትክክለኛና በይፋ የተረጋገጠ ነው!* ✨\n\n`;
          resMsg += `🎓 *የተማሪ ስም፦* ${studentName}\n`;
          resMsg += `📜 *የሰርተፊኬት ቁጥር፦* \`${cert.certificateNumber || cert.certNumber}\`\n`;
          resMsg += `🏆 *የትምህርት መስክ፦* ${cert.courseName || cert.title || 'ሰንበት ት/ቤት'}\n`;
          resMsg += `📅 *የተሰጠበት ቀን፦* ${formatEthiopianDate(cert.issueDate || cert.createdAt)}\n`;
          resMsg += `🏛️ *ሰጭ አካል፦* ተክለ ሳዊሮስ ሰንበት ት/ቤት\n`;

          return safeSendMessage(chatId, resMsg, { parse_mode: 'Markdown' });
        }

        // 2. Search Student ID
        const student = await Student.findOne({
          $or: [
            { studentId: certInput },
            { studentId: certInput.toUpperCase() },
            { registrationNumber: certInput },
          ]
        }).catch(() => null);

        if (student) {
          const studentName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
          let resMsg = `╭──────────────────────────────╮\n`;
          resMsg += `    🎓 *ኦፊሴላዊ የተማሪ መታወቂያ ማረጋገጫ* 🎓\n`;
          resMsg += `╰──────────────────────────────╯\n\n`;
          resMsg += `✅ *ይህ የተማሪ መታወቂያ በይፋ የተረጋገጠ ነው!* ✨\n\n`;
          resMsg += `👤 *ሙሉ ስም፦* ${studentName}\n`;
          resMsg += `🏷️ *መለያ ቁጥር፦* \`${student.studentId}\`\n`;
          resMsg += `📚 *ክፍል፦* ${student.grade || student.batch || '-'}\n`;
          resMsg += `🏛️ *ተቋም፦* ተክለ ሳዊሮስ ሰንበት ት/ቤት\n`;

          return safeSendMessage(chatId, resMsg, { parse_mode: 'Markdown' });
        }

        return safeSendMessage(
          chatId,
          `❌ *መረጃው አልተገኘም (${certInput})*\n\nየተሳሳተ የሰርተፊኬት ወይም የተማሪ መለያ ቁጥር አስገብተዋል። እባክዎ አረጋግጠው እንደገና ይሞክሩ።`,
          { parse_mode: 'Markdown' }
        );
      } catch (err) {
        console.error('Telegram verify error:', err);
        safeSendMessage(msg.chat.id, '⚠️ የማረጋገጥ ሂደት ላይ ስህተት ተከስቷል።');
      }
    });

    // ---------- 10. /status Registration Lookup ----------
    botInstance.onText(/\/status(?:\s+(.+))?/, async (msg, match) => {
      try {
        const chatId = msg.chat.id;
        const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
        if (isGroup) {
          const isAdmin = await isAuthorizedAdmin(chatId, msg.from?.id, msg);
          if (!isAdmin) {
            return sendGroupToPrivateRedirect(chatId, msg.from, 'status');
          }
        }

        const regInput = match && match[1] ? match[1].trim() : null;

        if (!regInput) {
          return safeSendMessage(
            chatId,
            `📝 *የምዝገባ ሁኔታን ለማረጋገጥ፦*\n\nእባክዎ የማመልከቻ ቁጥርዎን ያስገቡ።\nምሳሌ፦ \`/status REG-2026-0042\``,
            { parse_mode: 'Markdown' }
          );
        }

        const Registration = require('../models/education/Registration');
        const reg = await Registration.findOne({
          $or: [
            { registrationNumber: regInput },
            { registrationNumber: regInput.toUpperCase() },
            { applicationNumber: regInput },
          ]
        }).catch(() => null);

        if (!reg) {
          return safeSendMessage(chatId, `❌ የማመልከቻ ቁጥር \`${regInput}\` አልተገኘም።`, { parse_mode: 'Markdown' });
        }

        let stMsg = `╭──────────────────────────────╮\n`;
        stMsg += `    📝 *የምዝገባ ማመልከቻ ሁኔታ* 📝\n`;
        stMsg += `╰──────────────────────────────╯\n\n`;
        stMsg += `👤 *ስም፦* ${reg.fullName || `${reg.firstName} ${reg.lastName}`}\n`;
        stMsg += `🏷️ *የማመልከቻ ቁጥር፦* \`${reg.registrationNumber}\`\n`;
        stMsg += `📚 *የተመረጠ ክፍል፦* ${reg.grade || '-'}\n`;
        stMsg += `📌 *የማመልከቻ ሁኔታ፦* *${reg.status || 'በመጠባበቅ ላይ'}*\n`;

        await safeSendMessage(chatId, stMsg, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('Telegram status lookup error:', err);
      }
    });

    // ---------- 11. /certificate & "📜 ሰርተፊኬት" ----------
    const handleCertificate = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        if (!student) {
          return safeSendMessage(
            chatId,
            '⚠️ *የተገናኘ የተማሪ አካውንት አልተገኘም።*\n\nእባክዎ መጀመሪያ *"📱 ስልክ ቁጥር ያገናኙ"* የሚለውን አዝራር በመጫን ስልክ ቁጥርዎን ያጋሩ።',
            { parse_mode: 'Markdown', reply_markup: getMainReplyKeyboard() }
          );
        }

        const cert = await Certificate.findOne({
          studentId: student._id,
        }).sort({ createdAt: -1 });

        const webAppUrl = getWebAppUrl();

        if (!cert) {
          let noCertMsg = `╭──────────────────────────────╮\n`;
          noCertMsg += `   📜 *የሰንበት ት/ቤት የምስክር ወረቀት* 📜\n`;
          noCertMsg += `╰──────────────────────────────╯\n\n`;
          noCertMsg += `👤 *ተማሪ፦* ${student.firstName} ${student.lastName}\n`;
          noCertMsg += `📚 *ክፍል፦* ${student.grade || student.batch || 'መደበኛ'}\n\n`;
          noCertMsg += `💡 እስካሁን የተዘጋጀ የምስክር ወረቀት የለም። ሁሉንም የክፍልዎን ኮርሶች እና ፈተናዎች ሲያጠናቅቁ የምስክር ወረቀት በራስ-ሰር ይዘጋጅልዎታል።\n`;

          return safeSendMessage(chatId, noCertMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  buildPortalInlineButton('📚 ኮርሶችንና ውጤቶችን በፖርታል ይመልከቱ', '/dashboard/courses')
                ],
                [
                  { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' },
                  { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' }
                ]
              ]
            }
          });
        }

        if (cert.status === 'Pending') {
          let pendingMsg = `╭──────────────────────────────╮\n`;
          pendingMsg += `   ⏳ *የምስክር ወረቀት በግምገማ ላይ* ⏳\n`;
          pendingMsg += `╰──────────────────────────────╯\n\n`;
          pendingMsg += `👤 *ተማሪ፦* ${cert.studentNameAmharic || cert.studentName}\n`;
          pendingMsg += `🏷️ *መለያ ቁጥር፦* \`${cert.studentNumber}\`\n`;
          pendingMsg += `📊 *አማካይ ውጤት፦* *${cert.averageScore || 95}%*\n`;
          pendingMsg += `🏆 *የማዕረግ ደረጃ፦* ${cert.honors || 'በማዕረግ ተመርቋል'}\n`;
          pendingMsg += `📚 *ያጠናቀቋቸው ኮርሶች፦* ${cert.completedCourses?.length || 13} ኮርሶች\n\n`;
          pendingMsg += `✨ *ሁሉንም የትምህርት መስፈርቶች አጠናቀዋል!* የምስክር ወረቀትዎ በአስተዳዳሪው የመጨረሻ ግምገማ ላይ ይገኛል። አስተዳዳሪው ይሁንታ (Approve) እንዳደረጉ ወዲያውኑ ይፋዊው የQR ኮድ ሰርተፊኬት ይደርስዎታል። 🕊️`;

          return safeSendMessage(chatId, pendingMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  buildPortalInlineButton('🎓 የተማሪዎች ፖርታል ክፈት', '/dashboard')
                ]
              ]
            }
          });
        }

        // Valid Approved Certificate
        let certMsg = `╭──────────────────────────────╮\n`;
        certMsg += `    🎓 *ይፋዊ የሰንበት ት/ቤት የምስክር ወረቀት* 🎓\n`;
        certMsg += `╰──────────────────────────────╯\n\n`;
        certMsg += `🎉 *እንኳን ደስ አለዎት! የምስክር ወረቀትዎ በይፋ ተረጋግጦ ተሰጥቷል።* ✨\n\n`;
        certMsg += `👤 *ስም፦* ${cert.studentNameAmharic || cert.studentName}\n`;
        certMsg += `📜 *የሰርተፊኬት ቁጥር፦* \`${cert.certificateNumber}\`\n`;
        certMsg += `🏷️ *የተማሪ መለያ፦* \`${cert.studentNumber}\`\n`;
        certMsg += `📊 *አማካይ ውጤት፦* *${cert.averageScore || 96.5}%*\n`;
        certMsg += `🏆 *የማዕረግ ደረጃ፦* ${cert.honors || 'በከፍተኛ ማዕረግ ተመርቋል'}\n`;
        certMsg += `📅 *የተሰጠበት ቀን፦* ${cert.issueDateEthiopian || '፳፻፲፯ ዓ.ም'}\n`;
        certMsg += `🏛️ *ተቋም፦* ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት\n`;
        certMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        certMsg += `💡 _ይህን የምስክር ወረቀት ለማየት፣ ለማተም ወይም በQR ኮድ ለማረጋገጥ ከታች ያሉትን አዝራሮች ይጠቀሙ፦_`;

        const certViewUrl = `${webAppUrl}/certificates/${cert.certificateNumber}`;
        const inlineKeyboard = {
          inline_keyboard: [
            [
              isHttpsUrl(webAppUrl)
                ? { text: '📜 የምስክር ወረቀትዎን በቴሌግራም ይመልከቱ', web_app: { url: certViewUrl } }
                : { text: '📜 የምስክር ወረቀትዎን ይመልከቱ (View Certificate)', url: certViewUrl }
            ],
            [
              { text: '🔍 ትክክለኛነት አረጋግጥ (Public Verify)', url: `${webAppUrl}/verify-certificate/${cert.certificateNumber}` }
            ],
            [
              { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' },
              { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' }
            ]
          ]
        };

        const qrBuffer = await QRCode.toBuffer(certViewUrl, {
          width: 400,
          margin: 2,
          color: { dark: '#0f4c9c', light: '#ffffff' }
        }).catch(() => null);

        if (qrBuffer) {
          await safeSendPhoto(chatId, qrBuffer, certMsg, {
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          });
        } else {
          await safeSendMessage(chatId, certMsg, {
            parse_mode: 'Markdown',
            reply_markup: inlineKeyboard
          });
        }
      } catch (err) {
        console.error('Telegram handleCertificate error:', err);
      }
    };

    botInstance.onText(/\/certificate|\/mycertificate|📜 ሰርተፊኬት/, (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'certificate');
      }
      handleCertificate(msg.chat.id);
    });

    // ---------- 12. /help & "❓ እርዳታ" ----------
    const handleHelp = async (chatId) => {
      let helpMsg = `╭──────────────────────────────╮\n`;
      helpMsg += `    📖 *የቦት አጠቃቀም መመሪያ (Help)* 📖\n`;
      helpMsg += `╰──────────────────────────────╯\n\n`;
      helpMsg += `🔹 \`/start\` — የቦቱን መነሻ ገጽ እና አዝራሮች ይከፍታል\n`;
      helpMsg += `🔹 \`/profile\` — የተማሪ መረጃዎን እና ዲጂታል QR ባጅዎን ያሳያል\n`;
      helpMsg += `🔹 \`/certificate\` — የምረቃ የምስክር ወረቀትዎን ያሳያል\n`;
      helpMsg += `🔹 \`/attendance\` — የዕለታዊ ክትትልዎንና የተገኝነት ምጣኔዎን ያሳያል\n`;
      helpMsg += `🔹 \`/courses\` — የተመዘገቡባቸውን ትምህርቶች ያሳያል\n`;
      helpMsg += `🔹 \`/results\` — የፈተና ውጤቶችን ያሳያል\n`;
      helpMsg += `🔹 \`/announcements\` — አዳዲስ ማስታወቂያዎችን ያሳያል\n`;
      helpMsg += `🔹 \`/portal\` — የተማሪዎች ፖርታል መክፈቻ\n`;
      helpMsg += `🔹 \`/verify <ቁጥር>\` — የሰርተፊኬት ወይም መታወቂያ ትክክለኛነት ያረጋግጣል\n`;
      helpMsg += `🔹 \`/status <ቁጥር>\` — የምዝገባ ሁኔታን ያሳያል\n\n`;
      helpMsg += `👨‍🏫 *ለመምህራንና አስተዳዳሪዎች፦*\n`;
      helpMsg += `🔹 \`/report\` — የዛሬ፣ ሳምንታዊ፣ የክፍልና ዝቅተኛ ተገኝነት ሪፖርት (+ CSV)\n`;
      helpMsg += `🔹 \`/report <ክፍል>\` — የአንድ ክፍል ሪፖርት (ምሳሌ፦ \`/report Grade 9\`)\n`;
      helpMsg += `🔹 \`/absentees\` — የዛሬ ያልተገኙ ተማሪዎች ዝርዝር\n`;
      helpMsg += `🔹 \`/checkin <መለያ/ስም>\` — የተማሪ ክትትል መመዝገቢያ\n\n`;
      helpMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      helpMsg += `🎓 እንዲሁም *"🎓 የተማሪዎች ፖርታል"* የሚለውን በመጫን ሙሉውን የሰንበት ት/ቤት ድረ-ገጽ በቀጥታ በቴሌግራም መክፈት ይችላሉ!`;

      await safeSendMessage(chatId, helpMsg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              buildPortalInlineButton('🎓 የተማሪዎች ፖርታል ክፈት', '/dashboard')
            ],
            [
              { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' },
              { text: '📜 ሰርተፊኬት', callback_data: 'cmd_certificate' }
            ],
            [
              { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' },
              { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' }
            ]
          ]
        }
      });
    };

    // ---------- 12. /register & "📝 አዲስ ተማሪ ምዝገባ" ----------
    const handleRegister = async (chatId) => {
      let msg = `╭──────────────────────────────╮\n`;
      msg += `    📝 *የተማሪዎች ምዝገባ (Registration)* 📝\n`;
      msg += `╰──────────────────────────────╯\n\n`;
      msg += `በ *ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት* ለመማር አዲስ ተማሪ ከሆኑ ከታች ያሉትን አዝራሮች በመጫን በኦንላይን በቀላሉ መመዝገብ ይችላሉ። ✨\n\n`;
      msg += `🔹 *የመደበኛ ትምህርት ምዝገባ (Regular)* — በቅዳሜና እሑድ ወይም በማታ ፈረቃ\n`;
      msg += `🔹 *የርቀት ትምህርት ምዝገባ (Distance)* — በኦንላይንና በርቀት\n\n`;
      msg += `👇 ለመመዝገብ የሚፈልጉትን የትምህርት ዓይነት ይምረጡ፦`;

      await safeSendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              buildPortalInlineButton('📝 የመደበኛ ተማሪዎች ምዝገባ (Regular)', '/register-regular'),
            ],
            [
              buildPortalInlineButton('🌐 የርቀት ትምህርት ምዝገባ (Distance)', '/register-distance'),
            ],
            [
              { text: '🔍 የምዝገባ ሁኔታ ማረጋገጫ', callback_data: 'cmd_status_prompt' },
              { text: '❓ እርዳታ', callback_data: 'cmd_help' }
            ]
          ]
        }
      });
    };

    // ---------- 13. /quiz & "📝 ሳምንታዊ ፈተና" (Interactive Telegram Quizzes) ----------
    const CURATED_QUIZ_POOL = [
      {
        question: 'በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ቀኖና መሠረት የመጽሐፍ ቅዱስ መጻሕፍት ቁጥር ስንት ነው?',
        options: ['66 መጻሕፍት', '73 መጻሕፍት', '81 መጻሕፍት', '88 መጻሕፍት'],
        correctIndex: 2,
        explanation: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን 81 መጻሕፍት (46 የብሉይ ኪዳን እና 35 የሐዲስ ኪዳን) ቀኖና አላት።',
      },
      {
        question: 'ከሰባቱ ምስጢራተ ቤተክርስቲያን መካከል የማይደገሙት (አንድ ጊዜ ብቻ የሚፈጸሙት) የትኞቹ ናቸው?',
        options: ['ጥምቀት፣ ሜሮን፣ ክህነት', 'ቁርባን፣ ንስሐ፣ ተክሊል', 'ቀንዲል፣ ጥምቀት፣ ንስሐ', 'ክህነት፣ ቁርባን፣ ተክሊል'],
        correctIndex: 0,
        explanation: 'ምስጢረ ጥምቀት፣ ምስጢረ ሜሮን እና ምስጢረ ክህነት በሰው ሕይወት ውስጥ አንዴ ብቻ የሚፈጸሙ የማይደገሙ ምስጢራት ናቸው።',
      },
      {
        question: 'የሰንበት ትምህርት ቤታችን የተሰየመበት ታላቁ ቅዱስ አባት ማነው?',
        options: ['ቅዱስ ተክለ ሳዊሮስ (የአንጾኪያ ፓትሪያርክ)', 'ቅዱስ ቴዎድሮስ', 'ቅዱስ ጊዮርጊስ', 'ቅዱስ ያሬድ'],
        correctIndex: 0,
        explanation: 'ቅዱስ ሳዊሮስ (ተክለ ሳዊሮስ) የአንጾኪያ ፓትሪያርክና የተዋሕዶ ሃይማኖት አርበኛ የነበረ ታላቅ ሊቅ ነው።',
      },
      {
        question: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የስንት አጽዋማት (ዐበይት ጾሞች) ሥርዓት አላት?',
        options: ['5 ጾሞች', '7 ጾሞች', '3 ጾሞች', '10 ጾሞች'],
        correctIndex: 1,
        explanation: 'ሰባቱ አጽዋማት፦ ዐቢይ ጾም፣ ጾመ ሐዋርያት፣ ጾመ ፍልሰታ፣ ጾመ ነቢያት፣ ጾመ ገሃድ፣ ጾመ ነነዌ እና ጾመ ድኅነት (ረቡዕና ዓርብ) ናቸው።',
      },
      {
        question: 'ቅዱስ ያሬድ በመንፈስ ቅዱስ ተመርቶ የደረሳቸው ሦስቱ የዜማ ስልቶች እነማን ናቸው?',
        options: ['ግዕዝ፣ ዕዝል፣ አራራይ', 'ማኅሌት፣ ሰዓታት፣ ቅዳሴ', 'ዋዜማ፣ ምልጣን፣ አቡን', 'ሰላም፣ መስተብቍዕ፣ ዚቅ'],
        correctIndex: 0,
        explanation: 'ቅዱስ ያሬድ ሦስቱን የዜማ ስልቶች፦ ግዕዝ፣ ዕዝል እና አራራይ ደርሷል።',
      },
      {
        question: 'የእመቤታችን የቅድስት ድንግል ማርያም የፍልሰታ ጾም የሚጾመው በየትኛው ወር ነው?',
        options: ['በጥር ወር', 'በነሐሴ ወር (ከነሐሴ 1-16)', 'በጥቅምት ወር', 'በሰኔ ወር'],
        correctIndex: 1,
        explanation: 'ጾመ ፍልሰታ ከነሐሴ 1 እስከ ነሐሴ 16 የሚጾም የእመቤታችን ዕርገት መታሰቢያ ጾም ነው።',
      },
      {
        question: 'የመጀመሪያው የሰማዕታት አለቃ (ቀዳሜ ሰማዕት) ተብሎ የሚጠራው ቅዱስ ማነው?',
        options: ['ቅዱስ እስጢፋኖስ ሊቀ ዲያቆናት', 'ቅዱስ ጊዮርጊስ', 'ቅዱስ መርቆሬዎስ', 'ቅዱስ ሚናስ'],
        correctIndex: 0,
        explanation: 'ቀዳሜ ሰማዕት (የሰማዕታት መጀመሪያ) ቅዱስ እስጢፋኖስ ሊቀ ዲያቆናት ነው።',
      },
    ];

    const handleQuiz = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);

        // 1. Try fetching published database quiz questions
        const Quiz = require('../models/education/Quiz');
        const Question = require('../models/education/Question');

        let dbQuestion = null;
        try {
          const query = { published: true };
          const activeQuizzes = await Quiz.find(query).limit(5).catch(() => []);
          if (activeQuizzes.length > 0) {
            const quizIds = activeQuizzes.map((q) => q._id);
            const questions = await Question.find({ quiz: { $in: quizIds }, type: 'Multiple Choice' }).limit(10).catch(() => []);
            if (questions.length > 0) {
              const randomQ = questions[Math.floor(Math.random() * questions.length)];
              if (randomQ.options && randomQ.options.length >= 2) {
                const correctIdx = randomQ.options.findIndex(
                  (opt) => String(opt).trim().toLowerCase() === String(randomQ.correctAnswer).trim().toLowerCase()
                );
                if (correctIdx >= 0) {
                  dbQuestion = {
                    question: randomQ.text || randomQ.questionText,
                    options: randomQ.options.slice(0, 10),
                    correctIndex: correctIdx,
                    explanation: randomQ.explanation || 'ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት',
                  };
                }
              }
            }
          }
        } catch (e) {}

        const selected = dbQuestion || CURATED_QUIZ_POOL[Math.floor(Math.random() * CURATED_QUIZ_POOL.length)];

        // Try Telegram native Poll Quiz
        try {
          await botInstance.sendPoll(
            chatId,
            `📝 ${selected.question}`,
            selected.options,
            {
              type: 'quiz',
              correct_option_id: selected.correctIndex,
              explanation: selected.explanation,
              is_anonymous: false,
            }
          );

          await safeSendMessage(chatId, '✨ *ሳምንታዊ የመጽሐፍ ቅዱስና የሰንበት ት/ቤት ፈተና*\nመልስዎን በመምረጥ ይሳተፉ! 👇', {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '🔄 ቀጣይ ጥያቄ (Next Question)', callback_data: 'cmd_next_quiz' },
                  buildPortalInlineButton('🎓 ሁሉንም ፈተናዎች በፖርታል ክፈት', '/dashboard/courses')
                ]
              ]
            }
          });
          return;
        } catch (pollErr) {
          console.warn('sendPoll fallback to inline message:', pollErr.message);
        }

        // Fallback to text message if poll permission is restricted
        let qMsg = `╭──────────────────────────────╮\n`;
        qMsg += `   📝 *ሳምንታዊ የኦርቶዶክስ ተዋሕዶ ፈተና* 📝\n`;
        qMsg += `╰──────────────────────────────╯\n\n`;
        qMsg += `❓ *ጥያቄ፦* ${selected.question}\n\n`;
        selected.options.forEach((opt, idx) => {
          qMsg += `${idx + 1}. ${opt}\n`;
        });
        qMsg += `\n💡 _መልሱን ለማረጋገጥ ወይም ሙሉ ፈተናዎችን ለመውሰድ ከታች ያለውን ይጫኑ፦_`;

        await safeSendMessage(chatId, qMsg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🔄 ቀጣይ ጥያቄ (Next Question)', callback_data: 'cmd_next_quiz' },
                buildPortalInlineButton('🎓 ወደ ፈተና ፖርታል ሂድ', '/dashboard/courses')
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleQuiz error:', err);
      }
    };

    // ---------- 14. /mezmur & /media (Audio Lessons, Mezmurs, Prayers & Handouts) ----------
    const handleSpiritualMedia = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        const Lesson = require('../models/education/Lesson');

        const audioLessons = await Lesson.find({
          audioUrl: { $exists: true, $ne: '' },
          status: { $ne: 'Draft' }
        }).limit(4).catch(() => []);

        let mediaMsg = `╭──────────────────────────────╮\n`;
        mediaMsg += `   🎵 *መንፈሳዊ መዝሙራትና የትምህርት ማዕከል* 🎵\n`;
        mediaMsg += `╰──────────────────────────────╯\n\n`;
        mediaMsg += `ሰላም ${student?.firstName || 'ወዳጃችን'}፣ የ *ተክለ ሳዊሮስ ሰንበት ት/ቤት* ዲጂታል የድምፅ ትምህርቶች፣ መዝሙራት እና የጸሎት መጻሕፍት ከዚህ በታች ተዘጋጅተውልዎታል፦ ✨\n\n`;
        mediaMsg += `🔹 *መንፈሳዊ መዝሙራት* — በማኅሌት፣ በዕዝልና በአራራይ ዜማዎች\n`;
        mediaMsg += `🔹 *የሳምንቱ የድምፅ ትምህርቶች* — በመምህራን የተዘጋጁ ስብከቶችና ትምህርቶች\n`;
        mediaMsg += `🔹 *የዘወትር ጸሎትና ንባባት* — ውዳሴ ማርያምና የሰዓታት ጸሎቶች\n`;
        mediaMsg += `🔹 *የትምህርት መጽሐፍት (PDF)* — የክፍል ማስታወሻዎችና መመሪያዎች\n`;

        if (audioLessons.length > 0) {
          mediaMsg += `\n🎧 *የቅርብ ጊዜ የትምህርት ድምፆች፦*\n`;
          audioLessons.forEach((l, idx) => {
            mediaMsg += `${idx + 1}. 🎙️ *${l.titleAmharic || l.title}* ${l.audioTitle ? `(${l.audioTitle})` : ''}\n`;
          });
        }

        const inlineKeyboard = {
          inline_keyboard: [
            [
              { text: '🎶 መዝሙራት (Mezmurs)', callback_data: 'cmd_mezmurs' },
              { text: '✝️ የዘወትር ጸሎት (Daily Prayers)', callback_data: 'cmd_prayers' }
            ],
            [
              buildPortalInlineButton('📚 የትምህርት ክፍሎችና ኦዲዮ በፖርታል', '/dashboard/courses'),
              { text: '📝 ሳምንታዊ ፈተና', callback_data: 'cmd_quiz' }
            ],
            [
              { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' },
              { text: '❓ እርዳታ', callback_data: 'cmd_help' }
            ]
          ]
        };

        await safeSendMessage(chatId, mediaMsg, {
          parse_mode: 'Markdown',
          reply_markup: inlineKeyboard
        });
      } catch (err) {
        console.error('Telegram handleSpiritualMedia error:', err);
      }
    };

    const handleMezmurs = async (chatId) => {
      let msg = `╭──────────────────────────────╮\n`;
      msg += `     🎶 *የተመረጡ ኦርቶዶክሳዊ መዝሙራት* 🎶\n`;
      msg += `╰──────────────────────────────╯\n\n`;
      msg += `🕊️ *በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።*\n\n`;
      msg += `1. 🎵 *«ተክለ ሳዊሮስ አባታችን»* — የሰንበት ት/ቤታችን መዝሙር\n`;
      msg += `2. 🎵 *«ማርያም ፊደል»* — ምስጋና ለእመቤታችን\n`;
      msg += `3. 🎵 *«በስመ አብ ወወልድ»* — የዘወትር መክፈቻ\n`;
      msg += `4. 🎵 *«መድኃኔዓለም አዳነን»* — የደብራችን መዝሙር\n\n`;
      msg += `💡 _ሙሉውን የመዝሙርና የዜማ ቤተ-መጽሐፍት በተማሪዎች ፖርታል ውስጥ ማዳመጥና ማውረድ ይችላሉ።_`;

      await safeSendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              buildPortalInlineButton('🎧 መዝሙራትን በፖርታል ክፈት', '/dashboard/courses')
            ],
            [
              { text: '🔙 ወደ ሚዲያ ማዕከል', callback_data: 'cmd_media' },
              { text: '✝️ የዘወትር ጸሎት', callback_data: 'cmd_prayers' }
            ]
          ]
        }
      });
    };

    const handleDailyPrayers = async (chatId) => {
      let msg = `╭──────────────────────────────╮\n`;
      msg += `     ✝️ *የዘወትር የኦርቶዶክስ ጸሎት* ✝️\n`;
      msg += `╰──────────────────────────────╯\n\n`;
      msg += `✨ *በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።*\n\n`;
      msg += `📖 *አባታችን ሆይ በሰማያት የምትኖር፦*\n`;
      msg += `ስምህ ይቀደስ፤ መንግሥትህ ትምጣ፤ ፈቃድህ በሰማይ እንደ ሆነች እንዲሁም በምድር ትሁን፤ የዕለት እንጀራችንን ስጠን ዛሬ፤ እኛም የበደሉንን ይቅር እንደምንል በደላችንን ይቅር በለን፤ ከክፉ ሁሉ አድነን እንጂ ወደ ፈተና አታግባን፤ መንግሥት ያንተ ናትና ኃይልም ክብርም ለዘለዓለሙ፤ አሜን።\n\n`;
      msg += `📖 *እመቤታችን ቅድስት ድንግል ማርያም ሆይ፦*\n`;
      msg += `በመልአኩ በቅዱስ ገብርኤል ሰላምታ ሰላም እንልሻለን፤ በሐሳብሽ ድንግል ነሽ በሥጋሽም ድንግል ነሽ፤ የአሸናፊ የእግዚአብሔር እናት ሆይ ሰላምታ ላንቺ ይገባሻል፤ ከአንቺ የተወለደው አምላካችን መድኃኒታችን ኢየሱስ ክርስቶስ ኃጢአታችንን ያስተሠረይልን ዘንድ ወደ እርሱ ጸልዪልን ለዘለዓለሙ አሜን።\n\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💡 _ውዳሴ ማርያምና ሰዓታትን በፖርታል ሙሉውን ያንብቡ።_`;

      await safeSendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              buildPortalInlineButton('📖 ሙሉ የጸሎት መጽሐፍ በፖርታል', '/dashboard')
            ],
            [
              { text: '🔙 ወደ ሚዲያ ማዕከል', callback_data: 'cmd_media' },
              { text: '🎶 መዝሙራት', callback_data: 'cmd_mezmurs' }
            ]
          ]
        }
      });
    };

    // ---------- 15. /ask & "🤖 መንፈሳዊ ረዳት" (Spiritual AI Q&A Assistant) ----------
    const callGeminiAI = async (prompt) => {
      const apiKey = (process.env.GEMINI_API_KEY || '').trim();
      if (!apiKey) return null;

      try {
        const systemPrompt = `You are a respectful, knowledgeable spiritual assistant for Teklesawiros Ethiopian Orthodox Tewahdo Sunday School (የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት). 
Answer questions accurately based on Ethiopian Orthodox Tewahdo Church canon, teachings, fasting rules, sacraments, and Sunday school curriculum. 
Answer in Amharic (or English if the user asks in English). 
Start with 'በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።' when discussing spiritual matters. Keep answers concise, inspiring, and spiritually sound.`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${prompt}` }] }],
            generationConfig: { maxOutputTokens: 700, temperature: 0.3 },
          }),
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
      } catch (err) {
        console.warn('Gemini API call notice:', err.message);
        return null;
      }
    };

    const getLocalSpiritualKnowledge = (query) => {
      const q = (query || '').toLowerCase();
      if (/ጾም|መጾም|አጽዋማት|fasting/i.test(q)) {
        return `📖 *ስለ ጾም ትምህርት (About Fasting)*\n\n` +
          `ጾም ማለት ሰው ለተወሰነ ጊዜ ከምግብና ከመጠጥ እንዲሁም ከክፉ ነገር ሁሉ የሚከለከልበት መንፈሳዊ ተጋድሎ ነው።\n\n` +
          `✝️ *ሰባቱ አጽዋማት፦*\n` +
          `1. ዐቢይ ጾም (55 ቀናት)\n` +
          `2. ጾመ ሐዋርያት\n` +
          `3. ጾመ ፍልሰታ (ነሐሴ 1 - 16)\n` +
          `4. ጾመ ነቢያት (ኅዳር 15 - ታኅሣሥ 28)\n` +
          `5. ጾመ ገሃድ (የልደትና የጥምቀት ዋዜማ)\n` +
          `6. ጾመ ነነዌ (3 ቀናት)\n` +
          `7. ጾመ ድኅነት (የዓመቱ ረቡዕና ዓርብ)\n\n` +
          `💡 _«ጾም የነፍስ ምግብ፣ የሥጋ ልጓም ነው» (ቅዱስ ዮሐንስ አፈወርቅ)_`;
      }

      if (/ምስጢር|ምስጢራት|sacrament/i.test(q)) {
        return `📖 *ሰባቱ ምስጢራተ ቤተክርስቲያን (The Seven Sacraments)*\n\n` +
          `1. *ምስጢረ ጥምቀት* — ዳግም ከውኃና ከመንፈስ ቅዱስ መወለድ (የማይደገም)\n` +
          `2. *ምስጢረ ሜሮን* — የመንፈስ ቅዱስ ሀብት መቀበል (የማይደገም)\n` +
          `3. *ምስጢረ ቁርባን* — የጌታችንን ቅዱስ ሥጋና ክቡር ደም መቀበል\n` +
          `4. *ምስጢረ ንስሐ* — ከኃጢአት መንጻትና ወደ እግዚአብሔር መመለስ\n` +
          `5. *ምስጢረ ክህነት* — የማገልገል ሥልጣን (የማይደገም)\n` +
          `6. *ምስጢረ ተክሊል* — የጋብቻ ቅድስና\n` +
          `7. *ምስጢረ ቀንዲል* — ለሕመምተኞች የሚጸለይ የፈውስ ጸሎት`;
      }

      if (/ጸሎት|መጸለይ|prayer/i.test(q)) {
        return `📖 *ስለ ጸሎት ትምህርት (About Prayer)*\n\n` +
          `ጸሎት ማለት ከልዑል እግዚአብሔር ጋር የሚደረግ ቅዱስ ንግግር ነው።\n\n` +
          `⏰ *ሰባቱ የጸሎት ጊዜያት፦*\n` +
          `1. ነግህ (ማለዳ - 12፡00 ሰዓት)\n` +
          `2. ሠለስት (3፡00 ሰዓት)\n` +
          `3. ቀትር (6፡00 ሰዓት)\n` +
          `4. ተስዓቱ (9፡00 ሰዓት)\n` +
          `5. ሠርክ (11፡00 ሰዓት)\n` +
          `6. ነዋም (የመኝታ ሰዓት)\n` +
          `7. መንፈቀ ሌሊት (እኩለ ሌሊት)`;
      }

      if (/ተክለ ሳዊሮስ|ሰንበት ትምህርት ቤት|sunday school/i.test(q)) {
        return `⛪ *የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት*\n\n` +
          `የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት በደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን ሥር የሚገኝ ታላቅ የትምህርት ተቋም ነው።\n\n` +
          `🎓 *የትምህርት ደረጃዎች፦* ከ 7ኛ እስከ 12ኛ ክፍል እና የርቀት ትምህርት (Distance Education)\n` +
          `⏰ *ፈረቃዎች፦* የቀን (ቅዳሜና እሑድ) እና የማታ ፈረቃ\n` +
          `📚 *የሚሰጡ ትምህርቶች፦* መጽሐፍ ቅዱስ ጥናት፣ ሥነ-ምግባር፣ የቤተክርስቲያን ታሪክ፣ ቀኖና፣ ዜማና ቅኔ`;
      }

      return null;
    };

    const handleSpiritualQA = async (chatId, queryText = '') => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        const cleanQuery = (queryText || '').trim();

        if (!cleanQuery) {
          let guideMsg = `╭──────────────────────────────╮\n`;
          guideMsg += `   🤖 *መንፈሳዊ እና የሰንበት ት/ቤት ረዳት* 🤖\n`;
          guideMsg += `╰──────────────────────────────╯\n\n`;
          guideMsg += `ሰላም ${student?.firstName || 'ወዳጃችን'}፣ ስለ ሃይማኖት፣ ስለ ጾም፣ ስለ ምስጢራተ ቤተክርስቲያን፣ ስለ በዓላት ወይም ስለ ሰንበት ት/ቤቱ የፈለጉትን ጥያቄ ይጠይቁ። ✨\n\n`;
          guideMsg += `📌 *ምሳሌዎች፦*\n`;
          guideMsg += `• \`/ask ስለ ሰባቱ ምስጢራተ ቤተክርስቲያን አብራራልኝ\`\n`;
          guideMsg += `• \`/ask ጾም ለምን እንጾማለን?\`\n`;
          guideMsg += `• \`/ask ሰባቱ የጸሎት ጊዜያት እነማን ናቸው?\`\n`;
          guideMsg += `• \`/ask የሰንበት ትምህርት ቤቱ መረጃ\`\n\n`;
          guideMsg += `💡 _ትእዛዙን \`/ask <የጥያቄዎ ጽሑፍ>\` ብለው ይላኩ።_`;

          return await safeSendMessage(chatId, guideMsg, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📖 ስለ ጾም', callback_data: 'cmd_qa_fasting' },
                  { text: '✝️ ስለ ምስጢራት', callback_data: 'cmd_qa_sacraments' }
                ],
                [
                  { text: '⏰ የጸሎት ጊዜያት', callback_data: 'cmd_qa_prayers' },
                  { text: '⛪ የሰንበት ት/ቤት መረጃ', callback_data: 'cmd_qa_school' }
                ],
                [
                  { text: '📝 ሳምንታዊ ፈተና', callback_data: 'cmd_quiz' },
                  { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' }
                ]
              ]
            }
          });
        }

        // Try AI generation or local curriculum engine
        let answer = await callGeminiAI(cleanQuery);
        if (!answer) {
          answer = getLocalSpiritualKnowledge(cleanQuery);
        }

        if (!answer) {
          answer = `✨ *በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን።*\n\n` +
            `ስለ ጠየቁት ጥያቄ፦ *«${cleanQuery}»*\n\n` +
            `የተሟላ መንፈሳዊና ቀኖናዊ ማብራሪያ ለማግኘት እንዲሁም ጥያቄዎ የንስሐ ወይም ጥልቅ መንፈሳዊ ጉዳይ ከሆነ የሰንበት ት/ቤት ኃላፊ መምህርዎን ወይም የንስሐ አባትዎን ማማከር ይችላሉ። 🕊️`;
        }

        let respMsg = `╭──────────────────────────────╮\n`;
        respMsg += `    🕊️ *መንፈሳዊ ምላሽና ማብራሪያ* 🕊️\n`;
        respMsg += `╰──────────────────────────────╯\n\n`;
        respMsg += `${answer}\n\n`;
        respMsg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        respMsg += `💡 _ሌላ ጥያቄ ለመጠየቅ_ \`/ask <ጥያቄዎ>\` _ብለው ይጻፉ።_`;

        await safeSendMessage(chatId, respMsg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '❓ ሌላ ጥያቄ ጠይቅ (Ask Another)', callback_data: 'cmd_ai' },
                { text: '📝 ሳምንታዊ ፈተና', callback_data: 'cmd_quiz' }
              ],
              [
                buildPortalInlineButton('🎓 የተማሪዎች ፖርታል ክፈት', '/dashboard')
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleSpiritualQA error:', err);
      }
    };

    // ---------- 16. /checkin & Teacher Roll-Call Attendance Scanner ----------
    const handleTeacherCheckin = async (chatId, queryText, msg) => {
      try {
        const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
        const isAuth = await isAuthorizedAdmin(chatId, msg.from?.id, msg);

        if (!isAuth) {
          return await safeSendMessage(
            chatId,
            '⛔ *ይቅርታ! የተማሪዎችን የዕለታዊ ክትትል የመመዝገብ ፈቃድ የተሰጠው ለመምህራንና ለአስተዳዳሪዎች ብቻ ነው።*',
            { parse_mode: 'Markdown' }
          );
        }

        const cleanInput = (queryText || '').trim();
        if (!cleanInput) {
          let prompt = `📷 *የመምህራን የተማሪዎች ክትትል መመዝገቢያ (Teacher Attendance Check-in)*\n\n`;
          prompt += `የተማሪውን መለያ ቁጥር (Student ID)፣ የማመልከቻ ቁጥር ወይም ስልክ ቁጥር አስገብተው ይላኩ።\n\n`;
          prompt += `📌 *ምሳሌዎች፦*\n`;
          prompt += `• \`/checkin STU-2026-0042\`\n`;
          prompt += `• \`/checkin 0911223344\`\n`;
          prompt += `• \`/markattendance STU-2026-0042 Present\`\n\n`;
          prompt += `💡 _በተጨማሪም በተማሪዎች ፖርታል የካሜራ ስካነር (QR Scanner) አማካኝነት ባጁን በሰከንዶች ውስጥ መመዝገብ ይችላሉ።_`;

          return await safeSendMessage(chatId, prompt, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  buildPortalInlineButton('📷 የካሜራ QR ስካነር ክፈት', '/dashboard/attendance')
                ]
              ]
            }
          });
        }

        // Split student ID and optional status
        const parts = cleanInput.split(/\s+/);
        const studentIdentifier = parts[0];
        const statusArg = parts[1] || 'Present';

        const result = await recordAttendanceFromQr({
          teacherTelegramId: msg.from?.id,
          studentIdentifier,
          status: statusArg,
          recordedBySource: 'TelegramBot',
        });

        if (!result.success) {
          return await safeSendMessage(chatId, `❌ ${result.message}`, { parse_mode: 'Markdown' });
        }

        const student = result.student;
        let successMsg = `╭──────────────────────────────╮\n`;
        successMsg += `   ✅ *የተማሪ ክትትል በተሳካ ሁኔታ ተመዝግቧል!* ✅\n`;
        successMsg += `╰──────────────────────────────╯\n\n`;
        successMsg += `👤 *ተማሪ፦* ${student.firstName} ${student.lastName}\n`;
        successMsg += `🏷️ *መለያ ቁጥር፦* \`${student.studentId || '-'}\`\n`;
        successMsg += `📚 *ክፍል፦* ${student.grade || student.batch || '-'}\n`;
        successMsg += `⏰ *ፈረቃ፦* ${student.shift === 'night' ? 'የማታ' : 'የቀን / ቅዳሜና እሁድ'}\n`;
        successMsg += `⚡ *ሁኔታ፦* 🟢 *${result.status}*\n`;
        successMsg += `📅 *ቀን፦* ${formatEthiopianDate(new Date())}\n`;
        if (result.attendanceRate !== undefined) {
          successMsg += `📈 *አጠቃላይ የተገኝነት ምጣኔ፦* *${result.attendanceRate}%*\n`;
        }

        await safeSendMessage(chatId, successMsg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                buildPortalInlineButton('📊 ሙሉ የክፍል ክትትል ዝርዝር', '/dashboard/attendance')
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleTeacherCheckin error:', err);
      }
    };

    // ---------- 16. Admin / Teacher /report & /absentees (Live Attendance Reports + CSV Export) ----------
    const getReportKeyboard = (activeMode = 'today') => ({
      inline_keyboard: [
        [
          { text: activeMode === 'today' ? '✅ ዛሬ (Today)' : '📅 ዛሬ (Today)', callback_data: 'report_today' },
          { text: activeMode === 'week' ? '✅ ሳምንታዊ (7d)' : '📆 ሳምንታዊ (7d)', callback_data: 'report_week' },
          { text: activeMode === 'month' ? '✅ ወርሃዊ (30d)' : '🗓️ ወርሃዊ (30d)', callback_data: 'report_month' },
        ],
        [
          { text: activeMode === 'absentees' ? '✅ የዛሬ ቀሪዎች' : '❌ የዛሬ ቀሪዎች', callback_data: 'report_absentees' },
          { text: activeMode === 'atrisk' ? '✅ ዝቅተኛ (<75%)' : '⚠️ ዝቅተኛ (<75%)', callback_data: 'report_atrisk' },
        ],
        [
          { text: '📥 የዛሬ CSV ላክ', callback_data: 'report_csv_today' },
          { text: '📥 የሳምንት CSV ላክ', callback_data: 'report_csv_week' },
        ],
        [
          buildPortalInlineButton('📊 ሙሉ ሪፖርት በድረ-ገጽ ክፈት', '/admin/reports')
        ]
      ]
    });

    const handleAdminAttendanceReport = async (chatId, rawArg = '', msg = null, fromUserId = null) => {
      try {
        const userId = fromUserId || msg?.from?.id || chatId;
        const authorized = await isAuthorizedAdmin(chatId, userId, msg);
        if (!authorized) {
          return safeSendMessage(
            chatId,
            '🔒 *ይህ የሪፖርት ትዕዛዝ ለመምህራንና አስተዳዳሪዎች ብቻ ነው።*\n\nየራስዎን ክትትል ለማየት `/attendance` ይጠቀሙ።',
            { parse_mode: 'Markdown' }
          );
        }

        const arg = String(rawArg || '').trim();
        const lowerArg = arg.toLowerCase();
        const ethNow = getEthiopianTimeInfo();
        const todayStr = ethNow.dateString; // YYYY-MM-DD in Addis Ababa time

        // MODE A: Today's Absentees List
        if (lowerArg === 'absentees' || lowerArg === 'absent' || lowerArg === 'ቀሪዎች') {
          const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
          startOfDay.setHours(startOfDay.getHours() - 3);
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

          const rawRecords = await Attendance.find({ date: { $gte: startOfDay, $lte: endOfDay } })
            .populate('student', 'firstName middleName lastName studentId grade batch studentPhone contactPhone')
            .sort({ grade: 1, date: -1 })
            .lean();

          const records = deduplicateBotAttendance(rawRecords);
          const absentees = records.filter((r) => r.status === 'Absent');

          let out = `╭──────────────────────────────╮\n`;
          out += `   ❌ *የዛሬ ያልተገኙ ተማሪዎች (Absentees)* ❌\n`;
          out += `╰──────────────────────────────╯\n\n`;
          out += `📅 *ቀን፦* ${formatEthiopianDate(new Date())} (${todayStr})\n`;
          out += `👥 *ጠቅላላ ያልተገኙ፦* *${absentees.length}* ተማሪዎች\n`;
          out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

          if (absentees.length === 0) {
            out += `🎉 _ዛሬ የተመዘገበ ያልተገኘ ተማሪ የለም!_\n`;
          } else {
            const byGrade = new Map();
            absentees.forEach((a) => {
              const g = a.grade || a.student?.grade || a.student?.batch || 'አጠቃላይ';
              if (!byGrade.has(g)) byGrade.set(g, []);
              byGrade.get(g).push(a);
            });

            let shown = 0;
            for (const [gName, list] of byGrade.entries()) {
              if (shown >= 35) break;
              out += `\n🏫 *${gName}* (${list.length})\n`;
              for (const item of list) {
                if (shown >= 35) break;
                const s = item.student;
                const name = s ? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') : (item.studentName || 'ተማሪ');
                const phone = s?.studentPhone || s?.contactPhone || '';
                out += `• *${name}* (${s?.studentId || '—'})${phone ? ` 📞 ${phone}` : ''}\n`;
                shown++;
              }
            }
            if (absentees.length > shown) {
              out += `\n_...እና ሌሎች ${absentees.length - shown} ተማሪዎች (CSV ያውርዱ)_\n`;
            }
          }

          return safeSendMessage(chatId, out, {
            parse_mode: 'Markdown',
            reply_markup: getReportKeyboard('absentees'),
          });
        }

        // MODE B: At-Risk Students (<75% attendance)
        if (lowerArg === 'atrisk' || lowerArg === 'at-risk' || lowerArg === 'risk' || lowerArg === 'ዝቅተኛ') {
          const since = new Date();
          since.setDate(since.getDate() - 60);
          const rawRecords = await Attendance.find({ date: { $gte: since } })
            .populate('student', 'firstName middleName lastName studentId grade batch studentPhone contactPhone')
            .lean();

          const records = deduplicateBotAttendance(rawRecords);
          const studentMap = new Map();
          for (const r of records) {
            const s = r.student;
            const sId = s?._id ? s._id.toString() : null;
            if (!sId) continue;
            if (!studentMap.has(sId)) {
              studentMap.set(sId, {
                name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' '),
                customId: s.studentId || '—',
                grade: s.grade || s.batch || r.grade || '—',
                phone: s.studentPhone || s.contactPhone || '',
                attended: 0,
                absent: 0,
                total: 0,
              });
            }
            const e = studentMap.get(sId);
            e.total++;
            if (r.status === 'Present' || r.status === 'Late') e.attended++;
            else if (r.status === 'Absent') e.absent++;
          }

          const atRisk = Array.from(studentMap.values())
            .map((s) => ({ ...s, rate: s.total > 0 ? Math.round((s.attended / s.total) * 100) : 0 }))
            .filter((s) => s.total >= 2 && s.rate < 75 && s.absent > 0)
            .sort((a, b) => a.rate - b.rate || b.absent - a.absent);

          let out = `╭──────────────────────────────╮\n`;
          out += `   ⚠️ *ዝቅተኛ ተገኝነት ያላቸው (<75%)* ⚠️\n`;
          out += `╰──────────────────────────────╯\n\n`;
          out += `📆 *ጊዜ፦* ያለፉት 60 ቀናት (ቢያንስ 2 ክፍለ-ጊዜያት)\n`;
          out += `🚨 *ክትትል የሚያስፈልጋቸው፦* *${atRisk.length}* ተማሪዎች\n`;
          out += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

          if (atRisk.length === 0) {
            out += `🌟 _በአሁኑ ጊዜ ከ75% በታች ዝቅተኛ ተገኝነት ያለው ተማሪ የለም!_\n`;
          } else {
            atRisk.slice(0, 20).forEach((s, idx) => {
              out += `${idx + 1}. *${s.name}* (${s.grade})\n`;
              out += `   📉 *${s.rate}%* (${s.attended}/${s.total} • ❌ ${s.absent} ቀሪ)${s.phone ? ` • 📞 ${s.phone}` : ''}\n`;
            });
            if (atRisk.length > 20) {
              out += `\n_...እና ሌሎች ${atRisk.length - 20} ተማሪዎች በድረ-ገጽ ሪፖርት ላይ ይመልከቱ።_\n`;
            }
          }

          return safeSendMessage(chatId, out, {
            parse_mode: 'Markdown',
            reply_markup: getReportKeyboard('atrisk'),
          });
        }

        // MODE C: Specific Grade Report (e.g. /report Grade 9, /report 10, /report 9 night, /report Batch 1)
        const isStandardPeriod = !lowerArg || ['today', 'ዛሬ', 'week', 'ሳምንት', 'month', 'ወር'].includes(lowerArg);
        if (!isStandardPeriod) {
          const parsed = parseGradeAndShift(arg);
          const rawGrade = parsed.grade || arg;
          const gradeNum = rawGrade.match(/\d+/);
          const escapeRe = (v) => String(v || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const gradeRegex = gradeNum
            ? new RegExp(`(${gradeNum[0]}|${escapeRe(rawGrade)})`, 'i')
            : new RegExp(escapeRe(rawGrade), 'i');

          const studentQuery = { $or: [{ grade: gradeRegex }, { batch: gradeRegex }] };
          if (parsed.shift === 'night') {
            studentQuery.shift = { $in: ['night', 'Night', 'የማታ', 'ማታ'] };
          } else if (parsed.shift === 'day') {
            studentQuery.shift = { $nin: ['night', 'Night', 'የማታ', 'ማታ'] };
          }

          const students = await Student.find(studentQuery).lean();
          if (students.length === 0) {
            return safeSendMessage(
              chatId,
              `⚠️ *"${arg}"* ለሚለው ክፍል የተመዘገቡ ተማሪዎች አልተገኙም።\n\nምሳሌ፦ \`/report Grade 9\` ወይም \`/report 10 night\` ወይም \`/report today\``,
              { parse_mode: 'Markdown', reply_markup: getReportKeyboard('today') }
            );
          }

          const studentIds = students.map((s) => s._id);
          const rawRecords = await Attendance.find({ student: { $in: studentIds } }).lean();
          const records = deduplicateBotAttendance(rawRecords);

          const sessionKeys = new Set(
            records.map((r) => (r.sessionId ? r.sessionId.toString() : r.date ? new Date(r.date).toISOString().split('T')[0] : '')).filter(Boolean)
          );
          const totalSessions = sessionKeys.size;

          const present = records.filter((r) => r.status === 'Present').length;
          const late = records.filter((r) => r.status === 'Late').length;
          const excused = records.filter((r) => r.status === 'Excused').length;
          const absent = records.filter((r) => r.status === 'Absent').length;
          const attended = present + late;
          const totalRec = records.length;
          const avgRate = totalRec > 0 ? Math.round((attended / totalRec) * 100) : 0;

          // Find top at-risk students in this grade
          const byStu = new Map();
          records.forEach((r) => {
            const id = r.student?.toString();
            if (!id) return;
            if (!byStu.has(id)) byStu.set(id, { att: 0, tot: 0, abs: 0 });
            const e = byStu.get(id);
            e.tot++;
            if (r.status === 'Present' || r.status === 'Late') e.att++;
            else if (r.status === 'Absent') e.abs++;
          });
          const riskList = students
            .map((s) => {
              const st = byStu.get(s._id.toString()) || { att: 0, tot: 0, abs: 0 };
              const r = st.tot > 0 ? Math.round((st.att / st.tot) * 100) : 100;
              return {
                name: [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' '),
                rate: r,
                abs: st.abs,
                tot: st.tot,
              };
            })
            .filter((s) => s.tot > 0 && s.rate < 75 && s.abs > 0)
            .sort((a, b) => a.rate - b.rate)
            .slice(0, 8);

          let out = `╭──────────────────────────────╮\n`;
          out += `   🏫 *የክፍል ተገኝነት ሪፖርት (${rawGrade})* 🏫\n`;
          out += `╰──────────────────────────────╯\n\n`;
          if (parsed.shift) out += `🕒 *ፈረቃ፦* ${parsed.shift === 'night' ? 'የማታ (Night)' : 'የቀን/ቅዳሜና እሑድ'}\n`;
          out += `👥 *ጠቅላላ ተማሪዎች፦* ${students.length}\n`;
          out += `📅 *የተካሄዱ ክፍለ-ጊዜያት፦* ${totalSessions}\n`;
          out += `🟢 *በሰዓቱ፦* ${present} | 🟡 *አርፍደው፦* ${late}\n`;
          out += `🔵 *በፈቃድ፦* ${excused} | 🔴 *ቀሪ፦* ${absent}\n\n`;
          out += `📈 *አማካይ ተገኝነት፦* *${avgRate}%*\n`;
          out += `\`${generateProgressBar(avgRate, 10)}\`\n`;

          if (riskList.length > 0) {
            out += `\n⚠️ *ክትትል የሚያስፈልጋቸው (<75%)፦*\n`;
            riskList.forEach((r) => {
              out += `• *${r.name}* — ${r.rate}% (❌ ${r.abs} ቀሪ)\n`;
            });
          }

          return safeSendMessage(chatId, out, {
            parse_mode: 'Markdown',
            reply_markup: getReportKeyboard('grade'),
          });
        }

        // MODE D: Period Summary (Today / Week / Month)
        const mode = (lowerArg === 'week' || lowerArg === 'ሳምንት')
          ? 'week'
          : (lowerArg === 'month' || lowerArg === 'ወር')
          ? 'month'
          : 'today';

        const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
        todayStart.setHours(todayStart.getHours() - 3); // Addis Ababa UTC+3 start of day
        const endDate = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
        const startDate = new Date(todayStart);
        if (mode === 'week') startDate.setDate(startDate.getDate() - 6);
        else if (mode === 'month') startDate.setDate(startDate.getDate() - 29);

        const [rawRecords, todaySessions] = await Promise.all([
          Attendance.find({ date: { $gte: startDate, $lte: endDate } })
            .populate('student', 'grade batch')
            .lean(),
          mode === 'today'
            ? ClassSession.find({ sessionDate: todayStr })
                .populate('createdBy', 'fullName')
                .sort({ startTime: 1 })
                .lean()
                .catch(() => [])
            : Promise.resolve([]),
        ]);

        const records = deduplicateBotAttendance(rawRecords);
        const present = records.filter((r) => r.status === 'Present').length;
        const late = records.filter((r) => r.status === 'Late').length;
        const excused = records.filter((r) => r.status === 'Excused').length;
        const absent = records.filter((r) => r.status === 'Absent').length;
        const total = records.length;
        const attended = present + late;
        const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

        // Grade breakdown
        const gradeStats = new Map();
        records.forEach((r) => {
          const g = r.grade || r.student?.grade || r.student?.batch || 'አጠቃላይ';
          if (!gradeStats.has(g)) gradeStats.set(g, { att: 0, abs: 0, exc: 0, tot: 0 });
          const e = gradeStats.get(g);
          e.tot++;
          if (r.status === 'Present' || r.status === 'Late') e.att++;
          else if (r.status === 'Excused') e.exc++;
          else if (r.status === 'Absent') e.abs++;
        });

        const titleLabel =
          mode === 'today'
            ? 'የዛሬ የተገኝነት ሪፖርት (Today)'
            : mode === 'week'
            ? 'የሳምንቱ የተገኝነት ሪፖርት (7 Days)'
            : 'የወሩ የተገኝነት ሪፖርት (30 Days)';

        let out = `╭──────────────────────────────╮\n`;
        out += `   📊 *${titleLabel}* 📊\n`;
        out += `╰──────────────────────────────╯\n\n`;
        out += `📅 *ቀን፦* ${formatEthiopianDate(new Date())} (${todayStr})\n`;
        out += `📋 *ጠቅላላ መዝገቦች፦* *${total}*\n`;
        out += `🟢 *በሰዓቱ (Present)፦* ${present}\n`;
        out += `🟡 *የዘገዩ (Late)፦* ${late}\n`;
        out += `🔵 *በፈቃድ (Excused)፦* ${excused}\n`;
        out += `🔴 *ያልተገኙ (Absent)፦* ${absent}\n\n`;
        out += `📈 *አጠቃላይ ተገኝነት፦* *${rate}%*\n`;
        out += `\`${generateProgressBar(rate, 10)}\`\n`;

        if (mode === 'today' && todaySessions.length > 0) {
          out += `\n🗓️ *የዛሬ ክፍለ-ጊዜያት (${todaySessions.length})፦*\n`;
          todaySessions.slice(0, 8).forEach((s) => {
            const stIcon = s.status === 'open' ? '🟢 ክፍት' : s.status === 'closed' ? '🔒 የተዘጋ' : s.status === 'cancelled' ? '❌ የተሰረዘ' : '⏳ መርሐ-ግብር';
            const pCount = (s.stats?.presentCount || 0) + (s.stats?.lateCount || 0);
            const aCount = s.stats?.absentCount || 0;
            const creator = s.createdBy?.fullName ? ` • 👤 ${s.createdBy.fullName}` : '';
            out += `• *${s.title || s.grade}* [${stIcon}] — ✅${pCount} ❌${aCount}${creator}\n`;
          });
        }

        if (gradeStats.size > 0) {
          out += `\n🏫 *በክፍል ዝርዝር፦*\n`;
          Array.from(gradeStats.entries())
            .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
            .slice(0, 12)
            .forEach(([gName, st]) => {
              const gRate = st.tot > 0 ? Math.round((st.att / st.tot) * 100) : 0;
              out += `• *${gName}* — *${gRate}%* (✅${st.att} • ❌${st.abs}${st.exc ? ` • 🔵${st.exc}` : ''})\n`;
            });
        } else {
          out += `\n💡 _በዚህ ጊዜ ውስጥ የተመዘገበ የክትትል መረጃ የለም።_\n`;
        }

        out += `\n💡 _የአንድ ክፍል ሪፖርት ለማየት፦_ \`/report Grade 9\``;

        await safeSendMessage(chatId, out, {
          parse_mode: 'Markdown',
          reply_markup: getReportKeyboard(mode),
        });
      } catch (err) {
        console.error('Telegram handleAdminAttendanceReport error:', err);
        safeSendMessage(chatId, '❌ ሪፖርቱን በማዘጋጀት ላይ ስህተት ተፈጥሯል።').catch(() => {});
      }
    };

    const handleSendTelegramCsvReport = async (chatId, scope = 'today', fromUserId = null) => {
      try {
        const authorized = await isAuthorizedAdmin(chatId, fromUserId || chatId);
        if (!authorized) {
          return safeSendMessage(chatId, '🔒 ይህ አገልግሎት ለመምህራንና አስተዳዳሪዎች ብቻ ነው።');
        }

        const ethNow = getEthiopianTimeInfo();
        const todayStr = ethNow.dateString;
        const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
        todayStart.setHours(todayStart.getHours() - 3);
        const endDate = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
        const startDate = new Date(todayStart);
        if (scope === 'week') startDate.setDate(startDate.getDate() - 6);

        const rawRecords = await Attendance.find({ date: { $gte: startDate, $lte: endDate } })
          .populate('student', 'firstName middleName lastName studentId grade batch shift studentPhone contactPhone')
          .populate('sessionId', 'title')
          .sort({ date: -1, grade: 1 })
          .lean();

        const records = deduplicateBotAttendance(rawRecords);
        if (records.length === 0) {
          return safeSendMessage(chatId, '💡 ለCSV ማውረጃ የሚሆን የተመዘገበ የክትትል መረጃ አልተገኘም።');
        }

        const csvEscape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const header = ['Date', 'Student ID', 'Student Name', 'Grade', 'Shift', 'Session', 'Status', 'Phone', 'Note'];
        const rows = records.map((r) => {
          const s = r.student;
          const name = s ? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') : (r.studentName || '');
          const dateVal = r.date ? new Date(r.date).toISOString().split('T')[0] : todayStr;
          return [
            dateVal,
            s?.studentId || '',
            name,
            r.grade || s?.grade || s?.batch || '',
            r.shift || s?.shift || '',
            r.sessionId?.title || r.session || r.courseName || 'General',
            r.status || 'Present',
            s?.studentPhone || s?.contactPhone || '',
            r.excuseReason || r.note || '',
          ].map(csvEscape).join(',');
        });

        const csvContent = '\uFEFF' + [header.map(csvEscape).join(','), ...rows].join('\n');
        const filename = `attendance_${scope}_${todayStr}.csv`;

        await botInstance.sendDocument(
          chatId,
          Buffer.from(csvContent, 'utf8'),
          {
            caption: `📥 *የተገኝነት ሪፖርት (${scope === 'week' ? 'ሳምንታዊ' : 'የዛሬ'} — ${todayStr})*\n📊 ጠቅላላ መዝገቦች፦ ${records.length}`,
            parse_mode: 'Markdown',
          },
          {
            filename,
            contentType: 'text/csv',
          }
        );
      } catch (err) {
        console.error('Telegram handleSendTelegramCsvReport error:', err);
        safeSendMessage(chatId, '❌ CSV ፋይሉን መላክ አልተቻለም።').catch(() => {});
      }
    };

    botInstance.onText(/\/(?:report|attendancereport)(?:@\w+)?(?:\s+(.+))?/, async (msg, match) => {
      const argText = match && match[1] ? match[1].trim() : '';
      handleAdminAttendanceReport(msg.chat.id, argText, msg);
    });

    botInstance.onText(/\/absentees(?:@\w+)?/, async (msg) => {
      handleAdminAttendanceReport(msg.chat.id, 'absentees', msg);
    });

    botInstance.onText(/\/quiz|📝 ሳምንታዊ ፈተና/, async (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'quiz');
      }
      handleQuiz(msg.chat.id);
    });

    botInstance.onText(/\/mezmur|\/media|\/lessons|🎵 መዝሙርና ትምህርት/, async (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'media');
      }
      handleSpiritualMedia(msg.chat.id);
    });

    botInstance.onText(/\/ask(?:\s+(.+))?|🤖 መንፈሳዊ ረዳት/, async (msg, match) => {
      const queryText = match && match[1] ? match[1] : '';
      if (msg.chat.type !== 'private') {
        const isAdmin = await isAuthorizedAdmin(msg.chat.id, msg.from?.id, msg);
        if (!isAdmin) {
          return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'ask');
        }
      }
      handleSpiritualQA(msg.chat.id, queryText);
    });

    botInstance.onText(/\/checkin(?:\s+(.+))?|\/markattendance(?:\s+(.+))?/, async (msg, match) => {
      const queryText = match && (match[1] || match[2]) ? (match[1] || match[2]).trim() : '';
      handleTeacherCheckin(msg.chat.id, queryText, msg);
    });

    botInstance.onText(/\/register|📝 አዲስ ተማሪ ምዝገባ/, async (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'register');
      }
      handleRegister(msg.chat.id);
    });

    botInstance.onText(/\/help|❓ እርዳታ/, async (msg) => {
      if (msg.chat.type !== 'private') {
        return sendGroupToPrivateRedirect(msg.chat.id, msg.from, 'help');
      }
      handleHelp(msg.chat.id);
    });

    // Handle inline button callbacks
    botInstance.on('callback_query', async (query) => {
      const chatId = query.message?.chat?.id;
      const isGroup = query.message?.chat?.type === 'group' || query.message?.chat?.type === 'supergroup';
      const data = query.data;
      if (!chatId) return;

      try {
        if (isGroup) {
          const isAdminReportAction = typeof data === 'string' && data.startsWith('report_');
          if (isAdminReportAction) {
            const authorized = await isAuthorizedAdmin(chatId, query.from?.id, query.message);
            if (authorized) {
              await botInstance.answerCallbackQuery(query.id).catch(() => {});
              if (data === 'report_today') handleAdminAttendanceReport(chatId, 'today', query.message, query.from?.id);
              else if (data === 'report_week') handleAdminAttendanceReport(chatId, 'week', query.message, query.from?.id);
              else if (data === 'report_month') handleAdminAttendanceReport(chatId, 'month', query.message, query.from?.id);
              else if (data === 'report_absentees') handleAdminAttendanceReport(chatId, 'absentees', query.message, query.from?.id);
              else if (data === 'report_atrisk') handleAdminAttendanceReport(chatId, 'atrisk', query.message, query.from?.id);
              else if (data === 'report_csv_today') handleSendTelegramCsvReport(chatId, 'today', query.from?.id);
              else if (data === 'report_csv_week') handleSendTelegramCsvReport(chatId, 'week', query.from?.id);
              return;
            }
          }

          const username = botInfo?.username;
          const cmdParam = (data || '').replace('cmd_', '');
          const dmUrl = username ? `https://t.me/${username}?start=${cmdParam}` : 'https://t.me';

          await botInstance.answerCallbackQuery(query.id, {
            text: '🔒 የግል መረጃዎ እንዲጠበቅ እባክዎ ከቦቱ ጋር በግል (Direct Message) ይወያዩ።',
            show_alert: true,
            url: dmUrl
          }).catch(async () => {
            await botInstance.answerCallbackQuery(query.id, {
              text: '🔒 የግል መረጃዎ እንዲጠበቅ እባክዎ ከቦቱ ጋር በግል ይወያዩ።',
              show_alert: true
            }).catch(() => {});
          });

          return;
        }

        await botInstance.answerCallbackQuery(query.id).catch(() => {});
        if (data === 'cmd_profile') handleProfile(chatId);
        else if (data === 'cmd_certificate') handleCertificate(chatId);
        else if (data === 'cmd_attendance' || data === 'att_all') handleAttendance(chatId, 'all');
        else if (data === 'att_month') handleAttendance(chatId, 'month');
        else if (data === 'att_recent15') handleAttendance(chatId, 'recent15');
        else if (data === 'report_today') handleAdminAttendanceReport(chatId, 'today', query.message, query.from?.id);
        else if (data === 'report_week') handleAdminAttendanceReport(chatId, 'week', query.message, query.from?.id);
        else if (data === 'report_month') handleAdminAttendanceReport(chatId, 'month', query.message, query.from?.id);
        else if (data === 'report_absentees') handleAdminAttendanceReport(chatId, 'absentees', query.message, query.from?.id);
        else if (data === 'report_atrisk') handleAdminAttendanceReport(chatId, 'atrisk', query.message, query.from?.id);
        else if (data === 'report_csv_today') handleSendTelegramCsvReport(chatId, 'today', query.from?.id);
        else if (data === 'report_csv_week') handleSendTelegramCsvReport(chatId, 'week', query.from?.id);
        else if (data === 'cmd_courses') handleCourses(chatId);
        else if (data === 'cmd_results') handleResults(chatId);
        else if (data === 'cmd_announcements') handleAnnouncements(chatId);
        else if (data === 'cmd_portal') handlePortal(chatId);
        else if (data === 'cmd_register') handleRegister(chatId);
        else if (data === 'cmd_quiz' || data === 'cmd_next_quiz') handleQuiz(chatId);
        else if (data === 'cmd_media') handleSpiritualMedia(chatId);
        else if (data === 'cmd_mezmurs') handleMezmurs(chatId);
        else if (data === 'cmd_prayers') handleDailyPrayers(chatId);
        else if (data === 'cmd_ai') handleSpiritualQA(chatId, '');
        else if (data === 'cmd_qa_fasting') handleSpiritualQA(chatId, 'ስለ ጾም');
        else if (data === 'cmd_qa_sacraments') handleSpiritualQA(chatId, 'ስለ ሰባቱ ምስጢራት');
        else if (data === 'cmd_qa_prayers') handleSpiritualQA(chatId, 'የጸሎት ጊዜያት');
        else if (data === 'cmd_qa_school') handleSpiritualQA(chatId, 'የሰንበት ትምህርት ቤት መረጃ');
        else if (data === 'cmd_status_prompt') {
          safeSendMessage(chatId, `📝 *የምዝገባ ሁኔታን ለማረጋገጥ፦*\n\nእባክዎ \`/status <የማመልከቻ ቁጥር>\` ብለው ይላኩ።\nምሳሌ፦ \`/status REG-2026-0042\``, { parse_mode: 'Markdown' });
        }
        else if (data === 'cmd_help') handleHelp(chatId);
      } catch (e) {
        console.error('Telegram callback_query error:', e);
      }
    });

  } catch (error) {
    console.error('Telegram Bot initialization error:', error.message);
  }

  return botInstance;
};

/**
 * Validate Telegram Mini App cryptographic initData signature
 * Official Telegram HMAC-SHA256 verification algorithm
 */
const validateTelegramInitData = (initData) => {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
  if (!initData) return { isValid: false, user: null };

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { isValid: false, user: null };

    let user = null;
    const userStr = params.get('user');
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (e) {}
    }

    if (!token || token.includes('your_token_here')) {
      return { isValid: Boolean(user), user, authDate: params.get('auth_date') };
    }

    params.delete('hash');

    // Sort parameters alphabetically
    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys.map((key) => `${key}=${params.get(key)}`).join('\n');

    // Calculate secret key: HMAC-SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(token)
      .digest();

    // Calculate signature hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const isValid = calculatedHash === hash;
    return { isValid, user: isValid ? user : (user || null), authDate: params.get('auth_date') };
  } catch (err) {
    console.error('validateTelegramInitData error:', err);
    return { isValid: false, user: null };
  }
};

/**
 * Broadcast message to all linked Telegram students
 */
const broadcastToStudents = async (messageText, { filterGrade = null, filterShift = null, filterStudentType = null } = {}) => {
  if (!botInstance) return { success: false, message: 'Telegram Bot is not active' };

  try {
    const query = { telegramChatId: { $exists: true, $ne: null } };
    if (filterGrade) query.grade = filterGrade;
    if (filterShift) query.shift = filterShift;
    if (filterStudentType) query.studentType = filterStudentType;

    const students = await Student.find(query).select('telegramChatId firstName lastName');
    const users = await User.find({ telegramChatId: { $exists: true, $ne: null } }).select('telegramChatId fullName');

    // Combine distinct chatIds
    const chatIds = new Set();
    students.forEach((s) => s.telegramChatId && chatIds.add(s.telegramChatId));
    users.forEach((u) => u.telegramChatId && chatIds.add(u.telegramChatId));

    let sent = 0;
    let failed = 0;

    for (const chatId of chatIds) {
      try {
        await botInstance.sendMessage(chatId, messageText, { parse_mode: 'Markdown' });
        sent++;
        // Small delay to respect Telegram rate limits
        await new Promise((resolve) => setTimeout(resolve, 35));
      } catch (e) {
        failed++;
      }
    }

    return { success: true, total: chatIds.size, sent, failed };
  } catch (err) {
    console.error('broadcastToStudents error:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Send targeted message to Telegram Groups matching student class/grade
 */
const sendMessageToGroups = async ({
  messageText,
  targetGrade = null, // e.g. 'Grade 7', 'Grade 8', or 'All Classes' / null
  targetShift = null,
  targetGroupId = null, // specific group _id or chatId
  targetGroupIds = null, // array of group _ids or chatIds
  sendToGroups = true,
  sendToDirectStudents = false,
} = {}) => {
  if (!botInstance && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      await initTelegramBot();
    } catch (e) {
      console.warn('Auto-init bot in sendMessageToGroups failed:', e.message);
    }
  }
  if (!botInstance) return { success: false, message: 'ቴሌግራም ቦት አልበራም (Telegram Bot is not active)' };

  try {
    let sentGroups = 0;
    let failedGroups = 0;
    let totalGroups = 0;

    if (sendToGroups) {
      let groupQuery = { isActive: true };

      if (targetGroupIds && Array.isArray(targetGroupIds) && targetGroupIds.length > 0) {
        const mongoose = require('mongoose');
        const validObjIds = targetGroupIds
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));
        const chatIds = targetGroupIds.map(String);
        const orConditions = [{ chatId: { $in: chatIds } }];
        if (validObjIds.length > 0) {
          orConditions.push({ _id: { $in: validObjIds } });
        }
        groupQuery = {
          $or: orConditions,
        };
      } else if (targetGroupId) {
        const mongoose = require('mongoose');
        const isObjId = mongoose.Types.ObjectId.isValid(targetGroupId);
        const orConditions = [{ chatId: String(targetGroupId) }];
        if (isObjId) {
          orConditions.push({ _id: new mongoose.Types.ObjectId(targetGroupId) });
        }
        groupQuery = {
          $or: orConditions,
        };
      } else {
        const andConditions = [{ isActive: true }];

        if (targetGrade && targetGrade !== 'all' && targetGrade !== 'All Classes') {
          const matchNum = String(targetGrade).match(/\d+/);
          const num = matchNum ? matchNum[0] : null;
          const gradeVariants = [targetGrade, 'All Classes', 'All', 'ሁሉም ክፍሎች', null, ''];
          if (num) {
            gradeVariants.push(`Grade ${num}`, `${num}ኛ ክፍል`, `${num}ኛ`, num);
          }
          const gradeOr = [{ assignedGrade: { $in: gradeVariants } }];
          if (num) {
            gradeOr.push({ title: { $regex: `${num}ኛ|Grade\\s*${num}`, $options: 'i' } });
          }
          andConditions.push({ $or: gradeOr });
        }

        if (targetShift && targetShift !== 'all') {
          const shiftOr = [{ shift: { $in: [targetShift, 'all', 'day', null, ''] } }];
          if (targetShift === 'night') {
            shiftOr.push({ title: { $regex: 'ማታ|night', $options: 'i' } });
          } else if (targetShift === 'weekend') {
            shiftOr.push({ title: { $regex: 'ቀን|ቅዳሜ|እሁድ|እሑድ|day|weekend', $options: 'i' } });
          }
          andConditions.push({ $or: shiftOr });
        }

        groupQuery = andConditions.length === 1 ? andConditions[0] : { $and: andConditions };
      }

      const groups = await TelegramGroup.find(groupQuery);
      totalGroups = groups.length;

      for (const grp of groups) {
        try {
          const sendRes = await safeSendMessage(grp.chatId, messageText, { parse_mode: 'Markdown' });
          if (sendRes && sendRes.message_id) {
            grp.lastMessageSentAt = new Date();
            grp.lastActivityAt = new Date();
            await grp.save().catch(() => {});
            sentGroups++;
          } else {
            console.warn(`Could not deliver to Telegram group ${grp.title} (${grp.chatId})`);
            failedGroups++;
          }
          await new Promise((resolve) => setTimeout(resolve, 50));
        } catch (e) {
          console.warn(`Failed to send to Telegram group ${grp.title} (${grp.chatId}):`, e.message);
          failedGroups++;
        }
      }
    }

    let directResult = null;
    if (sendToDirectStudents) {
      directResult = await broadcastToStudents(messageText, {
        filterGrade: targetGrade && targetGrade !== 'all' && targetGrade !== 'All Classes' ? targetGrade : null,
        filterShift: targetShift && targetShift !== 'all' ? targetShift : null,
      });
    }

    const totalSent = sentGroups + (directResult?.sent || 0);

    if (sendToGroups && sentGroups === 0 && (!sendToDirectStudents || directResult?.sent === 0)) {
      let warningMsg = '⚠️ መልእክት የሚላክለት ንቁ የቴሌግራም ግሩፕ አልተገኘም ወይም ቦቱ ወደ ግሩፑ መላክ አልቻለም።';
      if (targetGrade && targetGrade !== 'all' && targetGrade !== 'All Classes') {
        warningMsg = `⚠️ ለ "${targetGrade}" የተመደበ ወይም የሚዛመድ የቴሌግራም ግሩፕ አልተገኘም። እባክዎ ቦቱን በግሩፑ ውስጥ /setclass ብለው ያስመዝግቡ።`;
      }
      return {
        success: false,
        totalGroups,
        sentGroups: 0,
        failedGroups,
        directStudents: directResult || null,
        message: warningMsg,
      };
    }

    let resultMsg = '';
    if (sendToGroups && sendToDirectStudents) {
      resultMsg = `መልእክቱ ለ ${sentGroups} የቴሌግራም ግሩፖች ${directResult ? `እና ለ ${directResult.sent || 0} ተማሪዎች ` : ''}በተሳካ ሁኔታ ተልኳል!`;
    } else if (sendToGroups) {
      resultMsg = `መልእክቱ ለ ${sentGroups} የቴሌግራም ግሩፖች በተሳካ ሁኔታ ተልኳል!`;
    } else if (sendToDirectStudents) {
      resultMsg = `መልእክቱ ለ ${directResult?.sent || 0} ተማሪዎች በቀጥታ ቦት ተልኳል!`;
    } else {
      resultMsg = 'መልእክቱ ተልኳል!';
    }

    return {
      success: totalSent > 0,
      totalGroups,
      sentGroups,
      failedGroups,
      directStudents: directResult || null,
      message: resultMsg,
    };
  } catch (err) {
    console.error('sendMessageToGroups error:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Get bot operational status
 */
const getBotStatus = async () => {
  const isConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN && !process.env.TELEGRAM_BOT_TOKEN.includes('your_token'));
  let linkedStudentsCount = 0;
  let linkedUsersCount = 0;
  let connectedGroupsCount = 0;

  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      linkedStudentsCount = await Student.countDocuments({ telegramChatId: { $exists: true, $ne: null } }).maxTimeMS(2000).catch(() => 0);
      linkedUsersCount = await User.countDocuments({ telegramChatId: { $exists: true, $ne: null } }).maxTimeMS(2000).catch(() => 0);
      connectedGroupsCount = await TelegramGroup.countDocuments({ isActive: true }).maxTimeMS(2000).catch(() => 0);
    }
  } catch (e) {}

  return {
    isConfigured,
    isRunning: Boolean(botInstance && botInfo),
    botUsername: botInfo?.username || null,
    botName: botInfo?.first_name || null,
    botLink: botInfo?.username ? `https://t.me/${botInfo.username}` : null,
    linkedStudentsCount,
    linkedUsersCount,
    connectedGroupsCount,
    webAppUrl: getWebAppUrl(),
  };
};

/**
 * Notify student on Telegram when their completion certificate is approved and issued
 */
const notifyStudentCertificateApproved = async (student, cert) => {
  if (!botInstance || !student) return false;

  try {
    const chatId = student.telegramChatId;
    if (!chatId) return false;

    const webAppUrl = getWebAppUrl();
    const certViewUrl = `${webAppUrl}/certificates/${cert.certificateNumber}`;

    let msg = `╭──────────────────────────────╮\n`;
    msg += `    🎉 *የምስክር ወረቀት ይሁንታ አግኝቷል!* 🎉\n`;
    msg += `╰──────────────────────────────╯\n\n`;
    msg += `ሰላም *${student.firstName} ${student.lastName}*፣ እንኳን ደስ አለዎት! 🕊️\n\n`;
    msg += `የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት ትምህርትዎን በስኬት ስላጠናቀቁ ይፋዊው የዲፕሎማ የምስክር ወረቀትዎ በአስተዳዳሪው ይሁንታ አግኝቶ ተዘጋጅቷል። ✨\n\n`;
    msg += `📜 *የሰርተፊኬት ቁጥር፦* \`${cert.certificateNumber}\`\n`;
    msg += `📊 *አጠቃላይ ውጤት፦* *${cert.averageScore || 96.5}%*\n`;
    msg += `🏆 *የማዕረግ ደረጃ፦* ${cert.honors || 'በከፍተኛ ማዕረግ ተመርቋል'}\n`;
    msg += `📅 *የተሰጠበት ቀን፦* ${cert.issueDateEthiopian || '፳፻፲፯ ዓ.ም'}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `ዲጂታል የምስክር ወረቀትዎን ለማየትና ለማውረድ ከታች ያለውን አዝራር ይጫኑ፦`;

    const inlineKeyboard = {
      inline_keyboard: [
        [
          isHttpsUrl(webAppUrl)
            ? { text: '📜 የምስክር ወረቀትዎን ይመልከቱ (View Certificate)', web_app: { url: certViewUrl } }
            : { text: '📜 የምስክር ወረቀትዎን ይመልከቱ (View Certificate)', url: certViewUrl }
        ],
        [
          { text: '🔍 ትክክለኛነት አረጋግጥ', url: `${webAppUrl}/verify-certificate/${cert.certificateNumber}` }
        ]
      ]
    };

    const qrBuffer = await QRCode.toBuffer(certViewUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#0f4c9c', light: '#ffffff' }
    }).catch(() => null);

    if (qrBuffer) {
      await safeSendPhoto(chatId, qrBuffer, msg, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    } else {
      await safeSendMessage(chatId, msg, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    }

    return true;
  } catch (err) {
    console.error('notifyStudentCertificateApproved error:', err);
    return false;
  }
};

/**
 * Record student attendance from QR scan or teacher manual check-in
 */
const recordAttendanceFromQr = async ({
  teacherUserId = null,
  teacherTelegramId = null,
  studentIdentifier,
  courseId = null,
  status = 'Present',
  session = 'Regular',
  sessionId = null,
  date = null,
  recordedBySource = 'Telegram',
}) => {
  try {
    if (!studentIdentifier || String(studentIdentifier).trim() === '') {
      return { success: false, message: 'የተማሪ መለያ ቁጥር ወይም ስም ያስፈልጋል (Student identifier or name is required)' };
    }

    const cleanInput = String(studentIdentifier).trim();
    const mongoose = require('mongoose');
    const ClassSession = require('../models/education/ClassSession');

    // 1. Resolve Teacher
    let teacherUser = null;
    if (teacherUserId) {
      teacherUser = await User.findById(teacherUserId).catch(() => null);
    } else if (teacherTelegramId) {
      teacherUser = await User.findOne({ telegramChatId: String(teacherTelegramId) }).catch(() => null);
    }

    // 2. Resolve Student by ID, Student ID, Registration Number, Phone, or Name
    const queryOr = [
      { studentId: cleanInput },
      { studentId: cleanInput.toUpperCase() },
      { registrationNumber: cleanInput },
      { registrationNumber: cleanInput.toUpperCase() },
      { studentPhone: cleanInput },
      { contactPhone: cleanInput },
      { phone: cleanInput },
    ];

    if (mongoose.Types.ObjectId.isValid(cleanInput)) {
      queryOr.push({ _id: new mongoose.Types.ObjectId(cleanInput) });
      queryOr.push({ userId: new mongoose.Types.ObjectId(cleanInput) });
    }

    // Name search if cleanInput contains letters
    if (cleanInput.length >= 2 && !/^\d+$/.test(cleanInput)) {
      const parts = cleanInput.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        queryOr.push({
          firstName: { $regex: new RegExp(`^${parts[0]}`, 'i') },
          lastName: { $regex: new RegExp(`^${parts[parts.length - 1]}`, 'i') },
        });
      }
      queryOr.push({ firstName: { $regex: new RegExp(`^${cleanInput}$`, 'i') } });
      queryOr.push({ lastName: { $regex: new RegExp(`^${cleanInput}$`, 'i') } });
      queryOr.push({ christianName: { $regex: new RegExp(`^${cleanInput}$`, 'i') } });
    }

    // Also extract student ID if URL was passed from QR scanner (e.g. /verify-certificate?id=STU-001)
    if (cleanInput.includes('id=')) {
      try {
        const urlParams = new URLSearchParams(cleanInput.split('?')[1]);
        const idFromUrl = urlParams.get('id');
        if (idFromUrl) {
          queryOr.push({ studentId: idFromUrl });
          queryOr.push({ studentId: idFromUrl.toUpperCase() });
        }
      } catch (e) {}
    }

    let student = await Student.findOne({ $or: queryOr }).populate('teacher', 'fullName email phone');

    // Fallback search in User schema if not found in Student schema
    if (!student) {
      const userMatch = await User.findOne({
        $or: [
          { phone: cleanInput },
          { email: cleanInput },
          ...(cleanInput.length >= 2 && !/^\d+$/.test(cleanInput) ? [{ fullName: { $regex: new RegExp(cleanInput, 'i') } }] : []),
          ...(mongoose.Types.ObjectId.isValid(cleanInput) ? [{ _id: new mongoose.Types.ObjectId(cleanInput) }] : []),
        ]
      });

      if (userMatch) {
        student = await Student.findOne({ userId: userMatch._id });
        if (!student) {
          student = {
            _id: userMatch._id,
            firstName: userMatch.fullName?.split(' ')[0] || userMatch.fullName || 'ተማሪ',
            lastName: userMatch.fullName?.split(' ').slice(1).join(' ') || '',
            studentId: userMatch.studentProfileId || 'STU-USER',
            grade: userMatch.grade || 'መደበኛ',
            shift: userMatch.shift || 'weekend',
            studentPhone: userMatch.phone,
            telegramChatId: userMatch.telegramChatId,
          };
        }
      }
    }

    if (!student) {
      return { success: false, message: `የተማሪ መረጃ አልተገኘም (${cleanInput})` };
    }

    // 3. Resolve Target ClassSession if sessionId or session title provided
    let targetSession = null;
    if (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) {
      targetSession = await ClassSession.findById(sessionId).catch(() => null);
    }
    if (!targetSession && session && session !== 'Regular') {
      const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      targetSession = await ClassSession.findOne({
        sessionDate: dateStr,
        $or: [
          { title: session },
          { grade: session },
        ]
      }).catch(() => null);
    }

    // 4. Normalized Status
    let normalizedStatus = 'Present';
    const sLower = String(status).toLowerCase();
    if (sLower === 'late' || sLower === 'አርፍዷል') normalizedStatus = 'Late';
    else if (sLower === 'absent' || sLower === 'አልተገኘም') normalizedStatus = 'Absent';
    else if (sLower === 'excused' || sLower === 'ፈቃድ') normalizedStatus = 'Excused';

    // 5. Date normalizer
    const targetDate = date ? new Date(date) : (targetSession ? new Date(targetSession.sessionDate) : new Date());
    targetDate.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    let attRecord = null;
    if (targetSession) {
      attRecord = await Attendance.findOne({
        sessionId: targetSession._id,
        student: student._id,
      });
    }
    if (!attRecord) {
      attRecord = await Attendance.findOne({
        student: student._id,
        date: { $gte: targetDate, $lte: targetDateEnd },
        ...(courseId ? { course: courseId } : {}),
      });
    }

    const teacherName = teacherUser?.fullName || 'መምህር';
    const sessionLabel = targetSession ? (targetSession.title || targetSession.grade) : (session || 'Regular');

    if (attRecord) {
      attRecord.status = normalizedStatus;
      attRecord.checkInTime = new Date();
      if (targetSession) {
        attRecord.sessionId = targetSession._id;
        attRecord.session = sessionLabel;
      } else if (session) {
        attRecord.session = sessionLabel;
      }
      attRecord.scanMethod = 'manual_override';
      if (teacherUser) {
        attRecord.teacher = teacherUser._id;
        attRecord.teacherName = teacherName;
        attRecord.recordedBy = teacherUser._id;
      }
      await attRecord.save();
    } else {
      attRecord = new Attendance({
        sessionId: targetSession ? targetSession._id : null,
        session: sessionLabel,
        student: student._id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        grade: student.grade || student.batch || targetSession?.grade || 'Grade 7',
        studentType: student.studentType || 'regular',
        shift: student.shift || targetSession?.shift || '',
        status: normalizedStatus,
        date: targetSession ? new Date(targetSession.sessionDate) : targetDate,
        checkInTime: new Date(),
        scanMethod: 'manual_override',
        course: courseId || targetSession?.course || null,
        teacher: teacherUser ? teacherUser._id : null,
        teacherName: teacherName,
        recordedBy: teacherUser ? teacherUser._id : null,
      });
      await attRecord.save();
    }

    // STRICT DEDUPLICATION: Purge any conflicting duplicate records for this student on this session or date
    await Attendance.deleteMany({
      _id: { $ne: attRecord._id },
      student: student._id,
      $or: [
        ...(targetSession ? [{ sessionId: targetSession._id }] : []),
        { date: { $gte: targetDate, $lte: targetDateEnd }, ...(courseId ? { course: courseId } : {}) }
      ]
    }).catch(() => {});

    // Update session stats if targetSession
    if (targetSession) {
      const presentCount = await Attendance.countDocuments({ sessionId: targetSession._id, status: 'Present' });
      const lateCount = await Attendance.countDocuments({ sessionId: targetSession._id, status: 'Late' });
      const absentCount = await Attendance.countDocuments({ sessionId: targetSession._id, status: 'Absent' });
      const excusedCount = await Attendance.countDocuments({ sessionId: targetSession._id, status: 'Excused' });
      targetSession.stats = {
        ...targetSession.stats,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
      };
      await targetSession.save().catch(() => {});
    }

    // Calculate updated attendance rate
    const totalCount = await Attendance.countDocuments({ student: student._id }).catch(() => 1);
    const presentCount = await Attendance.countDocuments({
      student: student._id,
      status: { $in: ['Present', 'present', 'Late', 'late'] },
    }).catch(() => 1);
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    // Send instant Telegram notification to the student if they have telegramChatId
    if (student.telegramChatId && botInstance) {
      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ').trim();
      const statusBadge = getStatusBadgeAmharic(normalizedStatus);
      const sessionTitle = targetSession?.title || sessionLabel || 'መደበኛ ትምህርት';
      const studentMsg = `🕊️ *የሰንበት ት/ቤት የዕለት ክትትልዎ ተመዝግቧል!*\n\n` +
        `👤 *ተማሪ፦* ${fullName}\n` +
        `📅 *ቀን፦* ${formatEthiopianDate(new Date())}\n` +
        `🏫 *ክፍለ-ጊዜ፦* ${sessionTitle}\n` +
        `⚡ *ሁኔታ፦* *${statusBadge} (${normalizedStatus})*\n` +
        `👨‍🏫 *የመዘገበው መምህር፦* ${teacherName}\n` +
        `📈 *የአጠቃላይ ተገኝነት ምጣኔ፦* *${attendanceRate}%*`;

      safeSendMessage(student.telegramChatId, studentMsg, { parse_mode: 'Markdown' }).catch(() => {});
    }

    return {
      success: true,
      message: 'የተማሪ ክትትል በተሳካ ሁኔታ ተመዝግቧል!',
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.studentId,
        grade: student.grade || student.batch,
        shift: student.shift,
      },
      attendanceRecord: attRecord,
      status: normalizedStatus,
      attendanceRate,
    };
  } catch (err) {
    console.error('recordAttendanceFromQr error:', err);
    return { success: false, message: err.message };
  }
};

/**
 * Send a formatted attendance report from Web Admin directly to Admin DM and/or Telegram Class Groups
 */
const sendAttendanceReportToTelegram = async ({
  adminUser = null,
  messageText,
  targetGrade = null,
  targetShift = null,
  sendToSelf = true,
  sendToGroups = false,
  targetGroupId = null,
} = {}) => {
  if (!botInstance && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      await initTelegramBot();
    } catch (e) {
      console.warn('Auto-init bot in sendAttendanceReportToTelegram failed:', e.message);
    }
  }
  if (!botInstance) {
    return { success: false, message: 'ቴሌግራም ቦት አልበራም (Telegram Bot is not active)' };
  }

  let sentToAdmin = false;
  let sentGroups = 0;
  const errors = [];

  // 1. Send to Admin's linked Telegram DM (or fallback to TELEGRAM_ADMIN_IDS)
  if (sendToSelf) {
    const adminChatIds = new Set();
    if (adminUser?.telegramChatId) {
      adminChatIds.add(String(adminUser.telegramChatId));
    } else if (adminUser?._id || adminUser?.id) {
      const dbUser = await User.findById(adminUser._id || adminUser.id).select('telegramChatId').lean().catch(() => null);
      if (dbUser?.telegramChatId) adminChatIds.add(String(dbUser.telegramChatId));
    }
    if (adminChatIds.size === 0) {
      const envAdmins = (process.env.TELEGRAM_ADMIN_IDS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      envAdmins.forEach((id) => adminChatIds.add(id));
    }

    if (adminChatIds.size === 0 && !sendToGroups) {
      return {
        success: false,
        message: 'የቴሌግራም አካውንትዎ አልተገናኘም። እባክዎ መጀመሪያ ከቴሌግራም ቦቱ ጋር ስልክዎን ያገናኙ ወይም የክፍል ግሩፕ ይምረጡ።',
      };
    }

    for (const cId of adminChatIds) {
      try {
        await safeSendMessage(cId, messageText, { parse_mode: 'Markdown' });
        sentToAdmin = true;
      } catch (e) {
        errors.push(e.message);
      }
    }
  }

  // 2. Optionally send to matching Telegram Class Group(s)
  if (sendToGroups) {
    const groupRes = await sendMessageToGroups({
      messageText,
      targetGrade,
      targetShift,
      targetGroupId,
      sendToGroups: true,
      sendToDirectStudents: false,
    });
    if (groupRes.success) {
      sentGroups = groupRes.sentGroups || 0;
    } else if (groupRes.message) {
      errors.push(groupRes.message);
    }
  }

  if (!sentToAdmin && sentGroups === 0) {
    return {
      success: false,
      message: errors[0] || 'ሪፖርቱን ወደ ቴሌግራም መላክ አልተቻለም (የተገናኘ የቴሌግራም ግሩፕ ወይም አድሚን አልተገኘም)።',
    };
  }

  return {
    success: true,
    sentToAdmin,
    sentGroups,
    message: `ሪፖርቱ በተሳካ ሁኔታ ወደ ቴሌግራም ተልኳል!${sentToAdmin ? ' (ወደ አስተዳዳሪ)' : ''}${sentGroups > 0 ? ` (${sentGroups} ግሩፕ)` : ''}`,
  };
};

module.exports = {
  initTelegramBot,
  getBotInstance: () => botInstance,
  validateTelegramInitData,
  safeSendMessage,
  broadcastToStudents,
  sendMessageToGroups,
  sendAttendanceReportToTelegram,
  upsertTelegramGroup,
  autoDetectClassAndShift,
  normalizeGradeString,
  normalizeShiftString,
  parseGradeAndShift,
  getBotStatus,
  findLinkedStudent,
  notifyStudentCertificateApproved,
  recordAttendanceFromQr,
};

