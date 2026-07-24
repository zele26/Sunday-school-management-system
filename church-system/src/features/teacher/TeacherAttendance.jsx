// src/features/teacher/TeacherAttendance.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';

const TeacherAttendance = () => {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', courseId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await apiFetch('/api/teacher/my-courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.courseId) params.append('courseId', filters.courseId);

      const res = await apiFetch(`/api/teacher/attendance?${params}`);
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Attendance Report</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500 block">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleChange}
            className="p-2 border rounded-xl text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block">End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleChange}
            className="p-2 border rounded-xl text-sm" />
        </div>
        <div>
          <label className="text-xs text-slate-500 block">Course</label>
          <select name="courseId" value={filters.courseId} onChange={handleChange}
            className="p-2 border rounded-xl text-sm">
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={fetchAttendance}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold h-fit">
          Filter
        </button>
      </div>

      {error && <div className="py-4 text-center text-red-500">❌ {error}</div>}
      {loading && <div className="py-8 text-center text-slate-400">Loading attendance...</div>}
      {!loading && !error && records.length === 0 && (
        <p className="text-slate-500">No attendance records found.</p>
      )}
      {!loading && !error && records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Student</th>
                <th className="py-2 px-2">Course</th>
                <th className="py-2 px-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-slate-700">
              {records.map(r => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2">{r.student?.firstName} {r.student?.lastName}</td>
                  <td className="py-2 px-2">{r.course?.name || 'N/A'}</td>
                  <td className="py-2 px-2">{new Date(r.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;