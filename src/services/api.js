// frontend/src/services/api.js
import { supabase } from '../utils/supabase';

const API_BASE_URL = '/api';

// Helper function to get secure authentication headers
const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
        console.error("No auth token found for API request.");
        return { 'Content-Type': 'application/json' };
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// --- Profile Management (Secure) ---
export const getProfile = async (userId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, { headers });
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Failed to fetch profile");
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const createProfile = async (userId, profileData) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId, profileData }),
        });
        if (!response.ok) throw new Error("Failed to create profile");
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const updateProfile = async (userId, profileData) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ profileData }),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to update profile");
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};


// --- User Stats & Applications (Secure) ---
export const trackApplication = async (userId, scholarship) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/user/applications`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                scholarshipId: scholarship._id,
                amount: scholarship.award_info?.funds?.amount || 0,
            }),
        });
        if (!response.ok) throw new Error('Failed to track application');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getUserStats = async (userId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/user/stats/${userId}`, { headers });
        if (!response.ok) return { activeApps: 0, potentialAid: 0 };
        return await response.json();
    } catch (error) {
        console.error(error);
        return { activeApps: 0, potentialAid: 0 };
    }
};

// --- Institution and College Functions ---
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
        return { data: [], pagination: {} };
    }
};

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

// --- RAG and AI Functions ---
export const sendRagQuery = async (query, history) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rag/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: query, history }),
        });
        if (!response.ok) throw new Error('Failed to fetch RAG results');
        return await response.json();
    } catch (error) {
        console.error('RAG service error:', error);
        return { answer: "I'm sorry, but I'm having trouble connecting to my knowledge base right now." };
    }
};

// --- Scholarship Functions ---
export const searchScholarships = async (studentProfile, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentProfile, ...options }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to search scholarships:", error);
        return { scholarships: [] };
    }
};

export const getScholarshipStats = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/stats`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get scholarship stats:", error);
        return { totalScholarships: 0, totalAmount: 0, averageAmount: 0 };
    }
};

export const getScholarshipRecommendations = async (studentProfile) => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentProfile }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get scholarship recommendations:", error);
        return { recommendations: [] };
    }
};

export const getScholarshipCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/categories`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get scholarship categories:", error);
        return { categories: [] };
    }
};

export const searchScholarshipsByText = async (searchTerm, filters = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/search-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ searchTerm, filters }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to search scholarships by text:", error);
        return { scholarships: [] };
    }
};

export const advancedScholarshipMatch = async (studentProfile) => {
    try {
        const response = await fetch(`${API_BASE_URL}/matching/advanced`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentProfile }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to perform advanced scholarship matching:", error);
        return { matches: [] };
    }
};

export const getScholarshipsByCategory = async (category) => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/category/${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get scholarships by category:", error);
        return { scholarships: [] };
    }
};

export const getProfileAssessment = async (userId) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/profile/assessment/${userId}`, { headers });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get profile assessment:", error);
        return { assessment: null };
    }
};

export const getUpcomingDeadlines = async (days = 30) => {
    try {
        const response = await fetch(`${API_BASE_URL}/scholarships/deadlines?days=${days}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get upcoming deadlines:", error);
        return { upcoming_deadlines: [] };
    }
};