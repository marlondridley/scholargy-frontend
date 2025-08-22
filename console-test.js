// Simple OAuth Test for Browser Console
// Copy and paste this entire script into your browser console

(async function() {
    console.log('🧪 Quick OAuth Flow Test...\n');
    
    // Test 1: Environment Variables
    console.log('1️⃣ Environment Variables:');
    const envVars = ['REACT_APP_SUPABASE_URL', 'REACT_APP_SUPABASE_ANON_KEY', 'REACT_APP_API_URL', 'REACT_APP_GOOGLE_CLIENT_ID'];
    const missingVars = envVars.filter(varName => !window.process?.env?.[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing:', missingVars);
    } else {
        console.log('✅ All environment variables set');
    }
    
    // Test 2: Supabase Client
    console.log('\n2️⃣ Supabase Client:');
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase client not found');
    } else {
        console.log('✅ Supabase client available');
    }
    
    // Test 3: Callback Route
    console.log('\n3️⃣ Callback Route Test:');
    try {
        const response = await fetch('/auth/callback');
        console.log(`✅ Callback route status: ${response.status}`);
    } catch (error) {
        console.error('❌ Callback route error:', error.message);
    }
    
    // Test 4: Current URL
    console.log('\n4️⃣ Current URL:');
    console.log('📍', window.location.href);
    
    // Test 5: OAuth Initiation
    console.log('\n5️⃣ OAuth Initiation Test:');
    if (typeof window.supabase !== 'undefined') {
        try {
            const { data, error } = await window.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            
            if (error) {
                console.error('❌ OAuth error:', error.message);
            } else {
                console.log('✅ OAuth URL generated:', data.url);
            }
        } catch (error) {
            console.error('❌ OAuth test failed:', error.message);
        }
    }
    
    console.log('\n🎯 Test completed!');
})();
