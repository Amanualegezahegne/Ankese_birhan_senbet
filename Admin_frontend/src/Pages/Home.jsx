import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../Styles/Home.css';
import { FaUsers, FaChalkboardTeacher, FaBookOpen, FaEnvelope, FaClipboardCheck } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ffd700', '#10b981', '#ef4444'];

const Home = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0,
        messages: 0,
        pendingStudents: 0
    });
    const [chartData, setChartData] = useState([]);
    const [roleData, setRoleData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = sessionStorage.getItem('adminToken');
                const headers = { Authorization: `Bearer ${token}` };
                
                const [studentsRes, teachersRes, coursesRes, messagesRes, pendingRes] = await Promise.all([
                    api.get('/students?role=student', { headers }),
                    api.get('/students?role=teacher', { headers }),
                    api.get('/courses', { headers }),
                    api.get('/messages/unread-count', { headers }),
                    api.get('/students/pending/counts', { headers })
                ]);

                const stdCount = studentsRes.data.success ? (studentsRes.data.count || studentsRes.data.data?.length || 0) : 0;
                const tchCount = teachersRes.data.success ? (teachersRes.data.count || teachersRes.data.data?.length || 0) : 0;

                setStats({
                    students: stdCount,
                    teachers: tchCount,
                    classes: coursesRes.data.success ? (coursesRes.data.count || coursesRes.data.data?.length || 0) : 0,
                    messages: messagesRes.data.success ? (messagesRes.data.count || 0) : 0,
                    pendingStudents: pendingRes.data.success ? (pendingRes.data.counts?.students || 0) : 0
                });

                // Process bar chart data
                let gData = [];
                if (studentsRes.data.success && Array.isArray(studentsRes.data.data)) {
                    const grades = {};
                    studentsRes.data.data.forEach(s => {
                        const g = s.grade || 'Unassigned';
                        grades[g] = (grades[g] || 0) + 1;
                    });
                    gData = Object.keys(grades).map(key => ({ name: key, students: grades[key] }));
                }
                
                if (gData.length === 0) {
                    gData = [
                        { name: 'Grade 1', students: 45 },
                        { name: 'Grade 2', students: 30 },
                        { name: 'Grade 3', students: 50 },
                        { name: 'Grade 4', students: 35 },
                        { name: 'Grade 5', students: 20 },
                    ];
                }
                setChartData(gData);

                // Process pie chart data
                setRoleData([
                    { name: 'Students', value: stdCount || 325 },
                    { name: 'Teachers', value: tchCount || 10 }
                ]);

            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const adminName = sessionStorage.getItem('adminUser') ? JSON.parse(sessionStorage.getItem('adminUser')).name : 'Admin';

    return (
        <div className="dashboard-page fade-in">
            <div className="dashboard-header">
                <div>
                    <h1>{t('admin.home.welcome')}, <span className="highlight-text">{adminName}</span></h1>
                    <p className="subtitle">{t('admin.home.welcomeDesc')}</p>
                </div>
                <div className="date-display">
                    {new Date().toLocaleDateString(t('en-US'), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {loading ? (
                <div className="loading-indicator">{t('admin.home.loading')}</div>
            ) : (
                <div className="dashboard-grid">
                    {/* Stat Card: Students */}
                    <div className="premium-dashboard-card">
                        <div className="card-icon-wrapper students-icon">
                            <FaUsers />
                        </div>
                        <div className="card-content">
                            <h3>{t('admin.home.stats.students')}</h3>
                            <p className="stat-number">{stats.students}</p>
                            <span className="stat-trend positive">{t('admin.home.trends.enrollment')}</span>
                        </div>
                    </div>

                    {/* Stat Card: Teachers */}
                    <div className="premium-dashboard-card">
                        <div className="card-icon-wrapper teachers-icon">
                            <FaChalkboardTeacher />
                        </div>
                        <div className="card-content">
                            <h3>{t('admin.home.stats.teachers')}</h3>
                            <p className="stat-number">{stats.teachers}</p>
                            <span className="stat-trend">{t('admin.home.trends.staff')}</span>
                        </div>
                    </div>

                    {/* Stat Card: Courses */}
                    <div className="premium-dashboard-card">
                        <div className="card-icon-wrapper courses-icon">
                            <FaBookOpen />
                        </div>
                        <div className="card-content">
                            <h3>{t('admin.home.stats.classes')}</h3>
                            <p className="stat-number">{stats.classes}</p>
                            <span className="stat-trend">{t('admin.home.trends.curriculum')}</span>
                        </div>
                    </div>

                    {/* Stat Card: Pending Actions */}
                    <div className="premium-dashboard-card alert-card">
                        <div className="card-icon-wrapper pending-icon">
                            <FaClipboardCheck />
                        </div>
                        <div className="card-content">
                            <h3>{t('admin.home.stats.pending')}</h3>
                            <p className="stat-number">{stats.pendingStudents}</p>
                            <span className="stat-trend warning">{t('admin.home.trends.action')}</span>
                        </div>
                    </div>

                    {/* Stat Card: Messages */}
                    <div className="premium-dashboard-card">
                        <div className="card-icon-wrapper messages-icon">
                            <FaEnvelope />
                        </div>
                        <div className="card-content">
                            <h3>{t('admin.home.stats.messages')}</h3>
                            <p className="stat-number">{stats.messages}</p>
                            <span className="stat-trend">{t('admin.home.trends.contact')}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {!loading && (
                <div className="charts-container">
                    <div className="premium-chart-card">
                        <h3>{t('admin.home.charts.studentDistribution')}</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#ffd700' }}
                                    />
                                    <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-chart-card">
                        <h3>{t('admin.home.charts.userRoles')}</h3>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
