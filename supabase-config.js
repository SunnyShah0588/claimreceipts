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
    // ============ AUTH METHODS ============
    async signIn(email, password) {
        const response = await fetch(`${SUPABASE_CONFIG.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_CONFIG.anonKey
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error_description || error.msg || 'Login failed');
        }
        
        const data = await response.json();
        // Store session
        localStorage.setItem('supabase-auth', JSON.stringify({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            user: data.user,
            expires_at: Date.now() + (data.expires_in * 1000)
        }));
        return data;
    },

    async signOut() {
        const session = this.getSession();
        if (session) {
            try {
                await fetch(`${SUPABASE_CONFIG.url}/auth/v1/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_CONFIG.anonKey,
                        'Authorization': `Bearer ${session.access_token}`
                    }
                });
            } catch (e) {
                console.warn('Logout request failed:', e);
            }
        }
        localStorage.removeItem('supabase-auth');
    },

    getSession() {
        const stored = localStorage.getItem('supabase-auth');
        if (!stored) return null;
        
        const session = JSON.parse(stored);
        // Check if expired
        if (session.expires_at && session.expires_at < Date.now()) {
            localStorage.removeItem('supabase-auth');
            return null;
        }
        return session;
    },

    isAuthenticated() {
        return this.getSession() !== null;
    },

    getAuthHeaders() {
        const session = this.getSession();
        const token = session ? session.access_token : SUPABASE_CONFIG.anonKey;
        return {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_CONFIG.anonKey,
            'Authorization': `Bearer ${token}`
        };
    },

    // ============ DATABASE METHODS ============
    async fetch(table, options = {}) {
        const { method = 'GET', body = null, query = '' } = options;
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}${query}`, {
            method,
            headers: {
                ...this.getAuthHeaders(),
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
