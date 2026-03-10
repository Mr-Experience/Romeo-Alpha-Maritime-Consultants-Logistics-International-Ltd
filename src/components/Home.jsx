import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { fetchFaqs } from '../services/faq';
import { fetchAds } from '../services/ads';

const Home = () => {
    const { t } = useTranslation();
    const [faqItems, setFaqItems] = useState([]);
    const [ads, setAds] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            const [faqs, adsData] = await Promise.all([
                fetchFaqs(),
                fetchAds()
            ]);
            setFaqItems(faqs);
            setAds(adsData);
        };
        loadInitialData();
    }, []);

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-image-container">
                    <img src="/images/hero-v3.jpg" alt={t('Hero Heading')} className="hero-image" />
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-text-group">
                    <h1 className="hero-heading">{t('Hero Heading')}</h1>
                    <p className="hero-subheading">{t('Hero Subheading')}</p>
                    <Link to="/marketplace" className="hero-cta">{t('Browse Operations')}</Link>
                </div>
            </section>

            {/* Quick Links Section */}
            <section className="four-panel-section">
                <div className="four-panel-grid">
                    <div className="panel-item">
                        <h3 className="panel-title">{t('Quick Marine Title')}</h3>
                        <p className="panel-description">{t('Quick Marine Desc')}</p>
                        <Link to="/marketplace?category=sale" className="panel-button-solid">
                            {t('Quick Marine Btn')}
                        </Link>
                    </div>
                    <div className="panel-item">
                        <h3 className="panel-title">{t('Quick Repair Title')}</h3>
                        <p className="panel-description">{t('Quick Repair Desc')}</p>
                        <Link to="/marketplace?category=repair" className="panel-button-solid">
                            {t('Quick Repair Btn')}
                        </Link>
                    </div>
                    <div className="panel-item">
                        <h3 className="panel-title">{t('Quick Construction Title')}</h3>
                        <p className="panel-description">{t('Quick Construction Desc')}</p>
                        <Link to="/contact" className="panel-button-solid">
                            {t('Quick Construction Btn')}
                        </Link>
                    </div>
                    <div className="panel-item">
                        <h3 className="panel-title">{t('Quick Servicing Title')}</h3>
                        <p className="panel-description">{t('Quick Servicing Desc')}</p>
                        <Link to="/contact" className="panel-button-solid">
                            {t('Quick Servicing Btn')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="content-section" id="services">
                <div className="content-stack">
                    <div className="content-upper">
                        <div className="upper-text-group">
                            <h2 className="upper-heading">{t('Content Heading')}</h2>
                            <p className="upper-subtext">{t('Content Subtext')}</p>
                        </div>
                        <div className="upper-image-placeholder">
                            <img src="/images/shipping-logistics.jpg" alt={t('Tag Marine')} className="content-image" />
                            <div className="image-shadow"></div>
                            <div className="image-overlay-text" dangerouslySetInnerHTML={{ __html: t('Overlay Maritime') }}></div>
                            <Link to="/service/maritime" className="overlay-button-link">
                                <button className="overlay-button">{t('Explore Service')}</button>
                            </Link>
                        </div>
                    </div>
                    <div className="content-lower">
                        <div className="lower-image-container" id="charter">
                            <img src="/images/bottom-1.jpg" alt={t('Tag Charter')} className="lower-content-image" />
                            <div className="image-shadow"></div>
                            <div className="image-overlay-text" dangerouslySetInnerHTML={{ __html: t('Overlay Charter') }}></div>
                            <Link to="/service/charter" className="overlay-button-link">
                                <button className="overlay-button">{t('Explore Service')}</button>
                            </Link>
                        </div>
                        <div className="lower-image-container" id="offshore">
                            <img src="/images/bottom-2.jpg" alt={t('Tag Offshore')} className="lower-content-image" />
                            <div className="image-shadow"></div>
                            <div className="image-overlay-text" dangerouslySetInnerHTML={{ __html: t('Overlay Offshore') }}></div>
                            <Link to="/service/offshore" className="overlay-button-link">
                                <button className="overlay-button">{t('Explore Service')}</button>
                            </Link>
                        </div>
                        <div className="lower-image-container" id="security">
                            <img src="/images/bottom-3.jpg" alt={t('Tag Security')} className="lower-content-image" />
                            <div className="image-shadow"></div>
                            <div className="image-overlay-text" dangerouslySetInnerHTML={{ __html: t('Overlay Security') }}></div>
                            <Link to="/service/security" className="overlay-button-link">
                                <button className="overlay-button">{t('Explore Service')}</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Romeo Alpha Section */}
            <section className="benefit-section">
                <div className="benefit-header">
                    <h2 className="benefit-heading">{t('Why Romeo Alpha')}</h2>
                    <p className="benefit-subtext">{t('Why Subtext')}</p>
                </div>
                <div className="benefit-grid">
                    <div className="benefit-card">
                        <h3 className="benefit-title">{t('Benefit 1 Title')}</h3>
                        <p className="benefit-desc">{t('Benefit 1 Desc')}</p>
                    </div>
                    <div className="benefit-card">
                        <h3 className="benefit-title">{t('Benefit 2 Title')}</h3>
                        <p className="benefit-desc">{t('Benefit 2 Desc')}</p>
                    </div>
                    <div className="benefit-card">
                        <h3 className="benefit-title">{t('Benefit 3 Title')}</h3>
                        <p className="benefit-desc">{t('Benefit 3 Desc')}</p>
                    </div>
                    <div className="benefit-card">
                        <h3 className="benefit-title">{t('Benefit 4 Title')}</h3>
                        <p className="benefit-desc">{t('Benefit 4 Desc')}</p>
                    </div>
                    <div className="benefit-card">
                        <h3 className="benefit-title">{t('Benefit 5 Title')}</h3>
                        <p className="benefit-desc">{t('Benefit 5 Desc')}</p>
                    </div>
                    <div className="benefit-card">
                        <h3 className="benefit-title">{t('Benefit 6 Title')}</h3>
                        <p className="benefit-desc">{t('Benefit 6 Desc')}</p>
                    </div>
                </div>
            </section>

            {/* Proof Section */}
            <section className="proof-section">
                <div className="proof-container">
                    <div className="proof-item">
                        <span className="proof-number">{t('Proof Vessels')}</span>
                        <span className="proof-text">{t('Proof Vessels Text')}</span>
                    </div>
                    <div className="proof-item">
                        <span className="proof-number">{t('Proof Countries')}</span>
                        <span className="proof-text">{t('Proof Countries Text')}</span>
                    </div>
                    <div className="proof-item">
                        <span className="proof-number">{t('Proof Support')}</span>
                        <span className="proof-text">{t('Proof Support Text')}</span>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section-new">
                <div className="faq-container">
                    <div className="faq-header">
                        <h2 className="faq-title">{t('FAQ Title') || 'Frequently Asked Questions'}</h2>
                    </div>
                    <div className="faq-list">
                        {faqItems.map((faq, index) => (
                            <details key={faq.id || index} className="faq-item-new" name="faq-accordion">
                                <summary className="faq-question">
                                    <span>{t(faq.question)}</span>
                                    <div className="faq-icon-wrapper">
                                        <svg className="faq-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </summary>
                                <div className="faq-answer" style={{ whiteSpace: 'pre-wrap' }}>
                                    {t(faq.answer)}
                                </div>
                            </details>
                        ))}
                    </div>

                </div>
            </section>

            {/* ADS Section */}
            <section className="ads-section">
                <div className="ads-header">
                    <div className="ads-header-left">
                        <h2 className="ads-heading">{t('Ads Heading')}</h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '12px' }}>
                            <path d="M12 2L2 22H22L12 2Z" fill="#E6F2ED" fillOpacity="0.3" />
                        </svg>
                    </div>
                    <div className="ads-header-right">
                        <p className="ads-subtext" dangerouslySetInnerHTML={{ __html: t('Ads Subtext') }}></p>
                    </div>
                </div>
                <div className="ads-tags-wrapper">
                    <div className="ads-tags-row">
                        <span className="ads-tag">{t('Tag Marine')}</span>
                        <span className="ads-tag">{t('Tag Offshore')}</span>
                        <span className="ads-tag">{t('Tag Charter')}</span>
                        <span className="ads-tag">{t('Tag Security')}</span>
                        <span className="ads-tag">{t('Tag Logistics')}</span>
                        <span className="ads-tag">{t('Tag Global')}</span>
                    </div>
                </div>
                <div className="ads-ship-strip">
                    <div className="ads-gallery-track">
                        {ads && ads.length > 0 ? (
                            [...Array(3)].map((_, i) => (
                                <React.Fragment key={i}>
                                    {ads.map((ad, index) => (
                                        <div className="ads-gallery-item" key={`${i}-${index}`}>
                                            <img src={ad.image_url} alt={`Ad ${index}`} className="ads-gallery-img" />
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))
                        ) : (
                            [...Array(2)].map((_, i) => (
                                <React.Fragment key={i}>
                                    <div className="ads-gallery-item"><img src="/images/ads-gallery-1.jpg" alt="Ship" className="ads-gallery-img" /></div>
                                    <div className="ads-gallery-item"><img src="/images/ads-gallery-2.jpg" alt="Workers" className="ads-gallery-img" /></div>
                                    <div className="ads-gallery-item"><img src="/images/ads-gallery-3.jpg" alt="Refinery" className="ads-gallery-img" /></div>
                                    <div className="ads-gallery-item"><img src="/images/ads-gallery-4.jpg" alt="Container" className="ads-gallery-img" /></div>
                                </React.Fragment>
                            ))
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
