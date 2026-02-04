import { useTranslation } from 'react-i18next';
import '../styles/Home.css';

const Home = () => {
    const { t } = useTranslation();

    return (
        <div className="page-container home-page">
            <header className="hero-section">
                <h1>{t('home.heroTitle')}</h1>
                <p>{t('home.heroSubtitle')}</p>
                <button onClick={() => window.location.href = '/signup'} className="cta-button">{t('home.getStarted')}</button>
            </header>
            <section className="features-section">
                <div className="feature-card">
                    <h3>{t('home.features.fastSecure.title')}</h3>
                    <p>{t('home.features.fastSecure.desc')}</p>
                </div>
                <div className="feature-card">
                    <h3>{t('home.features.userFriendly.title')}</h3>
                    <p>{t('home.features.userFriendly.desc')}</p>
                </div>
                <div className="feature-card">
                    <h3>{t('home.features.support.title')}</h3>
                    <p>{t('home.features.support.desc')}</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
