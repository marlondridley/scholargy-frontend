// src/pages/DashboardPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoaderCircle } from 'lucide-react';
import ProfileCard from '../components/ProfileCard';
import CollegeMatchesCard from '../components/CollegeMatchesCard';
import ScholarshipsCard from '../components/ScholarshipsCard';
import CareerSnapshotCard from '../components/CareerSnapshotCard';
import ActionPlan from '../components/ActionPlan';
import Modal from '../components/Modal';
import { 
  getDashboardData, 
  getDynamicGreeting, 
  formatCurrency, 
  getDaysUntilDeadline, 
  getDeadlineColor 
} from '../utils/dashboardHelpers';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMatchesModalOpen, setMatchesModalOpen] = useState(false);
  const [isScholarshipsModalOpen, setScholarshipsModalOpen] = useState(false);

  // Get dynamic greeting
  const greeting = useMemo(() => getDynamicGreeting(), []);

  // Fetch all dashboard data using the comprehensive helper
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Starting dashboard data fetch for user:', user?.id);
        
        // Use the comprehensive dashboard helper
        const data = await getDashboardData(user?.id, profile);
        console.log('Dashboard data received:', data);
        setDashboardData(data);
        
        // Log context information for debugging
        if (data.context) {
          console.log('Dashboard Context:', data.context);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchDashboardData();
    } else {
      console.log('No user ID available, skipping dashboard fetch');
      setLoading(false);
    }
  }, [user?.id, profile]);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="mt-4 text-lg text-gray-600">Loading your personalized dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching data from CosmosDB and generating AI insights</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Please log in to view your dashboard.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // No dashboard data state
  if (!dashboardData) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Unable to load dashboard data.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    studentProfile,
    topColleges,
    scholarships,
    careerInsights,
    actionPlan,
    admissionProbabilities,
    userStats,
    context
  } = dashboardData;

  // No profile state
  if (!studentProfile) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No profile data found.</p>
          <p className="text-sm text-gray-500 mt-2">Complete your profile to get personalized insights</p>
          <button 
            onClick={() => navigate('/student-profile')} 
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Complete Your Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {greeting}, {studentProfile.fullName || studentProfile.first_name || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Here's your personalized dashboard with AI-powered insights and recommendations.
          </p>
          {context.applicationSeason && (
            <p className="text-sm text-indigo-600 mt-1">
              📅 {context.applicationSeason} Application Season
            </p>
          )}
        </div>

        {/* Context Summary */}
        {context && (context.scholarshipCount > 0 || context.collegeCount > 0) && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-indigo-600">{context.collegeCount || 0}</p>
                <p className="text-sm text-gray-600">College Matches</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{context.scholarshipCount || 0}</p>
                <p className="text-sm text-gray-600">Scholarship Opportunities</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(context.totalScholarshipAmount || 0)}
                </p>
                <p className="text-sm text-gray-600">Total Eligible Funding</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          <ProfileCard profile={studentProfile} stats={userStats} />
          <CollegeMatchesCard 
            matches={topColleges} 
            probabilities={admissionProbabilities} 
            onViewAll={() => setMatchesModalOpen(true)} 
          />
          <ScholarshipsCard 
            scholarships={scholarships} 
            onViewAll={() => setScholarshipsModalOpen(true)} 
          />
          <CareerSnapshotCard careerData={careerInsights} profile={studentProfile} />
        </div>

        {/* Action Plan */}
        <ActionPlan items={actionPlan} />
      </div>

      {/* College Matches Modal */}
      <Modal isOpen={isMatchesModalOpen} onClose={() => setMatchesModalOpen(false)} title="All College Matches">
        <div className="space-y-4">
          {topColleges.length > 0 ? (
            topColleges.map((college, index) => {
              const probability = admissionProbabilities[college.unitid || college._id];
              const collegeName = college.general_info?.name || college.name || 'Unknown College';
              const location = college.general_info ? 
                `${college.general_info.city}, ${college.general_info.state}` : 
                college.location || 'Location not specified';
              const netCost = college.netCost || college.cost_and_aid?.tuition_in_state || 'N/A';
              
              return (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="h-12 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {collegeName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-lg text-gray-800">{collegeName}</p>
                        <p className="text-sm text-gray-600 mb-2">{location}</p>
                        <p className="text-sm text-gray-600">
                          Est. Net Cost: {typeof netCost === 'number' ? formatCurrency(netCost) : netCost}/yr
                        </p>
                        {college.admission_rate && (
                          <p className="text-xs text-gray-500">
                            Admission Rate: {(college.admission_rate * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {probability && (
                          <>
                            <p className="text-lg font-semibold text-gray-600">{probability.probability}%</p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              probability.likelihood === 'safety' ? 'bg-green-100 text-green-600' : 
                              probability.likelihood === 'target' ? 'bg-yellow-100 text-yellow-600' : 
                              'bg-red-100 text-red-600'
                            }`}>
                              {probability.likelihood}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No college matches yet</p>
              <p className="text-sm text-gray-400 mb-4">Complete your profile to get personalized college recommendations</p>
              <button 
                onClick={() => navigate('/matching')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Find Matches
              </button>
            </div>
          )}
        </div>
      </Modal>

      {/* Scholarships Modal */}
      <Modal isOpen={isScholarshipsModalOpen} onClose={() => setScholarshipsModalOpen(false)} title="All Scholarship Opportunities">
        <div className="space-y-4">
          {scholarships.opportunities && scholarships.opportunities.length > 0 ? (
            scholarships.opportunities.map((scholarship, index) => {
              const daysLeft = getDaysUntilDeadline(scholarship.deadline);
              
              return (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <p className="font-bold text-lg text-gray-800">{scholarship.title || 'Scholarship Opportunity'}</p>
                      <p className="text-green-600 font-semibold">
                        {formatCurrency(scholarship.amount || 0)}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">{scholarship.description || 'No description available'}</p>
                      {scholarship.category && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mt-2">
                          {scholarship.category}
                        </span>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      {daysLeft !== null && (
                        <>
                          <p className="font-semibold">Deadline</p>
                          <p className="text-sm text-gray-500">{new Date(scholarship.deadline).toLocaleDateString()}</p>
                          <span className={`px-2 py-1 rounded text-xs font-semibold mt-1 inline-block ${getDeadlineColor(daysLeft)}`}>
                            {daysLeft} days left
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No scholarship opportunities found</p>
              <p className="text-sm text-gray-400 mb-4">Complete your profile to see personalized scholarship matches</p>
              <button 
                onClick={() => navigate('/scholarships')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse All Scholarships
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
