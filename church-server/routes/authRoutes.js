const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'ተጠቃሚው ቀደም ብሎ ተመዝግቧል (User email already registered)' });
    }

    const newUser = new User({ ...req.body, email: cleanEmail });
    await newUser.save();
    
    return res.status(201).json({ message: 'Success', user: { fullName: newUser.fullName, email: newUser.email, role: newUser.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    const cleanedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanedEmail });
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password || '', user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const secretKey = process.env.JWT_SECRET || 'SECRET_KEY';
    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '2h' });

    res.json({
      token,
      user: { name: user.fullName, role: user.role, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const secretKey = process.env.JWT_SECRET || 'SECRET_KEY';
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;