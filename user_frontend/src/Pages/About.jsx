import { useTranslation } from 'react-i18next';
import '../Styles/About.css';

const About = () => {
    const { t } = useTranslation();

    return (
        <div className="about-page">
            <header className="about-hero">
                <div className="hero-overlay"></div>
                <div className="about-hero-content">
                    <h1 className="animate-fade-in">{t('about.title')}</h1>
                    <div className="accent-line"></div>
                </div>
            </header>

            <div className="about-container">
                <section className="about-section story-section">
                    <div className="section-image animate-pop-in">
                        <img
                            src="https://images.unsplash.com/photo-1548625316-538421375d31?auto=format&fit=crop&q=80&w=800"
                            alt="Church Story"
                            className="about-img"
                        />
                    </div>
                    <div className="section-text animate-slide-right">
                        <h2>Our Journey</h2>
                        <p>{t('about.description')}</p>
                    </div>
                </section>

                <section className="about-section mission-section reverse">
                    <div className="section-image animate-pop-in">
                        <img
                            src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800"
                            alt="Our Mission"
                            className="about-img"
                        />
                    </div>
                    <div className="section-text animate-slide-left">
                        <h2>{t('about.missionTitle')}</h2>
                        <p>{t('about.missionDesc')}</p>
                    </div>
                </section>

                <section className="about-section vision-section">
                    <div className="section-image animate-pop-in">
                        <img
                            src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800"
                            alt="Our Vision"
                            className="about-img"
                        />
                    </div>
                    <div className="section-text animate-slide-right">
                        <h2>{t('about.visionTitle')}</h2>
                        <p>{t('about.visionDesc')}</p>
                    </div>
                </section>

                <section className="values-grid">
                    <div className="value-card">
                        <h3>Spirituality</h3>
                        <p>Deeply rooted in the holy traditions and dogmas of the EOTC.</p>
                    </div>
                    <div className="value-card highlight">
                        <h3>Education</h3>
                        <p>Preserving knowledge and wisdom for the next generation.</p>
                    </div>
                    <div className="value-card">
                        <h3>Community</h3>
                        <p>A vibrant family united in love and service to God.</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
