import { useState, useEffect } from 'react';
import { FaChartBar, FaTimes, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/AttendanceReportModal.css';

const AttendanceReportModal = ({ isOpen, onClose }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchReport();
        }
    }, [isOpen]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const adminToken = sessionStorage.getItem('adminToken');
            const response = await api.get('/attendance/report', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            if (response.data.success) {
                setReport(response.data.data);
            } else {
                setError('Failed to load report data');
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            setError('Error loading report');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderProgressBar = (value, total, colorClass) => {
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
        return (
            <div className="progress-container">
                <div className="progress-info">
                    <span className="progress-value">{value}</span>
                    <span className="progress-percentage">{percentage}%</span>
                </div>
                <div className="progress-bar-bg">
                    <div className={`progress-bar-fill ${colorClass}`} style={{ width: `${percentage}%` }}></div>
                </div>
            </div>
        );
    };

    const renderStatsCard = (title, icon, data) => (
        <div className="report-card">
            <h3 className="card-title">{icon} {title}</h3>
            <div className="stats-list">
                <div className="stat-item">
                    <span className="stat-label">Present</span>
                    {renderProgressBar(data.present, data.total, 'present-fill')}
                </div>
                <div className="stat-item">
                    <span className="stat-label">Absent</span>
                    {renderProgressBar(data.absent, data.total, 'absent-fill')}
                </div>
                <div className="stat-item">
                    <span className="stat-label">Permission</span>
                    {renderProgressBar(data.permission, data.total, 'permission-fill')}
                </div>
                <div className="stat-total">
                    <span>Total Records: {data.total}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FaChartBar /> Attendance Report & Analysis</h2>
                    <button className="close-btn" onClick={onClose}><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {loading ? (
                        <div className="report-loading">Generating Report...</div>
                    ) : error ? (
                        <div className="report-error">{error}</div>
                    ) : report ? (
                        <div className="report-grid">
                            {renderStatsCard('Overall Attendance', <FaChartBar />, report.overall)}
                            {renderStatsCard('Student Attendance', <FaUsers />, report.student)}
                            {renderStatsCard('Teacher Attendance', <FaChalkboardTeacher />, report.teacher)}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AttendanceReportModal;
