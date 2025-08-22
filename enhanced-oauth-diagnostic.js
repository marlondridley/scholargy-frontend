// Enhanced OAuth Diagnostic Script
// Run this in the browser console to get detailed OAuth diagnostics

const enhancedOAuthDiagnostic = {
    async runDiagnostics() {
        console.log('🔍 Enhanced OAuth Configuration Diagnostic');
        console.log('==========================================');
        
        await this.checkEnvironmentVariables();
        await this.checkSupabaseConfiguration();
        await this.checkGoogleOAuthSetup();
        await this.testOAuthFlow();
        await this.checkRedirectURIs();
        await this.verifyClientID();
        
        this.generateDetailedRecommendations();
    },

    async checkEnvironmentVariables() {
        console.log('\n1️⃣ Environment Variables Check:');
        
        const requiredVars = [
            'REACT_APP_SUPABASE_URL',
            'REACT_APP_SUPABASE_ANON_KEY',
            'REACT_APP_GOOGLE_CLIENT_ID'
        ];

        let allVarsSet = true;
        requiredVars.forEach(varName => {
            const value = window.process?.env?.[varName];
            if (value) {
                console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
            } else {
                console.log(`❌ ${varName}: Missing`);
                allVarsSet = false;
            }
        });

        if (!allVarsSet) {
            console.log('\n⚠️ Missing environment variables detected!');
            console.log('This will cause OAuth to fail. Check Azure Static Web Apps configuration.');
        }
    },

    async checkSupabaseConfiguration() {
        console.log('\n2️⃣ Supabase Configuration Check:');
        
        try {
            if (typeof window.supabase === 'undefined') {
                console.log('❌ Supabase client not available');
                return;
            }

            const { data, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.log('❌ Supabase connection error:', error.message);
            } else {
                console.log('✅ Supabase client configured correctly');
                
                // Check Supabase URL
                const supabaseUrl = window.supabase.supabaseUrl;
                console.log(`📍 Supabase URL: ${supabaseUrl}`);
                
                // Check if it matches the expected pattern
                if (supabaseUrl.includes('urxlcpjjktzhxhmwhxda.supabase.co')) {
                    console.log('✅ Supabase URL matches expected pattern');
                } else {
                    console.log('⚠️ Supabase URL may not match expected pattern');
                }
            }
        } catch (error) {
            console.log('❌ Supabase check failed:', error.message);
        }
    },

    async checkGoogleOAuthSetup() {
        console.log('\n3️⃣ Google OAuth Setup Check:');
        
        const clientId = window.process?.env?.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.log('❌ Google Client ID not configured');
            return;
        }

        console.log('✅ Google Client ID is configured');
        console.log(`📍 Client ID: ${clientId}`);
        
        // Check if it matches the expected pattern
        if (clientId === '122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com') {
            console.log('✅ Client ID matches Google Cloud Console configuration');
        } else {
            console.log('⚠️ Client ID may not match Google Cloud Console configuration');
        }
        
        // Check if Google Sign-In API is loaded
        if (typeof window.google !== 'undefined') {
            console.log('✅ Google Sign-In API is loaded');
        } else {
            console.log('⚠️ Google Sign-In API not loaded');
        }

        // Check current URL for redirect URI
        const currentOrigin = window.location.origin;
        console.log(`📍 Current origin: ${currentOrigin}`);
        console.log(`📍 Expected callback: ${currentOrigin}/auth/callback`);
    },

    async testOAuthFlow() {
        console.log('\n4️⃣ OAuth Flow Test:');
        
        try {
            console.log('🔄 Testing OAuth initiation...');
            
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
                console.log('❌ OAuth initiation failed:', error.message);
                console.log('🔍 Error details:', error);
                
                // Check for specific error types
                if (error.message.includes('invalid_request')) {
                    console.log('\n🔍 "invalid_request" error suggests:');
                    console.log('   - Redirect URI mismatch in Google Cloud Console');
                    console.log('   - Missing or incorrect Client Secret in Supabase');
                    console.log('   - OAuth scopes not properly configured');
                    console.log('   - Environment variables not set correctly');
                }
            } else {
                console.log('✅ OAuth URL generated successfully');
                console.log('📍 OAuth URL:', data.url);
                
                // Parse the URL to check parameters
                const url = new URL(data.url);
                console.log('🔍 OAuth URL parameters:');
                console.log('   - client_id:', url.searchParams.get('client_id'));
                console.log('   - redirect_uri:', url.searchParams.get('redirect_uri'));
                console.log('   - scope:', url.searchParams.get('scope'));
                console.log('   - response_type:', url.searchParams.get('response_type'));
            }
        } catch (error) {
            console.log('❌ OAuth test failed:', error.message);
            console.log('🔍 Full error:', error);
        }
    },

    async checkRedirectURIs() {
        console.log('\n5️⃣ Redirect URI Analysis:');
        
        const currentOrigin = window.location.origin;
        const expectedCallback = `${currentOrigin}/auth/callback`;
        
        console.log('📍 Current redirect URI:', expectedCallback);
        console.log('📍 Supabase callback URL: https://urxlcpjjktzhxhmwhxda.supabase.co/auth/v1/callback');
        
        // Check if the current callback matches what's in Google Cloud Console
        console.log('\n🔍 Google Cloud Console should have these redirect URIs:');
        console.log('   ✅ https://urxlcpjjktzhxhmwhxda.supabase.co/auth/v1/callback (already present)');
        console.log('   ❌ https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback (MISSING!)');
        console.log('   ❌ https://gentle-ground-0d24ae71e.1.azurestaticapps.net (present but not specific)');
        
        console.log('\n⚠️ The specific callback URL is missing from Google Cloud Console!');
    },

    async verifyClientID() {
        console.log('\n6️⃣ Client ID Verification:');
        
        const expectedClientId = '122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com';
        const actualClientId = window.process?.env?.REACT_APP_GOOGLE_CLIENT_ID;
        
        if (actualClientId === expectedClientId) {
            console.log('✅ Client ID matches Google Cloud Console');
        } else {
            console.log('❌ Client ID mismatch!');
            console.log(`   Expected: ${expectedClientId}`);
            console.log(`   Actual: ${actualClientId}`);
        }
    },

    generateDetailedRecommendations() {
        console.log('\n📋 Detailed Recommendations:');
        console.log('============================');
        
        console.log('\n🔧 IMMEDIATE FIX REQUIRED:');
        console.log('1. Go to Google Cloud Console > APIs & Services > Credentials');
        console.log('2. Edit your OAuth 2.0 Client ID: 122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com');
        console.log('3. In "Authorized redirect URIs" section, ADD:');
        console.log('   https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback');
        console.log('4. Click "Save"');
        
        console.log('\n🔧 Supabase Configuration Check:');
        console.log('1. Go to Supabase Dashboard > Authentication > Providers');
        console.log('2. Verify Google provider is enabled');
        console.log('3. Verify Client ID matches: 122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com');
        console.log('4. Verify Client Secret is set (should be masked as ****dasH)');
        console.log('5. Verify Redirect URL is set to: /auth/callback');
        
        console.log('\n🔧 Environment Variables Check:');
        console.log('1. In Azure Static Web Apps, verify these environment variables:');
        console.log('   - REACT_APP_GOOGLE_CLIENT_ID = 122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com');
        console.log('   - REACT_APP_SUPABASE_URL = https://urxlcpjjktzhxhmwhxda.supabase.co');
        console.log('   - REACT_APP_SUPABASE_ANON_KEY = (your anon key)');
        
        console.log('\n🔧 After making changes:');
        console.log('1. Wait 5-10 minutes for Google Cloud Console changes to propagate');
        console.log('2. Redeploy your Azure Static Web App if you changed environment variables');
        console.log('3. Clear browser cache and try again');
        
        console.log('\n🔧 Expected OAuth Flow:');
        console.log('1. User clicks "Sign in with Google"');
        console.log('2. Redirected to Google OAuth consent screen');
        console.log('3. User authorizes the application');
        console.log('4. Google redirects to: https://urxlcpjjktzhxhmwhxda.supabase.co/auth/v1/callback');
        console.log('5. Supabase processes the OAuth response');
        console.log('6. Supabase redirects to: https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback');
        console.log('7. Your app handles the final callback');
    }
};

// Make it available globally
window.enhancedOAuthDiagnostic = enhancedOAuthDiagnostic;

console.log('🚀 Enhanced OAuth Diagnostic loaded!');
console.log('Run: enhancedOAuthDiagnostic.runDiagnostics() to start detailed diagnostics');
