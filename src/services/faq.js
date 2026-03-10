import { config } from '../config';
import { getSession } from './auth';

// Default FAQs to display if no custom FAQs exist in database
const defaultFaqs = [
    {
        id: 'default-1',
        question: 'FAQ_Q1',
        answer: 'FAQ_A1'
    },
    {
        id: 'default-2',
        question: 'FAQ_Q2',
        answer: 'FAQ_A2'
    },
    {
        id: 'default-3',
        question: 'FAQ_Q3',
        answer: 'FAQ_A3'
    },
    {
        id: 'default-4',
        question: 'FAQ_Q4',
        answer: 'FAQ_A4'
    },
    {
        id: 'default-5',
        question: 'FAQ_Q5',
        answer: 'FAQ_A5'
    },
    {
        id: 'default-6',
        question: 'FAQ_Q6',
        answer: 'FAQ_A6'
    },
    {
        id: 'default-7',
        question: 'FAQ_Q7',
        answer: 'FAQ_A7'
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

