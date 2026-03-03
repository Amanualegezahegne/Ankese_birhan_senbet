const express = require('express');
const router = express.Router();
const { register, login, getAdminProfile, updateAdminProfile, forgotPassword, verifyOTP, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

router.route('/profile')
    .get(protect, getAdminProfile)
    .put(protect, updateAdminProfile);

module.exports = router;
