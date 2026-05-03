const express = require('express');
const router = express.Router();
const {
    registerStudent,
    loginStudent,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    updateStudent,
    getStudentProfile,
    updateStudentProfile,
    importStudents,
    deleteAllStudents,
    deleteStudent,
    forgotPassword,
    verifyOTP,
    resetPassword,
    getPendingCounts
} = require('../controllers/studentController');
const { protect, admin, teacher } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// Students
router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.post('/import', protect, admin, upload.single('file'), importStudents);
router.delete('/all', protect, admin, deleteAllStudents);
// Profile
router.get('/profile', protect, getStudentProfile);
router.put('/profile', protect, updateStudentProfile);

router.get('/pending/counts', protect, admin, getPendingCounts);

router.route('/').get(protect, teacher, getAllStudents);
router.route('/:id')
    .get(protect, admin, getStudentById)
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);
router.route('/:id/status').put(protect, admin, updateStudentStatus);

module.exports = router;
