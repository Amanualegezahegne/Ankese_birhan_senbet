import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import '../Styles/Attendance.css';

const Attendance = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [gradeFilter, setGradeFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const isMounted = useRef(false);

    // Derived: filter students by selected grade
    const filteredStudents = gradeFilter && gradeFilter !== 'All'
        ? students.filter(s => s.grade === gradeFilter)
        : students;

    // ── Fetch ──────────────────────────────────────────────────

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('studentToken');
            const response = await api.get('/students?role=student', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const sorted = response.data.data.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                setStudents(sorted);
                return sorted;
            }
            return [];
        } catch (error) {
            console.error('Error fetching students:', error);
            setMessage({ type: 'error', text: 'Failed to load students. Please try again.' });
            return [];
        }
    };

    const fetchAttendanceForDate = async (dateStr, studentList) => {
        try {
            const token = localStorage.getItem('studentToken');
            const response = await api.get(`/attendance/date/${dateStr}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const existingMap = {};
                (response.data.data || []).forEach(record => {
                    existingMap[record.student_id] = record.status;
                });

                // Pre-fill students without a record as 'Present' (same as admin)
                const initialMap = { ...existingMap };
                (studentList || students).forEach(student => {
                    const id = student.id || student._id;
                    if (!initialMap[id]) {
                        initialMap[id] = 'Present';
                    }
                });

                setAttendanceMap(initialMap);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setMessage({ type: 'error', text: 'Failed to load attendance for this date.' });
        }
    };

    // ── Effects ────────────────────────────────────────────────

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const studentList = await fetchStudents();
            await fetchAttendanceForDate(date, studentList);
            setLoading(false);
            isMounted.current = true;
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reload attendance when date changes
    useEffect(() => {
        if (!isMounted.current) return;
        setMessage({ type: '', text: '' });
        fetchAttendanceForDate(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    // Auto-dismiss message after 5 seconds
    useEffect(() => {
        if (!message.text) return;
        const timer = setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return () => clearTimeout(timer);
    }, [message.text]);

    // ── Handlers ───────────────────────────────────────────────

    const handleStatusChange = (studentId, clickedStatus) => {
        setAttendanceMap(prev => ({ ...prev, [studentId]: clickedStatus }));
    };

    const handleSave = async () => {
        const records = Object.entries(attendanceMap)
            .filter(([, s]) => s)
            .map(([id, s]) => ({ student: id, status: s }));

        if (records.length === 0) {
            setMessage({ type: 'warning', text: 'Please mark at least one student before saving.' });
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('studentToken');
            await api.post('/attendance', { date, records }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: 'success', text: 'Attendance saved successfully!' });
        } catch (error) {
            console.error('Error saving attendance:', error);
            setMessage({
                type: 'error',
                text: error?.response?.data?.message || 'Failed to save attendance.'
            });
        } finally {
            setSaving(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────

    return (
        <div className="attendance-page">
            {/* Header */}
            <div className="attendance-header">
                <div>
                    <h2>Attendance</h2>
                    <p>Mark and review daily student attendance</p>
                </div>
                <div className="attendance-header-controls">
                    <div className="date-picker-container">
                        <label>Grade</label>
                        <select
                            className="date-input"
                            value={gradeFilter}
                            onChange={e => setGradeFilter(e.target.value)}
                        >
                            <option value="All">All Grades</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                            ))}
                            <option value="Adult / Other">Adult / Other</option>
                        </select>
                    </div>
                    <div className="date-picker-container">
                        <label>Date</label>
                        <input
                            type="date"
                            className="date-input"
                            value={date}
                            min="2000-01-01"
                            max="2100-12-31"
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Table */}
            {loading ? (
                <div className="loading-overlay">Loading students...</div>
            ) : (
                <>
                    <div className="attendance-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>Grade</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-text)' }}>
                                            No students found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, index) => {
                                        const id = student.id || student._id;
                                        const currentStatus = attendanceMap[id];
                                        return (
                                            <tr key={id}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <div className="student-name-cell">
                                                        <strong>{student.name}</strong>
                                                        {(student.christian_name || student.christianName) && (
                                                            <span className="christian-name">
                                                                {student.christian_name || student.christianName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{student.grade || '—'}</td>
                                                <td>
                                                    <div className="status-toggle">
                                                        <button
                                                            className={`status-btn present${currentStatus === 'Present' ? ' active' : ''}`}
                                                            onClick={() => handleStatusChange(id, 'Present')}
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            className={`status-btn absent${currentStatus === 'Absent' ? ' active' : ''}`}
                                                            onClick={() => handleStatusChange(id, 'Absent')}
                                                        >
                                                            Absent
                                                        </button>
                                                        <button
                                                            className={`status-btn permission${currentStatus === 'Permission' ? ' active' : ''}`}
                                                            onClick={() => handleStatusChange(id, 'Permission')}
                                                        >
                                                            Permission
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="attendance-actions">
                        <button className="save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Attendance;
