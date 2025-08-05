import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getScholarshipById } from '../services/api';

const ScholarshipDetailPage = ({ setView }) => {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadScholarship = async () => {
      try {
        setLoading(true);
        const result = await getScholarshipById(id);
        setScholarship(result.scholarship);
      } catch (err) {
        console.error('Error loading scholarship:', err);
        setError('Failed to load scholarship details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadScholarship();
    }
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg font-semibold mb-2">{error}</div>
        <button
          onClick={() => setView('scholarships')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Scholarships
        </button>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-600 text-lg font-semibold mb-2">Scholarship not found</div>
        <button
          onClick={() => setView('scholarships')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Scholarships
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setView('scholarships')}
              className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Back to Scholarships</span>
            </button>
          </div>
          <div className="text-4xl">🎓</div>
        </div>
      </div>

      {/* Scholarship Details */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header Section */}
        <div className="bg-gray-50 p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {scholarship.title}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {scholarship.description}
              </p>
            </div>
            <div className="flex space-x-2">
              {scholarship.fit_score && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getFitScoreColor(scholarship.fit_score)}`}>
                  {scholarship.fit_score}% Match
                </span>
              )}
              {scholarship.urgency_level && (
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getUrgencyColor(scholarship.urgency_level)}`}>
                  {scholarship.urgency_level}
                </span>
              )}
            </div>
          </div>

          {/* Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(scholarship.amount)}
              </div>
              <div className="text-sm text-gray-500">Award Amount</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {scholarship.provider}
              </div>
              <div className="text-sm text-gray-500">Provider</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'No deadline'}
              </div>
              <div className="text-sm text-gray-500">Deadline</div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="p-6 space-y-6">
          {/* Requirements */}
          {scholarship.requirements && scholarship.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {scholarship.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Categories */}
          {scholarship.categories && scholarship.categories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {scholarship.categories.map((category, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fields of Study */}
          {scholarship.fields_of_study && scholarship.fields_of_study.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Fields of Study</h3>
              <div className="flex flex-wrap gap-2">
                {scholarship.fields_of_study.map((field, index) => (
                  <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Academic Levels */}
          {scholarship.academic_levels && scholarship.academic_levels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Levels</h3>
              <div className="flex flex-wrap gap-2">
                {scholarship.academic_levels.map((level, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Demographics */}
          {scholarship.demographics && Object.keys(scholarship.demographics).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(scholarship.demographics).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Data (if available) */}
          {scholarship.raw_data && Object.keys(scholarship.raw_data).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(scholarship.raw_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex space-x-4">
            <button
              onClick={() => scholarship.application_url && scholarship.application_url !== '#' ? window.open(scholarship.application_url, '_blank') : alert('Application link not available')}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Apply Now
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetailPage; 