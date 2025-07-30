import React, { useState, useEffect, useRef } from 'react';
import { searchInstitutions, calculateProbabilities, sendRagQuery } from '../services/api';

const DashboardPage = ({ onSelectCollege, setView, studentProfile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [probabilities, setProbabilities] = useState({});
    
    const [conversation, setConversation] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [loadingRag, setLoadingRag] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoadingSearch(true);
        const response = await searchInstitutions({ filters: { "general_info.name": { $regex: searchTerm, $options: 'i' } } });
        setResults(response.data);
        setLoadingSearch(false);
    };

    useEffect(() => {
        const calculateCollegeProbabilities = async () => {
            if (!results || results.length === 0 || !studentProfile) return;
            
            const collegeIds = results.map(c => c.unitid);
            const probResult = await calculateProbabilities(studentProfile, collegeIds);
            
            const probMap = (probResult.results || []).reduce((acc, curr) => {
                acc[curr.unitid] = curr;
                return acc;
            }, {});
            setProbabilities(probMap);
        };

        calculateCollegeProbabilities();
    }, [results, studentProfile]);

    const handleRagQuery = async (e) => {
        e.preventDefault();
        if (!currentQuestion.trim()) return;

        const newConversation = [...conversation, { role: 'user', content: currentQuestion }];
        setConversation(newConversation);
        setCurrentQuestion('');
        setLoadingRag(true);

        try {
            const data = await sendRagQuery(currentQuestion, newConversation.slice(0, -1));
            
            if (data.answer) {
                setConversation(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else {
                throw new Error('No answer received from RAG service');
            }

        } catch (error) {
            console.error("Failed to get RAG answer:", error);
            setConversation(prev => [...prev, { 
                role: 'assistant', 
                content: 'Sorry, I encountered an error. Please try again.' 
            }]);
        } finally {
            setLoadingRag(false);
        }
    };

    const handleDownloadRecommendations = () => {
        // Create a simple text file with AI recommendations
        const recommendations = `AI Recommendations Report\n\n` +
            `Generated on: ${new Date().toLocaleDateString()}\n\n` +
            `Based on your profile and recent interactions, here are your personalized recommendations:\n\n` +
            `1. Focus on maintaining strong academic performance\n` +
            `2. Consider applying to a mix of reach, target, and safety schools\n` +
            `3. Highlight your extracurricular activities in applications\n\n` +
            `For detailed analysis, visit your Student Profile page.`;
        
        const blob = new Blob([recommendations], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-recommendations.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-blue-600 text-white p-6 rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Welcome back, Alex Student 👋</h1>
                        <p className="text-blue-100">You've completed 75% of your scholarship goals this month. Keep it up and maximize your opportunities.</p>
                    </div>
                    <div className="text-4xl">🎓</div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div 
                    onClick={() => setView('studentProfile')}
                    className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-lg cursor-pointer transition-all"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">👤</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Student Profile</h3>
                            <p className="text-xs text-gray-500">Manage your academic info</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setView('studentVue')}
                    className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-lg cursor-pointer transition-all"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📊</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">StudentVue</h3>
                            <p className="text-xs text-gray-500">View your grades</p>
                        </div>
                    </div>
                </div>

                <div 
                    onClick={() => setView('compare')}
                    className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-lg cursor-pointer transition-all"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🏫</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Compare Colleges</h3>
                            <p className="text-xs text-gray-500">Find your perfect match</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-lg cursor-pointer transition-all">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📚</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Schedule a Tutor</h3>
                            <p className="text-xs text-gray-500">Get personalized help</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ask Scholargy AI Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Ask Scholargy AI</h2>
                        <p className="text-sm text-gray-500">Get personalized scholarship and college guidance</p>
                    </div>
                    <div className="flex space-x-4 text-sm">
                        <div className="text-center">
                            <div className="font-bold text-gray-800">18</div>
                            <div className="text-gray-500">Active Apps</div>
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-gray-800">$45K</div>
                            <div className="text-gray-500">Potential Aid</div>
                        </div>
                    </div>
                </div>

                {/* Quick Action Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                        Ask about scholarships, deadlines, or college requirements...
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                        Find STEM scholarships
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                        Application deadlines
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                        Essay requirements
                    </button>
                    <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200">
                        Merit aid opportunities
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm hover:bg-purple-700">
                        Ask
                    </button>
                </div>

                {/* Chat Interface - Fixed to be visible */}
                <div className="space-y-4">
                    {/* Chat Messages */}
                    <div 
                        ref={chatContainerRef}
                        className="h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                        {conversation.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <p className="text-sm">Start a conversation with Scholargy AI</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {conversation.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white border border-gray-200 text-gray-800'
                                        }`}>
                                            <p>{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {loadingRag && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm">
                                            <p>Thinking...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Chat Input - Now visible and functional */}
                    <form onSubmit={handleRagQuery} className="flex space-x-2">
                        <input
                            type="text"
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                            placeholder="Ask about college admissions, financial aid, or finding the right school..."
                            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            disabled={loadingRag}
                        />
                        <button 
                            type="submit" 
                            disabled={loadingRag || !currentQuestion.trim()}
                            className="bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                        >
                            {loadingRag ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                </div>
            </div>

            {/* AI Recommendations Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">AI Recommendations Summary</h2>
                    <button 
                        onClick={handleDownloadRecommendations}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Download Report
                    </button>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm">
                        Based on your current profile, our AI recommends focusing on maintaining your strong academic performance 
                        while highlighting your extracurricular activities. Consider applying to a balanced mix of reach, target, 
                        and safety schools to maximize your admission chances.
                    </p>
                </div>
            </div>

            {/* Scholarship Progress Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Scholarship Progress</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-bold">85%</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Merit Scholarships</p>
                        <p className="text-xs text-gray-500">Applications</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">72%</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">STEM Awards</p>
                        <p className="text-xs text-gray-500">Essays</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-yellow-600 font-bold">45%</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Local Scholarships</p>
                        <p className="text-xs text-gray-500">Requirements</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">90%</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">Need-Based Aid</p>
                        <p className="text-xs text-gray-500">Complete</p>
                    </div>
                </div>
            </div>

            {/* College Search Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">College Search</h2>
                    <a href="#" className="text-blue-600 text-sm hover:underline">View All</a>
                </div>
                <form onSubmit={handleSearch} className="flex mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, location, or major..."
                        className="flex-1 p-3 bg-gray-100 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400" 
                        disabled={loadingSearch}
                    >
                        {loadingSearch ? 'Searching...' : 'Search'}
                    </button>
                </form>
                
                {loadingSearch && (
                    <div className="text-center py-4 text-gray-500">Loading results...</div>
                )}
                
                {!loadingSearch && results && results.length === 0 && (
                    <div className="text-center text-gray-500 py-4">No institutions found.</div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results && results.map(college => {
                        const probInfo = probabilities[college.unitid];
                        const categoryColor = probInfo?.category === 'safety' ? 'bg-green-100 text-green-800' :
                                              probInfo?.category === 'target' ? 'bg-yellow-100 text-yellow-800' :
                                              probInfo?.category === 'reach' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
                        return (
                            <div 
                                key={college.unitid} 
                                className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all" 
                                onClick={() => onSelectCollege(college.unitid)}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg text-gray-900">{college.general_info.name}</h3>
                                    {probInfo && (
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColor}`}>
                                            {probInfo.probability}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">{college.general_info.city}, {college.general_info.state}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI Assistant Updates Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">AI Assistant Updates</h2>
                    <a href="#" className="text-blue-600 text-sm hover:underline">View All</a>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-sm">MA</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-800">
                            <span className="font-semibold">AI Counselor Maya:</span> Great! I just reviewed your essay draft...
                        </p>
                        <p className="text-xs text-gray-500">09:34 am</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage; 