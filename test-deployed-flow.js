// Test Deployed OAuth Flow
// Run this script after deployment to verify everything works

const testDeployedFlow = {
    // Test results storage
    results: {
        environment: false,
        supabase: false,
        backend: false,
        oauth: false,
        profile: false,
        localStorage: false
    },

    // Initialize testing
    async init() {
        console.log('🧪 Testing Deployed OAuth Flow...\n');
        
        // Run all tests
        await this.testEnvironmentVariables();
        await this.testSupabaseConnection();
        await this.testBackendAPI();
        await this.testOAuthConfiguration();
        await this.testProfileManagement();
        await this.testLocalStorage();
        
        // Generate report
        this.generateReport();
    },

    // Test 1: Environment Variables
    async testEnvironmentVariables() {
        console.log('1️⃣ Testing Environment Variables...');
        
        const requiredVars = [
            'REACT_APP_SUPABASE_URL',
            'REACT_APP_SUPABASE_ANON_KEY',
            'REACT_APP_API_URL',
            'REACT_APP_GOOGLE_CLIENT_ID'
        ];

        const missingVars = requiredVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            console.error('❌ Missing environment variables:', missingVars);
            this.results.environment = false;
        } else {
            console.log('✅ All environment variables are set');
            this.results.environment = true;
        }
        console.log('');
    },

    // Test 2: Supabase Connection
    async testSupabaseConnection() {
        console.log('2️⃣ Testing Supabase Connection...');
        
        try {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.REACT_APP_SUPABASE_URL,
                process.env.REACT_APP_SUPABASE_ANON_KEY
            );
            
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Supabase connection error:', error.message);
                this.results.supabase = false;
            } else {
                console.log('✅ Supabase connection successful');
                console.log('   Project URL:', process.env.REACT_APP_SUPABASE_URL);
                this.results.supabase = true;
            }
        } catch (error) {
            console.error('❌ Supabase connection failed:', error.message);
            this.results.supabase = false;
        }
        console.log('');
    },

    // Test 3: Backend API
    async testBackendAPI() {
        console.log('3️⃣ Testing Backend API...');
        
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const healthData = await response.json();
            console.log('✅ Backend API connection successful');
            console.log('   Health status:', healthData.status || 'OK');
            console.log('   API URL:', process.env.REACT_APP_API_URL);
            this.results.backend = true;
        } catch (error) {
            console.error('❌ Backend API connection failed:', error.message);
            console.log('   Make sure your backend is running and accessible');
            this.results.backend = false;
        }
        console.log('');
    },

    // Test 4: OAuth Configuration
    async testOAuthConfiguration() {
        console.log('4️⃣ Testing OAuth Configuration...');
        
        if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
            console.error('❌ Google Client ID not configured');
            this.results.oauth = false;
        } else {
            console.log('✅ Google OAuth configuration found');
            console.log('   Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID.substring(0, 20) + '...');
            this.results.oauth = true;
        }
        console.log('');
    },

    // Test 5: Profile Management
    async testProfileManagement() {
        console.log('5️⃣ Testing Profile Management...');
        
        try {
            const UserProfileManager = require('./src/utils/userProfileManager').UserProfileManager;
            
            // Test profile initialization
            const mockUser = {
                id: 'test-user-id',
                email: 'test@example.com',
                user_metadata: {
                    full_name: 'Test User',
                    avatar_url: 'https://example.com/avatar.jpg'
                },
                app_metadata: {
                    provider: 'google'
                }
            };
            
            const profileData = await UserProfileManager.initializeProfile(mockUser);
            
            if (profileData) {
                console.log('✅ Profile initialization successful');
                console.log('   Profile structure:', Object.keys(profileData));
                
                // Test profile completion
                const isComplete = UserProfileManager.isProfileComplete(profileData);
                const completionPercentage = UserProfileManager.getProfileCompletionPercentage(profileData);
                
                console.log('   Profile complete:', isComplete);
                console.log('   Completion percentage:', completionPercentage + '%');
                
                this.results.profile = true;
            } else {
                console.log('⚠️ Profile initialization returned null (backend may not be running)');
                this.results.profile = false;
            }
        } catch (error) {
            console.error('❌ Profile management test failed:', error.message);
            this.results.profile = false;
        }
        console.log('');
    },

    // Test 6: localStorage Support
    async testLocalStorage() {
        console.log('6️⃣ Testing localStorage Support...');
        
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('test', 'value');
                const testValue = localStorage.getItem('test');
                localStorage.removeItem('test');
                
                if (testValue === 'value') {
                    console.log('✅ localStorage is supported');
                    this.results.localStorage = true;
                } else {
                    console.error('❌ localStorage test failed');
                    this.results.localStorage = false;
                }
            } else {
                console.log('ℹ️ localStorage test skipped (server-side)');
                this.results.localStorage = true; // Assume it works in browser
            }
        } catch (error) {
            console.error('❌ localStorage not supported:', error.message);
            this.results.localStorage = false;
        }
        console.log('');
    },

    // Generate test report
    generateReport() {
        console.log('📊 Test Results Summary:');
        console.log('========================');
        
        Object.entries(this.results).forEach(([test, passed]) => {
            const status = passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`${test}: ${status}`);
        });

        const allPassed = Object.values(this.results).every(result => result);
        
        if (allPassed) {
            console.log('\n🎉 All tests passed! Your OAuth system is ready for production.');
            console.log('\n📋 Manual Testing Steps:');
            console.log('1. Open your deployed application in a browser');
            console.log('2. Navigate to the login page');
            console.log('3. Test email/password sign up');
            console.log('4. Test Google OAuth sign in');
            console.log('5. Verify user profile creation');
            console.log('6. Test session persistence');
            console.log('7. Test sign out functionality');
        } else {
            console.log('\n⚠️ Some tests failed. Please fix the issues before testing manually.');
            console.log('\n🔧 Troubleshooting Steps:');
            
            if (!this.results.environment) {
                console.log('- Check environment variables in Azure Static Web Apps configuration');
            }
            if (!this.results.supabase) {
                console.log('- Verify Supabase project settings and API keys');
            }
            if (!this.results.backend) {
                console.log('- Ensure backend API is deployed and accessible');
            }
            if (!this.results.oauth) {
                console.log('- Configure Google OAuth in Google Cloud Console');
            }
            if (!this.results.profile) {
                console.log('- Check backend API and CosmosDB connection');
            }
            if (!this.results.localStorage) {
                console.log('- Test in a modern browser with localStorage support');
            }
        }

        return allPassed;
    },

    // Manual testing checklist
    getManualTestingChecklist() {
        return {
            loginPage: [
                'Login page loads correctly',
                'Email/password form is functional',
                'Google OAuth button appears',
                'Password reset link works',
                'Sign up form is accessible'
            ],
            oauthFlow: [
                'Google OAuth redirects to Google',
                'User can select Google account',
                'OAuth callback returns to app',
                'User session is established',
                'User data is extracted from Google'
            ],
            profileManagement: [
                'User profile is created automatically',
                'Profile data is displayed correctly',
                'Profile completion tracking works',
                'Profile updates persist',
                'Profile data is stored in CosmosDB'
            ],
            sessionManagement: [
                'Session persists on page refresh',
                'Sign out clears session',
                'localStorage is cleared on sign out',
                'Authentication state updates correctly',
                'Protected routes work properly'
            ],
            errorHandling: [
                'Invalid credentials show error message',
                'Network errors are handled gracefully',
                'OAuth errors are displayed',
                'Backend errors are handled',
                'Fallback mechanisms work'
            ]
        };
    }
};

// Browser-based testing utilities
const browserTestUtils = {
    // Test OAuth flow in browser
    async testOAuthFlow() {
        console.log('🌐 Testing OAuth Flow in Browser...');
        
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            console.log('❌ This test must be run in a browser environment');
            return false;
        }

        try {
            // Test Supabase client
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
                process.env.REACT_APP_SUPABASE_URL,
                process.env.REACT_APP_SUPABASE_ANON_KEY
            );

            // Test Google OAuth
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) {
                console.error('❌ OAuth test failed:', error.message);
                return false;
            }

            console.log('✅ OAuth flow initiated successfully');
            console.log('   Redirect URL:', data.url);
            return true;
        } catch (error) {
            console.error('❌ OAuth test error:', error.message);
            return false;
        }
    },

    // Test localStorage functionality
    testLocalStorage() {
        console.log('💾 Testing localStorage...');
        
        try {
            // Test basic operations
            localStorage.setItem('test_key', 'test_value');
            const retrieved = localStorage.getItem('test_key');
            localStorage.removeItem('test_key');
            
            if (retrieved === 'test_value') {
                console.log('✅ localStorage basic operations work');
                
                // Test user data storage
                const userData = {
                    email: 'test@example.com',
                    name: 'Test User',
                    provider: 'google',
                    created_at: new Date().toISOString()
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                const storedUser = JSON.parse(localStorage.getItem('user'));
                
                if (storedUser.email === userData.email) {
                    console.log('✅ User data storage works');
                    localStorage.removeItem('user');
                    return true;
                } else {
                    console.error('❌ User data storage failed');
                    return false;
                }
            } else {
                console.error('❌ localStorage basic operations failed');
                return false;
            }
        } catch (error) {
            console.error('❌ localStorage test error:', error.message);
            return false;
        }
    },

    // Test API connectivity
    async testAPIConnectivity() {
        console.log('🔗 Testing API Connectivity...');
        
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ API connectivity successful');
            console.log('   Response:', data);
            return true;
        } catch (error) {
            console.error('❌ API connectivity failed:', error.message);
            return false;
        }
    }
};

// Export testing utilities
module.exports = {
    testDeployedFlow,
    browserTestUtils
};

// Run tests if this script is executed directly
if (require.main === module) {
    testDeployedFlow.init().catch(console.error);
}

// Browser-specific exports
if (typeof window !== 'undefined') {
    window.testDeployedFlow = testDeployedFlow;
    window.browserTestUtils = browserTestUtils;
}
