import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import '../styles/about.css';

const About = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page">
            {/* About Hero Section */}
            <section className="about-hero">
                <div className="about-hero-content">
                    <h1 className="about-hero-title">{t('About Hero Title')}</h1>
                    <p className="about-hero-subtitle">{t('About Hero Subtitle')}</p>
                </div>
            </section>

            {/* Company Overview */}
            <section className="overview-section">
                <div className="overview-content">
                    <div className="overview-text">
                        <h2 className="section-title">{t('Who We Are Title')}</h2>
                        <p className="section-desc">{t('Who We Are Desc')}</p>
                        <p className="section-desc">{t('Who We Are Desc 2')}</p>
                        <div style={{ marginTop: '24px' }}>
                            <Link to="/contact">
                                <button className="btn-get-quotes">{t('Get in touch')}</button>
                            </Link>
                        </div>
                    </div>
                    <div className="overview-image">
                        <img src="/images/about-officer.png" alt={t('Who We Are Title')} className="who-we-are-img" />
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="mission-vision-section">
                <div className="mv-container">
                    <div className="mv-card">
                        <h2>{t('Mission Title')}</h2>
                        <p>{t('Mission Text')}</p>
                    </div>
                    <div className="mv-card">
                        <h2>{t('Vision Title')}</h2>
                        <p>{t('Vision Text')}</p>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default About;
