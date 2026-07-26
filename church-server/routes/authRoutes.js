const express = require('express');
const router = express.Router();
const { register, login, forgotPassword } = require('../controllers/authControllers');

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Refresh and logout are no longer used – removed

module.exports = router;