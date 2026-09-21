const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const User = require('../models/User');
const SystemSetting = require('../models/SystemSetting');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('../config/cloudinary');

// ---------- HELPERS ----------

let cachedSettings = null;
let lastSettingsFetch = 0;
const SETTINGS_CACHE_TTL = 15000; // 15 seconds

const getRegistrationSettings = async (forceFresh = false) => {
  const now = Date.now();
  if (!forceFresh && cachedSettings && (now - lastSettingsFetch < SETTINGS_CACHE_TTL)) {
    return cachedSettings;
  }
  let settings = await SystemSetting.findOne({ key: 'registration' });
  if (!settings) {
    settings = await SystemSetting.create({ key: 'registration' });
  }
  cachedSettings = settings;
  lastSettingsFetch = now;
  return settings;
};

const normalizeEthiopianPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length >= 9) {
    return '0' + digits.slice(-9);
  }
  return digits;
};

const isValidPhone = (phone) => {
  if (!phone) return false;
  const normalized = normalizeEthiopianPhone(phone);
  return /^0[79]\d{8}$/.test(normalized);
};

const AMHARIC_TEXT_REGEX = /^[\u1200-\u135A\u135F\u1361\u2D80-\u2DDF\uAB00-\uAB2F\s]+$/;
const isAmharicOnly = (text) => {
  if (!text || String(text).trim() === '') return true;
  return AMHARIC_TEXT_REGEX.test(String(text).trim());
};

const generateRegNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Registration.countDocuments();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const candidate = `REG-${year}-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
  const exists = await Registration.findOne({ registrationNumber: candidate });
  if (exists) {
    const extra = Math.floor(1000 + Math.random() * 9000);
    return `REG-${year}-${String(count + 1).padStart(4, '0')}-${extra}`;
  }
  return candidate;
};

// ---------- PUBLIC ROUTES ----------

// GET /api/registrations/status – public check whether registration is open/closed
router.get('/status', async (req, res) => {
  try {
    const settings = await getRegistrationSettings();
    res.json({
      success: true,
      data: {
        isRegistrationOpen: settings.isRegistrationOpen,
        isRegularOpen: settings.isRegularOpen,
        isDistanceOpen: settings.isDistanceOpen,
        academicYear: settings.academicYear,
        regularClosedMessage: settings.regularClosedMessage,
        distanceClosedMessage: settings.distanceClosedMessage,
        generalClosedMessage: settings.generalClosedMessage,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'ቅንብሮችን ማግኘት አልተቻለም', error: err.message });
  }
});

// POST /api/registrations – submit registration
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const {
      fullName, firstName, middleName, lastName, educationLevel, profession,
      gender, dateOfBirth, age, subcity, woreda, kebele, shift, phone, grade, address,
      // Orthodox & Confession Father fields
      christianName, hasConfessionFather, confessionFatherName, confessionFatherPhone,
      // Photos
      photoUrl, emergencyContactPhoto,
      // New emergency fields
      emergencyFirstName, emergencyMiddleName, emergencyLastName,
      relationship, emergencyPhone, emergencyEmail, emergencyAddress,
      // Old emergency/parent fields (for backward compatibility)
      parentName, parentPhone, parentEmail,
      email, password, studentType,
    } = req.body;

    // 🔒 Enforce Registration Open / Closed Check
    const settings = await getRegistrationSettings();
    if (!settings.isRegistrationOpen) {
      return res.status(403).json({
        success: false,
        message: settings.generalClosedMessage || 'የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
      });
    }

    if (studentType === 'regular' && !settings.isRegularOpen) {
      return res.status(403).json({
        success: false,
        message: settings.regularClosedMessage || 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
      });
    }

    if (studentType === 'distance' && !settings.isDistanceOpen) {
      return res.status(403).json({
        success: false,
        message: settings.distanceClosedMessage || 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።',
      });
    }

    // Map old parent fields to new emergency fields if new ones are missing
    const finalEmergencyFirstName = (emergencyFirstName || parentName || '').toString().trim();
    const finalEmergencyMiddleName = (emergencyMiddleName || '').toString().trim();
    const finalEmergencyLastName = (emergencyLastName || '').toString().trim();
    const finalRelationship = relationship || 'Father';
    const finalEmergencyPhone = (emergencyPhone || parentPhone || '').toString().trim();
    const finalEmergencyEmail = (emergencyEmail || parentEmail || '').toString().trim();
    const finalEmergencyAddress = (emergencyAddress || '').toString().trim();

    const normalizedFirstName = (firstName || fullName || '').toString().trim();
    const normalizedMiddleName = (middleName || '').toString().trim();
    const normalizedLastName = (lastName || '').toString().trim();
    const normalizedChristianName = (christianName || '').toString().trim();
    const normalizedEducationLevel = (educationLevel || '').toString().trim();
    const normalizedProfession = (profession || '').toString().trim();
    const normalizedFullName = [normalizedFirstName, normalizedMiddleName, normalizedLastName].filter(Boolean).join(' ').trim();
    const parsedAge = age ? Number(age) : null;
    const normalizedSubcity = (subcity || '').toString().trim();
    const normalizedWoreda = (woreda || '').toString().trim();
    const normalizedKebele = (kebele || '').toString().trim();
    const normalizedShift = (shift || (studentType === 'regular' ? 'weekend' : '')).toString().trim();

    const isHasConfessionFather = Boolean(
      hasConfessionFather === true ||
      hasConfessionFather === 'true' ||
      hasConfessionFather === 'yes' ||
      hasConfessionFather === '1'
    );
    const normalizedConfessionFatherName = isHasConfessionFather ? (confessionFatherName || '').toString().trim() : '';
    const rawConfessionFatherPhone = isHasConfessionFather ? (confessionFatherPhone || '').toString().trim() : '';
    const normalizedConfessionFatherPhone = rawConfessionFatherPhone ? normalizeEthiopianPhone(rawConfessionFatherPhone) : '';

    const finalPhotoUrl = (photoUrl || '').toString().trim();
    const finalEmergencyContactPhoto = (emergencyContactPhoto || '').toString().trim();

    // Determine batch and grade
    let finalGrade = grade;
    let batch = null;
    if (studentType === 'distance') {
      batch = req.body.batch || 'Batch 1';
      finalGrade = grade || batch;
    } else if (!finalGrade) {
      finalGrade = 'Grade 7';
    }

    // Basic required fields
    if (!normalizedFullName || !normalizedEducationLevel || !normalizedProfession || !finalGrade || !phone || !password || !studentType) {
      return res.status(400).json({
        success: false,
        message: 'የመጀመሪያ፣ የአባት እና የአያት ስም፣ የትምህርት ደረጃ፣ ሙያ፣ ስልክ ቁጥር እና የይለፍ ቃል ግዴታ ናቸው።',
      });
    }

    // 🔒 Enforce Amharic-only characters for student names (no English, no digits, no special symbols)
    if (!isAmharicOnly(normalizedFirstName) || !isAmharicOnly(normalizedMiddleName) || !isAmharicOnly(normalizedLastName)) {
      return res.status(400).json({
        success: false,
        message: 'የተማሪው ስም (የመጀመሪያ፣ የአባት እና የአያት ስም) በአማርኛ ፊደላት ብቻ መሆን አለበት። እንግሊዝኛ ወይም ልዩ ምልክቶች አይፈቀዱም።',
      });
    }

    // Validate Christian Name if provided
    if (normalizedChristianName && !isAmharicOnly(normalizedChristianName)) {
      return res.status(400).json({
        success: false,
        message: 'የክርስትና ስም በአማርኛ ፊደላት ብቻ መሆን አለበት። እንግሊዝኛ ወይም ልዩ ምልክቶች አይፈቀዱም።',
      });
    }

    // Validate Confession Father Name if student has confession father
    if (isHasConfessionFather) {
      if (!normalizedConfessionFatherName) {
        return res.status(400).json({
          success: false,
          message: 'የንስሐ አባት አለኝ ብለው ስለመረጡ፣ የንስሐ አባት ስም ማስገባት ግዴታ ነው።',
        });
      }
      if (!isAmharicOnly(normalizedConfessionFatherName)) {
        return res.status(400).json({
          success: false,
          message: 'የንስሐ አባት ስም በአማርኛ ፊደላት ብቻ መሆን አለበት። እንግሊዝኛ ወይም ልዩ ምልክቶች አይፈቀዱም።',
        });
      }
    }

    // Validate Emergency Contact Names
    if (
      !isAmharicOnly(finalEmergencyFirstName) ||
      !isAmharicOnly(finalEmergencyMiddleName) ||
      !isAmharicOnly(finalEmergencyLastName)
    ) {
      return res.status(400).json({
        success: false,
        message: 'የአደጋ ጊዜ ተጠሪ ስም በአማርኛ ፊደላት ብቻ መሆን አለበት። እንግሊዝኛ ወይም ልዩ ምልክቶች አይፈቀዱም።',
      });
    }

    // Validate age: must be provided and greater than 14
    if (!parsedAge || isNaN(parsedAge) || parsedAge <= 14) {
      return res.status(400).json({
        success: false,
        message: 'የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት (Student age must be greater than 14)',
      });
    }

    const cleanPhone = normalizeEthiopianPhone(phone);
    const cleanEmergencyPhone = normalizeEthiopianPhone(finalEmergencyPhone);

    // Validate student phone
    if (!isValidPhone(cleanPhone)) {
      return res.status(400).json({ success: false, message: 'ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት' });
    }

    // Validate emergency contact – must have name and phone from either set
    if (!finalEmergencyFirstName || !cleanEmergencyPhone) {
      return res.status(400).json({ success: false, message: 'የአደጋ ጊዜ ተጠሪ ስም እና ስልክ ግዴታ ነው' });
    }
    if (!isValidPhone(cleanEmergencyPhone)) {
      return res.status(400).json({ success: false, message: 'የአደጋ ጊዜ ተጠሪ ስልክ በትክክል 10 አሃዝ መሆን አለበት' });
    }

    // Validate confession father phone if provided
    if (normalizedConfessionFatherPhone && !isValidPhone(normalizedConfessionFatherPhone)) {
      return res.status(400).json({ success: false, message: 'የንስሐ አባት ስልክ ቁጥር በትክክል 10 አሃዝ መሆን አለበት' });
    }

    // Email optional but validated
    if (email && email.trim() !== '') {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'ኢሜይል ትክክል አይደለም' });
      }
      const existingEmailReg = await Registration.findOne({ email: email.toLowerCase(), status: { $ne: 'Rejected' } });
      if (existingEmailReg) return res.status(400).json({ success: false, message: 'ይህ ኢሜይል ቀድሞውኑ ምዝገባ አለው' });
      const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
      if (existingEmailUser) return res.status(400).json({ success: false, message: 'ይህ ኢሜይል ቀድሞውኑ ተመዝግቧል' });
    }

    // Check duplicate phone (match both normalized and raw)
    const existingReg = await Registration.findOne({
      $or: [{ phone: cleanPhone }, { phone }],
      status: { $ne: 'Rejected' },
    });
    if (existingReg) return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ምዝገባ አለው' });

    const existingUser = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone }],
    });
    if (existingUser) return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ተመዝግቧል' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let receiptUrl = req.body.receiptUrl || '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        try {
          const result = await cloudinary.uploader.upload(dataURI, { folder: 'receipts' });
          receiptUrl = result.secure_url;
        } catch (cErr) {
          receiptUrl = dataURI;
        }
      } else {
        receiptUrl = dataURI;
      }
    }

    const registrationNumber = await generateRegNumber();

    const registration = await Registration.create({
      registrationNumber,
      fullName: normalizedFullName,
      firstName: normalizedFirstName,
      middleName: normalizedMiddleName,
      lastName: normalizedLastName,
      christianName: normalizedChristianName,
      educationLevel: normalizedEducationLevel,
      profession: normalizedProfession,
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '',
      age: parsedAge,
      subcity: normalizedSubcity,
      woreda: normalizedWoreda,
      kebele: normalizedKebele,
      shift: normalizedShift,
      phone: cleanPhone,
      grade: finalGrade,
      batch,
      address: address || '',
      // Confession Father
      hasConfessionFather: isHasConfessionFather,
      confessionFatherName: normalizedConfessionFatherName,
      confessionFatherPhone: normalizedConfessionFatherPhone,
      // Photos
      photoUrl: finalPhotoUrl,
      emergencyContactPhoto: finalEmergencyContactPhoto,
      // New emergency fields
      emergencyFirstName: finalEmergencyFirstName,
      emergencyMiddleName: finalEmergencyMiddleName,
      emergencyLastName: finalEmergencyLastName,
      relationship: finalRelationship,
      emergencyPhone: cleanEmergencyPhone,
      emergencyEmail: finalEmergencyEmail,
      emergencyAddress: finalEmergencyAddress,
      // Legacy fields for backward compatibility
      parentName: finalEmergencyFirstName,
      parentPhone: cleanEmergencyPhone,
      parentEmail: finalEmergencyEmail,
      email: email?.toLowerCase() || '',
      password: hashedPassword,
      studentType,
      receiptUrl,
      telegramChatId: req.body.telegramChatId ? String(req.body.telegramChatId) : '',
      telegramUsername: req.body.telegramUsername ? String(req.body.telegramUsername) : '',
      status: studentType === 'distance' ? 'Pending Payment' : 'Pending Verification',
    });

    res.status(201).json({
      success: true,
      message: studentType === 'distance'
        ? 'ምዝገባዎ ተቀባይነት አግኝቷል። እባክዎ ክፍያ ከፍለው ደረሰኝ ይላኩ።'
        : 'ምዝገባዎ ተቀባይነት አግኝቷል። ማረጋገጫውን ይጠብቁ።',
      registration: {
        registrationNumber: registration.registrationNumber,
        status: registration.status,
        batch: registration.batch || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/registrations/login & /api/registrations/check-status – status check
const handleStatusCheck = async (req, res) => {
  try {
    const { phone, password, registrationNumber } = req.body;
    if ((!phone && !registrationNumber) || !password) {
      return res.status(400).json({ success: false, message: 'ስልክ ቁጥር (ወይም የምዝገባ ቁጥር) እና የይለፍ ቃል ያስፈልጋል' });
    }

    let query;
    if (registrationNumber && registrationNumber.trim()) {
      query = { registrationNumber: registrationNumber.trim() };
    } else {
      const rawPhone = phone.trim();
      const cleanPhone = normalizeEthiopianPhone(rawPhone);
      query = { $or: [{ phone: rawPhone }, { phone: cleanPhone }] };
    }

    const reg = await Registration.findOne(query);
    if (!reg) return res.status(404).json({ success: false, message: 'ምዝገባ አልተገኘም፤ እባክዎ መረጃዎን ያረጋግጡ' });

    const isMatch = await bcrypt.compare(password, reg.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'የይለፍ ቃል ትክክል አይደለም' });

    res.json({
      success: true,
      registrationNumber: reg.registrationNumber,
      fullName: reg.fullName,
      status: reg.status,
      studentType: reg.studentType,
      receiptUrl: reg.receiptUrl,
      studentId: reg.status === 'Approved' ? reg.studentId : null,
      rejectionReason: reg.rejectionReason || null,
      batch: reg.batch || null,
      phone: reg.phone,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/login', handleStatusCheck);
router.post('/check-status', handleStatusCheck);

// GET /api/registrations/payment-info
router.get('/payment-info', async (req, res) => {
  try {
    const payment = await Payment.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!payment) {
      return res.json({
        bankName: 'የኢትዮጵያ ንግድ ባንክ (CBE)',
        accountNumber: '1000123456789',
        accountHolder: 'ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት',
        totalAmount: 1000,
        contributionAmount: 1000,
        resourceFee: 0,
        instructions: 'ክፍያውን በባንክ ወይም በሞባይል ባንኪንግ ከፈጸሙ በኋላ የደረሰኙን ፎቶ ወይም ስክሪንሾት በማያያዝ የክፍያ ማጣቀሻ ቁጥር (FT ቁጥር) ያስገቡ።',
      });
    }
    res.json(payment);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST / PUT /api/registrations/upload-receipt – handles file upload or direct JSON
const handleUploadReceipt = async (req, res) => {
  try {
    let receiptUrl = req.body?.receiptUrl || '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'receipts' });
      receiptUrl = result.secure_url;
    }

    if (!receiptUrl && !req.file) {
      return res.status(400).json({ success: false, message: 'እባክዎ የደረሰኝ ፎቶ ይጫኑ' });
    }

    const { registrationNumber, phone, transactionRef } = req.body;
    if (registrationNumber || phone) {
      let query;
      if (registrationNumber && registrationNumber.trim()) {
        query = { registrationNumber: registrationNumber.trim() };
      } else {
        const rawPhone = phone.trim();
        const cleanPhone = normalizeEthiopianPhone(rawPhone);
        query = { $or: [{ phone: rawPhone }, { phone: cleanPhone }] };
      }
      const reg = await Registration.findOne(query);
      if (reg) {
        reg.receiptUrl = receiptUrl;
        if (transactionRef) reg.transactionRef = transactionRef;
        reg.status = 'Pending Verification';
        await reg.save();
      }
    }

    res.json({
      success: true,
      message: 'የክፍያ ደረሰኝ በተሳካ ሁኔታ ተጭኗል',
      receiptUrl,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/upload-receipt', upload.single('receipt'), handleUploadReceipt);
router.put('/upload-receipt', upload.single('receipt'), handleUploadReceipt);

// POST /api/registrations/submit-payment
router.post('/submit-payment', async (req, res) => {
  try {
    const { registrationNumber, phone, transactionRef, receiptUrl } = req.body;
    if (!registrationNumber && !phone) {
      return res.status(400).json({ success: false, message: 'የምዝገባ ቁጥር ወይም ስልክ ቁጥር ያስፈልጋል' });
    }

    let query;
    if (registrationNumber && registrationNumber.trim()) {
      query = { registrationNumber: registrationNumber.trim() };
    } else {
      const rawPhone = phone.trim();
      const cleanPhone = normalizeEthiopianPhone(rawPhone);
      query = { $or: [{ phone: rawPhone }, { phone: cleanPhone }] };
    }
    const reg = await Registration.findOne(query);
    if (!reg) return res.status(404).json({ success: false, message: 'ምዝገባ አልተገኘም' });

    if (transactionRef) reg.transactionRef = transactionRef.trim();
    if (receiptUrl) reg.receiptUrl = receiptUrl.trim();
    reg.status = 'Pending Verification';
    await reg.save();

    res.json({
      success: true,
      message: 'ክፍያዎ በተሳካ ሁኔታ ተልኳል፤ ማረጋገጫውን በትዕግስት ይጠብቁ።',
      registration: {
        registrationNumber: reg.registrationNumber,
        status: reg.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;