const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('cloudinary').v2;

// ---------- HELPERS ----------

const generateRegNumber = async () => {
  const last = await Registration.findOne().sort({ createdAt: -1 });
  const count = last ? parseInt(last.registrationNumber.split('-')[2]) + 1 : 1;
  return `REG-${new Date().getFullYear()}-${String(count).padStart(6, '0')}`;
};

// Ethiopian year suffix (e.g. "18" for 2018) – not used here but kept for admin route
const getEthiopianYearSuffix = () => {
  const now = new Date();
  const gregorianYear = now.getFullYear();
  const ethiopianYear =
    now >= new Date(gregorianYear, 8, 11)   // Meskerem 1
      ? gregorianYear - 7
      : gregorianYear - 8;
  return String(ethiopianYear % 100).padStart(2, '0');
};

// ---------- PUBLIC ROUTES ----------

// POST /api/registrations – submit registration
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const {
      fullName, firstName, middleName, lastName, educationLevel, profession,
      gender, dateOfBirth, phone, grade, address,
      parentName, parentPhone, parentEmail,
      email, password, studentType,
    } = req.body;

    const normalizedFirstName = (firstName || fullName || '').toString().trim();
    const normalizedMiddleName = (middleName || '').toString().trim();
    const normalizedLastName = (lastName || '').toString().trim();
    const normalizedEducationLevel = (educationLevel || '').toString().trim();
    const normalizedProfession = (profession || '').toString().trim();
    const normalizedFullName = [normalizedFirstName, normalizedMiddleName, normalizedLastName].filter(Boolean).join(' ').trim();

    if (!normalizedFullName || !normalizedEducationLevel || !normalizedProfession || !grade || !phone || !password || !studentType) {
      return res.status(400).json({
        success: false,
        message: 'First name, middle name, last name, education level, profession, grade, phone, password, and student type are required.',
      });
    }

    // Check duplicate phone
    const existingReg = await Registration.findOne({ phone, status: { $ne: 'Rejected' } });
    if (existingReg) return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ምዝገባ አለው' });
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ተመዝግቧል' });

    // Check email if provided
    if (email && email.trim() !== '') {
      const existingEmailReg = await Registration.findOne({ email: email.toLowerCase(), status: { $ne: 'Rejected' } });
      if (existingEmailReg) return res.status(400).json({ success: false, message: 'ይህ ኢሜይል ቀድሞውኑ ምዝገባ አለው' });
      const existingEmailUser = await User.findOne({ email: email.toLowerCase() });
      if (existingEmailUser) return res.status(400).json({ success: false, message: 'ይህ ኢሜይል ቀድሞውኑ ተመዝግቧል' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let receiptUrl = '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'receipts' });
      receiptUrl = result.secure_url;
    }

    const registrationNumber = await generateRegNumber();

    // ✅ Do NOT generate studentId at this stage
    const registration = await Registration.create({
      registrationNumber,
      fullName: normalizedFullName,
      firstName: normalizedFirstName,
      middleName: normalizedMiddleName,
      lastName: normalizedLastName,
      educationLevel: normalizedEducationLevel,
      profession: normalizedProfession,
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '',
      phone,
      grade,
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      parentEmail: parentEmail || '',
      email: email?.toLowerCase() || '',
      password: hashedPassword,
      studentType,
      receiptUrl,
      // studentId intentionally omitted – will be set on approval
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
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/registrations/login – status check (phone + password)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ message: 'ስልክ ቁጥር እና ፓስዎርድ ያስፈልጋል' });

    const reg = await Registration.findOne({ phone });
    if (!reg) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    const isMatch = await bcrypt.compare(password, reg.password);
    if (!isMatch) return res.status(401).json({ message: 'የይለፍ ቃል ትክክል አይደለም' });

    res.json({
      registrationNumber: reg.registrationNumber,
      fullName: reg.fullName,
      status: reg.status,
      studentType: reg.studentType,
      receiptUrl: reg.receiptUrl,
      studentId: reg.studentId || null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/payment-info
router.get('/payment-info', async (req, res) => {
  try {
    const payment = await Payment.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: 'የክፍያ መረጃ አልተገኘም' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/registrations/upload-receipt
router.put('/upload-receipt', async (req, res) => {
  try {
    const { registrationNumber, transactionRef, receiptUrl } = req.body;
    if (!registrationNumber) return res.status(400).json({ message: 'የምዝገባ ቁጥር ያስፈልጋል' });

    const reg = await Registration.findOne({ registrationNumber });
    if (!reg) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });
    if (reg.status !== 'Pending Payment') return res.status(400).json({ message: 'ምዝገባው ክፍያ ለመቀበል ዝግጁ አይደለም' });

    reg.transactionRef = transactionRef || '';
    reg.receiptUrl = receiptUrl || '';
    reg.status = 'Pending Verification';
    await reg.save();

    res.json({ success: true, message: 'ደረሰኝ ተቀባይነት አግኝቷል። በመጠበቅ ላይ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;