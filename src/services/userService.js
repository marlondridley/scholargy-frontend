// src/services/userService.js
import { supabase } from '../utils/supabase';

export const userService = {
  // Check if user exists in database
  async checkUserExists(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      return { exists: !!data, user: data };
    } catch (error) {
      console.error('Error checking user existence:', error);
      return { exists: false, user: null };
    }
  },

  // Insert or update user in database
  async upsertUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert([userData], { onConflict: 'email' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, user: data };
    } catch (error) {
      console.error('Error upserting user:', error);
      return { success: false, error };
    }
  },

  // Store user in localStorage
  storeUserInLocalStorage(user) {
    try {
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name || user.user_metadata?.full_name,
        img_url: user.img_url || user.user_metadata?.avatar_url,
        req_date: user.req_date || new Date().toISOString(),
        provider: user.app_metadata?.provider || 'email',
        created_at: user.created_at,
        updated_at: user.updated_at || new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error storing user in localStorage:', error);
      return false;
    }
  },

  // Get user from localStorage
  getUserFromLocalStorage() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user from localStorage:', error);
      return null;
    }
  },

  // Clear user from localStorage
  clearUserFromLocalStorage() {
    try {
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      console.error('Error clearing user from localStorage:', error);
      return false;
    }
  },

  // Handle user authentication change
  async handleAuthChange(event, session) {
    if (event === 'SIGNED_IN' && session?.user) {
      const user = session.user;
      
      // Check if user exists in database
      const { exists, user: existingUser } = await this.checkUserExists(user.email);
      
      if (!exists) {
        // User doesn't exist, insert them
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split('@')[0],
          img_url: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider || 'email',
          req_date: new Date().toISOString(),
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        };

        const { success, user: newUser } = await this.upsertUser(userData);
        
        if (success) {
          this.storeUserInLocalStorage(newUser);
          console.log('New user profile created:', newUser);
        } else {
          console.error('Failed to create user profile');
        }
      } else {
        // User exists, update their information and store in localStorage
        const updatedUserData = {
          ...existingUser,
          name: user.user_metadata?.full_name || existingUser.name,
          img_url: user.user_metadata?.avatar_url || existingUser.img_url,
          updated_at: new Date().toISOString()
        };

        const { success, user: updatedUser } = await this.upsertUser(updatedUserData);
        
        if (success) {
          this.storeUserInLocalStorage(updatedUser);
          console.log('User profile updated:', updatedUser);
        } else {
          // Fallback to existing user data
          this.storeUserInLocalStorage(existingUser);
          console.log('Using existing user profile:', existingUser);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      // Clear user data from localStorage
      this.clearUserFromLocalStorage();
      console.log('User signed out, cleared localStorage');
    }
  },

  // Get current user (from localStorage or session)
  getCurrentUser() {
    const localUser = this.getUserFromLocalStorage();
    return localUser;
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update localStorage
      this.storeUserInLocalStorage(data);
      
      return { success: true, user: data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error };
    }
  }
};
