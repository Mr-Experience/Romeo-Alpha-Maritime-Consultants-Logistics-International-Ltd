import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/TranslationContext';
import '../styles/contact.css';
import { config } from '../config';
import emailjs from '@emailjs/browser';
import { submitMessage } from '../services/messages';
import { useNotification } from '../context/NotificationContext';

const Contact = () => {
    const { t } = useTranslation();
    const { notify } = useNotification();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Map form fields to Supabase column names
        const payload = {
            full_name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message
        };

        setIsSubmitting(true);

        try {
            // 1. Save to Supabase Dashboard
            const supabasePromise = submitMessage(payload);

            // 2. Send to Zoho Mail via EmailJS
            const emailjsPromise = emailjs.send(
                config.emailjsServiceId,
                config.emailjsTemplateId,
                {
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    message: data.message,
                    time: new Date().toLocaleString(),
                    to_email: 'info@romeoalphamaritime.com'
                },
                config.emailjsPublicKey
            ).catch(err => {
                let errorMsg = err.text || err.message || 'Failed to send email';
                if (errorMsg.includes('535') || errorMsg.includes('Authentication')) {
                    errorMsg = 'Zoho Authentication Failed. Please check your App-Specific Password in Zoho and credentials in EmailJS Dashboard.';
                }
                throw new Error(`Email Error: ${errorMsg}`);
            });

            await Promise.all([supabasePromise, emailjsPromise]);

            notify(t('Form Success Alert'), 'success');
            form.reset();

        } catch (error) {
            console.error('Submission Error:', error);
            notify(`Oops! ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Contact Hero Section */}
            <section className="contact-hero">
                <div className="contact-hero-content">
                    <h1 className="contact-hero-title">{t('Contact Hero Title')}</h1>
                    <p className="contact-hero-subtitle">{t('Contact Hero Subtitle')}</p>
                </div>
            </section>

            {/* Contact Content Section */}
            <section className="contact-content-section">

                {/* Info Strip */}
                <div className="contact-info-strip">
                    {/* Item 1: Visit Office */}
                    <div className="contact-strip-item dark">
                        <div className="strip-icon-circle">
                            {/* Map Pin Icon */}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#FFF"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div className="strip-text">
                            <h3>{t('Visit Office Heading')}</h3>
                            <p>{t('Label Portharcourt')}</p>
                        </div>
                    </div>

                    {/* Item 2: Let's Talk */}
                    <div className="contact-strip-item primary">
                        <div className="strip-icon-circle">
                            {/* Phone Icon */}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#FFF"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .57 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.03 12.03 0 0 0 2.81.57A2 2 0 0 1 22 16.92z">
                                </path>
                            </svg>
                        </div>
                        <div className="strip-text">
                            <h3>{t('Lets Talk Heading')}</h3>
                            <p>{config.contactPhone}</p>
                            <span className="cta-text">{t('Call Us CTA')}</span>
                        </div>
                    </div>

                    {/* Item 3: Inbox */}
                    <div className="contact-strip-item dark">
                        <div className="strip-icon-circle">
                            {/* Envelope Icon */}
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#FFF"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z">
                                </path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </div>
                        <div className="strip-text">
                            <h3>{t('Inbox Heading')}</h3>
                            <p>info@romeoalphamaritime.com / Kyoyan99@yahoo.com</p>
                            <span className="cta-text">{t('Email Us CTA')}</span>
                        </div>
                    </div>
                </div>

                <div className="contact-container">



                    {/* Right Panel: Contact Form */}
                    <div className="contact-form-container">
                        <h2>{t('Form Title')}</h2>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">{t('Form Name')}</label>
                                <input type="text" id="name" name="name" placeholder={t('Placeholder Name')} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">{t('Form Email')}</label>
                                <input type="email" id="email" name="email" placeholder={t('Email Placeholder')} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">{t('Form Subject')}</label>
                                <input type="text" id="subject" name="subject" placeholder={t('Placeholder Subject')} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">{t('Form Message')}</label>
                                <textarea id="message" name="message" rows="5" placeholder={t('Placeholder Message')} required></textarea>
                            </div>
                            <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                {isSubmitting ? t('Sending') : t('Form Submit')}
                            </button>
                        </form>
                    </div>

                </div>

            </section>
        </div>
    );
};

export default Contact;
