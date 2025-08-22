import React from 'react';
import { CheckCircle, Clock, ArrowRight, Calendar } from 'lucide-react';

export default function ActionPlan({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Action Plan</h2>
        <div className="text-center text-gray-500 py-8">
          <p>No action items available</p>
          <p className="text-sm mt-2">Complete your profile to get personalized recommendations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Action Plan</h2>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-center gap-3 flex-grow">
              {/* Status Icon */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                item.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}>
                {item.completed && <CheckCircle className="w-4 h-4" />}
              </div>
              
              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800 truncate">
                    {item.text || item.task || `Action ${index + 1}`}
                  </span>
                  {item.priority === 'high' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                      High Priority
                    </span>
                  )}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Due: {item.dueDate || 'ASAP'}</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <button 
              onClick={item.action || (() => {})}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm transform hover:scale-105 flex items-center gap-1 ml-4"
            >
              <span>Start</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-800">Action Summary</span>
          </div>
          <div className="text-sm text-gray-600">
            {items.filter(item => !item.completed).length} items remaining
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Complete these actions to improve your college and scholarship prospects.
        </p>
      </div>
    </div>
  );
}
