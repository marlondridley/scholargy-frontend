#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to replace environment variable placeholders
function replaceEnvPlaceholders(content, envVars) {
  let processedContent = content;
  
  Object.entries(envVars).forEach(([key, value]) => {
    const placeholder = `%${key}%`;
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value || '');
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
    console.log('⚠️ env-config.js not found');
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
    console.log('⚠️ index.html not found');
  }
}

// Main function
function main() {
  console.log('🔧 Processing environment variables...');
  
  // Get environment variables
  const envVars = {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID
  };
  
  // Log available variables
  console.log('📋 Available environment variables:');
  Object.entries(envVars).forEach(([key, value]) => {
    if (value) {
      console.log(`  ✅ ${key}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`  ❌ ${key}: Missing`);
    }
  });
  
  // Process files
  processEnvConfig(envVars);
  processIndexHtml(envVars);
  
  console.log('🎉 Environment processing complete!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, replaceEnvPlaceholders };
