import { useTranslation } from 'react-i18next';
import '../styles/About.css';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="page-container about-page">
            <div className="about-content">
                <h2>{t('about.title')}</h2>
                <p>
                    {t('about.description')}
                </p>
                <h3>{t('about.missionTitle')}</h3>
                <p>
                    {t('about.missionDesc')}
                </p>
                <h3>{t('about.visionTitle')}</h3>
                <p>
                    {t('about.visionDesc')}
                </p>
            </div>
        </div>
    );
};

export default About;
