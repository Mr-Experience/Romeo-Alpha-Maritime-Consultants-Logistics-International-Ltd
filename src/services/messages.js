import { config } from '../config';
import { getSession } from './auth';

// Submit a new contact message or inquiry to Supabase
export const submitMessage = async (payload) => {
    try {
        const response = await fetch(`${config.supabaseUrl}/rest/v1/contact_messages`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${config.supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                full_name: payload.full_name,
                email: payload.email,
                subject: payload.subject,
                message: payload.message
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit message');
        }

        return true;
    } catch (error) {
        console.error("Error submitting message to Supabase:", error);
        throw error;
    }
};

export const fetchMessages = async () => {
    try {
        const token = getSession();
        const headers = {
            'apikey': config.supabaseAnonKey,
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${config.supabaseUrl}/rest/v1/contact_messages?select=*&order=created_at.desc`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch messages');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
};

export const updateMessage = async (id, patch) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/contact_messages?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patch)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update message');
        }

        return true;
    } catch (error) {
        console.error('Error updating message:', error);
        throw error;
    }
};

export const deleteMessage = async (id) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/contact_messages?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete message');
        }

        return true;
    } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
    }
};

// Note: fetchMessages, deleteMessage etc. were removed as part of the dashboard cleanup
// as they are no longer required for administrative review within the app.
