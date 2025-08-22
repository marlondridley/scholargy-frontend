// Quick OAuth Test - Copy and paste this entire script into browser console
// Then run: quickOAuthTest()

const quickOAuthTest = async () => {
    console.log('🔍 Quick OAuth Test Starting...');
    console.log('================================');
    
    // Check environment variables
    console.log('\n1️⃣ Environment Variables:');
    const clientId = window.process?.env?.REACT_APP_GOOGLE_CLIENT_ID;
    const supabaseUrl = window.process?.env?.REACT_APP_SUPABASE_URL;
    const supabaseKey = window.process?.env?.REACT_APP_SUPABASE_ANON_KEY;
    
    console.log('Client ID:', clientId ? '✅ Set' : '❌ Missing');
    console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');
    
    // Check Supabase client
    console.log('\n2️⃣ Supabase Client:');
    if (typeof window.supabase !== 'undefined') {
        console.log('✅ Supabase client available');
        console.log('URL:', window.supabase.supabaseUrl);
    } else {
        console.log('❌ Supabase client not available');
        return;
    }
    
    // Test OAuth flow
    console.log('\n3️⃣ Testing OAuth Flow:');
    try {
        const { data, error } = await window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                    scope: 'email profile openid'
                }
            }
        });
        
        if (error) {
            console.log('❌ OAuth Error:', error.message);
            console.log('Full error:', error);
        } else {
            console.log('✅ OAuth URL generated successfully!');
            console.log('URL:', data.url);
            
            // Parse URL parameters
            const url = new URL(data.url);
            console.log('\n🔍 OAuth Parameters:');
            console.log('Client ID:', url.searchParams.get('client_id'));
            console.log('Redirect URI:', url.searchParams.get('redirect_uri'));
            console.log('Scope:', url.searchParams.get('scope'));
            
            console.log('\n🎉 OAuth should work now! Try clicking the Google sign-in button.');
        }
    } catch (error) {
        console.log('❌ OAuth test failed:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('- If you see "OAuth URL generated successfully", the configuration is correct');
    console.log('- If you see errors, check the specific error message above');
    console.log('- Wait 5-10 minutes after making Google Cloud Console changes');
};

// Make it available globally
window.quickOAuthTest = quickOAuthTest;

console.log('🚀 Quick OAuth Test loaded!');
console.log('Run: quickOAuthTest() to test OAuth configuration');
