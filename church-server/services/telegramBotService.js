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
const { formatEthiopianDate } = require('../utils/ethiopianDate');

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
        { text: '📅 የዕለታዊ ክትትል (Attendance)' },
        { text: '📚 ትምህርቶች (Courses)' }
      ],
      [
        { text: '🏆 የፈተና ውጤት (Results)' },
        { text: '📢 ማስታወቂያዎች (Announcements)' }
      ],
      [
        { text: '🔍 መታወቂያ / ሰርተፊኬት (Verify)' },
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

    let group = await TelegramGroup.findOne({ chatId });
    if (!group) {
      group = new TelegramGroup({
        chatId,
        title,
        type,
        assignedGrade: options.assignedGrade || 'All Classes',
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
 * Safe message sender with markdown fallback and error resilience
 */
const safeSendMessage = async (chatId, text, options = {}) => {
  if (!botInstance) return null;
  try {
    return await botInstance.sendMessage(chatId, text, options);
  } catch (err) {
    console.warn(`⚠️ Telegram sendMessage initial attempt failed (${err.message}). Retrying fallback...`);
    try {
      const fallbackOpts = { ...options };
      delete fallbackOpts.parse_mode;
      return await botInstance.sendMessage(chatId, text, fallbackOpts);
    } catch (fallbackErr) {
      console.warn(`⚠️ Telegram sendMessage fallback attempt failed (${fallbackErr.message}). Retrying plain message...`);
      try {
        return await botInstance.sendMessage(chatId, text.replace(/[*_`[\]()]/g, ''));
      } catch (finalErr) {
        console.error(`❌ Telegram sendMessage completely failed for chat ${chatId}:`, finalErr.message);
        return null;
      }
    }
  }
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
        { command: 'profile', description: 'የተማሪ መረጃ እና ዲጂታል QR ባጅ (Student Profile & Badge)' },
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

      // 2. Handle /setclass or /setgrade command inside group
      const text = (msg.text || '').trim();
      if (/^\/(setclass|setgrade|linkclass|assignclass)/i.test(text)) {
        const parts = text.split(/\s+/);
        const rawGrade = parts.slice(1).join(' ');

        if (!rawGrade) {
          const helpMsg = `ℹ️ *የክፍል ምደባ ትእዛዝ (Set Class Command)*\n\nእባክዎ ክፍሉን ጨምረው ይጻፉ።\n\n*ምሳሌዎች፦*\n👉 \`/setclass Grade 7\`\n👉 \`/setclass 8\`\n👉 \`/setclass Grade 12\`\n👉 \`/setclass All\` (ለሁሉም ክፍሎች)\n👉 \`/setclass Distance\` (ለርቀት ተማሪዎች)\n\nአሁን የተመደበለት ክፍል፦ *${group?.assignedGrade || 'All Classes'}*`;
          await safeSendMessage(msg.chat.id, helpMsg, { parse_mode: 'Markdown' });
          return;
        }

        const normalized = normalizeGradeString(rawGrade);
        if (group) {
          group.assignedGrade = normalized;
          group.lastActivityAt = new Date();
          await group.save();
        }

        const successMsg = `✅ *የቴሌግራም ግሩፕ ከክፍል ጋር ተገናኝቷል!*\n\n🏛️ *ግሩፕ፦* ${msg.chat.title}\n🎓 *የተመደበለት ክፍል፦* *${normalized}*\n\n📢 ከአስተዳዳሪው ወይም ከመምህራን ለ *${normalized}* የሚላኩ መልእክቶችና ማስታወቂያዎች በቀጥታ ወደዚህ ግሩፕ ይደርሳሉ።`;
        await safeSendMessage(msg.chat.id, successMsg, { parse_mode: 'Markdown' });
        return;
      }

      // 3. Handle /groupinfo or /classinfo command
      if (/^\/(groupinfo|classinfo|groupstatus)/i.test(text)) {
        const currentGrade = group?.assignedGrade || 'All Classes';
        const infoMsg = `📋 *የግሩፕ መረጃ (Group Info)*\n\n🏛️ *የግሩፕ ስም፦* ${msg.chat.title}\n🆔 *Chat ID፦* \`${msg.chat.id}\`\n🎓 *የተመደበለት ክፍል፦* *${currentGrade}*\n👥 *የአባላት ብዛት፦* ${group?.memberCount || 'ያልታወቀ'}\n⚡ *ሁኔታ፦* ${group?.isActive ? '✅ ንቁ (Active)' : '❌ ቦዘኔ (Inactive)'}\n\n💡 _ክፍሉን ለመቀየር_ \`/setclass Grade 7\` _ብለው ይጻፉ ወይም በአስተዳዳሪው ፖርታል ያስተካክሉ።_`;
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

    // ---------- 1. /start & /menu Commands ----------
    botInstance.onText(/\/start|\/menu/, async (msg) => {
      try {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'ወዳጃችን';
        const student = await findLinkedStudent(chatId).catch(() => null);

        let welcomeMsg = `╭──────────────────────────────╮\n`;
        welcomeMsg += `    ⛪ *ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት* ⛪\n`;
        welcomeMsg += `    ✝️ *ደብረ መድኃኒት ቅዱስ ጊዮርጊስ ቤ/ክ* ✝️\n`;
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
          welcomeMsg += `💡 *አካውንትዎን ለማገናኘት፦*\n`;
          welcomeMsg += `እባክዎ ከታች ያለውን *"📱 ስልክ ቁጥር ያገናኙ (Link Phone)"* የሚለውን አዝራር በመጫን በሰንበት ት/ቤቱ የተመዘገቡበትን ስልክ ቁጥር ያጋሩ።\n\n`;
          welcomeMsg += `ወይም ቀጥታ የተማሪዎች ፖርታልን ለመክፈት ከታች ያለውን አዝራር ይጫኑ፦`;
        }

        const inlineKeyboard = {
          inline_keyboard: [
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
              { text: '📢 ማስታወቂያዎች', callback_data: 'cmd_announcements' },
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
        msg += `🏷️ *መለያ ቁጥር፦* \`${student.studentId || '-'}\`\n`;
        msg += `📝 *የማመልከቻ ቁጥር፦* \`${student.registrationNumber || '-'}\`\n`;
        msg += `📚 *ክፍል / ደረጃ፦* ${student.grade || student.batch || '-'}\n`;
        msg += `🏛️ *የትምህርት ዓይነት፦* ${track}\n`;
        msg += `⏰ *ፈረቃ፦* ${shift}\n`;
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

    botInstance.onText(/\/profile|👤 የእኔ መረጃ/, (msg) => handleProfile(msg.chat.id));

    // ---------- 4. /attendance & "📅 የዕለታዊ ክትትል" (Visual Progress Bar) ----------
    const handleAttendance = async (chatId) => {
      try {
        const student = await findLinkedStudent(chatId).catch(() => null);
        if (!student) {
          return safeSendMessage(
            chatId,
            '⚠️ *የተገናኘ የተማሪ አካውንት አልተገኘም።*\n\nእባክዎ መጀመሪያ *"📱 ስልክ ቁጥር ያገናኙ"* የሚለውን ይጫኑ።',
            { reply_markup: getMainReplyKeyboard() }
          );
        }

        const logs = await Attendance.find({ student: student._id }).sort({ date: -1 }).limit(10).catch(() => []);
        const total = await Attendance.countDocuments({ student: student._id }).catch(() => 0);
        const present = await Attendance.countDocuments({
          student: student._id,
          status: { $in: ['Present', 'present'] }
        }).catch(() => 0);
        const late = await Attendance.countDocuments({
          student: student._id,
          status: { $in: ['Late', 'late'] }
        }).catch(() => 0);
        const absent = await Attendance.countDocuments({
          student: student._id,
          status: { $in: ['Absent', 'absent'] }
        }).catch(() => 0);

        const effectivePresent = present + late;
        const rate = total > 0 ? Math.round((effectivePresent / total) * 100) : (total === 0 ? 100 : 0);
        const progressBar = generateProgressBar(rate, 10);

        let msg = `╭──────────────────────────────╮\n`;
        msg += `   📅 *የዕለታዊ ክትትል ሁኔታ (Attendance)* 📅\n`;
        msg += `╰──────────────────────────────╯\n\n`;
        msg += `👤 *ተማሪ፦* ${student.firstName} ${student.lastName}\n`;
        msg += `📊 *አጠቃላይ የትምህርት ክፍለ-ጊዜያት፦* ${total} ቀናት\n`;
        msg += `✅ *የተገኙባቸው ቀናት፦* ${present} ቀናት\n`;
        if (late > 0) msg += `⚠️ *የዘገዩባቸው ቀናት፦* ${late} ቀናት\n`;
        if (absent > 0) msg += `❌ *ያልተገኙባቸው ቀናት፦* ${absent} ቀናት\n`;
        msg += `\n📈 *የተገኝነት ምጣኔ፦* *${rate}%*\n`;
        msg += `\`${progressBar}\`\n`;
        msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (logs.length > 0) {
          msg += `📋 *የቅርብ ጊዜ ክትትሎች፦*\n`;
          logs.slice(0, 5).forEach((l) => {
            const status = String(l.status || '').toLowerCase();
            let statusIcon = '🟢 ተገኝቷል';
            if (status === 'late') statusIcon = '🟡 አርፍዷል';
            else if (status === 'absent') statusIcon = '🔴 አልተገኘም';

            msg += `• ${formatEthiopianDate(l.date)} — *${l.courseName || 'መደበኛ ትምህርት'}* [${statusIcon}]\n`;
          });
        } else {
          msg += `💡 _እስካሁን የተመዘገበ የዕለታዊ ክትትል መረጃ የለም።_\n`;
        }

        await safeSendMessage(chatId, msg, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                buildPortalInlineButton('📊 ሙሉ የክትትል ዝርዝር በፖርታል ክፈት', '/dashboard/attendance')
              ],
              [
                { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' },
                { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' }
              ],
              [
                { text: '👤 የእኔ መረጃ', callback_data: 'cmd_profile' }
              ]
            ]
          }
        });
      } catch (err) {
        console.error('Telegram handleAttendance error:', err);
      }
    };

    botInstance.onText(/\/attendance|📅 የዕለታዊ ክትትል/, (msg) => handleAttendance(msg.chat.id));

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

    botInstance.onText(/\/courses|📚 ትምህርቶች/, (msg) => handleCourses(msg.chat.id));

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

    botInstance.onText(/\/results|🏆 የፈተና ውጤት/, (msg) => handleResults(msg.chat.id));

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
            msg += `   ${a.content || a.description || ''}\n`;
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

    botInstance.onText(/\/announcements|📢 ማስታወቂያዎች/, (msg) => handleAnnouncements(msg.chat.id));

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

    botInstance.onText(/\/portal|🎓 የተማሪዎች ፖርታል/, (msg) => handlePortal(msg.chat.id));

    // ---------- 9. /verify & Certificate / ID Verification ----------
    botInstance.onText(/\/verify(?:\s+(.+))?|🔍 መታወቂያ \/ ሰርተፊኬት/, async (msg, match) => {
      try {
        const chatId = msg.chat.id;
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

    // ---------- 11. /help & "❓ እርዳታ" ----------
    const handleHelp = async (chatId) => {
      let helpMsg = `╭──────────────────────────────╮\n`;
      helpMsg += `    📖 *የቦት አጠቃቀም መመሪያ (Help)* 📖\n`;
      helpMsg += `╰──────────────────────────────╯\n\n`;
      helpMsg += `🔹 \`/start\` — የቦቱን መነሻ ገጽ እና አዝራሮች ይከፍታል\n`;
      helpMsg += `🔹 \`/profile\` — የተማሪ መረጃዎን እና ዲጂታል QR ባጅዎን ያሳያል\n`;
      helpMsg += `🔹 \`/attendance\` — የዕለታዊ ክትትልዎንና የተገኝነት ምጣኔዎን ያሳያል\n`;
      helpMsg += `🔹 \`/courses\` — የተመዘገቡባቸውን ትምህርቶች ያሳያል\n`;
      helpMsg += `🔹 \`/results\` — የፈተና ውጤቶችን ያሳያል\n`;
      helpMsg += `🔹 \`/announcements\` — አዳዲስ ማስታወቂያዎችን ያሳያል\n`;
      helpMsg += `🔹 \`/portal\` — የተማሪዎች ፖርታል መክፈቻ\n`;
      helpMsg += `🔹 \`/verify <ቁጥር>\` — የሰርተፊኬት ወይም መታወቂያ ትክክለኛነት ያረጋግጣል\n`;
      helpMsg += `🔹 \`/status <ቁጥር>\` — የምዝገባ ሁኔታን ያሳያል\n\n`;
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
              { text: '📅 የዕለታዊ ክትትል', callback_data: 'cmd_attendance' }
            ],
            [
              { text: '📚 ትምህርቶች', callback_data: 'cmd_courses' },
              { text: '🏆 የፈተና ውጤት', callback_data: 'cmd_results' }
            ]
          ]
        }
      });
    };

    botInstance.onText(/\/help|❓ እርዳታ/, (msg) => handleHelp(msg.chat.id));

    // Handle inline button callbacks
    botInstance.on('callback_query', async (query) => {
      const chatId = query.message?.chat?.id;
      const data = query.data;
      if (!chatId) return;

      try {
        await botInstance.answerCallbackQuery(query.id).catch(() => {});
        if (data === 'cmd_profile') handleProfile(chatId);
        else if (data === 'cmd_attendance') handleAttendance(chatId);
        else if (data === 'cmd_courses') handleCourses(chatId);
        else if (data === 'cmd_results') handleResults(chatId);
        else if (data === 'cmd_announcements') handleAnnouncements(chatId);
        else if (data === 'cmd_portal') handlePortal(chatId);
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
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !initData) return { isValid: false };

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { isValid: false };

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
    let user = null;
    const userStr = params.get('user');
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (e) {}
    }

    return { isValid, user, authDate: params.get('auth_date') };
  } catch (err) {
    console.error('validateTelegramInitData error:', err);
    return { isValid: false };
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
  sendToDirectStudents = false,
} = {}) => {
  if (!botInstance) return { success: false, message: 'Telegram Bot is not active' };

  try {
    let groupQuery = { isActive: true };

    if (targetGroupId) {
      groupQuery = {
        $or: [{ _id: targetGroupId }, { chatId: String(targetGroupId) }],
        isActive: true,
      };
    } else if (targetGrade && targetGrade !== 'all' && targetGrade !== 'All Classes') {
      // Matches specific grade OR groups configured for "All Classes"
      groupQuery.assignedGrade = {
        $in: [targetGrade, 'All Classes', 'All', 'ሁሉም ክፍሎች', null, ''],
      };
      if (targetShift && targetShift !== 'all') {
        groupQuery.shift = { $in: [targetShift, 'all'] };
      }
    }

    const groups = await TelegramGroup.find(groupQuery);
    let sentGroups = 0;
    let failedGroups = 0;

    for (const grp of groups) {
      try {
        await safeSendMessage(grp.chatId, messageText, { parse_mode: 'Markdown' });
        grp.lastMessageSentAt = new Date();
        grp.lastActivityAt = new Date();
        await grp.save().catch(() => {});
        sentGroups++;
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (e) {
        console.warn(`Failed to send to Telegram group ${grp.title} (${grp.chatId}):`, e.message);
        failedGroups++;
      }
    }

    let directResult = null;
    if (sendToDirectStudents) {
      directResult = await broadcastToStudents(messageText, {
        filterGrade: targetGrade && targetGrade !== 'all' && targetGrade !== 'All Classes' ? targetGrade : null,
        filterShift: targetShift && targetShift !== 'all' ? targetShift : null,
      });
    }

    return {
      success: true,
      totalGroups: groups.length,
      sentGroups,
      failedGroups,
      directStudents: directResult || null,
      message: `መልእክቱ ለ ${sentGroups} የቴሌግራም ግሩፖች ${directResult ? `እና ለ ${directResult.sent} ተማሪዎች ` : ''}በተሳካ ሁኔታ ተልኳል!`,
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

module.exports = {
  initTelegramBot,
  getBotInstance: () => botInstance,
  validateTelegramInitData,
  broadcastToStudents,
  sendMessageToGroups,
  upsertTelegramGroup,
  normalizeGradeString,
  getBotStatus,
  findLinkedStudent,
};

