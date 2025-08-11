import React, { useState, useEffect } from 'react';
import { getProfileAssessment } from '../services/api';

// Reusable input field component
const InputField = ({ label, type = "text", name, value, onChange, placeholder, error, readOnly = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className={`w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500' : 'border-gray-200 focus:ring-blue-500'} ${readOnly ? 'cursor-not-allowed bg-gray-200' : ''}`}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

// Reusable textarea component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

const StudentProfilePage = () => {
    // State for form inputs
    const [profile, setProfile] = useState({
        gradeLevel: '12',
        gpa: '3.8',
        satScore: '1450',
        actScore: '',
        apClasses: 'AP Biology, AP Calculus AB, AP US History',
        extracurriculars: 'Debate Club president, Varsity Soccer, Robotics Team',
    });
    // State for validation errors
    const [errors, setErrors] = useState({});
    // State for calculated graduation date
    const [expectedGradDate, setExpectedGradDate] = useState('');
    // **UPDATED:** State for the new narrative assessment text
    const [assessmentText, setAssessmentText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Effect to auto-calculate graduation date
    useEffect(() => {
        const calculateGradDate = () => {
            if (!profile.gradeLevel) return '';
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth();
            const yearsLeft = 12 - parseInt(profile.gradeLevel, 10);
            const schoolYearStart = currentMonth > 4 ? 1 : 0;
            return `May ${currentYear + yearsLeft + schoolYearStart}`;
        };
        setExpectedGradDate(calculateGradDate());
    }, [profile.gradeLevel]);

    // Handle changes in form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (errors[name]) validateField(name, value);
    };

    // Validate a single field
    const validateField = (name, value) => {
        let errorMsg = '';
        if (name === 'gpa' && value && (value < 0 || value > 4.0)) errorMsg = 'GPA must be between 0.0 and 4.0.';
        if (name === 'satScore' && value && (value < 400 || value > 1600)) errorMsg = 'SAT score must be between 400 and 1600.';
        if (name === 'actScore' && value && (value < 1 || value > 36)) errorMsg = 'ACT score must be between 1 and 36.';
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return !errorMsg;
    };

    // Handle the "Assess My Readiness" button click
    const handleAssess = async () => {
        const isValid = ['gpa', 'satScore', 'actScore'].every(field => validateField(field, profile[field]));
        if (!isValid) {
            alert("Please fix the errors before assessing.");
            return;
        }
        setIsLoading(true);
        setAssessmentText('');
        const result = await getProfileAssessment(profile);
        setAssessmentText(result.assessmentText);
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Snapshot Readiness Assessment</h1>
                <p className="text-gray-500 mt-2">Enter your profile details to get an AI-powered analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Data Entry */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">🎓 Academic Basics</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                                <select name="gradeLevel" value={profile.gradeLevel} onChange={handleChange} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg">
                                    <option value="9">9th Grade</option>
                                    <option value="10">10th Grade</option>
                                    <option value="11">11th Grade</option>
                                    <option value="12">12th Grade</option>
                                </select>
                            </div>
                            <InputField label="Expected Graduation" name="gradDate" value={expectedGradDate} readOnly={true} />
                            <InputField label="Cumulative GPA" type="number" name="gpa" value={profile.gpa} onChange={handleChange} placeholder="e.g., 3.85" error={errors.gpa} />
                            <InputField label="SAT Score" type="number" name="satScore" value={profile.satScore} onChange={handleChange} placeholder="e.g., 1450" error={errors.satScore} />
                            <InputField label="ACT Score" type="number" name="actScore" value={profile.actScore} onChange={handleChange} placeholder="e.g., 32" error={errors.actScore} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                         <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Activities & Coursework</h2>
                        <TextAreaField label="AP Classes" name="apClasses" value={profile.apClasses} onChange={handleChange} placeholder="e.g., AP Biology, AP Calculus AB" />
                        <div className="mt-4"></div>
                        <TextAreaField label="Extracurriculars & Leadership" name="extracurriculars" value={profile.extracurriculars} onChange={handleChange} placeholder="e.g., Debate Club President, Varsity Soccer" />
                    </div>
                     <button onClick={handleAssess} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400">
                        {isLoading ? 'Assessing...' : 'Assess My Readiness'}
                    </button>
                </div>

                {/* Right Column: Assessment Results */}
                <div className="space-y-6">
                    {/* **UPDATED:** This section now displays the narrative assessment */}
                    {(isLoading || assessmentText) && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">AI Readiness Assessment</h2>
                            {isLoading ? (
                                <p className="text-gray-500 animate-pulse">Generating your assessment...</p>
                            ) : (
                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                    {assessmentText}
                                </div>
                            )}
                            {!isLoading && assessmentText && (
                                <div className="flex justify-end mt-4">
                                     <button onClick={() => alert('This would generate and download a PDF report.')} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-green-700">Download Report</button>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;