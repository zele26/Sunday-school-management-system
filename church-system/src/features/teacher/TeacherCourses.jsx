// src/features/teacher/TeacherCourses.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const TeacherCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/teacher/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching teacher courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የሚያስተምሯቸው ኮርሶች (Assigned Courses)</h2>
        <p className="text-xs text-slate-500 mt-1">የኮርስ syllabus እና መግለጫዎችን ያስተዳድሩ።</p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">በመጫን ላይ ነው...</div>
      ) : courses.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም ኮርሶች አልተገኙም።
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course._id || course.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition">
              <h3 className="font-bold text-slate-800">{course.title || course.name}</h3>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.description || 'ምንም መግለጫ የለም'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;