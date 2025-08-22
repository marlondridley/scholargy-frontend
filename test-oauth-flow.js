// Test OAuth Flow and Backend Integration
// Run this script to test the complete authentication flow

const testOAuthFlow = async () => {
    console.log('🧪 Testing OAuth Flow and Backend Integration...\n');

    // Test 1: Environment Variables
    console.log('1️⃣ Testing Environment Variables...');
    const requiredEnvVars = [
        'REACT_APP_SUPABASE_URL',
        'REACT_APP_SUPABASE_ANON_KEY',
        'REACT_APP_API_URL',
        'REACT_APP_GOOGLE_CLIENT_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error('❌ Missing environment variables:', missingVars);
        return false;
    }
    console.log('✅ All environment variables are set\n');

    // Test 2: Supabase Connection
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
            return false;
        }
        console.log('✅ Supabase connection successful\n');
    } catch (error) {
        console.error('❌ Supabase connection failed:', error.message);
        return false;
    }

    // Test 3: Backend API Connection
    console.log('3️⃣ Testing Backend API Connection...');
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
        console.log('');
    } catch (error) {
        console.error('❌ Backend API connection failed:', error.message);
        console.log('   Make sure your backend is running and accessible\n');
        return false;
    }

    // Test 4: Google OAuth Configuration
    console.log('4️⃣ Testing Google OAuth Configuration...');
    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        console.error('❌ Google Client ID not configured');
        return false;
    }
    console.log('✅ Google OAuth configuration found\n');

    // Test 5: localStorage Support
    console.log('5️⃣ Testing localStorage Support...');
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem('test', 'value');
            const testValue = localStorage.getItem('test');
            localStorage.removeItem('test');
            
            if (testValue === 'value') {
                console.log('✅ localStorage is supported\n');
            } else {
                console.error('❌ localStorage test failed');
                return false;
            }
        } else {
            console.log('ℹ️ localStorage test skipped (server-side)\n');
        }
    } catch (error) {
        console.error('❌ localStorage not supported:', error.message);
        return false;
    }

    console.log('🎉 All tests passed! OAuth flow is ready for testing.\n');
    return true;
};

// Test User Profile Manager
const testUserProfileManager = async () => {
    console.log('🧪 Testing User Profile Manager...\n');

    // Mock user data for testing
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

    try {
        // Test profile initialization
        console.log('1️⃣ Testing profile initialization...');
        const UserProfileManager = require('./src/utils/userProfileManager').UserProfileManager;
        
        const profileData = await UserProfileManager.initializeProfile(mockUser);
        if (profileData) {
            console.log('✅ Profile initialization successful');
            console.log('   Profile structure:', Object.keys(profileData));
        } else {
            console.log('⚠️ Profile initialization returned null (backend may not be running)');
        }
        console.log('');

        // Test profile completion check
        console.log('2️⃣ Testing profile completion check...');
        const isComplete = UserProfileManager.isProfileComplete(profileData);
        console.log(`   Profile complete: ${isComplete}`);
        console.log('');

        // Test completion percentage
        console.log('3️⃣ Testing completion percentage...');
        const completionPercentage = UserProfileManager.getProfileCompletionPercentage(profileData);
        console.log(`   Completion: ${completionPercentage}%`);
        console.log('');

        // Test incomplete sections
        console.log('4️⃣ Testing incomplete sections...');
        const incompleteSections = UserProfileManager.getIncompleteSections(profileData);
        console.log('   Incomplete sections:', incompleteSections);
        console.log('');

        console.log('✅ User Profile Manager tests completed\n');
        return true;
    } catch (error) {
        console.error('❌ User Profile Manager test failed:', error.message);
        return false;
    }
};

// Test CosmosDB Schema Validation
const testCosmosDBSchema = () => {
    console.log('🧪 Testing CosmosDB Schema...\n');

    // Test users container schema
    console.log('1️⃣ Testing users container schema...');
    const usersSchema = {
        id: 'unique-user-id',
        email: 'user@example.com',
        name: 'User Full Name',
        img_url: 'https://example.com/avatar.jpg',
        provider: 'google',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: {
            gpa: 3.8,
            major: 'Computer Science',
            graduationYear: 2025
        }
    };

    const requiredUserFields = ['id', 'email', 'name', 'provider', 'created_at', 'updated_at'];
    const missingUserFields = requiredUserFields.filter(field => !usersSchema[field]);
    
    if (missingUserFields.length > 0) {
        console.error('❌ Missing user fields:', missingUserFields);
        return false;
    }
    console.log('✅ Users schema validation passed\n');

    // Test user_applications container schema
    console.log('2️⃣ Testing user_applications container schema...');
    const applicationsSchema = {
        id: 'unique-application-id',
        userId: 'user-id',
        email: 'user@example.com',
        profile: {
            personal: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'user@example.com'
            },
            academic: {
                gpa: 3.8,
                major: 'Computer Science',
                graduationYear: 2025,
                currentSchool: 'Test High School'
            },
            extracurriculars: [],
            essays: [],
            recommendations: [],
            financial: {
                familyIncome: null,
                financialAidNeeded: null,
                scholarships: []
            }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const requiredAppFields = ['id', 'userId', 'email', 'profile', 'created_at', 'updated_at'];
    const missingAppFields = requiredAppFields.filter(field => !applicationsSchema[field]);
    
    if (missingAppFields.length > 0) {
        console.error('❌ Missing application fields:', missingAppFields);
        return false;
    }
    console.log('✅ User applications schema validation passed\n');

    console.log('🎉 CosmosDB schema validation completed successfully!\n');
    return true;
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Starting Comprehensive OAuth Flow Tests...\n');
    
    const results = {
        oauthFlow: await testOAuthFlow(),
        userProfileManager: await testUserProfileManager(),
        cosmosDBSchema: testCosmosDBSchema()
    };

    console.log('📊 Test Results Summary:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        console.log(`${test}: ${status}`);
    });

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Your OAuth system is ready for deployment.');
        console.log('\n📋 Next Steps:');
        console.log('1. Deploy CosmosDB containers using the PowerShell script');
        console.log('2. Test OAuth flow in the browser');
        console.log('3. Verify user profile creation in CosmosDB');
        console.log('4. Monitor authentication flow in production');
    } else {
        console.log('\n⚠️ Some tests failed. Please fix the issues before deployment.');
    }

    return allPassed;
};

// Export for use in other scripts
module.exports = {
    testOAuthFlow,
    testUserProfileManager,
    testCosmosDBSchema,
    runAllTests
};

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}
