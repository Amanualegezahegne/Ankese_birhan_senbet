const express = require('express');
const router = express.Router();
const {
    recordAttendance,
    getAttendanceByDate,
    getAttendanceReport
} = require('../controllers/attendanceController');
const { protect, teacher } = require('../middleware/authMiddleware');

router.post('/', protect, teacher, recordAttendance);
router.get('/report', protect, teacher, getAttendanceReport);
router.get('/date/:date', protect, teacher, getAttendanceByDate);

module.exports = router;
