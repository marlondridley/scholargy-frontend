import React, { useState, useEffect } from 'react';
import { getInstitutionDetails } from '../services/api';
import WhatIfScenarios from '../components/WhatIfScenarios';

const DataCard = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center mb-4">
            {icon}
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="space-y-3 text-gray-600">{children}</div>
    </div>
);

const ScoreBar = ({ min, max, label, range = 1600 }) => {
    if (typeof min !== 'number' || typeof max !== 'number') return null;
    const left = (min / range) * 100;
    const width = ((max - min) / range) * 100;
    return (
        <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{min}</span>
                <span>{max}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ marginLeft: `${left}%`, width: `${width}%` }}></div>
            </div>
            <p className="text-sm text-center mt-1 font-medium">{label}</p>
        </div>
    );
};


const ProfilePage = ({ collegeId, onBack, onGenerateReport, studentProfile }) => {
    const [college, setCollege] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const details = await getInstitutionDetails(collegeId);
            setCollege(details);
            setLoading(false);
        };
        fetchDetails();
    }, [collegeId]);

    if (loading) return <div className="text-center p-10">Loading College Profile...</div>;
    if (!college) return <div className="text-center p-10">Could not find college data.</div>;

    const { general_info, cost_and_aid, admissions, outcomes, derivedData } = college;
	
    return (
        <div>
            <button onClick={onBack} className="mb-6 bg-white text-gray-800 px-4 py-2 rounded-lg border shadow-sm hover:bg-gray-100 transition-colors">
                &larr; Back to Dashboard
            </button>
            <div className="bg-white p-8 rounded-xl shadow-lg border mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900">{general_info.name}</h1>
                <p className="text-xl text-gray-500 mt-1">{general_info.city}, {general_info.state}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DataCard title="Admissions" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}>
                        <p><strong>Admission Rate:</strong> <span className="font-bold text-blue-600">{admissions.admission_rate ? `${(admissions.admission_rate * 100).toFixed(1)}%` : 'N/A'}</span></p>
                        <ScoreBar min={admissions.sat_scores?.verbal_25th} max={admissions.sat_scores?.verbal_75th} label="SAT Evidence-Based Reading and Writing" range={800} />
                        <ScoreBar min={admissions.sat_scores?.math_25th} max={admissions.sat_scores?.math_75th} label="SAT Math" range={800} />
                        <ScoreBar min={admissions.act_scores?.composite_25th} max={admissions.act_scores?.composite_75th} label="ACT Composite" range={36} />
                    </DataCard>
                    {studentProfile && (
                        <WhatIfScenarios 
                            studentProfile={studentProfile}
                            collegeId={collegeId}
                            collegeName={general_info.name}
                        />
                    )}
                     {derivedData && (
                        <DataCard title="Finance & Staffing" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
                            <p><strong>Total Revenue:</strong> ${derivedData.total_revenue?.toLocaleString() || 'N/A'}</p>
                            <p><strong>Total Expenses:</strong> ${derivedData.total_expenses?.toLocaleString() || 'N/A'}</p>
                            <p><strong>Average Faculty Salary:</strong> ${derivedData.avg_faculty_salary?.toLocaleString() || 'N/A'}</p>
                        </DataCard>
                     )}
                </div>
                <div className="space-y-6">
                     <DataCard title="Student Charges" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}>
                        <p><strong>In-State Tuition:</strong> ${cost_and_aid.tuition_in_state?.toLocaleString() || 'N/A'}</p>
                        <p><strong>Out-of-State Tuition:</strong> ${cost_and_aid.tuition_out_of_state?.toLocaleString() || 'N/A'}</p>
                        <p><strong>% Receiving Pell Grant:</strong> {cost_and_aid.percent_pell_grant || 'N/A'}%</p>
                    </DataCard>
                    <DataCard title="Outcomes" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>}>
                        <p><strong>Total Enrollment:</strong> {college.enrollment?.total?.toLocaleString() || 'N/A'}</p>
                        <p><strong>Graduation Rate:</strong> {outcomes.grad_rate_total || 'N/A'}%</p>
                        <p><strong>Derived Grad Rate (150%):</strong> {derivedData?.grad_rate_150_percent_total || 'N/A'}%</p>
                    </DataCard>
                    <button onClick={onGenerateReport} className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition-all transform hover:scale-105">
                        Generate Scholargy Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;