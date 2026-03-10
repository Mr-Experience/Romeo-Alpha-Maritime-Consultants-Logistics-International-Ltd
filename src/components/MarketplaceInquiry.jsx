import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import { ArrowLeft, Send } from 'iconsax-react';
import { operationsData } from '../data/operationsData';
import { fetchMarketplaceItems } from '../services/marketplace';
import { config } from '../config';
import emailjs from '@emailjs/browser';
import { submitMessage } from '../services/messages';
import { useNotification } from '../context/NotificationContext';

const MarketplaceInquiry = () => {
    const { t } = useTranslation();
    const { notify } = useNotification();
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    useEffect(() => {
        loadItem();
    }, [id]);

    const loadItem = async () => {
        try {
            setLoading(true);
            let found = operationsData.find(op => op.id.toString() === id);

            if (!found) {
                const dynamic = await fetchMarketplaceItems();
                found = dynamic.find(di => di.id.toString() === id);
            }

            if (found) {
                setItem(found);
            }
        } catch (err) {
            console.error("Error loading item for inquiry:", err);
        } finally {
            setLoading(false);
        }
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
            setTimeout(() => navigate('/marketplace'), 2000);
        } catch (error) {
            console.error('Submission Error:', error);
            let errorMsg = error.message;
            if (errorMsg.includes('535') || errorMsg.includes('Authentication')) {
                errorMsg = 'Zoho Authentication Failed. Please check your App-Specific Password in Zoho and credentials in EmailJS Dashboard.';
            }
            notify(`Oops! ${errorMsg}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>{t('General Error')}</div>;
    if (!item) return <div style={{ padding: '100px', textAlign: 'center' }}>{t('Item Not Found')}</div>;

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: 0 }}>
            {/* Header / Back Bar */}
            <div style={{ padding: '24px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', position: 'relative', height: '80px' }}>
                <Link to={`/marketplace/${id}`} style={{ color: '#001F3F', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold', zIndex: 10 }}>
                    <ArrowLeft size="20" /> {t('Back')}
                </Link>
                <div style={{ position: 'absolute', width: '100%', left: 0, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#001F3F', pointerEvents: 'none' }}>
                    {t('Submit Inquiry Title')}
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', color: '#001F3F', marginBottom: '8px' }}>{t('Submit Inquiry Title')}</h1>
                    <p style={{ color: '#6B82AC' }}>{t('Interested CTA')} <strong>{item?.title}</strong>? {t('Support Text')}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '700', color: '#001F3F' }}>{t('Form Subject')}</label>
                        <input
                            type="text"
                            name="subject"
                            defaultValue={`${t('Placeholder Subject')} ${item?.title || ''}`}
                            required
                            style={{ padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '700', color: '#001F3F' }}>{t('Contact Person')}</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('Placeholder Name')}
                            style={{ padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '700', color: '#001F3F' }}>{t('Form Email')}</label>
                        <input
                            type="text"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder={t('Placeholder Email')}
                            style={{ padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '700', color: '#001F3F' }}>{t('Discussion Details')}</label>
                        <textarea
                            required
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder={t('Placeholder Message')}
                            rows="8"
                            style={{ padding: '14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            backgroundColor: '#0056b3',
                            color: '#fff',
                            padding: '16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'background 0.3s'
                        }}
                    >
                        {isSubmitting ? t('Sending Request') : <><Send size="20" variant="Bold" /> {t('Inquiry Submit')}</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MarketplaceInquiry;
