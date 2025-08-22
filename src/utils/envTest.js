// Environment Variable Test
// This will help us verify if environment variables are being read correctly

export const testEnvironmentVariables = () => {
    console.log('🔍 Environment Variables Test');
    console.log('=============================');
    
    const variables = {
        'REACT_APP_SUPABASE_URL': process.env.REACT_APP_SUPABASE_URL,
        'REACT_APP_SUPABASE_ANON_KEY': process.env.REACT_APP_SUPABASE_ANON_KEY,
        'REACT_APP_GOOGLE_CLIENT_ID': process.env.REACT_APP_GOOGLE_CLIENT_ID,
        'REACT_APP_API_URL': process.env.REACT_APP_API_URL
    };
    
    let allPresent = true;
    
    Object.entries(variables).forEach(([key, value]) => {
        if (value) {
            console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
        } else {
            console.log(`❌ ${key}: Missing`);
            allPresent = false;
        }
    });
    
    if (allPresent) {
        console.log('\n🎉 All environment variables are present!');
        console.log('OAuth should work correctly now.');
    } else {
        console.log('\n⚠️ Some environment variables are missing.');
        console.log('This will cause OAuth to fail.');
    }
    
    return allPresent;
};

// Auto-run the test when this module is imported
if (typeof window !== 'undefined') {
    console.log('Running environment variable test...');
    testEnvironmentVariables();
}
