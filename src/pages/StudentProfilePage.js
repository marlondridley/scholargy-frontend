import React, { useState, useEffect } from 'react';
import { getProfileAssessment } from '../services/api';

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
    const [profile, setProfile] = useState({
        gradeLevel: '12',
        gpa: '3.8',
        satScore: '1450',
        actScore: '',
        apClasses: 'AP Biology, AP Calculus AB, AP US History',
        extracurriculars: 'Debate Club president, Varsity Soccer, Robotics Team',
    });
    const [errors, setErrors] = useState({});
    const [expectedGradDate, setExpectedGradDate] = useState('');
    const [assessment, setAssessment] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (errors[name]) validateField(name, value);
    };

    const validateField = (name, value) => {
        let errorMsg = '';
        if (name === 'gpa' && value && (value < 0 || value > 4.0)) errorMsg = 'GPA must be between 0.0 and 4.0.';
        if (name === 'satScore' && value && (value < 400 || value > 1600)) errorMsg = 'SAT score must be between 400 and 1600.';
        if (name === 'actScore' && value && (value < 1 || value > 36)) errorMsg = 'ACT score must be between 1 and 36.';
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return !errorMsg;
    };

    const handleAssess = async () => {
        const isValid = ['gpa', 'satScore', 'actScore'].every(field => validateField(field, profile[field]));
        if (!isValid) {
            alert("Please fix the errors before assessing.");
            return;
        }
        setIsLoading(true);
        setAssessment(null);
        const result = await getProfileAssessment(profile);
        setAssessment(result);
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800">Snapshot Readiness Assessment</h1>
                <p className="text-gray-500 mt-2">Enter your profile details to get an AI-powered analysis.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

                <div className="space-y-6">
                    {assessment && (
                        <>
                            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Your Readiness Score</h2>
                                <p className="text-6xl font-bold text-blue-600 my-4">{assessment.readinessScore}<span className="text-2xl text-gray-400">/100</span></p>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${assessment.readinessScore}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Dynamic Recommendations</h2>
                                <ul className="space-y-3">
                                    {assessment.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                            <span className="text-green-600 font-bold">💡</span>
                                            <span className="text-gray-700 text-sm">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-end mt-4">
                                     <button onClick={() => alert('This would add these recommendations to your goals list.')} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-green-700">Add to My Goals</button>
                                </div>
                            </div>
                        </>
                    )}
                     <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">What-If Scenarios</h2>
                        <p className="text-sm text-gray-500 mb-4">See how changes could impact your score.</p>
                        <div className="space-y-4">
                            <InputField label="Adjust GPA" type="number" name="whatIfGpa" placeholder="e.g., 3.9" />
                            <InputField label="Adjust SAT Score" type="number" name="whatIfSat" placeholder="e.g., 1500" />
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <button onClick={() => alert('Counselor chat feature is for premium users.')} className="flex-1 bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-purple-200">Get Help from Counselor</button>
                            <button onClick={() => alert('This would book a call.')} className="flex-1 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-gray-800">Schedule a Strategy Session</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfilePage;