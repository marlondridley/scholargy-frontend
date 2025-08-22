// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getTopMatches, 
  getScholarshipStats, 
  getUpcomingDeadlines,
  getUserStats,
  getScholarshipSummary,
  calculateProbabilities,
  getNextStepsData
} from '../services/api';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [collegeMatches, setCollegeMatches] = useState([]);
  const [scholarshipStats, setScholarshipStats] = useState({});
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [scholarshipSummary, setScholarshipSummary] = useState({});
  const [nextStepsData, setNextStepsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [showScholarshipModal, setShowScholarshipModal] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setErrors({});
        
        // Only load data if we have a profile
        if (!profile) {
          setLoading(false);
          return;
        }

        // Load college matches using Azure AI Search embeddings
        let matches = [];
        try {
          const matchesResponse = await getTopMatches(profile?.userId);
          matches = matchesResponse.results?.slice(0, 3) || [];  // Fixed: use .results instead of .data
          setCollegeMatches(matches);
        } catch (error) {
          console.error('Error loading college matches:', error);
          setErrors(prev => ({ ...prev, collegeMatches: 'Failed to load college matches' }));
        }

        // Load scholarship stats from backend
        let stats = {};
        try {
          stats = await getScholarshipStats(profile?.userId);
          setScholarshipStats(stats);
        } catch (error) {
          console.error('Error loading scholarship stats:', error);
          setErrors(prev => ({ ...prev, scholarshipStats: 'Failed to load scholarship statistics' }));
        }

        // Load scholarship summary using RAG
        let summary = {};
        try {
          summary = await getScholarshipSummary(profile);
          setScholarshipSummary(summary);
        } catch (error) {
          console.error('Error loading scholarship summary:', error);
          setErrors(prev => ({ ...prev, scholarshipSummary: 'Failed to load scholarship summary' }));
        }

        // Load upcoming deadlines from CosmosDB
        let deadlines = [];
        try {
          const deadlinesResponse = await getUpcomingDeadlines(30);
          deadlines = deadlinesResponse.deadlines?.slice(0, 2) || [];  // Fixed: use .deadlines instead of .scholarships
          setUpcomingDeadlines(deadlines);
        } catch (error) {
          console.error('Error loading upcoming deadlines:', error);
          setErrors(prev => ({ ...prev, deadlines: 'Failed to load upcoming deadlines' }));
        }

        // Load user stats from backend
        let userStatsData = {};
        if (user?.id) {
          try {
            userStatsData = await getUserStats(user.id);
            setUserStats(userStatsData);
          } catch (error) {
            console.error('Error loading user stats:', error);
            setErrors(prev => ({ ...prev, userStats: 'Failed to load user statistics' }));
          }
        }

        // Get next steps from backend using all the collected data
        try {
          const nextSteps = await getNextStepsData(
            profile, 
            matches, 
            deadlines, 
            { summary, userStats: userStatsData }
          );
          setNextStepsData(nextSteps);
        } catch (error) {
          console.error('Error loading next steps:', error);
          setErrors(prev => ({ ...prev, nextSteps: 'Failed to load next steps' }));
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setErrors(prev => ({ ...prev, general: 'Failed to load dashboard data' }));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile, user]);

  // Calculate profile completeness based on real profile data
  const calculateProfileCompleteness = () => {
    if (!profile) return 0;
    
    const requiredFields = ['gpa', 'satScore', 'gradeLevel', 'extracurriculars', 'career_goals'];
    const completedFields = requiredFields.filter(field => {
      const value = profile[field];
      return value && value.toString().trim() !== '' && value !== 'N/A';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Get dynamic greeting based on time of day
  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get confidence level based on real data
  const getConfidenceLevel = () => {
    const completeness = calculateProfileCompleteness();
    if (completeness >= 80) return { level: 'On Track', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✓' };
    if (completeness >= 60) return { level: 'Getting There', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠' };
    return { level: 'Needs Action', color: 'text-red-600', bgColor: 'bg-red-100', icon: '!' };
  };

  // Get admission likelihood using real probability calculation
  const getAdmissionLikelihood = async (college) => {
    if (!profile || !college.unitid) {
      return { level: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }

    try {
      const probabilities = await calculateProbabilities(profile, [college.unitid]);
      const probability = probabilities.results?.[0]?.probability || 0;
      
      if (probability >= 0.7) return { level: 'Safety', color: 'text-green-600', bgColor: 'bg-green-100' };
      if (probability >= 0.4) return { level: 'Match', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      return { level: 'Reach', color: 'text-red-600', bgColor: 'bg-red-100' };
    } catch (error) {
      console.error('Error calculating admission likelihood:', error);
      return { level: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Calculate estimated net cost using real data
  const getEstimatedNetCost = (college) => {
    const baseCost = college.cost_and_aid?.tuition_in_state || 
                    college.cost_and_aid?.tuition_out_of_state || 
                    50000;
    const scholarships = scholarshipStats.totalEligible || 0;
    return Math.max(0, baseCost - scholarships);
  };

  // Get next steps from backend data
  const getNextSteps = () => {
    // Use the backend next steps data if available
    if (nextStepsData.nextSteps && nextStepsData.nextSteps.length > 0) {
      return nextStepsData.nextSteps.slice(0, 4).map((step, index) => ({
        text: step,
        action: () => {
          // Parse the step text to determine appropriate action
          const stepLower = step.toLowerCase();
          if (stepLower.includes('profile') || stepLower.includes('complete')) {
            navigate('/student-profile');
          } else if (stepLower.includes('college') || stepLower.includes('match')) {
            navigate('/matching');
          } else if (stepLower.includes('scholarship') || stepLower.includes('apply')) {
            navigate('/scholarships');
          } else if (stepLower.includes('fafsa')) {
            window.open('https://fafsa.gov', '_blank');
          } else if (stepLower.includes('sat') || stepLower.includes('test')) {
            window.open('https://collegereadiness.collegeboard.org/sat', '_blank');
          } else if (stepLower.includes('career') || stepLower.includes('forecast')) {
            navigate('/forecaster');
          } else {
            // Default action
            navigate('/student-profile');
          }
        },
        priority: index === 0 ? 'high' : 'medium',
        dueDate: index === 0 ? 'ASAP' : 'This week',
        completed: false
      }));
    }

    // Fallback to basic next steps if backend data is not available
    const steps = [];
    
    if (calculateProfileCompleteness() < 100) {
      steps.push({ 
        text: 'Complete your student profile', 
        action: () => navigate('/student-profile'), 
        priority: 'high',
        dueDate: 'ASAP',
        completed: false
      });
    }
    
    if (collegeMatches.length === 0) {
      steps.push({ 
        text: 'Find college matches', 
        action: () => navigate('/matching'), 
        priority: 'high',
        dueDate: 'Jan 15',
        completed: false
      });
    }
    
    if (upcomingDeadlines.length > 0) {
      steps.push({ 
        text: `Apply to ${upcomingDeadlines.length} scholarships with upcoming deadlines`, 
        action: () => navigate('/scholarships'), 
        priority: 'medium',
        dueDate: 'ASAP',
        completed: false
      });
    }
    
    steps.push({ 
      text: 'Complete FAFSA', 
      action: () => window.open('https://fafsa.gov', '_blank'), 
      priority: 'medium',
      dueDate: 'Dec 1',
      completed: false
    });
    
    if (!profile?.satScore || profile.satScore === 'N/A') {
      steps.push({ 
        text: 'Take SAT', 
        action: () => window.open('https://collegereadiness.collegeboard.org/sat', '_blank'), 
        priority: 'medium',
        dueDate: 'March',
        completed: false
      });
    }
    
    return steps.slice(0, 4);
  };

  // Modal components
  const CollegeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">All College Matches</h2>
            <button 
              onClick={() => setShowCollegeModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">
          {collegeMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collegeMatches.map((college, index) => {
                const netCost = getEstimatedNetCost(college);
                return (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                        {college.general_info?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{college.general_info?.name || college.name}</h3>
                        <p className="text-sm text-gray-600">{college.general_info?.city}, {college.general_info?.state}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">Est. Net Cost: <span className="font-semibold">${netCost.toLocaleString()}/yr</span></p>
                      <p className="text-sm text-gray-600">Acceptance Rate: <span className="font-semibold">{college.admissions?.admission_rate ? `${(college.admissions.admission_rate * 100).toFixed(1)}%` : 'N/A'}</span></p>
                    </div>
                    <button 
                      onClick={() => navigate(`/profile/${college.unitid || college._id}`)}
                      className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Full Profile
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No college matches yet</p>
              <button 
                onClick={() => navigate('/matching')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Find Matches
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ScholarshipModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">All Scholarships</h2>
            <button 
              onClick={() => setShowScholarshipModal(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              ${(scholarshipStats.totalEligible || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Eligible Amount</div>
          </div>
          
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Upcoming Deadlines</h3>
              {upcomingDeadlines.map((scholarship, index) => {
                const daysLeft = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">{scholarship.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        daysLeft <= 7 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {daysLeft} days left
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{scholarship.description || 'No description available'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-green-600">
                        ${scholarship.amount ? scholarship.amount.toLocaleString() : 'Varies'}
                      </span>
                      <button 
                        onClick={() => navigate('/scholarships')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No upcoming deadlines</p>
              <button 
                onClick={() => navigate('/scholarships')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse All Scholarships
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const confidence = getConfidenceLevel();
  const profileCompleteness = calculateProfileCompleteness();
  const nextSteps = getNextSteps();
  const greeting = getDynamicGreeting();

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Some data couldn't be loaded:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>• {message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border transform transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in">
              {greeting}, {profile?.fullName || profile?.first_name || 'Student'}!
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${confidence.bgColor} ${confidence.color} animate-pulse`}>
                <span className="text-lg">{confidence.icon}</span>
                {confidence.level}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
                <span className="text-sm font-medium text-gray-700">{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-right">
            {profileCompleteness < 100 && (
              <button 
                onClick={() => navigate('/student-profile')}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
              >
                Complete Your Profile →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced "Where am I now?" Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border transform transition-all duration-300 hover:shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Where am I now?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">{profile?.gpa || 'N/A'}</div>
            <div className="text-sm text-gray-600">GPA</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">{profile?.satScore || 'N/A'}</div>
            <div className="text-sm text-gray-600">SAT Score</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">{profile?.gradeLevel || 'N/A'}</div>
            <div className="text-sm text-gray-600">Grade Level</div>
          </div>
        </div>
        {profile?.career_goals && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Career Goal</div>
            <div className="font-semibold text-gray-800">{profile.career_goals}</div>
          </div>
        )}
      </div>

      {/* Three Core Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* College Matches Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border transform transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h2 className="text-xl font-bold text-gray-800">Top College Matches</h2>
            </div>
          </div>
          
          {collegeMatches.length > 0 ? (
            <div className="space-y-4">
              {collegeMatches.map((college, index) => {
                const netCost = getEstimatedNetCost(college);
                return (
                  <div key={index} className="border rounded-lg p-4 transform transition-all duration-200 hover:scale-105">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {college.general_info?.name?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{college.general_info?.name || college.name}</h3>
                        <p className="text-sm text-gray-600">Est. Net Cost: ${netCost.toLocaleString()}/yr</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No college matches yet</p>
              <button 
                onClick={() => navigate('/matching')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Find Matches
              </button>
            </div>
          )}
          
          <div className="mt-4">
            <button 
              onClick={() => setShowCollegeModal(true)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
            >
              View All Matches
            </button>
          </div>
        </div>

        {/* Scholarships Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border transform transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-bold text-gray-800">Scholarships</h2>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-green-600 animate-pulse">
              ${(scholarshipStats.totalEligible || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Eligible Amount</div>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3 mb-4">
              <h4 className="font-semibold text-gray-700">Next Deadlines:</h4>
              {upcomingDeadlines.map((scholarship, index) => {
                const daysLeft = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={index} className="border-l-4 border-red-500 pl-3 transform transition-all duration-200 hover:scale-105">
                    <div className="font-medium text-sm">{scholarship.title}</div>
                    <div className="text-xs text-gray-500">
                      {daysLeft} days left
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mb-4">
              <p className="text-gray-500 text-sm">No upcoming deadlines</p>
            </div>
          )}
          
          <button 
            onClick={() => setShowScholarshipModal(true)}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
          >
            View All Scholarships
          </button>
        </div>

        {/* Career Snapshot Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border transform transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💼</span>
              <h2 className="text-xl font-bold text-gray-800">Career Snapshot</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Your Goal</div>
              <div className="font-semibold text-gray-800">
                {profile?.career_goals || 'Not specified'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Salary Outlook</div>
              <div className="font-semibold text-gray-800">
                {scholarshipSummary.salaryRange || 'Varies by field'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Education Path</div>
              <div className="font-semibold text-gray-800">
                {scholarshipSummary.educationPath || 'Bachelor\'s Degree'}
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/forecaster')}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
          >
            View Career Forecast
          </button>
        </div>
      </div>

      {/* Action Plan Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border transform transition-all duration-300 hover:shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Action Plan</h2>
        <div className="space-y-3">
          {nextSteps.map((step, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 rounded-lg border transform transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}>
                  {step.completed && <span className="text-xs">✓</span>}
                </div>
                <div>
                  <span className="font-medium text-gray-800">{step.text}</span>
                  <div className="text-sm text-gray-500">Due: {step.dueDate}</div>
                </div>
              </div>
              <button 
                onClick={step.action}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm transform hover:scale-105"
              >
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showCollegeModal && <CollegeModal />}
      {showScholarshipModal && <ScholarshipModal />}
    </div>
  );
};

export default DashboardPage;
