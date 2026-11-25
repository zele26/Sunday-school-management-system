'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
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
  ChevronRight,
  Edit2,
  Check,
  X,
  Send,
  AlertTriangle,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast';
import { formatEthiopianDate, getEthiopianLocalDateString } from '../../utils/ethiopianDate';
import { formatGradeAmharic } from '../../constants/registrationOptions';

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
    '"ማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን — ተክለ ሳዊሮስ ሰንበት ት/ቤት"',
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
        `"የክፍል ደረጃ:",${escapeCSV(formatGradeAmharic(student.grade))},"የትምህርት ዓይነት:",${escapeCSV(studentTypeLabel)}`,
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
          escapeCSV(formatGradeAmharic(c.grade)),
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
      const { grade, summary = {}, students = [], filters = {} } = data;
      const shiftText = filters.shift === 'night' ? 'የማታ ፈረቃ' : filters.shift === 'weekend' ? 'የቀን / ሳምንት መጨረሻ' : 'ሁሉም ፈረቃ';
      const typeText = filters.studentType === 'distance' ? 'የርቀት' : filters.studentType === 'regular' ? 'መደበኛ' : 'ሁሉም ዘርፍ';
      const dateText = filters.startDate && filters.endDate ? `${filters.startDate} እስከ ${filters.endDate}` : filters.startDate ? `ከ ${filters.startDate}` : filters.endDate ? `እስከ ${filters.endDate}` : 'አጠቃላይ (All-Time)';

      const rows = [
        ...churchHeader,
        `"=== የክፍል ደረጃ የመገኘትና የክትትል ሪፖርት: ${grade} ==="`,
        `"የክፍል ደረጃ:",${escapeCSV(grade)},"ፈረቃ:",${escapeCSV(shiftText)}`,
        `"የትምህርት ዓይነት:",${escapeCSV(typeText)},"የቀን ክልል:",${escapeCSV(dateText)}`,
        `"አጠቃላይ የተማሪዎች ብዛት:",${summary.totalStudents ?? students.length}`,
        `"አጠቃላይ የተካሄዱ ክፍለ-ጊዜዎች:",${summary.totalSessions ?? 0}`,
        `"አጠቃላይ የተመዘገቡ መገኘቶች:",${summary.totalAttended ?? 0}`,
        `"አማካይ የክፍሉ የመገኘት ምጣኔ:",${escapeCSV((summary.averageRate ?? 0) + '%')}`,
        '""',
        '"=== የተማሪዎች ዝርዝር የመገኘት መረጃ (STUDENTS ATTENDANCE) ==="',
        '"ተ.ቁ","የተማሪ መለያ ቁጥር","ሙሉ ስም","የትምህርት ዓይነት","ፈረቃ","ስልክ","ኢሜይል","የተገኘበት","የዘገየበት","በፈቃድ","አጠቃላይ ክፍለ ጊዜ","ያመለጠው / የቀረበት","የመገኘት ምጣኔ %","ደረጃ"'
      ];

      students.forEach((s, idx) => {
        const rate = s.overallRate ?? (s.overallSessions > 0 ? Math.round((s.overallAttended / s.overallSessions) * 100) : 0);
        const level = rate >= 75 ? 'በጣም ጥሩ' : rate >= 50 ? 'መካከለኛ' : 'ዝቅተኛ';
        rows.push([
          idx + 1,
          escapeCSV(s.studentCustomId || '—'),
          escapeCSV(s.studentName || '—'),
          escapeCSV(s.studentType === 'distance' ? 'የርቀት' : s.studentType === 'adult' ? 'የአዋቂ' : 'መደበኛ'),
          escapeCSV(s.shift === 'night' ? 'የማታ' : 'የቀን / ሳምንት መጨረሻ'),
          escapeCSV(s.phone || '—'),
          escapeCSV(s.email || '—'),
          s.overallAttended || 0,
          s.late || 0,
          s.excused || 0,
          s.overallSessions || 0,
          s.overallMissed ?? Math.max(0, (s.overallSessions || 0) - (s.overallAttended || 0)),
          escapeCSV(`${rate}%`),
          escapeCSV(level)
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
        `"የክፍል ደረጃ / ፈረቃ:",${escapeCSV((formatGradeAmharic(course.grade)) + ' / ' + (course.shift || '—'))}`,
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
          escapeCSV(formatGradeAmharic(s.grade || course.grade)),
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
        rows.push(`"=== ኮርስ ${cIdx + 1}: ${c.courseName} (${c.courseCode || '—'}) | ክፍል: ${formatGradeAmharic(c.grade)} | የተካሄዱ ቀናት: ${c.totalSessions || 0} ==="`);
        rows.push('"ተ.ቁ","የተማሪ መለያ ቁጥር","ሙሉ ስም","ክፍል","የተገኘበት","የቀረበት","አጠቃላይ ክፍለ ጊዜ","የመገኘት ምጣኔ %"');
        (c.students || []).forEach((s, sIdx) => {
          const rate = s.rate ?? (s.totalSessions > 0 ? Math.round((s.attended / s.totalSessions) * 100) : 0);
          rows.push([
            sIdx + 1,
            escapeCSV(s.studentCustomId || '—'),
            escapeCSV(s.studentName || '—'),
            escapeCSV(formatGradeAmharic(s.grade || c.grade)),
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
          escapeCSV(formatGradeAmharic(r.grade)),
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

    case 'overview': {
      const { summary = {}, byGrade = [], atRiskStudents = [], filters = {} } = data;
      const dateText = filters.startDate && filters.endDate ? `${filters.startDate} እስከ ${filters.endDate}` : 'አጠቃላይ (All-Time)';
      const rows = [
        ...churchHeader,
        '"=== አጠቃላይ የሰንበት ት/ቤት የተገኝነት እና ዝቅተኛ መገኘት ሪፖርት ==="',
        `"የቀን ክልል:",${escapeCSV(dateText)},"ዝቅተኛ መለኪያ:",${escapeCSV('<' + (filters.threshold || 75) + '%')}`,
        `"ጠቅላላ መዝገቦች:",${summary.totalRecords ?? 0},"አጠቃላይ ተገኝነት:",${escapeCSV((summary.attendanceRate ?? 0) + '%')}`,
        `"በሰዓቱ:",${summary.present ?? 0},"የዘገዩ:",${summary.late ?? 0},"በፈቃድ:",${summary.excused ?? 0},"ያልተገኙ:",${summary.absent ?? 0}`,
        `"ዝቅተኛ መገኘት ያላቸው:",${summary.atRiskCount ?? atRiskStudents.length}`,
        '""',
        '"=== በክፍል ደረጃ ማጠቃለያ (BY GRADE) ==="',
        '"ክፍል","ጠቅላላ","በሰዓቱ","የዘገዩ","በፈቃድ","ያልተገኙ","የመገኘት ምጣኔ %"'
      ];
      byGrade.forEach((g) => {
        rows.push([
          escapeCSV(formatGradeAmharic(g.grade)),
          g.total || 0,
          g.present || 0,
          g.late || 0,
          g.excused || 0,
          g.absent || 0,
          escapeCSV(`${g.rate || 0}%`)
        ].join(','));
      });
      rows.push('""');
      rows.push(`"=== ክትትል የሚያስፈልጋቸው ተማሪዎች (<${filters.threshold || 75}%) ==="`);
      rows.push('"ተ.ቁ","መለያ ቁጥር","ሙሉ ስም","ክፍል","ስልክ","በሰዓቱ","የዘገዩ","በፈቃድ","ያልተገኙ","ጠቅላላ","የመገኘት ምጣኔ %"');
      atRiskStudents.forEach((s, idx) => {
        rows.push([
          idx + 1,
          escapeCSV(s.studentCustomId || '—'),
          escapeCSV(s.studentName || '—'),
          escapeCSV(formatGradeAmharic(s.grade)),
          escapeCSV(s.phone || '—'),
          s.present || 0,
          s.late || 0,
          s.excused || 0,
          s.absent || 0,
          s.total || 0,
          escapeCSV(`${s.rate || 0}%`)
        ].join(','));
      });
      return rows.join('\n');
    }

    default:
      return '';
  }
};

// ─── Real Excel (.xlsx) Workbook Exporter ────────────────────────────
const exportReportToExcel = (data, reportType) => {
  try {
    const wb = XLSX.utils.book_new();
    const todayStr = getEthiopianLocalDateString();

    if (reportType === 'overview') {
      const summaryRows = [
        { መለኪያ: 'ጠቅላላ መዝገቦች', ዋጋ: data.summary?.totalRecords ?? 0 },
        { መለኪያ: 'በሰዓቱ (Present)', ዋጋ: data.summary?.present ?? 0 },
        { መለኪያ: 'የዘገዩ (Late)', ዋጋ: data.summary?.late ?? 0 },
        { መለኪያ: 'በፈቃድ (Excused)', ዋጋ: data.summary?.excused ?? 0 },
        { መለኪያ: 'ያልተገኙ (Absent)', ዋጋ: data.summary?.absent ?? 0 },
        { መለኪያ: 'አጠቃላይ ተገኝነት %', ዋጋ: `${data.summary?.attendanceRate ?? 0}%` },
        { መለኪያ: 'ዝቅተኛ መገኘት (<Threshold)', ዋጋ: data.summary?.atRiskCount ?? 0 },
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Summary');

      const gradeRows = (data.byGrade || []).map((g) => ({
        ክፍል: formatGradeAmharic(g.grade),
        ጠቅላላ: g.total,
        በሰዓቱ: g.present,
        የዘገዩ: g.late,
        በፈቃድ: g.excused,
        ያልተገኙ: g.absent,
        'ምጣኔ %': `${g.rate}%`,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gradeRows), 'By Grade');

      const riskRows = (data.atRiskStudents || []).map((s, idx) => ({
        'ተ.ቁ': idx + 1,
        መለያ: s.studentCustomId || '—',
        'ሙሉ ስም': s.studentName,
        ክፍል: formatGradeAmharic(s.grade),
        ስልክ: s.phone || '—',
        በሰዓቱ: s.present,
        የዘገዩ: s.late,
        በፈቃድ: s.excused,
        ያልተገኙ: s.absent,
        ጠቅላላ: s.total,
        'ምጣኔ %': `${s.rate}%`,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(riskRows), 'At-Risk Students');
    } else if (reportType === 'grade') {
      const rows = (data.students || []).map((s, idx) => ({
        'ተ.ቁ': idx + 1,
        መለያ: s.studentCustomId || '—',
        'ሙሉ ስም': s.studentName,
        ፈረቃ: s.shift === 'night' ? 'የማታ' : 'የቀን',
        ስልክ: s.phone || '—',
        የተገኘበት: s.overallAttended || 0,
        የዘገየበት: s.late || 0,
        በፈቃድ: s.excused || 0,
        የቀረበት: s.overallMissed ?? s.absent ?? 0,
        'ክፍለ ጊዜ': s.overallSessions || 0,
        'ምጣኔ %': `${s.overallRate || 0}%`,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Grade Report');
    } else if (reportType === 'student') {
      const rows = (data.attendanceHistory || []).map((h, idx) => ({
        'ተ.ቁ': idx + 1,
        'ቀን (ኢት)': formatEthiopianDate(h.date),
        'ቀን (Gregorian)': h.date ? new Date(h.date).toISOString().split('T')[0] : '—',
        'ክፍለ-ጊዜ / ኮርስ': h.courseName || '—',
        መምህር: h.teacherName || '—',
        ሁኔታ: h.status || 'Present',
        ማስታወሻ: h.note || '',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Student Attendance');
    } else if (reportType === 'course') {
      const rows = (data.students || []).map((s, idx) => ({
        'ተ.ቁ': idx + 1,
        መለያ: s.studentCustomId || '—',
        'ሙሉ ስም': s.studentName,
        ክፍል: formatGradeAmharic(s.grade),
        ስልክ: s.phone || '—',
        የተገኘበት: s.attended || 0,
        የዘገየበት: s.late || 0,
        በፈቃድ: s.excused || 0,
        የቀረበት: s.missed || 0,
        'ክፍለ ጊዜ': s.totalSessions || 0,
        'ምጣኔ %': `${s.rate || 0}%`,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Course Report');
    } else if (reportType === 'teacher') {
      const rows = [];
      (data.courses || []).forEach((c) => {
        (c.students || []).forEach((s) => {
          rows.push({
            ኮርስ: c.courseName,
            መለያ: s.studentCustomId || '—',
            'ሙሉ ስም': s.studentName,
            ክፍል: formatGradeAmharic(s.grade || c.grade),
            የተገኘበት: s.attended || 0,
            የቀረበት: s.missed || 0,
            'ክፍለ ጊዜ': s.totalSessions || 0,
            'ምጣኔ %': `${s.rate || 0}%`,
          });
        });
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Teacher Report');
    } else if (reportType === 'date') {
      const rows = (data.records || []).map((r, idx) => ({
        'ተ.ቁ': idx + 1,
        ሰዓት: r.time ? new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
        መለያ: r.studentId || '—',
        'የተማሪ ስም': r.studentName,
        ክፍል: formatGradeAmharic(r.grade),
        ፈረቃ: r.shift === 'night' ? 'የማታ' : 'የቀን',
        'ክፍለ-ጊዜ / ኮርስ': r.courseName || '—',
        ሁኔታ: r.status || 'Present',
        ማስታወሻ: r.note || '',
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Daily Attendance');
    }

    XLSX.writeFile(wb, `${reportType}-attendance-report-${todayStr}.xlsx`);
    toast.success('የExcel (.xlsx) ሪፖርት በተሳካ ሁኔታ ወርዷል!');
  } catch (err) {
    console.error('Excel export error:', err);
    toast.error('Excel ፋይሉን ማውረድ አልተቻለም');
  }
};

// ─── Format Report Summary for Telegram Sharing ──────────────────────
const buildTelegramReportMessage = (data, reportType) => {
  const dateLabel = formatEthiopianDate(new Date());
  if (reportType === 'overview') {
    const { summary = {}, byGrade = [], atRiskStudents = [], filters = {} } = data;
    let msg = `📊 *አጠቃላይ የሰንበት ት/ቤት የተገኝነት ሪፖርት*\n`;
    msg += `📅 ቀን፦ ${dateLabel}\n`;
    if (filters.startDate || filters.endDate) {
      msg += `🗓️ ጊዜ፦ ${filters.startDate || '...'} እስከ ${filters.endDate || '...'}\n`;
    }
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *ጠቅላላ መዝገቦች፦* ${summary.totalRecords ?? 0}\n`;
    msg += `🟢 በሰዓቱ፦ ${summary.present ?? 0} | 🟡 የዘገዩ፦ ${summary.late ?? 0}\n`;
    msg += `🔵 በፈቃድ፦ ${summary.excused ?? 0} | 🔴 ያልተገኙ፦ ${summary.absent ?? 0}\n`;
    msg += `📈 *አጠቃላይ ተገኝነት፦* *${summary.attendanceRate ?? 0}%*\n`;
    msg += `⚠️ *ዝቅተኛ (<${filters.threshold || 75}%)፦* ${summary.atRiskCount ?? 0} ተማሪዎች\n`;
    if (byGrade.length > 0) {
      msg += `\n🏫 *በክፍል ዝርዝር፦*\n`;
      byGrade.slice(0, 10).forEach((g) => {
        msg += `• *${formatGradeAmharic(g.grade)}* — *${g.rate}%* (✅${g.attended} ❌${g.absent})\n`;
      });
    }
    if (atRiskStudents.length > 0) {
      msg += `\n🚨 *ቅድሚያ ክትትል የሚያስፈልጋቸው፦*\n`;
      atRiskStudents.slice(0, 8).forEach((s) => {
        msg += `• *${s.studentName}* (${formatGradeAmharic(s.grade)}) — ${s.rate}%${s.phone && s.phone !== '—' ? ` 📞 ${s.phone}` : ''}\n`;
      });
    }
    return msg;
  }

  if (reportType === 'grade') {
    const { grade, summary = {}, students = [] } = data;
    const atRisk = students.filter((s) => s.isAtRisk || (s.overallSessions > 0 && s.overallRate < 75));
    let msg = `🏫 *የክፍል ተገኝነት ሪፖርት — ${formatGradeAmharic(grade)}*\n`;
    msg += `📅 ቀን፦ ${dateLabel}\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👥 ተማሪዎች፦ *${summary.totalStudents ?? students.length}* | 📅 ክፍለ-ጊዜያት፦ *${summary.totalSessions ?? 0}*\n`;
    msg += `🟢 የተገኙ፦ ${summary.totalAttended ?? 0} | 🟡 የዘገዩ፦ ${summary.totalLate ?? 0}\n`;
    msg += `🔵 በፈቃድ፦ ${summary.totalExcused ?? 0} | 🔴 የቀሩ፦ ${summary.totalAbsent ?? 0}\n`;
    msg += `📈 *አማካይ ተገኝነት፦* *${summary.averageRate ?? 0}%*\n`;
    if (atRisk.length > 0) {
      msg += `\n⚠️ *ዝቅተኛ ተገኝነት (<75%) — ${atRisk.length} ተማሪዎች፦*\n`;
      atRisk.slice(0, 10).forEach((s) => {
        msg += `• *${s.studentName}* — ${s.overallRate}% (❌ ${s.overallMissed ?? s.absent ?? 0})\n`;
      });
    }
    return msg;
  }

  if (reportType === 'date') {
    const { date, summary = {}, records = [] } = data;
    const absentees = records.filter((r) => r.status === 'Absent');
    let msg = `📅 *የዕለታዊ ተገኝነት ሪፖርት*\n`;
    msg += `🗓️ ቀን፦ ${formatEthiopianDate(date)} (${date})\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 ጠቅላላ መዝገቦች፦ *${summary.totalRecords ?? records.length}*\n`;
    msg += `🟢 በሰዓቱ፦ ${summary.totalOnTime ?? 0} | 🟡 የዘገዩ፦ ${summary.totalLate ?? 0}\n`;
    msg += `🔵 በፈቃድ፦ ${summary.totalExcused ?? 0} | 🔴 ያልተገኙ፦ ${summary.totalAbsent ?? 0}\n`;
    msg += `📈 *የተገኝነት ምጣኔ፦* *${summary.attendanceRate ?? 0}%*\n`;
    if (absentees.length > 0) {
      msg += `\n❌ *ያልተገኙ ተማሪዎች (${absentees.length})፦*\n`;
      absentees.slice(0, 12).forEach((a) => {
        msg += `• *${a.studentName}* (${formatGradeAmharic(a.grade)})\n`;
      });
    }
    return msg;
  }

  if (reportType === 'student') {
    const { student = {}, summary = {} } = data;
    return `👤 *የተማሪ ተገኝነት ሪፖርት*\n` +
      `ስም፦ *${student.fullName}* (${student.studentId || '—'})\n` +
      `ክፍል፦ ${formatGradeAmharic(student.grade)}\n━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 ጠቅላላ ክፍለ-ጊዜያት፦ ${summary.totalSessions ?? 0}\n` +
      `🟢 በሰዓቱ፦ ${summary.totalPresent ?? 0} | 🟡 የዘገዩ፦ ${summary.totalLate ?? 0}\n` +
      `🔵 በፈቃድ፦ ${summary.totalExcused ?? 0} | 🔴 የቀሩ፦ ${summary.totalMissed ?? 0}\n` +
      `📈 *የተገኝነት ምጣኔ፦* *${summary.overallRate ?? 0}%*`;
  }

  if (reportType === 'course') {
    const { course = {}, summary = {} } = data;
    return `📘 *የኮርስ ተገኝነት ሪፖርት — ${course.name || '—'}*\n` +
      `መምህር፦ ${course.teacherName || '—'} | ክፍል፦ ${formatGradeAmharic(course.grade)}\n━━━━━━━━━━━━━━━━━━━━\n` +
      `👥 ተማሪዎች፦ ${summary.totalEnrolled ?? 0} | 📅 ክፍለ-ጊዜያት፦ ${summary.totalSessions ?? 0}\n` +
      `📈 *አማካይ ተገኝነት፦* *${summary.averageRate ?? 0}%* | ⚠️ ዝቅተኛ (<75%)፦ ${summary.atRiskCount ?? 0}`;
  }

  const { teacher = {}, summary = {} } = data;
  return `👨‍🏫 *የመምህር ሪፖርት — ${teacher.fullName || '—'}*\n` +
    `📚 ኮርሶች፦ ${summary.totalCourses ?? 0} | 👥 ተማሪዎች፦ ${summary.totalStudents ?? 0}\n📅 ቀን፦ ${dateLabel}`;
};

const ReportsManagement = () => {
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const grades = [
    'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
    'Batch 1', 'Batch 2'
  ];

  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getEthiopianLocalDateString());

  // Enhanced Filter Options: Shift, Student Type, Date Range, Threshold, Table Search
  const [selectedShift, setSelectedShift] = useState('all'); // 'all' | 'weekend' | 'night'
  const [selectedStudentType, setSelectedStudentType] = useState('all'); // 'all' | 'regular' | 'distance'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [atRiskThreshold, setAtRiskThreshold] = useState('75');
  const [customSessions, setCustomSessions] = useState('');
  const [isEditingSessions, setIsEditingSessions] = useState(false);
  const [tempSessionsInput, setTempSessionsInput] = useState('');

  // In-report filtering & Telegram share state
  const [tableSearch, setTableSearch] = useState('');
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramTarget, setTelegramTarget] = useState('self'); // 'self' | 'group' | 'both'

  const applyDatePreset = (preset) => {
    const todayStr = getEthiopianLocalDateString();
    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    const today = new Date(`${todayStr}T12:00:00Z`);
    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === '7d') {
      const s = new Date(today);
      s.setUTCDate(s.getUTCDate() - 6);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === '30d') {
      const s = new Date(today);
      s.setUTCDate(s.getUTCDate() - 29);
      setStartDate(s.toISOString().split('T')[0]);
      setEndDate(todayStr);
    }
  };

  const handleSendToTelegram = async () => {
    if (!data || !reportType) return;
    setSendingTelegram(true);
    try {
      const messageText = buildTelegramReportMessage(data, reportType);
      const res = await apiFetch('/api/admin/reports/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText,
          targetGrade: reportType === 'grade' ? selectedGrade : (selectedGrade && selectedGrade !== 'all' ? selectedGrade : null),
          targetShift: selectedShift && selectedShift !== 'all' ? selectedShift : null,
          sendToSelf: telegramTarget === 'self' || telegramTarget === 'both',
          sendToGroups: telegramTarget === 'group' || telegramTarget === 'both',
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'ሪፖርቱ ወደ ቴሌግራም ተልኳል!');
      } else {
        toast.error(json.message || 'ወደ ቴሌግራም መላክ አልተቻለም');
      }
    } catch (err) {
      toast.error('የቴሌግራም ግንኙነት ስህተት ተፈጥሯል');
    } finally {
      setSendingTelegram(false);
    }
  };

  const handleSaveInPlaceSessions = () => {
    const num = parseInt(tempSessionsInput, 10);
    if (isNaN(num) || num <= 0) {
      toast.error('እባክዎ ትክክለኛ የክፍለ-ጊዜ ቁጥር ያስገቡ');
      return;
    }
    setCustomSessions(String(num));
    setIsEditingSessions(false);
    setData((prev) => {
      if (!prev || !prev.students) return prev;
      const updatedStudents = prev.students.map((s) => {
        const overallSessions = num;
        const missed = Math.max(0, overallSessions - s.attended - s.excused);
        const overallRate = overallSessions > 0 ? Math.round((s.attended / overallSessions) * 100) : 0;
        return {
          ...s,
          overallSessions,
          overallMissed: missed,
          overallRate,
          level: overallRate >= 75 ? 'ከፍተኛ' : overallRate >= 50 ? 'መካከለኛ' : 'ዝቅተኛ',
        };
      });
      const grandSessions = updatedStudents.length * num;
      const averageRate = grandSessions > 0
        ? Math.round((prev.summary.totalAttended / grandSessions) * 100)
        : 0;
      return {
        ...prev,
        summary: {
          ...prev.summary,
          totalSessions: num,
          isManuallyAdjusted: true,
          averageRate,
        },
        students: updatedStudents,
      };
    });
    toast.success(`የተካሄዱ ክፍለ-ጊዜዎች ቁጥር ወደ ${num} ተቀይሯል!`);
  };

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
      setTableSearch('');
      setOnlyAtRisk(false);
      switch (reportType) {
        case 'overview': {
          const params = new URLSearchParams();
          if (selectedShift && selectedShift !== 'all') params.append('shift', selectedShift);
          if (selectedStudentType && selectedStudentType !== 'all') params.append('studentType', selectedStudentType);
          if (selectedGrade && selectedGrade !== 'all') params.append('grade', selectedGrade);
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
          if (atRiskThreshold) params.append('threshold', atRiskThreshold);
          const q = params.toString() ? `?${params.toString()}` : '';
          url = `/api/admin/reports/overview${q}`;
          break;
        }
        case 'student': {
          if (!selectedStudent) {
            toast.error('እባክዎ ተማሪ ይምረጡ');
            setLoading(false);
            return;
          }
          const params = new URLSearchParams();
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
          const q = params.toString() ? `?${params.toString()}` : '';
          url = `/api/admin/reports/student/${selectedStudent}${q}`;
          break;
        }
        case 'grade': {
          if (!selectedGrade) {
            toast.error('እባክዎ የክፍል ደረጃ ይምረጡ');
            setLoading(false);
            return;
          }
          const params = new URLSearchParams();
          if (selectedShift && selectedShift !== 'all') params.append('shift', selectedShift);
          if (selectedStudentType && selectedStudentType !== 'all') params.append('studentType', selectedStudentType);
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
          if (customSessions && !isNaN(customSessions) && Number(customSessions) > 0) {
            params.append('totalSessionsOverride', customSessions);
          }
          const q = params.toString() ? `?${params.toString()}` : '';
          url = `/api/admin/reports/grade/${encodeURIComponent(selectedGrade)}${q}`;
          break;
        }
        case 'course': {
          if (!selectedCourse) {
            toast.error('እባክዎ ኮርስ ይምረጡ');
            setLoading(false);
            return;
          }
          const params = new URLSearchParams();
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
          const q = params.toString() ? `?${params.toString()}` : '';
          url = `/api/admin/reports/course/${selectedCourse}${q}`;
          break;
        }
        case 'teacher':
          if (!selectedTeacher) {
            toast.error('እባክዎ መምህር ይምረጡ');
            setLoading(false);
            return;
          }
          url = `/api/admin/reports/teacher/${selectedTeacher}`;
          break;
        case 'date': {
          if (!selectedDate) {
            toast.error('እባክዎ ቀን ይምረጡ');
            setLoading(false);
            return;
          }
          const params = new URLSearchParams({ date: selectedDate });
          if (selectedShift && selectedShift !== 'all') params.append('shift', selectedShift);
          if (selectedGrade && selectedGrade !== 'all') params.append('grade', selectedGrade);
          url = `/api/admin/reports/date?${params.toString()}`;
          break;
        }
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
            ማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን • ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
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
          subtitle={`የተማሪ መለያ ቁጥር: ${student.studentId || '—'} | ክፍል: ${formatGradeAmharic(student.grade)}`}
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
                <Badge variant="neutral">{formatGradeAmharic(student.grade)}</Badge>
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
    const { grade, summary = {}, students: gradeStudents = [], filters = {} } = data;
    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የ${grade} የመገኘትና የክትትል ሪፖርት`}
          subtitle={`አጠቃላይ ተማሪዎች: ${summary.totalStudents ?? gradeStudents.length} | አማካይ የመገኘት ምጣኔ: ${summary.averageRate ?? 0}%`}
        />

        {/* Active Filters Summary Pill Bar */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-surface-card rounded-2xl border border-subtle text-xs">
          <span className="font-bold text-main">የተመረጡ ማጣሪያዎች፦</span>
          <Badge variant="brand">
            ክፍል: {formatGradeAmharic(grade)}
          </Badge>
          <Badge variant={filters.shift === 'night' ? 'warning' : 'neutral'}>
            ፈረቃ: {filters.shift === 'night' ? 'የማታ ፈረቃ (Night)' : filters.shift === 'weekend' ? 'የቀን / ቅዳሜና እሁድ (Weekend/Day)' : 'ሁሉም ፈረቃ (All Shifts)'}
          </Badge>
          <Badge variant={filters.studentType === 'distance' ? 'info' : 'neutral'}>
            ዘርፍ: {filters.studentType === 'distance' ? 'የርቀት (Distance)' : filters.studentType === 'regular' ? 'መደበኛ (Regular)' : 'ሁሉም ዘርፍ (All Types)'}
          </Badge>
          {(filters.startDate || filters.endDate) && (
            <Badge variant="neutral">
              ቀን: {filters.startDate && filters.endDate ? `${filters.startDate} እስከ ${filters.endDate}` : filters.startDate ? `ከ ${filters.startDate}` : `እስከ ${filters.endDate}`}
            </Badge>
          )}
          {(summary.isManuallyAdjusted || customSessions) && (
            <Badge variant="warning">
              ክፍለ-ጊዜ: {summary.totalSessions} (በእጅ የተስተካከለ)
            </Badge>
          )}
        </div>

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
          <Card className="p-4 bg-surface-card border-subtle relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> የተካሄዱ ክፍለ-ጊዜዎች
              </span>
              <div className="flex items-center gap-1">
                {summary.isManuallyAdjusted && (
                  <Badge variant="warning" size="xs">የተስተካከለ</Badge>
                )}
                {!isEditingSessions && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempSessionsInput(String(summary.totalSessions ?? 0));
                      setIsEditingSessions(true);
                    }}
                    title="ይህንን ቁጥር በእጅ ያስተካክሉ"
                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {isEditingSessions ? (
              <div className="flex items-center gap-1.5 mt-2">
                <input
                  type="number"
                  min="1"
                  value={tempSessionsInput}
                  onChange={(e) => setTempSessionsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveInPlaceSessions();
                    if (e.key === 'Escape') setIsEditingSessions(false);
                  }}
                  autoFocus
                  className="w-20 px-2 py-1 text-base font-black rounded-lg border border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 text-main focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={handleSaveInPlaceSessions}
                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  title="አስቀምጥ"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSessions(false)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
                  title="ሰርዝ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-2xl font-black text-main mt-2 flex items-baseline justify-between">
                <span>{summary.totalSessions ?? 0}</span>
                <span className="text-[10px] text-muted font-normal">ክፍለ-ጊዜ</span>
              </div>
            )}
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> አጠቃላይ መገኘት
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {summary.totalAttended ?? 0}
            </div>
            {summary.totalLate > 0 && (
              <span className="text-[10px] text-amber-500 font-bold block mt-1">
                ({summary.totalLate} ዘግይቶ የተገኘ)
              </span>
            )}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-primary" /> የተማሪዎች ዝርዝር የመገኘት ሁኔታ
              {summary.atRiskCount > 0 && (
                <Badge variant="danger" size="xs">⚠️ {summary.atRiskCount} ዝቅተኛ (&lt;75%)</Badge>
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="ስም ወይም መለያ ፈልግ..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-subtle bg-surface-page text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-44"
                />
              </div>
              <button
                type="button"
                onClick={() => setOnlyAtRisk((v) => !v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  onlyAtRisk
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-surface-page text-muted border-subtle hover:text-main'
                }`}
              >
                ⚠️ ዝቅተኛ ብቻ (&lt;75%)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-3">ተ.ቁ</th>
                  <th className="py-3 px-3">መለያ ቁጥር</th>
                  <th className="py-3 px-3">የተማሪ ስም</th>
                  <th className="py-3 px-3">ዓይነት / ፈረቃ</th>
                  <th className="py-3 px-3 text-center">የተገኘበት</th>
                  <th className="py-3 px-3 text-center">የዘገየበት</th>
                  <th className="py-3 px-3 text-center">በፈቃድ</th>
                  <th className="py-3 px-3 text-center">የቀረበት</th>
                  <th className="py-3 px-3 text-center">ክፍለ ጊዜ</th>
                  <th className="py-3 px-3 text-center">የመገኘት ምጣኔ</th>
                  <th className="py-3 px-3 text-center">ደረጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {(() => {
                  const q = tableSearch.trim().toLowerCase();
                  const filtered = gradeStudents.filter((s) => {
                    const sRate = s.overallRate ?? (s.overallSessions > 0 ? Math.round((s.overallAttended / s.overallSessions) * 100) : 0);
                    if (onlyAtRisk && !(s.overallSessions > 0 && sRate < 75)) return false;
                    if (q) {
                      const hay = `${s.studentName || ''} ${s.studentCustomId || ''} ${s.phone || ''}`.toLowerCase();
                      if (!hay.includes(q)) return false;
                    }
                    return true;
                  });
                  if (filtered.length === 0) {
                    return (
                      <tr>
                        <td colSpan="11" className="py-6 text-center text-xs text-muted">በተመረጡት ማጣሪያዎች የተገኘ ተማሪ የለም።</td>
                      </tr>
                    );
                  }
                  return filtered.map((s, idx) => {
                    const sRate = s.overallRate ?? (s.overallSessions > 0 ? Math.round((s.overallAttended / s.overallSessions) * 100) : 0);
                    return (
                      <tr key={s.studentId || idx} className="hover:bg-surface-page/50 transition-colors">
                        <td className="py-3 px-3 text-xs text-muted">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono text-xs font-bold text-brand-primary">{s.studentCustomId || '—'}</td>
                        <td className="py-3 px-3 font-semibold text-main">{s.studentName}</td>
                        <td className="py-3 px-3 text-xs">
                          <span className="font-medium text-main">{s.studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}</span>
                          <span className="text-muted ml-1">({s.shift === 'night' ? 'ማታ' : 'ቀን'})</span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{s.overallAttended || 0}</td>
                        <td className="py-3 px-3 text-center font-medium text-amber-600 dark:text-amber-400">{s.late || 0}</td>
                        <td className="py-3 px-3 text-center font-medium text-blue-600 dark:text-blue-400">{s.excused || 0}</td>
                        <td className="py-3 px-3 text-center font-bold text-rose-600 dark:text-rose-400">{s.overallMissed ?? s.absent ?? 0}</td>
                        <td className="py-3 px-3 text-center font-medium text-main">{s.overallSessions || 0}</td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={sRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : sRate >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                            {sRate}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={sRate >= 75 ? 'success' : sRate >= 50 ? 'warning' : 'danger'}>
                            {sRate >= 75 ? 'በጣም ጥሩ' : sRate >= 50 ? 'መካከለኛ' : 'ዝቅተኛ'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  });
                })()}
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
          subtitle={`ኮድ: ${course.code || '—'} | መምህር: ${course.teacherName || 'ያልተመደበ'} | ክፍል: ${formatGradeAmharic(course.grade)}`}
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
                  <Badge variant="neutral">ክፍል: {formatGradeAmharic(c.grade)}</Badge>
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
                    <th className="py-2.5 px-3">የተማሪ መለያ ቁጥር</th>
                    <th className="py-2.5 px-3">የተማሪ ሙሉ ስም</th>
                    <th className="py-2.5 px-3">ክፍል</th>
                    <th className="py-2.5 px-3 text-center">የተገኘበት</th>
                    <th className="py-2.5 px-3 text-center">የቀረበት</th>
                    <th className="py-2.5 px-3 text-center">አጠቃላይ ክፍለ ጊዜ</th>
                    <th className="py-2.5 px-3 text-center">የመገኘት ምጣኔ %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {(c.students || []).length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-4 text-center text-muted">የተመዘገበ ተማሪ የለም።</td>
                    </tr>
                  ) : (
                    (c.students || []).map((s, sIdx) => {
                      const rate = s.rate ?? (s.totalSessions > 0 ? Math.round((s.attended / s.totalSessions) * 100) : 0);
                      return (
                        <tr key={s.studentId || sIdx} className="hover:bg-surface-page/50">
                          <td className="py-2.5 px-3">{sIdx + 1}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-brand-primary">{s.studentCustomId || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold text-main">{s.studentName}</td>
                          <td className="py-2.5 px-3">{formatGradeAmharic(s.grade || c.grade)}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{s.attended || 0}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-rose-500">{s.missed || 0}</td>
                          <td className="py-2.5 px-3 text-center">{s.totalSessions || 0}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{rate}%</td>
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

  // ─── Overview & At-Risk Report View ──────────────────────────────
  const renderOverviewReport = () => {
    if (!data) return null;
    const { summary = {}, byGrade = [], dailyTrend = [], atRiskStudents = [], filters = {} } = data;
    const q = tableSearch.trim().toLowerCase();
    const filteredRisk = atRiskStudents.filter((s) => {
      if (!q) return true;
      return `${s.studentName || ''} ${s.studentCustomId || ''} ${s.grade || ''} ${s.phone || ''}`.toLowerCase().includes(q);
    });

    return (
      <div className="space-y-6">
        <ReportHeaderBanner
          title="አጠቃላይ የሰንበት ት/ቤት የተገኝነት እና ዝቅተኛ መገኘት ሪፖርት"
          subtitle={`የቀን ክልል: ${filters.startDate || 'ሁሉም'} — ${filters.endDate || 'ዛሬ'} | ዝቅተኛ መለኪያ: <${filters.threshold || 75}%`}
        />

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-[11px] text-muted font-medium">አጠቃላይ ተገኝነት</span>
            <div className="text-2xl font-black text-brand-primary mt-1">{summary.attendanceRate ?? 0}%</div>
            <span className="text-[10px] text-muted">{summary.totalRecords ?? 0} መዝገቦች</span>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-[11px] text-emerald-600 font-medium">በሰዓቱ (Present)</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{summary.present ?? 0}</div>
            <span className="text-[10px] text-muted">በሰዓቱ: {summary.onTimeRate ?? 0}%</span>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-[11px] text-amber-600 font-medium">የዘገዩ (Late)</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{summary.late ?? 0}</div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-[11px] text-blue-600 font-medium">በፈቃድ (Excused)</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{summary.excused ?? 0}</div>
          </Card>
          <Card className="p-4 bg-surface-card border-subtle">
            <span className="text-[11px] text-rose-600 font-medium">ያልተገኙ (Absent)</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{summary.absent ?? 0}</div>
          </Card>
          <Card className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40">
            <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> ዝቅተኛ (&lt;{filters.threshold || 75}%)
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">{summary.atRiskCount ?? atRiskStudents.length}</div>
            <span className="text-[10px] text-muted">🌟 ≥90%: {summary.excellentCount ?? 0}</span>
          </Card>
        </div>

        {/* Daily Trend + Grade Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-primary" /> የዕለታዊ ተገኝነት ሂደት (Daily Trend)
            </h4>
            {dailyTrend.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">በዚህ ጊዜ ውስጥ የተመዘገበ መረጃ የለም።</p>
            ) : (
              <div className="space-y-2.5">
                {dailyTrend.map((d) => (
                  <div key={d.date} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-main">{formatEthiopianDate(d.date)} <span className="text-[10px] text-muted">({d.date})</span></span>
                      <span className="font-bold text-main">
                        {d.rate}% <span className="text-[10px] text-muted font-normal">(✅{d.attended} • ❌{d.absent}{d.excused ? ` • 🔵${d.excused}` : ''})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-page rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.rate >= 75 ? 'bg-emerald-500' : d.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, d.rate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-4">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-primary" /> በክፍል ደረጃ ንጽጽር (By Grade)
            </h4>
            {byGrade.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">የክፍል መረጃ የለም።</p>
            ) : (
              <div className="space-y-2.5">
                {byGrade.map((g) => (
                  <div key={g.grade} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-main">{formatGradeAmharic(g.grade)}</span>
                      <span className="font-bold text-main">
                        {g.rate}% <span className="text-[10px] text-muted font-normal">(✅{g.attended} • 🟡{g.late} • ❌{g.absent})</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-page rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${g.rate >= 75 ? 'bg-indigo-500' : g.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, g.rate)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* At-Risk Students Table */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> ቅድሚያ ክትትል የሚያስፈልጋቸው ተማሪዎች (&lt;{filters.threshold || 75}%) — {filteredRisk.length}
            </h4>
            <div className="relative print:hidden">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="ስም፣ ክፍል ወይም ስልክ ፈልግ..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-subtle bg-surface-page text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-52"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-subtle">
            <table className="w-full text-left text-sm text-muted">
              <thead className="bg-surface-page text-xs font-bold text-main uppercase border-b border-subtle">
                <tr>
                  <th className="py-3 px-3">ተ.ቁ</th>
                  <th className="py-3 px-3">መለያ ቁጥር</th>
                  <th className="py-3 px-3">የተማሪ ስም</th>
                  <th className="py-3 px-3">ክፍል</th>
                  <th className="py-3 px-3">ስልክ</th>
                  <th className="py-3 px-3 text-center">የተገኘ</th>
                  <th className="py-3 px-3 text-center">በፈቃድ</th>
                  <th className="py-3 px-3 text-center">የቀረ</th>
                  <th className="py-3 px-3 text-center">ጠቅላላ</th>
                  <th className="py-3 px-3 text-center">ምጣኔ %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredRisk.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-6 text-center text-xs text-muted">
                      🎉 በተመረጠው መለኪያ (&lt;{filters.threshold || 75}%) ዝቅተኛ ተገኝነት ያለው ተማሪ አልተገኘም።
                    </td>
                  </tr>
                ) : (
                  filteredRisk.map((s, idx) => (
                    <tr key={s.studentId || idx} className="hover:bg-surface-page/50">
                      <td className="py-2.5 px-3 text-xs">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-xs font-bold text-brand-primary">{s.studentCustomId || '—'}</td>
                      <td className="py-2.5 px-3 font-semibold text-main">{s.studentName}</td>
                      <td className="py-2.5 px-3 text-xs">{formatGradeAmharic(s.grade)}</td>
                      <td className="py-2.5 px-3 font-mono text-xs">{s.phone || '—'}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{s.attended}</td>
                      <td className="py-2.5 px-3 text-center text-blue-600">{s.excused}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-rose-600">{s.absent}</td>
                      <td className="py-2.5 px-3 text-center">{s.total}</td>
                      <td className="py-2.5 px-3 text-center">
                        <Badge variant="danger">{s.rate}%</Badge>
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

  // ─── Date Report View ────────────────────────────────────────────
  const renderDateReport = () => {
    if (!data) return null;
    const { date, summary = {}, records = [] } = data;
    const q = tableSearch.trim().toLowerCase();
    const filteredRecords = records.filter((r) => {
      if (!q) return true;
      return `${r.studentName || ''} ${r.studentId || ''} ${r.grade || ''} ${r.courseName || ''} ${r.status || ''}`.toLowerCase().includes(q);
    });

    const getDateStatusBadge = (status) => {
      if (status === 'Late') return <Badge variant="warning">🟡 የዘገየ (Late)</Badge>;
      if (status === 'Excused') return <Badge variant="info">🔵 በፈቃድ (Excused)</Badge>;
      if (status === 'Absent') return <Badge variant="danger">🔴 አልተገኘም (Absent)</Badge>;
      return <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> ተገኝቷል (Present)</Badge>;
    };

    return (
      <div className="space-y-6">
        <ReportHeaderBanner 
          title={`የዕለታዊ መገኘት ሪፖርት: ${formatEthiopianDate(date)}`}
          subtitle={`ቀን (በፈረንጆች): ${date} | ጠቅላላ መዝገቦች: ${summary.totalRecords ?? records.length} | ተገኝነት: ${summary.attendanceRate ?? 0}%`}
        />

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="p-3.5 bg-surface-card border-subtle">
            <span className="text-xs text-muted">በሰዓቱ (Present)</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{summary.totalOnTime ?? 0}</div>
          </Card>
          <Card className="p-3.5 bg-surface-card border-subtle">
            <span className="text-xs text-muted">የዘገዩ (Late)</span>
            <div className="text-xl font-black text-amber-600 mt-1">{summary.totalLate ?? 0}</div>
          </Card>
          <Card className="p-3.5 bg-surface-card border-subtle">
            <span className="text-xs text-muted">በፈቃድ (Excused)</span>
            <div className="text-xl font-black text-blue-600 mt-1">{summary.totalExcused ?? 0}</div>
          </Card>
          <Card className="p-3.5 bg-surface-card border-subtle">
            <span className="text-xs text-muted">ያልተገኙ (Absent)</span>
            <div className="text-xl font-black text-rose-600 mt-1">{summary.totalAbsent ?? 0}</div>
          </Card>
          <Card className="p-3.5 bg-surface-card border-subtle">
            <span className="text-xs text-muted">የተገኝነት ምጣኔ</span>
            <div className="text-xl font-black text-brand-primary mt-1">{summary.attendanceRate ?? 0}%</div>
          </Card>
        </div>

        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold text-sm text-main flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" /> የዕለቱ የተማሪዎች የመገኘት መዝገብ ({filteredRecords.length})
            </h4>
            <div className="relative print:hidden">
              <Search className="w-3.5 h-3.5 text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="ተማሪ፣ ክፍል ወይም ሁኔታ ፈልግ..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-subtle bg-surface-page text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/30 w-52"
              />
            </div>
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
                  <th className="py-3 px-4">ክፍለ-ጊዜ / ኮርስ</th>
                  <th className="py-3 px-4">ማስታወሻ</th>
                  <th className="py-3 px-4 text-center">ሁኔታ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-6 text-center text-xs text-muted">በዚህ ቀን የተመዘገበ መገኘት የለም።</td>
                  </tr>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <tr key={r._id || idx} className="hover:bg-surface-page/50 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-main">
                        {r.time ? new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-bold text-brand-primary">{r.studentId || '—'}</td>
                      <td className="py-3 px-4 font-semibold text-main">{r.studentName}</td>
                      <td className="py-3 px-4 font-medium text-main">{formatGradeAmharic(r.grade)}</td>
                      <td className="py-3 px-4 text-xs">
                        <span className="text-main">{r.studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}</span>
                        <span className="text-muted ml-1">({r.shift === 'night' ? 'ማታ' : 'ቀን'})</span>
                      </td>
                      <td className="py-3 px-4 font-medium text-main">
                        {r.courseName} {r.courseCode && r.courseCode !== '—' && <span className="text-xs text-muted">({r.courseCode})</span>}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted">{r.note || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        {getDateStatusBadge(r.status)}
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
        subtitle="አጠቃላይ፣ በተማሪ፣ በክፍል፣ በኮርስ፣ በመምህር ወይም በቀን ዝርዝር ሪፖርቶችን ያመንጩ፣ በExcel/CSV ያውርዱ ወይም ወደ ቴሌግራም ይላኩ።"
        icon={FileText}
        actions={
          data && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-surface-card border border-subtle rounded-lg px-2 py-1">
                <select
                  value={telegramTarget}
                  onChange={(e) => setTelegramTarget(e.target.value)}
                  className="text-xs bg-transparent text-main focus:outline-none"
                  title="የቴሌግራም መድረሻ"
                >
                  <option value="self">ወደ እኔ (Admin DM)</option>
                  <option value="group">ወደ ክፍል ግሩፕ</option>
                  <option value="both">ሁለቱም</option>
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendToTelegram}
                  disabled={sendingTelegram}
                  className="shadow-sm font-semibold"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> {sendingTelegram ? 'በመላክ ላይ...' : 'ወደ ቴሌግራም ላክ'}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="shadow-sm"
              >
                <Printer className="w-4 h-4 mr-1.5" /> አትም / PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadCSV(generateCSV(data, reportType), `${reportType}-report-${getEthiopianLocalDateString()}.csv`)}
                className="shadow-sm"
              >
                <Download className="w-4 h-4 mr-1.5" /> CSV
              </Button>
              <Button
                variant="success"
                onClick={() => exportReportToExcel(data, reportType)}
                className="shadow-sm font-semibold"
              >
                <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Excel (.xlsx)
              </Button>
            </div>
          )
        }
      />

      {/* Filters Card */}
      <Card className="p-5 space-y-4 print:hidden">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[220px]">
            <Select
              label="የሪፖርት ዓይነት"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setData(null);
              }}
            >
              <option value="overview">📊 አጠቃላይ እና ዝቅተኛ መገኘት (Overview & At-Risk)</option>
              <option value="grade">🏫 በክፍል ደረጃ (By Grade)</option>
              <option value="date">📅 በቀን (By Date)</option>
              <option value="student">👤 በተማሪ (By Student)</option>
              <option value="course">📘 በኮርስ (By Course)</option>
              <option value="teacher">👨‍🏫 በመምህር (By Teacher)</option>
            </Select>
          </div>

          {reportType === 'overview' && (
            <>
              <div className="flex-1 min-w-[160px]">
                <Select
                  label="የክፍል ደረጃ (አማራጭ)"
                  value={selectedGrade || 'all'}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="all">ሁሉም ክፍሎች</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>{formatGradeAmharic(g)}</option>
                  ))}
                </Select>
              </div>
              <div className="flex-1 min-w-[150px]">
                <Select
                  label="ፈረቃ (Shift)"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="all">ሁሉም ፈረቃ</option>
                  <option value="weekend">ቀን / ቅዳሜና እሁድ</option>
                  <option value="night">የማታ ፈረቃ</option>
                </Select>
              </div>
              <div className="flex-1 min-w-[140px]">
                <Select
                  label="የትምህርት ዓይነት"
                  value={selectedStudentType}
                  onChange={(e) => setSelectedStudentType(e.target.value)}
                >
                  <option value="all">ሁሉም ዘርፍ</option>
                  <option value="regular">መደበኛ (Regular)</option>
                  <option value="distance">የርቀት (Distance)</option>
                </Select>
              </div>
              <div className="w-28">
                <Input
                  label="ዝቅተኛ መለኪያ (%)"
                  type="number"
                  min="10"
                  max="100"
                  value={atRiskThreshold}
                  onChange={(e) => setAtRiskThreshold(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[135px]">
                <Input
                  label="ከቀን"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[135px]">
                <Input
                  label="እስከ ቀን"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          {reportType === 'student' && (
            <>
              <div className="flex-1 min-w-[220px]">
                <Select
                  label="ተማሪ ይምረጡ"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">ተማሪ ይምረጡ</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.firstName} {s.middleName || ''} {s.lastName || ''} ({s.studentId ? s.studentId : formatGradeAmharic(s.grade)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex-1 min-w-[135px]">
                <Input label="ከቀን (አማራጭ)" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1 min-w-[135px]">
                <Input label="እስከ ቀን (አማራጭ)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </>
          )}

          {reportType === 'grade' && (
            <>
              <div className="flex-1 min-w-[170px]">
                <Select
                  label="የክፍል ደረጃ ይምረጡ"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">የክፍል ደረጃ ይምረጡ</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {formatGradeAmharic(g)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex-1 min-w-[170px]">
                <Select
                  label="ፈረቃ (Shift)"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="all">ሁሉም ፈረቃ (All Shifts)</option>
                  <option value="weekend">ቀን / ቅዳሜና እሁድ (Weekend/Day)</option>
                  <option value="night">የማታ ፈረቃ (Night)</option>
                </Select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <Select
                  label="የትምህርት ዓይነት"
                  value={selectedStudentType}
                  onChange={(e) => setSelectedStudentType(e.target.value)}
                >
                  <option value="all">ሁሉም ዘርፍ (All Types)</option>
                  <option value="regular">መደበኛ (Regular)</option>
                  <option value="distance">የርቀት (Distance)</option>
                </Select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <Input
                  label="ከቀን (Start Date)"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[140px]">
                <Input
                  label="እስከ ቀን (End Date)"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[140px]">
                <Input
                  label="ክፍለ-ጊዜ ብዛት (Override)"
                  type="number"
                  min="1"
                  placeholder="በራስ-ሰር (Auto)"
                  value={customSessions}
                  onChange={(e) => setCustomSessions(e.target.value)}
                />
              </div>
            </>
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
            <>
              <div className="flex-1 min-w-[170px]">
                <Input
                  label="ቀን ይምረጡ"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="flex-1 min-w-[160px]">
                <Select
                  label="የክፍል ደረጃ (አማራጭ)"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="all">ሁሉም ክፍሎች</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {formatGradeAmharic(g)}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex-1 min-w-[160px]">
                <Select
                  label="ፈረቃ (አማራጭ)"
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="all">ሁሉም ፈረቃ</option>
                  <option value="weekend">ቀን / ቅዳሜና እሁድ</option>
                  <option value="night">ማታ</option>
                </Select>
              </div>
            </>
          )}

          <Button variant="primary" onClick={fetchReport} disabled={loading} className="font-semibold">
            <Search className="w-4 h-4 mr-1.5" /> {loading ? 'በማመንጨት ላይ...' : 'ሪፖርት አውጣ'}
          </Button>
        </div>

        {/* Quick Date Range Presets */}
        {['overview', 'grade', 'student', 'course'].includes(reportType) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-subtle text-xs">
            <span className="text-muted font-medium">ፈጣን የቀን ምርጫ፦</span>
            {[
              { id: 'today', label: 'ዛሬ' },
              { id: '7d', label: 'ያለፉት 7 ቀናት' },
              { id: '30d', label: 'ያለፉት 30 ቀናት' },
              { id: 'all', label: 'ሁሉም ጊዜ' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyDatePreset(p.id)}
                className="px-2.5 py-1 rounded-md border border-subtle bg-surface-page hover:bg-brand-primary/10 hover:border-brand-primary/40 text-main transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
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
          {reportType === 'overview' && renderOverviewReport()}
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