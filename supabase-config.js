// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
// Replace these values with your Supabase project credentials
// Find them at: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
// ============================================================

const SUPABASE_CONFIG = {
    // Your Supabase project URL (e.g., https://xxxxx.supabase.co)
    url: 'https://jzixzdleqfiatexitsrl.supabase.co',
    
    // Your Supabase anon/public key
    anonKey: 'sb_publishable_aFNhkWgBxys-PxvcB2wnBA_Zv3UOpm5'
};

// Check if properly configured
const isSupabaseConfigured = SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL';

// Supabase REST API helper
const supabase = {
    async fetch(table, options = {}) {
        const { method = 'GET', body = null, query = '' } = options;
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}${query}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_CONFIG.anonKey,
                'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
                'Prefer': method === 'POST' ? 'return=minimal' : 'return=representation'
            },
            body: body ? JSON.stringify(body) : null
        });
        
        if (!response.ok) {
            throw new Error(`Supabase error: ${response.status}`);
        }
        
        // For DELETE and some POST, response may be empty
        const text = await response.text();
        return text ? JSON.parse(text) : null;
    },

    // Get all claims (for main page)
    async getClaims() {
        return this.fetch('claims', { query: '?select=*' });
    },

    // Get all submissions (for admin)
    async getSubmissions() {
        return this.fetch('submissions', { query: '?select=*' });
    },

    // Create a new submission
    async createSubmission(data) {
        return this.fetch('submissions', { method: 'POST', body: data });
    },

    // Update submission status
    async updateSubmission(id, data) {
        return this.fetch('submissions', {
            method: 'PATCH',
            query: `?id=eq.${id}`,
            body: data
        });
    },

    // Add approved claim to main claims table
    async createClaim(data) {
        return this.fetch('claims', { method: 'POST', body: data });
    },

    // Update a claim
    async updateClaim(id, data) {
        return this.fetch('claims', {
            method: 'PATCH',
            query: `?id=eq.${id}`,
            body: data
        });
    }
};
