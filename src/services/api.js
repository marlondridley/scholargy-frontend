// api.js - Centralizes all communication with the backend API.

const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Searches for institutions by sending a configuration object to the backend.
 * @param {object} searchConfig - The configuration for the search.
 * @returns {Promise<object>} - A promise that resolves to the API response { data, pagination }.
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
 * Fetches the complete, merged profile for a single institution by its ID.
 * @param {string} unitId - The unique ID of the institution.
 * @returns {Promise<object|null>} - A promise that resolves to the institution object or null if not found.
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
 * Sends a question to the RAG (Retrieval-Augmented Generation) endpoint.
 * @param {string} question - The user's natural language question.
 * @returns {Promise<object>} - A promise that resolves to an object containing the AI-generated answer.
 */
export const getRagAnswer = async (question) => {
    if (!question) return { answer: "Please provide a question." };
    try {
        const response = await fetch(`${API_BASE_URL}/rag/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to get RAG answer:", error);
        return { answer: "Sorry, I encountered an error trying to answer your question." };
    }
};

/**
 * Sends a student's profile to the backend for an AI-powered assessment.
 * @param {object} profileData - The student's profile information.
 * @returns {Promise<object>} - A promise that resolves to the assessment object { readinessScore, recommendations }.
 */
export const getProfileAssessment = async (profileData) => {
    try {
        const response = await fetch(`/api/profile/assess`, {
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