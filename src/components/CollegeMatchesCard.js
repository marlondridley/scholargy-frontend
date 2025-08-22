import React from 'react';
import { GraduationCap, MapPin, DollarSign } from 'lucide-react';

// Likelihood Badge Component
const LikelihoodBadge = ({ likelihood }) => {
  const getBadgeStyle = () => {
    switch (likelihood) {
      case 'safety':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'target':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reach':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLikelihoodText = () => {
    switch (likelihood) {
      case 'safety':
        return 'Safety';
      case 'target':
        return 'Target';
      case 'reach':
        return 'Reach';
      default:
        return 'Unknown';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {getLikelihoodText()}
    </span>
  );
};

export default function CollegeMatchesCard({ matches, probabilities, onViewAll }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg mr-4">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Top College Matches</h2>
        </div>
        <div className="text-center text-gray-500 py-8 flex-grow">
          <p>No college matches yet</p>
          <p className="text-sm mt-2">Complete your profile to get personalized matches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 p-2 rounded-lg mr-4">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Top College Matches</h2>
      </div>
      
      <div className="space-y-4 flex-grow">
        {matches.slice(0, 3).map((college, index) => {
          const probability = probabilities[college.unitid || college._id];
          const collegeName = college.general_info?.name || college.name || 'Unknown College';
          const location = college.general_info ? 
            `${college.general_info.city}, ${college.general_info.state}` : 
            college.location || 'Location not specified';
          const netCost = college.netCost || college.cost_and_aid?.tuition_in_state || 'N/A';
          
          return (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
              {/* College Logo/Initial */}
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                  {collegeName.charAt(0).toUpperCase()}
                </div>
              </div>
              
              {/* College Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 truncate">{collegeName}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <DollarSign className="h-3 w-3 mr-1" />
                      <span>Est. Net Cost: ${typeof netCost === 'number' ? netCost.toLocaleString() : netCost}/yr</span>
                    </div>
                  </div>
                  
                  {/* Probability and Likelihood */}
                  <div className="flex flex-col items-end ml-2">
                    {probability && (
                      <>
                        <p className="text-sm font-semibold text-gray-600">
                          {probability.probability}%
                        </p>
                        <LikelihoodBadge likelihood={probability.likelihood} />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* View All Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={onViewAll} 
          className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors transform hover:scale-105"
        >
          View All Matches
        </button>
      </div>
    </div>
  );
}
