// api/rag.js - RAG (Retrieval-Augmented Generation) API functions

const API_BASE_URL = '/api';

/**
 * Send a question to the RAG system and get an AI-powered response
 */
export const sendRagQuery = async (question, history = []) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, history }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to send RAG query:", error);
    throw error;
  }
};

/**
 * Get top college matches for a student profile
 */
export const getTopMatches = async (profile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rag/top-matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile: profile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get top matches:", error);
    return { data: [] };
  }
};

/**
 * Get scholarship summary for a student profile
 */
export const getScholarshipSummary = async (profile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rag/scholarships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile: profile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarship summary:", error);
    return { data: [] };
  }
};

/**
 * Check RAG service health
 */
export const checkRagHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/rag/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to check RAG health:", error);
    return { status: 'unhealthy', error: error.message };
  }
}; 