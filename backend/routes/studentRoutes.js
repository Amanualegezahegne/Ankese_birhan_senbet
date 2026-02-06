const express = require('express');
const router = express.Router();
const {
    registerStudent,
    loginStudent,
    getAllStudents,
    getStudentById,
    updateStudentStatus,
    getStudentProfile,
    updateStudentProfile,
    importStudents,
    deleteAllStudents,
    deleteStudent
} = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// Students
router.post('/register', registerStudent);
router.post('/login', loginStudent);
router.post('/import', protect, admin, upload.single('file'), importStudents);
router.delete('/all', protect, admin, deleteAllStudents);
// Profile
router.get('/profile', protect, getStudentProfile);
router.put('/profile', protect, updateStudentProfile);

router.route('/').get(protect, admin, getAllStudents);
router.route('/:id')
    .get(protect, admin, getStudentById)
    .delete(protect, admin, deleteStudent);
router.route('/:id/status').put(protect, admin, updateStudentStatus);

module.exports = router;
