import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import '../styles/careers.css';

const Careers = () => {
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="careers-page">
            {/* Careers Hero */}
            <section className="careers-hero">
                <div className="careers-hero-content">
                    <h1 className="careers-hero-title">{t('Careers Hero Title')}</h1>
                    <p className="careers-hero-subtitle">{t('Careers Hero Subtitle')}</p>
                </div>
            </section>

            {/* SECTION 1: Working at Romeo Alpha */}
            <section className="career-section working-section">
                <div className="career-container">
                    {/* LEFT: Image */}
                    <div className="career-col-image">
                        <img src="/images/ads-gallery-2.jpg" alt={t('Recruitment Title')} className="career-image" />
                    </div>
                    {/* RIGHT: Text */}
                    <div className="career-col-text">
                        <span className="pre-heading">{t('Careers Label')}</span>
                        <h2 className="main-heading">{t('Working Title')}</h2>
                        <div className="body-text">
                            <p>{t('Working P1')}</p>
                            <p>{t('Working P2')}</p>
                        </div>
                        {/* Button */}
                        <Link to="/contact" className="btn-career-cta">{t('Get In Touch')}</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Careers;
