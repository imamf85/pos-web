import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

console.log('🔧 Supabase config:', {
    url: supabaseUrl ? 'exists' : 'missing',
    anonKey: supabaseAnonKey ? 'exists' : 'missing',
    serviceKey: supabaseServiceKey ? 'exists' : 'missing',
    actualUrl: supabaseUrl
});

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            detectSessionInUrl: true,
            autoRefreshToken: true,
            storageKey: 'supabase.auth.token',
            storage: window.localStorage
        }
    })
    : null;

// Service role client for operations that need to bypass RLS
export const supabaseService = (supabaseUrl && supabaseServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    })
    : null;

setTimeout(async () => {
    if (supabase && supabase.auth) {
        try {
            const { data, error } = await supabase.auth.getSession();
        } catch (err) {
            console.error('❌ getSession error:', err);
        }
    }
}, 1000);

export const handleSupabaseError = (error) => {
    throw new Error(error.message || 'Database operation failed');
};

export const isSupabaseAvailable = () => {
    return supabase !== null;
};