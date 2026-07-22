// src/features/teacher/TeacherCourses.jsx
import React, { useEffect, useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/teacher/my-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">My Courses</h2>
      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading courses...</div>
      ) : courses.length === 0 ? (
        <p className="text-slate-500">You are not assigned to any courses yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Course Name</th>
                <th className="py-2 px-2">Age Group</th>
                <th className="py-2 px-2">Schedule</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {courses.map(course => (
                <tr key={course._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium">{course.name}</td>
                  <td className="py-2 px-2">{course.ageGroup}</td>
                  <td className="py-2 px-2">{course.schedule || '-'}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {course.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;