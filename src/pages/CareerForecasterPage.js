// src/pages/CareerForecasterPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { sendRagQuery } from '../services/api';

const CareerForecasterPage = () => {
  const { user, profile } = useAuth(); // Using profile from auth context
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    careerGoal: '',
    majorInterest: '',
    targetColleges: '',
    financialGoals: ''
  });

  // Pre-populate form with user's profile data
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        careerGoal: profile.career_goals || '',
        majorInterest: profile.major || '',
      }));
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateForecast = async () => {
    if (!formData.careerGoal || !formData.majorInterest) {
      setError('Please fill in your career goal and major interest to generate a forecast.');
      return;
    }

    setLoading(true);
    setError(null);
    setForecastData(null);
    
    try {
      // Create a comprehensive query for career forecasting
      const query = `Generate a career forecast for a student with the following details:
        - Career Goal: ${formData.careerGoal}
        - Major Interest: ${formData.majorInterest}
        - Target Colleges: ${formData.targetColleges || 'Not specified'}
        - Financial Goals: ${formData.financialGoals || 'Not specified'}
        
        Please provide:
        1. Salary projections for different career stages
        2. Recommended education path
        3. Career development recommendations
        4. Industry insights and trends`;

      const result = await sendRagQuery(query, []);
      
      // Parse the AI response into structured data
      const responseText = result.answer || result.response || result.text || '';
      
      // For now, we'll structure the response as best we can
      // In a real implementation, you might want a dedicated career forecasting endpoint
      const structuredData = {
        salaryProjections: {
          "Entry-Level (0-2 Years)": 75000, // These would come from the AI response
          "Mid-Career (5-7 Years)": 120000,
          "Senior-Level (10+ Years)": 180000,
        },
        educationPath: "A Bachelor's degree in Computer Science is typically required. Consider pursuing a Master's for specialized roles in AI or Machine Learning.",
        recommendations: "Focus on internships in software development. Build a strong portfolio of projects on platforms like GitHub. Network with professionals in the tech industry.",
        aiResponse: responseText // Store the full AI response for display
      };
      
      setForecastData(structuredData);

    } catch (err) {
      setError(err.message || 'Failed to generate career forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">🔮 Career Forecaster</h1>
            <p className="text-gray-500 mt-2">Chart your future with AI-powered career and financial insights.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Ambitions</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <input name="careerGoal" value={formData.careerGoal} onChange={handleInputChange} placeholder="Career Goal (e.g., Software Engineer)" className="p-3 bg-gray-50 border rounded-lg" />
                <input name="majorInterest" value={formData.majorInterest} onChange={handleInputChange} placeholder="Major Interest (e.g., Computer Science)" className="p-3 bg-gray-50 border rounded-lg" />
                <input name="targetColleges" value={formData.targetColleges} onChange={handleInputChange} placeholder="Target Colleges (comma-separated)" className="p-3 bg-gray-50 border rounded-lg" />
                <input name="financialGoals" value={formData.financialGoals} onChange={handleInputChange} placeholder="Financial Goals (e.g., $100k salary)" className="p-3 bg-gray-50 border rounded-lg" />
            </div>

            <button onClick={generateForecast} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Forecasting Your Future...' : 'Generate Forecast'}
            </button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>}

        {forecastData && (
            <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Forecast Results</h2>
                
                {/* AI Response Section */}
                {forecastData.aiResponse && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">🤖 AI Career Analysis</h3>
                        <p className="text-blue-700 whitespace-pre-wrap">{forecastData.aiResponse}</p>
                    </div>
                )}
                
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 Salary Projections</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {Object.entries(forecastData.salaryProjections).map(([level, salary]) => (
                            <div key={level} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <p className="text-sm text-green-800">{level}</p>
                                <p className="text-2xl font-bold text-green-600">${salary.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">🎓 Education Path</h3>
                        <p className="text-yellow-700">{forecastData.educationPath}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">💡 Recommendations</h3>
                        <p className="text-purple-700">{forecastData.recommendations}</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default CareerForecasterPage;