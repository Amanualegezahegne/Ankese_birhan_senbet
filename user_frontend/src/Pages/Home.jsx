import { useTranslation } from 'react-i18next';
import '../styles/Home.css';
import churchHero from '../assets/images/church_hero.png';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="home-page">
            <header className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${churchHero})` }}>
                <div className="hero-content">
                    <h1 className="animate-slide-up">{t('home.heroTitle')}</h1>
                    <p className="animate-slide-up">{t('home.heroSubtitle')}</p>
                    <button onClick={() => window.location.href = '/signup'} className="cta-button animate-slide-up">
                        {t('home.getStarted')}
                    </button>
                </div>
            </header>
            <div className="page-container">
                <section className="features-section">
                    <div className="feature-card animate-fade-in">
                        <div className="feature-icon">✨</div>
                        <h3>{t('home.features.spiritual.title')}</h3>
                        <p>{t('home.features.spiritual.desc')}</p>
                    </div>
                    <div className="feature-card animate-fade-in">
                        <div className="feature-icon">📖</div>
                        <h3>{t('home.features.education.title')}</h3>
                        <p>{t('home.features.education.desc')}</p>
                    </div>
                    <div className="feature-card animate-fade-in">
                        <div className="feature-icon">🕊️</div>
                        <h3>{t('home.features.community.title')}</h3>
                        <p>{t('home.features.community.desc')}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
