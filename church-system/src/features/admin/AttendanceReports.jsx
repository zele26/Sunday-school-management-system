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
  Building,
  Globe,
  Sun,
  Moon,
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
import { formatGradeAmharic, GRADE_FILTER_OPTIONS } from '../../constants/registrationOptions';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '../../components/motion';

const GRADE_OPTIONS = GRADE_FILTER_OPTIONS.filter(g => g.value !== '');

const getStatusBadge = (status) => {
  switch (status) {
    case 'Present':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>ተገኝቷል</span>
        </span>
      );
    case 'Late':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>ዘግይቷል</span>
        </span>
      );
    case 'Absent':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          <span>አልተገኘም</span>
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

const getModeBadge = (studentType, shift) => {
  const isDistance = studentType === 'distance';
  if (isDistance) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
        <Globe className="w-3 h-3 text-indigo-500" />
        <span>የርቀት</span>
      </span>
    );
  }

  const isNight = shift === 'night';
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <Building className="w-3 h-3 text-[#1657b8]" />
        <span>መደበኛ</span>
      </span>
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        {isNight ? <Moon className="w-2.5 h-2.5 text-indigo-400" /> : <Sun className="w-2.5 h-2.5 text-amber-500" />}
        <span>{isNight ? 'ማታ' : 'ቀን'}</span>
      </span>
    </div>
  );
};

const downloadCSV = (rows, filename = 'attendance-report.csv') => {
  if (!rows.length) return;
  const headers = [
    'ተማሪ',
    'የምዝገባ ዓይነት',
    'ፈረቃ',
    'ክፍል',
    'ኮርስ',
    'መምህር',
    'ቀን',
    'የመግቢያ ሰዓት',
    'ሁኔታ',
    'የትምህርት ዘመን',
    'ሴሚስተር',
  ];
  const csvRows = [headers.join(',')];
  rows.forEach((r) => {
    const studentType = r.studentType || r.student?.studentType || 'regular';
    const shift = r.shift || r.student?.shift || (studentType === 'distance' ? '-' : 'weekend');

    csvRows.push(
      [
        `"${r.studentName || (r.student?.firstName ? `${r.student.firstName} ${r.student.lastName}` : '')}"`,
        `"${studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}"`,
        `"${shift === 'night' ? 'የማታ' : shift === 'weekend' ? 'የቀን / ቅዳሜና እሁድ' : '-'}"`,
        `"${formatGradeAmharic(r.grade || r.student?.grade)}"`,
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
  const [activeViewTab, setActiveViewTab] = useState('table'); // 'table' | 'classes' | 'insights'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    courseId: '',
    grade: '',
    status: '',
    teacher: '',
    studentType: '', // '' | 'regular' | 'distance'
    shift: '',       // '' | 'weekend' | 'night'
    search: '',
  });

  const { data: courses = [] } = useCourses();
  const { data: teachers = [] } = useTeachers();
  const { data: records = [], isLoading, isFetching, refetch } = useAttendanceReport(filters);

  // Available courses cascaded by selected grade/studentType
  const availableCoursesForFilter = useMemo(() => {
    return courses.filter((c) => {
      if (filters.studentType && c.studentType && c.studentType !== filters.studentType) return false;
      if (filters.grade && c.grade) {
        const norm = (str) => {
          const m = str.match(/\d+/);
          if (m) return (str.toLowerCase().includes('batch') || str.includes('ዙር')) ? `batch_${m[0]}` : `grade_${m[0]}`;
          return str.toLowerCase().replace(/\s+/g, '');
        };
        if (norm(c.grade) !== norm(filters.grade)) return false;
      }
      return true;
    });
  }, [courses, filters.studentType, filters.grade]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      // If studentType changed to distance, clear shift
      if (name === 'studentType' && value === 'distance') {
        next.shift = '';
      }
      // If grade changed and courseId is no longer valid for that grade, clear courseId
      if (name === 'grade') {
        next.courseId = '';
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      courseId: '',
      grade: '',
      status: '',
      teacher: '',
      studentType: '',
      shift: '',
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

  // Filter in memory by search query if term is provided
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const studentType = r.studentType || r.student?.studentType || 'regular';
      const shift = r.shift || r.student?.shift || '';

      // Check studentType filter in memory as safeguard
      if (filters.studentType && studentType.toLowerCase() !== filters.studentType.toLowerCase()) {
        return false;
      }
      // Check shift filter
      if (filters.studentType === 'regular' && filters.shift && shift.toLowerCase() !== filters.shift.toLowerCase()) {
        return false;
      }

      // Check text search
      if (!filters.search.trim()) return true;
      const term = filters.search.toLowerCase();
      const studentName = (r.studentName || `${r.student?.firstName || ''} ${r.student?.lastName || ''}`).toLowerCase();
      const studentId = (r.studentId || r.student?.studentId || '').toLowerCase();
      const courseName = (r.courseName || r.course?.name || '').toLowerCase();
      return studentName.includes(term) || studentId.includes(term) || courseName.includes(term);
    });
  }, [records, filters.studentType, filters.shift, filters.search]);

  // Statistical calculations
  const totalCount = filteredRecords.length;
  const presentCount = filteredRecords.filter((r) => r.status === 'Present').length;
  const lateCount = filteredRecords.filter((r) => r.status === 'Late').length;
  const absentCount = filteredRecords.filter((r) => r.status === 'Absent').length;
  const regularCount = filteredRecords.filter((r) => (r.studentType || r.student?.studentType || 'regular') === 'regular').length;
  const distanceCount = filteredRecords.filter((r) => (r.studentType || r.student?.studentType) === 'distance').length;
  const attendanceRate = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 0;
  const onTimeRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Class-by-Class Comparative Analytics
  const gradeAnalytics = useMemo(() => {
    const gradesList = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Batch 1', 'Batch 2'];
    return gradesList.map((g) => {
      const norm = (str) => {
        const m = str.match(/\d+/);
        if (m) return (str.toLowerCase().includes('batch') || str.includes('ዙር')) ? `batch_${m[0]}` : `grade_${m[0]}`;
        return str.toLowerCase().replace(/\s+/g, '');
      };
      const classRecords = filteredRecords.filter((r) => {
        const rGrade = r.grade || r.student?.grade || '';
        return norm(rGrade) === norm(g);
      });
      const total = classRecords.length;
      const present = classRecords.filter((r) => r.status === 'Present').length;
      const late = classRecords.filter((r) => r.status === 'Late').length;
      const absent = classRecords.filter((r) => r.status === 'Absent').length;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      return {
        grade: g,
        label: formatGradeAmharic(g),
        total,
        present,
        late,
        absent,
        rate,
      };
    });
  }, [filteredRecords]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ተማሪ" />,
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
        accessorKey: 'studentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ዓይነትና ፈረቃ" />,
        cell: ({ row }) => {
          const studentType = row.original.studentType || row.original.student?.studentType || 'regular';
          const shift = row.original.shift || row.original.student?.shift || 'weekend';
          return getModeBadge(studentType, shift);
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ክፍል" />,
        cell: ({ row }) => {
          const val = row.original.grade || row.original.student?.grade;
          return <Badge variant="neutral" size="sm" className="font-semibold">{formatGradeAmharic(val)}</Badge>;
        },
      },
      {
        accessorKey: 'courseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ኮርስ" />,
        cell: ({ row }) => {
          const course = row.original.courseName || row.original.course?.name;
          return (
            <span className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1657b8] dark:text-amber-400 shrink-0" />
              <span>{course || 'አጠቃላይ'}</span>
            </span>
          );
        },
      },
      {
        accessorKey: 'teacherName',
        header: 'መምህር',
        cell: ({ row }) => {
          const teacher = row.original.teacherName || row.original.teacher?.fullName;
          return <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">{teacher || '—'}</span>;
        },
      },
      {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ቀን" />,
        cell: ({ getValue }) => (
          <span className="font-semibold text-slate-900 dark:text-white text-xs">
            {formatEthiopianDate(getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'checkInTime',
        header: 'የመግቢያ ሰዓት',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {getValue() ? new Date(getValue()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሁኔታ" />,
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
          title="የመገኘት ሪፖርቶች"
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
                <span>አድስ</span>
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
                    <span>አትም</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
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
                አጠቃላይ መዝገቦች
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Regular vs Distance Breakdown */}
        <MotionCard hoverY={-2}>
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                ተማሪዎች
              </span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {regularCount} <span className="text-xs text-slate-400 font-normal">መደበኛ</span>
                </p>
              </div>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">
                {distanceCount} የርቀት ተማሪዎች
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
        <MotionCard hoverY={-2} className="col-span-2 sm:col-span-1">
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
                ያልተገኙ
              </p>
            </div>
          </div>
        </MotionCard>
      </div>

      {/* 🌟 3. Smart Filter & Search Card with Mode & Shift Options */}
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
              ዛሬ
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('week')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ይህ ሳምንት
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('month')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ይህ ወር
            </button>
            <button
              type="button"
              onClick={() => applyDatePreset('all')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              ሁሉም ጊዜ
            </button>
          </div>

          {/* Search by Student Name, ID, or Course */}
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

        {/* Detailed Filter Dropdowns (8 filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* 1. Student Type (Mode) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              የምዝገባ ዓይነት
            </label>
            <select
              name="studentType"
              value={filters.studentType}
              onChange={handleChange}
              className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ዘርፎች</option>
              <option value="regular">🏛️ መደበኛ</option>
              <option value="distance">🌐 የርቀት</option>
            </select>
          </div>

          {/* 2. Grade */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              ክፍል / ባች
            </label>
            <select
              name="grade"
              value={filters.grade}
              onChange={handleChange}
              className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ክፍሎች</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Shift */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              ፈረቃ
            </label>
            <select
              name="shift"
              value={filters.shift}
              onChange={handleChange}
              disabled={filters.studentType === 'distance'}
              className="w-full p-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">ሁሉም ፈረቃዎች</option>
              <option value="weekend">☀️ የቀን / ቅዳሜና እሁድ</option>
              <option value="night">🌙 የማታ ፈረቃ</option>
            </select>
          </div>

          {/* 4. Course */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block truncate">
              ኮርስ {availableCoursesForFilter.length > 0 ? `(${availableCoursesForFilter.length})` : ''}
            </label>
            <select
              name="courseId"
              value={filters.courseId}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ኮርሶች</option>
              {availableCoursesForFilter.map((c) => (
                <option key={c._id} value={c._id}>
                  📖 {c.name} {!filters.grade && c.grade ? `— ${formatGradeAmharic(c.grade)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              ሁኔታ
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም ሁኔታዎች</option>
              <option value="Present">✅ ተገኝቷል</option>
              <option value="Late">🕒 ዘግይቷል</option>
              <option value="Absent">❌ አልተገኘም</option>
            </select>
          </div>

          {/* 6. Teacher */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              መምህር
            </label>
            <select
              name="teacher"
              value={filters.teacher}
              onChange={handleChange}
              className="w-full p-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] cursor-pointer"
            >
              <option value="">ሁሉም መምህራን</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName || t.name}
                </option>
              ))}
            </select>
          </div>

          {/* 7. Start Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              የመጀመሪያ ቀን
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8]"
            />
          </div>

          {/* 8. End Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
              የማጠቃለያ ቀን
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8]"
            />
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
            <span>ማጣሪያዎችን አጽዳ</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="bg-[#1657b8] hover:bg-[#124796] text-white font-bold gap-1.5 shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{isFetching ? 'በመፈለግ ላይ...' : 'አጣራና ፈልግ'}</span>
          </Button>
        </div>
      </Card>

      {/* 🌟 4. Interactive View Tabs (Table vs Class Breakdown vs Shift Insights) */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'table'
                ? 'bg-[#1657b8] text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>📋 የተማሪዎች ዝርዝር መዝገብ</span>
            <Badge variant={activeViewTab === 'table' ? 'approved' : 'neutral'} size="sm" className="ml-1">
              {totalCount}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('classes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'classes'
                ? 'bg-[#1657b8] text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>🏫 የክፍል-በ-ክፍል ንጽጽር</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('insights')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeViewTab === 'insights'
                ? 'bg-[#1657b8] text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>📊 የፈረቃና የሰዓት ትንታኔ</span>
          </button>
        </div>
      </div>

      {/* 🌟 5. Tab Content 1: Detailed Table View */}
      {activeViewTab === 'table' && (
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
      )}

      {/* 🌟 5. Tab Content 2: Class-by-Class Comparative Analytics */}
      {activeViewTab === 'classes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeAnalytics.map((item) => (
            <MotionCard key={item.grade} hoverY={-3}>
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5 flex flex-col justify-between h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-[#1657b8] dark:text-amber-400" />
                      <span>{item.label}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      ጠቅላላ መዝገቦች፦ <strong>{item.total}</strong>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                      item.rate >= 80
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : item.rate >= 50
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {item.rate}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        item.rate >= 80 ? 'bg-emerald-500' : item.rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(item.rate, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span className="text-emerald-600">✓ {item.present} በሰዓቱ</span>
                    <span className="text-amber-600">🕒 {item.late} ያረፈዱ</span>
                    <span className="text-rose-600">✗ {item.absent} የቀሩ</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, grade: item.grade }));
                    setActiveViewTab('table');
                  }}
                  className="w-full text-xs font-bold gap-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 border-slate-200 dark:border-slate-700"
                >
                  <span>ዝርዝሩን አጣራ</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </MotionCard>
          ))}
        </div>
      )}

      {/* 🌟 5. Tab Content 3: Shift & Punctuality Insights */}
      {activeViewTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Shift Comparison */}
          <Card variant="default" padding="lg" className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-3xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>የመማሪያ ፈረቃ ንጽጽር (Day vs Night Shift)</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>የቀን / ቅዳሜና እሁድ</span>
                </span>
                <p className="text-2xl font-black text-amber-900 dark:text-amber-100">
                  {filteredRecords.filter((r) => (r.shift || r.student?.shift) !== 'night').length}
                </p>
                <p className="text-[11px] text-slate-500">የተገኙ መደበኛ ተማሪዎች</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 space-y-1">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>የማታ ፈረቃ</span>
                </span>
                <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                  {filteredRecords.filter((r) => (r.shift || r.student?.shift) === 'night').length}
                </p>
                <p className="text-[11px] text-slate-500">የተገኙ የማታ ተማሪዎች</p>
              </div>
            </div>
          </Card>

          {/* Punctuality & Time Analysis */}
          <Card variant="default" padding="lg" className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm rounded-3xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Clock className="w-4 h-4 text-[#1657b8] dark:text-blue-400" />
              <span>የሰዓት አከባበር ምጣኔ (Punctuality Rate)</span>
            </h3>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700 dark:text-emerald-400">በሰዓቱ የመድረስ ምጣኔ (On-Time)</span>
                  <span className="text-emerald-700 dark:text-emerald-400">{onTimeRate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${onTimeRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-amber-700 dark:text-amber-400">የማርፈድ ምጣኔ (Late Arrivals)</span>
                  <span className="text-amber-700 dark:text-amber-400">
                    {totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
    </div>
  );
};

export default AttendanceReports;