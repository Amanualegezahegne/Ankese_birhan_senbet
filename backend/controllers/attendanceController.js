const Attendance = require('../models/Attendance');

// @desc    Record or update attendance
// @route   POST /api/attendance
// @access  Private (Admin Only)
const recordAttendance = async (req, res) => {
    try {
        const { date, records } = req.body; // records: [{ student: id, status: 'Present'|'Absent' }]

        if (!date || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const operations = records.map(record => ({
            updateOne: {
                filter: { student: record.student, date: attendanceDate },
                update: { status: record.status },
                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);

        res.status(200).json({ success: true, message: 'Attendance recorded successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Private (Admin Only)
const getAttendanceByDate = async (req, res) => {
    try {
        const searchDate = new Date(req.params.date);
        searchDate.setHours(0, 0, 0, 0);

        const attendance = await Attendance.find({ date: searchDate }).populate('student', 'name christianName');

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    recordAttendance,
    getAttendanceByDate
};
