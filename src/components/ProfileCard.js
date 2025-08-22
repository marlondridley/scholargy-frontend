import React from 'react';
import { User, BookOpen, BarChart2, Target, TrendingUp, Award } from 'lucide-react';
import { getConfidenceLevel } from '../utils/dashboardHelpers';

export default function ProfileCard({ profile, stats }) {
  if (!profile || !stats) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 p-2 rounded-lg mr-4">
            <User className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Profile</h2>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 p-2 rounded-lg mr-4">
          <User className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Where am I now?</h2>
      </div>
      
      <div className="space-y-4 flex-grow">
        {/* Profile Score */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Award className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-semibold text-gray-800">Profile Score</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">{stats.profileScore}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${stats.profileScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">{stats.recommendationLevel}</p>
        </div>

        {/* GPA */}
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-md mr-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-gray-800">GPA: {profile.gpa || 'N/A'}</p>
            {stats.gpaPercentile > 0 && (
              <p className="text-sm text-gray-600">{stats.gpaPercentile}th percentile</p>
            )}
          </div>
        </div>

        {/* SAT */}
        <div className="flex items-center">
          <div className="bg-green-100 p-2 rounded-md mr-3">
            <BarChart2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-gray-800">SAT: {profile.satScore || 'N/A'}</p>
            {stats.satPercentile > 0 && (
              <p className="text-sm text-gray-600">{stats.satPercentile}th percentile</p>
            )}
          </div>
        </div>

        {/* Career Goals */}
        <div className="flex items-start">
          <div className="bg-orange-100 p-2 rounded-md mr-3 mt-1">
            <Target className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-grow">
            <p className="font-semibold text-gray-800">Career Goal</p>
            <p className="text-sm text-gray-600">
              {profile.career_goals || 'Not specified'}
            </p>
          </div>
        </div>

                 {/* Completion Progress */}
         <div className="bg-gray-50 p-3 rounded-lg">
           <div className="flex items-center justify-between mb-2">
             <span className="text-sm font-medium text-gray-700">Profile Completeness</span>
             <span className="text-sm font-medium text-gray-700">{stats.completionPercentage}%</span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-2">
             <div 
               className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
               style={{ width: `${stats.completionPercentage}%` }}
             ></div>
           </div>
           {/* Confidence Level */}
           {(() => {
             const confidence = getConfidenceLevel(profile);
             return (
               <div className={`mt-2 p-2 rounded-lg ${confidence.bgColor}`}>
                 <div className="flex items-center justify-between">
                   <span className={`text-sm font-medium ${confidence.color}`}>
                     {confidence.icon} {confidence.level}
                   </span>
                 </div>
               </div>
             );
           })()}
         </div>

        {/* Strengths */}
        {stats.strengths.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Your Strengths
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              {stats.strengths.map((strength, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
