import { useTranslation } from 'react-i18next';
import '../Styles/Home.css'; // Reuse some basic layout styles

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="admin-page-container">
            <div className="admin-card">
                <h2>{t('admin.navbar.about')}</h2>
                <div className="admin-card-content">
                    <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                        This is the administrative dashboard for Ankese Birhan Senbet Sunday School.
                        As an administrator, you can manage news, messages, students, teachers, courses, and system settings.
                    </p>
                    <div className="admin-info-box" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                        <h4>Help & Support</h4>
                        <p>For technical support or issues regarding the system, please contact the IT department.</p>
                        <p>📧 support@ankesebirhan.org</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
