import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEdit } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/Attendance.css';

const Attendance = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({});
    const [originalMap, setOriginalMap] = useState({}); // saved state from DB
    const [hasExistingRecords, setHasExistingRecords] = useState(false);
    const [gradeFilter, setGradeFilter] = useState('All');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const isMounted = useRef(false);

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
                const sorted = response.data.data.sort((a, b) => a.name.localeCompare(b.name));
                setStudents(sorted);
                return sorted;
            }
            return [];
        } catch (error) {
            setMessage({ type: 'error', text: t('attendance.studentsError') });
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
                const records = response.data.data || [];
                const existingMap = {};
                records.forEach(record => {
                    existingMap[record.student_id] = record.status;
                });

                const hasRecords = records.length > 0;
                setHasExistingRecords(hasRecords);

                // Pre-fill: existing records first, then default new students to 'Present'
                const initialMap = { ...existingMap };
                (studentList || students).forEach(student => {
                    const id = student.id || student._id;
                    if (!initialMap[id]) {
                        initialMap[id] = 'Present';
                    }
                });

                setAttendanceMap(initialMap);
                setOriginalMap({ ...initialMap }); // snapshot for change detection
            }
        } catch (error) {
            setMessage({ type: 'error', text: t('attendance.loadError') });
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

    useEffect(() => {
        if (!isMounted.current) return;
        setMessage({ type: '', text: '' });
        fetchAttendanceForDate(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

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
            setMessage({ type: 'warning', text: t('attendance.noMarked') });
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem('studentToken');
            await api.post('/attendance', { date, records }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const msg = hasExistingRecords ? t('attendance.updateSuccess') : t('attendance.success');
            setMessage({ type: 'success', text: msg });
            // Refresh snapshot so changed indicators reset
            setOriginalMap({ ...attendanceMap });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error?.response?.data?.message || t('attendance.error')
            });
        } finally {
            setSaving(false);
        }
    };

    // Count how many rows have been changed from the saved state
    const changedCount = filteredStudents.filter(s => {
        const id = s.id || s._id;
        return attendanceMap[id] !== originalMap[id];
    }).length;

    // ── Render ─────────────────────────────────────────────────

    return (
        <div className="attendance-page">
            {/* Header */}
            <div className="attendance-header">
                <div>
                    <h2>{t('attendance.title')}</h2>
                    <p>{t('attendance.subtitle')}</p>
                </div>
                <div className="attendance-header-controls">
                    <div className="date-picker-container">
                        <label>{t('attendance.grade')}</label>
                        <select
                            className="date-input"
                            value={gradeFilter}
                            onChange={e => setGradeFilter(e.target.value)}
                        >
                            <option value="All">{t('attendance.allGrades')}</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i} value={`Grade ${i + 1}`}>Grade {i + 1}</option>
                            ))}
                            <option value="Adult / Other">{t('signup.adult') || 'Adult / Other'}</option>
                        </select>
                    </div>
                    <div className="date-picker-container">
                        <label>{t('attendance.date')}</label>
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

            {/* Edit mode banner */}
            {hasExistingRecords && !loading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1.2rem',
                    borderRadius: '10px',
                    background: 'rgba(77, 163, 255, 0.12)',
                    border: '1px solid #4da3ff',
                    color: '#4da3ff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>
                    <FaEdit />
                    {t('attendance.editMode') || 'Editing existing attendance — change any status and click Save to update.'}
                    {changedCount > 0 && (
                        <span style={{
                            marginLeft: 'auto',
                            background: '#4da3ff',
                            color: 'white',
                            borderRadius: '12px',
                            padding: '0.15rem 0.7rem',
                            fontSize: '0.8rem'
                        }}>
                            {changedCount} {t('attendance.changed') || 'changed'}
                        </span>
                    )}
                </div>
            )}

            {/* Alert */}
            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            {/* Table */}
            {loading ? (
                <div className="loading-overlay">{t('attendance.loading')}</div>
            ) : (
                <>
                    <div className="attendance-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t('gradeReport.studentName')}</th>
                                    <th>{t('signup.grade')}</th>
                                    <th>{t('gradeReport.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-text)' }}>
                                            {t('attendance.noStudents')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student, index) => {
                                        const id = student.id || student._id;
                                        const currentStatus = attendanceMap[id];
                                        const isChanged = currentStatus !== originalMap[id];

                                        return (
                                            <tr key={id} style={isChanged ? {
                                                background: 'rgba(77, 163, 255, 0.06)',
                                                borderLeft: '3px solid #4da3ff'
                                            } : {}}>
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
                                                    <div className="status-toggle" style={{ alignItems: 'center', gap: '0.4rem' }}>
                                                        <button
                                                            className={`status-btn present${currentStatus === 'Present' ? ' active' : ''}`}
                                                            onClick={() => handleStatusChange(id, 'Present')}
                                                        >
                                                            {t('attendance.present')}
                                                        </button>
                                                        <button
                                                            className={`status-btn absent${currentStatus === 'Absent' ? ' active' : ''}`}
                                                            onClick={() => handleStatusChange(id, 'Absent')}
                                                        >
                                                            {t('attendance.absent')}
                                                        </button>
                                                        <button
                                                            className={`status-btn permission${currentStatus === 'Permission' ? ' active' : ''}`}
                                                            onClick={() => handleStatusChange(id, 'Permission')}
                                                        >
                                                            {t('attendance.permission')}
                                                        </button>
                                                        {isChanged && (
                                                            <FaEdit
                                                                size={12}
                                                                color="#4da3ff"
                                                                title="Changed"
                                                                style={{ flexShrink: 0 }}
                                                            />
                                                        )}
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
                            {saving
                                ? t('attendance.saving')
                                : hasExistingRecords
                                    ? t('attendance.update') || 'Update Attendance'
                                    : t('attendance.save')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Attendance;
