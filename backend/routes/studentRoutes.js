const express = require('express');
const router = express.Router();
const {
    registerStudent,
    getAllStudents,
    getStudentById,
    updateStudentStatus
} = require('../controllers/studentController');

// TODO: Add auth middleware for admin routes
router.post('/register', registerStudent);
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.put('/:id/status', updateStudentStatus);

module.exports = router;
