const { supabase } = require('../config/db');

// @desc    Record or update attendance
// @route   POST /api/attendance
// @access  Private (Admin Only)
const recordAttendance = async (req, res) => {
    try {
        const { date, records } = req.body; // records: [{ student: id, status: 'Present'|'Absent' }]

        if (!date || !records || !Array.isArray(records)) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        // Format date to YYYY-MM-DD for PostgreSQL DATE type
        const attendanceDate = new Date(date).toISOString().split('T')[0];

        const upsertData = records.map(record => ({
            student_id: record.student,
            date: attendanceDate,
            status: record.status
        }));

        const { error } = await supabase
            .from('attendance')
            .upsert(upsertData, { onConflict: 'student_id,date' });

        if (error) throw error;

        res.status(200).json({ success: true, message: 'Attendance recorded successfully' });
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Private (Admin Only)
const getAttendanceByDate = async (req, res) => {
    try {
        const searchDate = new Date(req.params.date).toISOString().split('T')[0];

        const { data: attendance, error } = await supabase
            .from('attendance')
            .select(`
                *,
                student:students (id, name, christian_name)
            `)
            .eq('date', searchDate);

        if (error) throw error;

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    recordAttendance,
    getAttendanceByDate
};
