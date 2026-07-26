const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const User = require('../models/User');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const cloudinary = require('cloudinary').v2;

const generateRegNumber = async () => {
  const last = await Registration.findOne().sort({ createdAt: -1 });
  const count = last ? parseInt(last.registrationNumber.split('-')[2]) + 1 : 1;
  return `REG-${new Date().getFullYear()}-${String(count).padStart(6, '0')}`;
};

// POST /api/registrations – submit registration (phone required, email optional)
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const {
      fullName, gender, dateOfBirth, phone, grade, address,
      parentName, parentPhone, parentEmail,
      email, password, studentType,
    } = req.body;

    // Phone is now mandatory
    if (!fullName || !grade || !phone || !password || !studentType) {
      return res.status(400).json({
        success: false,
        message: 'ሙሉ ስም፣ ክፍል፣ ስልክ ቁጥር፣ ፓስዎርድ እና የተማሪ አይነት ያስፈልጋሉ።',
      });
    }

    // Check duplicate phone
    const existingReg = await Registration.findOne({ phone, status: { $ne: 'Rejected' } });
    if (existingReg) return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ምዝገባ አለው' });
    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ success: false, message: 'ይህ ስልክ ቁጥር ቀድሞውኑ ተመዝግቧል' });

    // Hash password
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

    const registration = await Registration.create({
      registrationNumber,
      fullName,
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
      status: studentType === 'distance' ? 'Pending Payment' : 'Pending Verification',
    });

    res.status(201).json({
      success: true,
      message: studentType === 'distance'
        ? 'ምዝገባዎ ተቀባይነት አግኝቷል። እባክዎ ክፍያ ከፍለው ደረሰኝ ይላኩ።'
        : 'ምዝገባዎ ተቀባይነት አግኝቷል። ማረጋገጫውን ይጠብቁ።',
      registration: { registrationNumber: registration.registrationNumber, status: registration.status },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/registrations/login – status check using phone + password
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
      studentId: reg.studentId,   // only after approval
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/payment-info – unchanged
router.get('/payment-info', async (req, res) => {
  try {
    const payment = await Payment.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!payment) return res.status(404).json({ message: 'የክፍያ መረጃ አልተገኘም' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/registrations/upload-receipt – unchanged
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