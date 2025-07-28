// DashboardPage.js - The main landing page after a user logs in.
import React, { useState, useEffect, useRef } from 'react';
import { searchInstitutions } from '../services/api';

const DashboardPage = ({ onSelectCollege, setView }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState(null);
    const [loadingSearch, setLoadingSearch] = useState(false);
    
    // State for the new chat interface
    const [conversation, setConversation] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [loadingRag, setLoadingRag] = useState(false);
    const chatContainerRef = useRef(null);

    // Effect to scroll to the bottom of the chat when new messages are added
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

    const handleRagQuery = async (e) => {
        e.preventDefault();
        if (!currentQuestion.trim()) return;

        const newConversation = [...conversation, { role: 'user', content: currentQuestion }];
        setConversation(newConversation);
        setCurrentQuestion('');
        setLoadingRag(true);

        try {
            const response = await fetch('http://localhost:5001/api/rag/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    question: currentQuestion,
                    history: newConversation.slice(0, -1) // Send history, excluding the current question
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantResponse = '';
            
            // Add a placeholder for the assistant's response
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
                        // Update the last message (the assistant's response) in the conversation
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

    return (
        <div className="space-y-8">
            {/* Top-level summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <h3 className="text-sm font-semibold text-gray-500">Scholarship Eligibility</h3>
                    <p className="text-3xl font-bold text-green-600">$12,500</p>
                    <p className="text-xs text-gray-400 mt-1">Potential merit-based aid</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="text-sm font-semibold text-gray-500">Next Step</h3>
                    <p className="text-lg font-semibold text-gray-700 mt-2">Finalize College List</p>
                    <p className="text-xs text-gray-400 mt-1">Due by August 1st</p>
                </div>
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
                    {results && results.map(college => (
                        <div key={college.unitid} className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-lg cursor-pointer transition-all" onClick={() => onSelectCollege(college.unitid)}>
                            <h3 className="font-bold text-lg text-gray-900">{college.general_info.name}</h3>
                            <p className="text-sm text-gray-500">{college.general_info.city}, {college.general_info.state}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;