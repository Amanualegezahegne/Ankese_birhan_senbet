import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import '../Styles/Attendance.css';

const Attendance = () => {
    const { t } = useTranslation();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState('student');
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchStudentsAndAttendance();
    }, [date, activeTab]);

    const fetchStudentsAndAttendance = async () => {
        try {
            setLoading(true);
            const adminToken = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${adminToken}` } };

            // Fetch approved members based on active tab
            const response = await axios.get(`http://localhost:5000/api/students?role=${activeTab}`, config);
            const approvedStudents = response.data.data.filter(s => s.status === 'Approved');
            setStudents(approvedStudents);

            // Fetch attendance for the specific date
            const attendanceRes = await axios.get(`http://localhost:5000/api/attendance/date/${date}`, config);

            const existingData = {};
            attendanceRes.data.data.forEach(record => {
                existingData[record.student._id] = record.status;
            });

            // Initialize missing students as 'Present' by default
            const initialData = { ...existingData };
            approvedStudents.forEach(student => {
                if (!initialData[student._id]) {
                    initialData[student._id] = 'Present';
                }
            });

            setAttendanceData(initialData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const saveAttendance = async () => {
        try {
            setSaving(true);
            const adminToken = localStorage.getItem('adminToken');
            const config = { headers: { Authorization: `Bearer ${adminToken}` } };

            const records = Object.keys(attendanceData).map(studentId => ({
                student: studentId,
                status: attendanceData[studentId]
            }));

            await axios.post('http://localhost:5000/api/attendance', {
                date,
                records
            }, config);

            setMessage({ type: 'success', text: t('admin.attendance.success') });
            setSaving(false);

            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            setMessage({ type: 'error', text: t('admin.attendance.error') });
            setSaving(false);
        }
    };

    return (
        <div className="attendance-page">
            <div className="attendance-header">
                <div>
                    <h2>{t('admin.attendance.title')}</h2>
                    <p>{t('admin.attendance.subtitle')}</p>
                </div>
                <div className="date-picker-container">
                    <label>{t('admin.attendance.date')}</label>
                    <input
                        type="date"
                        className="date-input"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="attendance-tabs" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <button
                    className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                    onClick={() => setActiveTab('student')}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'student' ? '#007bff' : '#f0f0f0',
                        color: activeTab === 'student' ? 'white' : '#333',
                        fontWeight: 'bold'
                    }}
                >
                    {t('admin.navbar.users') || 'Students'}
                </button>
                <button
                    className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
                    onClick={() => setActiveTab('teacher')}
                    style={{
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'teacher' ? '#007bff' : '#f0f0f0',
                        color: activeTab === 'teacher' ? 'white' : '#333',
                        fontWeight: 'bold'
                    }}
                >
                    {t('admin.teachermanagement.title') || 'Teachers'}
                </button>
            </div>

            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="loading-overlay">Loading students...</div>
            ) : (
                <>
                    <div className="attendance-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.attendance.studentName')}</th>
                                    <th>{t('admin.attendance.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td className="student-name-cell">
                                            <strong>{student.name}</strong>
                                            <span className="christian-name">{student.christianName}</span>
                                        </td>
                                        <td>
                                            <div className="status-toggle">
                                                <button
                                                    className={`status-btn present ${attendanceData[student._id] === 'Present' ? 'active' : ''}`}
                                                    onClick={() => handleStatusChange(student._id, 'Present')}
                                                >
                                                    {t('admin.attendance.present')}
                                                </button>
                                                <button
                                                    className={`status-btn absent ${attendanceData[student._id] === 'Absent' ? 'active' : ''}`}
                                                    onClick={() => handleStatusChange(student._id, 'Absent')}
                                                >
                                                    {t('admin.attendance.absent')}
                                                </button>
                                                <button
                                                    className={`status-btn permission ${attendanceData[student._id] === 'Permission' ? 'active' : ''}`}
                                                    onClick={() => handleStatusChange(student._id, 'Permission')}
                                                >
                                                    {t('admin.attendance.permission')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="attendance-actions">
                        <button
                            className="save-btn"
                            onClick={saveAttendance}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : t('admin.attendance.save')}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Attendance;
