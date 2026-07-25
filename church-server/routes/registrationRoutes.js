// routes/registrationRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Registration = require('../models/Registration');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Helper: generate registration number
const generateRegNumber = async () => {
  const last = await Registration.findOne().sort({ createdAt: -1 });
  const count = last ? parseInt(last.registrationNumber.split('-')[2]) + 1 : 1;
  return `REG-${new Date().getFullYear()}-${String(count).padStart(6, '0')}`;
};

// ---------- Public: submit registration ----------
router.post('/', async (req, res) => {
  try {
    const {
      fullName, gender, dateOfBirth, grade, address,
      parentName, parentPhone, parentEmail,
      email, password,
    } = req.body;

    if (!fullName || !grade || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, grade, email, and password are required.' });
    }

    // Check if email already used
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const existingReg = await Registration.findOne({ email: email.toLowerCase(), status: { $ne: 'Rejected' } });
    if (existingReg) {
      return res.status(400).json({ success: false, message: 'You already have a pending registration with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const registrationNumber = await generateRegNumber();

    const registration = await Registration.create({
      registrationNumber,
      fullName,
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '',
      grade,
      address: address || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      parentEmail: parentEmail || '',
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Please complete the payment to continue.',
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
    if (!payment) return res.status(404).json({ message: 'Payment info not available' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Public: look up registration by number or email ----------
router.get('/lookup', async (req, res) => {
  try {
    const { registrationNumber, email } = req.query;
    let registration;
    if (registrationNumber) {
      registration = await Registration.findOne({ registrationNumber });
    } else if (email) {
      registration = await Registration.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    } else {
      return res.status(400).json({ message: 'Provide registration number or email' });
    }
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    res.json({
      registrationNumber: registration.registrationNumber,
      fullName: registration.fullName,
      status: registration.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Public: upload payment receipt ----------
router.put('/upload-receipt', async (req, res) => {
  try {
    const { registrationNumber, transactionRef, receiptUrl } = req.body;
    if (!registrationNumber) return res.status(400).json({ message: 'Registration number required' });

    const registration = await Registration.findOne({ registrationNumber });
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (registration.status !== 'Pending Payment') {
      return res.status(400).json({ message: 'Registration is not awaiting payment' });
    }

    registration.transactionRef = transactionRef || '';
    registration.receiptUrl = receiptUrl || '';
    registration.status = 'Pending Verification';
    await registration.save();

    res.json({ success: true, message: 'Receipt uploaded. Awaiting verification.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;