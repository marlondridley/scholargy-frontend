// OAuth Diagnostic Script
// Run this in the browser console to diagnose OAuth issues

const oauthDiagnostic = {
    async runDiagnostics() {
        console.log('🔍 OAuth Configuration Diagnostic');
        console.log('================================');
        
        await this.checkEnvironmentVariables();
        await this.checkSupabaseConfiguration();
        await this.checkGoogleOAuthSetup();
        await this.testOAuthFlow();
        
        this.generateRecommendations();
    },

    async checkEnvironmentVariables() {
        console.log('\n1️⃣ Environment Variables Check:');
        
        const requiredVars = [
            'REACT_APP_SUPABASE_URL',
            'REACT_APP_SUPABASE_ANON_KEY',
            'REACT_APP_GOOGLE_CLIENT_ID'
        ];

        requiredVars.forEach(varName => {
            const value = window.process?.env?.[varName];
            if (value) {
                console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
            } else {
                console.log(`❌ ${varName}: Missing`);
            }
        });
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
                
                // Check for specific error types
                if (error.message.includes('invalid_request')) {
                    console.log('🔍 This suggests a configuration issue with:');
                    console.log('   - Redirect URI in Google Cloud Console');
                    console.log('   - Client ID/Secret in Supabase');
                    console.log('   - OAuth scopes');
                }
            } else {
                console.log('✅ OAuth URL generated successfully');
                console.log('📍 OAuth URL:', data.url);
            }
        } catch (error) {
            console.log('❌ OAuth test failed:', error.message);
        }
    },

    generateRecommendations() {
        console.log('\n📋 Recommendations:');
        console.log('===================');
        
        console.log('\n🔧 Google Cloud Console Setup:');
        console.log('1. Go to Google Cloud Console > APIs & Services > Credentials');
        console.log('2. Edit your OAuth 2.0 Client ID');
        console.log('3. Add these Authorized redirect URIs:');
        console.log(`   - ${window.location.origin}/auth/callback`);
        console.log(`   - https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback`);
        console.log('4. Make sure the Client ID matches REACT_APP_GOOGLE_CLIENT_ID');
        
        console.log('\n🔧 Supabase Configuration:');
        console.log('1. Go to Supabase Dashboard > Authentication > Providers');
        console.log('2. Enable Google provider');
        console.log('3. Add your Google Client ID and Client Secret');
        console.log('4. Set Redirect URL to: /auth/callback');
        
        console.log('\n🔧 Environment Variables:');
        console.log('1. Verify REACT_APP_GOOGLE_CLIENT_ID is set correctly');
        console.log('2. Verify REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
        console.log('3. Redeploy after making changes');
        
        console.log('\n🔧 Common Issues:');
        console.log('- Redirect URI mismatch between Google Cloud and Supabase');
        console.log('- Missing or incorrect Client Secret in Supabase');
        console.log('- OAuth scopes not properly configured');
        console.log('- Environment variables not set in Azure Static Web Apps');
    }
};

// Make it available globally
window.oauthDiagnostic = oauthDiagnostic;

console.log('🚀 OAuth Diagnostic loaded!');
console.log('Run: oauthDiagnostic.runDiagnostics() to start diagnostics');
