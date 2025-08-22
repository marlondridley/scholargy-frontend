// src/utils/envTest.js
// Utility to test environment variables

export const testEnvironmentVariables = () => {
    console.log('=== Environment Variables Test ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'NOT SET');
    console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
    console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL ? 'SET' : 'NOT SET');
    
    if (process.env.REACT_APP_SUPABASE_URL) {
        console.log('Supabase URL length:', process.env.REACT_APP_SUPABASE_URL.length);
    }
    if (process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.log('Supabase Key length:', process.env.REACT_APP_SUPABASE_ANON_KEY.length);
    }
    console.log('================================');
};
