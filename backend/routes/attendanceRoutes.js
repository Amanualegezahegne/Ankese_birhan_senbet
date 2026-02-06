const express = require('express');
const router = express.Router();
const {
    recordAttendance,
    getAttendanceByDate
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, recordAttendance);
router.get('/date/:date', protect, getAttendanceByDate);

module.exports = router;
