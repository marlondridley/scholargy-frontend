import React, { useState, useEffect } from 'react';
import { searchInstitutions, compareCollegeProbabilities } from '../services/api';

const CompareCollegesPage = ({ setView, studentProfile }) => {
  const [college1, setCollege1] = useState({ searchTerm: '', results: [], selected: null });
  const [college2, setCollege2] = useState({ searchTerm: '', results: [], selected: null });
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const handleSearch = async (collegeNum) => {
    const searchTerm = collegeNum === 1 ? college1.searchTerm : college2.searchTerm;
    if (!searchTerm.trim()) return;

    const setLoading = collegeNum === 1 ? setLoading1 : setLoading2;
    const setResults = collegeNum === 1 ? 
      (results) => setCollege1(prev => ({ ...prev, results })) :
      (results) => setCollege2(prev => ({ ...prev, results }));

    setLoading(true);
    try {
      const response = await searchInstitutions({ 
        filters: { "general_info.name": { $regex: searchTerm, $options: 'i' } } 
      });
      setResults(response.data || []);
    } catch (error) {
      console.error('Error searching colleges:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectCollege = (college, collegeNum) => {
    const setSelected = collegeNum === 1 ? 
      (college) => setCollege1(prev => ({ ...prev, selected: college })) :
      (college) => setCollege2(prev => ({ ...prev, selected: college }));
    
    setSelected(college);
  };

  const generateComparison = async () => {
    if (!college1.selected || !college2.selected) {
      alert('Please select two colleges to compare');
      return;
    }

    setLoadingComparison(true);
    try {
      const collegeIds = [college1.selected.unitid, college2.selected.unitid];
      const comparisonResult = await compareCollegeProbabilities(studentProfile, collegeIds);
      setComparison(comparisonResult);
    } catch (error) {
      console.error('Error generating comparison:', error);
      alert('Failed to generate comparison. Please try again.');
    } finally {
      setLoadingComparison(false);
    }
  };

  const renderCollegeSearch = (collegeNum) => {
    const college = collegeNum === 1 ? college1 : college2;
    const setSearchTerm = collegeNum === 1 ? 
      (term) => setCollege1(prev => ({ ...prev, searchTerm: term })) :
      (term) => setCollege2(prev => ({ ...prev, searchTerm: term }));
    const loading = collegeNum === 1 ? loading1 : loading2;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">College {collegeNum}</h3>
        
        {/* Search Input */}
        <div className="flex space-x-4 mb-4">
          <input
            type="text"
            placeholder={`Search for college ${collegeNum}...`}
            value={college.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleSearch(collegeNum)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Selected College */}
        {college.selected && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-green-800">{college.selected.general_info?.name}</h4>
                <p className="text-sm text-green-600">
                  {college.selected.general_info?.city}, {college.selected.general_info?.state}
                </p>
              </div>
              <button
                onClick={() => selectCollege(null, collegeNum)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!college.selected && college.results.length > 0 && (
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {college.results.map((result) => (
              <div
                key={result.unitid}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => selectCollege(result, collegeNum)}
              >
                <h4 className="font-semibold text-gray-900">{result.general_info?.name}</h4>
                <p className="text-sm text-gray-600">
                  {result.general_info?.city}, {result.general_info?.state}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
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

      {/* College Search Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {renderCollegeSearch(1)}
        {renderCollegeSearch(2)}
      </div>

      {/* Generate Comparison Button */}
      {college1.selected && college2.selected && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ready to Compare</h3>
              <p className="text-gray-600">
                {college1.selected.general_info?.name} vs {college2.selected.general_info?.name}
              </p>
            </div>
            <button
              onClick={generateComparison}
              disabled={loadingComparison}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-semibold"
            >
              {loadingComparison ? 'Generating...' : 'Generate Comparison Report'}
            </button>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparison && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold mb-4">Comparison Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* College 1 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">{college1.selected.general_info?.name}</h4>
              {comparison.comparisons?.find(c => c.unitid === college1.selected.unitid) && (
                <div className="space-y-2">
                  <p><strong>Admission Probability:</strong> {
                    comparison.comparisons.find(c => c.unitid === college1.selected.unitid)?.probability || 'N/A'
                  }%</p>
                  <p><strong>Category:</strong> {
                    comparison.comparisons.find(c => c.unitid === college1.selected.unitid)?.category || 'N/A'
                  }</p>
                </div>
              )}
            </div>

            {/* College 2 */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">{college2.selected.general_info?.name}</h4>
              {comparison.comparisons?.find(c => c.unitid === college2.selected.unitid) && (
                <div className="space-y-2">
                  <p><strong>Admission Probability:</strong> {
                    comparison.comparisons.find(c => c.unitid === college2.selected.unitid)?.probability || 'N/A'
                  }%</p>
                  <p><strong>Category:</strong> {
                    comparison.comparisons.find(c => c.unitid === college2.selected.unitid)?.category || 'N/A'
                  }</p>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Recommendations</h4>
            <p className="text-yellow-700 text-sm">
              Based on your profile, we recommend applying to a mix of reach, target, and safety schools. 
              Consider your academic strengths and extracurricular activities when making your final decision.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompareCollegesPage; 