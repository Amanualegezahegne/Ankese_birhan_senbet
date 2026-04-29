import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import '../Styles/Home.css';
import churchImage from '../assets/images/church_admin.png';

const Home = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classes: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = sessionStorage.getItem('adminToken');
                const headers = { Authorization: `Bearer ${token}` };
                
                // We can fetch students, teachers, and courses
                const [studentsRes, teachersRes, coursesRes] = await Promise.all([
                    api.get('/students?role=student', { headers }),
                    api.get('/students?role=teacher', { headers }),
                    api.get('/courses', { headers })
                ]);

                setStats({
                    students: studentsRes.data.success ? (studentsRes.data.count || studentsRes.data.data?.length || 0) : 0,
                    teachers: teachersRes.data.success ? (teachersRes.data.count || teachersRes.data.data?.length || 0) : 0,
                    classes: coursesRes.data.success ? (coursesRes.data.count || coursesRes.data.data?.length || 0) : 0
                });
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="admin-home">
            <div className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${churchImage})` }}>
                <div className="hero-content">
                    <p>{t('admin.home.subtitle')}</p>
                </div>
            </div>
            <div className="stats-container">
                <div className="dashboard-cards">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <h3>{t('admin.home.stats.students')}</h3>
                        <p className="stat-number">{stats.students}</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👨‍🏫</div>
                        <h3>{t('admin.home.stats.teachers')}</h3>
                        <p className="stat-number">{stats.teachers}</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <h3>{t('admin.home.stats.classes')}</h3>
                        <p className="stat-number">{stats.classes}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
