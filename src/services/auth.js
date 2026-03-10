import { config } from '../config';

// Step 1: Login Request
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error_description || data.msg || 'Login failed');
        }

        // Return access_token and user info
        return data;
    } catch (error) {
        throw error;
    }
};

// Step 3 & 4: Get User Role and Verify
export const verifyAdminRole = async (userId, accessToken) => {
    try {
        // Fetch user details from the 'User' table finding by id (which user copies from auth.users)
        const response = await fetch(`${config.supabaseUrl}/rest/v1/User?id=eq.${userId}&select=role,full_name`, {
            method: 'GET',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch user role');
        }

        if (data.length === 0) {
            throw new Error('User record not found');
        }

        const userRecord = data[0];
        const isAdmin = userRecord.role === 'admin';

        // Check if role is admin
        return { isAdmin, full_name: userRecord.full_name };
    } catch (error) {
        console.error("Role Verification Error:", error);
        return { isAdmin: false, full_name: null };
    }
};

// Helper to save session
export const saveSession = (accessToken, user) => {
    localStorage.setItem('admin_access_token', accessToken);
    localStorage.setItem('admin_user', JSON.stringify(user));
};

export const clearSession = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_user');
};

export const getSession = () => {
    return localStorage.getItem('admin_access_token');
};
