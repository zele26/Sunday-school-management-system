// src/features/teacher/TeacherAttendanceSummary.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const TeacherAttendanceSummary = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch teacher's courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/teacher/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const fetchSummary = async (courseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = courseId
        ? `${API_BASE_URL}/api/teacher/attendance-summary?courseId=${courseId}&token=${token}`
        : `${API_BASE_URL}/api/teacher/attendance-summary?token=${token}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Find the summary for the selected course (if specific) or show all
      if (courseId) {
        const courseSummary = data.find(s => s.courseId === courseId);
        setSummary(courseSummary || null);
      } else {
        // If all courses, just take the first one or handle array – for simplicity, we'll show the first course's summary if no selection
        setSummary(data.length ? data[0] : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    if (courseId) {
      fetchSummary(courseId);
    } else {
      setSummary(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <h2 className="text-xl font-bold text-slate-800">Attendance Summary</h2>

      {/* Course Selector */}
      <div className="max-w-xs">
        <label className="text-xs text-slate-500 block mb-1">Select Course</label>
        <select
          value={selectedCourse}
          onChange={handleCourseChange}
          className="w-full p-2 border rounded-xl text-sm"
        >
          <option value="">-- Choose a course --</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <div className="py-4 text-center text-slate-400">Loading summary...</div>}

      {!loading && summary && summary.students.length === 0 && (
        <p className="text-slate-500">No students enrolled in this course.</p>
      )}

      {!loading && summary && summary.students.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 mb-3">
            {summary.courseName}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-400">
                  <th className="py-2 px-2">Student</th>
                  <th className="py-2 px-2">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary.students.map(s => (
                  <tr key={s.studentId} className="hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium">{s.studentName}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {s.attended}/{s.totalClasses}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendanceSummary;