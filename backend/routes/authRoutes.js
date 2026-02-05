const express = require('express');
const router = express.Router();
const { register, login, getAdminProfile, updateAdminProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);

router.route('/profile')
    .get(protect, getAdminProfile)
    .put(protect, updateAdminProfile);

module.exports = router;
