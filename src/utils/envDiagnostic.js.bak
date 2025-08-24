// src/utils/envDiagnostic.js

// Simple environment variable logger for Create React App
export const logEnvironmentVariables = () => {
  console.log("=== Environment Variables ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("REACT_APP_SUPABASE_URL:", process.env.REACT_APP_SUPABASE_URL || "NOT SET");
  console.log("REACT_APP_SUPABASE_ANON_KEY:", process.env.REACT_APP_SUPABASE_ANON_KEY ? "***" : "NOT SET");
  console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL || "NOT SET");
  console.log("REACT_APP_GOOGLE_CLIENT_ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID || "NOT SET");
  console.log("==============================");
};

// Simple getter function for environment variables
export const getEnvVar = (varName) => {
  return process.env[varName] || null;
};

// Check if all required environment variables are available
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
