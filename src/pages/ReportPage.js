import React, { useState, useEffect, useContext } from 'react';
import { getInstitutionDetails } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

const ReportPage = ({ collegeId, onBack }) => {
    const [college, setCollege] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const studentProfile = {
        name: user?.name || 'Student',
        gpa: '3.85',
        satScore: 1450,
        extracurriculars: 'Debate Club, Varsity Soccer'
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const details = await getInstitutionDetails(collegeId);
            setCollege(details);
            setLoading(false);
        };
        fetchDetails();
    }, [collegeId]);

    if (loading) return <div className="text-center p-10">Generating Scholargy Report...</div>;
    if (!college) return <div className="text-center p-10">Could not load college data.</div>;

    return (
        <div>
            <button onClick={onBack} className="mb-6 bg-white text-gray-800 px-4 py-2 rounded-lg border shadow-sm hover:bg-gray-100 transition-colors">
                &larr; Back to Profile
            </button>
            <div className="bg-white p-8 rounded-xl shadow-lg border">
                <h1 className="text-3xl font-bold text-center mb-2">Scholargy Report</h1>
                <p className="text-lg text-center text-gray-500 mb-8">Comparing {studentProfile.name}'s Profile to {college.general_info.name}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h2 className="font-bold text-xl mb-3 text-blue-800">Your Profile ({studentProfile.name})</h2>
                        <p><strong>GPA:</strong> {studentProfile.gpa}</p>
                        <p><strong>SAT Score:</strong> {studentProfile.satScore}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h2 className="font-bold text-xl mb-3 text-green-800">{college.general_info.name}</h2>
                        <p><strong>Avg. Admitted GPA:</strong> {college.academics?.avgGpaAdmitted || 'N/A'}</p>
                        <p><strong>Avg. SAT Score (75th percentile):</strong> {college.admissions.sat_scores?.math_75th ? (college.admissions.sat_scores.math_75th + college.admissions.sat_scores.verbal_75th) : 'N/A'}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Advisor Insights (AI-Generated Demo)</h2>
                    <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md border">
                        <p><strong>Overall Assessment:</strong> {studentProfile.name}'s academic profile is strong and aligns well with {college.general_info.name}'s typical student body, particularly with a competitive SAT score.</p>
                        <ul>
                            <li><strong>Academic Fit:</strong> Your GPA is within the expected range for admitted students.</li>
                            <li><strong>Financial Considerations:</strong> The in-state tuition is competitive, but you should actively seek merit-based scholarships to reduce the overall cost.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
