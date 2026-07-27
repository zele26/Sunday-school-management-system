const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, changePassword } = require('../controllers/authControllers');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', protect, changePassword);

module.exports = router;