// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

// Get API URL from environment variables with fallback
const getApiUrl = () => {
    // Try different methods to get the API URL
    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.REACT_APP_API_URL) {
        return window.__ENV__.REACT_APP_API_URL;
    }
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    return '/api'; // Fallback to relative path
};

// Get Supabase configuration from environment variables with fallback
const getSupabaseConfig = () => {
    // Try different methods to get environment variables
    if (typeof window !== 'undefined' && window.__ENV__) {
        return {
            url: window.__ENV__.REACT_APP_SUPABASE_URL,
            key: window.__ENV__.REACT_APP_SUPABASE_ANON_KEY
        };
    }
    if (typeof process !== 'undefined' && process.env) {
        return {
            url: process.env.REACT_APP_SUPABASE_URL,
            key: process.env.REACT_APP_SUPABASE_ANON_KEY
        };
    }
    return { url: null, key: null };
};

// Debug environment variables
const config = getSupabaseConfig();
console.log('Environment check:', {
    NODE_ENV: typeof process !== 'undefined' ? process.env.NODE_ENV : 'browser',
    REACT_APP_SUPABASE_URL: config.url ? 'SET' : 'NOT SET',
    REACT_APP_SUPABASE_ANON_KEY: config.key ? 'SET' : 'NOT SET',
    REACT_APP_API_URL: getApiUrl() !== '/api' ? 'SET' : 'NOT SET'
});

const supabaseUrl = config.url;
const supabaseAnonKey = config.key;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables not set. Please add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your Azure Static Web App environment variables.");
    console.error("Make sure these are set in Azure Portal > Your Static Web App > Configuration > Application settings");
}

// Only create the client if we have valid values
let supabase;
try {
    if (supabaseUrl && supabaseAnonKey) {
        console.log('Creating Supabase client with provided credentials');
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } else {
        console.warn('Creating mock Supabase client - authentication will not work');
        // Create a mock client for development/testing
        supabase = {
            auth: {
                getSession: async () => ({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
                signUp: async () => ({ error: { message: 'Supabase not configured' } }),
                signOut: async () => ({ error: { message: 'Supabase not configured' } }),
                signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
                resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } }),
                signInWithOtp: async () => ({ error: { message: 'Supabase not configured' } }),
                verifyOtp: async () => ({ error: { message: 'Supabase not configured' } })
            }
        };
    }
} catch (error) {
    console.error('Failed to create Supabase client:', error);
    // Create a mock client as fallback
    supabase = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({ error: { message: 'Supabase not configured' } }),
            signUp: async () => ({ error: { message: 'Supabase not configured' } }),
            signOut: async () => ({ error: { message: 'Supabase not configured' } }),
            signInWithOAuth: async () => ({ error: { message: 'Supabase not configured' } }),
            resetPasswordForEmail: async () => ({ error: { message: 'Supabase not configured' } }),
            signInWithOtp: async () => ({ error: { message: 'Supabase not configured' } }),
            verifyOtp: async () => ({ error: { message: 'Supabase not configured' } })
        }
    };
}

export { supabase };