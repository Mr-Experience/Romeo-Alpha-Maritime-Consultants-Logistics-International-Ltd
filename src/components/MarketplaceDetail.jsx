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

const MarketplaceDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const { t } = useTranslation();
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

            alert(t('Inquiry Success'));
            setShowInquiryForm(false);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Submission Error:', error);
            alert(`Error: ${error.message}`);
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
        <div className="marketplace-detail-page" style={{ backgroundColor: '#fff' }}>
            {/* Page Header / Back Button Only */}
            <div style={{ borderBottom: '1px solid #eee', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 100 }}>
                <div className="detail-container" style={{ display: 'flex', alignItems: 'center', padding: '16px 16px' }}>
                    <Link to="/marketplace" style={{ color: '#001F3F', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                        <ArrowLeft size="18" /> {t('Back')}
                    </Link>
                </div>
            </div>

            <section className="detail-main-content" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
                <div className="detail-container">
                    <div className="detail-grid">
                        {/* Gallery Section */}
                        <div className="detail-gallery-column">
                            <div className="main-display-image">
                                <img src={activeImage} alt={item.title} />
                            </div>
                            {item.gallery && item.gallery.length > 1 && (
                                <div className="thumbnail-grid">
                                    {item.gallery.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`thumbnail-item ${activeImage === img ? 'active' : ''}`}
                                            onClick={() => setActiveImage(img)}
                                        >
                                            <img src={img} alt={`${item.title} thumbnail ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Section */}
                        <div className="info-card">
                            <div style={{ marginBottom: '20px' }}>
                                <span className="detail-category-tag" style={{ backgroundColor: '#E6F1FF', color: '#0056b3', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {t('Marketplace ' + item.category.charAt(0).toUpperCase() + item.category.slice(1)).toUpperCase()}
                                </span>
                                <h1 className="detail-title" style={{ fontSize: '24px', marginTop: '8px', marginBottom: '4px', color: '#001F3F' }}>{item.title}</h1>
                                {item.price && <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00B341' }}>{item.price.toString().startsWith('₦') ? item.price : `₦${item.price}`}</div>}
                            </div>

                            <h3><Information size="20" variant="Bulk" color="#001F3F" /> {t('Item Description')}</h3>
                            <p className="description-text">{item.longDescription || item.description}</p>

                            <div className="specifications-list">
                                <h4>{t('Key Specifications')}</h4>
                                <ul>
                                    <li><strong>{t('Label Category')}</strong> {t('Marketplace ' + item.category.charAt(0).toUpperCase() + item.category.slice(1))}</li>
                                    <li><strong>{t('Label Availability')}</strong> {item.availability || t('Immediate')}</li>
                                    <li><strong>{t('Label Location')}</strong> {item.location || t('Default Location')}</li>
                                    {item.dynamicTags && item.dynamicTags.length > 0 ? (
                                        <li><strong>{t('Label Tags')}</strong> {item.dynamicTags.join(', ')}</li>
                                    ) : item.tags && item.tags.length > 0 && (
                                        <li><strong>{t('Label Tags')}</strong> {item.tags.join(', ')}</li>
                                    )}
                                </ul>
                            </div>

                            <div className="inquiry-actions" ref={inquiryRef}>
                                <div className="inquiry-actions">
                                    {!showInquiryForm ? (
                                        <button
                                            onClick={() => setShowInquiryForm(true)}
                                            className="action-btn-primary"
                                            style={{ border: 'none', cursor: 'pointer', fontSize: '16px', padding: '16px 32px', display: 'flex', width: '100%', borderRadius: '8px', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        >
                                            <Sms size="20" variant="Bulk" /> {t('Send Inquiry Detail')}
                                        </button>
                                    ) : (
                                        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <h3 style={{ margin: 0, fontSize: '18px' }}>{t('Submit Inquiry Title')}</h3>
                                                <button onClick={() => setShowInquiryForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><CloseCircle size="20" color="#666" /></button>
                                            </div>
                                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>{t('Form Subject')}</label>
                                                    <input type="text" name="subject" defaultValue={item.title} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>{t('Contact Person')}</label>
                                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('Placeholder Name')} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>{t('Form Email')}</label>
                                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('Placeholder Email')} required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ddd' }} />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '14px', fontWeight: 'bold' }}>{t('Discussion Details')}</label>
                                                    <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder={t('Placeholder Message')} rows="4" required style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '4px', border: '1px solid #ddd' }}></textarea>
                                                </div>
                                                <button type="submit" disabled={isSubmitting} style={{ backgroundColor: '#0056b3', color: '#fff', padding: '12px', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    {isSubmitting ? t('Sending Request') : t('Inquiry Submit')}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MarketplaceDetail;
