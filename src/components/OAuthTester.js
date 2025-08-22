// src/components/OAuthTester.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfileManager } from '../utils/userProfileManager';

const OAuthTester = () => {
    const { user, profile, signIn, signInWithGoogle, signOut, getUserData } = useAuth();
    const [testResults, setTestResults] = useState({});
    const [isRunning, setIsRunning] = useState(false);
    const [logs, setLogs] = useState([]);

    // Add log entry
    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, type }]);
    };

    // Clear logs
    const clearLogs = () => {
        setLogs([]);
        setTestResults({});
    };

    // Test environment variables
    const testEnvironmentVariables = () => {
        addLog('Testing environment variables...', 'info');
        
        const requiredVars = [
            'REACT_APP_SUPABASE_URL',
            'REACT_APP_SUPABASE_ANON_KEY',
            'REACT_APP_API_URL',
            'REACT_APP_GOOGLE_CLIENT_ID'
        ];

        const results = {};
        let allPassed = true;

        requiredVars.forEach(varName => {
            const value = process.env[varName];
            const hasValue = !!value;
            results[varName] = hasValue;
            
            if (hasValue) {
                addLog(`✅ ${varName}: Set`, 'success');
            } else {
                addLog(`❌ ${varName}: Missing`, 'error');
                allPassed = false;
            }
        });

        setTestResults(prev => ({ ...prev, environment: allPassed }));
        return allPassed;
    };

    // Test localStorage
    const testLocalStorage = () => {
        addLog('Testing localStorage...', 'info');
        
        try {
            localStorage.setItem('test_key', 'test_value');
            const retrieved = localStorage.getItem('test_key');
            localStorage.removeItem('test_key');
            
            if (retrieved === 'test_value') {
                addLog('✅ localStorage basic operations work', 'success');
                
                // Test user data storage
                const userData = {
                    email: 'test@example.com',
                    name: 'Test User',
                    provider: 'google',
                    created_at: new Date().toISOString()
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                const storedUser = JSON.parse(localStorage.getItem('user'));
                localStorage.removeItem('user');
                
                if (storedUser.email === userData.email) {
                    addLog('✅ User data storage works', 'success');
                    setTestResults(prev => ({ ...prev, localStorage: true }));
                    return true;
                } else {
                    addLog('❌ User data storage failed', 'error');
                    setTestResults(prev => ({ ...prev, localStorage: false }));
                    return false;
                }
            } else {
                addLog('❌ localStorage basic operations failed', 'error');
                setTestResults(prev => ({ ...prev, localStorage: false }));
                return false;
            }
        } catch (error) {
            addLog(`❌ localStorage test error: ${error.message}`, 'error');
            setTestResults(prev => ({ ...prev, localStorage: false }));
            return false;
        }
    };

    // Test API connectivity
    const testAPIConnectivity = async () => {
        addLog('Testing API connectivity...', 'info');
        
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            addLog('✅ API connectivity successful', 'success');
            addLog(`   Response: ${JSON.stringify(data)}`, 'info');
            setTestResults(prev => ({ ...prev, api: true }));
            return true;
        } catch (error) {
            addLog(`❌ API connectivity failed: ${error.message}`, 'error');
            setTestResults(prev => ({ ...prev, api: false }));
            return false;
        }
    };

    // Test OAuth flow
    const testOAuthFlow = async () => {
        addLog('Testing OAuth flow...', 'info');
        
        try {
            // Test Google OAuth initiation
            const { data, error } = await signInWithGoogle();
            
            if (error) {
                addLog(`❌ OAuth test failed: ${error.message}`, 'error');
                setTestResults(prev => ({ ...prev, oauth: false }));
                return false;
            }

            addLog('✅ OAuth flow initiated successfully', 'success');
            if (data?.url) {
                addLog(`   Redirect URL: ${data.url}`, 'info');
            }
            setTestResults(prev => ({ ...prev, oauth: true }));
            return true;
        } catch (error) {
            addLog(`❌ OAuth test error: ${error.message}`, 'error');
            setTestResults(prev => ({ ...prev, oauth: false }));
            return false;
        }
    };

    // Test profile management
    const testProfileManagement = async () => {
        addLog('Testing profile management...', 'info');
        
        if (!user) {
            addLog('⚠️ No user logged in, skipping profile test', 'warning');
            setTestResults(prev => ({ ...prev, profile: false }));
            return false;
        }

        try {
            // Test profile initialization
            const profileData = await UserProfileManager.initializeProfile(user);
            
            if (profileData) {
                addLog('✅ Profile initialization successful', 'success');
                addLog(`   Profile structure: ${Object.keys(profileData).join(', ')}`, 'info');
                
                // Test profile completion
                const isComplete = UserProfileManager.isProfileComplete(profileData);
                const completionPercentage = UserProfileManager.getProfileCompletionPercentage(profileData);
                
                addLog(`   Profile complete: ${isComplete}`, 'info');
                addLog(`   Completion percentage: ${completionPercentage}%`, 'info');
                
                setTestResults(prev => ({ ...prev, profile: true }));
                return true;
            } else {
                addLog('⚠️ Profile initialization returned null (backend may not be running)', 'warning');
                setTestResults(prev => ({ ...prev, profile: false }));
                return false;
            }
        } catch (error) {
            addLog(`❌ Profile management test failed: ${error.message}`, 'error');
            setTestResults(prev => ({ ...prev, profile: false }));
            return false;
        }
    };

    // Test session management
    const testSessionManagement = () => {
        addLog('Testing session management...', 'info');
        
        const userData = getUserData();
        
        if (user) {
            addLog('✅ User session exists', 'success');
            addLog(`   User ID: ${user.id}`, 'info');
            addLog(`   Email: ${user.email}`, 'info');
            addLog(`   Provider: ${user.app_metadata?.provider || 'email'}`, 'info');
            
            if (userData) {
                addLog('✅ User data in localStorage', 'success');
                addLog(`   Stored name: ${userData.name}`, 'info');
            } else {
                addLog('⚠️ No user data in localStorage', 'warning');
            }
            
            setTestResults(prev => ({ ...prev, session: true }));
            return true;
        } else {
            addLog('ℹ️ No active user session', 'info');
            setTestResults(prev => ({ ...prev, session: false }));
            return false;
        }
    };

    // Run all tests
    const runAllTests = async () => {
        setIsRunning(true);
        clearLogs();
        
        addLog('🚀 Starting OAuth Flow Tests...', 'info');
        
        const results = {
            environment: testEnvironmentVariables(),
            localStorage: testLocalStorage(),
            api: await testAPIConnectivity(),
            oauth: await testOAuthFlow(),
            profile: await testProfileManagement(),
            session: testSessionManagement()
        };

        addLog('', 'info');
        addLog('📊 Test Results Summary:', 'info');
        addLog('========================', 'info');
        
        Object.entries(results).forEach(([test, passed]) => {
            const status = passed ? '✅ PASSED' : '❌ FAILED';
            addLog(`${test}: ${status}`, passed ? 'success' : 'error');
        });

        const allPassed = Object.values(results).every(result => result);
        
        if (allPassed) {
            addLog('', 'info');
            addLog('🎉 All tests passed! Your OAuth system is working correctly.', 'success');
        } else {
            addLog('', 'info');
            addLog('⚠️ Some tests failed. Check the logs above for details.', 'error');
        }

        setIsRunning(false);
    };

    // Test email/password sign in
    const testEmailSignIn = async () => {
        addLog('Testing email/password sign in...', 'info');
        
        try {
            const { error } = await signIn({
                email: 'test@example.com',
                password: 'testpassword123'
            });
            
            if (error) {
                addLog(`❌ Email sign in failed: ${error.message}`, 'error');
                return false;
            }

            addLog('✅ Email sign in successful', 'success');
            return true;
        } catch (error) {
            addLog(`❌ Email sign in error: ${error.message}`, 'error');
            return false;
        }
    };

    // Test sign out
    const testSignOut = async () => {
        addLog('Testing sign out...', 'info');
        
        try {
            await signOut();
            addLog('✅ Sign out successful', 'success');
            return true;
        } catch (error) {
            addLog(`❌ Sign out error: ${error.message}`, 'error');
            return false;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">OAuth Flow Tester</h2>
            
            {/* Test Controls */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={runAllTests}
                        disabled={isRunning}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isRunning ? 'Running Tests...' : 'Run All Tests'}
                    </button>
                    
                    <button
                        onClick={clearLogs}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Clear Logs
                    </button>
                    
                    {user && (
                        <>
                            <button
                                onClick={testEmailSignIn}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Test Email Sign In
                            </button>
                            
                            <button
                                onClick={testSignOut}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Test Sign Out
                            </button>
                        </>
                    )}
                </div>
                
                {/* Current Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Current Status:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>User: {user ? '✅ Logged In' : '❌ Not Logged In'}</div>
                        <div>Profile: {profile ? '✅ Loaded' : '❌ Not Loaded'}</div>
                        <div>Session: {user ? '✅ Active' : '❌ Inactive'}</div>
                    </div>
                </div>
            </div>
            
            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Test Results:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(testResults).map(([test, passed]) => (
                            <div
                                key={test}
                                className={`p-2 rounded text-sm font-medium ${
                                    passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {test}: {passed ? 'PASSED' : 'FAILED'}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Logs */}
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Test Logs:</h3>
                    <span className="text-gray-400">{logs.length} entries</span>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-1">
                    {logs.length === 0 ? (
                        <div className="text-gray-500">No logs yet. Run tests to see results.</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <span className="text-gray-500 text-xs w-16 flex-shrink-0">
                                    {log.timestamp}
                                </span>
                                <span
                                    className={`${
                                        log.type === 'error' ? 'text-red-400' :
                                        log.type === 'success' ? 'text-green-400' :
                                        log.type === 'warning' ? 'text-yellow-400' :
                                        'text-gray-300'
                                    }`}
                                >
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
            
            {/* Manual Testing Checklist */}
            <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Manual Testing Checklist:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">Login Flow:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Login page loads correctly</li>
                            <li>• Email/password form works</li>
                            <li>• Google OAuth button appears</li>
                            <li>• Password reset link works</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2">OAuth Flow:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Google OAuth redirects to Google</li>
                            <li>• User can select Google account</li>
                            <li>• OAuth callback returns to app</li>
                            <li>• User session is established</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OAuthTester;
