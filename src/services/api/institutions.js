// api/institutions.js - Institution and college data API functions

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
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
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
 * Get multiple institutions by their IDs
 */
export const getInstitutionsByIds = async (unitIds) => {
  if (!unitIds || unitIds.length === 0) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/institutions/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch institutions by IDs:", error);
    return [];
  }
};

/**
 * Get institutions by filters (advanced search)
 */
export const getInstitutionsByFilters = async (filters, pagination = { page: 1, limit: 20 }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/institutions/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filters, pagination }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to search institutions by filters:", error);
    return { data: [], pagination: { page: 1, limit: 20, totalPages: 1, totalDocuments: 0 } };
  }
}; 