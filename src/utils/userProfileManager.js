// src/utils/userProfileManager.js
import { makeRequest } from '../services/api';

/**
 * User Profile Manager for CosmosDB Integration
 * Handles user profile operations through the backend API
 */

export class UserProfileManager {
  /**
   * Get user profile from CosmosDB via backend API
   * @param {string} userId - Supabase user ID
   * @returns {Promise<Object|null>} User profile data
   */
  static async getUserProfile(userId) {
    try {
      const response = await makeRequest(`/profile/${userId}`, 'GET');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Create or update user profile in CosmosDB via backend API
   * @param {string} userId - Supabase user ID
   * @param {Object} profileData - User profile data
   * @returns {Promise<Object|null>} Created/updated profile data
   */
  static async createOrUpdateProfile(userId, profileData) {
    try {
      const response = await makeRequest(`/profile/${userId}`, 'POST', profileData);
      return response.data;
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      return null;
    }
  }

  /**
   * Get user profile assessment from CosmosDB via backend API
   * @param {string} userId - Supabase user ID
   * @returns {Promise<Object|null>} User assessment data
   */
  static async getUserAssessment(userId) {
    try {
      const response = await makeRequest(`/profile/${userId}/assessment`, 'GET');
      return response.data;
    } catch (error) {
      console.error('Error fetching user assessment:', error);
      return null;
    }
  }

  /**
   * Initialize user profile with OAuth data
   * @param {Object} user - Supabase user object
   * @returns {Promise<Object|null>} Initialized profile data
   */
  static async initializeProfile(user) {
    const profileData = {
      email: user.email,
      fullName: user.user_metadata?.full_name || user.email,
      avatarUrl: user.user_metadata?.avatar_url,
      provider: user.app_metadata?.provider || 'email',
      // Basic profile structure
      profile: {
        personal: {
          firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email,
        },
        academic: {
          gpa: null,
          major: null,
          graduationYear: null,
          currentSchool: null,
        },
        extracurriculars: [],
        essays: [],
        recommendations: [],
        financial: {
          familyIncome: null,
          financialAidNeeded: null,
          scholarships: [],
        }
      },
      preferences: {
        collegeType: null,
        location: null,
        maxTuition: null,
        desiredMajors: [],
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await this.createOrUpdateProfile(user.id, profileData);
  }

  /**
   * Check if user profile is complete
   * @param {Object} profile - User profile data
   * @returns {boolean} Whether profile is complete
   */
  static isProfileComplete(profile) {
    if (!profile) return false;
    
    const academic = profile.profile?.academic;
    if (!academic) return false;

    // Check if essential academic data is present
    return !!(
      academic.gpa &&
      academic.major &&
      academic.graduationYear &&
      academic.currentSchool
    );
  }

  /**
   * Get profile completion percentage
   * @param {Object} profile - User profile data
   * @returns {number} Completion percentage (0-100)
   */
  static getProfileCompletionPercentage(profile) {
    if (!profile) return 0;

    const sections = [
      'personal',
      'academic',
      'extracurriculars',
      'essays',
      'recommendations',
      'financial',
      'preferences'
    ];

    let completedSections = 0;

    sections.forEach(section => {
      const sectionData = profile.profile?.[section] || profile[section];
      if (sectionData && Object.keys(sectionData).length > 0) {
        completedSections++;
      }
    });

    return Math.round((completedSections / sections.length) * 100);
  }

  /**
   * Get profile sections that need completion
   * @param {Object} profile - User profile data
   * @returns {Array} Array of incomplete sections
   */
  static getIncompleteSections(profile) {
    if (!profile) return ['personal', 'academic', 'extracurriculars', 'essays', 'recommendations', 'financial', 'preferences'];

    const incompleteSections = [];
    const sections = [
      'personal',
      'academic',
      'extracurriculars',
      'essays',
      'recommendations',
      'financial',
      'preferences'
    ];

    sections.forEach(section => {
      const sectionData = profile.profile?.[section] || profile[section];
      if (!sectionData || Object.keys(sectionData).length === 0) {
        incompleteSections.push(section);
      }
    });

    return incompleteSections;
  }

  /**
   * Update specific profile section
   * @param {string} userId - Supabase user ID
   * @param {string} section - Profile section name
   * @param {Object} sectionData - Section data to update
   * @returns {Promise<Object|null>} Updated profile data
   */
  static async updateProfileSection(userId, section, sectionData) {
    try {
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) {
        throw new Error('Profile not found');
      }

      // Update the specific section
      const updatedProfile = {
        ...currentProfile,
        profile: {
          ...currentProfile.profile,
          [section]: {
            ...currentProfile.profile?.[section],
            ...sectionData
          }
        },
        updated_at: new Date().toISOString(),
      };

      return await this.createOrUpdateProfile(userId, updatedProfile);
    } catch (error) {
      console.error(`Error updating profile section ${section}:`, error);
      return null;
    }
  }
}

export default UserProfileManager;
