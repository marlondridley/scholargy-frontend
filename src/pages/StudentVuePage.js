import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GradeTrajectoryChart = ({ course }) => {
  if (!course?.Assignments?.Assignment) return null;

  const labels = course.Assignments.Assignment.map(a => a['@Measure']);
  const scores = course.Assignments.Assignment.map(a => {
    const parts = a['@Score'].split('/');
    if (parts.length !== 2) return null;
    const score = parseFloat(parts[0]);
    const total = parseFloat(parts[1]);
    if (isNaN(score) || isNaN(total) || total === 0) return null;
    return (score / total) * 100;
  }).filter(s => s !== null);

  const data = {
    labels,
    datasets: [
      {
        label: 'Assignment Score (%)',
        data: scores,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: `Grade Trajectory for ${course['@Title']}` },
    },
    scales: { y: { min: 0, max: 100 } },
  };

  return <Line options={options} data={data} />;
};

const StudentVuePage = () => {
  const [credentials, setCredentials] = useState({ districtUrl: '', username: '', password: '' });
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCourseForChart, setSelectedCourseForChart] = useState(null);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleFetchData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStudentData(null);
    setSelectedCourseForChart(null);

    try {
      const res = await fetch('/studentvue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch data.');
      }

      setStudentData(result.data);
      setSelectedCourseForChart(result.data.gradebook?.Courses?.Course?.[0] || null);
    } catch (err) {
      console.error('StudentVue fetch error:', err.message);
      setError(err.message || 'Something went wrong.');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">StudentVue Connect</h1>
        <p className="text-gray-500 mt-2">Monitor your student's academic progress in real-time.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <form onSubmit={handleFetchData} className="space-y-4">
          <input
            name="districtUrl"
            value={credentials.districtUrl}
            onChange={handleChange}
            placeholder="District URL (e.g., https://portal.yourschool.edu)"
            className="w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full p-3 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition-all disabled:bg-gray-400"
          >
            {loading ? 'Connecting...' : 'Fetch Student Data'}
          </button>
        </form>
      </div>

      {studentData && (
        <div className="space-y-6">
          {selectedCourseForChart && (
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Grade Point Trajectory</h2>
              <p className="text-sm text-gray-500 mb-4">
                Visualize assignment performance over time for a selected course.
              </p>
              <GradeTrajectoryChart course={selectedCourseForChart} />
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Course Details & Progress</h2>
            <ul className="space-y-4">
              {studentData.gradebook?.Courses?.Course?.map((course) => {
                const total = course.Assignments?.Assignment?.length || 0;
                const progress = total > 0 ? (total / total) * 100 : 0;

                return (
                  <li key={course['@Title']} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-lg">{course['@Title']}</p>
                        <p className="text-sm text-gray-500">{course['@Teacher']}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-2xl text-green-600">{course['@Grade']}</span>
                        <button
                          onClick={() => setSelectedCourseForChart(course)}
                          className="text-xs text-blue-500 hover:underline ml-2"
                        >
                          Show Trend
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs text-gray-500">
                        <span>Course Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold text-sm mb-2">Recent Assignments:</h4>
                      <ul className="space-y-2 text-sm">
                        {course.Assignments?.Assignment?.map((assignment) => (
                          <li key={assignment['@Measure']} className="border-t pt-2">
                            <div className="flex justify-between">
                              <span>{assignment['@Measure']}</span>
                              <span className="font-medium">{assignment['@Score']}</span>
                            </div>
                            {assignment['@Notes'] && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                Teacher Comment: "{assignment['@Notes']}"
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentVuePage;
