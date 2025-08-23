// Test script for environment variables
// Run this in the browser console after deployment

function testEnvironmentVariables() {
  console.log('🔍 Environment Variables Test');
  console.log('=============================');
  
  // Test different methods of accessing environment variables
  const tests = {
    'window.__ENV__': typeof window !== 'undefined' && window.__ENV__,
    'process.env': typeof process !== 'undefined' && process.env,
    'import.meta.env': typeof import !== 'undefined' && import.meta && import.meta.env
  };
  
  console.log('📋 Available Methods:');
  Object.entries(tests).forEach(([method, available]) => {
    console.log(`${method}: ${available ? '✅ Available' : '❌ Not Available'}`);
  });
  
  // Test specific environment variables
  const envVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'REACT_APP_API_URL',
    'REACT_APP_GOOGLE_CLIENT_ID'
  ];
  
  console.log('\n📋 Environment Variables:');
  envVars.forEach(varName => {
    let value = null;
    let source = 'None';
    
    // Try window.__ENV__ first
    if (window.__ENV__ && window.__ENV__[varName]) {
      value = window.__ENV__[varName];
      source = 'window.__ENV__';
    }
    // Try process.env
    else if (typeof process !== 'undefined' && process.env && process.env[varName]) {
      value = process.env[varName];
      source = 'process.env';
    }
    // Try import.meta.env
    else if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[varName]) {
      value = import.meta.env[varName];
      source = 'import.meta.env';
    }
    
    if (value) {
      console.log(`✅ ${varName}: ${value.substring(0, 20)}... (from ${source})`);
    } else {
      console.log(`❌ ${varName}: Missing`);
    }
  });
  
  // Test Supabase client initialization
  console.log('\n🔧 Testing Supabase Client:');
  try {
    if (window.__ENV__?.REACT_APP_SUPABASE_URL && window.__ENV__?.REACT_APP_SUPABASE_ANON_KEY) {
      console.log('✅ Environment variables available for Supabase');
      
      // Test if Supabase client can be created
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(
        window.__ENV__.REACT_APP_SUPABASE_URL,
        window.__ENV__.REACT_APP_SUPABASE_ANON_KEY
      );
      console.log('✅ Supabase client created successfully');
    } else {
      console.log('❌ Missing Supabase environment variables');
    }
  } catch (error) {
    console.log('❌ Error creating Supabase client:', error.message);
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const availableVars = envVars.filter(varName => {
    return (window.__ENV__ && window.__ENV__[varName]) ||
           (typeof process !== 'undefined' && process.env && process.env[varName]) ||
           (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[varName]);
  });
  
  console.log(`Environment variables available: ${availableVars.length}/${envVars.length}`);
  
  if (availableVars.length === envVars.length) {
    console.log('🎉 All environment variables are available! OAuth should work.');
  } else {
    console.log('⚠️ Some environment variables are missing. Check the deployment.');
  }
}

// Run the test
testEnvironmentVariables();

// Export for manual testing
window.testEnvironmentVariables = testEnvironmentVariables;
