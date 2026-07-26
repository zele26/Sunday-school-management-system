const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

// Helper: generate registration number
const generateRegNumber = async () => {
  const last = await Registration.findOne().sort({ createdAt: -1 });
  const count = last ? parseInt(last.registrationNumber.split('-')[2]) + 1 : 1;
  return `REG-${new Date().getFullYear()}-${String(count).padStart(6, '0')}`;
};

// ---------- Public: submit registration (with file upload) ----------
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const {
      fullName, gender, dateOfBirth, phone, grade, address,
      parentName, parentPhone, parentEmail,
      email, password, studentType,
    } = req.body;

    if (!fullName || !grade || !email || !password || !studentType) {
      return res.status(400).json({
        success: false,
        message: 'ሙሉ ስም፣ ክፍል፣ ኢሜይል፣ ፓስዎርድ እና የተማሪ አይነት ያስፈልጋሉ።',
      });
    }

    // Check if email already used
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'ይህ ኢሜይል ቀድሞውኑ ተመዝግቧል' });
    }

    const existingReg = await Registration.findOne({ email: email.toLowerCase(), status: { $ne: 'Rejected' } });
    if (existingReg) {
      return res.status(400).json({ success: false, message: 'ይህ ኢሜይል በመጠበቅ ላይ ያለ ምዝገባ አለው' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle receipt upload if a file was attached
    let receiptUrl = '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'receipts' });
      receiptUrl = result.secure_url;
    }

    const registrationNumber = await generateRegNumber();

    const registration = await Registration.create({
      registrationNumber,
      fullName,
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '',
      phone: phone || '',
      grade,
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      parentEmail: parentEmail || '',
      email: email.toLowerCase(),
      password: hashedPassword,
      studentType,
      receiptUrl,
      status: receiptUrl ? 'Pending Verification' : 'Pending Payment',
    });

    res.status(201).json({
      success: true,
      message: receiptUrl
        ? 'ምዝገባዎ ተቀባይነት አግኝቷል። እባክዎ ማረጋገጫውን ይጠብቁ።'
        : 'ምዝገባዎ ተቀባይነት አግኝቷል። እባክዎ የክፍያ ደረሰኝ ይላኩ።',
      registration: {
        registrationNumber: registration.registrationNumber,
        status: registration.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Public: get payment instructions ----------
router.get('/payment-info', async (req, res) => {
  try {
    const payment = await Payment.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: 'የክፍያ መረጃ አልተገኘም' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Public: applicant login / status check ----------
router.post('/login', async (req, res) => {
  try {
    const { registrationNumber, password } = req.body;
    if (!registrationNumber || !password) {
      return res.status(400).json({ message: 'የምዝገባ ቁጥር እና ፓስዎርድ ያስፈልጋል' });
    }
    const reg = await Registration.findOne({ registrationNumber });
    if (!reg) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    const isMatch = await bcrypt.compare(password, reg.password);
    if (!isMatch) return res.status(401).json({ message: 'የይለፍ ቃል ትክክል አይደለም' });

    res.json({
      registrationNumber: reg.registrationNumber,
      fullName: reg.fullName,
      status: reg.status,
      studentType: reg.studentType,
      receiptUrl: reg.receiptUrl,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Public: look up registration by number or email (kept for admin or quick view) ----------
router.get('/lookup', async (req, res) => {
  try {
    const { registrationNumber, email } = req.query;
    let registration;
    if (registrationNumber) {
      registration = await Registration.findOne({ registrationNumber });
    } else if (email) {
      registration = await Registration.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: 'የምዝገባ ቁጥር ወይም ኢሜይል ያቅርቡ' });
    }
    if (!registration) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });
    res.json({
      registrationNumber: registration.registrationNumber,
      fullName: registration.fullName,
      status: registration.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Public: upload payment receipt (for returning applicants) ----------
router.put('/upload-receipt', async (req, res) => {
  try {
    const { registrationNumber, transactionRef, receiptUrl } = req.body;
    if (!registrationNumber) return res.status(400).json({ message: 'የምዝገባ ቁጥር ያስፈልጋል' });

    const registration = await Registration.findOne({ registrationNumber });
    if (!registration) return res.status(404).json({ message: 'ምዝገባ አልተገኘም' });

    if (registration.status !== 'Pending Payment') {
      return res.status(400).json({ message: 'ምዝገባው ክፍያ ለመቀበል ዝግጁ አይደለም' });
    }

    registration.transactionRef = transactionRef || '';
    registration.receiptUrl = receiptUrl || '';
    registration.status = 'Pending Verification';
    await registration.save();

    res.json({ success: true, message: 'ደረሰኝ ተቀባይነት አግኝቷል። በመጠባበቅ ላይ' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;