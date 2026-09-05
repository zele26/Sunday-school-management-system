'use client';

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Download, Search, Trash2, Edit } from 'lucide-react';
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
  useTeachersAdmin,
  useDeleteTeacher,
  useBulkDeleteTeachers,
} from '../../hooks/queries/useTeachers';

const TeachersManagement = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  // Query
  const { data, isLoading } = useTeachersAdmin({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    status: statusFilter,
  });

  // Mutations
  const deleteTeacherMutation = useDeleteTeacher();
  const bulkDeleteMutation = useBulkDeleteTeachers();

  const teachers = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data.teachers)) return data.teachers;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.users)) return data.users;
    return [];
  }, [data]);

  const totalPages = data?.totalPages || 1;
  const totalTeachers = data?.total ?? teachers.length;

  const stats = useMemo(() => {
    return {
      total: totalTeachers,
      active: teachers.filter((t) => t && t.isActive !== false && t.status !== 'inactive').length,
      inactive: teachers.filter((t) => t && (t.isActive === false || t.status === 'inactive')).length,
      subjects: new Set(teachers.map((t) => t?.subject).filter(Boolean)).size,
    };
  }, [teachers, totalTeachers]);

  const selectedTeacherIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]);
  }, [rowSelection]);

  const handleDeleteSelected = () => {
    if (selectedTeacherIds.length === 0) return;
    if (!confirm(`Delete ${selectedTeacherIds.length} teacher(s)?`)) return;
    bulkDeleteMutation.mutate(selectedTeacherIds, {
      onSuccess: () => setRowSelection({}),
    });
  };

  const handleDownload = () => {
    const token = useAuthStore.getState().accessToken;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter) params.append('status', statusFilter);
    if (token) params.append('token', token);
    window.open(`${API_BASE_URL}/api/admin/teachers/export?${params.toString()}`, '_blank');
  };

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
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Teacher Name" />,
        cell: ({ row }) => {
          const t = row.original;
          const name = t.fullName || t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Unknown';
          return <span className="font-bold text-slate-900 dark:text-white">{name}</span>;
        },
      },
      {
        accessorKey: 'contact',
        header: 'Email / Phone',
        cell: ({ row }) => {
          const t = row.original;
          return <span className="text-slate-600 dark:text-slate-300">{t.email || t.phone || '—'}</span>;
        },
      },
      {
        accessorKey: 'subject',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Subject" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'General'}</Badge>,
      },
      {
        accessorKey: 'coursesTaught',
        header: 'የሚያስተምሯቸው ኮርሶች (Courses)',
        cell: ({ row }) => {
          const courses = row.original.coursesTaught;
          if (!courses || !Array.isArray(courses) || courses.length === 0) {
            return <span className="text-xs text-slate-400 italic">ያልተመደበ</span>;
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {courses.map((c, idx) => (
                <Badge key={idx} variant="gold" size="sm" className="truncate max-w-[140px]">
                  {c}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
          const t = row.original;
          const isActive = t.isActive !== false && t.status !== 'inactive';
          return (
            <Badge variant={isActive ? 'approved' : 'neutral'} size="sm">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const t = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link
                to={`/admin/edit-teacher/${t._id}`}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[var(--brand-primary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  if (confirm('ይህን መምህር መሰረዝ እርግጠኛ ነዎት?')) {
                    deleteTeacherMutation.mutate(t._id);
                  }
                }}
                disabled={deleteTeacherMutation.isPending}
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
    [deleteTeacherMutation]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የመምህራን አስተዳደር (Teacher Management)"
        subtitle="መምህራንን ያስተዳድሩ፣ ኮርሶችን ይመድቡ እና አጠቃላይ መረጃዎችን ይከታተሉ"
        icon={Users}
        badge={<Badge variant="gold" size="sm">{stats.total} መምህራን</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </Button>
            <Link to="/admin/add-teacher">
              <Button variant="primary" size="sm" className="gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ አዲስ መምህር</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Teachers</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </Card>
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats.active}</p>
        </Card>
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl sm:text-3xl font-black text-slate-500 mt-1">{stats.inactive}</p>
        </Card>
        <Card variant="elevated" padding="md">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Subjects</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats.subjects}</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="በስም፣ በኢሜይል ወይም በኮርስ ይፈልጉ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <option value="">All Status (ሁሉም)</option>
            <option value="active">Active (ንቁ)</option>
            <option value="inactive">Inactive (የማይሳተፍ)</option>
          </Select>
        </div>
        {selectedTeacherIds.length > 0 && (
          <Button
            variant="danger"
            size="md"
            onClick={handleDeleteSelected}
            disabled={bulkDeleteMutation.isPending}
            className="gap-1.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{bulkDeleteMutation.isPending ? 'በመሰረዝ ላይ...' : `ሰርዝ (${selectedTeacherIds.length})`}</span>
          </Button>
        )}
      </div>

      {/* Teachers DataTable */}
      <DataTable
        columns={columns}
        data={teachers}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        isLoading={isLoading}
        totalItemsCount={totalTeachers}
        emptyMessage="ምንም መምህር አልተገኘም (No teachers found)"
        emptyIcon={Users}
      />
    </div>
  );
};

export default TeachersManagement;