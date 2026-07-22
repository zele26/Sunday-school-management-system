// src/features/admin/AttendanceReports.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const AttendanceReports = () => {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', courseId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/admin/courses?token=${token}`, {
        headers: { Authorization: `Bearer ${token}` }, // keep header for other routes
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.courseId) params.append('courseId', filters.courseId);

      // Send token as query parameter (already supported by middleware)
      const url = `${API_BASE_URL}/api/admin/attendance/report?${params}&token=${token}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }, // still send header as well
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to fetch attendance');
      }
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Attendance Reports</h2>

      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="text-xs text-slate-500 block">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block">End Date</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block">Course</label>
          <select
            name="courseId"
            value={filters.courseId}
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          Filter
        </button>
      </div>

      {loading && <div className="py-8 text-center text-slate-400">Loading attendance...</div>}
      {error && (
        <div className="py-4 text-center text-red-500">
          ❌ {error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          No attendance records found. Try adjusting filters or scan a QR code first.
        </div>
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
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2">
                    {r.student?.firstName} {r.student?.lastName}
                  </td>
                  <td className="py-2 px-2">{r.course?.name || 'N/A'}</td>
                  <td className="py-2 px-2">
                    {new Date(r.date).toLocaleDateString()}
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

export default AttendanceReports;