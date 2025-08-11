// frontend/src/pages/MatchingPage.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MatchingPage = () => {
    const { profile } = useAuth();
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
            const response = await fetch('/api/matching/scholarships', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentProfile: profile }),
            });

            if (!response.ok) {
                throw new Error('The server could not process the matching request.');
            }

            const data = await response.json();
            setMatches(data.matches || []);
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
                <h1 className="text-3xl font-bold text-gray-800">AI Scholarship Matcher</h1>
                <p className="text-gray-500 mt-2">Find scholarships tailored to your unique profile using AI.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <p className="mb-4">Click the button below to find scholarships based on your saved student profile.</p>
                <button 
                    onClick={findMatches} 
                    disabled={isLoading || !profile} 
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                >
                    {isLoading ? 'Finding Matches...' : '✨ Find My Scholarships'}
                </button>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            {matches.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Your Top Scholarship Matches</h2>
                    {matches.map(scholarship => (
                        <div key={scholarship.id} className="border p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-blue-800">{scholarship.title}</h3>
                                    <p className="text-sm text-gray-600">{scholarship.organization}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <p className="font-bold text-xl text-green-600">${scholarship.fundingAmount.toLocaleString()}</p>
                                    <p className="text-xs text-purple-600 font-semibold">Relevance: {scholarship.relevance}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{scholarship.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MatchingPage;