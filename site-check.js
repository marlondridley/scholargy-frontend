// Site Check - Run this first to verify you're on the correct site
// Copy and paste this into your browser console

const siteCheck = () => {
    console.log('🔍 Site Check');
    console.log('============');
    
    const currentUrl = window.location.href;
    const expectedUrl = 'https://gentle-ground-0d24ae71e.1.azurestaticapps.net';
    
    console.log('📍 Current URL:', currentUrl);
    console.log('📍 Expected URL:', expectedUrl);
    
    if (currentUrl.includes('gentle-ground-0d24ae71e.1.azurestaticapps.net')) {
        console.log('✅ You are on the correct site!');
        console.log('Now you can run the OAuth diagnostic.');
        
        // Check if environment variables are available
        const hasEnvVars = window.process?.env?.REACT_APP_SUPABASE_URL;
        console.log('Environment variables available:', hasEnvVars ? '✅ Yes' : '❌ No');
        
        // Check if Supabase client is available
        const hasSupabase = typeof window.supabase !== 'undefined';
        console.log('Supabase client available:', hasSupabase ? '✅ Yes' : '❌ No');
        
        if (hasEnvVars && hasSupabase) {
            console.log('\n🎉 Ready to test OAuth! Run: enhancedOAuthDiagnostic.runDiagnostics()');
        } else {
            console.log('\n⚠️ Missing configuration. Check environment variables and Supabase setup.');
        }
    } else {
        console.log('❌ You are NOT on the correct site!');
        console.log('Please go to: https://gentle-ground-0d24ae71e.1.azurestaticapps.net');
        console.log('Then run this check again.');
    }
};

// Make it available globally
window.siteCheck = siteCheck;

console.log('🚀 Site Check loaded!');
console.log('Run: siteCheck() to verify you are on the correct site');
