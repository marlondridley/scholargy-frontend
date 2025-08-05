// frontend/src/services/api/scholarships.js - Frontend API client for scholarships

const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : '/api');

/**
 * Search for scholarships based on student profile
 */
export const searchScholarships = async (studentProfile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentProfile }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching scholarships:', error);
    throw error;
  }
};

/**
 * Get scholarship recommendations for a student profile
 */
export const getScholarshipRecommendations = async (studentProfile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/recommendations?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scholarship recommendations:', error);
    throw error;
  }
};

/**
 * Get scholarship statistics for a student profile
 */
export const getScholarshipStats = async (studentProfile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/stats?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scholarship stats:', error);
    throw error;
  }
};

/**
 * Search scholarships by text/keywords
 */
export const searchScholarshipsByText = async (searchText, studentProfile = null) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/search-text?q=${encodeURIComponent(searchText)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching scholarships by text:', error);
    throw error;
  }
};

/**
 * Get scholarships by category
 */
export const getScholarshipsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scholarships by category:', error);
    throw error;
  }
};

/**
 * Get scholarship categories
 */
export const getScholarshipCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scholarship categories:', error);
    throw error;
  }
};

/**
 * Get upcoming deadlines
 */
export const getUpcomingDeadlines = async (days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/deadlines?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting upcoming deadlines:', error);
    throw error;
  }
};

/**
 * Advanced scholarship matching with filters
 */
export const advancedScholarshipMatch = async (studentProfile, filters) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentProfile, filters }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error performing advanced scholarship match:', error);
    throw error;
  }
};

/**
 * Get scholarship by ID
 */
export const getScholarshipById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting scholarship by ID:', error);
    throw error;
  }
};