import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { config } from '../config';
import { operationsData } from '../data/operationsData';
import { ArrowLeft, Call, Sms, Information, CloseCircle, Home2, Edit } from 'iconsax-react';
import '../styles/operations.css';
import { fetchMarketplaceItems } from '../services/marketplace';
import emailjs from '@emailjs/browser';
import { submitMessage } from '../services/messages';
import { useNotification } from '../context/NotificationContext';

const MarketplaceDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const { t } = useTranslation();
    const { notify } = useNotification();
    const inquiryRef = useRef(null);
    const [item, setItem] = useState(null);
    const [allItems, setAllItems] = useState([]);
    const [sitePhone, setSitePhone] = useState('+234 814 409 1443');
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        loadItemDetails();

        // Check for triggerInquiry param
        const params = new URLSearchParams(location.search);
        if (params.get('triggerInquiry') === 'true') {
            setShowInquiryForm(true);
            // Smaller timeout to allow content to render before scrolling
            setTimeout(() => {
                inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [id, location.search]);

    const loadItemDetails = async () => {
        setLoading(true);
        let dynamicItems = [];

        try {
            // Attempt to fetch dynamic items
            dynamicItems = await fetchMarketplaceItems();
        } catch (error) {
            console.warn("Could not fetch marketplace items (using static data only):", error);
            // Non-blocking error: we continue with static data
        }

        try {
            // Process dynamic items if any
            const processedDynamic = dynamicItems.map(di => ({
                id: di.id,
                category: di.category,
                title: di.title,
                description: di.description,
                image: di.image_url || '/images/hero-v3.jpg',
                gallery: di.gallery || [di.image_url].filter(Boolean),
                tags: di.category === 'sale' ? [t('Marketplace Available'), t('Tag Marketplace')] : [t('Marketplace Featured')],
                price: di.price ? (di.price.toString().startsWith('₦') ? di.price : `₦${di.price}`) : null,
                availability: di.availability || t('Immediate'),
                location: di.location || t('Default Location'),
                dynamicTags: di.tags ? di.tags.split(',').map(t => t.trim()) : []
            }));

            // Combine static and dynamic data
            const all = [...operationsData, ...processedDynamic];
            setAllItems(all);

            const foundItem = all.find(op => op.id.toString() === id);
            if (foundItem) {
                setItem(foundItem);
                setActiveImage(foundItem.image);
            }
        } catch (error) {
            console.error("Error processing item details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.target;
        const subject = form.subject.value;

        try {
            // 1. Save to Supabase
            await submitMessage({
                full_name: formData.name,
                email: formData.email,
                subject: subject,
                message: formData.message
            });

            // 2. Send via EmailJS
            await emailjs.send(
                config.emailjsServiceId,
                config.emailjsTemplateId,
                {
                    name: formData.name,
                    email: formData.email,
                    subject: subject,
                    message: formData.message,
                    time: new Date().toLocaleString(),
                    to_email: 'info@romeoalphamaritime.com'
                },
                config.emailjsPublicKey
            );

            notify(t('Inquiry Success'), 'success');
            setShowInquiryForm(false);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Submission Error:', error);
            notify(`Error: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="detail-loading-container">
                <div className="loader"></div>
                <p>{t('Marketplace Loading')}</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="detail-error-container">
                <h2>{t('Item Not Found')}</h2>
                <p>{t('Item Error Desc')}</p>
                <Link to="/marketplace" className="back-btn-solid">
                    <ArrowLeft size="18" /> {t('Back to Marketplace')}
                </Link>
            </div>
        );
    }

    return (
        <div className="marketplace-detail-page">
            {/* Persistent Back Button Strip */}
            <div className="detail-navigation-bar">
                <div className="nav-flex-wrapper">
                    <Link to="/marketplace" className="back-circle-btn" aria-label="Go Back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#001F3F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </Link>
                </div>
            </div>

            <main className="detail-main-wrapper">
                <div className="detail-container">
                    <div className="detail-layout">
                        
                        {/* LEFT: GALLERY */}
                        <div className="detail-media-box">
                            <div className="detail-active-image">
                                <img src={activeImage} alt={item.title} />
                            </div>
                            {item.gallery && item.gallery.length > 1 && (
                                <div className="detail-gallery-strip">
                                    {item.gallery.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`detail-thumb-btn ${activeImage === img ? 'is-active' : ''}`}
                                            onClick={() => setActiveImage(img)}
                                        >
                                            <img src={img} alt={`${item.title} - ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: CONTENT */}
                        <div className="detail-info-box">
                            <div className="detail-hero-info">
                                <span className="category-pill">
                                    {t('Marketplace ' + item.category.charAt(0).toUpperCase() + item.category.slice(1))}
                                </span>
                                <h1 className="detail-main-title">{item.title}</h1>
                                {item.price && <div className="detail-main-price">{item.price.toString().startsWith('₦') ? item.price : `₦${item.price}`}</div>}
                            </div>

                            <div className="detail-description-group">
                                <h3 className="detail-subheading">
                                    <Information size="18" variant="Bold" /> {t('Item Description')}
                                </h3>
                                <p className="detail-text-body">{item.longDescription || item.description}</p>
                            </div>

                            <div className="detail-specs-group">
                                <h3 className="detail-subheading">{t('Key Specifications')}</h3>
                                <div className="specs-flat-list">
                                    <div className="spec-flat-item">
                                        <span className="spec-label">{t('Label Availability')}</span>
                                        <span className="spec-value">{item.availability || t('Immediate')}</span>
                                    </div>
                                    <div className="spec-flat-item">
                                        <span className="spec-label">{t('Label Location')}</span>
                                        <span className="spec-value">{item.location || t('Default Location')}</span>
                                    </div>
                                    {(item.dynamicTags?.length > 0 || item.tags?.length > 0) && (
                                        <div className="spec-flat-item">
                                            <span className="spec-label">{t('Label Tags')}</span>
                                            <span className="spec-value">{(item.dynamicTags || item.tags).join(', ')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-actions-footer" style={{ marginTop: 'auto' }}>
                                <button
                                    onClick={() => setShowInquiryForm(true)}
                                    className="btn-primary-action"
                                >
                                    <Sms size="22" variant="Bulk" /> {t('Send Inquiry Detail')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* MODAL OVERLAY */}
            {showInquiryForm && (
                <div className="inquiry-modal-overlay">
                    <div className="inquiry-modal-content">
                        <div className="modern-inquiry-box">
                            <div className="inquiry-box-header">
                                <h4>{t('Submit Inquiry Title')}</h4>
                                <button onClick={() => setShowInquiryForm(false)} className="inquiry-close-x">
                                    <CloseCircle size="28" color="#A0AEC0" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modern-form">
                                <div className="modern-field">
                                    <label>{t('Form Subject')}</label>
                                    <input type="text" name="subject" defaultValue={item.title} required readOnly className="readonly-input" />
                                </div>
                                <div className="modern-field">
                                    <label>{t('Contact Person')}</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('Placeholder Name')} required />
                                </div>
                                <div className="modern-field">
                                    <label>{t('Form Email')}</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('Placeholder Email')} required />
                                </div>
                                <div className="modern-field">
                                    <label>{t('Discussion Details')}</label>
                                    <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder={t('Placeholder Message')} rows="4" required></textarea>
                                </div>
                                <button type="submit" disabled={isSubmitting} className="btn-modern-submit">
                                    {isSubmitting ? t('Sending Request') : t('Inquiry Submit')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketplaceDetail;
