// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  getProfile, 
  forgotPassword 
} = require('../controllers/authController');

// Authentication Endpoints
router.post('/signup', signup);
router.post('/register', signup); // Alias route so both /register and /signup work
router.post('/login', login);
router.get('/profile', getProfile);
router.post('/forgot-password', forgotPassword);

module.exports = router;