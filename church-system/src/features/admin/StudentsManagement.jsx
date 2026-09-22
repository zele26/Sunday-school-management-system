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
  MoreHorizontal,
  RotateCcw,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../components/ui';
import {
  useStudents,
  useDeleteStudent,
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
import { formatGradeAmharic as formatGradeCentral } from '../../constants/registrationOptions';
import ExportStudentsModal from '../../components/ExportStudentsModal';

/**
 * Format grade values (e.g. "Grade 10", "GRADE 10", "10", "Batch 1") into Amharic ("10ኛ ክፍል", "ባች 1")
 */
export const formatGradeAmharic = (grade) => formatGradeCentral(grade, 'ያልተመደበ');

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
  const [showExportModal, setShowExportModal] = useState(false);
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
  const deleteStudentMutation = useDeleteStudent();
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

  const handleDownload = () => {
    setShowExportModal(true);
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
          const initial = s.firstName ? s.firstName.trim().charAt(0) : 'ተ';

          return (
            <div className="flex items-center gap-2.5">
              {s.photoUrl ? (
                <img
                  src={s.photoUrl}
                  alt={fullName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#1657b8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                  {initial}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-900 dark:text-white text-sm block leading-tight truncate">
                    {fullName}
                  </span>
                  {isDeactivated && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                      የታገደ
                    </span>
                  )}
                </div>
                {s.christianName && (
                  <span className="text-[11px] text-[var(--brand-primary)] dark:text-blue-400 font-medium block truncate">
                    ✝️ {s.christianName}
                  </span>
                )}
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
            <span className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60 inline-block">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ክፍል" />,
        cell: ({ getValue }) => {
          const gradeValue = getValue();
          return (
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
          const isDistance = s.studentType === 'distance';
          return (
            <div className="flex flex-col gap-0.5">
              <span className={`text-xs font-semibold ${isDistance ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isDistance ? 'የርቀት' : 'መደበኛ'}
              </span>
              {s.shift && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {s.shift === 'night' ? 'የማታ' : 'የሳምንት መጨረሻ'}
                </span>
              )}
            </div>
          );
        },
      },

      {
        id: 'actions',
        header: () => <div className="text-right">ተግባራት</div>,
        cell: ({ row }) => {
          const s = row.original;
          const fullName = s.fullName || [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') || 'ተማሪ';
          const isDeactivated = s.userId?.status === 'disabled' || s.status === 'disabled';

          return (
            <div className="flex items-center justify-end gap-1">
              {/* Quick View Profile Button */}
              <button
                type="button"
                onClick={() => openProfileModal(s)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="ሙሉ መረጃ ይመልከቱ"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Action Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="ተጨማሪ ተግባራት"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-1.5">
                  <DropdownMenuItem onClick={() => openProfileModal(s)} className="gap-2 text-xs cursor-pointer">
                    <Eye className="w-4 h-4 text-slate-500" />
                    <span>ሙሉ መረጃ (View)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link to={`/admin/edit-student/${s._id}`}>
                      <Edit className="w-4 h-4 text-blue-500" />
                      <span>መረጃ አርም (Edit)</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => openCourseModal(s)} className="gap-2 text-xs cursor-pointer">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                    <span>ኮርሶችን መድብ (Courses)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => openTeacherModal(s)} className="gap-2 text-xs cursor-pointer">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>መምህር መድብ (Teacher)</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => openQrModal(s)} className="gap-2 text-xs cursor-pointer">
                    <QrCode className="w-4 h-4 text-amber-500" />
                    <span>የQR ባጅ (QR Badge)</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

                  {isDeactivated ? (
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm(`የ"${fullName}" አካውንት እንደገና እንዲነቃ (Activate) ይፈልጋሉ?`)) {
                          toggleStudentStatusMutation.mutate({ studentId: s._id, status: 'approved' });
                        }
                      }}
                      className="gap-2 text-xs text-emerald-600 dark:text-emerald-400 cursor-pointer font-semibold"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>አካውንት አንቃ (Activate)</span>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => {
                        if (confirm(`የ"${fullName}" አካውንት ለጊዜው እንዲቦዝን/እንዲዘጋ (Deactivate) ይፈልጋሉ?`)) {
                          toggleStudentStatusMutation.mutate({ studentId: s._id, status: 'disabled' });
                        }
                      }}
                      className="gap-2 text-xs text-amber-600 dark:text-amber-400 cursor-pointer font-semibold"
                    >
                      <UserX className="w-4 h-4" />
                      <span>አካውንት አቦዝን (Deactivate)</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm(`ተማሪ "${fullName}"ን በቋሚነት መሰረዝ ይፈልጋሉ?`)) {
                        deleteStudentMutation.mutate(s._id);
                      }
                    }}
                    className="gap-2 text-xs text-rose-600 dark:text-rose-400 cursor-pointer font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>ተማሪውን ሰርዝ (Delete)</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [generateQRMutation, toggleStudentStatusMutation, deleteStudentMutation]
  );


  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="የተማሪዎች አስተዳደር"
        subtitle="ተማሪዎችን ያስተዳድሩ፤ መምህራንን እና ኮርሶችን ይመድቡ፤ የ QR ኮድ ያመንጩ"
        icon={Users}
        badge={
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {formatStudentCount(stats.total)}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* CSV / Excel Export */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal(true)}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>መረጃ ላክ (Export)</span>
            </Button>

            {/* Batch QR Generation */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateAllQRMutation.mutate()}
              disabled={generateAllQRMutation.isPending}
              className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-semibold gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              <span>{generateAllQRMutation.isPending ? 'በማመንጨት ላይ...' : 'ሁሉንም QR አመንጭ'}</span>
            </Button>

            {/* Add Student */}
            <Link to="/admin/add-student">
              <Button
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg px-3.5 py-1.5 text-xs gap-1.5 border-transparent"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ አዲስ ተማሪ</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Sleek Minimal KPI Bar with Interactive Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Students */}
        <button
          type="button"
          onClick={() => {
            setTypeFilter('');
            setQrFilter('');
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
            !typeFilter && !qrFilter
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 shadow-2xs ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ጠቅላላ ተማሪዎች</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.total}
          </div>
        </button>

        {/* Regular Students */}
        <button
          type="button"
          onClick={() => {
            setTypeFilter((prev) => (prev === 'regular' ? '' : 'regular'));
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === 'regular'
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 shadow-2xs ring-1 ring-emerald-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">መደበኛ ተማሪዎች</span>
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.regular}
          </div>
        </button>

        {/* Distance Students */}
        <button
          type="button"
          onClick={() => {
            setTypeFilter((prev) => (prev === 'distance' ? '' : 'distance'));
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === 'distance'
              ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 shadow-2xs ring-1 ring-purple-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">የርቀት ተማሪዎች</span>
            <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.distance}
          </div>
        </button>

        {/* QR Ready Students */}
        <button
          type="button"
          onClick={() => {
            setQrFilter((prev) => (prev === 'with_qr' ? '' : 'with_qr'));
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          className={`text-left p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
            qrFilter === 'with_qr'
              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 shadow-2xs ring-1 ring-amber-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">QR ያላቸው</span>
            <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {stats.withQR}
          </div>
        </button>
      </div>

      {/* Clean Unified Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
          {/* Search Input */}
          <div className="flex-1 relative min-w-[200px]">
            <Input
              icon={Search}
              placeholder="በስም፣ በመለያ ወይም በስልክ ቁጥር ይፈልጉ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                title="ፍለጋ አጽዳ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grade Filter */}
          <div className="w-full sm:w-auto sm:min-w-[120px]">
            <Select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <option value="">ክፍል (ሁሉም)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={`Grade ${g}`}>
                  {g}ኛ ክፍል
                </option>
              ))}
            </Select>
          </div>

          {/* Student Type Filter */}
          <div className="w-full sm:w-auto sm:min-w-[120px]">
            <Select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <option value="">ዓይነት (ሁሉም)</option>
              <option value="regular">መደበኛ</option>
              <option value="distance">የርቀት</option>
            </Select>
          </div>

          {/* Shift Filter */}
          <div className="w-full sm:w-auto sm:min-w-[130px]">
            <Select
              value={shiftFilter}
              onChange={(e) => {
                setShiftFilter(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <option value="">ፈረቃ (ሁሉም)</option>
              <option value="weekend">የሳምንት መጨረሻ</option>
              <option value="night">የማታ (Night)</option>
            </Select>
          </div>

          {/* Reset Filters */}
          {(search || gradeFilter || typeFilter || shiftFilter || qrFilter) && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSearch('');
                setGradeFilter('');
                setTypeFilter('');
                setShiftFilter('');
                setQrFilter('');
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
              className="gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 shrink-0"
              title="ሁሉንም ማጣሪያዎች ዳግም ጀምር"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ዳግም ጀምር</span>
            </Button>
          )}
        </div>

        {/* Batch Actions Button Bar */}
        {selectedStudentIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>{selectedStudentIds.length} ተማሪዎች ተመርጠዋል</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
                className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1.5 font-semibold text-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>የተመረጡትን ላክ ({selectedStudentIds.length})</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkSelectedCourseIds([]);
                  setBulkCourseMode('replace');
                  setBulkCourseSearch('');
                  setBulkCourseGradeFilter('');
                  setShowBulkCourseModal(true);
                }}
                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 gap-1.5 font-semibold text-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>ኮርስ መድብ</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBulkSelectedTeacherId('');
                  setBulkTeacherMode('set');
                  setShowBulkTeacherModal(true);
                }}
                className="bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 gap-1.5 font-semibold text-xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>መምህር መድብ</span>
              </Button>

              <Button
                variant="warning"
                size="sm"
                onClick={handleBulkDisable}
                disabled={bulkToggleStudentStatusMutation.isPending}
                className="gap-1.5 font-semibold text-xs"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>አቦዝን</span>
              </Button>

              <Button
                variant="success"
                size="sm"
                onClick={handleBulkEnable}
                disabled={bulkToggleStudentStatusMutation.isPending}
                className="gap-1.5 font-semibold text-xs"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>አንቃ</span>
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={bulkDeleteMutation.isPending}
                className="gap-1.5 font-semibold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ሰርዝ</span>
              </Button>
            </div>
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
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                {selectedStudent.photoUrl ? (
                  <img
                    src={selectedStudent.photoUrl}
                    alt="Student"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {selectedStudent.firstName ? selectedStudent.firstName.charAt(0) : 'ተ'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {[selectedStudent.firstName, selectedStudent.middleName, selectedStudent.lastName]
                      .filter(Boolean)
                      .join(' ')}
                  </h4>
                  {selectedStudent.christianName && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                      <span>† የክርስትና ስም:</span>
                      <span>{selectedStudent.christianName}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {selectedStudent.studentId || selectedStudent._id?.slice(-8)?.toUpperCase()}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded font-medium">
                      {formatGradeAmharic(selectedStudent.grade)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confession Father / Spiritual Care Card */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5">
                    <span>† የንስሐ አባት ሁኔታ</span>
                  </span>
                  {selectedStudent.hasConfessionFather ? (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      ✓ አላቸው
                    </span>
                  ) : (
                    <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
                      የላቸውም / አልያዙም
                    </span>
                  )}
                </div>
                {selectedStudent.hasConfessionFather && (selectedStudent.confessionFatherName || selectedStudent.confessionFatherPhone) ? (
                  <div className="pt-1 text-slate-700 dark:text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {selectedStudent.confessionFatherName && (
                      <span><strong>ስም:</strong> {selectedStudent.confessionFatherName}</span>
                    )}
                    {selectedStudent.confessionFatherPhone && (
                      <span className="font-mono"><strong>ስልክ:</strong> {selectedStudent.confessionFatherPhone}</span>
                    )}
                  </div>
                ) : !selectedStudent.hasConfessionFather ? (
                  <p className="text-[11px] text-amber-800 dark:text-amber-400">
                    * ተማሪው የንስሐ አባት እንዲይዝ በሰንበት ት/ቤቱ መንፈሳዊ ድጋፍ ይደረግለታል።
                  </p>
                ) : null}
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
              {(selectedStudent.emergencyFirstName || selectedStudent.emergencyPhone || selectedStudent.emergencyContactPhoto) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs flex items-center gap-3">
                  {selectedStudent.emergencyContactPhoto && (
                    <img
                      src={selectedStudent.emergencyContactPhoto}
                      alt="Emergency Contact"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-300/80 shadow-xs shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>የአደጋ ጊዜ ተጠሪ</span>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 truncate">
                      {[selectedStudent.emergencyFirstName, selectedStudent.emergencyLastName].filter(Boolean).join(' ')}{' '}
                      {selectedStudent.relationship && `(${selectedStudent.relationship})`}
                    </p>
                    {selectedStudent.emergencyPhone && (
                      <p className="font-mono font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                        {selectedStudent.emergencyPhone}
                      </p>
                    )}
                  </div>
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
                {selectedStudent.photoUrl ? (
                  <img
                    src={selectedStudent.photoUrl}
                    alt="Student"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md mb-2"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-amber-400 flex items-center justify-center text-2xl font-black mb-2 shadow-inner">
                    {selectedStudent.firstName ? selectedStudent.firstName.charAt(0) : 'ተ'}
                  </div>
                )}

                <div className="font-extrabold text-base text-white">
                  {[selectedStudent.firstName, selectedStudent.middleName, selectedStudent.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </div>

                {selectedStudent.christianName && (
                  <div className="text-xs text-amber-300 font-medium mt-0.5">
                    † {selectedStudent.christianName}
                  </div>
                )}

                <div className="text-xs text-blue-300 font-mono tracking-wider mt-1">
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
      {/* Advanced Export Students Modal */}
      <ExportStudentsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        initialFilters={{
          grade: gradeFilter,
          studentType: typeFilter,
          shift: shiftFilter,
        }}
        selectedStudentIds={selectedStudentIds}
        totalAvailableCount={stats.total}
      />
    </div>
  );
};

export default StudentsManagement;