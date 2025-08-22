#!/bin/bash

# Curl-based OAuth Flow Test
# This script tests the OAuth callback route and related endpoints

echo "🧪 Curl OAuth Flow Test"
echo "======================"

# Base URL - replace with your actual Azure Static Web App URL
BASE_URL="https://gentle-ground-0d24ae71e.1.azurestaticapps.net"

echo "📍 Testing base URL: $BASE_URL"
echo ""

# Test 1: Check if the main site is accessible
echo "1️⃣ Testing main site accessibility..."
curl -s -o /dev/null -w "Main site status: %{http_code}\n" "$BASE_URL/"

# Test 2: Check if the login page is accessible
echo ""
echo "2️⃣ Testing login page accessibility..."
curl -s -o /dev/null -w "Login page status: %{http_code}\n" "$BASE_URL/login"

# Test 3: Check if the auth callback route is accessible
echo ""
echo "3️⃣ Testing auth callback route..."
curl -s -o /dev/null -w "Auth callback status: %{http_code}\n" "$BASE_URL/auth/callback"

# Test 4: Check if the test-oauth page is accessible
echo ""
echo "4️⃣ Testing test-oauth page..."
curl -s -o /dev/null -w "Test OAuth page status: %{http_code}\n" "$BASE_URL/test-oauth"

# Test 5: Check if the dashboard is accessible (should redirect to login)
echo ""
echo "5️⃣ Testing dashboard access..."
curl -s -o /dev/null -w "Dashboard status: %{http_code}\n" "$BASE_URL/dashboard"

# Test 6: Check headers for auth callback route
echo ""
echo "6️⃣ Testing auth callback headers..."
curl -s -I "$BASE_URL/auth/callback" | grep -E "(HTTP|Content-Type|Cache-Control)"

# Test 7: Check if static files are accessible
echo ""
echo "7️⃣ Testing static files accessibility..."
curl -s -o /dev/null -w "Static files status: %{http_code}\n" "$BASE_URL/static/js/main.99995472.js"

# Test 8: Check if the site returns proper HTML for SPA routes
echo ""
echo "8️⃣ Testing SPA route handling..."
curl -s "$BASE_URL/auth/callback" | head -5

echo ""
echo "🎯 Curl tests completed!"
echo ""
echo "Expected results:"
echo "- Main site: 200"
echo "- Login page: 200"
echo "- Auth callback: 200 (should serve index.html)"
echo "- Test OAuth page: 200"
echo "- Dashboard: 200 (should serve index.html)"
echo "- Static files: 200"
echo ""
echo "If auth callback returns 404, the routing configuration needs to be fixed."
