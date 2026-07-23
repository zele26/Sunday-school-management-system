const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, forgotPassword } = require('../controllers/authControllers');

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);

module.exports = router;