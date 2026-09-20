'use client';

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Download,
  QrCode,
  Search,
  Trash2,
  Edit,
  BookOpen,
  UserCheck,
  GraduationCap,
  Globe,
  Eye,
  CheckCircle2,
  XCircle,
  Printer,
  X,
  Phone,
  Mail,
  Calendar,
  ShieldAlert,
  Sun,
  Moon,
  Clock,
  UserX,
} from 'lucide-react';
import { API_BASE_URL } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
  DataTable,
  DataTableColumnHeader,
  IndeterminateCheckbox,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '../../components/ui';
import {
  useStudents,
  useBulkDeleteStudents,
  useGenerateStudentQR,
  useGenerateAllQR,
  useAssignTeacher,
  useAssignCourses,
  useBulkAssignCourses,
  useBulkAssignTeacher,
  useToggleStudentStatus,
  useBulkToggleStudentsStatus,
} from '../../hooks/queries/useStudents';
import { useTeachers } from '../../hooks/queries/useTeachers';

import { useCourses } from '../../hooks/queries/useCourses';

/**
 * Format grade values (e.g. "Grade 10", "GRADE 10", "10") into Amharic ("10ኛ ክፍል")
 */
export const formatGradeAmharic = (grade) => {
  if (!grade) return 'ያልተመደበ';
  const str = String(grade).trim();
  if (str.includes('ክፍል') || str.includes('ኛ')) return str;
  const match = str.match(/\d+/);
  if (match) {
    return `${match[0]}ኛ ክፍል`;
  }
  return str;
};

/**
 * Format learning type / shift (Weekend vs Night)
 */
export const formatShiftAmharic = (shift) => {
  if (!shift) return null;
  const s = String(shift).toLowerCase().trim();
  if (s === 'weekend' || s.includes('weekend') || s.includes('ቀን') || s.includes('ሳምንት')) {
    return 'የሳምንት መጨረሻ (Weekend)';
  }
  if (s === 'night' || s.includes('night') || s.includes('ማታ')) {
    return 'የማታ (Night)';
  }
  return shift;
};

/**
 * Format student count with proper singular/plural Amharic grammar
 */
export const formatStudentCount = (count) => {
  const num = Number(count) || 0;
  if (num === 1) return '1 ተማሪ';
  return `${num} ተማሪዎች`;
};

const StudentsManagement = () => {
  // Query parameters & pagination
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [qrFilter, setQrFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  // Bulk Assign Modals state
  const [showBulkCourseModal, setShowBulkCourseModal] = useState(false);
  const [showBulkTeacherModal, setShowBulkTeacherModal] = useState(false);
  const [bulkSelectedCourseIds, setBulkSelectedCourseIds] = useState([]);
  const [bulkCourseMode, setBulkCourseMode] = useState('replace'); // 'replace' or 'append'
  const [bulkCourseGradeFilter, setBulkCourseGradeFilter] = useState('');
  const [bulkCourseSearch, setBulkCourseSearch] = useState('');
  const [bulkSelectedTeacherId, setBulkSelectedTeacherId] = useState('');
  const [bulkTeacherMode, setBulkTeacherMode] = useState('set'); // 'set' or 'append'

  // Data Queries
  const { data, isLoading } = useStudents({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    grade: gradeFilter,
    studentType: typeFilter,
    shift: shiftFilter,
  });

  const { data: teachers = [] } = useTeachers();
  const { data: courses = [] } = useCourses();

  // Mutations
  const bulkDeleteMutation = useBulkDeleteStudents();
  const generateQRMutation = useGenerateStudentQR();
  const generateAllQRMutation = useGenerateAllQR();
  const assignTeacherMutation = useAssignTeacher();
  const assignCoursesMutation = useAssignCourses();
  const bulkAssignCoursesMutation = useBulkAssignCourses();
  const bulkAssignTeacherMutation = useBulkAssignTeacher();
  const toggleStudentStatusMutation = useToggleStudentStatus();
  const bulkToggleStudentStatusMutation = useBulkToggleStudentsStatus();

  const rawStudents = data?.students || [];
  const totalPages = data?.totalPages || 1;
  const totalStudents = data?.total ?? rawStudents.length;

  // Filter by QR status and shift locally if not already filtered
  const filteredStudents = useMemo(() => {
    let result = rawStudents;

    if (shiftFilter) {
      result = result.filter((s) => s.shift === shiftFilter);
    }

    if (qrFilter === 'with_qr') {
      result = result.filter((s) => Boolean(s.qrCode));
    } else if (qrFilter === 'without_qr') {
      result = result.filter((s) => !s.qrCode);
    }

    return result;
  }, [rawStudents, qrFilter, shiftFilter]);

  const stats = useMemo(() => {
    if (data?.stats) {
      return {
        total: data.stats.total ?? totalStudents,
        regular: data.stats.regular ?? rawStudents.filter((s) => s.studentType === 'regular').length,
        distance: data.stats.distance ?? rawStudents.filter((s) => s.studentType === 'distance').length,
        withQR: data.stats.withQR ?? rawStudents.filter((s) => s.qrCode).length,
      };
    }
    return {
      total: totalStudents || rawStudents.length,
      regular: rawStudents.filter((s) => s.studentType === 'regular').length,
      distance: rawStudents.filter((s) => s.studentType === 'distance').length,
      withQR: rawStudents.filter((s) => s.qrCode).length,
    };
  }, [data, rawStudents, totalStudents]);

  // Selected student IDs for bulk actions
  const selectedStudentIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]);
  }, [rowSelection]);

  const handleBulkDisable = () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`እርግጠኛ ነዎት ${selectedStudentIds.length} የተማሪ አካውንቶችን ለጊዜው ማቦዘን/ማገድ ይፈልጋሉ? የተማሪዎቹ ውጤትና መረጃ አይጠፋም።`)) return;
    bulkToggleStudentStatusMutation.mutate(
      { studentIds: selectedStudentIds, status: 'disabled' },
      { onSuccess: () => setRowSelection({}) }
    );
  };

  const handleBulkEnable = () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`እርግጠኛ ነዎት ${selectedStudentIds.length} የተማሪ አካውንቶችን ማንቃት ይፈልጋሉ?`)) return;
    bulkToggleStudentStatusMutation.mutate(
      { studentIds: selectedStudentIds, status: 'approved' },
      { onSuccess: () => setRowSelection({}) }
    );
  };

  const handleDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`ማስጠንቀቂያ፡ ተማሪዎችን ሙሉ በሙሉ ከመሰረዝ ይልቅ "አቦዝን" ማድረግ ይመረጣል። ${selectedStudentIds.length} ተማሪዎችን በቋሚነት መሰረዝ ይፈልጋሉ?`)) return;
    bulkDeleteMutation.mutate(selectedStudentIds, {
      onSuccess: () => setRowSelection({}),
    });
  };


  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const token = useAuthStore.getState().accessToken;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (gradeFilter) params.append('grade', gradeFilter);
      if (typeFilter) params.append('studentType', typeFilter);
      if (shiftFilter) params.append('shift', shiftFilter);
      if (token) params.append('token', token);

      const url = `${API_BASE_URL}/api/admin/students/export?${params.toString()}`;
      
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to export students CSV');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `የተማሪዎች_ዝርዝር_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.warn('Direct CSV download failed, opening in new tab:', err);
      const token = useAuthStore.getState().accessToken;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (gradeFilter) params.append('grade', gradeFilter);
      if (typeFilter) params.append('studentType', typeFilter);
      if (shiftFilter) params.append('shift', shiftFilter);
      if (token) params.append('token', token);
      window.open(`${API_BASE_URL}/api/admin/students/export?${params.toString()}`, '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  const openProfileModal = (student) => {
    setSelectedStudent(student);
    setShowProfileModal(true);
  };

  const openQrModal = (student) => {
    setSelectedStudent(student);
    setShowQrModal(true);
  };

  const openTeacherModal = (student) => {
    setSelectedStudent(student);
    setAssignedTeacherId(student.teacher?._id || '');
    setShowTeacherModal(true);
  };

  const handleAssignTeacher = () => {
    if (!selectedStudent || !assignedTeacherId) return;
    assignTeacherMutation.mutate(
      { studentId: selectedStudent._id, teacherId: assignedTeacherId },
      { onSuccess: () => setShowTeacherModal(false) }
    );
  };

  const openCourseModal = (student) => {
    setSelectedStudent(student);
    const existingIds = student.courses?.map((c) => c._id) || [];
    setSelectedCourseIds(existingIds);
    setShowCourseModal(true);
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleAssignCourses = () => {
    if (!selectedStudent) return;
    assignCoursesMutation.mutate(
      { studentId: selectedStudent._id, courseIds: selectedCourseIds },
      { onSuccess: () => setShowCourseModal(false) }
    );
  };

  // Bulk course helper logic
  const filteredBulkCourses = useMemo(() => {
    return courses.filter((c) => {
      if (bulkCourseGradeFilter && c.grade !== bulkCourseGradeFilter) return false;
      if (bulkCourseSearch.trim()) {
        const query = bulkCourseSearch.toLowerCase();
        const matchesName = c.name?.toLowerCase().includes(query);
        const matchesCode = c.code?.toLowerCase().includes(query);
        const matchesTeacher = (c.teacher?.fullName || '').toLowerCase().includes(query);
        if (!matchesName && !matchesCode && !matchesTeacher) return false;
      }
      return true;
    });
  }, [courses, bulkCourseGradeFilter, bulkCourseSearch]);

  const toggleBulkCourseSelection = (courseId) => {
    setBulkSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleSelectAllBulkCourses = () => {
    const ids = filteredBulkCourses.map((c) => c._id);
    setBulkSelectedCourseIds((prev) => [...new Set([...prev, ...ids])]);
  };

  const handleDeselectAllBulkCourses = () => {
    const idsToRemove = new Set(filteredBulkCourses.map((c) => c._id));
    setBulkSelectedCourseIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  const handleBulkAssignCourses = () => {
    if (selectedStudentIds.length === 0) return;
    bulkAssignCoursesMutation.mutate(
      {
        studentIds: selectedStudentIds,
        courseIds: bulkSelectedCourseIds,
        mode: bulkCourseMode,
      },
      {
        onSuccess: () => {
          setShowBulkCourseModal(false);
          setRowSelection({});
        },
      }
    );
  };

  const handleBulkAssignTeacher = () => {
    if (selectedStudentIds.length === 0 || !bulkSelectedTeacherId) return;
    bulkAssignTeacherMutation.mutate(
      {
        studentIds: selectedStudentIds,
        teacherId: bulkSelectedTeacherId,
        mode: bulkTeacherMode,
      },
      {
        onSuccess: () => {
          setShowBulkTeacherModal(false);
          setRowSelection({});
        },
      }
    );
  };

  // TanStack Table Columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        size: 40,
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የተማሪ ስም" />,
        cell: ({ row }) => {
          const s = row.original;
          const fullName =
            [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') ||
            s.fullName ||
            'ስም ያልተጠቀሰ';
          const isDeactivated = s.userId?.status === 'disabled' || s.status === 'disabled';
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                {s.firstName ? s.firstName.charAt(0) : 'ተ'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white block leading-tight truncate">
                    {fullName}
                  </span>
                  {isDeactivated && (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      የታገደ
                    </span>
                  )}
                </div>
                {s.contactPhone ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate font-mono">
                    {s.contactPhone}
                  </span>
                ) : s.email ? (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                    {s.email}
                  </span>
                ) : null}
              </div>
            </div>
          );
        },
      },

      {
        accessorKey: 'studentId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የተማሪ መለያ" />,
        cell: ({ getValue, row }) => {
          const val = getValue() || row.original.studentId || row.original._id?.slice(-8)?.toUpperCase() || '-';
          return (
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded tracking-wider border border-slate-200/60 dark:border-slate-700/60 inline-block">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የትምህርት ደረጃ" />,
        cell: ({ getValue }) => {
          const gradeValue = getValue();
          return (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded text-xs inline-flex items-center">
              {formatGradeAmharic(gradeValue)}
            </span>
          );
        },
      },
      {
        accessorKey: 'studentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ዓይነት / ፈረቃ" />,
        cell: ({ row }) => {
          const s = row.original;
          const type = s.studentType;
          const shift = s.shift;

          return (
            <div className="flex flex-col gap-1 items-start">
              {type === 'distance' ? (
                <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>የርቀት</span>
                </span>
              ) : (
                <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />
                  <span>መደበኛ</span>
                </span>
              )}

              {/* Shift Tag: Weekend or Night */}
              {shift === 'night' ? (
                <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                  <Moon className="w-2.5 h-2.5" />
                  <span>የማታ (Night)</span>
                </span>
              ) : shift === 'weekend' ? (
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                  <Sun className="w-2.5 h-2.5" />
                  <span>የሳምንት መጨረሻ</span>
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'teachers',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የኮርስ መምህራን" />,
        cell: ({ row }) => {
          const student = row.original;
          const courseTeacherItems = [];
          if (Array.isArray(student.courses) && student.courses.length > 0) {
            student.courses.forEach((c) => {
              if (c.teacher?.fullName) {
                courseTeacherItems.push({ courseName: c.name, teacherName: c.teacher.fullName });
              }
            });
          }

          if (courseTeacherItems.length > 0) {
            return (
              <div className="flex flex-col gap-1 max-w-[220px]">
                {courseTeacherItems.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="text-xs leading-tight">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.teacherName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 truncate">
                      ({item.courseName})
                    </span>
                  </div>
                ))}
                {courseTeacherItems.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{courseTeacherItems.length - 2} ተጨማሪ</span>
                )}
              </div>
            );
          }

          if (Array.isArray(student.teachers) && student.teachers.length > 0) {
            return (
              <div className="flex flex-wrap gap-1">
                {student.teachers.map((t, idx) => (
                  <Badge key={idx} variant="neutral" size="sm">
                    {t.fullName || t.name}
                  </Badge>
                ))}
              </div>
            );
          }

          if (student.teacher?.fullName) {
            return (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {student.teacher.fullName}
              </span>
            );
          }

          return <span className="text-xs text-slate-400 italic">ያልተመደበ</span>;
        },
      },
      {
        id: 'qrStatus',
        header: 'የQR ኮድ ሁኔታ',
        cell: ({ row }) => {
          const s = row.original;
          if (s.qrCode) {
            return (
              <button
                type="button"
                onClick={() => openQrModal(s)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="የQR ባጅ ይመልከቱ"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>✓ ተዘጋጅቷል</span>
              </button>
            );
          }
          return (
            <button
              type="button"
              onClick={() => generateQRMutation.mutate(s._id)}
              disabled={generateQRMutation.isPending}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="አዲስ የQR ኮድ ያመንጩ"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span>አልተዘጋጀም</span>
            </button>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">ተግባራት</div>,
        cell: ({ row }) => {
          const s = row.original;
          const fullName = s.fullName || [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') || 'ተማሪ';
          return (
            <TooltipProvider delayDuration={150}>
              <div className="flex items-center justify-end gap-1">
                {/* View Profile */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => openProfileModal(s)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      aria-label="የተማሪ መረጃ"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>የተማሪ መረጃ (View Profile)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Assign Teacher */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => openTeacherModal(s)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      aria-label="መምህር መድብ"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>መምህር መድብ (Assign Teacher)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Enrolled Courses */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => openCourseModal(s)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                      aria-label="የተመዘገቡ ኮርሶች"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>የተመዘገቡ ኮርሶች (Enrolled Courses)</p>
                  </TooltipContent>
                </Tooltip>

                {/* View / Print QR Badge */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => openQrModal(s)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      aria-label="የQR ባጅ አሳይ / አትም"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>የQR ባጅ አሳይ / አትም (View/Print QR Badge)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Safe Disable / Enable Toggle Action */}
                {s.userId?.status === 'disabled' || s.status === 'disabled' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`የ"${fullName}" አካውንት እንደገና እንዲነቃ (Activate) ይፈልጋሉ?`)) {
                            toggleStudentStatusMutation.mutate({ studentId: s._id, status: 'approved' });
                          }
                        }}
                        disabled={toggleStudentStatusMutation.isPending}
                        className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        aria-label="አካውንት አንቃ"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>አካውንቱን አንቃ (Activate Account)</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`የ"${fullName}" አካውንት ለጊዜው እንዲቦዝን/እንዲዘጋ (Deactivate) ይፈልጋሉ? መረጃዎቻቸው አይጠፉም።`)) {
                            toggleStudentStatusMutation.mutate({ studentId: s._id, status: 'disabled' });
                          }
                        }}
                        disabled={toggleStudentStatusMutation.isPending}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                        aria-label="አካውንት አቦዝን"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>አካውንቱን አቦዝን (Deactivate Account)</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Edit Student */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/admin/edit-student/${s._id}`}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                      aria-label="አስተካክል"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>አስተካክል (Edit Student)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          );
        },
      },
    ],
    [generateQRMutation, toggleStudentStatusMutation]
  );


  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="የተማሪዎች አስተዳደር"
        subtitle="ተማሪዎችን ያስተዳድሩ፤ መምህራንን እና ኮርሶችን ይመድቡ፤ የ QR ኮድ ያመንጩ"
        icon={Users}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
            {formatStudentCount(stats.total)}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Secondary Action 2: CSV Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isExporting}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs px-3.5 py-2 font-semibold gap-1.5"
            >
              <Download className={`w-4 h-4 text-slate-600 dark:text-slate-300 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'በማውረድ ላይ...' : 'መረጃ ላክ (CSV)'}</span>
            </Button>

            {/* Secondary Action 1: Batch QR Generation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateAllQRMutation.mutate()}
              disabled={generateAllQRMutation.isPending}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs px-3.5 py-2 font-semibold gap-1.5"
            >
              <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              <span>{generateAllQRMutation.isPending ? 'በማመንጨት ላይ...' : 'ሁሉንም QR አመንጭ'}</span>
            </Button>

            {/* Primary Action: Add Student */}
            <Link to="/admin/add-student">
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg shadow-sm px-4 py-2 gap-1.5 border-transparent"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ አዲስ ተማሪ</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric KPI Cards (Visual Anchors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <Card
          variant="default"
          padding="none"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                አጠቃላይ ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
                {stats.total}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Regular Students */}
        <Card
          variant="default"
          padding="none"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                መደበኛ ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight">
                {stats.regular}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Distance Students */}
        <Card
          variant="default"
          padding="none"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                የርቀት ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1.5 tracking-tight">
                {stats.distance}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* QR Badge Students */}
        <Card
          variant="default"
          padding="none"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                QR ያላቸው ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5 tracking-tight">
                {stats.withQR}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Unified Search & Filter Bar (Including Weekend / Night Learning Type) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <Input
            icon={Search}
            placeholder="በስም፣ በመለያ ወይም በስልክ ቁጥር ይፈልጉ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </div>

        {/* Dropdown 1: Grade Filter (1ኛ - 12ኛ ክፍል) */}
        <div className="w-full sm:w-auto min-w-[130px]">
          <Select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">ሁሉም ክፍሎች</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={`Grade ${g}`}>
                {g}ኛ ክፍል
              </option>
            ))}
          </Select>
        </div>

        {/* Dropdown 2: Student Type Filter (መደበኛ / ርቀት) */}
        <div className="w-full sm:w-auto min-w-[150px]">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">ሁሉም ዓይነቶች</option>
            <option value="regular">መደበኛ</option>
            <option value="distance">የርቀት</option>
          </Select>
        </div>

        {/* Dropdown 3: Learning Type / Shift Filter (Weekend vs Night) */}
        <div className="w-full sm:w-auto min-w-[165px]">
          <Select
            value={shiftFilter}
            onChange={(e) => {
              setShiftFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">የመማሪያ ፈረቃ (ሁሉም)</option>
            <option value="weekend">የሳምንት መጨረሻ (Weekend)</option>
            <option value="night">የማታ (Night)</option>
          </Select>
        </div>

        {/* Dropdown 4: QR Status Filter */}
        <div className="w-full sm:w-auto min-w-[130px]">
          <Select
            value={qrFilter}
            onChange={(e) => {
              setQrFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">የQR ሁኔታ</option>
            <option value="with_qr">የተዘጋጀለት</option>
            <option value="without_qr">የሌለው</option>
          </Select>
        </div>

        {/* Batch Actions Button Bar */}
        {selectedStudentIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Bulk Assign Courses */}
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setBulkSelectedCourseIds([]);
                setBulkCourseMode('replace');
                setBulkCourseSearch('');
                setBulkCourseGradeFilter('');
                setShowBulkCourseModal(true);
              }}
              className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 gap-1.5 shrink-0 font-bold"
              title="ለተመረጡት ተማሪዎች ኮርሶችን በጅምላ መድብ"
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>ኮርስ መድብ ({selectedStudentIds.length})</span>
            </Button>

            {/* Bulk Assign Teacher */}
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setBulkSelectedTeacherId('');
                setBulkTeacherMode('set');
                setShowBulkTeacherModal(true);
              }}
              className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 gap-1.5 shrink-0 font-bold"
              title="ለተመረጡት ተማሪዎች መምህር በጅምላ መድብ"
            >
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>መምህር መድብ ({selectedStudentIds.length})</span>
            </Button>

            {/* Bulk Disable */}
            <Button
              variant="warning"
              size="md"
              onClick={handleBulkDisable}
              disabled={bulkToggleStudentStatusMutation.isPending}
              className="gap-1.5 shrink-0"
              title="የተመረጡትን ተማሪዎች አካውንት ለጊዜው አቦዝን"
            >
              <UserX className="w-4 h-4" />
              <span>{bulkToggleStudentStatusMutation.isPending ? 'በማቦዘን ላይ...' : `አቦዝን (${selectedStudentIds.length})`}</span>
            </Button>

            {/* Bulk Enable */}
            <Button
              variant="success"
              size="md"
              onClick={handleBulkEnable}
              disabled={bulkToggleStudentStatusMutation.isPending}
              className="gap-1.5 shrink-0"
              title="የተመረጡትን ተማሪዎች አካውንት አንቃ"
            >
              <UserCheck className="w-4 h-4" />
              <span>{bulkToggleStudentStatusMutation.isPending ? 'በማንቃት ላይ...' : `አንቃ (${selectedStudentIds.length})`}</span>
            </Button>

            {/* Bulk Delete */}
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteSelected}
              disabled={bulkDeleteMutation.isPending}
              className="gap-1.5 shrink-0"
              title="የተመረጡትን ተማሪዎች በቋሚነት ሰርዝ"
            >
              <Trash2 className="w-4 h-4" />
              <span>{bulkDeleteMutation.isPending ? 'በመሰረዝ ላይ...' : `ሰርዝ (${selectedStudentIds.length})`}</span>
            </Button>
          </div>
        )}
      </div>


      {/* TanStack Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        isLoading={isLoading}
        totalItemsCount={totalStudents}
        emptyMessage="ምንም ተማሪ አልተገኘም"
        emptyIcon={Users}
      />

      {/* Student Profile Preview Modal */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪ ዝርዝር መረጃ</h3>
                  <p className="text-xs text-slate-500">ተክለ ሳዊሮስ ሰንበት ት/ቤት</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {selectedStudent.firstName ? selectedStudent.firstName.charAt(0) : 'ተ'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {[selectedStudent.firstName, selectedStudent.middleName, selectedStudent.lastName]
                      .filter(Boolean)
                      .join(' ')}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {selectedStudent.studentId || selectedStudent._id?.slice(-8)?.toUpperCase()}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded font-medium">
                      {formatGradeAmharic(selectedStudent.grade)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail Items */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">ዓይነት</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedStudent.studentType === 'distance' ? 'የርቀት ተማሪ' : 'መደበኛ ተማሪ'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">የመማሪያ ፈረቃ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {formatShiftAmharic(selectedStudent.shift) || 'ያልተገለጸ'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">የQR ኮድ ሁኔታ</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {selectedStudent.qrCode ? '✓ ተዘጋጅቷል' : 'አልተዘጋጀም'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">ስልክ ቁጥር</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                    {selectedStudent.contactPhone || selectedStudent.phone || 'ያልተገለጸ'}
                  </span>
                </div>
              </div>

              {/* Emergency Contact if available */}
              {(selectedStudent.emergencyFirstName || selectedStudent.emergencyPhone) && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>የአደጋ ጊዜ ተጠሪ</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {[selectedStudent.emergencyFirstName, selectedStudent.emergencyLastName].filter(Boolean).join(' ')}{' '}
                    {selectedStudent.relationship && `(${selectedStudent.relationship})`} —{' '}
                    <span className="font-mono font-semibold">{selectedStudent.emergencyPhone || 'ስልክ የለም'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2.5 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowProfileModal(false)}>
                ዝጋ
              </Button>
              <Link to={`/admin/edit-student/${selectedStudent._id}`}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Edit className="w-3.5 h-3.5" />
                  <span>መረጃ አርም</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* QR Badge Modal */}
      {showQrModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                <span>የተማሪ ዲጂታል QR ባጅ</span>
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badge Content for Print / Preview */}
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-full p-6 rounded-2xl bg-gradient-to-b from-blue-900 via-blue-950 to-slate-950 text-white shadow-xl border border-blue-400/30 flex flex-col items-center relative overflow-hidden">
                <div className="text-[11px] font-bold text-amber-300 tracking-wider uppercase mb-1">
                  ተክለ ሳዊሮስ ሰንበት ት/ቤት
                </div>
                <div className="text-xs text-blue-200 mb-3">የተማሪ መታወቂያ ባጅ</div>

                {/* Student Avatar */}
                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-amber-400 flex items-center justify-center text-2xl font-black mb-3 shadow-inner">
                  {selectedStudent.firstName ? selectedStudent.firstName.charAt(0) : 'ተ'}
                </div>

                <div className="font-extrabold text-base text-white">
                  {[selectedStudent.firstName, selectedStudent.middleName, selectedStudent.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </div>

                <div className="text-xs text-blue-300 font-mono tracking-wider mt-0.5">
                  ID: {selectedStudent.studentId || selectedStudent._id?.slice(-8)?.toUpperCase()}
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[11px] font-semibold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    {formatGradeAmharic(selectedStudent.grade)}
                  </span>
                  {selectedStudent.shift && (
                    <span className="text-[10px] font-semibold bg-blue-800 text-blue-100 px-2 py-0.5 rounded-full">
                      {formatShiftAmharic(selectedStudent.shift)}
                    </span>
                  )}
                </div>

                {/* QR Code Graphic */}
                <div className="mt-4 p-3 bg-white rounded-xl shadow-lg">
                  {selectedStudent.qrCode && selectedStudent.qrCode.startsWith('data:') ? (
                    <img src={selectedStudent.qrCode} alt="Student QR" className="w-32 h-32 object-contain" />
                  ) : (
                    <div className="w-32 h-32 flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-2 border border-slate-200 rounded-lg">
                      <QrCode className="w-20 h-20 text-slate-900" />
                      <span className="text-[9px] font-mono mt-1 font-bold text-slate-600 truncate max-w-[110px]">
                        {selectedStudent.studentId || selectedStudent._id}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-3">
                  ለመገኘት እና ለማረጋገጫ ይህን ኮድ ይጠቀሙ
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowQrModal(false)}>
                ዝጋ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="w-4 h-4" />
                <span>ባጅ አትም (Print)</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Assignment Modal */}
      {showTeacherModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <Card
            variant="default"
            padding="md"
            className="max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">መምህር መድብ</h3>
              <button
                onClick={() => setShowTeacherModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              ለተማሪ {selectedStudent.firstName} {selectedStudent.lastName} መምህር ይምረጡ
            </p>
            <Select value={assignedTeacherId} onChange={(e) => setAssignedTeacherId(e.target.value)}>
              <option value="">መምህር ይምረጡ</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.fullName || t.name}
                </option>
              ))}
            </Select>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowTeacherModal(false)}>
                ሰርዝ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAssignTeacher}
                disabled={assignTeacherMutation.isPending}
              >
                {assignTeacherMutation.isPending ? 'በመመደብ ላይ...' : 'መድብ'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Course Assignment Modal */}
      {showCourseModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <Card
            variant="default"
            padding="md"
            className="max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">ኮርሶችን መድብ</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              ለተማሪ {selectedStudent.firstName} {selectedStudent.lastName} ኮርሶችን ይምረጡ
            </p>
            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
              {courses.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">ምንም የተመዘገበ ኮርስ የለም</p>
              ) : (
                courses.map((c) => (
                  <label
                    key={c._id}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(c._id)}
                      onChange={() => toggleCourseSelection(c._id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {c.name}
                      </span>
                      {c.grade && (
                        <span className="text-[10px] text-slate-400">
                          {formatGradeAmharic(c.grade)}
                        </span>
                      )}
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowCourseModal(false)}>
                ሰርዝ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAssignCourses}
                disabled={assignCoursesMutation.isPending}
              >
                {assignCoursesMutation.isPending ? 'በማስቀመጥ ላይ...' : 'አስቀምጥ'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Course Assignment Modal */}
      {showBulkCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <Card
            variant="default"
            padding="none"
            className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ኮርሶችን በጅምላ መድብ (Bulk Assign Courses)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ለ<span className="font-bold text-blue-600 dark:text-blue-400"> {selectedStudentIds.length} </span> የተመረጡ ተማሪዎች
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkCourseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Assignment Mode Selection */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  የመመደቢያ ዘዴ (Assignment Mode):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    bulkCourseMode === 'replace'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-100 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="bulkCourseMode"
                      value="replace"
                      checked={bulkCourseMode === 'replace'}
                      onChange={() => setBulkCourseMode('replace')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold">የነበሩትን ኮርሶች ተካ (Replace)</div>
                      <div className="text-[11px] opacity-75 font-normal mt-0.5">ተማሪዎቹ የተመረጡትን ኮርሶች ብቻ ይወስዳሉ</div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    bulkCourseMode === 'append'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-100 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="bulkCourseMode"
                      value="append"
                      checked={bulkCourseMode === 'append'}
                      onChange={() => setBulkCourseMode('append')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold">በነበሩት ላይ ጨምር (Append)</div>
                      <div className="text-[11px] opacity-75 font-normal mt-0.5">ነባር ኮርሶቻቸው ሳይጠፉ አዲስ ይጨመራሉ</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Filters for courses */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    icon={Search}
                    placeholder="ኮርስ በስም ወይም በኮድ ይፈልጉ..."
                    value={bulkCourseSearch}
                    onChange={(e) => setBulkCourseSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Select
                    value={bulkCourseGradeFilter}
                    onChange={(e) => setBulkCourseGradeFilter(e.target.value)}
                  >
                    <option value="">ሁሉም ክፍሎች</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={`Grade ${g}`}>
                        {g}ኛ ክፍል
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Course Selection Controls */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  የተመረጡ ኮርሶች፡ <span className="text-blue-600 dark:text-blue-400">{bulkSelectedCourseIds.length}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllBulkCourses}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                  >
                    ሁሉንም ምረጥ
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllBulkCourses}
                    className="text-slate-500 dark:text-slate-400 hover:underline font-semibold cursor-pointer"
                  >
                    ሁሉንም ሰርዝ
                  </button>
                </div>
              </div>

              {/* Course List */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl">
                {filteredBulkCourses.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">ምንም የተገኘ ኮርስ የለም</p>
                ) : (
                  filteredBulkCourses.map((c) => {
                    const isSelected = bulkSelectedCourseIds.includes(c._id);
                    return (
                      <label
                        key={c._id}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors border ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBulkCourseSelection(c._id)}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                              {c.name}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {c.code && <span className="font-mono">{c.code}</span>}
                              {c.grade && <span>• {formatGradeAmharic(c.grade)}</span>}
                              {c.teacher?.fullName && <span>• መምህር: {c.teacher.fullName}</span>}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="shrink-0 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                            የተመረጠ
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowBulkCourseModal(false)}>
                ሰርዝ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAssignCourses}
                disabled={bulkAssignCoursesMutation.isPending}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <BookOpen className="w-4 h-4" />
                <span>
                  {bulkAssignCoursesMutation.isPending
                    ? 'በመመደብ ላይ...'
                    : `ኮርሶችን መድብ (${bulkSelectedCourseIds.length})`}
                </span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Bulk Teacher Assignment Modal */}
      {showBulkTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <Card
            variant="default"
            padding="none"
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    መምህር በጅምላ መድብ (Bulk Assign Teacher)
                  </h3>
                  <p className="text-xs text-slate-500">
                    ለ<span className="font-bold text-purple-600 dark:text-purple-400"> {selectedStudentIds.length} </span> የተመረጡ ተማሪዎች
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkTeacherModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Assignment Mode */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  የመመደቢያ ዘዴ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    bulkTeacherMode === 'set'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="bulkTeacherMode"
                      value="set"
                      checked={bulkTeacherMode === 'set'}
                      onChange={() => setBulkTeacherMode('set')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>ዋና መምህር አድርግና ተካ</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    bulkTeacherMode === 'append'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 font-semibold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="bulkTeacherMode"
                      value="append"
                      checked={bulkTeacherMode === 'append'}
                      onChange={() => setBulkTeacherMode('append')}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>ወደ መምህራን ዝርዝር ጨምር</span>
                  </label>
                </div>
              </div>

              {/* Teacher Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  መምህር ይምረጡ:
                </label>
                <Select
                  value={bulkSelectedTeacherId}
                  onChange={(e) => setBulkSelectedTeacherId(e.target.value)}
                >
                  <option value="">-- መምህር ይምረጡ --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.fullName || t.name} {t.phone ? `(${t.phone})` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setShowBulkTeacherModal(false)}>
                ሰርዝ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkAssignTeacher}
                disabled={bulkAssignTeacherMutation.isPending || !bulkSelectedTeacherId}
                className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                <GraduationCap className="w-4 h-4" />
                <span>{bulkAssignTeacherMutation.isPending ? 'በመመደብ ላይ...' : 'መምህር መድብ'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentsManagement;