// frontend/src/contexts/AuthContext.js
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
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
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
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signUp: (data) => supabase.auth.signUp(data),
        signOut: () => supabase.auth.signOut(),
        signInWithGoogle: () => supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        }),
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
