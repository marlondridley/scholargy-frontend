import React, { useState, useEffect, useCallback } from 'react';
import { 
  searchScholarships, 
  getScholarshipRecommendations, 
  getScholarshipStats, 
  advancedScholarshipMatch,
  getScholarshipCategories,
  getUpcomingDeadlines,
  searchScholarshipsByText,
  getScholarshipsByCategory
} from '../services/api';

const ScholarshipPage = ({ studentProfile, setView }) => {
  const [scholarships, setScholarships] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState({});
  const [categories, setCategories] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    deadlineFilter: '',
    minScore: 30
  });
  const [activeTab, setActiveTab] = useState('recommendations');

  const loadScholarshipData = useCallback(async () => {
    setLoading(true);
    try {
      // Load all data in parallel
      const [
        searchResult,
        recommendationsResult,
        statsResult,
        categoriesResult,
        deadlinesResult
      ] = await Promise.all([
        searchScholarships(studentProfile),
        getScholarshipRecommendations(studentProfile),
        getScholarshipStats(studentProfile),
        getScholarshipCategories(),
        getUpcomingDeadlines(30)
      ]);

      setScholarships(searchResult.scholarships || []);
      setRecommendations(recommendationsResult.recommendations || []);
      setStats(statsResult.stats || {});
      setCategories(categoriesResult.categories || []);
      setUpcomingDeadlines(deadlinesResult.upcoming_deadlines || []);
    } catch (error) {
      console.error('Error loading scholarship data:', error);
    } finally {
      setLoading(false);
    }
  }, [studentProfile]);

  // Load scholarship data on component mount
  useEffect(() => {
    loadScholarshipData();
  }, [loadScholarshipData]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const result = await searchScholarshipsByText(searchTerm);
      setScholarships(result.scholarships || []);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedMatch = async () => {
    setLoading(true);
    try {
      const result = await advancedScholarshipMatch(studentProfile, filters);
      setScholarships(result.scholarships || []);
      setActiveTab('advanced');
    } catch (error) {
      console.error('Error performing advanced match:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    try {
      const result = await getScholarshipsByCategory(category);
      setScholarships(result.scholarships || []);
      setActiveTab('category');
    } catch (error) {
      console.error('Error filtering by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && scholarships.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Scholarship Hub</h1>
              <p className="text-blue-100">Discover and apply to scholarships that match your profile</p>
            </div>
            <div className="text-4xl">🎓</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-lg">$</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="font-bold text-gray-900">
                {formatCurrency(stats.total_value || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">📚</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available</p>
              <p className="font-bold text-gray-900">
                {stats.total_scholarships || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-bold text-lg">⏰</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Urgent</p>
              <p className="font-bold text-gray-900">
                {upcomingDeadlines.filter(d => d.urgency_level === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600 font-bold text-lg">🎯</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Your Match</p>
              <p className="font-bold text-gray-900">
                {scholarships.filter(s => s.fit_score >= 70).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scholarships by keywords..."
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Filters Button */}
          <button
            onClick={() => setActiveTab('advanced')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Advanced Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {activeTab === 'advanced' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Amount
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
                placeholder="e.g., 1000"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Amount
              </label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
                placeholder="e.g., 50000"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline Within (days)
              </label>
              <input
                type="number"
                value={filters.deadlineFilter}
                onChange={(e) => setFilters({...filters, deadlineFilter: e.target.value})}
                placeholder="e.g., 30"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Match Score
              </label>
              <input
                type="number"
                value={filters.minScore}
                onChange={(e) => setFilters({...filters, minScore: e.target.value})}
                min="0"
                max="100"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdvancedMatch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setFilters({minAmount: '', maxAmount: '', deadlineFilter: '', minScore: 30})}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'recommendations' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recommendations ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Scholarships ({scholarships.length})
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'deadlines' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Deadlines ({upcomingDeadlines.length})
          </button>
        </div>
      </div>

      {/* Scholarship List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'recommendations' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}

            {activeTab === 'deadlines' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingDeadlines.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}

            {activeTab === 'search' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}

            {activeTab === 'category' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scholarships.map((scholarship) => (
                  <ScholarshipCard key={scholarship.id} scholarship={scholarship} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Scholarship Card Component
const ScholarshipCard = ({ scholarship }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'urgent': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getFitScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
          {scholarship.title}
        </h3>
        <div className="flex space-x-2">
          {scholarship.fit_score && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getFitScoreColor(scholarship.fit_score)}`}>
              {scholarship.fit_score}% Match
            </span>
          )}
          {scholarship.urgency_level && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getUrgencyColor(scholarship.urgency_level)}`}>
              {scholarship.urgency_level}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {scholarship.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Provider:</span>
          <span className="font-medium">{scholarship.provider}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Amount:</span>
          <span className="font-bold text-green-600">
            {formatCurrency(scholarship.amount)}
          </span>
        </div>
        {scholarship.deadline && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Deadline:</span>
            <span className="font-medium">
              {new Date(scholarship.deadline).toLocaleDateString()}
            </span>
          </div>
        )}
        {scholarship.days_until_deadline && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Days Left:</span>
            <span className={`font-medium ${
              scholarship.days_until_deadline <= 7 ? 'text-red-600' : 
              scholarship.days_until_deadline <= 30 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {scholarship.days_until_deadline} days
            </span>
          </div>
        )}
      </div>

      {scholarship.categories && scholarship.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {scholarship.categories.slice(0, 3).map((category, index) => (
            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          View Details
        </button>
        <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
          Apply Now
        </button>
      </div>
    </div>
  );
};

export default ScholarshipPage; 