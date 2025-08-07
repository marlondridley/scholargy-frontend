// frontend/src/pages/CareerForecasterPage.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// NEW: Import a function to search for colleges
import { searchInstitutions } from '../services/api'; 

const CareerForecasterPage = () => {
    const { profile } = useAuth();
    const [careerQuery, setCareerQuery] = useState('');
    const [collegeQuery, setCollegeQuery] = useState('');
    const [careers, setCareers] = useState([]);
    const [colleges, setColleges] = useState([]); // NEW: State for college search results
    const [selectedCareer, setSelectedCareer] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [forecast, setForecast] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCareerSearch = async () => {
        if (!careerQuery.trim()) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/forecaster/find-careers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: careerQuery }),
            });
            if (!response.ok) throw new Error("Failed to fetch career data.");
            const data = await response.json();
            setCareers(data.careers || []);
        } catch (err) {
            setError("Could not retrieve career data at this time.");
        } finally {
            setLoading(false);
        }
    };

    // NEW: Function to search for colleges
    const handleCollegeSearch = async () => {
        if (!collegeQuery.trim()) return;
        setLoading(true);
        try {
            const response = await searchInstitutions({
                filters: { "general_info.name": { $regex: collegeQuery, $options: 'i' } },
                pagination: { limit: 5 }
            });
            setColleges(response.data || []);
        } catch (err) {
            setError("Could not search for colleges.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateForecast = async () => {
        if (!selectedCareer || !selectedCollege) {
            alert("Please select a career and a college.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/forecaster/generate-forecast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentProfile: profile, career: selectedCareer, college: selectedCollege }),
            });
            if (!response.ok) throw new Error("Failed to generate forecast.");
            const data = await response.json();
            setForecast(data.forecast);
        } catch (err) {
            setError("Could not generate the forecast at this time.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-center">Career & ROI Forecaster</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Career Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h2 className="font-bold text-lg">1. Explore a Career Path</h2>
                    <div className="flex gap-2">
                        <input value={careerQuery} onChange={(e) => setCareerQuery(e.target.value)} placeholder="e.g., 'Data Science'" className="w-full p-2 border rounded" />
                        <button onClick={handleCareerSearch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                    </div>
                    <div className="space-y-2">
                        {careers.map(c => (
                            <div key={c._id} onClick={() => setSelectedCareer(c)} className={`p-2 border rounded cursor-pointer ${selectedCareer?._id === c._id ? 'bg-blue-100 border-blue-400' : ''}`}>
                                {c.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* College Selection */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <h2 className="font-bold text-lg">2. Select a College</h2>
                    <div className="flex gap-2">
                        <input value={collegeQuery} onChange={(e) => setCollegeQuery(e.target.value)} placeholder="Search for a college..." className="w-full p-2 border rounded" />
                        <button onClick={handleCollegeSearch} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
                    </div>
                     <div className="space-y-2">
                        {colleges.map(c => (
                            <div key={c.unitid} onClick={() => setSelectedCollege(c)} className={`p-2 border rounded cursor-pointer ${selectedCollege?.unitid === c.unitid ? 'bg-blue-100 border-blue-400' : ''}`}>
                                {c.general_info.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="text-center">
                <button onClick={handleGenerateForecast} disabled={!selectedCareer || !selectedCollege || loading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-400">
                    {loading ? 'Forecasting...' : 'Generate Forecast'}
                </button>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            {forecast && (
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h2 className="text-xl font-bold mb-4">AI-Powered Forecast</h2>
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: forecast.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br />') }} />
                </div>
            )}
        </div>
    );
};

export default CareerForecasterPage;
