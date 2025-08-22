// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { getProfile, createProfile } from '../services/api';
import { handleSignInWithOAuth, extractGoogleTokens } from '../utils/googleAuth';

const AuthContext = createContext(null);

export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Failed to get initial session:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        getInitialSession();

        const handleAuthChange = async (event, session) => {
            console.log(`Supabase auth event: ${event}`, session);
            
            if (event === "SIGNED_IN" && session?.user) {
                const user = session.user;
                
                try {
                    // Store basic user data in localStorage for offline access
                    const userData = {
                        email: user.email,
                        name: user.user_metadata?.full_name || user.email,
                        img_url: user.user_metadata?.avatar_url,
                        provider: user.app_metadata?.provider || 'email',
                        created_at: new Date().toISOString(),
                    };
                    
                    localStorage.setItem("user", JSON.stringify(userData));
                    console.log("User data stored in localStorage:", userData);
                    
                    // Note: User profile data will be managed through the backend API
                    // which connects to Azure CosmosDB for the actual user profile storage
                    
                } catch (error) {
                    console.error("Error in handleAuthChange:", error);
                }
            } else if (event === "SIGNED_OUT") {
                // Clear localStorage on sign out
                localStorage.removeItem("user");
            }
            
            setUser(session?.user ?? null);
            setLoading(false);
        };

        try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
            return () => subscription.unsubscribe();
        } catch (error) {
            console.error('Failed to set up auth state change listener:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const manageUserProfile = async () => {
            if (user) {
                try {
                    // Get user profile from backend API (CosmosDB)
                    let userProfile = await getProfile(user.id);
                    
                    if (!userProfile) {
                        // Create new user profile in CosmosDB through backend API
                        const newProfileData = {
                            email: user.email,
                            fullName: user.user_metadata?.full_name,
                            avatarUrl: user.user_metadata?.avatar_url,
                            provider: user.app_metadata?.provider || 'email',
                            // Add any additional fields needed for your application
                            gpa: null,
                            major: null,
                            graduationYear: null,
                            // ... other profile fields
                        };
                        userProfile = await createProfile(user.id, newProfileData);
                    }
                    
                    setProfile(userProfile);
                    // Check if profile is complete (has required fields like GPA)
                    setIsProfileComplete(!!userProfile?.gpa); 
                } catch (error) {
                    console.error("Error managing user profile:", error);
                    setProfile(null);
                    setIsProfileComplete(false);
                }
            } else {
                setProfile(null);
                setIsProfileComplete(false);
            }
        };
        manageUserProfile();
    }, [user]);

    const value = {
        user,
        profile,
        setProfile,
        isProfileComplete,
        setIsProfileComplete,
        loading,
        getUserData: () => {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        },
        signIn: async (data) => {
            try {
                return await supabase.auth.signInWithPassword(data);
            } catch (error) {
                console.error('Sign in error:', error);
                throw error;
            }
        },
        signUp: async (data) => {
            try {
                return await supabase.auth.signUp({
                    ...data,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    }
                });
            } catch (error) {
                console.error('Sign up error:', error);
                throw error;
            }
        },
        signOut: async () => {
            try {
                return await supabase.auth.signOut();
            } catch (error) {
                console.error('Sign out error:', error);
                throw error;
            }
        },
        signInWithGoogle: async () => {
            try {
                const result = await handleSignInWithOAuth();
                
                // Extract and store Google tokens if available
                if (result.data?.session) {
                    extractGoogleTokens(result.data.session);
                }
                
                return result;
            } catch (error) {
                console.error('Google sign in error:', error);
                throw error;
            }
        },
        resetPasswordForEmail: async (email) => {
            try {
                return await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password/confirm`,
                });
            } catch (error) {
                console.error('Reset password error:', error);
                throw error;
            }
        },
        signInWithOtp: async (email) => {
            try {
                return await supabase.auth.signInWithOtp({
                    email: email,
                    options: {
                        shouldCreateUser: false,
                    },
                });
            } catch (error) {
                console.error('OTP sign in error:', error);
                throw error;
            }
        },
        verifyOtp: async (email, token) => {
            try {
                return await supabase.auth.verifyOtp({
                    email,
                    token,
                    type: 'email',
                });
            } catch (error) {
                console.error('OTP verification error:', error);
                throw error;
            }
        },
        updatePassword: async (newPassword) => {
            try {
                return await supabase.auth.updateUser({ 
                    password: newPassword 
                });
            } catch (error) {
                console.error('Update password error:', error);
                throw error;
            }
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
