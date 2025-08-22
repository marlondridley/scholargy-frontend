// src/pages/CompareCollegesPage.js
import React, { useState } from 'react';
import { searchInstitutions, getInstitutionDetails } from '../services/api';

const CollegeSelector = ({ onCollegeSelect, selectedCollegeId }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        const response = await searchInstitutions({
            filters: { "general_info.name": { $regex: query, $options: 'i' } },
            pagination: { limit: 5 }
        });
        setResults(response.data || []);
        setLoading(false);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for a college..." className="w-full p-2 border rounded-lg bg-gray-50" />
                <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded-lg" disabled={loading}>{loading ? '...' : 'Search'}</button>
            </div>
            <div className="space-y-1">
                {results.map(college => (
                    <div 
                        key={college.unitid} 
                        onClick={() => onCollegeSelect(college.unitid)}
                        className={`p-2 border rounded-lg cursor-pointer ${selectedCollegeId === college.unitid ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-100'}`}
                    >
                        {college.general_info.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

const CollegeDetails = ({ college }) => {
    if (!college) return <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">Select a college to see details.</div>;
    return (
        <div className="space-y-3">
            <h2 className="text-xl font-bold text-blue-800">{college.general_info.name}</h2>
            <p><strong>Location:</strong> {college.general_info.city}, {college.general_info.state}</p>
            <p><strong>Admission Rate:</strong> {college.admissions.admission_rate ? `${(college.admissions.admission_rate * 100).toFixed(1)}%` : 'N/A'}</p>
            <p><strong>In-State Tuition:</strong> ${college.cost_and_aid.tuition_in_state?.toLocaleString() || 'N/A'}</p>
            <p><strong>Out-of-State Tuition:</strong> ${college.cost_and_aid.tuition_out_of_state?.toLocaleString() || 'N/A'}</p>
        </div>
    );
};

const CompareCollegesPage = () => {
    const [college1, setCollege1] = useState(null);
    const [college2, setCollege2] = useState(null);
    const [loading, setLoading] = useState({ col1: false, col2: false });

    const handleSelectCollege = async (unitid, column) => {
        setLoading(prev => ({ ...prev, [column]: true }));
        const details = await getInstitutionDetails(unitid);
        if (column === 'col1') setCollege1(details);
        if (column === 'col2') setCollege2(details);
        setLoading(prev => ({ ...prev, [column]: false }));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">⚖️ College Comparator</h1>
                <p className="text-gray-500 mt-2">Compare two institutions side-by-side.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                    <h2 className="font-bold text-lg">Select College 1</h2>
                    <CollegeSelector onCollegeSelect={(id) => handleSelectCollege(id, 'col1')} selectedCollegeId={college1?.unitid} />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                    <h2 className="font-bold text-lg">Select College 2</h2>
                    <CollegeSelector onCollegeSelect={(id) => handleSelectCollege(id, 'col2')} selectedCollegeId={college2?.unitid} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    {loading.col1 ? <p>Loading...</p> : <CollegeDetails college={college1} />}
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    {loading.col2 ? <p>Loading...</p> : <CollegeDetails college={college2} />}
                </div>
            </div>
        </div>
    );
};

export default CompareCollegesPage;