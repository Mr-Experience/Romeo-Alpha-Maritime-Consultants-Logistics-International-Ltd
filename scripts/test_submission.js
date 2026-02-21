import { config } from './src/config.js';

const submitMessage = async () => {
    try {
        console.log("Testing submission to:", `${config.supabaseUrl}/rest/v1/contact_messages`);

        const response = await fetch(`${config.supabaseUrl}/rest/v1/contact_messages`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseAnonKey,
                'Authorization': `Bearer ${config.supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                full_name: "Test User",
                email: "test@example.com",
                subject: "RLS Verification",
                message: "This is a test message to verify the RLS policy fix."
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit message');
        }

        const data = await response.json();
        console.log("Success! Message submitted:", data);
    } catch (error) {
        console.error("Submission failed:", error);
    }
};

submitMessage();
