import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentVuePage = () => {
  const [credentials, setCredentials] = useState({
    districtUrl: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/studentvue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch student data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            StudentVue Integration
          </h1>
          <p className="text-gray-600">
            Connect your StudentVue account to import your academic data
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="districtUrl" className="block text-sm font-medium text-gray-700 mb-1">
                District URL
              </label>
              <input
                type="url"
                id="districtUrl"
                name="districtUrl"
                value={credentials.districtUrl}
                onChange={handleInputChange}
                placeholder="https://your-district.studentvue.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleInputChange}
                placeholder="Your StudentVue username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Your StudentVue password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connecting...' : 'Connect StudentVue'}
            </button>
          </form>
        </div>

        {data && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Academic Data</h2>
            
            {data.gradebook && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Gradebook</h3>
                <div className="space-y-3">
                  {data.gradebook.Courses?.Course?.map((course, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{course['@Title']}</h4>
                      <p className="text-gray-600">Grade: {course['@Grade']}</p>
                      <p className="text-gray-600">Teacher: {course['@Teacher']}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.attendance && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Attendance</h3>
                <div className="space-y-2">
                  {data.attendance.Absences?.Absence?.map((absence, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">{absence['@AbsenceDate']}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        absence['@Reason'] === 'Excused' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {absence['@Reason']}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.profile && (
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Grade Level:</span>
                    <span className="ml-2 font-medium">{data.profile.gradeLevel}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">GPA:</span>
                    <span className="ml-2 font-medium">{data.profile.gpa}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Credits:</span>
                    <span className="ml-2 font-medium">{data.profile.totalCredits}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Graduation Year:</span>
                    <span className="ml-2 font-medium">{data.profile.graduationYear}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVuePage;
