// src/utils/supabase.js
import { createClient } from '@supabase/supabase-js';

// Debug environment variables
console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET',
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL ? 'SET' : 'NOT SET'
});

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

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