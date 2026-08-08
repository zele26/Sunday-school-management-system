// src/features/admin/AttendanceReports.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';

const API_BASE_URL = '';   // same origin – use relative paths

// Grade options helper
const GRADE_OPTIONS = [
  { value: 'Grade 7', label: '7ኛ ክፍል (Grade 7)' },
  { value: 'Grade 8', label: '8ኛ ክፍል (Grade 8)' },
  { value: 'Grade 9', label: '9ኛ ክፍል (Grade 9)' },
  { value: 'Grade 10', label: '10ኛ ክፍል (Grade 10)' },
  { value: 'Grade 11', label: '11ኛ ክፍል (Grade 11)' },
  { value: 'Grade 12', label: '12ኛ ክፍል (Grade 12)' },
];

// Helper to format status text for customer view
const getStatusLabel = (status) => {
  switch (status) {
    case 'Present': return 'ተገኝቷል (Present)';
    case 'Late': return 'ዘግይቷል (Late)';
    case 'Absent': return 'አልተገኘም (Absent)';
    default: return status || '-';
  }
};

// ─── CSV export helper ──────────────────────────────────────────
const downloadCSV = (rows, filename = 'attendance-report.csv') => {
  if (!rows.length) return;
  const headers = [
    'ተማሪ (Student)', 
    'ክፍል (Grade)', 
    'ኮርስ (Course)', 
    'መምህር (Teacher)',
    'ቀን (Date)', 
    'የመግቢያ ሰዓት (Check‑in Time)', 
    'ሁኔታ (Status)',
    'የትምህርት ዘመን (Academic Year)', 
    'ሴሚስተር (Semester)',
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

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [coursesRes, teachersRes] = await Promise.all([
          apiFetch('/api/admin/courses'),
          apiFetch('/api/admin/teachers'),
        ]);
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json().catch(() => []);
          setCourses(Array.isArray(coursesData) ? coursesData : (coursesData.courses || coursesData.data || []));
        }
        if (teachersRes.ok) {
          const teachersData = await teachersRes.json().catch(() => []);
          setTeachers(Array.isArray(teachersData) ? teachersData : (teachersData.teachers || teachersData.data || []));
        }
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

      const res = await apiFetch(`/api/admin/attendance/report?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'የመገኘት መረጃን ማምጣት አልተቻለም (Failed to fetch attendance)');
      }
      const data = await res.json().catch(() => []);
      const normalized = Array.isArray(data) ? data : (data.records || data.attendance || data.data || []);
      setRecords(normalized);
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
        <h2 className="text-xl font-bold">የመገኘት ሪፖርቶች (Attendance Reports)</h2>
        {records.length > 0 && (
          <button
            onClick={() => downloadCSV(records)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
          >
            ⬇ CSV አውርድ (Download CSV)
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="text-xs text-slate-500 block mb-1 font-medium">የመጀመሪያ ቀን (Start Date)</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm" 
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1 font-medium">የማጠቃለያ ቀን (End Date)</label>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm" 
          />
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1 font-medium">ኮርስ (Course)</label>
          <select 
            name="courseId" 
            value={filters.courseId} 
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          >
            <option value="">ሁሉም ኮርሶች (All Courses)</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1 font-medium">ክፍል (Grade)</label>
          <select 
            name="grade" 
            value={filters.grade} 
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          >
            <option value="">ሁሉም ክፍሎች (All Grades)</option>
            {GRADE_OPTIONS.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1 font-medium">ሁኔታ (Status)</label>
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          >
            <option value="">ሁሉም (All)</option>
            <option value="Present">ተገኝቷል (Present)</option>
            <option value="Late">ዘግይቷል (Late)</option>
            <option value="Absent">አልተገኘም (Absent)</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-500 block mb-1 font-medium">መምህር (Teacher)</label>
          <select 
            name="teacher" 
            value={filters.teacher} 
            onChange={handleChange}
            className="p-2 border rounded-xl text-sm"
          >
            <option value="">ሁሉም መምህራን (All Teachers)</option>
            {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
          </select>
        </div>

        <button
          onClick={fetchReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
        >
          አጣራ (Filter)
        </button>
      </div>

      {loading && (
        <div className="py-8 text-center text-slate-400">
          የመገኘት መረጃ በመጫን ላይ ነው... (Loading attendance...)
        </div>
      )}

      {error && (
        <div className="py-4 text-center text-red-500">
          ❌ {error}
        </div>
      )}

      {!loading && !error && records.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          ምንም የመገኘት መረጃ አልተገኘም። እባክዎ ማጣሪያዎቹን አስተካክለው ይሞክሩ ወይም አስቀድመው የQR ኮድ ያንብቡ። (No attendance records found. Try adjusting filters or scanning a QR code first.)
        </div>
      )}

      {!loading && !error && records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-slate-400 font-bold">
                <th className="py-2 px-2">ተማሪ (Student)</th>
                <th className="py-2 px-2">ክፍል (Grade)</th>
                <th className="py-2 px-2">ኮርስ (Course)</th>
                <th className="py-2 px-2">መምህር (Teacher)</th>
                <th className="py-2 px-2">ቀን (Date)</th>
                <th className="py-2 px-2">የመግቢያ ሰዓት (Check‑in)</th>
                <th className="py-2 px-2">ሁኔታ (Status)</th>
                <th className="py-2 px-2">የትምህርት ዘመን (Acad. Year)</th>
                <th className="py-2 px-2">ሴሚስተር (Semester)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map(r => (
                <tr key={r._id} className="hover:bg-slate-50">
                  <td className="py-2 px-2 font-medium">{r.studentName}</td>
                  <td className="py-2 px-2">{r.grade || '-'}</td>
                  <td className="py-2 px-2">{r.courseName || 'አጠቃላይ (General)'}</td>
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
                      {getStatusLabel(r.status)}
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