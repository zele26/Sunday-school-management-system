// src/features/admin/AttendanceReports.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';

const API_BASE_URL = '';   // same origin – use relative paths

// ─── CSV export helper ──────────────────────────────────────────
const downloadCSV = (rows, filename = 'attendance-report.csv') => {
  if (!rows.length) return;
  const headers = [
    'Student', 'Grade', 'Course', 'Teacher',
    'Date', 'Check‑in Time', 'Status',
    'Academic Year', 'Semester',
  ];
  const csvRows = [headers.join(',')];
  rows.forEach(r => {
    csvRows.push(
      [
        `"${r.studentName || ''}"`,
        `"${r.grade || ''}"`,
        `"${r.courseName || ''}"`,
        `"${r.teacherName || ''}"`,
        `"${new Date(r.date).toLocaleDateString()}"`,
        `"${r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}"`,
        `"${r.status || ''}"`,
        `"${r.academicYear || ''}"`,
        `"${r.semester || ''}"`,
      ].join(',')
    );
  });
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Main component ─────────────────────────────────────────────
const AttendanceReports = () => {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    courseId: '',
    grade: '',
    status: '',
    teacher: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined grades (same as in student management)
  const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          apiFetch('/api/admin/courses'),
          apiFetch('/api/admin/teachers'),
        ]);
        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (teachersRes.ok) setTeachers(await teachersRes.json());
      } catch (err) {
        console.error('Failed to load dropdowns', err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();

      const appendIf = (key, value) => {
        if (value && value.trim() !== '') {
          params.append(key, value.trim());
        }
      };

      appendIf('startDate', filters.startDate);
      appendIf('endDate', filters.endDate);
      appendIf('courseId', filters.courseId);
      appendIf('grade', filters.grade);
      appendIf('status', filters.status);
      appendIf('teacher', filters.teacher);

      // Use the new apiFetch – token is automatically added
      const res = await apiFetch(`/api/admin/attendance/report?${params}`);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Attendance Reports</h2>
        {records.length > 0 && (
          <button
            onClick={() => downloadCSV(records)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            ⬇ Download CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-6">
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

        <div>
          <label className="text-xs text-slate-500 block">Grade</label>
          <select name="grade" value={filters.grade} onChange={handleChange}
            className="p-2 border rounded-xl text-sm">
            <option value="">All Grades</option>
            {grades.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 block">Status</label>
          <select name="status" value={filters.status} onChange={handleChange}
            className="p-2 border rounded-xl text-sm">
            <option value="">All</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 block">Teacher</label>
          <select name="teacher" value={filters.teacher} onChange={handleChange}
            className="p-2 border rounded-xl text-sm">
            <option value="">All Teachers</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
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
      {error && <div className="py-4 text-center text-red-500">❌ {error}</div>}
      {!loading && !error && records.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          No attendance records found. Try adjusting filters or scanning a QR code first.
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400">
                <th className="py-2 px-2">Student</th>
                <th className="py-2 px-2">Grade</th>
                <th className="py-2 px-2">Course</th>
                <th className="py-2 px-2">Teacher</th>
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Check‑in</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Acad. Year</th>
                <th className="py-2 px-2">Semester</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium">{r.studentName}</td>
                  <td className="py-2 px-2">{r.grade || '-'}</td>
                  <td className="py-2 px-2">{r.courseName || 'General'}</td>
                  <td className="py-2 px-2">{r.teacherName || '-'}</td>
                  <td className="py-2 px-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 px-2">
                    {r.checkInTime
                      ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      r.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                      r.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 px-2">{r.academicYear || '-'}</td>
                  <td className="py-2 px-2">{r.semester || '-'}</td>
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