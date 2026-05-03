import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
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
import { FaGraduationCap, FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';
import '../Styles/GradeReport.css';
import '../Styles/Alert.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Report = () => {
    const { t } = useTranslation();
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
            const response = await api.get('/grades/report', {
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

    if (loading) return <div className="loading-container" style={{ textAlign: 'center', padding: '5rem' }}><h2>{t('admin.results.loading')}</h2></div>;
    if (error) return <div className="alert alert-error" style={{ margin: '2rem' }}>{error}</div>;
    if (!reportData) return <div className="alert alert-info" style={{ margin: '2rem' }}>No data available</div>;

    const { byGrade, summary } = reportData;

    // Chart Data
    const barData = {
        labels: byGrade.map(g => `Grade ${g.grade}`),
        datasets: [
            {
                label: t('admin.report.table.pass'),
                data: byGrade.map(g => g.pass),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: t('admin.report.table.fail'),
                data: byGrade.map(g => g.fail),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
            }
        ],
    };

    const avgScoreData = {
        labels: byGrade.map(g => `Grade ${g.grade}`),
        datasets: [
            {
                label: t('admin.report.table.avgScore'),
                data: byGrade.map(g => g.averageScore),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            }
        ]
    };

    const pieData = {
        labels: [t('admin.report.table.pass'), t('admin.report.table.fail')],
        datasets: [
            {
                data: [summary.totalPass, summary.totalFail],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="report-page" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="report-header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('admin.report.title')}</h1>
                <p className="subtitle" style={{ color: '#666' }}>{t('admin.report.subtitle')}</p>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #4a90e2', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(74, 144, 226, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaGraduationCap size={30} color="#4a90e2" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{t('admin.report.stats.totalGrades')}</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{summary.totalGrades}</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #48c774', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(72, 199, 116, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaCheckCircle size={30} color="#48c774" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{t('admin.report.stats.overallPassRate')}</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{summary.overallPassRate}%</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #ffdd57', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255, 221, 87, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaChartLine size={30} color="#ffdd57" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{t('admin.report.stats.overallAverage')}</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{summary.overallAverage}</h2>
                    </div>
                </div>

                <div className="stat-card" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderLeft: '5px solid #f14668', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(241, 70, 104, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                        <FaTimesCircle size={30} color="#f14668" />
                    </div>
                    <div>
                        <p style={{ margin: 0, color: '#888', fontSize: '0.9rem' }}>{t('admin.report.stats.failCount')}</p>
                        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{summary.totalFail}</h2>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                <div className="chart-container" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('admin.report.charts.performanceByGrade')}</h3>
                    <Bar data={barData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                </div>

                <div className="chart-container" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{t('admin.report.charts.averageScoreByGrade')}</h3>
                    <Bar data={avgScoreData} options={{ responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }} />
                </div>

                <div className="chart-container" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('admin.report.charts.passFailDistribution')}</h3>
                    <div style={{ maxWidth: '300px', width: '100%' }}>
                        <Pie data={pieData} />
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="table-section" style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>{t('admin.report.table.grade')} {t('admin.messages.status')}</h3>
                <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                    <table className="management-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                                <th style={{ padding: '1rem' }}>{t('admin.report.table.grade')}</th>
                                <th style={{ padding: '1rem' }}>{t('admin.report.table.totalGrades')}</th>
                                <th style={{ padding: '1rem' }}>{t('admin.report.table.pass')}</th>
                                <th style={{ padding: '1rem' }}>{t('admin.report.table.fail')}</th>
                                <th style={{ padding: '1rem' }}>{t('admin.report.table.passRate')}</th>
                                <th style={{ padding: '1rem' }}>{t('admin.report.table.avgScore')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byGrade.map((r, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                    <td style={{ padding: '1rem' }}><strong>Grade {r.grade}</strong></td>
                                    <td style={{ padding: '1rem' }}>{r.totalGrades}</td>
                                    <td style={{ padding: '1rem', color: '#48c774', fontWeight: 'bold' }}>{r.pass}</td>
                                    <td style={{ padding: '1rem', color: '#f14668', fontWeight: 'bold' }}>{r.fail}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '100px', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${r.passRate}%`, height: '100%', background: '#48c774' }}></div>
                                            </div>
                                            <span>{r.passRate}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{r.averageScore}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Report;
