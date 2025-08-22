// src/services/api.js
// Single, consolidated file for all API interactions with consistent authentication and URL handling
import { supabase } from '../utils/supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Gets authentication headers for secure API requests
 * @returns {Promise<Object>} Headers object with Authorization token
 */
const getAuthHeaders = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
            throw new Error("Authentication token not found. Please log in again.");
        }

        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    } catch (error) {
        console.error('Error getting auth headers:', error);
        throw new Error("Authentication failed. Please log in again.");
    }
};

/**
 * Makes an API request with consistent error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {boolean} requireAuth - Whether authentication is required
 * @returns {Promise<Object>} API response data
 */
const makeRequest = async (endpoint, options = {}, requireAuth = false) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = requireAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
        
        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        throw error;
    }
};

// --- Profile Management (Secure) ---

/**
 * Fetches a user's profile from the backend.
 * @param {string} userId - The unique ID of the user.
 * @returns {Promise<Object|null>} The user's profile object, or null if not found.
 */
export const getProfile = async (userId) => {
    try {
        return await makeRequest(`/profile/${userId}`, {}, true);
    } catch (error) {
        if (error.message.includes('404')) return null;
        throw error;
    }
};

/**
 * Creates a new user profile in the backend.
 * @param {string} userId - The user's ID.
 * @param {Object} profileData - The profile data to save.
 * @returns {Promise<Object>} The newly created profile object.
 */
export const createProfile = async (userId, profileData) => {
    return await makeRequest('/profile', {
        method: 'POST',
        body: JSON.stringify({ userId, profileData }),
    }, true);
};

/**
 * Updates an existing user's profile.
 * @param {string} userId - The user's ID.
 * @param {Object} profileData - The profile data to update.
 * @returns {Promise<Object>} The updated profile object.
 */
export const updateProfile = async (userId, profileData) => {
    return await makeRequest(`/profile/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ profileData }),
    }, true);
};

/**
 * Sends a student's profile to the backend for an AI-powered assessment.
 * @param {Object} profileData - The student's profile data
 * @returns {Promise<Object>} The assessment results
 */
export const getProfileAssessment = async (profileData) => {
    try {
        return await makeRequest('/profile/assess', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    } catch (error) {
        console.error("Failed to get profile assessment:", error);
        return { 
            assessmentText: "Could not generate recommendations due to an error." 
        };
    }
};

/**
 * Save a student profile
 * @param {Object} profileData - The profile data to save
 * @returns {Promise<Object>} The saved profile
 */
export const saveProfile = async (profileData) => {
    return await makeRequest('/profile/save', {
        method: 'POST',
        body: JSON.stringify(profileData),
    }, true);
};

/**
 * Delete a student profile
 * @param {string} profileId - The profile ID
 * @returns {Promise<Object>} The deletion confirmation
 */
export const deleteProfile = async (profileId) => {
    return await makeRequest(`/profile/${profileId}`, {
        method: 'DELETE',
    }, true);
};

// --- User Stats & Applications (Secure) ---

/**
 * Tracks a scholarship application for a user.
 * @param {Object} scholarship - The scholarship object being applied for.
 * @returns {Promise<Object>} The server's confirmation response.
 */
export const trackApplication = async (scholarship) => {
    return await makeRequest('/user/applications', {
        method: 'POST',
        body: JSON.stringify({
            scholarshipId: scholarship._id,
            amount: scholarship.award_info?.funds?.amount || 0,
        }),
    }, true);
};

/**
 * Fetches a user's application statistics (e.g., total applications, potential aid).
 * @param {string} userId - The user's ID.
 * @returns {Promise<Object>} An object with user stats.
 */
export const getUserStats = async (userId) => {
    try {
        return await makeRequest(`/user/stats/${userId}`, {}, true);
    } catch (error) {
        console.error('Error getting user stats:', error);
        return { activeApps: 0, potentialAid: 0 }; // Return default on failure
    }
};

/**
 * Get user's application history
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The user's application history
 */
export const getUserApplications = async (userId) => {
    try {
        return await makeRequest(`/user/applications/${userId}`, {}, true);
    } catch (error) {
        console.error('Error getting user applications:', error);
        return { applications: [] };
    }
};

/**
 * Get user's saved scholarships
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The user's saved scholarships
 */
export const getUserSavedScholarships = async (userId) => {
    try {
        return await makeRequest(`/user/saved-scholarships/${userId}`, {}, true);
    } catch (error) {
        console.error('Error getting saved scholarships:', error);
        return { scholarships: [] };
    }
};

/**
 * Save a scholarship to user's favorites
 * @param {string} userId - The user's ID
 * @param {string} scholarshipId - The scholarship ID
 * @returns {Promise<Object>} The save confirmation
 */
export const saveScholarship = async (userId, scholarshipId) => {
    return await makeRequest('/user/save-scholarship', {
        method: 'POST',
        body: JSON.stringify({ userId, scholarshipId }),
    }, true);
};

/**
 * Remove a scholarship from user's favorites
 * @param {string} userId - The user's ID
 * @param {string} scholarshipId - The scholarship ID
 * @returns {Promise<Object>} The removal confirmation
 */
export const removeSavedScholarship = async (userId, scholarshipId) => {
    return await makeRequest('/user/remove-scholarship', {
        method: 'DELETE',
        body: JSON.stringify({ userId, scholarshipId }),
    }, true);
};

// --- Institution and College Functions (Public) ---

/**
 * Searches for colleges/institutions based on a configuration object.
 * @param {Object} searchConfig - The search filters and pagination settings.
 * @returns {Promise<Object>} The search results.
 */
export const searchInstitutions = async (searchConfig) => {
    try {
        return await makeRequest('/institutions/search', {
            method: 'POST',
            body: JSON.stringify(searchConfig),
        });
    } catch (error) {
        console.error("Failed to search for institutions:", error);
        return { 
            data: [], 
            pagination: { 
                page: 1, 
                limit: 20, 
                totalPages: 1, 
                totalDocuments: 0 
            } 
        };
    }
};

/**
 * Retrieves detailed information for a single college/institution.
 * @param {string} unitId - The unique ID of the institution.
 * @returns {Promise<Object|null>} The institution's details, or null if not found.
 */
export const getInstitutionDetails = async (unitId) => {
    if (!unitId) return null;
    
    try {
        return await makeRequest(`/institutions/${unitId}`);
    } catch (error) {
        if (error.message.includes('404')) return null;
        console.error(`Failed to fetch institution ${unitId}:`, error);
        return null;
    }
};

/**
 * Get multiple institutions by their IDs
 * @param {string[]} unitIds - Array of institution unit IDs
 * @returns {Promise<Object[]>} Array of institution details
 */
export const getInstitutionsByIds = async (unitIds) => {
    if (!unitIds || unitIds.length === 0) return [];
    
    try {
        return await makeRequest('/institutions/batch', {
            method: 'POST',
            body: JSON.stringify({ unitIds }),
        });
    } catch (error) {
        console.error("Failed to fetch institutions by IDs:", error);
        return [];
    }
};

/**
 * Get institutions by filters (advanced search)
 * @param {Object} filters - The search filters
 * @param {Object} pagination - Pagination settings
 * @returns {Promise<Object>} The search results with pagination
 */
export const getInstitutionsByFilters = async (filters, pagination = { page: 1, limit: 20 }) => {
    try {
        return await makeRequest('/institutions/search', {
            method: 'POST',
            body: JSON.stringify({ filters, pagination }),
        });
    } catch (error) {
        console.error("Failed to search institutions by filters:", error);
        return { 
            data: [], 
            pagination: { 
                page: 1, 
                limit: 20, 
                totalPages: 1, 
                totalDocuments: 0 
            } 
        };
    }
};

// --- Probability and Admission Functions (Public) ---

/**
 * Calculates admission probabilities for a student at one or more colleges.
 * @param {Object} studentProfile - The student's academic profile.
 * @param {string[]} collegeIds - An array of college unit IDs.
 * @returns {Promise<Object>} The probability calculation results.
 */
export const calculateProbabilities = async (studentProfile, collegeIds) => {
    try {
        return await makeRequest('/probability/calculate', {
            method: 'POST',
            body: JSON.stringify({ studentProfile, collegeIds }),
        });
    } catch (error) {
        console.error("Failed to calculate probabilities:", error);
        return { results: [] };
    }
};

/**
 * Get probability statistics for a college
 * @param {string} collegeId - The college unit ID
 * @returns {Promise<Object|null>} The probability statistics or null if not found
 */
export const getCollegeProbabilityStats = async (collegeId) => {
    try {
        return await makeRequest(`/probability/stats/${collegeId}`);
    } catch (error) {
        if (error.message.includes('404')) return null;
        console.error(`Failed to fetch probability stats for college ${collegeId}:`, error);
        return null;
    }
};

/**
 * Compare probabilities between multiple colleges
 * @param {Object} studentProfile - The student's profile data
 * @param {string[]} collegeIds - Array of college unit IDs
 * @returns {Promise<Object>} The comparison results
 */
export const compareCollegeProbabilities = async (studentProfile, collegeIds) => {
    try {
        return await makeRequest('/probability/compare', {
            method: 'POST',
            body: JSON.stringify({ studentProfile, collegeIds }),
        });
    } catch (error) {
        console.error("Failed to compare college probabilities:", error);
        return { comparisons: [] };
    }
};

/**
 * Get historical probability trends for a college
 * @param {string} collegeId - The college unit ID
 * @param {number} years - Number of years to look back (default: 5)
 * @returns {Promise<Object|null>} The probability trends or null if not found
 */
export const getProbabilityTrends = async (collegeId, years = 5) => {
    try {
        return await makeRequest(`/probability/trends/${collegeId}?years=${years}`);
    } catch (error) {
        if (error.message.includes('404')) return null;
        console.error(`Failed to fetch probability trends for college ${collegeId}:`, error);
        return null;
    }
};

// --- RAG and AI Functions (Public) ---

/**
 * Sends a query to the Retrieval-Augmented Generation (RAG) service.
 * @param {string} query - The user's question.
 * @param {Object[]} history - The previous conversation history.
 * @returns {Promise<Object>} The AI-generated answer.
 */
export const sendRagQuery = async (query, history = []) => {
    try {
        return await makeRequest('/rag/query', {
            method: 'POST',
            body: JSON.stringify({ question: query, history }),
        });
    } catch (error) {
        console.error("Failed to send RAG query:", error);
        throw error;
    }
};

/**
 * Get top college matches for a student profile
 * @param {Object} profile - The student's profile data
 * @returns {Promise<Object>} The top college matches
 */
export const getTopMatches = async (profile) => {
    try {
        return await makeRequest('/rag/top-matches', {
            method: 'POST',
            body: JSON.stringify({ studentProfile: profile }),
        });
    } catch (error) {
        console.error("Failed to get top matches:", error);
        return { data: [] };
    }
};

/**
 * Get scholarship summary for a student profile
 * @param {Object} profile - The student's profile data
 * @returns {Promise<Object>} The scholarship summary
 */
export const getScholarshipSummary = async (profile) => {
    try {
        return await makeRequest('/rag/scholarships', {
            method: 'POST',
            body: JSON.stringify({ studentProfile: profile }),
        });
    } catch (error) {
        console.error("Failed to get scholarship summary:", error);
        return { data: [] };
    }
};

/**
 * Check RAG service health
 * @returns {Promise<Object>} The health status
 */
export const checkRagHealth = async () => {
    try {
        return await makeRequest('/rag/health');
    } catch (error) {
        console.error("Failed to check RAG health:", error);
        return { status: 'unhealthy', error: error.message };
    }
};

// --- Scholarship Functions (Mixed - Public and Secure) ---

/**
 * Searches for scholarships using a set of parameters (query, filters, sorting).
 * @param {Object} params - The search and filter parameters.
 * @returns {Promise<Object>} The scholarship search results.
 */
export const searchScholarships = async (params) => {
    try {
        return await makeRequest('/scholarships/search', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    } catch (error) {
        console.error("Failed to search scholarships:", error);
        throw error;
    }
};

/**
 * Search for scholarships based on student profile
 * @param {Object} studentProfile - The student's profile data
 * @returns {Promise<Object>} The search results
 */
export const searchScholarshipsByProfile = async (studentProfile) => {
    try {
        return await makeRequest('/scholarships/search', {
            method: 'POST',
            body: JSON.stringify({ studentProfile }),
        });
    } catch (error) {
        console.error('Error searching scholarships:', error);
        throw error;
    }
};

/**
 * Get scholarship recommendations for a student profile
 * @param {Object} studentProfile - The student's profile data
 * @returns {Promise<Object>} The scholarship recommendations
 */
export const getScholarshipRecommendations = async (studentProfile) => {
    try {
        return await makeRequest(`/scholarships/recommendations?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`);
    } catch (error) {
        console.error('Error getting scholarship recommendations:', error);
        throw error;
    }
};

/**
 * Get scholarship statistics for a student profile
 * @param {Object} studentProfile - The student's profile data
 * @returns {Promise<Object>} The scholarship statistics
 */
export const getScholarshipStats = async (studentProfile) => {
    try {
        return await makeRequest(`/scholarships/stats?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`);
    } catch (error) {
        console.error('Error getting scholarship stats:', error);
        throw error;
    }
};

/**
 * Search scholarships by text/keywords
 * @param {string} searchText - The search text
 * @param {Object} studentProfile - Optional student profile for context
 * @returns {Promise<Object>} The search results
 */
export const searchScholarshipsByText = async (searchText, studentProfile = null) => {
    try {
        const params = new URLSearchParams({ q: searchText });
        if (studentProfile) {
            params.append('studentProfile', JSON.stringify(studentProfile));
        }
        return await makeRequest(`/scholarships/search-text?${params}`);
    } catch (error) {
        console.error('Error searching scholarships by text:', error);
        throw error;
    }
};

/**
 * Get scholarships by category
 * @param {string} category - The scholarship category
 * @returns {Promise<Object>} The scholarships in the category
 */
export const getScholarshipsByCategory = async (category) => {
    try {
        return await makeRequest(`/scholarships/category/${encodeURIComponent(category)}`);
    } catch (error) {
        console.error('Error getting scholarships by category:', error);
        throw error;
    }
};

/**
 * Get scholarship categories
 * @returns {Promise<Object>} The available scholarship categories
 */
export const getScholarshipCategories = async () => {
    try {
        return await makeRequest('/scholarships/categories');
    } catch (error) {
        console.error('Error getting scholarship categories:', error);
        throw error;
    }
};

/**
 * Retrieves scholarships with deadlines within a specified number of days.
 * @param {number} [days=30] - The number of days to look ahead for deadlines.
 * @returns {Promise<Object>} A list of scholarships with upcoming deadlines.
 */
export const getUpcomingDeadlines = async (days = 30) => {
    try {
        return await makeRequest(`/scholarships/deadlines?days=${days}`);
    } catch (error) {
        console.error('Error getting upcoming deadlines:', error);
        throw error;
    }
};

/**
 * Advanced scholarship matching with filters
 * @param {Object} studentProfile - The student's profile data
 * @param {Object} filters - The matching filters
 * @returns {Promise<Object>} The matched scholarships
 */
export const advancedScholarshipMatch = async (studentProfile, filters) => {
    try {
        return await makeRequest('/scholarships/match', {
            method: 'POST',
            body: JSON.stringify({ studentProfile, filters }),
        });
    } catch (error) {
        console.error('Error performing advanced scholarship match:', error);
        throw error;
    }
};

/**
 * Finds scholarships that are a good match for a given student profile.
 * @param {Object} studentProfile - The student's profile to match against.
 * @returns {Promise<Object>} A list of matched scholarships.
 */
export const findMatchingScholarships = async (studentProfile) => {
    try {
        return await makeRequest('/matching/scholarships', {
            method: 'POST',
            body: JSON.stringify({ studentProfile }),
        }, true);
    } catch (error) {
        console.error("Failed to find matching scholarships:", error);
        throw error;
    }
};

/**
 * Retrieves a single scholarship by its unique ID.
 * @param {string} id - The ID of the scholarship.
 * @returns {Promise<Object>} The scholarship details.
 */
export const getScholarshipById = async (id) => {
    try {
        return await makeRequest(`/scholarships/${id}`);
    } catch (error) {
        console.error(`Failed to get scholarship ${id}:`, error);
        throw error;
    }
};