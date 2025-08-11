// api/profile.js - Profile and assessment API functions

const API_BASE_URL = '/api';

/**
 * Sends a student's profile to the backend for an AI-powered assessment.
 */
export const getProfileAssessment = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json(); // Expects { assessmentText: "..." }
  } catch (error) {
    console.error("Failed to get profile assessment:", error);
    return { 
      assessmentText: "Could not generate recommendations due to an error." 
    };
  }
};

/**
 * Save a student profile
 */
export const saveProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to save profile:", error);
    throw error;
  }
};

/**
 * Get a student profile by ID
 */
export const getProfile = async (profileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${profileId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch profile ${profileId}:`, error);
    return null;
  }
};

/**
 * Update a student profile
 */
export const updateProfile = async (profileId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
};

/**
 * Delete a student profile
 */
export const deleteProfile = async (profileId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${profileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to delete profile:", error);
    throw error;
  }
}; 