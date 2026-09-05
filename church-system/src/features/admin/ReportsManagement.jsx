'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  User, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Layers
} from 'lucide-react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast';
import { formatEthiopianDate } from '../../utils/ethiopianDate';

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
        csv += `\n${formatEthiopianDate(h.date)},"${h.courseName || ''}"`;
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
      let csv = `Attendance for ${formatEthiopianDate(date)}\n\nStudent,Grade,Course,Time\n`;
      (records || []).forEach(r => {
        csv += `"${r.studentName || ''}",${r.grade || ''},"${r.courseName || ''}",${new Date(r.time).toLocaleTimeString()}\n`;
      });
      return csv;
    }
    default:
      return '';
  }
};

const ReportsManagement = () => {
  const [reportType, setReportType] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [sRes, cRes, tRes] = await Promise.all([
          apiFetch('/api/admin/students?limit=1000'),
          apiFetch('/api/admin/courses'),
          apiFetch('/api/admin/teachers'),
        ]);
        if (sRes.ok) {
          const sData = await sRes.json();
          setStudents(sData.students || sData || []);
        }
        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(Array.isArray(cData) ? cData : cData.courses || []);
        }
        if (tRes.ok) {
          const tData = await tRes.json();
          setTeachers(Array.isArray(tData) ? tData : tData.teachers || []);
        }
      } catch (err) {
        console.error('Failed to load dropdowns:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchReport = async () => {
    if (!reportType) {
      toast.info('እባክዎ የሪፖርት ዓይነት ይምረጡ (Please select a report type)');
      return;
    }
    setLoading(true);
    setData(null);

    let url = '';
    try {
      switch (reportType) {
        case 'student':
          if (!selectedStudent) {
            toast.error('Please select a student');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/student/${selectedStudent}`;
          break;
        case 'grade':
          if (!selectedGrade) {
            toast.error('Please select a grade');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/grade/${encodeURIComponent(selectedGrade)}`;
          break;
        case 'course':
          if (!selectedCourse) {
            toast.error('Please select a course');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/course/${selectedCourse}`;
          break;
        case 'teacher':
          if (!selectedTeacher) {
            toast.error('Please select a teacher');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/teacher/${selectedTeacher}`;
          break;
        case 'date':
          if (!selectedDate) {
            toast.error('Please pick a date');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/date?date=${selectedDate}`;
          break;
        default:
          return;
      }
      const res = await apiFetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load report');
      }
      const reportData = await res.json();
      setData(reportData);
      toast.success('ሪፖርቱ በተሳካ ሁኔታ ተዘጋጅቷል!');
    } catch (err) {
      toast.error(err.message || 'ሪፖርቱን ማምጣት አልተቻለም');
    } finally {
      setLoading(false);
    }
  };

  const renderStudentReport = () => {
    if (!data) return null;
    const { student, courseSummaries, attendanceHistory } = data;
    return (
      <div className="space-y-6">
        <Card className="p-5 bg-surface-page border-subtle">
          <h3 className="text-lg font-bold text-main">{student.fullName}</h3>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant="primary">Grade: {student.grade || 'N/A'}</Badge>
            <span className="text-xs text-muted">{student.email || 'No email provided'}</span>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h4 className="font-bold text-sm text-main flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-primary" /> የኮርሶች ማጠቃለያ (Course Summary)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Attended</th>
                  <th className="py-2.5 px-3">Total Sessions</th>
                  <th className="py-2.5 px-3">Attendance Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {(courseSummaries || []).map((cs) => {
                  const rate = cs.totalSessions > 0 ? Math.round((cs.attended / cs.totalSessions) * 100) : 0;
                  return (
                    <tr key={cs.courseId} className="hover:bg-surface-page/50">
                      <td className="py-2.5 px-3 font-semibold text-main">{cs.courseName}</td>
                      <td className="py-2.5 px-3">{cs.attended}</td>
                      <td className="py-2.5 px-3">{cs.totalSessions}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'danger'}>
                          {rate}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h4 className="font-bold text-sm text-main flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-primary" /> የተሳትፎ ታሪክ (Attendance History)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {(attendanceHistory || []).map((h) => (
                  <tr key={h._id} className="hover:bg-surface-page/50">
                    <td className="py-2.5 px-3 font-medium text-main">{formatEthiopianDate(h.date)}</td>
                    <td className="py-2.5 px-3">{h.courseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderGradeReport = () => {
    if (!data) return null;
    const { grade, students: gradeStudents } = data;
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-main flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-brand-primary" /> {grade} Attendance Overview
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {(gradeStudents || []).map((s) => (
            <Card key={s.studentId} className="p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-bold text-main text-base">{s.studentName}</span>
                <Badge variant="primary">
                  Overall: {s.overallAttended || 0} / {s.overallSessions || 0}
                </Badge>
              </div>

              {(s.courses && s.courses.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-muted">
                    <thead className="bg-surface-page text-[11px] font-bold text-main uppercase border-b border-subtle">
                      <tr>
                        <th className="py-2 px-3">Course</th>
                        <th className="py-2 px-3">Attended</th>
                        <th className="py-2 px-3">Total Sessions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle">
                      {s.courses.map((c) => (
                        <tr key={c.courseName}>
                          <td className="py-2 px-3 font-medium text-main">{c.courseName}</td>
                          <td className="py-2 px-3">{c.attended}</td>
                          <td className="py-2 px-3">{c.totalSessions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-muted">No courses enrolled.</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCourseReport = () => {
    if (!data) return null;
    const { course, totalSessions, students: courseStudents } = data;
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-subtle">
          <div>
            <h3 className="text-lg font-bold text-main">{course.name}</h3>
            <p className="text-xs text-muted mt-0.5">Teacher: {course.teacherName || 'N/A'}</p>
          </div>
          <Badge variant="gold">Total class days: {totalSessions || 0}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Attended</th>
                <th className="py-2.5 px-3">Total Sessions</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {(courseStudents || []).map((s) => {
                const rate = totalSessions > 0 ? Math.round((s.attended / totalSessions) * 100) : 0;
                return (
                  <tr key={s.studentId} className="hover:bg-surface-page/50">
                    <td className="py-2.5 px-3 font-semibold text-main">{s.studentName}</td>
                    <td className="py-2.5 px-3">{s.attended}</td>
                    <td className="py-2.5 px-3">{s.totalSessions}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'danger'}>
                        {rate}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const renderTeacherReport = () => {
    if (!data) return null;
    const { teacher, courses: teacherCourses } = data;
    return (
      <div className="space-y-6">
        <Card className="p-5 bg-surface-page border-subtle">
          <h3 className="text-lg font-bold text-main">{teacher.fullName}'s Assigned Courses</h3>
          <p className="text-xs text-muted mt-0.5">{teacher.email || ''}</p>
        </Card>

        {(teacherCourses || []).map((c) => (
          <Card key={c.courseId} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-main">{c.courseName}</h4>
              <Badge variant="info">Total days: {c.totalSessions || 0}</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-muted">
                <thead className="bg-surface-page text-[11px] font-bold text-main uppercase border-b border-subtle">
                  <tr>
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3">Attended</th>
                    <th className="py-2 px-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {(c.students || []).map((s) => (
                    <tr key={s.studentId} className="hover:bg-surface-page/50">
                      <td className="py-2 px-3 font-semibold text-main">{s.studentName}</td>
                      <td className="py-2 px-3">{s.attended}</td>
                      <td className="py-2 px-3">{s.totalSessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderDateReport = () => {
    if (!data) return null;
    const { date, records } = data;
    return (
      <Card className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-main flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-primary" /> Attendance for {formatEthiopianDate(date)}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted">
            <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
              <tr>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Course</th>
                <th className="py-2.5 px-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {(records || []).map((r) => (
                <tr key={r._id} className="hover:bg-surface-page/50">
                  <td className="py-2.5 px-3 font-semibold text-main">{r.studentName}</td>
                  <td className="py-2.5 px-3">{r.grade}</td>
                  <td className="py-2.5 px-3">{r.courseName}</td>
                  <td className="py-2.5 px-3 font-mono text-xs">{new Date(r.time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance & System Reports (የመገኘትና የስርዓት ሪፖርቶች)"
        subtitle="Generate detailed analytic reports by student, grade, course, teacher, or specific date."
        icon={FileText}
        actions={
          data && (
            <Button
              variant="success"
              onClick={() => downloadCSV(generateCSV(data, reportType), `${reportType}-report.csv`)}
            >
              <Download className="w-4 h-4 mr-1.5" /> ⬇ Download CSV
            </Button>
          )
        }
      />

      {/* Filters Card */}
      <Card className="p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData(null);
              }}
            >
              <option value="">-- Select Report Type --</option>
              <option value="student">By Student (የተማሪ)</option>
              <option value="grade">By Grade (የክፍል)</option>
              <option value="course">By Course (የኮርስ)</option>
              <option value="teacher">By Teacher (የመምህር)</option>
              <option value="date">By Date (የቀን)</option>
            </Select>
          </div>

          {reportType === 'student' && (
            <div className="flex-1 min-w-[200px]">
              <Select
                label="Select Student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'grade' && (
            <div className="flex-1 min-w-[200px]">
              <Select
                label="Select Grade"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">Select Grade</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'course' && (
            <div className="flex-1 min-w-[200px]">
              <Select
                label="Select Course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'teacher' && (
            <div className="flex-1 min-w-[200px]">
              <Select
                label="Select Teacher"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.fullName}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'date' && (
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Select Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          <Button variant="primary" onClick={fetchReport} disabled={loading}>
            <Search className="w-4 h-4 mr-1.5" /> {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </Card>

      {/* Render Report Content */}
      {loading && (
        <Card className="py-12 text-center text-muted">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading report...</p>
        </Card>
      )}

      {!loading && data && (
        <div>
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