#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to replace environment variable placeholders
function replaceEnvPlaceholders(content, envVars) {
  let processedContent = content;
  
  Object.entries(envVars).forEach(([key, value]) => {
    const placeholder = `%${key}%`;
    // Use a more robust replacement that handles undefined/null values
    const replacement = value || '';
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), replacement);
  });
  
  return processedContent;
}

// Function to process the env-config.js file
function processEnvConfig(envVars) {
  const envConfigPath = path.join(__dirname, '../public/env-config.js');
  
  if (fs.existsSync(envConfigPath)) {
    let content = fs.readFileSync(envConfigPath, 'utf8');
    content = replaceEnvPlaceholders(content, envVars);
    fs.writeFileSync(envConfigPath, content);
    console.log('✅ Environment config processed');
  } else {
    console.log('⚠️ env-config.js not found at:', envConfigPath);
  }
}

// Function to process the index.html file
function processIndexHtml(envVars) {
  const indexPath = path.join(__dirname, '../public/index.html');
  
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    content = replaceEnvPlaceholders(content, envVars);
    fs.writeFileSync(indexPath, content);
    console.log('✅ index.html processed');
  } else {
    console.log('⚠️ index.html not found at:', indexPath);
  }
}

// Function to create a .env file for React build process
function createEnvFile(envVars) {
  const envFilePath = path.join(__dirname, '../.env');
  let envContent = '';
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      envContent += `${key}=${value}\n`;
    }
  });
  
  if (envContent) {
    fs.writeFileSync(envFilePath, envContent);
    console.log('✅ .env file created for React build');
  } else {
    console.log('⚠️ No environment variables found, skipping .env file creation');
  }
}

// Function to validate environment variables
function validateEnvVars(envVars) {
  const requiredVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'REACT_APP_API_URL'
  ];
  
  const missing = requiredVars.filter(key => !envVars[key]);
  
  if (missing.length > 0) {
    console.log('⚠️ Missing required environment variables:', missing.join(', '));
    console.log('💡 These will be set to empty strings in the build');
  } else {
    console.log('✅ All required environment variables are present');
  }
}

// Main function
function main() {
  console.log('🔧 Processing environment variables for Ubuntu deployment...');
  
  // Get environment variables with fallbacks
  const envVars = {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || '',
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || '',
    REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || ''
  };
  
  // Validate environment variables
  validateEnvVars(envVars);
  
  // Log available variables (mask sensitive data)
  console.log('📋 Environment variables status:');
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      const maskedValue = key.includes('KEY') || key.includes('SECRET') 
        ? value.substring(0, 8) + '...' 
        : value.substring(0, 30) + (value.length > 30 ? '...' : '');
      console.log(`  ✅ ${key}: ${maskedValue}`);
    } else {
      console.log(`  ❌ ${key}: Missing`);
    }
  });
  
  // Create .env file for React build process
  createEnvFile(envVars);
  
  // Process files
  processEnvConfig(envVars);
  processIndexHtml(envVars);
  
  console.log('🎉 Environment processing complete for Ubuntu deployment!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, replaceEnvPlaceholders, createEnvFile, validateEnvVars };
