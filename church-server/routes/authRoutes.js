// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, forgotPassword } = require('../controllers/authControllers');

// Authentication Endpoints
router.post('/register', register);
router.post('/signup', register); // alias so both /register and /signup work
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

module.exports = router;