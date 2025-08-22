// src/services/api.js
// Single, consolidated file for all API interactions
import { supabase } from '../utils/supabase';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Authentication token not found.");
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const makeRequest = async (endpoint, options = {}, requireAuth = false) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        let headers = { 'Content-Type': 'application/json' };
        if (requireAuth) {
            try {
                headers = await getAuthHeaders();
            } catch (authError) {
                console.error('Authentication failed:', authError);
                throw new Error('Authentication required. Please log in again.');
            }
        }
        const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error(`API request failed for ${endpoint}:`, error);
        throw error;
    }
};

// --- Dashboard Functions ---
export const getTopMatches = async (userId = null) => {
    try {
        const params = userId ? `?userId=${userId}` : '';
        return await makeRequest(`/dashboard/top-matches${params}`);
    } catch (error) {
        console.error('getTopMatches failed, returning fallback data:', error);
        return { results: [] }; // Safe fallback
    }
};

export const getScholarshipStats = async (userId = null) => {
    try {
        const params = userId ? `?userId=${userId}` : '';
        return await makeRequest(`/dashboard/scholarship-stats${params}`);
    } catch (error) {
        console.error('getScholarshipStats failed, returning fallback data:', error);
        return { totalEligibleAmount: 0, opportunities: [] }; // Safe fallback
    }
};

export const getUpcomingDeadlines = async (days = 30) => {
    try {
        return await makeRequest(`/dashboard/upcoming-deadlines?days=${days}`);
    } catch (error) {
        console.error('getUpcomingDeadlines failed, returning fallback data:', error);
        return { deadlines: [] }; // Safe fallback
    }
};

export const getNextStepsData = (studentProfile, collegeMatches = [], scholarships = [], userId = null) => {
    const payload = { studentProfile, collegeMatches, scholarships };
    if (userId) payload.userId = userId;
    return makeRequest('/dashboard/next-steps', {
        method: 'POST',
        body: JSON.stringify(payload)
    }, true);
};

// --- Profile Management ---
export const getProfile = (userId) => makeRequest(`/profile/${userId}`, {}, true);
export const createProfile = (userId, profileData) => makeRequest('/profile', { 
    method: 'POST', 
    body: JSON.stringify({ profileData }) 
}, true);
export const updateProfile = (userId, profileData) => makeRequest(`/profile/${userId}`, { 
    method: 'PUT', 
    body: JSON.stringify({ profileData }) 
}, true);
export const getProfileAssessment = (userId) => makeRequest(`/profile/${userId}/assessment`, {}, true);
export const saveProfile = (userId, profileData) => makeRequest(`/profile/${userId}/save`, {
    method: 'POST',
    body: JSON.stringify({ profileData })
}, true);

// --- User Stats ---
export const getUserStats = (userId) => makeRequest(`/user/stats/${userId}`, {}, true);

// --- Institution and College Functions ---
export const searchInstitutions = (searchConfig) => makeRequest('/institutions/search', { 
    method: 'POST', 
    body: JSON.stringify(searchConfig) 
});
export const getInstitutionDetails = (unitId) => makeRequest(`/institutions/${unitId}`);
export const getInstitutionsByIds = async (unitIds) => {
    try {
        const response = await makeRequest('/institutions/batch', { 
            method: 'POST', 
            body: JSON.stringify({ unitIds }) 
        });
        return response.institutions || []; // Return the institutions array from the response
    } catch (error) {
        console.error('getInstitutionsByIds failed, returning fallback data:', error);
        return []; // Safe fallback
    }
};

// --- Probability and Admission Functions ---
export const calculateProbabilities = (studentProfile, collegeIds) => makeRequest('/probability/calculate', { 
    method: 'POST', 
    body: JSON.stringify({ studentProfile, collegeIds }) 
});

// --- RAG and AI Functions ---
export const sendRagQuery = (query, context = []) => makeRequest('/rag/query', { 
    method: 'POST', 
    body: JSON.stringify({ query, context }) 
});

export const getTopMatchesFromRag = (studentProfile) => makeRequest('/rag/top-matches', {
    method: 'POST',
    body: JSON.stringify({ studentProfile })
});

export const getScholarshipSummary = (studentProfile, scholarshipRecommendations = []) => makeRequest('/rag/scholarships', {
    method: 'POST',
    body: JSON.stringify({ studentProfile, scholarshipRecommendations })
});

// --- Scholarship Functions ---
export const searchScholarships = (params) => makeRequest('/scholarships/search', { 
    method: 'POST', 
    body: JSON.stringify(params) 
});

export const getScholarshipStatsByProfile = (studentProfile) => makeRequest('/scholarships/stats', {
    method: 'POST',
    body: JSON.stringify({ studentProfile })
});

export const getUpcomingScholarshipDeadlines = (days = 30) => makeRequest(`/scholarships/upcoming-deadlines?days=${days}`);

export const findMatchingScholarships = (studentProfile) => makeRequest('/matching/scholarships', { 
    method: 'POST', 
    body: JSON.stringify({ studentProfile }) 
}, true);

export const getScholarshipById = async (id) => {
    try {
        const response = await makeRequest(`/scholarships/${id}`);
        return response.scholarship || null; // Return the scholarship object from the response
    } catch (error) {
        console.error('getScholarshipById failed:', error);
        return null; // Safe fallback
    }
};

// --- StudentVue Functions ---
export const getStudentVueData = (studentProfile) => makeRequest('/studentvue', {
    method: 'POST',
    body: JSON.stringify({ studentProfile })
}, true);

// --- Report Generation ---
export const generateReport = (studentProfile, collegeData) => makeRequest('/report/generate', {
    method: 'POST',
    body: JSON.stringify({ studentProfile, collegeData })
}, true);

// --- Career Forecaster ---
export const getCareerForecast = (studentProfile, careerGoals) => makeRequest('/forecaster/predict', {
    method: 'POST',
    body: JSON.stringify({ studentProfile, careerGoals })
}, true);

// --- User Applications and History ---
export const getUserApplications = (userId) => makeRequest(`/user/applications/${userId}`, {}, true);
export const getUserSavedScholarships = (userId) => makeRequest(`/user/saved-scholarships/${userId}`, {}, true);
export const saveScholarship = (userId, scholarshipId) => makeRequest('/user/save-scholarship', {
    method: 'POST',
    body: JSON.stringify({ userId, scholarshipId })
}, true);
export const removeSavedScholarship = (userId, scholarshipId) => makeRequest('/user/remove-scholarship', {
    method: 'DELETE',
    body: JSON.stringify({ userId, scholarshipId })
}, true);