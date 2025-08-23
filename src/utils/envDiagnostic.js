// src/utils/envDiagnostic.js

// Browser-safe environment variable check
export const checkEnvironmentVariables = () => {
  console.log('🔍 Environment Variables Diagnostic');
  console.log('=====================================');
  
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  console.log('🌐 Environment:', isBrowser ? 'Browser' : 'Server');
  
  // Check for process.env (should not be available in browser)
  const hasProcessEnv = typeof process !== 'undefined' && process.env;
  console.log('📦 process.env available:', hasProcessEnv ? '✅ Yes' : '❌ No');
  
  // Check for window.__ENV__ (custom approach)
  const hasWindowEnv = typeof window !== 'undefined' && window.__ENV__;
  console.log('🪟 window.__ENV__ available:', hasWindowEnv ? '✅ Yes' : '❌ No');
  
  // Check for environment variables in different ways
  const envChecks = {
    'REACT_APP_SUPABASE_URL': {
      'process.env': hasProcessEnv ? process.env.REACT_APP_SUPABASE_URL : 'N/A',
      'window.__ENV__': hasWindowEnv ? window.__ENV__.REACT_APP_SUPABASE_URL : 'N/A',
      'import.meta.env': typeof import !== 'undefined' && import.meta ? import.meta.env.REACT_APP_SUPABASE_URL : 'N/A'
    },
    'REACT_APP_SUPABASE_ANON_KEY': {
      'process.env': hasProcessEnv ? (process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING') : 'N/A',
      'window.__ENV__': hasWindowEnv ? (window.__ENV__.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING') : 'N/A',
      'import.meta.env': typeof import !== 'undefined' && import.meta ? (import.meta.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING') : 'N/A'
    },
    'REACT_APP_API_URL': {
      'process.env': hasProcessEnv ? (process.env.REACT_APP_API_URL ? 'SET' : 'MISSING') : 'N/A',
      'window.__ENV__': hasWindowEnv ? (window.__ENV__.REACT_APP_API_URL ? 'SET' : 'MISSING') : 'N/A',
      'import.meta.env': typeof import !== 'undefined' && import.meta ? (import.meta.env.REACT_APP_API_URL ? 'SET' : 'MISSING') : 'N/A'
    },
    'REACT_APP_GOOGLE_CLIENT_ID': {
      'process.env': hasProcessEnv ? (process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING') : 'N/A',
      'window.__ENV__': hasWindowEnv ? (window.__ENV__.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING') : 'N/A',
      'import.meta.env': typeof import !== 'undefined' && import.meta ? (import.meta.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING') : 'N/A'
    }
  };
  
  console.log('📋 Environment Variable Status:');
  Object.entries(envChecks).forEach(([varName, checks]) => {
    console.log(`  ${varName}:`);
    Object.entries(checks).forEach(([method, value]) => {
      console.log(`    ${method}: ${value}`);
    });
  });
  
  // Check for build-time environment variables
  console.log('\n🔧 Build Information:');
  console.log('Build Time:', new Date().toISOString());
  console.log('User Agent:', navigator.userAgent);
  
  // Check for any global variables that might contain env vars
  console.log('\n🔍 Global Variable Check:');
  const globalVars = ['__REACT_APP_ENV__', '__ENV__', '__CONFIG__', 'window.env'];
  globalVars.forEach(varName => {
    try {
      const value = eval(varName);
      console.log(`${varName}:`, value ? 'Available' : 'Not Available');
    } catch (e) {
      console.log(`${varName}: Not Available`);
    }
  });
  
  return envChecks;
};

// Function to get environment variables safely
export const getEnvVar = (varName) => {
  // Try different methods to get environment variables
  if (typeof process !== 'undefined' && process.env && process.env[varName]) {
    return process.env[varName];
  }
  
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[varName]) {
    return window.__ENV__[varName];
  }
  
  if (typeof import !== 'undefined' && import.meta && import.meta.env && import.meta.env[varName]) {
    return import.meta.env[varName];
  }
  
  // Check for any global variables
  try {
    const globalEnv = eval('__REACT_APP_ENV__');
    if (globalEnv && globalEnv[varName]) {
      return globalEnv[varName];
    }
  } catch (e) {
    // Ignore errors
  }
  
  return null;
};

// Function to check if all required environment variables are available
export const checkRequiredEnvVars = () => {
  const requiredVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'REACT_APP_API_URL'
  ];
  
  const missing = [];
  const available = {};
  
  requiredVars.forEach(varName => {
    const value = getEnvVar(varName);
    if (value) {
      available[varName] = value;
    } else {
      missing.push(varName);
    }
  });
  
  return {
    allAvailable: missing.length === 0,
    missing,
    available
  };
};

// Function to run full diagnostic
export const runFullDiagnostic = () => {
  console.log('🚀 Running Full Environment Diagnostic');
  console.log('=====================================');
  
  const envChecks = checkEnvironmentVariables();
  const requiredCheck = checkRequiredEnvVars();
  
  console.log('\n📊 Summary:');
  console.log('All Required Variables Available:', requiredCheck.allAvailable ? '✅ Yes' : '❌ No');
  
  if (requiredCheck.missing.length > 0) {
    console.log('❌ Missing Variables:', requiredCheck.missing);
  }
  
  if (Object.keys(requiredCheck.available).length > 0) {
    console.log('✅ Available Variables:', Object.keys(requiredCheck.available));
  }
  
  return {
    envChecks,
    requiredCheck
  };
};

// Auto-run diagnostic if this module is imported
if (typeof window !== 'undefined') {
  // Only run in browser
  setTimeout(() => {
    console.log('🔍 Auto-running environment diagnostic...');
    runFullDiagnostic();
  }, 1000);
}
