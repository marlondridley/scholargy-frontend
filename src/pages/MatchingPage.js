// src/pages/MatchingPage.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { findMatchingScholarships } from '../services/api';

const MatchingPage = () => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const findMatches = async () => {
        if (!profile) {
            alert("Please complete your student profile first to get the best matches.");
            return;
        }
        setIsLoading(true);
        setError('');
        setMatches([]);

        try {
            const result = await findMatchingScholarships(profile);
            setMatches(result.scholarships || result.data || []);
        } catch (err) {
            setError('Failed to fetch scholarship matches. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">🎯 AI Scholarship Matcher</h1>
                <p className="text-gray-500 mt-2">Discover scholarships perfectly tailored to your profile.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <p className="mb-4 text-gray-600">Our AI will analyze your student profile to find the best scholarship opportunities for you.</p>
                <button 
                    onClick={findMatches} 
                    disabled={isLoading || !profile} 
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Finding Your Matches...' : '✨ Find My Scholarships'}
                </button>
                {!profile && <p className="text-xs text-red-500 mt-2">Complete your profile to enable matching.</p>}
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>}

            {matches.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Your Top Matches</h2>
                    {matches.map(scholarship => (
                        <div 
                            key={scholarship._id} 
                            onClick={() => navigate(`/scholarship/${scholarship._id}`)}
                            className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md hover:border-blue-500 cursor-pointer transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-blue-800">{scholarship.title}</h3>
                                    <p className="text-sm text-gray-600">{scholarship.provider}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-xl text-green-600">${scholarship.amount?.toLocaleString() || scholarship.award_info?.funds?.amount?.toLocaleString() || '0'}</p>
                                    <p className={`text-xs font-semibold px-2 py-1 rounded-full ${scholarship.relevance === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {scholarship.relevance || 'Good'} Match
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatchingPage;