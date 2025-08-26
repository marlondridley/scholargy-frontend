#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

// Function to load environment variables from multiple sources
function loadEnvironmentVariables() {
  const envVars = {};
  
  // Load from process.env (Azure App Service Environment variables)
  const envKeys = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY', 
    'REACT_APP_API_URL',
    'REACT_APP_GOOGLE_CLIENT_ID'
  ];
  
  envKeys.forEach(key => {
    if (process.env[key]) {
      envVars[key] = process.env[key];
    }
  });
  
  // Load from .env file if it exists
  const envFilePath = path.join(__dirname, '../.env');
  if (fs.existsSync(envFilePath)) {
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !value.startsWith('#')) {
          envVars[key.trim()] = value;
        }
      }
    });
  }
  
  return envVars;
}

// Function to create .env file for React build
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
    return true;
  } else {
    console.log('⚠️ No environment variables found');
    return false;
  }
}

// Function to process static files with environment variables
function processStaticFiles(envVars) {
  const publicDir = path.join(__dirname, '../public');
  
  // Process env-config.js
  const envConfigPath = path.join(publicDir, 'env-config.js');
  if (fs.existsSync(envConfigPath)) {
    let content = fs.readFileSync(envConfigPath, 'utf8');
    Object.entries(envVars).forEach(([key, value]) => {
      const placeholder = `%${key}%`;
      content = content.replace(new RegExp(placeholder, 'g'), value || '');
    });
    fs.writeFileSync(envConfigPath, content);
    console.log('✅ env-config.js processed');
  }
  
  // Process index.html
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    Object.entries(envVars).forEach(([key, value]) => {
      const placeholder = `%${key}%`;
      content = content.replace(new RegExp(placeholder, 'g'), value || '');
    });
    fs.writeFileSync(indexPath, content);
    console.log('✅ index.html processed');
  }
}

// Function to run React build
function runReactBuild() {
  return new Promise((resolve, reject) => {
    console.log('🔨 Starting React build...');
    
    // Skip React build only in CI environment, not for local development
    if (process.env.CI === 'true') {
      console.log('⚠️ Skipping React build in CI - will be built on Azure Ubuntu');
      console.log('✅ Build preparation completed successfully');
      resolve();
      return;
    }
    
    // Use exec instead of spawn for better cross-platform compatibility
    const buildCommand = process.platform === 'win32' 
      ? 'npx.cmd react-scripts build'
      : 'npx react-scripts build';
    
    exec(buildCommand, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, CI: 'false' }
    }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ React build error:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log('⚠️ Build warnings:', stderr);
      }
      
      console.log('✅ React build completed successfully');
      resolve();
    });
  });
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting Ubuntu-compatible build process...');
    
    // Load environment variables
    const envVars = loadEnvironmentVariables();
    console.log('📋 Environment variables loaded:', Object.keys(envVars).length);
    
    // Log environment variable status (masked)
    Object.entries(envVars).forEach(([key, value]) => {
      const maskedValue = key.includes('KEY') || key.includes('SECRET')
        ? value.substring(0, 8) + '...'
        : value.substring(0, 30) + (value.length > 30 ? '...' : '');
      console.log(`  ✅ ${key}: ${maskedValue}`);
    });
    
    // Create .env file
    createEnvFile(envVars);
    
    // Process static files
    processStaticFiles(envVars);
    
    // Run React build
    await runReactBuild();
    
    console.log('🎉 Ubuntu build process completed successfully!');
    
  } catch (error) {
    console.error('❌ Build process failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, loadEnvironmentVariables, createEnvFile, processStaticFiles };
