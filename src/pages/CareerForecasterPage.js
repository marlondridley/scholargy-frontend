import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const CareerForecasterPage = () => {
  const { user } = useAuth();
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    careerGoal: '',
    majorInterest: '',
    targetColleges: '',
    financialGoals: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateForecast = async () => {
    if (!formData.careerGoal || !formData.majorInterest) {
      setError('Please fill in career goal and major interest');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/forecaster/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          userId: user?.id,
          careerGoal: formData.careerGoal,
          majorInterest: formData.majorInterest,
          targetColleges: formData.targetColleges.split(',').map(c => c.trim()).filter(c => c),
          financialGoals: formData.financialGoals
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate career forecast');
      }

      const data = await response.json();
      setForecastData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Career Forecaster</h1>
        <p className="text-gray-600 mb-8">
          Get AI-powered insights into your career path, including financial projections and educational recommendations.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Goal *
            </label>
            <input
              type="text"
              name="careerGoal"
              value={formData.careerGoal}
              onChange={handleInputChange}
              placeholder="e.g., Software Engineer, Doctor, Teacher"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Major Interest *
            </label>
            <input
              type="text"
              name="majorInterest"
              value={formData.majorInterest}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science, Biology, Education"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Colleges (comma-separated)
            </label>
            <input
              type="text"
              name="targetColleges"
              value={formData.targetColleges}
              onChange={handleInputChange}
              placeholder="e.g., Stanford, MIT, UC Berkeley"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Goals
            </label>
            <input
              type="text"
              name="financialGoals"
              value={formData.financialGoals}
              onChange={handleInputChange}
              placeholder="e.g., $100k salary, debt-free graduation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={generateForecast}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Forecast...' : 'Generate Career Forecast'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {forecastData && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Career Forecast</h2>
              
              {forecastData.salaryProjections && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Salary Projections</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(forecastData.salaryProjections).map(([year, salary]) => (
                      <div key={year} className="bg-white p-4 rounded border">
                        <p className="text-sm text-gray-600">{year}</p>
                        <p className="text-xl font-semibold text-green-600">${salary?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {forecastData.educationPath && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Recommended Education Path</h3>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-gray-700">{forecastData.educationPath}</p>
                  </div>
                </div>
              )}

              {forecastData.recommendations && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">AI Recommendations</h3>
                  <div className="bg-white p-4 rounded border">
                    <div className="prose prose-sm max-w-none">
                      {forecastData.recommendations.split('\n').map((line, index) => (
                        <p key={index} className="mb-2">{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerForecasterPage;
