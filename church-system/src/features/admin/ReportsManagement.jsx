// src/features/admin/ReportsManagement.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';

// ─── helpers to download CSV ────────────────────────────────────────
const downloadCSV = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const generateCSV = (data, reportType) => {
  switch (reportType) {
    case 'student': {
      const { student, courseSummaries, attendanceHistory } = data;
      let csv = `Student,Grade,Email\n"${student.fullName}",${student.grade || ''},"${student.email || ''}"`;
      csv += '\n\nCourse,Attended,Total Sessions,Missed';
      (courseSummaries || []).forEach(c => {
        csv += `\n"${c.courseName || ''}",${c.attended || 0},${c.totalSessions || 0},${c.missed || 0}`;
      });
      csv += '\n\nAttendance History\nDate,Course';
      (attendanceHistory || []).forEach(h => {
        csv += `\n${new Date(h.date).toLocaleDateString()},"${h.courseName || ''}"`;
      });
      return csv;
    }
    case 'grade': {
      const { grade, students } = data;
      let csv = `Grade: ${grade}\n\nStudent,Overall Attended,Overall Sessions\n`;
      (students || []).forEach(s => {
        csv += `"${s.studentName}",${s.overallAttended || 0},${s.overallSessions || 0}\n`;
        (s.courses || []).forEach(c => {
          csv += `,${c.courseName || ''},${c.attended || 0}/${c.totalSessions || 0}\n`;
        });
      });
      return csv;
    }
    case 'course': {
      const { course, totalSessions, students } = data;
      let csv = `Course: "${course.name}" (Teacher: ${course.teacherName || 'N/A'})\nTotal class days: ${totalSessions || 0}\n\nStudent,Attended,Total Sessions\n`;
      (students || []).forEach(s => {
        csv += `"${s.studentName}",${s.attended || 0},${s.totalSessions || 0}\n`;
      });
      return csv;
    }
    case 'teacher': {
      const { teacher, courses } = data;
      let csv = `Teacher: "${teacher.fullName}" (${teacher.email || ''})\n\n`;
      (courses || []).forEach(c => {
        csv += `Course: "${c.courseName}" (Total days: ${c.totalSessions || 0})\nStudent,Attended,Total\n`;
        (c.students || []).forEach(s => {
          csv += `"${s.studentName}",${s.attended || 0},${s.totalSessions || 0}\n`;
        });
        csv += '\n';
      });
      return csv;
    }
    case 'date': {
      const { date, records } = data;
      let csv = `Attendance for ${new Date(date).toLocaleDateString()}\n\nStudent,Grade,Course,Time\n`;
      (records || []).forEach(r => {
        csv += `"${r.studentName || ''}",${r.grade || ''},"${r.courseName || ''}",${new Date(r.time).toLocaleTimeString()}\n`;
      });
      return csv;
    }
    default:
      return '';
  }
};

// ─── main component ──────────────────────────────────────────────────
const ReportsManagement = () => {
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const grades = ['Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'];

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [sRes, cRes, tRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/students?limit=1000&token=${token}`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/courses?token=${token}`, { headers }),
          fetch(`${API_BASE_URL}/api/admin/teachers?token=${token}`, { headers }),
        ]);
        const sData = await sRes.json();
        setStudents(sData.students || sData);
        setCourses(await cRes.json());
        setTeachers(await tRes.json());
      } catch (err) { console.error(err); }
    };
    fetchDropdowns();
  }, []);

  const fetchReport = async () => {
    if (!reportType) return;
    setLoading(true);
    setError('');
    setData(null);
    const token = localStorage.getItem('token');
    let url = '';
    try {
      switch (reportType) {
        case 'student':
          if (!selectedStudent) { setError('Please select a student'); setLoading(false); return; }
          url = `${API_BASE_URL}/api/admin/reports/student/${selectedStudent}?token=${token}`;
          break;
        case 'grade':
          if (!selectedGrade) { setError('Please select a grade'); setLoading(false); return; }
          url = `${API_BASE_URL}/api/admin/reports/grade/${encodeURIComponent(selectedGrade)}?token=${token}`;
          break;
        case 'course':
          if (!selectedCourse) { setError('Please select a course'); setLoading(false); return; }
          url = `${API_BASE_URL}/api/admin/reports/course/${selectedCourse}?token=${token}`;
          break;
        case 'teacher':
          if (!selectedTeacher) { setError('Please select a teacher'); setLoading(false); return; }
          url = `${API_BASE_URL}/api/admin/reports/teacher/${selectedTeacher}?token=${token}`;
          break;
        case 'date':
          if (!selectedDate) { setError('Please pick a date'); setLoading(false); return; }
          url = `${API_BASE_URL}/api/admin/reports/date?date=${selectedDate}&token=${token}`;
          break;
        default: return;
      }
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load report');
      }
      setData(await res.json());
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  // ─── render helpers ──────────────────────────────────────────────
  const renderStudentReport = () => {
    if (!data) return null;
    const { student, courseSummaries, attendanceHistory } = data;
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">{student.fullName}</h3>
          <p className="text-sm text-slate-500">Grade: {student.grade || 'N/A'} | Email: {student.email || ''}</p>
        </div>
        <div>
          <h4 className="font-medium mb-2">Course Summary</h4>
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b"><th className="py-1">Course</th><th>Attended</th><th>Total</th></tr></thead>
            <tbody>
              {(courseSummaries || []).map(cs => (
                <tr key={cs.courseId}><td>{cs.courseName}</td><td>{cs.attended}</td><td>{cs.totalSessions}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="font-medium mb-2">Attendance History</h4>
          <table className="w-full text-left text-sm">
            <thead><tr className="border-b"><th className="py-1">Date</th><th>Course</th></tr></thead>
            <tbody>
              {(attendanceHistory || []).map(h => (
                <tr key={h._id}><td>{new Date(h.date).toLocaleDateString()}</td><td>{h.courseName}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGradeReport = () => {
    if (!data) return null;
    const { grade, students } = data;
    return (
      <div>
        <h3 className="text-lg font-semibold mb-3">{grade} Attendance</h3>
        {(students || []).map(s => (
          <div key={s.studentId} className="mb-4">
            <p className="font-medium">{s.studentName} (Overall: {s.overallAttended || 0}/{s.overallSessions || 0})</p>
            {(s.courses && s.courses.length > 0) ? (
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b"><th>Course</th><th>Attended</th><th>Total</th></tr></thead>
                <tbody>
                  {s.courses.map(c => (
                    <tr key={c.courseName}><td>{c.courseName}</td><td>{c.attended}</td><td>{c.totalSessions}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-slate-400">No courses enrolled.</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCourseReport = () => {
    if (!data) return null;
    const { course, totalSessions, students } = data;
    return (
      <div>
        <h3 className="text-lg font-semibold">{course.name} ({course.teacherName || 'N/A'})</h3>
        <p className="text-sm text-slate-500">Total class days: {totalSessions || 0}</p>
        <table className="w-full text-left text-sm mt-3">
          <thead><tr className="border-b"><th>Student</th><th>Attended</th><th>Total</th></tr></thead>
          <tbody>
            {(students || []).map(s => (
              <tr key={s.studentId}><td>{s.studentName}</td><td>{s.attended}</td><td>{s.totalSessions}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTeacherReport = () => {
    if (!data) return null;
    const { teacher, courses } = data;
    return (
      <div>
        <h3 className="text-lg font-semibold">{teacher.fullName}'s Courses</h3>
        {(courses || []).map(c => (
          <div key={c.courseId} className="mt-4">
            <h4 className="font-medium">{c.courseName} (Total days: {c.totalSessions || 0})</h4>
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b"><th>Student</th><th>Attended</th><th>Total</th></tr></thead>
              <tbody>
                {(c.students || []).map(s => (
                  <tr key={s.studentId}><td>{s.studentName}</td><td>{s.attended}</td><td>{s.totalSessions}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderDateReport = () => {
    if (!data) return null;
    const { date, records } = data;
    return (
      <div>
        <h3 className="text-lg font-semibold">Attendance for {new Date(date).toLocaleDateString()}</h3>
        <table className="w-full text-left text-sm mt-3">
          <thead><tr className="border-b"><th>Student</th><th>Grade</th><th>Course</th><th>Time</th></tr></thead>
          <tbody>
            {(records || []).map(r => (
              <tr key={r._id}><td>{r.studentName}</td><td>{r.grade}</td><td>{r.courseName}</td><td>{new Date(r.time).toLocaleTimeString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Attendance Reports</h2>
        {data && (
          <button
            onClick={() => downloadCSV(generateCSV(data, reportType), `${reportType}-report.csv`)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            ⬇ Download CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select value={reportType} onChange={(e) => { setReportType(e.target.value); setData(null); setError(''); }}
          className="p-2 border rounded-xl text-sm">
          <option value="">-- Select Report Type --</option>
          <option value="student">By Student</option>
          <option value="grade">By Grade</option>
          <option value="course">By Course</option>
          <option value="teacher">By Teacher</option>
          <option value="date">By Date</option>
        </select>

        {reportType === 'student' && (
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
            className="p-2 border rounded-xl text-sm">
            <option value="">Select Student</option>
            {students.map(s => (<option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>))}
          </select>
        )}
        {reportType === 'grade' && (
          <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)}
            className="p-2 border rounded-xl text-sm">
            <option value="">Select Grade</option>
            {grades.map(g => (<option key={g} value={g}>{g}</option>))}
          </select>
        )}
        {reportType === 'course' && (
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
            className="p-2 border rounded-xl text-sm">
            <option value="">Select Course</option>
            {courses.map(c => (<option key={c._id} value={c._id}>{c.name}</option>))}
          </select>
        )}
        {reportType === 'teacher' && (
          <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
            className="p-2 border rounded-xl text-sm">
            <option value="">Select Teacher</option>
            {teachers.map(t => (<option key={t._id} value={t._id}>{t.fullName}</option>))}
          </select>
        )}
        {reportType === 'date' && (
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            className="p-2 border rounded-xl text-sm" />
        )}

        <button onClick={fetchReport} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">
          Generate Report
        </button>
      </div>

      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-sm">{error}</div>}
      {loading && <div className="py-4 text-center text-slate-400">Loading report...</div>}

      {!loading && data && (
        <div className="mt-6">
          {reportType === 'student' && renderStudentReport()}
          {reportType === 'grade' && renderGradeReport()}
          {reportType === 'course' && renderCourseReport()}
          {reportType === 'teacher' && renderTeacherReport()}
          {reportType === 'date' && renderDateReport()}
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;