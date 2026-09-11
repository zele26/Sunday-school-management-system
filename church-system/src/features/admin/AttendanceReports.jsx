'use client';

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  Download,
  Filter,
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Search,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Printer,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  QrCode,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { useAttendanceReport } from '../../hooks/queries/useAttendance';
import { useCourses } from '../../hooks/queries/useCourses';
import { useTeachers } from '../../hooks/queries/useTeachers';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '../../components/motion';

const GRADE_OPTIONS = [
  { value: 'Grade 7', label: '7ኛ ክፍል (Grade 7)' },
  { value: 'Grade 8', label: '8ኛ ክፍል (Grade 8)' },
  { value: 'Grade 9', label: '9ኛ ክፍል (Grade 9)' },
  { value: 'Grade 10', label: '10ኛ ክፍል (Grade 10)' },
  { value: 'Grade 11', label: '11ኛ ክፍል (Grade 11)' },
  { value: 'Grade 12', label: '12ኛ ክፍል (Grade 12)' },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Present':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>ተገኝቷል (Present)</span>
        </span>
      );
    case 'Late':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>ዘግይቷል (Late)</span>
        </span>
      );
    case 'Absent':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>አልተገኘም (Absent)</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <span>{status || '—'}</span>
        </span>
      );
  }
};

const downloadCSV = (rows, filename = 'attendance-report.csv') => {
  if (!rows.length) return;
  const headers = [
    'ተማሪ (Student)',
    'ክፍል (Grade)',
    'ኮርስ (Course)',
    'መምህር (Teacher)',
    'ቀን (Date - Ethiopian)',
    'የመግቢያ ሰዓት (Check-in Time)',
    'ሁኔታ (Status)',
    'የትምህርት ዘመን (Academic Year)',
    'ሴሚስተር (Semester)',
  ];
  const csvRows = [headers.join(',')];
  rows.forEach((r) => {
    csvRows.push(
      [
        `"${r.studentName || (r.student?.firstName ? `${r.student.firstName} ${r.student.lastName}` : '')}"`,
        `"${r.grade || r.student?.grade || ''}"`,
        `"${r.courseName || r.course?.name || 'አጠቃላይ'}"`,
        `"${r.teacherName || r.teacher?.fullName || '—'}"`,
        `"${formatEthiopianDate(r.date)}"`,
        `"${r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}"`,
        `"${r.status || ''}"`,
        `"${r.academicYear || ''}"`,
        `"${r.semester || ''}"`,
      ].join(',')
    );
  });
  // Add UTF-8 BOM so Excel opens Amharic characters properly
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const AttendanceReports = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    courseId: '',
    grade: '',
    status: '',
    teacher: '',
    search: '',
  });

  const { data: courses = [] } = useCourses();
  const { data: teachers = [] } = useTeachers();
  const { data: records = [], isLoading, isFetching, refetch } = useAttendanceReport(filters);

  const handleChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      courseId: '',
      grade: '',
      status: '',
      teacher: '',
      search: '',
    });
  };

  // Quick Date Preset helper
  const applyDatePreset = (preset) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (preset === 'today') {
      const todayStr = formatDate(today);
      setFilters((prev) => ({ ...prev, startDate: todayStr, endDate: todayStr }));
    } else if (preset === 'week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      setFilters((prev) => ({
        ...prev,
        startDate: formatDate(startOfWeek),
        endDate: formatDate(today),
      }));
    } else if (preset === 'month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilters((prev) => ({
        ...prev,
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
      }));
    } else if (preset === 'all') {
      setFilters((prev) => ({ ...prev, startDate: '', endDate: '' }));
    }
  };

  // Filter in memory by student name search if query string is active
  const filteredRecords = useMemo(() => {
    if (!filters.search.trim()) return records;
    const term = filters.search.toLowerCase();
    return records.filter((r) => {
      const studentName = (r.studentName || `${r.student?.firstName || ''} ${r.student?.lastName || ''}`).toLowerCase();
      const studentId = (r.studentId || r.student?.studentId || '').toLowerCase();
      const courseName = (r.courseName || r.course?.name || '').toLowerCase();
      return studentName.includes(term) || studentId.includes(term) || courseName.includes(term);
    });
  }, [records, filters.search]);

  // Statistical calculations
  const totalCount = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'Present').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'Late').length;
  const absentCount = filteredRecords.filter((r) => r.status === 'Absent').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;

  const columns = useMemo(
    () => [
      {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ተማሪ (Student)" />,
        cell: ({ row }) => {
          const r = row.original;
          const name = r.studentName || (r.student?.firstName ? `${r.student.firstName} ${r.student.lastName}` : '—');
          const id = r.student?.studentId || r.studentId;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1657b8]/10 dark:bg-blue-900/30 text-[#1657b8] dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                {name[0] || 'T'}
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block leading-tight">{name}</span>
                {id && <span className="text-[10px] text-slate-400 font-mono">{id}</span>}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ክፍል (Grade)" />,
        cell: ({ row }) => {
          const val = row.original.grade || row.original.student?.grade;
          return <Badge variant="neutral" size="sm" className="font-semibold">{val || '—'}</Badge>;
        },
      },
      {
        accessorKey: 'courseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ኮርስ (Course)" />,
        cell: ({ row }) => {
          const course = row.original.courseName || row.original.course?.name;
          return (
            <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1657b8] dark:text-amber-400 shrink-0" />
              <span>{course || 'አጠቃላይ (General)'}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'teacherName',
        header: 'መምህር (Teacher)',
        cell: ({ row }) => {
          const teacher = row.original.teacherName || row.original.teacher?.fullName;
          return <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">{teacher || '—'}</span>;
        },
      },
      {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ቀን (Date)" />,
        cell: ({ getValue }) => (
          <span className="font-semibold text-slate-900 dark:text-white text-xs">
            {formatEthiopianDate(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'checkInTime',
        header: 'ሰዓት (Check-in)',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {getValue() ? new Date(getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሁኔታ (Status)" />,
        cell: ({ getValue }) => getStatusBadge(getValue()),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* 🌟 1. Header Banner */}
      <FadeIn direction="down" duration={0.35}>
        <PageHeader
          title="የመገኘት ሪፖርቶች (Attendance Reports & Analytics)"
          subtitle="የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን • ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት"
          icon={ClipboardCheck}
          badge={
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm" className="font-bold gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{totalCount} መዝገቦች</span>
              </Badge>
              {totalCount > 0 && (
                <Badge variant="approved" size="sm" className="font-bold">
                  {attendanceRate}% የመገኘት ምጣኔ
                </Badge>
              )}
            </div>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading || isFetching}
                className="gap-1.5 bg-white dark:bg-slate-900"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                <span>አድስ (Refresh)</span>
              </Button>

              {totalCount > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCSV(filteredRecords)}
                    className="gap-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-600" />
                    <span>CSV አውርድ</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="gap-1.5 bg-white dark:bg-slate-900 hidden sm:inline-flex"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-600" />
                    <span>አትም (Print)</span>
                  </Button>
                </>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/qr-scanner')}
                className="gap-1.5 bg-gradient-to-r from-[#1657b8] to-[#0f4699] text-white shadow-md"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR ስካነር ክፈት</span>
              </Button>
            </div>
          }
        />
      </FadeIn>

      {/* 🌟 2. Interactive KPI Summary Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Records */}
        <MotionCard hoverY={-2}>
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                ጠቅላላ
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {totalCount}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                የተመዘገቡ ተማሪዎች
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Present */}
        <MotionCard hoverY={-2}>
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/60 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {presentCount}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                በሰዓቱ የተገኙ
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Late */}
        <MotionCard hoverY={-2}>
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800/60 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                {totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {lateCount}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                አርፍደው የተገኙ
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Absent */}
        <MotionCard hoverY={-2}>
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
                {totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {absentCount}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                ያልተገኙ (Absent)
              </p>
            </div>
          </div>
        </MotionCard>
      </div>

      {/* 🌟 3. Smart Filter & Search Card */}
      <Card variant="default" padding="md" className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Quick Date Presets Bar & Instant Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>ፈጣን ጊዜ፦</span>
            </span>
            <button
              type="button"
              onClick={() => applyDatePreset('today')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ዛሬ (Today)
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('week')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ይህ ሳምንት (Week)
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('month')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ይህ ወር (Month)
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('all')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ሁሉም (All Time)
            </button>
          </div>

          {/* Search by Student Name or ID */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              placeholder="ተማሪ በስም ወይም በመታወቂያ ፈልግ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#1657b8] transition-all"
            />
          </div>
        </div>

        {/* Detailed Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              የመጀመሪያ ቀን (Start Date)
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8]"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              የማጠቃለያ ቀን (End Date)
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8]"
            />
          </div>

          {/* Course */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              ኮርስ (Course)
            </label>
            <select
              name="courseId"
              value={filters.courseId}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ኮርሶች (All Courses)</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              ክፍል (Grade)
            </label>
            <select
              name="grade"
              value={filters.grade}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ክፍሎች (All Grades)</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              ሁኔታ (Status)
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ሁኔታዎች (All)</option>
              <option value="Present">✅ ተገኝቷል (Present)</option>
              <option value="Late">🕒 ዘግይቷል (Late)</option>
              <option value="Absent">❌ አልተገኘም (Absent)</option>
            </select>
          </div>

          {/* Teacher */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              መምህር (Teacher)
            </label>
            <select
              name="teacher"
              value={filters.teacher}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም መምህራን (All)</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName || t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ማጣሪያዎችን አጽዳ (Reset)</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="bg-[#1657b8] hover:bg-[#124796] text-white font-bold gap-1.5 shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isFetching ? 'በመፈለግ ላይ...' : 'አጣራና ፈልግ (Filter)'}</span>
          </Button>
        </div>
      </Card>

      {/* 🌟 4. Attendance DataTable with Inspiring Empty State */}
      <Card variant="default" padding="none" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden rounded-3xl">
        {filteredRecords.length === 0 && !isLoading ? (
          <div className="py-16 px-4 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-amber-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">ምንም የመገኘት መረጃ አልተገኘም</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                በተመረጡት ማጣሪያዎች ውስጥ ምንም የተመዘገበ ተማሪ የለም። ማጣሪያዎችን አስተካክለው ይሞክሩ ወይም በቀጥታ በQR ስካነር መገኘትን ይመዝግቡ።
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ማጣሪያዎችን አጽዳ</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/admin/qr-scanner')}
                className="gap-1.5 bg-[#1657b8] text-white text-xs font-bold shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR ስካነር ክፈት ➔</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <DataTable
              columns={columns}
              data={filteredRecords}
              isLoading={isLoading}
              emptyMessage="ምንም የመገኘት መረጃ አልተገኘም።"
              emptyIcon={ClipboardCheck}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceReports;