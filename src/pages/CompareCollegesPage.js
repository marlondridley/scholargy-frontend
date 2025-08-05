import React, { useState, useEffect } from 'react';
import { searchInstitutions } from '../services/api';

const CompareCollegesPage = ({ setView, studentProfile }) => {
  const [colleges, setColleges] = useState([]);
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    setLoading(true);
    try {
      const result = await searchInstitutions({ query: searchTerm || 'university' });
      setColleges(result.institutions || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    await loadColleges();
  };

  const toggleCollegeSelection = (college) => {
    setSelectedColleges(prev => {
      const isSelected = prev.find(c => c.unit_id === college.unit_id);
      if (isSelected) {
        return prev.filter(c => c.unit_id !== college.unit_id);
      } else {
        return [...prev, college];
      }
    });
  };

  const compareSelectedColleges = () => {
    if (selectedColleges.length < 2) {
      alert('Please select at least 2 colleges to compare');
      return;
    }
    // Navigate to dashboard with selected colleges for comparison
    setView('dashboard');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Compare Colleges</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Selected Colleges */}
      {selectedColleges.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Selected Colleges ({selectedColleges.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedColleges.map((college) => (
              <div key={college.unit_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{college.institution_name}</h3>
                    <p className="text-sm text-gray-600">{college.city}, {college.state}</p>
                  </div>
                  <button
                    onClick={() => toggleCollegeSelection(college)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          {selectedColleges.length >= 2 && (
            <button
              onClick={compareSelectedColleges}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Compare Selected Colleges
            </button>
          )}
        </div>
      )}

      {/* College List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Available Colleges</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading colleges...</p>
            </div>
          ) : (
            colleges.map((college) => {
              const isSelected = selectedColleges.find(c => c.unit_id === college.unit_id);
              return (
                <div
                  key={college.unit_id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => toggleCollegeSelection(college)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{college.institution_name}</h3>
                      <p className="text-sm text-gray-600">{college.city}, {college.state}</p>
                      {college.website && (
                        <a
                          href={college.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {isSelected && (
                        <span className="text-blue-600">✓</span>
                      )}
                      <button
                        className={`px-3 py-1 rounded-full text-sm ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareCollegesPage; 