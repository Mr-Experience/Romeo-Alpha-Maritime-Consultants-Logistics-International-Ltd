// verify_rls_status.mjs
// Standalone script to verify RLS policy - No dependencies on local config files to avoid ESM issues.

const supabaseUrl = 'https://kqzxbmvpqcjssusnpepl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxenhibXZwcWNqc3N1c25wZXBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjM4ODcsImV4cCI6MjA4NTczOTg4N30.C1n7PS7n7UoDPQgqVY-ji78TVSSVBxTlmn1tFV01XaA';

async function verifyRLS() {
    console.log("--- Starting RLS Verification ---");
    console.log("Target:", `${supabaseUrl}/rest/v1/contact_messages`);

    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
            method: 'POST',
            headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                full_name: "RLS Verifier",
                email: "verify@example.com",
                subject: "Verification Test",
                message: "Checking if RLS policy allows public insert."
            })
        });

        console.log("Status Code:", response.status);

        if (response.ok) {
            const data = await response.json();
            console.log("SUCCESS: Message submitted successfully.");
            console.log("Response:", data);
        } else {
            const errorText = await response.text();
            console.error("FAILURE: Submission rejected.");
            console.error("Error Body:", errorText);

            try {
                const jsonError = JSON.parse(errorText);
                if (jsonError.message && jsonError.message.includes("row-level security policy")) {
                    console.error("\n>>> CONFIRMED: RLS Policy is still blocking inserts. The SQL fix has NOT been applied correctly. <<<");
                }
            } catch (e) {
                // Ignore parse error
            }
        }

    } catch (err) {
        console.error("NETWORK ERROR:", err.message);
    }
}

verifyRLS();
