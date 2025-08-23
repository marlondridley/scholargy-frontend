// Comprehensive OAuth Troubleshooting Script
// Run this in your browser console to identify all issues

const troubleshootOAuth = {
    async runFullDiagnostic() {
        console.log('🔍 Comprehensive OAuth Troubleshooting');
        console.log('=====================================');
        
        await this.checkSiteStatus();
        await this.checkEnvironmentVariables();
        await this.checkSupabaseConnection();
        await this.checkGoogleOAuthSetup();
        await this.testNetworkConnections();
        await this.checkConsoleErrors();
        
        this.generateActionPlan();
    },

    async checkSiteStatus() {
        console.log('\n1️⃣ Site Status Check:');
        
        const currentUrl = window.location.href;
        const expectedUrl = 'https://gentle-ground-0d24ae71e.1.azurestaticapps.net';
        
        console.log('📍 Current URL:', currentUrl);
        console.log('📍 Expected URL:', expectedUrl);
        
        if (currentUrl.includes('gentle-ground-0d24ae71e.1.azurestaticapps.net')) {
            console.log('✅ You are on the correct site');
        } else {
            console.log('❌ You are NOT on the correct site!');
            console.log('Please navigate to: https://gentle-ground-0d24ae71e.1.azurestaticapps.net');
            return false;
        }
        
        // Check if the page loaded properly
        if (document.readyState === 'complete') {
            console.log('✅ Page loaded completely');
        } else {
            console.log('⚠️ Page still loading...');
        }
        
        return true;
    },

    async checkEnvironmentVariables() {
        console.log('\n2️⃣ Environment Variables Check:');
        
        const requiredVars = [
            'REACT_APP_SUPABASE_URL',
            'REACT_APP_SUPABASE_ANON_KEY',
            'REACT_APP_GOOGLE_CLIENT_ID',
            'REACT_APP_API_URL'
        ];

        let allPresent = true;
        requiredVars.forEach(varName => {
            const value = window.process?.env?.[varName];
            if (value) {
                console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
            } else {
                console.log(`❌ ${varName}: Missing`);
                allPresent = false;
            }
        });

        if (!allPresent) {
            console.log('\n⚠️ Missing environment variables!');
            console.log('This will cause OAuth to fail completely.');
            console.log('The app needs to be redeployed with proper environment variables.');
        }
        
        return allPresent;
    },

    async checkSupabaseConnection() {
        console.log('\n3️⃣ Supabase Connection Check:');
        
        if (typeof window.supabase === 'undefined') {
            console.log('❌ Supabase client not available');
            console.log('This means the app failed to initialize properly.');
            return false;
        }

        try {
            console.log('✅ Supabase client available');
            console.log('📍 Supabase URL:', window.supabase.supabaseUrl);
            
            // Test basic connection
            const { data, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.log('❌ Supabase connection error:', error.message);
                return false;
            } else {
                console.log('✅ Supabase connection successful');
                return true;
            }
        } catch (error) {
            console.log('❌ Supabase test failed:', error.message);
            return false;
        }
    },

    async checkGoogleOAuthSetup() {
        console.log('\n4️⃣ Google OAuth Setup Check:');
        
        const clientId = window.process?.env?.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.log('❌ Google Client ID not configured');
            return false;
        }

        console.log('✅ Google Client ID configured');
        console.log('📍 Client ID:', clientId);
        
        // Check if it matches expected value
        const expectedClientId = '122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com';
        if (clientId === expectedClientId) {
            console.log('✅ Client ID matches Google Cloud Console');
        } else {
            console.log('⚠️ Client ID may not match Google Cloud Console');
        }
        
        // Check if Google Sign-In API is loaded
        if (typeof window.google !== 'undefined') {
            console.log('✅ Google Sign-In API loaded');
        } else {
            console.log('⚠️ Google Sign-In API not loaded');
        }
        
        return true;
    },

    async testNetworkConnections() {
        console.log('\n5️⃣ Network Connection Tests:');
        
        const endpoints = [
            'https://urxlcpjjktzhxhmwhxda.supabase.co',
            'https://gentle-ground-0d24ae71e.1.azurestaticapps.net',
            'https://accounts.google.com'
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint, { method: 'HEAD' });
                console.log(`✅ ${endpoint}: ${response.status}`);
            } catch (error) {
                console.log(`❌ ${endpoint}: ${error.message}`);
            }
        }
    },

    async checkConsoleErrors() {
        console.log('\n6️⃣ Console Error Analysis:');
        
        // Check for common error patterns
        const errorPatterns = [
            'Could not establish connection',
            'Receiving end does not exist',
            '404',
            'Failed to load resource',
            'OAuth',
            'Supabase'
        ];
        
        console.log('🔍 Common error patterns to look for:');
        errorPatterns.forEach(pattern => {
            console.log(`   - ${pattern}`);
        });
        
        console.log('\n📋 Check the browser console for these specific errors:');
        console.log('   - "Could not establish connection" - Usually a browser extension issue');
        console.log('   - "404" - Missing resources or routes');
        console.log('   - "OAuth" - Authentication configuration issues');
        console.log('   - "Supabase" - Database connection issues');
    },

    generateActionPlan() {
        console.log('\n📋 Action Plan:');
        console.log('==============');
        
        console.log('\n🔧 Immediate Actions:');
        console.log('1. Clear browser cache and cookies');
        console.log('2. Disable browser extensions temporarily');
        console.log('3. Try incognito/private browsing mode');
        console.log('4. Check if the site loads without JavaScript errors');
        
        console.log('\n🔧 If environment variables are missing:');
        console.log('1. Verify GitHub Secrets are set correctly');
        console.log('2. Trigger a new deployment from GitHub');
        console.log('3. Wait for deployment to complete');
        console.log('4. Clear browser cache after deployment');
        
        console.log('\n🔧 If Supabase connection fails:');
        console.log('1. Check Supabase project status');
        console.log('2. Verify API keys are correct');
        console.log('3. Check if Supabase service is down');
        
        console.log('\n🔧 If Google OAuth fails:');
        console.log('1. Verify Google Cloud Console configuration');
        console.log('2. Check redirect URIs are correct');
        console.log('3. Ensure Client ID and Secret are set in Supabase');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Run this diagnostic again after making changes');
        console.log('2. Test OAuth flow step by step');
        console.log('3. Check browser network tab for failed requests');
    }
};

// Make it available globally
window.troubleshootOAuth = troubleshootOAuth;

console.log('🚀 OAuth Troubleshooting loaded!');
console.log('Run: troubleshootOAuth.runFullDiagnostic() to start comprehensive diagnostics');
