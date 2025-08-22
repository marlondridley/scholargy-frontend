// src/components/ConfigTest.js
import React from 'react';

const ConfigTest = () => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Not Set',
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'Not Set'
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-xs max-w-xs">
      <h3 className="font-bold mb-2">Environment Variables:</h3>
      <div className="space-y-1">
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-mono">{key}:</span>
            <span className={value === 'Not Set' ? 'text-red-500' : 'text-green-500'}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigTest;
