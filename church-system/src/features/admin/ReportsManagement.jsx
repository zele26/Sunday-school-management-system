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
  XCircle,
  TrendingUp,
  Award,
  Users,
  Printer,
  Phone,
  Mail,
  Building,
  Layers,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast';
import { formatEthiopianDate } from '../../utils/ethiopianDate';

// ─── CSV helpers & Exporter with UTF-8 BOM ───────────────────────────
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

const downloadCSV = (csvString, filename) => {
  // Prepend UTF-8 BOM (\uFEFF) so Excel natively detects UTF-8 encoding and renders Amharic cleanly
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const generateCSV = (data, reportType) => {
  const churchHeader = [
    '"ደብረ ገሊላ ቅዱስ ጊዮርጊስ እና ቅዱስ ተክለሃይማኖት አንድነት ቤተክርስቲያን"',
    '"የሰንበት ትምህርት ቤት አስተዳደር ስርዓት (Sunday School Management System)"',
    `"የተዘጋጀበት ቀን:",${escapeCSV(formatEthiopianDate(new Date()) + ' (' + new Date().toLocaleDateString() + ')')}`,
    `"የተዘጋጀው በ:",${escapeCSV('የሰንበት ት/ቤት አስተዳደር (Admin)')}`,
    '""'
  ];

  switch (reportType) {
    case 'student': {
      const { student, summary = {}, courseSummaries = [], attendanceHistory = [] } = data;
      const studentTypeLabel = student.studentType === 'distance' ? 'የርቀት (Distance)' : student.studentType === 'adult' ? 'የአዋቂ (Adult)' : 'መደበኛ (Regular)';
      const shiftLabel = student.shift === 'night' ? 'የማታ (Night)' : student.shift === 'morning' ? 'የጠዋት (Morning)' : 'የሳምንት መጨረሻ (Weekend)';

      const rows = [
        ...churchHeader,
        '"=== የተማሪው መረጃ (STUDENT PROFILE) ==="',
        `"ሙሉ ስም:",${escapeCSV(student.fullName)},"የተማሪ መለያ ቁጥር (ID):",${escapeCSV(student.studentId || '—')}`,
        `"የክፍል ደረጃ:",${escapeCSV(student.grade || '—')},"የትምህርት ዓይነት:",${escapeCSV(studentTypeLabel)}`,
        `"ፈረቃ (Shift):",${escapeCSV(shiftLabel)},"ስልክ ቁጥር:",${escapeCSV(student.phone || '—')}`,
        `"ኢሜይል:",${escapeCSV(student.email || '—')}`,
        '""',
        '"=== አጠቃላይ የመገኘት ማጠቃለያ (ATTENDANCE KPI SUMMARY) ==="',
        `"የተመዘገበባቸው ኮርሶች ብዛት:",${summary.totalCourses ?? courseSummaries.length}`,
        `"አጠቃላይ የተካሄዱ ክፍለ-ጊዜዎች:",${summary.totalSessions ?? 0}`,
        `"የተገኘባቸው ክፍለ-ጊዜዎች:",${summary.totalAttended ?? 0}`,
        `"ያመለጠው / የቀረበት:",${summary.totalMissed ?? 0}`,
        `"አጠቃላይ የመገኘት ምጣኔ:",${escapeCSV((summary.overallRate ?? 0) + '%')}`,
        `"የመገኘት ደረጃ:",${escapeCSV((summary.overallRate ?? 0) >= 80 ? 'በጣም ጥሩ (Excellent)' : (summary.overallRate ?? 0) >= 60 ? 'ጥሩ (Good)' : 'ማሻሻያ የሚያስፈልገው (Needs Improvement)')}`,
        '""',
        '"=== የኮርሶች ዝርዝር ማጠቃለያ (COURSES BREAKDOWN) ==="',
        '"ተ.ቁ","የኮርስ ኮድ","የኮርስ ስም","መምህር","ክፍል","የተካሄደ ክፍለ ጊዜ","የተገኘበት","የቀረበት","የመገኘት ምጣኔ %","ሁኔታ"'
      ];

      courseSummaries.forEach((c, idx) => {
        const rate = c.rate ?? (c.totalSessions > 0 ? Math.round((c.attended / c.totalSessions) * 100) : 0);
        const statusText = rate >= 80 ? 'በጣም ጥሩ' : rate >= 60 ? 'ጥሩ' : 'ዝቅተኛ';
        rows.push([
          idx + 1,
          escapeCSV(c.courseCode || '—'),
          escapeCSV(c.courseName || '—'),
          escapeCSV(c.teacherName || '—'),
          escapeCSV(c.grade || '—'),
          c.totalSessions || 0,
          c.attended || 0,
          c.missed || 0,
          escapeCSV(`${rate}%`),
          escapeCSV(statusText)
        ].join(','));
      });

      rows.push('""');
      rows.push('"=== የተሳትፎና የመገኘት ታሪክ (ATTENDANCE LOG HISTORY) ==="');
      rows.push('"ተ.ቁ","ቀን (በኢትዮጵያ)","ቀን (በፈረንጆች)","የመግቢያ ሰዓት","የኮርስ ኮድ","የኮርስ ስም","መምህር","ፈረቃ","ሁኔታ"');

      attendanceHistory.forEach((h, idx) => {
        const timeStr = h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        const dateStr = h.date ? new Date(h.date).toISOString().split('T')[0] : '—';
        rows.push([
          idx + 1,
          escapeCSV(formatEthiopianDate(h.date)),
          escapeCSV(dateStr),
          escapeCSV(timeStr),
          escapeCSV(h.courseCode || '—'),
          escapeCSV(h.courseName || '—'),
          escapeCSV(h.teacherName || '—'),
          escapeCSV(h.shift || '—'),
          escapeCSV(h.status || 'Present')
        ].join(','));
      });

      return rows.join('\n');
    }

    case 'grade': {
      const { grade, summary = {}, students = [] } = data;
      const rows = [
        ...churchHeader,
        `"=== የክፍል ደረጃ የመገኘትና የክትትል ሪፖርት: ${grade} ==="`,
        `"የክፍል ደረጃ:",${escapeCSV(grade)}`,
        `"አጠቃላይ የተማሪዎች ብዛት:",${summary.totalStudents ?? students.length}`,
        `"አጠቃላይ የተካሄዱ ክፍለ-ጊዜዎች:",${summary.totalSessions ?? 0}`,
        `"አጠቃላይ የተመዘገቡ መገኘቶች:",${summary.totalAttended ?? 0}`,
        `"አማካይ የክፍሉ የመገኘት ምጣኔ:",${escapeCSV((summary.averageRate ?? 0) + '%')}`,
        '""',
        '"=== የተማሪዎች ዝርዝር የመገኘት መረጃ (STUDENTS ATTENDANCE) ==="',
        '"ተ.ቁ","የተማሪ መለያ ቁጥር","ሙሉ ስም","የትምህርት ዓይነት","ፈረቃ","ስልክ","ኢሜይል","የተገኘበት","አጠቃላይ ክፍለ ጊዜ","የቀረበት","የመገኘት ምጣኔ %"'
      ];

      students.forEach((s, idx) => {
        const rate = s.overallRate ?? (s.overallSessions > 0 ? Math.round((s.overallAttended / s.overallSessions) * 100) : 0);
        rows.push([
          idx + 1,
          escapeCSV(s.studentCustomId || '—'),
          escapeCSV(s.studentName || '—'),
          escapeCSV(s.studentType === 'distance' ? 'የርቀት' : s.studentType === 'adult' ? 'የአዋቂ' : 'መደበኛ'),
          escapeCSV(s.shift === 'night' ? 'የማታ' : 'የቀን / ሳምንት መጨረሻ'),
          escapeCSV(s.phone || '—'),
          escapeCSV(s.email || '—'),
          s.overallAttended || 0,
          s.overallSessions || 0,
          s.overallMissed ?? Math.max(0, (s.overallSessions || 0) - (s.overallAttended || 0)),
          escapeCSV(`${rate}%`)
        ].join(','));
      });

      return rows.join('\n');
    }

    case 'course': {
      const { course = {}, summary = {}, students = [] } = data;
      const rows = [
        ...churchHeader,
        `"=== የኮርስ መገኘትና የተማሪዎች ክትትል ሪፖርት: ${course.name || '—'} ==="`,
        `"የኮርስ ስም:",${escapeCSV(course.name || '—')},"የኮርስ ኮድ:",${escapeCSV(course.code || '—')}`,
        `"የተመደበው መምህር:",${escapeCSV(course.teacherName || 'ያልተመደበ')},"የመምህር ስልክ/ኢሜይል:",${escapeCSV((course.teacherPhone || '—') + ' / ' + (course.teacherEmail || '—'))}`,
        `"የክፍል ደረጃ / ፈረቃ:",${escapeCSV((course.grade || '—') + ' / ' + (course.shift || '—'))}`,
        `"የተመዘገቡ ተማሪዎች ብዛት:",${summary.totalEnrolled ?? students.length}`,
        `"አጠቃላይ የተካሄዱ የክፍል ቀናት:",${summary.totalSessions ?? 0}`,
        `"አማካይ የኮርስ የመገኘት ምጣኔ:",${escapeCSV((summary.averageRate ?? 0) + '%')}`,
        '""',
        '"=== በኮርሱ የተመዘገቡ ተማሪዎች ዝርዝር መገኘት (ENROLLED STUDENTS) ==="',
        '"ተ.ቁ","የተማሪ መለያ ቁጥር","ሙሉ ስም","ክፍል","ስልክ ቁጥር","የተገኘበት","የቀረበት","አጠቃላይ ክፍለ ጊዜ","የመገኘት ምጣኔ %","ውጤት / ደረጃ"'
      ];

      students.forEach((s, idx) => {
        const rate = s.rate ?? (s.totalSessions > 0 ? Math.round((s.attended / s.totalSessions) * 100) : 0);
        const statusText = rate >= 80 ? 'በጣም ጥሩ' : rate >= 60 ? 'ጥሩ' : 'ዝቅተኛ';
        rows.push([
          idx + 1,
          escapeCSV(s.studentCustomId || '—'),
          escapeCSV(s.studentName || '—'),
          escapeCSV(s.grade || course.grade || '—'),
          escapeCSV(s.phone || '—'),
          s.attended || 0,
          s.missed || 0,
          s.totalSessions || 0,
          escapeCSV(`${rate}%`),
          escapeCSV(statusText)
        ].join(','));
      });

      return rows.join('\n');
    }

    case 'teacher': {
      const { teacher = {}, summary = {}, courses = [] } = data;
      const rows = [
        ...churchHeader,
        `"=== የመምህር የኮርሶችና የተማሪዎች ክትትል ሪፖርት: ${teacher.fullName || '—'} ==="`,
        `"የመምህር ስም:",${escapeCSV(teacher.fullName || '—')}`,
        `"ኢሜይል:",${escapeCSV(teacher.email || '—')},"ስልክ ቁጥር:",${escapeCSV(teacher.phone || '—')}`,
        `"የተመደቡ ኮርሶች ብዛት:",${summary.totalCourses ?? courses.length}`,
        `"አጠቃላይ የሚያስተምሯቸው ተማሪዎች:",${summary.totalStudents ?? 0}`,
        '""'
      ];

      courses.forEach((c, cIdx) => {
        rows.push(`"=== ኮርስ ${cIdx + 1}: ${c.courseName} (${c.courseCode || '—'}) | ክፍል: ${c.grade || '—'} | የተካሄዱ ቀናት: ${c.totalSessions || 0} ==="`);
        rows.push('"ተ.ቁ","የተማሪ መለያ ቁጥር","ሙሉ ስም","ክፍል","የተገኘበት","የቀረበት","አጠቃላይ ክፍለ ጊዜ","የመገኘት ምጣኔ %"');
        (c.students || []).forEach((s, sIdx) => {
          const rate = s.rate ?? (s.totalSessions > 0 ? Math.round((s.attended / s.totalSessions) * 100) : 0);
          rows.push([
            sIdx + 1,
            escapeCSV(s.studentCustomId || '—'),
            escapeCSV(s.studentName || '—'),
            escapeCSV(s.grade || c.grade || '—'),
            s.attended || 0,
            s.missed || 0,
            s.totalSessions || 0,
            escapeCSV(`${rate}%`)
          ].join(','));
        });
        rows.push('""');
      });

      return rows.join('\n');
    }

    case 'date': {
      const { date, summary = {}, records = [] } = data;
      const rows = [
        ...churchHeader,
        `"=== የዕለታዊ መገኘት ዝርዝር መዝገብ ሪፖርት ==="`,
        `"ቀን (በኢትዮጵያ):",${escapeCSV(formatEthiopianDate(date))}`,
        `"ቀን (በፈረንጆች):",${escapeCSV(date)}`,
        `"የተገኙ ተማሪዎች አጠቃላይ ብዛት:",${summary.totalPresent ?? records.length}`,
        '""',
        '"=== የዕለቱ የተማሪዎች የመገኘት መዝገብ (DAILY ATTENDANCE LOG) ==="',
        '"ተ.ቁ","የመግቢያ ሰዓት","የተማሪ መለያ ቁጥር","የተማሪው ስም","ክፍል","የትምህርት ዓይነት","ፈረቃ","የኮርስ ስም","የኮርስ ኮድ","መምህር","ሁኔታ"'
      ];

      records.forEach((r, idx) => {
        const timeStr = r.time ? new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
        rows.push([
          idx + 1,
          escapeCSV(timeStr),
          escapeCSV(r.studentId || '—'),
          escapeCSV(r.studentName || '—'),
          escapeCSV(r.grade || '—'),
          escapeCSV(r.studentType === 'distance' ? 'የርቀት' : r.studentType === 'adult' ? 'የአዋቂ' : 'መደበኛ'),
          escapeCSV(r.shift === 'night' ? 'የማታ' : 'የቀን / ሳምንት መጨረሻ'),
          escapeCSV(r.courseName || '—'),
          escapeCSV(r.courseCode || '—'),
          escapeCSV(r.teacherName || '—'),
          escapeCSV(r.status || 'Present')
        ].join(','));
      });

      return rows.join('\n');
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
      toast.info('እባክዎ የሪፖርት ዓይነት ይምረጡ');
      return;
    }
    setLoading(true);
    setData(null);

    let url = '';
    try {
      switch (reportType) {
        case 'student':
          if (!selectedStudent) {
            toast.error('እባክዎ ተማሪ ይምረጡ');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/student/${selectedStudent}`;
          break;
        case 'grade':
          if (!selectedGrade) {
            toast.error('እባክዎ የክፍል ደረጃ ይምረጡ');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/grade/${encodeURIComponent(selectedGrade)}`;
          break;
        case 'course':
          if (!selectedCourse) {
            toast.error('እባክዎ ኮርስ ይምረጡ');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/course/${selectedCourse}`;
          break;
        case 'teacher':
          if (!selectedTeacher) {
            toast.error('እባክዎ መምህር ይምረጡ');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/teacher/${selectedTeacher}`;
          break;
        case 'date':
          if (!selectedDate) {
            toast.error('እባክዎ ቀን ይምረጡ');
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
        throw new Error(errData.message || 'ሪፖርቱን መጫን አልተቻለም');
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

  const handlePrint = () => {
    window.print();
  };

  // ─── Header Banner for UI & Print ──────────────────────────────────
  const ReportHeaderBanner = ({ title, subtitle }) => (
    <div className="bg-gradient-to-r from-[#1657b8]/10 via-amber-500/5 to-transparent p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1657b8] animate-pulse"></span>
          <p className="text-xs font-bold tracking-wider text-[#1657b8] dark:text-blue-400 uppercase">
            ደብረ ገሊላ ቅዱስ ጊዮርጊስ እና ቅዱስ ተክለሃይማኖት አንድነት ቤተክርስቲያን
          </p>
        </div>
        <h2 className="text-xl font-black text-main tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted font-medium">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="bg-white/80 dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-subtle text-xs space-y-0.5">
          <div className="text-muted font-medium">የተዘጋጀበት ቀን</div>
          <div className="font-bold text-main">{formatEthiopianDate(new Date())}</div>
        </div>
      </div>
    </div>
  );

  // ─── Student Report View ──────────────────────────────────────────
  const renderStudentReport = () => {
    if (!data) return null;
    const { student, summary = {}, courseSummaries = [], attendanceHistory = [] } = data;
    const studentTypeLabel = student.studentType === 'distance' ? 'የርቀት' : student.studentType === 'adult' ? 'የአዋቂ' : 'መደበኛ';
    const shiftLabel = student.shift === 'night' ? 'የማታ' : student.shift === 'morning' ? 'የጠዋት' : 'የሳምንት መጨረሻ';
    const rate = summary.overallRate ?? 0;

    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የተማሪ ${student.fullName} የተሟላ የመገኘትና የትምህርት ሪፖርት`}
          subtitle={`የተማሪ መለያ ቁጥር: ${student.studentId || '—'} | ክፍል: ${student.grade || '—'}`}
        />

        {/* Student Profile & Quick Info */}
        <Card className="p-6 bg-surface-card border-subtle overflow-hidden relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase">ሙሉ ስም</span>
              <div className="text-base font-bold text-main flex items-center gap-2">
                <User className="w-4 h-4 text-brand-primary" /> {student.fullName}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase">መለያ ቁጥር / ክፍል</span>
              <div className="text-sm font-bold text-main flex items-center gap-2">
                <Badge variant="primary">{student.studentId || '—'}</Badge>
                <Badge variant="neutral">{student.grade || '—'}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase">ዓይነት / ፈረቃ</span>
              <div className="text-sm font-medium text-main flex items-center gap-1.5">
                <Badge variant="info">{studentTypeLabel}</Badge>
                <Badge variant="warning">{shiftLabel}</Badge>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-muted uppercase">አድራሻ</span>
              <div className="text-xs text-muted space-y-0.5">
                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-muted" /> {student.phone || '—'}</div>
                <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-muted" /> {student.email || '—'}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Attendance Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" /> የተመዘገቡ ኮርሶች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalCourses ?? courseSummaries.length}
            </div>
            <span className="text-[10px] text-muted mt-1">አጠቃላይ ኮርሶች</span>
          </Card>

          <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> ክፍለ ጊዜዎች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalSessions ?? 0}
            </div>
            <span className="text-[10px] text-muted mt-1">የተካሄዱ ቀናት</span>
          </Card>

          <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> የተገኘበት
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {summary.totalAttended ?? 0}
            </div>
            <span className="text-[10px] text-muted mt-1">የተሳተፈባቸው ቀናት</span>
          </Card>

          <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> የቀረበት
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
              {summary.totalMissed ?? 0}
            </div>
            <span className="text-[10px] text-muted mt-1">ያመለጠው ክፍለ ጊዜ</span>
          </Card>

          <Card className="p-4 bg-surface-card border-subtle flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> የመገኘት ምጣኔ
            </span>
            <div className="text-2xl font-black text-main mt-2 flex items-center gap-2">
              {rate}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${rate >= 75 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
              ></div>
            </div>
          </Card>
        </div>

        {/* Courses Summary Table */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-primary" /> የኮርሶች ዝርዝር የመገኘት ማጠቃለያ
            </h4>
            <Badge variant="neutral">{courseSummaries.length} ኮርሶች</Badge>
          </div>
          
          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-4">የኮርስ ኮድ</th>
                  <th className="py-3 px-4">የኮርስ ስም</th>
                  <th className="py-3 px-4">መምህር</th>
                  <th className="py-3 px-4 text-center">ክፍለ ጊዜ</th>
                  <th className="py-3 px-4 text-center">የተገኘበት</th>
                  <th className="py-3 px-4 text-center">የቀረበት</th>
                  <th className="py-3 px-4 text-center">የመገኘት ምጣኔ</th>
                  <th className="py-3 px-4 text-center">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {courseSummaries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-xs text-muted">የተመዘገበበት ኮርስ የለም።</td>
                  </tr>
                ) : (
                  courseSummaries.map((cs) => {
                    const cRate = cs.rate ?? (cs.totalSessions > 0 ? Math.round((cs.attended / cs.totalSessions) * 100) : 0);
                    return (
                      <tr key={cs.courseId} className="hover:bg-surface-page/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-brand-primary">{cs.courseCode || '—'}</td>
                        <td className="py-3 px-4 font-semibold text-main">{cs.courseName}</td>
                        <td className="py-3 px-4 text-xs font-medium text-main">{cs.teacherName}</td>
                        <td className="py-3 px-4 text-center font-semibold text-main">{cs.totalSessions}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{cs.attended}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400">{cs.missed}</td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={cRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : cRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                            {cRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={cRate >= 75 ? 'success' : cRate >= 50 ? 'warning' : 'danger'}>
                            {cRate >= 75 ? 'በጣም ጥሩ' : cRate >= 50 ? 'መካከለኛ' : 'ዝቅተኛ'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Attendance History Table */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" /> የተሳትፎና የመገኘት ታሪክ መዝገብ
            </h4>
            <Badge variant="neutral">{attendanceHistory.length} ምዝገባዎች</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-4">ተ.ቁ</th>
                  <th className="py-3 px-4">ቀን (በኢትዮጵያ)</th>
                  <th className="py-3 px-4">የመግቢያ ሰዓት</th>
                  <th className="py-3 px-4">ኮርስ</th>
                  <th className="py-3 px-4">መምህር</th>
                  <th className="py-3 px-4">ፈረቃ</th>
                  <th className="py-3 px-4 text-center">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-xs text-muted">የመገኘት ታሪክ አልተገኘም።</td>
                  </tr>
                ) : (
                  attendanceHistory.map((h, idx) => (
                    <tr key={h._id || idx} className="hover:bg-surface-page/50 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-main">{formatEthiopianDate(h.date)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-muted">
                        {h.checkInTime ? new Date(h.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-medium text-main">
                        {h.courseName} {h.courseCode && <span className="text-xs text-muted">({h.courseCode})</span>}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted">{h.teacherName || '—'}</td>
                      <td className="py-3 px-4 text-xs text-muted">{h.shift || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {h.status || 'Present'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ─── Grade Report View ───────────────────────────────────────────
  const renderGradeReport = () => {
    if (!data) return null;
    const { grade, summary = {}, students: gradeStudents = [] } = data;
    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የ${grade} የመገኘትና የክትትል ሪፖርት`}
          subtitle={`አጠቃላይ ተማሪዎች: ${summary.totalStudents ?? gradeStudents.length} | አማካይ የመገኘት ምጣኔ: ${summary.averageRate ?? 0}%`}
        />

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" /> አጠቃላይ ተማሪዎች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalStudents ?? gradeStudents.length}
            </div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> የተካሄዱ ክፍለ-ጊዜዎች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalSessions ?? 0}
            </div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> አጠቃላይ መገኘት
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {summary.totalAttended ?? 0}
            </div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> አማካይ የመገኘት ምጣኔ
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.averageRate ?? 0}%
            </div>
          </Card>
        </div>

        {/* Grade Students Table */}
        <Card className="p-5 space-y-4">
          <h4 className="font-bold text-sm text-main flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-primary" /> የተማሪዎች ዝርዝር የመገኘት ሁኔታ
          </h4>

          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-4">ተ.ቁ</th>
                  <th className="py-3 px-4">መለያ ቁጥር</th>
                  <th className="py-3 px-4">የተማሪ ስም</th>
                  <th className="py-3 px-4">ዓይነት / ፈረቃ</th>
                  <th className="py-3 px-4 text-center">የተገኘበት</th>
                  <th className="py-3 px-4 text-center">ክፍለ ጊዜ</th>
                  <th className="py-3 px-4 text-center">የመገኘት ምጣኔ</th>
                  <th className="py-3 px-4 text-center">ደረጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {gradeStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-xs text-muted">በዚህ ክፍል የተመዘገቡ ተማሪዎች የሉም።</td>
                  </tr>
                ) : (
                  gradeStudents.map((s, idx) => {
                    const sRate = s.overallRate ?? (s.overallSessions > 0 ? Math.round((s.overallAttended / s.overallSessions) * 100) : 0);
                    return (
                      <tr key={s.studentId || idx} className="hover:bg-surface-page/50 transition-colors">
                        <td className="py-3 px-4 text-xs text-muted">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-brand-primary">{s.studentCustomId || '—'}</td>
                        <td className="py-3 px-4 font-semibold text-main">{s.studentName}</td>
                        <td className="py-3 px-4 text-xs">
                          <span className="font-medium text-main">{s.studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}</span>
                          <span className="text-muted ml-1">({s.shift === 'night' ? 'ማታ' : 'ቀን'})</span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{s.overallAttended || 0}</td>
                        <td className="py-3 px-4 text-center font-medium text-main">{s.overallSessions || 0}</td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={sRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : sRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                            {sRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={sRate >= 75 ? 'success' : sRate >= 50 ? 'warning' : 'danger'}>
                            {sRate >= 75 ? 'በጣም ጥሩ' : sRate >= 50 ? 'መካከለኛ' : 'ዝቅተኛ'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ─── Course Report View ──────────────────────────────────────────
  const renderCourseReport = () => {
    if (!data) return null;
    const { course = {}, summary = {}, students: courseStudents = [] } = data;
    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የኮርስ መገኘት ሪፖርት: ${course.name || '—'}`}
          subtitle={`ኮድ: ${course.code || '—'} | መምህር: ${course.teacherName || 'ያልተመደበ'} | ክፍል: ${course.grade || '—'}`}
        />

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" /> የተመዘገቡ ተማሪዎች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalEnrolled ?? courseStudents.length}
            </div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" /> አጠቃላይ ክፍለ-ጊዜዎች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalSessions ?? 0}
            </div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle col-span-2 sm:col-span-1">
            <span className="text-xs text-amber-500 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> አማካይ የኮርስ የመገኘት ምጣኔ
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.averageRate ?? 0}%
            </div>
          </Card>
        </div>

        {/* Students in Course Table */}
        <Card className="p-5 space-y-4">
          <h4 className="font-bold text-sm text-main flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-primary" /> በኮርሱ የተመዘገቡ ተማሪዎች መገኘት
          </h4>

          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-4">ተ.ቁ</th>
                  <th className="py-3 px-4">መለያ ቁጥር</th>
                  <th className="py-3 px-4">የተማሪ ስም</th>
                  <th className="py-3 px-4">ስልክ</th>
                  <th className="py-3 px-4 text-center">የተገኘበት</th>
                  <th className="py-3 px-4 text-center">የቀረበት</th>
                  <th className="py-3 px-4 text-center">ክፍለ ጊዜ</th>
                  <th className="py-3 px-4 text-center">የመገኘት ምጣኔ</th>
                  <th className="py-3 px-4 text-center">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {courseStudents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-xs text-muted">በዚህ ኮርስ የተመዘገበ ተማሪ የለም።</td>
                  </tr>
                ) : (
                  courseStudents.map((s, idx) => {
                    const sRate = s.rate ?? (s.totalSessions > 0 ? Math.round((s.attended / s.totalSessions) * 100) : 0);
                    return (
                      <tr key={s.studentId || idx} className="hover:bg-surface-page/50 transition-colors">
                        <td className="py-3 px-4 text-xs text-muted">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-brand-primary">{s.studentCustomId || '—'}</td>
                        <td className="py-3 px-4 font-semibold text-main">{s.studentName}</td>
                        <td className="py-3 px-4 text-xs text-muted">{s.phone || '—'}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{s.attended}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400">{s.missed}</td>
                        <td className="py-3 px-4 text-center font-medium text-main">{s.totalSessions}</td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={sRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : sRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                            {sRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={sRate >= 75 ? 'success' : sRate >= 50 ? 'warning' : 'danger'}>
                            {sRate >= 75 ? 'በጣም ጥሩ' : sRate >= 50 ? 'መካከለኛ' : 'ዝቅተኛ'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  // ─── Teacher Report View ─────────────────────────────────────────
  const renderTeacherReport = () => {
    if (!data) return null;
    const { teacher = {}, summary = {}, courses: teacherCourses = [] } = data;
    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የመምህር ${teacher.fullName || '—'} የኮርሶችና የተማሪዎች ሪፖርት`}
          subtitle={`ኢሜይል: ${teacher.email || '—'} | ስልክ: ${teacher.phone || '—'}`}
        />

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" /> የተመደቡ ኮርሶች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalCourses ?? teacherCourses.length}
            </div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-muted font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-500" /> አጠቃላይ ተማሪዎች
            </span>
            <div className="text-2xl font-black text-main mt-2">
              {summary.totalStudents ?? 0}
            </div>
          </Card>
        </div>

        {/* Courses Cards */}
        {(teacherCourses || []).map((c, idx) => (
          <Card key={c.courseId || idx} className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-subtle">
              <div>
                <h4 className="font-bold text-base text-main">{c.courseName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary">{c.courseCode || '—'}</Badge>
                  <Badge variant="neutral">ክፍል: {c.grade || '—'}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">የተካሄዱ ቀናት: {c.totalSessions || 0}</Badge>
                <Badge variant="neutral">ተማሪዎች: {c.enrolledCount || (c.students || []).length}</Badge>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-subtle">
              <table className="w-full text-left text-xs text-muted">
                <thead className="bg-surface-page text-[11px] font-bold text-main uppercase border-b border-subtle">
                  <tr>
                    <th className="py-2.5 px-3">ተ.ቁ</th>
                    <th className="py-2.5 px-3">መለያ ቁጥር</th>
                    <th className="py-2.5 px-3">የተማሪ ስም</th>
                    <th className="py-2.5 px-3 text-center">የተገኘበት</th>
                    <th className="py-2.5 px-3 text-center">የቀረበት</th>
                    <th className="py-2.5 px-3 text-center">ክፍለ ጊዜ</th>
                    <th className="py-2.5 px-3 text-center">የመገኘት ምጣኔ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {(c.students || []).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-xs text-muted">ተማሪዎች አልተመዘገቡም።</td>
                    </tr>
                  ) : (
                    (c.students || []).map((s, sIdx) => {
                      const rate = s.rate ?? (s.totalSessions > 0 ? Math.round((s.attended / s.totalSessions) * 100) : 0);
                      return (
                        <tr key={s.studentId || sIdx} className="hover:bg-surface-page/50">
                          <td className="py-2.5 px-3">{sIdx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-brand-primary">{s.studentCustomId || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold text-main">{s.studentName}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{s.attended}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400">{s.missed}</td>
                          <td className="py-2.5 px-3 text-center font-medium text-main">{s.totalSessions}</td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            <Badge variant={rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'danger'}>
                              {rate}%
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // ─── Date Report View ────────────────────────────────────────────
  const renderDateReport = () => {
    if (!data) return null;
    const { date, summary = {}, records = [] } = data;
    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የዕለታዊ መገኘት ሪፖርት: ${formatEthiopianDate(date)}`}
          subtitle={`ቀን (በፈረንጆች): ${date} | አጠቃላይ የተገኙ ተማሪዎች: ${summary.totalPresent ?? records.length}`}
        />

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" /> የዕለቱ የተማሪዎች የመገኘት መዝገብ
            </h4>
            <Badge variant="success">አጠቃላይ የተገኙ: {records.length}</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-4">ተ.ቁ</th>
                  <th className="py-3 px-4">የመግቢያ ሰዓት</th>
                  <th className="py-3 px-4">መለያ ቁጥር</th>
                  <th className="py-3 px-4">የተማሪ ስም</th>
                  <th className="py-3 px-4">ክፍል</th>
                  <th className="py-3 px-4">ዓይነት / ፈረቃ</th>
                  <th className="py-3 px-4">ኮርስ</th>
                  <th className="py-3 px-4">መምህር</th>
                  <th className="py-3 px-4 text-center">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {records.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-xs text-muted">በዚህ ቀን የተመዘገበ መገኘት የለም።</td>
                  </tr>
                ) : (
                  records.map((r, idx) => (
                    <tr key={r._id || idx} className="hover:bg-surface-page/50 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-main">
                        {r.time ? new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-brand-primary">{r.studentId || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-main">{r.studentName}</td>
                      <td className="py-3 px-4 font-medium text-main">{r.grade || '—'}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-main">{r.studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}</span>
                        <span className="text-muted ml-1">({r.shift === 'night' ? 'ማታ' : 'ቀን'})</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-main">
                        {r.courseName} {r.courseCode && <span className="text-xs text-muted">({r.courseCode})</span>}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted">{r.teacherName || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {r.status || 'Present'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="የመገኘትና የስርዓት ሪፖርቶች"
        subtitle="በተማሪ፣ በክፍል፣ በኮርስ፣ በመምህር ወይም በቀን ዝርዝር የትንታኔ ሪፖርቶችን ያመንጩ እና በሲኤስቪ (Excel) ወይም በህትመት ያውርዱ።"
        icon={FileText}
        actions={
          data && (
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="shadow-sm"
              >
                <Printer className="w-4 h-4 mr-1.5" /> 🖨️ አትም (Print / PDF)
              </Button>
              <Button
                variant="success"
                onClick={() => downloadCSV(generateCSV(data, reportType), `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`)}
                className="shadow-sm font-semibold"
              >
                <Download className="w-4 h-4 mr-1.5" /> ⬇ በኤክሴል / CSV አውርድ
              </Button>
            </div>
          )
        }
      />

      {/* Filters Card */}
      <Card className="p-5 print:hidden">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Select
              label="የሪፖርት ዓይነት"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData(null);
              }}
            >
              <option value="">-- የሪፖርት ዓይነት ይምረጡ --</option>
              <option value="student">በተማሪ (By Student)</option>
              <option value="grade">በክፍል ደረጃ (By Grade)</option>
              <option value="course">በኮርስ (By Course)</option>
              <option value="teacher">በመምህር (By Teacher)</option>
              <option value="date">በቀን (By Date)</option>
            </Select>
          </div>

          {reportType === 'student' && (
            <div className="flex-1 min-w-[220px]">
              <Select
                label="ተማሪ ይምረጡ"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">ተማሪ ይምረጡ</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.firstName} {s.middleName || ''} {s.lastName || ''} ({s.studentId || s.grade || 'ተማሪ'})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'grade' && (
            <div className="flex-1 min-w-[200px]">
              <Select
                label="የክፍል ደረጃ ይምረጡ"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="">የክፍል ደረጃ ይምረጡ</option>
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'course' && (
            <div className="flex-1 min-w-[220px]">
              <Select
                label="ኮርስ ይምረጡ"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">ኮርስ ይምረጡ</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.code ? `(${c.code})` : ''}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {reportType === 'teacher' && (
            <div className="flex-1 min-w-[200px]">
              <Select
                label="መምህር ይምረጡ"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">መምህር ይምረጡ</option>
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
                label="ቀን ይምረጡ"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          <Button variant="primary" onClick={fetchReport} disabled={loading} className="font-semibold">
            <Search className="w-4 h-4 mr-1.5" /> {loading ? 'በማመንጨት ላይ...' : 'ሪፖርት አውጣ'}
          </Button>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <Card className="py-16 text-center text-muted">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-main">የተሟላ ሪፖርት በመዘጋጀት ላይ ነው...</p>
          <p className="text-xs text-muted mt-1">እባክዎ ትንሽ ይጠብቁ</p>
        </Card>
      )}

      {/* Render Report Content */}
      {!loading && data && (
        <div className="report-content-area">
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