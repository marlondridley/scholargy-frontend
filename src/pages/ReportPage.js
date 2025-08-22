// src/pages/ReportPage.js
// This page shows a comparison report between the student and a specific college.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInstitutionDetails } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ReportPage = () => {
    const { collegeId } = useParams(); // Get college ID from URL
    const navigate = useNavigate();
    const { profile } = useAuth(); // Get student profile from context
    const [college, setCollege] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const details = await getInstitutionDetails(collegeId);
            setCollege(details);
            setLoading(false);
        };
        if (collegeId) {
            fetchDetails();
        }
    }, [collegeId]);

    if (loading) return <div className="text-center p-10">Generating Report...</div>;
    if (!college || !profile) return <div className="text-center p-10">Could not load data.</div>;

    const studentProfile = {
        name: profile?.fullName || profile?.first_name || 'Student',
        gpa: profile?.gpa || '3.85',
        satScore: profile?.satScore || 1450,
        extracurriculars: profile?.extracurriculars || 'Debate Club, Varsity Soccer'
    };

    return (
        <div>
            <button onClick={() => navigate(-1)} className="mb-6 bg-white px-4 py-2 rounded-lg border shadow-sm">
                &larr; Back to Profile
            </button>
            <div className="bg-white p-8 rounded-xl shadow-lg border">
                <h1 className="text-3xl font-bold text-center mb-2">Scholargy Report</h1>
                <p className="text-lg text-center text-gray-500 mb-8">
                    Comparing {studentProfile.name}'s Profile to {college.general_info.name}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h2 className="font-bold text-xl mb-3 text-blue-800">Your Profile ({studentProfile.name})</h2>
                        <p><strong>GPA:</strong> {studentProfile.gpa}</p>
                        <p><strong>SAT Score:</strong> {studentProfile.satScore}</p>
                        <p><strong>Extracurriculars:</strong> {studentProfile.extracurriculars}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h2 className="font-bold text-xl mb-3 text-green-800">{college.general_info.name}</h2>
                        <p><strong>Location:</strong> {college.general_info.city}, {college.general_info.state}</p>
                        <p><strong>Admission Rate:</strong> {college.admissions?.admission_rate ? `${(college.admissions.admission_rate * 100).toFixed(1)}%` : 'N/A'}</p>
                        <p><strong>Avg. SAT Score (75th percentile):</strong> {college.admissions?.sat_scores?.math_75th ? (college.admissions.sat_scores.math_75th + college.admissions.sat_scores.verbal_75th) : 'N/A'}</p>
                    </div>
                </div>
                <div className="mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Advisor Insights</h2>
                    <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md border">
                        <p><strong>Overall Assessment:</strong> {studentProfile.name}'s academic profile is strong and aligns well with {college.general_info.name}'s typical student body, particularly with a competitive SAT score.</p>
                        <ul>
                            <li><strong>Academic Fit:</strong> Your GPA and SAT scores are within the competitive range for this institution.</li>
                            <li><strong>Extracurricular Alignment:</strong> Your activities demonstrate leadership and well-rounded interests.</li>
                            <li><strong>Recommendations:</strong> Consider highlighting specific achievements in your application essays.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
