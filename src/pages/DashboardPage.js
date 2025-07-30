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
        body: JSON.stringify({ question: currentQuestion, history: newConversation.slice(0, -1) }),
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
    <div className="space-y-8 p-4">
      {/* AI Summary */}
      <div className="bg-blue-50 p-4 rounded-xl border shadow-sm">
        <h2 className="text-lg font-bold text-blue-800">Your AI Summary</h2>
        <p className="text-sm text-gray-700 mt-1">
          Based on your profile, Scholargy AI suggests applying to a balanced mix of Reach, Target, and Safety schools.
        </p>
        <button onClick={downloadRecommendations} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Download AI Recommendations
        </button>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => setView('profile')} className="p-4 bg-white rounded-xl shadow hover:shadow-md border text-left">
          <h3 className="text-lg font-bold text-blue-800">Student Profile</h3>
          <p className="text-sm text-gray-600">Edit your academic info</p>
        </button>
        <button onClick={() => setView('recommendations')} className="p-4 bg-white rounded-xl shadow hover:shadow-md border text-left">
          <h3 className="text-lg font-bold text-blue-800">AI Recommendations</h3>
          <p className="text-sm text-gray-600">Your matches & insights</p>
        </button>
        <button onClick={() => setView('schedule')} className="p-4 bg-white rounded-xl shadow hover:shadow-md border text-left">
          <h3 className="text-lg font-bold text-blue-800">Schedule a Tutor</h3>
          <p className="text-sm text-gray-600">Book a tutoring session</p>
        </button>
        <a href="/downloads/ai_recommendations.pdf" target="_blank" rel="noopener noreferrer" className="p-4 bg-white rounded-xl shadow hover:shadow-md border text-left">
          <h3 className="text-lg font-bold text-blue-800">Download PDF</h3>
          <p className="text-sm text-gray-600">Save your results</p>
        </a>
      </div>

      {/* Chat Interface */}
      <div className="bg-white p-6 rounded-xl shadow-sm border max-h-[400px] overflow-y-auto" ref={chatContainerRef}>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Ask Scholargy</h2>
        <div className="space-y-2">
          {conversation.length === 0 && (
            <div className="text-sm text-gray-400">Welcome! Ask anything about college admissions or scholarships.</div>
          )}
          {conversation.map((msg, idx) => (
            <div key={idx} className={`p-2 rounded ${msg.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleRagQuery} className="mt-4 flex">
          <input
            type="text"
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder="Ask Scholargy anything..."
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700" disabled={loadingRag}>
            {loadingRag ? '...' : 'Ask'}
          </button>
        </form>
      </div>

      {/* Search */}
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
