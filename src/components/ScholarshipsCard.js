import React from 'react';
import { Trophy, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency, getDaysUntilDeadline, getDeadlineColor } from '../utils/dashboardHelpers';

export default function ScholarshipsCard({ scholarships, onViewAll }) {
  const { totalEligibleAmount = 0, opportunities = [] } = scholarships || {};

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-lg mr-4">
          <Trophy className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Scholarships</h2>
      </div>
      
      <div className="space-y-4 flex-grow">
                 {/* Total Amount */}
         <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-center">
           <div className="text-3xl font-bold text-green-600 mb-1">
             {formatCurrency(totalEligibleAmount)}
           </div>
           <div className="text-sm text-gray-600">Total Eligible Amount</div>
           {opportunities.length > 0 && (
             <div className="text-xs text-gray-500 mt-1">
               {opportunities.length} opportunities available
             </div>
           )}
         </div>

        {/* Upcoming Deadlines */}
        {opportunities.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Next Deadlines
            </h4>
                         {opportunities.slice(0, 3).map((scholarship, index) => {
               const daysLeft = getDaysUntilDeadline(scholarship.deadline);
               
               return (
                 <div key={index} className="border-l-4 border-red-500 pl-3 transform transition-all duration-200 hover:scale-105">
                   <div className="flex items-start justify-between">
                     <div className="flex-grow min-w-0">
                       <p className="font-medium text-sm text-gray-800 truncate">
                         {scholarship.title || 'Scholarship Opportunity'}
                       </p>
                       <div className="flex items-center text-xs text-gray-500 mt-1">
                         <DollarSign className="h-3 w-3 mr-1" />
                         <span>
                           {formatCurrency(scholarship.amount || 0)}
                         </span>
                       </div>
                     </div>
                     {daysLeft !== null && (
                       <div className="flex-shrink-0 ml-2">
                         <span className={`px-2 py-1 rounded text-xs font-semibold ${getDeadlineColor(daysLeft)}`}>
                           {daysLeft} days
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No scholarship opportunities found</p>
            <p className="text-xs mt-1">Complete your profile to see matches</p>
          </div>
        )}
      </div>
      
      {/* View All Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={onViewAll} 
          className="w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105"
        >
          View All Scholarships
        </button>
      </div>
    </div>
  );
}
