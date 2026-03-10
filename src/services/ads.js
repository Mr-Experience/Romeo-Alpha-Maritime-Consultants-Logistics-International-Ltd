import { config } from '../config';
import { getSession } from './auth';

export const fetchAds = async () => {
    try {
        const token = getSession();
        const headers = {
            'apikey': config.supabaseAnonKey,
            'Content-Type': 'application/json'
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${config.supabaseUrl}/rest/v1/ads?select=*&order=created_at.desc`, {
            headers: headers
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching ads:', error);
        return [];
    }
};

export const addAd = async (adData) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/ads`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(adData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding ad:', error);
        throw error;
    }
};

export const deleteAd = async (adId) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/ads?id=eq.${adId}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Error deleting ad:', error);
        throw error;
    }
};
