// api.js - Centralizes all communication with the backend API.

// Use a relative path for the API base URL to work in both development and production.
const API_BASE_URL = '/api';

/**
 * Searches for institutions by sending a configuration object to the backend.
 */
export const searchInstitutions = async (searchConfig) => {
  try {
    const response = await fetch(`${API_BASE_URL}/institutions/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchConfig),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to search for institutions:", error);
    return { data: [], pagination: { page: 1, limit: 20, totalPages: 1, totalDocuments: 0 } };
  }
};

/**
 * Gets top matching colleges for a student profile
 */
export const getTopMatches = async (profile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rag/top-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get top matches:", error);
    return { data: [] };
  }
};

/**
 * Gets scholarship summary for a student profile
 */
export const getScholarshipSummary = async (profile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rag/scholarships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarship summary:", error);
    return { data: [] };
  }
};

/**
 * Fetches the complete, merged profile for a single institution by its ID.
 */
export const getInstitutionDetails = async (unitId) => {
  if (!unitId) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/institutions/${unitId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch institution ${unitId}:`, error);
    return null;
  }
};

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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json(); // Expects { assessmentText: "..." }
    } catch (error) {
        console.error("Failed to get profile assessment:", error);
        return { assessmentText: "Could not generate recommendations due to an error." };
    }
};

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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to calculate probabilities:", error);
        return { results: [] };
    }
};

/**
 * Calculate what-if scenario probabilities
 */
export const calculateWhatIfScenarios = async (baseProfile, scenarios, collegeId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/probability/whatif`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ baseProfile, scenarios, collegeId }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to calculate what-if scenarios:", error);
        return { results: [] };
    }
};

export const sendRagQuery = async (query) => {
  const response = await fetch('/api/rag/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch RAG results');
  }

  return await response.json();
};
