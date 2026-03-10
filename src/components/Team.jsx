import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import '../styles/team.css';

const Team = () => {
    const { t } = useTranslation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="team-page">
            {/* Team Hero */}
            <section className="team-hero">
                <div className="team-hero-content">
                    <h1 className="team-hero-title">{t('Team Hero Title')}</h1>
                    <p className="team-hero-subtitle">{t('Team Hero Subtitle')}</p>
                </div>
            </section>

            {/* Team Intro */}
            <section className="team-intro">
                <div className="intro-container">
                    <p className="section-desc centered-desc">
                        {t('Team Intro')}
                    </p>
                </div>
            </section>

            {/* Founder Section (Full Width Featured) */}
            <section className="founder-section">
                <div className="founder-container">
                    <div className="founder-image-col">
                        <div className="founder-img-wrapper">
                            <img src="/images/captain-smart-alli.png" alt={t('CEO Name')} className="team-img-main" />
                        </div>
                    </div>
                    <div className="founder-text-col">
                        <span className="member-label">{t('Founder Label')}</span>
                        <h2 className="member-name">{t('CEO Name')}</h2>
                        <h3 className="member-role" style={{ fontSize: '18px', color: '#6B82AC', marginBottom: '16px', fontWeight: '600' }}>{t('CEO Title')}</h3>
                        <p className="member-quote">{t('CEO Quote')}</p>
                        <div className="member-bio">
                            <p>{t('CEO Bio 1')}</p>
                            <p>{t('CEO Bio 2')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Operational Gallery */}
            <section className="leadership-gallery-section">
                <div className="gallery-header">
                    <h2>{t('Operational Leadership in Action')}</h2>
                    <div className="header-line"></div>
                </div>
                <div className="gallery-grid">
                    <div className="gallery-item">
                        <div className="gallery-img-wrapper">
                            <img src="/images/captain-bridge.png" alt="Operational Command" />
                        </div>
                        <div className="gallery-overlay">
                            <span>{t('Operational Command')}</span>
                        </div>
                    </div>
                    <div className="gallery-item">
                        <div className="gallery-img-wrapper">
                            <img src="/images/captain-office-1.png" alt="Strategic Planning" />
                        </div>
                        <div className="gallery-overlay">
                            <span>{t('Strategic Planning')}</span>
                        </div>
                    </div>
                    <div className="gallery-item">
                        <div className="gallery-img-wrapper">
                            <img src="/images/captain-office-2.png" alt="Technical Oversight" />
                        </div>
                        <div className="gallery-overlay">
                            <span>{t('Technical Oversight')}</span>
                        </div>
                    </div>
                    <div className="gallery-item gallery-item-traditional">
                        <div className="gallery-img-wrapper">
                            <img src="/images/captain-traditional.png" alt="Cultural Identity" />
                        </div>
                        <div className="gallery-overlay">
                            <span>{t('Leadership & Heritage')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="join-team-cta">
                <h2 className="cta-title">{t('Join Team Title')}</h2>
                <p className="cta-subtitle">{t('Join Team Subtitle')}</p>
                <Link to="/careers" className="btn-join-team">{t('See Openings')}</Link>
            </section>
        </div>
    );
};

export default Team;
