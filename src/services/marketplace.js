import { config } from '../config';
import { getSession } from './auth';

export const fetchMarketplaceItems = async () => {
    try {
        const token = getSession();
        // Marketplace might be public, but for admin management we use the token
        const headers = {
            'apikey': config.supabaseAnonKey,
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${config.supabaseUrl}/rest/v1/marketplace_items?select=*&order=created_at.desc`, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch marketplace items');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching marketplace items:", error);
        throw error;
    }
};

export const addMarketplaceItem = async (item) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/marketplace_items`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add marketplace item');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error adding marketplace item:", error);
        throw error;
    }
};

export const deleteMarketplaceItem = async (id) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/marketplace_items?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete marketplace item');
        }

        return true;
    } catch (error) {
        console.error("Error deleting marketplace item:", error);
        throw error;
    }
};

export const updateMarketplaceItem = async (id, item) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`${config.supabaseUrl}/rest/v1/marketplace_items?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update marketplace item');
        }

        return true;
    } catch (error) {
        console.error("Error updating marketplace item:", error);
        throw error;
    }
};

export const uploadImage = async (file) => {
    try {
        const token = getSession();
        if (!token) throw new Error('No authentication token found');

        const sanitizedName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        const fileName = `${Date.now()}_${sanitizedName}`;
        // We use a public bucket named 'marketplace'
        const response = await fetch(`${config.supabaseUrl}/storage/v1/object/marketplace/${fileName}`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${token}`,
                'Content-Type': file.type
            },
            body: file
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload image');
        }

        const publicUrl = `${config.supabaseUrl}/storage/v1/object/public/marketplace/${fileName}`;
        return publicUrl;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};
