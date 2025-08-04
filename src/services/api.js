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



export const sendRagQuery = async (query) => {
  try {
    const response = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch RAG results');
    }

    return await response.json();
  } catch (error) {
    console.error('RAG service error:', error);
    
    // Provide helpful fallback responses based on the query
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('scholarship')) {
      return {
        answer: "I can help you find scholarships! Based on your profile, I recommend checking our scholarship database for opportunities that match your academic level, interests, and background. You can browse by category, search by keywords, or use our smart matching system to find the best opportunities for you."
      };
    } else if (lowerQuery.includes('deadline') || lowerQuery.includes('application')) {
      return {
        answer: "Application deadlines vary by institution and scholarship. I recommend checking our upcoming deadlines section and setting up reminders for important dates. Many scholarships have deadlines in the fall and winter months, so it's good to start early!"
      };
    } else if (lowerQuery.includes('essay') || lowerQuery.includes('requirement')) {
      return {
        answer: "Essay requirements typically include personal statements, supplemental essays, and scholarship-specific prompts. Focus on telling your unique story, highlighting your achievements, and explaining why you're a good fit for the opportunity. Our AI can help you brainstorm topics and structure your essays."
      };
    } else if (lowerQuery.includes('stem') || lowerQuery.includes('science') || lowerQuery.includes('technology')) {
      return {
        answer: "Great question! There are many STEM scholarships available for students interested in science, technology, engineering, and mathematics. These often have specific requirements related to your field of study, GPA, and sometimes research experience. Check our STEM category for targeted opportunities."
      };
    } else if (lowerQuery.includes('merit') || lowerQuery.includes('aid')) {
      return {
        answer: "Merit aid opportunities are based on academic achievement, leadership, and special talents. Many colleges offer merit scholarships, and there are also external organizations that provide merit-based funding. Your strong academic profile makes you competitive for these opportunities!"
      };
    } else {
      return {
        answer: "I'm here to help with your college and scholarship questions! You can ask me about finding scholarships, application deadlines, essay requirements, financial aid, or any other college-related topics. What would you like to know more about?"
      };
    }
  }
};

// Streaming RAG query for real-time responses
export const sendRagQueryStream = async (query, onChunk, onComplete, onError) => {
  try {
    const response = await fetch('/api/rag/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch streaming RAG results');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.error) {
              onError(data.error);
              return;
            }
            
            if (data.type === 'chunk' && data.content) {
              onChunk(data.content);
            } else if (data.type === 'done') {
              onComplete(data);
              return;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming chunk:', parseError);
          }
        }
      }
    }
  } catch (error) {
    console.error('Streaming RAG service error:', error);
    onError('Service temporarily unavailable');
  }
};

/**
 * Search scholarships with smart matching
 */
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
    return { scholarships: [], stats: {}, total_count: 0 };
  }
};

/**
 * Get scholarship recommendations
 */
export const getScholarshipRecommendations = async (studentProfile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/recommendations?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarship recommendations:", error);
    return { recommendations: [], total_count: 0 };
  }
};

/**
 * Get scholarship statistics
 */
export const getScholarshipStats = async (studentProfile = null) => {
  try {
    const url = studentProfile 
      ? `${API_BASE_URL}/scholarships/stats?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`
      : `${API_BASE_URL}/scholarships/stats`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarship stats:", error);
    return { stats: {} };
  }
};

/**
 * Get personalized scholarship insights and analytics
 */
export const getScholarshipInsights = async (studentProfile) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/insights?studentProfile=${encodeURIComponent(JSON.stringify(studentProfile))}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarship insights:", error);
    return { insights: {}, timestamp: new Date().toISOString() };
  }
};

/**
 * Advanced scholarship matching with filters
 */
export const advancedScholarshipMatch = async (studentProfile, filters = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile, filters }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to perform advanced matching:", error);
    return { scholarships: [], total_count: 0 };
  }
};

/**
 * Get scholarships by category
 */
export const getScholarshipsByCategory = async (category, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/category/${category}?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarships by category:", error);
    return { scholarships: [], total_count: 0 };
  }
};

/**
 * Get scholarships with upcoming deadlines
 */
export const getUpcomingDeadlines = async (days = 30) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/deadlines?days=${days}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get upcoming deadlines:", error);
    return { upcoming_deadlines: [], total_value: 0 };
  }
};

/**
 * Text search scholarships
 */
export const searchScholarshipsByText = async (searchText, limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/search-text?q=${encodeURIComponent(searchText)}&limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to search scholarships by text:", error);
    return { scholarships: [], total_count: 0 };
  }
};

/**
 * Get scholarship categories
 */
export const getScholarshipCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/categories`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarship categories:", error);
    return { categories: [], total_scholarships: 0 };
  }
};

/**
 * Search scholarships by keywords using idx_keywords
 */
export const searchScholarshipsByKeywords = async (keywords, studentProfile = null, limit = 20) => {
  try {
    const params = new URLSearchParams({
      keywords: keywords.join(','),
      limit: limit.toString()
    });
    
    if (studentProfile) {
      params.append('studentProfile', JSON.stringify(studentProfile));
    }
    
    const response = await fetch(`${API_BASE_URL}/scholarships/keywords?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to search scholarships by keywords:", error);
    return { scholarships: [], total_count: 0, keywords_searched: keywords };
  }
};

/**
 * Search scholarships by organization using idx_organization
 */
export const searchScholarshipsByOrganization = async (organization, studentProfile = null, limit = 20) => {
  try {
    const params = new URLSearchParams({
      organization: organization,
      limit: limit.toString()
    });
    
    if (studentProfile) {
      params.append('studentProfile', JSON.stringify(studentProfile));
    }
    
    const response = await fetch(`${API_BASE_URL}/scholarships/organization?${params}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to search scholarships by organization:", error);
    return { scholarships: [], total_count: 0, organization_searched: organization };
  }
};

/**
 * Get scholarships with contact information using idx_contact_emails
 */
export const getScholarshipsWithContactInfo = async (limit = 20) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/contact-info?limit=${limit}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get scholarships with contact info:", error);
    return { scholarships: [], total_count: 0 };
  }
};

/**
 * Advanced comprehensive search leveraging multiple indexes
 */
export const comprehensiveScholarshipSearch = async (studentProfile, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/scholarships/comprehensive-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile, options }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to perform comprehensive search:", error);
    return { scholarships: [], total_count: 0, search_options: options };
  }
};
