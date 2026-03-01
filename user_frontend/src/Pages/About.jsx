import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPrayingHands, FaBookOpen, FaUsers, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../Styles/About.css';
import journeyImg from '../assets/images/journey.jpg';

// Event Images
import event1 from '../assets/images/events/building-school/event1.jpg';
import event2 from '../assets/images/events/building-school/event2.jpg';
import event3 from '../assets/images/events/building-school/event3.jpg';
import event4 from '../assets/images/events/building-school/event4.jpg';
import event5 from '../assets/images/events/building-school/event5.jpg';

import urael1 from '../assets/images/events/saint-urael/urael1.jpg';
import urael2 from '../assets/images/events/saint-urael/urael2.jpg';
import urael3 from '../assets/images/events/saint-urael/urael3.jpg';

const About = () => {
    const { t } = useTranslation();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [uraelImageIndex, setUraelImageIndex] = useState(0);

    const eventImages = [event1, event2, event3, event4, event5];
    const uraelImages = [urael1, urael2, urael3];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % eventImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);
    };

    const nextUrael = () => {
        setUraelImageIndex((prev) => (prev + 1) % uraelImages.length);
    };

    const prevUrael = () => {
        setUraelImageIndex((prev) => (prev - 1 + uraelImages.length) % uraelImages.length);
    };

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
                            src={journeyImg}
                            alt="Church Story"
                            className="about-img"
                        />
                    </div>
                    <div className="section-text animate-slide-right">
                        <h2>{t('about.journeyTitle')}</h2>
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

                <section className="events-board-section">
                    <h2 className="section-title">{t('about.events.sectionTitle')}</h2>
                    <div className="events-grid-board">
                        <div className="event-board-card animate-fade-in">
                            <div className="event-card-inner">
                                <div className="event-image-container">
                                    <div className="events-gallery">
                                        <img
                                            src={eventImages[currentImageIndex]}
                                            alt={t('about.events.items.building.title')}
                                            className="board-card-img"
                                        />
                                        <div className="gallery-mini-controls">
                                            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="mini-btn"><FaArrowLeft /></button>
                                            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="mini-btn"><FaArrowRight /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="event-overlay">
                                    <div className="overlay-content">
                                        <h3>{t('about.events.items.building.title')}</h3>
                                        <p>{t('about.events.items.building.desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="event-board-card animate-fade-in">
                            <div className="event-card-inner">
                                <div className="event-image-container">
                                    <div className="events-gallery">
                                        <img
                                            src={uraelImages[uraelImageIndex]}
                                            alt={t('about.events.items.urael.title')}
                                            className="board-card-img"
                                        />
                                        <div className="gallery-mini-controls">
                                            <button onClick={(e) => { e.stopPropagation(); prevUrael(); }} className="mini-btn"><FaArrowLeft /></button>
                                            <button onClick={(e) => { e.stopPropagation(); nextUrael(); }} className="mini-btn"><FaArrowRight /></button>
                                        </div>
                                    </div>
                                </div>
                                <div className="event-overlay">
                                    <div className="overlay-content">
                                        <h3>{t('about.events.items.urael.title')}</h3>
                                        <p>{t('about.events.items.urael.desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="values-grid">
                    <div className="value-card">
                        <FaPrayingHands className="value-icon" />
                        <h3>{t('about.values.spirituality.title')}</h3>
                        <p>{t('about.values.spirituality.desc')}</p>
                    </div>
                    <div className="value-card highlight">
                        <FaBookOpen className="value-icon" />
                        <h3>{t('about.values.education.title')}</h3>
                        <p>{t('about.values.education.desc')}</p>
                    </div>
                    <div className="value-card">
                        <FaUsers className="value-icon" />
                        <h3>{t('about.values.community.title')}</h3>
                        <p>{t('about.values.community.desc')}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
