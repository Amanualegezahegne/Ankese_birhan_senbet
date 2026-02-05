import { useTranslation } from 'react-i18next';
import '../Styles/Home.css';
import churchImage from '../assets/images/church_admin.png';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="admin-home">
            <div className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${churchImage})` }}>
                <div className="hero-content">
                    <h1>{t('admin.home.title')}</h1>
                    <p>{t('admin.home.subtitle')}</p>
                </div>
            </div>
            <div className="stats-container">
                <div className="dashboard-cards">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <h3>{t('admin.home.stats.students')}</h3>
                        <p className="stat-number">0</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👨‍🏫</div>
                        <h3>{t('admin.home.stats.teachers')}</h3>
                        <p className="stat-number">0</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📚</div>
                        <h3>{t('admin.home.stats.classes')}</h3>
                        <p className="stat-number">0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
