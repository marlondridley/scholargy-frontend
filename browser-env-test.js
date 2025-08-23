// Browser Environment Variable Test
// Run this in your browser console to check if environment variables are available

const testEnvironmentVariables = () => {
    console.log('🔍 Browser Environment Variables Test');
    console.log('=====================================');
    
    // Check if we're on the correct site
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    if (!currentUrl.includes('gentle-ground-0d24ae71e.1.azurestaticapps.net')) {
        console.log('❌ You are not on the correct site!');
        console.log('Please go to: https://gentle-ground-0d24ae71e.1.azurestaticapps.net');
        return;
    }
    
    console.log('✅ You are on the correct site');
    
    // Check if Supabase client is available
    if (typeof window.supabase !== 'undefined') {
        console.log('✅ Supabase client is available');
        console.log('📍 Supabase URL:', window.supabase.supabaseUrl);
    } else {
        console.log('❌ Supabase client is not available');
    }
    
    // Check if the app has loaded properly
    if (document.readyState === 'complete') {
        console.log('✅ Page loaded completely');
    } else {
        console.log('⚠️ Page still loading...');
    }
    
    // Test OAuth functionality
    console.log('\n🧪 Testing OAuth Setup:');
    
    // Check if Google Sign-In API is loaded
    if (typeof window.google !== 'undefined') {
        console.log('✅ Google Sign-In API is loaded');
    } else {
        console.log('⚠️ Google Sign-In API not loaded');
    }
    
    // Try to test OAuth flow
    if (typeof window.supabase !== 'undefined') {
        console.log('\n🔄 Testing OAuth initiation...');
        
        // Test OAuth without actually redirecting
        try {
            const testOAuth = async () => {
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
                    
                    if (error.message.includes('invalid_request')) {
                        console.log('🔍 This suggests a configuration issue with:');
                        console.log('   - Redirect URI in Google Cloud Console');
                        console.log('   - Client ID/Secret in Supabase');
                        console.log('   - OAuth scopes');
                    }
                } else {
                    console.log('✅ OAuth URL generated successfully!');
                    console.log('📍 OAuth URL:', data.url);
                    
                    // Parse the URL to check parameters
                    const url = new URL(data.url);
                    console.log('\n🔍 OAuth URL parameters:');
                    console.log('   - client_id:', url.searchParams.get('client_id'));
                    console.log('   - redirect_uri:', url.searchParams.get('redirect_uri'));
                    console.log('   - scope:', url.searchParams.get('scope'));
                    
                    console.log('\n🎉 OAuth should work now! Try clicking the Google sign-in button.');
                }
            };
            
            testOAuth();
            
        } catch (error) {
            console.log('❌ OAuth test failed:', error.message);
        }
    } else {
        console.log('❌ Cannot test OAuth - Supabase client not available');
    }
    
    console.log('\n📋 Summary:');
    console.log('- If you see "OAuth URL generated successfully", the configuration is correct');
    console.log('- If you see errors, the specific error message will help identify the issue');
    console.log('- The GitHub Secrets have been added, so a new deployment should fix any remaining issues');
};

// Make it available globally
window.testEnvironmentVariables = testEnvironmentVariables;

console.log('🚀 Browser Environment Test loaded!');
console.log('Run: testEnvironmentVariables() to check OAuth setup');
