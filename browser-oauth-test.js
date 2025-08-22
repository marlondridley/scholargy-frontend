// Browser-based OAuth Flow Test
// Run this in the browser console to test the OAuth flow

const browserOAuthTest = {
    results: {
        environment: false,
        supabase: false,
        oauth: false,
        callback: false
    },

    async runAllTests() {
        console.log('🧪 Starting Browser OAuth Flow Tests...\n');
        
        await this.testEnvironmentVariables();
        await this.testSupabaseConnection();
        await this.testOAuthFlow();
        await this.testCallbackRoute();
        
        this.generateReport();
    },

    testEnvironmentVariables() {
        console.log('1️⃣ Testing Environment Variables...');
        
        const requiredVars = [
            'REACT_APP_SUPABASE_URL',
            'REACT_APP_SUPABASE_ANON_KEY',
            'REACT_APP_API_URL',
            'REACT_APP_GOOGLE_CLIENT_ID'
        ];

        const missingVars = requiredVars.filter(varName => !window.process?.env?.[varName]);
        
        if (missingVars.length > 0) {
            console.error('❌ Missing environment variables:', missingVars);
            this.results.environment = false;
        } else {
            console.log('✅ All environment variables are set');
            this.results.environment = true;
        }
        console.log('');
    },

    async testSupabaseConnection() {
        console.log('2️⃣ Testing Supabase Connection...');
        
        try {
            // Check if Supabase client is available
            if (typeof window.supabase === 'undefined') {
                console.error('❌ Supabase client not found');
                this.results.supabase = false;
                return;
            }

            const { data, error } = await window.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Supabase connection error:', error.message);
                this.results.supabase = false;
            } else {
                console.log('✅ Supabase connection successful');
                this.results.supabase = true;
            }
        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message);
            this.results.supabase = false;
        }
        console.log('');
    },

    async testOAuthFlow() {
        console.log('3️⃣ Testing OAuth Flow...');
        
        try {
            // Test if we can initiate OAuth
            const { data, error } = await window.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                console.error('❌ OAuth initiation failed:', error.message);
                this.results.oauth = false;
            } else {
                console.log('✅ OAuth flow initiated successfully');
                console.log('   Redirect URL:', data.url);
                this.results.oauth = true;
            }
        } catch (error) {
            console.error('❌ OAuth test error:', error.message);
            this.results.oauth = false;
        }
        console.log('');
    },

    async testCallbackRoute() {
        console.log('4️⃣ Testing Callback Route...');
        
        try {
            // Test if the callback route is accessible
            const response = await fetch('/auth/callback', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 404) {
                console.error('❌ Callback route returns 404');
                this.results.callback = false;
            } else {
                console.log('✅ Callback route is accessible');
                console.log('   Status:', response.status);
                this.results.callback = true;
            }
        } catch (error) {
            console.error('❌ Callback route test failed:', error.message);
            this.results.callback = false;
        }
        console.log('');
    },

    generateReport() {
        console.log('📊 Test Results Summary:');
        console.log('========================');
        
        Object.entries(this.results).forEach(([test, passed]) => {
            const status = passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${test}: ${status}`);
        });

        const allPassed = Object.values(this.results).every(result => result);
        
        if (allPassed) {
            console.log('\n🎉 All tests passed! OAuth system is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Check the issues above.');
            
            if (!this.results.callback) {
                console.log('\n🔧 Callback Route Issue:');
                console.log('- The /auth/callback route is returning 404');
                console.log('- This is likely a routing configuration issue');
                console.log('- Check staticwebapp.config.json configuration');
            }
        }

        return allPassed;
    }
};

// Make it available globally
window.browserOAuthTest = browserOAuthTest;

console.log('🚀 Browser OAuth Test loaded!');
console.log('Run: browserOAuthTest.runAllTests() to start testing');
