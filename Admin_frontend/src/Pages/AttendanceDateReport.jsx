import { useState } from 'react';
import { FaCalendarAlt, FaSearch, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import api from '../api/axios';
import '../Styles/Attendance.css';

const statusIcon = {
    Present: <FaCheckCircle color="#28a745" />,
    Absent: <FaTimesCircle color="#dc3545" />,
    Permission: <FaClock color="#4da3ff" />,
};

const statusColor = {
    Present: '#28a745',
    Absent: '#dc3545',
    Permission: '#4da3ff',
};

const GRADES = [
    'All Grades',
    ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
    'Adult / Other',
];

const AttendanceDateReport = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [gradeFilter, setGradeFilter] = useState('All Grades');
    const [records, setRecords] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const fetchAttendance = async () => {
        setLoading(true);
        setError('');
        setStatusFilter('All');
        try {
            const token = sessionStorage.getItem('adminToken');
            const res = await api.get(`/attendance/date/${date}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRecords(res.data.data || []);
                setSearched(true);
            }
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || 'Failed to load attendance for this date.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') fetchAttendance();
    };

    // Apply both grade and status filters
    const gradeFiltered = gradeFilter === 'All Grades'
        ? records
        : records.filter(r => (r.student?.grade || '') === gradeFilter);

    const filtered = statusFilter === 'All'
        ? gradeFiltered
        : gradeFiltered.filter(r => r.status === statusFilter);

    // Summary counts respect the grade filter but show all statuses
    const counts = gradeFiltered.reduce(
        (acc, r) => {
            if (r.status === 'Present') acc.present++;
            else if (r.status === 'Absent') acc.absent++;
            else if (r.status === 'Permission') acc.permission++;
            return acc;
        },
        { present: 0, absent: 0, permission: 0 }
    );

    return (
        <div className="attendance-page">
            {/* Header */}
            <div className="attendance-header">
                <div>
                    <h2>Attendance by Date</h2>
                    <p>Select a date and grade to see attendance records</p>
                </div>
            </div>

            {/* Filters + search bar */}
            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--nav-border)',
                borderRadius: '15px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                boxShadow: '0 4px 6px var(--shadow-color)'
            }}>
                {/* Date picker */}
                <div className="date-picker-container">
                    <label><FaCalendarAlt style={{ marginRight: '0.4rem' }} />Date</label>
                    <input
                        type="date"
                        className="date-input"
                        value={date}
                        min="2000-01-01"
                        max="2100-12-31"
                        onChange={e => setDate(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                {/* Grade filter */}
                <div className="date-picker-container">
                    <label>Grade</label>
                    <select
                        className="date-input"
                        value={gradeFilter}
                        onChange={e => setGradeFilter(e.target.value)}
                    >
                        {GRADES.map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                {/* Search button */}
                <button
                    onClick={fetchAttendance}
                    disabled={loading}
                    style={{
                        padding: '0.8rem 1.8rem',
                        backgroundColor: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 4px var(--shadow-color)',
                        height: '50px',
                    }}
                >
                    <FaSearch />
                    {loading ? 'Loading...' : 'View Attendance'}
                </button>
            </div>

            {/* Error */}
            {error && <div className="alert alert-error">{error}</div>}

            {/* Results */}
            {searched && !loading && (
                <>
                    {/* Summary cards — counts respect grade filter */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        {[
                            { label: 'Present',    count: counts.present,    color: '#28a745',              icon: <FaCheckCircle size={24} /> },
                            { label: 'Absent',     count: counts.absent,     color: '#dc3545',              icon: <FaTimesCircle size={24} /> },
                            { label: 'Permission', count: counts.permission,  color: '#4da3ff',              icon: <FaClock size={24} /> },
                            { label: 'Total',      count: gradeFiltered.length, color: 'var(--primary-color)', icon: <FaCalendarAlt size={24} /> },
                        ].map(card => (
                            <div key={card.label} style={{
                                background: 'var(--card-bg)',
                                borderRadius: '12px',
                                padding: '1.2rem 1.5rem',
                                borderLeft: `5px solid ${card.color}`,
                                boxShadow: '0 4px 6px var(--shadow-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{ color: card.color }}>{card.icon}</div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-text)' }}>{card.label}</p>
                                    <h3 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-color)' }}>{card.count}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Status filter tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {['All', 'Present', 'Absent', 'Permission'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                style={{
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '20px',
                                    border: `2px solid ${statusFilter === tab ? (statusColor[tab] || 'var(--primary-color)') : 'var(--nav-border)'}`,
                                    background: statusFilter === tab ? (statusColor[tab] || 'var(--primary-color)') : 'transparent',
                                    color: statusFilter === tab ? 'white' : 'var(--muted-text)',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {tab}{tab !== 'All' && ` (${counts[tab.toLowerCase()] ?? 0})`}
                            </button>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="attendance-table-container">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Name</th>
                                    <th>Christian Name</th>
                                    <th>Grade</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--muted-text)' }}>
                                            No records found for the selected filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((record, index) => {
                                        const student = record.student || {};
                                        return (
                                            <tr key={record.id || index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <strong>{student.name || '—'}</strong>
                                                </td>
                                                <td style={{ color: 'var(--secondary-color)', fontStyle: 'italic' }}>
                                                    {student.christian_name || student.christianName || '—'}
                                                </td>
                                                <td>{student.grade || '—'}</td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.4rem',
                                                        padding: '0.35rem 0.9rem',
                                                        borderRadius: '20px',
                                                        fontWeight: '700',
                                                        fontSize: '0.85rem',
                                                        background: `${statusColor[record.status]}22`,
                                                        color: statusColor[record.status] || 'var(--text-color)',
                                                        border: `1px solid ${statusColor[record.status] || 'var(--nav-border)'}`,
                                                    }}>
                                                        {statusIcon[record.status]}
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Empty state before first search */}
            {!searched && !loading && !error && (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    color: 'var(--muted-text)',
                    background: 'var(--card-bg)',
                    borderRadius: '15px',
                    border: '1px solid var(--nav-border)'
                }}>
                    <FaCalendarAlt size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                    <p style={{ fontSize: '1.1rem' }}>Select a date and grade, then click "View Attendance".</p>
                </div>
            )}
        </div>
    );
};

export default AttendanceDateReport;
