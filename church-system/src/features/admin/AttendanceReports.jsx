import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const AttendanceReports = () => {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', courseId: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/admin/courses`, { headers: { Authorization: `Bearer ${token}` } });
    setCourses(await res.json());
  };

  const fetchReport = async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE_URL}/api/admin/attendance/report?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRecords(await res.json());
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h2 className="text-xl font-bold mb-4">Attendance Reports</h2>
      <div className="flex gap-4 mb-4">
        <input type="date" name="startDate" onChange={handleChange} className="border p-2 rounded-xl" />
        <input type="date" name="endDate" onChange={handleChange} className="border p-2 rounded-xl" />
        <select name="courseId" onChange={handleChange} className="border p-2 rounded-xl">
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <button onClick={fetchReport} className="bg-blue-600 text-white px-4 py-2 rounded-xl">Filter</button>
      </div>
      <table className="w-full text-left">
        <thead className="border-b text-xs uppercase">
          <tr><th className="py-2">Student</th><th>Course</th><th>Date</th></tr>
        </thead>
        <tbody className="text-sm">
          {records.map(r => (
            <tr key={r._id} className="border-b">
              <td className="py-1">{r.student?.firstName} {r.student?.lastName}</td>
              <td>{r.course?.name || 'N/A'}</td>
              <td>{new Date(r.date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceReports;