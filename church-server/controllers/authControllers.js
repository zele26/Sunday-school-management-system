// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword } = require('../controllers/authControllers');

// Register
router.post('/register', register);
router.post('/signup', register);  // alias

// Login
router.post('/login', login);

// Forgot Password
router.post('/forgot-password', forgotPassword);

module.exports = router;