// src/features/student/StudentCourses.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/student/my-courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching student courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የተመዘገቡባቸው ኮርሶች (Enrolled Courses)</h2>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">በመጫን ላይ ነው...</div>
      ) : courses.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም የተመዘገቡ ኮርሶች አልተገኙም።
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c._id || c.id} className="p-4 border border-slate-200 rounded-xl">
              <h3 className="font-bold text-slate-800">{c.title || c.name}</h3>
              <p className="text-xs text-slate-500 mt-1">መምህር: {c.teacherName || 'አልተመደበም'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;