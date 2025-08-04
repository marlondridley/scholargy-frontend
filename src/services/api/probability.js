// api/probability.js - Probability calculation and what-if scenario API functions

const API_BASE_URL = '/api';

/**
 * Calculate admission probabilities for multiple colleges
 */
export const calculateProbabilities = async (studentProfile, collegeIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/probability/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile, collegeIds }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to calculate probabilities:", error);
    return { results: [] };
  }
};



/**
 * Get probability statistics for a college
 */
export const getCollegeProbabilityStats = async (collegeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/probability/stats/${collegeId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch probability stats for college ${collegeId}:`, error);
    return null;
  }
};

/**
 * Compare probabilities between multiple colleges
 */
export const compareCollegeProbabilities = async (studentProfile, collegeIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/probability/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile, collegeIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to compare college probabilities:", error);
    return { comparisons: [] };
  }
};

/**
 * Get historical probability trends for a college
 */
export const getProbabilityTrends = async (collegeId, years = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/probability/trends/${collegeId}?years=${years}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch probability trends for college ${collegeId}:`, error);
    return null;
  }
}; 