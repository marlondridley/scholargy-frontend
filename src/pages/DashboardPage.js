import React, { useState, useEffect, useRef } from 'react';
import { searchInstitutions, calculateProbabilities } from '../services/api';

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
            const response = await fetch('/api/rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question: currentQuestion,
                    history: newConversation.slice(0, -1)
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantResponse = '';
            
            setConversation(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.substring(6));
                        assistantResponse += data.content;
                        setConversation(prev => {
                            const updated = [...prev];
                            updated[updated.length - 1].content = assistantResponse;
                            return updated;
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Failed to get RAG answer:", error);
            setConversation(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
        } finally {
            setLoadingRag(false);
        }
    };
    
    const downloadRecommendations = () => {
        const blob = new Blob(["Here are your personalized recommendations from Scholargy AI..."], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'AI_Recommendations.txt';
        link.click();
    };

    return (
        <div className="space-y-8">
            {/* Top-level summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button 
                    onClick={() => setView('studentProfile')} 
                    className="bg-white p-6 rounded-xl shadow-sm border text-left hover:shadow-lg hover:border-blue-500 transition-all"
                >
                    <h3 className="text-sm font-semibold text-gray-500">Readiness Score</h3>
                    <p className="text-3xl font-bold text-blue-600">88%</p>
                    <p className="text-xs text-gray-400 mt-1">Click to view/update profile</p>
                </button>
                <button 
                    onClick={() => setView('studentVue')} 
                    className="bg-white p-6 rounded-xl shadow-sm border text-left hover:shadow-lg hover:border-purple-500 transition-all"
                >
                    <h3 className="text-sm font-semibold text-gray-500">StudentVue Sync</h3>
                    <p className="text-3xl font-bold text-purple-600">Connect Now</p>
                    <p className="text-xs text-gray-400 mt-1">For live grades & attendance</p>
                </button>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-sm font-semibold text-gray-500">AI Recommendations</h3>
                    <p className="text-sm text-gray-600 mt-2">Based on your profile, focus on STEM scholarships and consider early action for UNC.</p>
                    <div className="flex justify-end mt-2">
                        <button onClick={downloadRecommendations} className="text-xs bg-green-100 text-green-700 font-semibold py-1 px-3 rounded-full hover:bg-green-200">Download Report</button>
                    </div>
                </div>
                 <button 
                    onClick={() => alert('Navigating to tutor scheduling...')} 
                    className="bg-white p-6 rounded-xl shadow-sm border text-left hover:shadow-lg hover:indigo-500 transition-all"
                >
                    <h3 className="text-sm font-semibold text-gray-500">Expert Help</h3>
                    <p className="text-3xl font-bold text-indigo-600">Schedule a Tutor</p>
                    <p className="text-xs text-gray-400 mt-1">For SAT prep or essay review</p>
                </button>
            </div>

            {/* "Ask Scholargy" RAG feature section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Ask Scholargy</h2>
                {/* Chat container */}
                <div ref={chatContainerRef} className="h-64 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {conversation.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loadingRag && (
                         <div className="flex justify-start">
                            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                                <p className="text-sm animate-pulse">Thinking...</p>
                            </div>
                        </div>
                    )}
                </div>
                {/* Input form */}
                <form onSubmit={handleRagQuery} className="flex">
                    <input
                        type="text"
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400" disabled={loadingRag}>
                        {loadingRag ? '...' : 'Send'}
                    </button>
                </form>
            </div>

            {/* College Search section */}
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">College Search</h2>
                <form onSubmit={handleSearch} className="flex mb-6">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by institution name..."
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="bg-gray-700 text-white font-semibold px-6 py-3 rounded-r-lg hover:bg-gray-800 disabled:bg-gray-400" disabled={loadingSearch}>
                        {loadingSearch ? '...' : 'Search'}
                    </button>
                </form>
                {loadingSearch && <div className="text-center py-4">Loading results...</div>}
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
                            <div key={college.unitid} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all" onClick={() => onSelectCollege(college.unitid)}>
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
        </div>
    );
};

export default DashboardPage;