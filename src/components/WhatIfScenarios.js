import React, { useState, useEffect } from 'react';
import { calculateWhatIfScenarios } from '../services/api';

const WhatIfScenarios = ({ studentProfile, collegeId, collegeName }) => {
    const [scenarios, setScenarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [customScenario, setCustomScenario] = useState({
        gpa: studentProfile.gpa,
        satScore: studentProfile.satScore,
        extracurricularStrength: studentProfile.extracurricularStrength
    });

    const predefinedScenarios = [
        { name: "Improve GPA by 0.2", changes: { gpa: parseFloat(studentProfile.gpa) + 0.2 } },
        { name: "Increase SAT by 50", changes: { satScore: parseInt(studentProfile.satScore) + 50 } },
        { name: "Max Extracurriculars", changes: { extracurricularStrength: 5 } },
        { name: "All Improvements", changes: { 
            gpa: parseFloat(studentProfile.gpa) + 0.2,
            satScore: parseInt(studentProfile.satScore) + 50,
            extracurricularStrength: 5
        }}
    ];

    const calculateScenarios = async () => {
        setLoading(true);
        const result = await calculateWhatIfScenarios(
            studentProfile,
            [
                ...predefinedScenarios,
                { name: "Custom", changes: customScenario }
            ],
            collegeId
        );
        setScenarios(result.results || []);
        setLoading(false);
    };

    useEffect(() => {
        if (collegeId) calculateScenarios();
    }, [collegeId]);

    const handleCustomChange = (field, value) => {
        setCustomScenario(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-xl font-bold text-gray-800 mb-4">What-If Scenarios for {collegeName}</h3>
            
            {loading ? (
                <div className="animate-pulse">Calculating scenarios...</div>
            ) : (
                <div className="space-y-4">
                    {scenarios.map((scenario, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{scenario.scenario}</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-bold ${scenario.delta > 0 ? 'text-green-600' : scenario.delta < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                    {scenario.probability}%
                                </span>
                                {scenario.delta !== 0 && (
                                    <span className={`text-sm ${scenario.delta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        ({scenario.delta > 0 ? '+' : ''}{scenario.delta}%)
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2">Custom Scenario</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <input
                                type="number"
                                step="0.1"
                                value={customScenario.gpa}
                                onChange={(e) => handleCustomChange('gpa', e.target.value)}
                                placeholder="GPA"
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                value={customScenario.satScore}
                                onChange={(e) => handleCustomChange('satScore', e.target.value)}
                                placeholder="SAT"
                                className="p-2 border rounded"
                            />
                            <input
                                type="number"
                                min="1"
                                max="5"
                                value={customScenario.extracurricularStrength}
                                onChange={(e) => handleCustomChange('extracurricularStrength', e.target.value)}
                                placeholder="EC (1-5)"
                                className="p-2 border rounded"
                            />
                        </div>
                        <button
                            onClick={calculateScenarios}
                            className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Recalculate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatIfScenarios;