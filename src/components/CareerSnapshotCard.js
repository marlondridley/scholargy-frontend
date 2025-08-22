import React from 'react';
import { Briefcase, TrendingUp, GraduationCap, Target } from 'lucide-react';

export default function CareerSnapshotCard({ careerData, profile }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-2 rounded-lg mr-4">
          <Briefcase className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Career Snapshot</h2>
      </div>
      
      <div className="space-y-4 flex-grow">
        {/* Career Goal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-gray-800">Your Goal</h3>
          </div>
          <p className="text-sm text-gray-700">
            {profile?.career_goals || 'Not specified'}
          </p>
        </div>

        {/* Career Data from RAG */}
        {careerData && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="font-semibold text-gray-800">Career Insights</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {careerData}
            </p>
          </div>
        )}

        {/* Education Path */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <GraduationCap className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-800">Education Path</h3>
          </div>
          <p className="text-sm text-gray-700">
            Bachelor's Degree
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Recommended for your career goals
          </p>
        </div>

        {/* Salary Outlook */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="font-semibold text-gray-800">Salary Outlook</h3>
          </div>
          <p className="text-sm text-gray-700">
            Varies by field and experience
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Complete career forecast for detailed insights
          </p>
        </div>

        {/* Skills Development */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="font-semibold text-gray-800">Skills Focus</h3>
          </div>
          <p className="text-sm text-gray-700">
            Technical and soft skills development
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Based on your academic profile
          </p>
        </div>
      </div>
      
      {/* View Career Forecast Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={() => window.location.href = '/forecaster'} 
          className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
        >
          View Career Forecast
        </button>
      </div>
    </div>
  );
}
