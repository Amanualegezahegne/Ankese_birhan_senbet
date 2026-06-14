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

        // Try upsert with conflict resolution first
        const { error } = await supabase
            .from('attendance')
            .upsert(upsertData, { onConflict: 'student_id,date', ignoreDuplicates: false });

        if (error) {
            // If upsert fails (e.g. no unique constraint), fall back to delete + insert
            console.warn('Upsert failed, falling back to delete+insert:', error.message);
            const dates = [...new Set(upsertData.map(r => r.date))];
            const studentIds = upsertData.map(r => r.student_id);

            for (const d of dates) {
                const { error: delError } = await supabase
                    .from('attendance')
                    .delete()
                    .eq('date', d)
                    .in('student_id', studentIds);
                if (delError) throw delError;
            }

            const { error: insertError } = await supabase
                .from('attendance')
                .insert(upsertData);
            if (insertError) throw insertError;
        }

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
                student:students (id, name, christian_name, grade)
            `)
            .eq('date', searchDate);

        if (error) throw error;

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get attendance report/analysis
// @route   GET /api/attendance/report
// @access  Private (Admin Only)
const getAttendanceReport = async (req, res) => {
    try {
        const { data: attendanceData, error } = await supabase
            .from('attendance')
            .select(`
                status,
                student:students (role)
            `);

        if (error) throw error;

        const report = {
            student: { present: 0, absent: 0, permission: 0, total: 0 },
            teacher: { present: 0, absent: 0, permission: 0, total: 0 },
            overall: { present: 0, absent: 0, permission: 0, total: 0 }
        };

        attendanceData.forEach(record => {
            // Note: student can be an array if it's a 1-to-many from the perspective of Supabase,
            // but it's a foreign key on attendance, so it should be an object.
            const role = Array.isArray(record.student) ? record.student[0]?.role : record.student?.role;
            const actualRole = role || 'student';
            const status = record.status.toLowerCase();

            if (report[actualRole]) {
                if (status === 'present') report[actualRole].present++;
                if (status === 'absent') report[actualRole].absent++;
                if (status === 'permission') report[actualRole].permission++;
                report[actualRole].total++;
            }

            if (status === 'present') report.overall.present++;
            if (status === 'absent') report.overall.absent++;
            if (status === 'permission') report.overall.permission++;
            report.overall.total++;
        });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        console.error('Error fetching attendance report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    recordAttendance,
    getAttendanceByDate,
    getAttendanceReport
};
