const express = require('express');
const router = express.Router();
const {
    registerStudent,
    loginStudent,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    getStudentProfile,
    updateStudentProfile
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// Students
router.post('/register', registerStudent);
router.post('/login', loginStudent);
// Profile
router.get('/profile', protect, getStudentProfile);
router.put('/profile', protect, updateStudentProfile);

router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id/status', updateStudentStatus);

module.exports = router;
