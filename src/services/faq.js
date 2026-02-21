import { config } from '../config';
import { getSession } from './auth';

// Default FAQs to display if no custom FAQs exist in database
const defaultFaqs = [
    {
        id: 'default-1',
        question: 'What maritime services does Romeo Alpha offer?',
        answer: 'Romeo Alpha provides comprehensive maritime services including vessel chartering, offshore support, marine security escort services, ship brokerage, cargo logistics, fleet management, and oil & gas offshore operations across coastal and international waters.'
    },
    {
        id: 'default-2',
        question: 'What areas do you operate in?',
        answer: 'We operate globally across major shipping routes and offshore locations. Our primary coverage includes West African waters, the Gulf of Guinea, Mediterranean Sea, and international shipping lanes connecting Africa, Europe, and the Americas.'
    },
    {
        id: 'default-3',
        question: 'How do I request a quote for your services?',
        answer: 'You can request a quote by clicking the "Get Quotes" button on our website, contacting us via email, or calling our 24/7 operations center. Our team typically responds within 24 hours with a detailed proposal tailored to your specific requirements.'
    },
    {
        id: 'default-4',
        question: 'What types of vessels are in your fleet?',
        answer: 'Our fleet includes offshore support vessels (OSVs), anchor handling tugs (AHTS), platform supply vessels (PSVs), crew boats, tugboats, and security escort vessels. All vessels are modern, well-maintained, and comply with international maritime standards.'
    },
    {
        id: 'default-5',
        question: 'Do you provide 24/7 operational support?',
        answer: 'Yes, we maintain round-the-clock operations with our dedicated support team available 24/7. Our operations center monitors all active vessels and can respond to emergencies or schedule changes at any time.'
    },
    {
        id: 'default-6',
        question: 'What safety certifications do you hold?',
        answer: 'Romeo Alpha holds ISM Code certification, ISO 9001:2015 for quality management, and complies with SOLAS, MARPOL, and ISPS Code requirements. Our crews are certified according to STCW standards and undergo regular safety training.'
    },
    {
        id: 'default-7',
        question: 'How can I partner with Romeo Alpha?',
        answer: 'We welcome partnerships with shipping companies, oil & gas operators, and maritime service providers. Contact our business development team through our Contact page to discuss collaboration opportunities and strategic alliances.'
    }
];

// Get all FAQs from Supabase
export const fetchFaqs = async () => {
    try {
        const response = await fetch(`${config.supabaseUrl}/rest/v1/faqs?select=*&order=display_order.asc`, {
            method: 'GET',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch FAQs');
        }

        const data = await response.json();
        return data.length > 0 ? data : defaultFaqs;
    } catch (error) {
        console.error('Error loading FAQs from Supabase:', error);
        return defaultFaqs;
    }
};

// Add a new FAQ item
export const addFaq = async (faq) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/faqs`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(faq)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add FAQ');
        }

        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error("Error adding FAQ:", error);
        throw error;
    }
};

// Update an existing FAQ
export const updateFaq = async (id, updatedFaq) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/faqs?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedFaq)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update FAQ');
        }

        return true;
    } catch (error) {
        console.error("Error updating FAQ:", error);
        throw error;
    }
};

// Delete a FAQ by ID
export const deleteFaq = async (id) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/faqs?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete FAQ');
        }

        return true;
    } catch (error) {
        console.error("Error deleting FAQ:", error);
        throw error;
    }
};

