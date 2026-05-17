const express = require('express');
const router = express.Router();
const {
    recordAttendance,
    getAttendanceByDate,
    getAttendanceReport
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, recordAttendance);
router.get('/report', protect, getAttendanceReport);
router.get('/date/:date', protect, getAttendanceByDate);

module.exports = router;
