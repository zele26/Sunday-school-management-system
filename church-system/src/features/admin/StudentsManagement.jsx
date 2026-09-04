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
} from '../../components/ui';
import {
  useStudents,
  useBulkDeleteStudents,
  useGenerateStudentQR,
  useGenerateAllQR,
  useAssignTeacher,
  useAssignCourses,
} from '../../hooks/queries/useStudents';
import { useTeachers } from '../../hooks/queries/useTeachers';
import { useCourses } from '../../hooks/queries/useCourses';

const StudentsManagement = () => {
  // Query parameters & pagination
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [assignedTeacherId, setAssignedTeacherId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  // Data Queries
  const { data, isLoading, isFetching } = useStudents({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    grade: gradeFilter,
    studentType: typeFilter,
  });

  const { data: teachers = [] } = useTeachers();
  const { data: courses = [] } = useCourses();

  // Mutations
  const bulkDeleteMutation = useBulkDeleteStudents();
  const generateQRMutation = useGenerateStudentQR();
  const generateAllQRMutation = useGenerateAllQR();
  const assignTeacherMutation = useAssignTeacher();
  const assignCoursesMutation = useAssignCourses();

  const students = data?.students || [];
  const totalPages = data?.totalPages || 1;
  const totalStudents = data?.total || 0;

  const stats = useMemo(() => {
    if (data?.stats) return data.stats;
    return {
      total: totalStudents || students.length,
      regular: students.filter((s) => s.studentType === 'regular').length,
      distance: students.filter((s) => s.studentType === 'distance').length,
      withQR: students.filter((s) => s.qrCode).length,
    };
  }, [data, students, totalStudents]);

  // Selected student IDs for bulk actions
  const selectedStudentIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]);
  }, [rowSelection]);

  const handleDeleteSelected = () => {
    if (selectedStudentIds.length === 0) return;
    if (!confirm(`Delete ${selectedStudentIds.length} student(s)?`)) return;
    bulkDeleteMutation.mutate(selectedStudentIds, {
      onSuccess: () => setRowSelection({}),
    });
  };

  const handleDownload = () => {
    const token = useAuthStore.getState().accessToken;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (gradeFilter) params.append('grade', gradeFilter);
    if (typeFilter) params.append('studentType', typeFilter);
    if (token) params.append('token', token);
    window.open(`${API_BASE_URL}/api/admin/students/export?${params.toString()}`, '_blank');
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

  // TanStack Table Column Definitions
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <span className="font-bold text-slate-900 dark:text-white">
            {row.original.firstName} {row.original.middleName} {row.original.lastName}
          </span>
        ),
      },
      {
        accessorKey: 'studentId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
            {getValue() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || '-'}</Badge>,
      },
      {
        accessorKey: 'studentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'distance' ? 'gold' : 'approved'} size="sm">
            {getValue() || 'regular'}
          </Badge>
        ),
      },
      {
        accessorKey: 'teacher',
        header: 'Teacher',
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {row.original.teacher?.fullName || <span className="text-slate-400 italic">Unassigned</span>}
          </span>
        ),
      },
      {
        id: 'qrCode',
        header: 'QR',
        cell: ({ row }) => {
          const s = row.original;
          return s.qrCode ? (
            <span className="text-emerald-600 font-bold text-xs">✓ Ready</span>
          ) : (
            <button
              onClick={() => generateQRMutation.mutate(s._id)}
              disabled={generateQRMutation.isPending}
              className="text-xs text-[var(--brand-primary)] hover:underline font-bold disabled:opacity-50"
            >
              Generate
            </button>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => openTeacherModal(s)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                title="Assign Teacher"
              >
                <UserCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => openCourseModal(s)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                title="Assign Courses"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <Link
                to={`/admin/edit-student/${s._id}`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[var(--brand-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          );
        },
      },
    ],
    [generateQRMutation]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የተማሪዎች አስተዳደር (Student Management)"
        subtitle="ተማሪዎችን ያስተዳድሩ፣ መምህራንን እና ኮርሶችን ይመድቡ፣ የ QR ኮድ ያመንጩ"
        icon={Users}
        badge={<Badge variant="gold" size="sm">{stats.total} ተማሪዎች</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => generateAllQRMutation.mutate()}
              disabled={generateAllQRMutation.isPending}
              className="gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{generateAllQRMutation.isPending ? 'Generating...' : 'Generate All QR'}</span>
            </Button>
            <Link to="/admin/add-student">
              <Button variant="primary" size="sm" className="gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ አዲስ ተማሪ</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </Card>
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Regular</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.regular}</p>
        </Card>
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Distance</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.distance}</p>
        </Card>
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">With QR</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">{stats.withQR}</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="በስም ወይም በኢሜይል ይፈልጉ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">All Grades</option>
            {[7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={`Grade ${g}`}>Grade {g}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-40">
          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="distance">Distance</option>
          </Select>
        </div>
        {selectedStudentIds.length > 0 && (
          <Button
            variant="danger"
            size="md"
            onClick={handleDeleteSelected}
            disabled={bulkDeleteMutation.isPending}
            className="gap-1.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{bulkDeleteMutation.isPending ? 'በመሰረዝ ላይ...' : `ሰርዝ (${selectedStudentIds.length})`}</span>
          </Button>
        )}
      </div>

      {/* TanStack Data Table */}
      <DataTable
        columns={columns}
        data={students}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        isLoading={isLoading}
        totalItemsCount={totalStudents}
        emptyMessage="ምንም ተማሪ አልተገኘም (No students found)"
        emptyIcon={Users}
      />

      {/* Teacher Assignment Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <Card variant="default" padding="md" className="max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">መምህር መድብ (Assign Teacher)</h3>
            <p className="text-xs text-slate-500">
              ለተማሪ {selectedStudent?.firstName} {selectedStudent?.lastName} መምህር ይምረጡ
            </p>
            <Select value={assignedTeacherId} onChange={(e) => setAssignedTeacherId(e.target.value)}>
              <option value="">መምህር ይምረጡ</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>{t.fullName || t.name}</option>
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
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <Card variant="default" padding="md" className="max-w-md w-full space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ኮርሶችን መድብ (Assign Courses)</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {courses.map((c) => (
                <label
                  key={c._id}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCourseIds.includes(c._id)}
                    onChange={() => toggleCourseSelection(c._id)}
                    className="rounded text-[var(--brand-primary)]"
                  />
                  <span>{c.name}</span>
                </label>
              ))}
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
    </div>
  );
};

export default StudentsManagement;