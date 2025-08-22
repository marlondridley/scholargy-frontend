// src/pages/DashboardPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { searchInstitutions, calculateProbabilities, sendRagQuery, getScholarshipStats, getUpcomingDeadlines } from '../services/api';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { studentProfile } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [probabilities, setProbabilities] = useState({});
    const [conversation, setConversation] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [loadingRag, setLoadingRag] = useState(false);
    const [scholarshipStats, setScholarshipStats] = useState({});
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const chatContainerRef = useRef(null);

    // ... (useEffect and other functions remain the same) ...

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoadingSearch(true);
        const response = await searchInstitutions({ filters: { "general_info.name": { $regex: searchTerm, $options: 'i' } } });
        setResults(response.data);
        setLoadingSearch(false);
    };
    
    // ... (rest of the component logic) ...

    return (
        <div className="space-y-6">
            {/* ... (Welcome Banner and Nav Cards) ... */}

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800">College Search</h2>
                <form onSubmit={handleSearch} className="flex my-4">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search for a college..."
                        className="flex-1 p-3 border rounded-l-lg"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-r-lg" disabled={loadingSearch}>
                        {loadingSearch ? '...' : 'Search'}
                    </button>
                </form>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results && results.map(college => (
                        <div 
                            key={college.unitid} 
                            className="p-5 bg-gray-50 border rounded-xl hover:shadow-lg cursor-pointer" 
                            // CORRECTED: This now navigates to your original /profile/:collegeId route
                            onClick={() => navigate(`/profile/${college.unitid}`)}
                        >
                            <h3 className="font-bold">{college.general_info.name}</h3>
                            <p className="text-sm text-gray-500">{college.general_info.city}, {college.general_info.state}</p>
                            {/* ... probability info ... */}
                        </div>
                    ))}
                </div>
            </div>
             {/* ... (Rest of the JSX) ... */}
        </div>
    );
};

export default DashboardPage;
