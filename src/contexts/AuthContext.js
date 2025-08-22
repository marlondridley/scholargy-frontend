// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { getProfile, createProfile } from '../services/api';

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

        try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
                console.log(`Supabase auth event: ${event}`, session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

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
                    let userProfile = await getProfile(user.id);
                    if (!userProfile) {
                        const newProfileData = {
                            email: user.email,
                            fullName: user.user_metadata?.full_name,
                            avatarUrl: user.user_metadata?.avatar_url,
                            provider: user.app_metadata?.provider || 'email',
                        };
                        userProfile = await createProfile(user.id, newProfileData);
                    }
                    setProfile(userProfile);
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
                return await supabase.auth.signUp(data);
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
                return await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                });
            } catch (error) {
                console.error('Google sign in error:', error);
                throw error;
            }
        },
        resetPasswordForEmail: async (email) => {
            try {
                return await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
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
