import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { FaUsers, FaChalkboardTeacher, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import '../Styles/GradeReport.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AttendanceReport = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem('adminToken');
            const response = await api.get('/attendance/report', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            setError(err.response?.data?.message || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container" style={{ textAlign: 'center', padding: '5rem' }}><h2>Loading Report...</h2></div>;
    if (error) return <div className="alert alert-error" style={{ margin: '2rem' }}>{error}</div>;
    if (!reportData) return <div className="alert alert-info" style={{ margin: '2rem' }}>No data available</div>;

    const { student, teacher, overall } = reportData;

    // Bar Chart Data (Student vs Teacher)
    const barData = {
        labels: ['Students', 'Teachers'],
        datasets: [
            {
                label: 'Present',
                data: [student.present, teacher.present],
                backgroundColor: 'rgba(72, 199, 116, 0.7)',
            },
            {
                label: 'Absent',
                data: [student.absent, teacher.absent],
                backgroundColor: 'rgba(241, 70, 104, 0.7)',
            },
            {
                label: 'Permission',
                data: [student.permission, teacher.permission],
                backgroundColor: 'rgba(255, 221, 87, 0.7)',
            }
        ],
    };

    // Pie Chart Data (Overall)
    const pieData = {
        labels: ['Present', 'Absent', 'Permission'],
        datasets: [
            {
                data: [overall.present, overall.absent, overall.permission],
                backgroundColor: [
                    'rgba(72, 199, 116, 0.7)',
                    'rgba(241, 70, 104, 0.7)',
                    'rgba(255, 221, 87, 0.7)',
                ],
                borderColor: [
                    'rgba(72, 199, 116, 1)',
                    'rgba(241, 70, 104, 1)',
                    'rgba(255, 221, 87, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="report-page" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="report-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                    onClick={() => navigate('/attendance')} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    <FaArrowLeft />
                </button>
                <div>
                    <h1 style={{ fontSize: '2.5rem', margin: '0' }}>Attendance Report & Analysis</h1>
                    <p className="subtitle" style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Comprehensive overview of student and teacher attendance records.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #4a90e2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(74, 144, 226, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaUsers size={30} color="#4a90e2" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Total Records</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{overall.total}</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #48c774', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(72, 199, 116, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaCheckCircle size={30} color="#48c774" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Overall Present</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{overall.present}</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #f14668', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(241, 70, 104, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaTimesCircle size={30} color="#f14668" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Overall Absent</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{overall.absent}</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #ffdd57', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 221, 87, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaChalkboardTeacher size={30} color="#ffdd57" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>Teacher Present</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{teacher.present}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="chart-container" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Attendance Comparison</h3>
                    <Bar data={barData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                </div>

                <div className="chart-container" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Overall Distribution</h3>
                    <div style={{ maxWidth: '300px', width: '100%' }}>
                        <Pie data={pieData} />
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="table-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Attendance Summary</h3>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="management-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                                <th style={{ padding: '1rem' }}>Group</th>
                                <th style={{ padding: '1rem' }}>Total Records</th>
                                <th style={{ padding: '1rem' }}>Present</th>
                                <th style={{ padding: '1rem' }}>Absent</th>
                                <th style={{ padding: '1rem' }}>Permission</th>
                                <th style={{ padding: '1rem' }}>Present Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'Students', data: student },
                                { name: 'Teachers', data: teacher },
                                { name: 'Overall', data: overall },
                            ].map((row, index) => {
                                const rate = row.data.total > 0 ? Math.round((row.data.present / row.data.total) * 100) : 0;
                                return (
                                    <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                        <td style={{ padding: '1rem' }}><strong>{row.name}</strong></td>
                                        <td style={{ padding: '1rem' }}>{row.data.total}</td>
                                        <td style={{ padding: '1rem', color: '#48c774', fontWeight: 'bold' }}>{row.data.present}</td>
                                        <td style={{ padding: '1rem', color: '#f14668', fontWeight: 'bold' }}>{row.data.absent}</td>
                                        <td style={{ padding: '1rem', color: '#ffdd57', fontWeight: 'bold' }}>{row.data.permission}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '100px', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${rate}%`, height: '100%', background: '#48c774' }}></div>
                                                </div>
                                                <span>{rate}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
