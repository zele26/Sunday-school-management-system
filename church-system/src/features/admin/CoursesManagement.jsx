'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useCoursesAdmin,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from '../../hooks/queries/useCourses';
import { useTeachers } from '../../hooks/queries/useTeachers';
import { courseModalSchema } from '../../schemas';

const CoursesManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [studentTypeFilter, setStudentTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [conflictError, setConflictError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(courseModalSchema),
    defaultValues: {
      name: '',
      studentType: 'regular',
      grade: 'Grade 7',
      bibleTheme: '',
      teacher: '',
      dayOfWeek: 'እሑድ',
      startTime: '08:30',
      endTime: '10:00',
      shift: 'የቀን',
      numberOfLessons: 12,
      lessonDuration: 60,
    },
  });

  // Queries & Mutations
  const { data: courses = [], isLoading } = useCoursesAdmin({
    search,
    status: statusFilter,
    studentType: studentTypeFilter,
  });

  const { data: teachers = [] } = useTeachers();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setConflictError(null);
    reset({
      name: '',
      studentType: 'regular',
      grade: 'Grade 7',
      bibleTheme: '',
      teacher: '',
      dayOfWeek: 'እሑድ',
      startTime: '08:30',
      endTime: '10:00',
      shift: 'የቀን',
      numberOfLessons: 12,
      lessonDuration: 60,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setConflictError(null);
    reset({
      name: c.name || '',
      studentType: c.studentType || 'regular',
      grade: c.grade || 'Grade 7',
      bibleTheme: c.bibleTheme || '',
      teacher: c.teacher?._id || c.teacher || '',
      dayOfWeek: c.dayOfWeek || 'እሑድ',
      startTime: c.startTime || '08:30',
      endTime: c.endTime || '10:00',
      shift: c.shift || 'የቀን',
      numberOfLessons: c.numberOfLessons || 12,
      lessonDuration: c.lessonDuration || 60,
    });
    setShowModal(true);
  };

  const onSubmit = (data) => {
    setConflictError(null);
    if (editingCourse) {
      updateMutation.mutate(
        { id: editingCourse._id, payload: data },
        {
          onSuccess: () => setShowModal(false),
          onError: (err) => {
            if (err.message) setConflictError(err.message);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setShowModal(false),
        onError: (err) => {
          if (err.message) setConflictError(err.message);
        },
      });
    }
  };

  const handleDelete = (id) => {
    if (!confirm('ይህን ኮርስ መሰረዝ እርግጠኛ ነዎት?')) return;
    deleteMutation.mutate(id);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course Name" />,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
              {c.bibleTheme && (
                <div className="text-xs text-[var(--brand-primary)] dark:text-blue-400 font-medium">
                  📖 {c.bibleTheme}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade / Level" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'Youth'}</Badge>,
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
        cell: ({ row }) => {
          const t = row.original.teacher;
          return (
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t?.fullName || t?.name || <span className="text-slate-400 italic">Unassigned</span>}
            </span>
          );
        },
      },
      {
        accessorKey: 'schedule',
        header: 'የክፍል ሰዓት (Schedule)',
        cell: ({ row }) => {
          const c = row.original;
          const scheduleText = c.schedule || (c.dayOfWeek && c.startTime ? `${c.dayOfWeek} ${c.startTime}-${c.endTime}` : null);
          return (
            <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              {scheduleText || '—'}
            </span>
          );
        },
      },
      {
        accessorKey: 'numberOfLessons',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lessons" />,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <span className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 opacity-60" /> {c.numberOfLessons || 12} ({c.lessonDuration || 60}m)
            </span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'Active' ? 'approved' : 'neutral'} size="sm">
            {getValue() || 'Active'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[var(--brand-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                disabled={deleteMutation.isPending}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [deleteMutation]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የትምህርቶች ማዕከል (Courses Management)"
        subtitle="የሰንበት ትምህርት ቤት ኮርሶችን፣ የሰዓት መርሃ-ግብር እና መምህራንን ያስተዳድሩ"
        icon={BookOpen}
        badge={<Badge variant="gold" size="sm">{courses.length} ኮርሶች</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-[var(--brand-primary)]' : 'text-slate-400'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-xs text-[var(--brand-primary)]' : 'text-slate-400'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              <span>+ አዲስ ኮርስ ፍጠር</span>
            </Button>
          </div>
        }
      />

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="በኮርስ ስም ይፈልጉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select value={studentTypeFilter} onChange={(e) => setStudentTypeFilter(e.target.value)}>
            <option value="">All Types (ሁሉም)</option>
            <option value="regular">መደበኛ (Regular)</option>
            <option value="distance">የርቀት (Distance)</option>
          </Select>
        </div>
        <div className="w-full sm:w-40">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </div>
      </div>

      {/* View Switching */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={courses}
          isLoading={isLoading}
          emptyMessage="ምንም ኮርስ አልተገኘም (No courses found)"
          emptyIcon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card
              key={c._id}
              variant="default"
              padding="md"
              className="hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant={c.studentType === 'distance' ? 'gold' : 'approved'} size="sm">
                    {c.studentType || 'regular'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1 rounded-lg text-slate-400 hover:text-[var(--brand-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {c.name}
                </h3>
                {c.bibleTheme && (
                  <p className="text-xs text-[var(--brand-primary)] dark:text-blue-400 font-semibold mt-1">
                    📖 {c.bibleTheme}
                  </p>
                )}
                {c.schedule && (
                  <div className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
                    <span>{c.schedule}</span>
                  </div>
                )}
                {c.teacher && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                    መምህር: {c.teacher?.fullName || c.teacher?.name || 'የተመደበ'}
                  </p>
                )}
                {c.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {c.numberOfLessons || 12} ትምህርቶች
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {c.grade || c.ageGroup || 'Youth'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Course Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <Card
            variant="default"
            padding="lg"
            className="max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCourse ? 'ኮርስ አሻሽል (Edit Course)' : 'አዲስ ኮርስ ፍጠር (New Course)'}
            </h3>

            {conflictError && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-bold text-sm">የሰዓት መደራረብ ተገኝቷል (Schedule Conflict)</p>
                  <p className="mt-0.5 leading-relaxed">{conflictError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  የኮርስ ስም *
                </label>
                <Input
                  {...register('name')}
                  placeholder="e.g. ነገረ ድኅነት"
                  error={errors.name?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    የምዝገባ ዓይነት
                  </label>
                  <Select {...register('studentType')}>
                    <option value="regular">መደበኛ (Regular)</option>
                    <option value="distance">የርቀት (Distance)</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    ደረጃ (Grade)
                  </label>
                  <Select {...register('grade')}>
                    {[7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={`Grade ${g}`}>
                        Grade {g}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  የመጽሐፍ ቅዱስ ጭብጥ (Bible Theme)
                </label>
                <Input
                  {...register('bibleTheme')}
                  placeholder="e.g. ዮሐንስ ፫፥፲፮"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  መምህር ምረጥ (Select Teacher)
                </label>
                <Select {...register('teacher')}>
                  <option value="">መምህር ይምረጡ (Unassigned)</option>
                  {teachers.map((t) => {
                    const teacherValue = t.userId?._id || t.userId || t._id;
                    return (
                      <option key={t._id} value={teacherValue}>
                        {t.fullName || t.name}
                      </option>
                    );
                  })}
                </Select>
              </div>

              {/* Schedule Details */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--brand-primary)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    የክፍል መርሃ-ግብር (Schedule & Timeslot)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">የሳምንቱ ቀን (Day)</label>
                    <Select {...register('dayOfWeek')}>
                      <option value="እሑድ">እሑድ (Sunday)</option>
                      <option value="ቅዳሜ">ቅዳሜ (Saturday)</option>
                      <option value="ሰኞ">ሰኞ (Monday)</option>
                      <option value="ማክሰኞ">ማክሰኞ (Tuesday)</option>
                      <option value="ረቡዕ">ረቡዕ (Wednesday)</option>
                      <option value="ሐሙስ">ሐሙስ (Thursday)</option>
                      <option value="ዓርብ">ዓርብ (Friday)</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ፈረቃ (Shift)</label>
                    <Select {...register('shift')}>
                      <option value="የቀን">የቀን (Weekend / Day)</option>
                      <option value="የማታ">የማታ (Night / Weekday)</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">የመጀመሪያ ሰዓት (Start Time)</label>
                    <Input {...register('startTime')} placeholder="08:30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">የማብቂያ ሰዓት (End Time)</label>
                    <Input {...register('endTime')} placeholder="10:00" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    የትምህርት ብዛት
                  </label>
                  <Input
                    type="number"
                    {...register('numberOfLessons')}
                    error={errors.numberOfLessons?.message}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    ቆይታ (ደቂቃ)
                  </label>
                  <Input
                    type="number"
                    {...register('lessonDuration')}
                    error={errors.lessonDuration?.message}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  ሰርዝ
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || isSubmitting}
                >
                  {editingCourse ? 'አሻሽል' : 'ፍጠር'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;