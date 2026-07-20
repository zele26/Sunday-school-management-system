// src/features/admin/CoursesManagement.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">የትምህርት ዓይነቶች (Courses Management)</h2>
          <p className="text-xs text-slate-500 mt-1">የትምህርት መርሃ-ግብሮችን እና ኮርሶችን ያስተዳድሩ።</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + አዲስ ኮርስ (Add Course)
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">በመጫን ላይ ነው...</div>
      ) : courses.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም ኮርሶች አልተመዘገቡም። (No courses found.)
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {courses.map((course) => (
            <div key={course._id || course.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-800">{course.title}</p>
                <p className="text-xs text-slate-400">{course.code || 'No Code'}</p>
              </div>
              <button className="text-xs text-rose-600 font-semibold hover:underline">ሰርዝ (Delete)</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;