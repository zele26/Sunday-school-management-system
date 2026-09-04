'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Building2,
  GraduationCap,
  Clock,
  Check,
  X,
  Trash2,
  Edit,
  History,
  Phone,
  MapPin,
  Sparkles,
  Crown,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  Select,
  DataTable,
  DataTableColumnHeader,
  IndeterminateCheckbox,
} from '../../components/ui';
import {
  useUsers,
  useUserJourney,
  useUpdateUser,
  useApproveUser,
  useRejectUser,
  useDeleteUser,
  useBulkApproveUsers,
  useBulkRejectUsers,
  useBulkDeleteUsers,
} from '../../hooks/queries/useUsers';
import { useDepartments } from '../../hooks/queries/useDepartments';
import { userEditModalSchema } from '../../schemas';

const UsersManagement = () => {
  // Query parameters & pagination
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
  } = useForm({
    resolver: zodResolver(userEditModalSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: '',
      departmentId: '',
      status: 'approved',
      gender: '',
      city: '',
      notes: '',
    },
  });

  const openEditModal = (u) => {
    setEditingUser(u);
    resetEditForm({
      fullName: u.fullName || u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'member',
      departmentId: u.department?._id || u.departmentId || '',
      status: u.status || 'approved',
      gender: u.gender || '',
      city: u.city || '',
      notes: '',
    });
    setShowEditModal(true);
  };

  const onSaveEdit = (data) => {
    if (!editingUser) return;
    updateUserMutation.mutate(
      { id: editingUser._id, payload: data },
      { onSuccess: () => setShowEditModal(false) }
    );
  };

  // Journey Modal State
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [selectedJourneyUser, setSelectedJourneyUser] = useState(null);

  // Queries
  const { data, isLoading } = useUsers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
    role: roleFilter,
    status: statusFilter,
    departmentId: deptFilter,
  });

  const { data: departments = [] } = useDepartments();
  const { data: journeyData, isLoading: journeyLoading } = useUserJourney(
    selectedJourneyUser?._id,
    showJourneyModal
  );

  // Mutations
  const updateUserMutation = useUpdateUser();
  const approveUserMutation = useApproveUser();
  const rejectUserMutation = useRejectUser();
  const deleteUserMutation = useDeleteUser();
  const bulkApproveMutation = useBulkApproveUsers();
  const bulkRejectMutation = useBulkRejectUsers();
  const bulkDeleteMutation = useBulkDeleteUsers();

  const users = data?.users || data || [];
  const totalPages = data?.totalPages || 1;
  const totalUsers = data?.total || users.length;

  const stats = useMemo(() => {
    if (data?.stats) return data.stats;
    return {
      total: totalUsers,
      superadmin: users.filter((u) => u.role === 'superadmin').length,
      department_admin: users.filter((u) => u.role === 'department_admin').length,
      admin: users.filter((u) => u.role === 'admin').length,
      teacher: users.filter((u) => u.role === 'teacher').length,
      student: users.filter((u) => u.role === 'student').length,
      member: users.filter((u) => u.role === 'member').length,
      pending: users.filter((u) => u.status === 'pending').length,
      approved: users.filter((u) => u.status === 'approved' || u.status === 'active').length,
    };
  }, [data, users, totalUsers]);

  const selectedUserIds = useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]);
  }, [rowSelection]);

  // Bulk Handlers
  const handleBulkApprove = () => {
    if (!confirm(`Approve ${selectedUserIds.length} users?`)) return;
    bulkApproveMutation.mutate(selectedUserIds, {
      onSuccess: () => setRowSelection({}),
    });
  };

  const handleBulkReject = () => {
    if (!confirm(`Reject ${selectedUserIds.length} users?`)) return;
    bulkRejectMutation.mutate(selectedUserIds, {
      onSuccess: () => setRowSelection({}),
    });
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedUserIds.length} users?`)) return;
    bulkDeleteMutation.mutate(selectedUserIds, {
      onSuccess: () => setRowSelection({}),
    });
  };


  const openJourneyModal = (user) => {
    setSelectedJourneyUser(user);
    setShowJourneyModal(true);
  };

  const getRoleVariant = (role) => {
    switch (role) {
      case 'superadmin':
        return 'gold';
      case 'department_admin':
        return 'info';
      case 'admin':
        return 'primary';
      case 'teacher':
        return 'warning';
      case 'student':
        return 'info';
      case 'member':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  // TanStack Columns Definition
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{row.original.fullName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {row.original.email || 'No email'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getRoleVariant(row.original.role)} size="sm">
              {row.original.role === 'superadmin' && '👑 '}
              {row.original.role === 'department_admin' && '🏛️ '}
              {row.original.role}
            </Badge>
            {row.original.roles && row.original.roles.length > 1 && (
              <Badge variant="neutral" size="xs" className="font-mono">
                +{row.original.roles.length - 1}
              </Badge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => {
          const dept = row.original.departmentId;
          return dept ? (
            <span className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700">
              {dept.name || dept}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Church-wide</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => <Badge variant={getStatusVariant(getValue())} size="sm">{getValue()}</Badge>,
      },
      {
        accessorKey: 'contact',
        header: 'Contact',
        cell: ({ row }) => (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <div>{row.original.phone || '—'}</div>
            <div>{row.original.city || ''}</div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
              <Button
                size="xs"
                variant="gold"
                onClick={() => openJourneyModal(u)}
                title="View full timeline journey & preserved profiles"
              >
                <History className="w-3.5 h-3.5 mr-1" /> Journey
              </Button>

              {u.status === 'pending' && (
                <>
                  <Button
                    size="xs"
                    variant="success"
                    onClick={() => {
                      if (confirm('Approve this user?')) approveUserMutation.mutate(u._id);
                    }}
                    disabled={approveUserMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => {
                      if (confirm('Reject this user?')) rejectUserMutation.mutate(u._id);
                    }}
                    disabled={rejectUserMutation.isPending}
                  >
                    Reject
                  </Button>
                </>
              )}
              <Button size="xs" variant="secondary" onClick={() => openEditModal(u)}>
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  if (confirm('Delete this user?')) deleteUserMutation.mutate(u._id);
                }}
                disabled={deleteUserMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              </Button>
            </div>
          );
        },
      },
    ],
    [approveUserMutation, rejectUserMutation, deleteUserMutation]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Management (የአባላትና የአስተዳደር አስተዳደር)"
        subtitle="Manage user accounts, assign Super Admin & Department Admin roles, and preserve lifetime member progression history."
        icon={Users}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-amber-500/30 bg-amber-500/5">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" /> Super Admins
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.superadmin || stats.admin}
          </p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-indigo-500/30 bg-indigo-500/5">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> Dept Admins
          </span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.department_admin}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-orange-500/30 bg-orange-500/5">
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> Teachers
          </span>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{stats.teacher}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-blue-500/30 bg-blue-500/5">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Students
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.student}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-yellow-500/30 bg-yellow-500/5">
          <span className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
          <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <Card variant="default" padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Input
              label="Search"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
              icon={Search}
            />
          </div>
          <div>
            <Select
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <option value="">All Roles</option>
              <option value="superadmin">👑 Super Admin</option>
              <option value="department_admin">🏛️ Department Admin</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="member">Church Member</option>
            </Select>
          </div>
          <div>
            <Select
              label="Filter by Department"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <option value="">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Action Controls */}
      {selectedUserIds.length > 0 && (
        <Card variant="elevated" padding="sm" className="bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 flex items-center justify-between flex-wrap gap-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {selectedUserIds.length} user(s) selected:
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="success"
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Approve Selected
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkReject}
              disabled={bulkRejectMutation.isPending}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reject Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Selected
            </Button>
          </div>
        </Card>
      )}

      {/* TanStack Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        isLoading={isLoading}
        totalItemsCount={totalUsers}
        emptyMessage="ምንም ተጠቃሚ አልተገኘም (No users found matching the criteria)"
        emptyIcon={Users}
      />

      {/* Member Journey & Lifetime Progression Modal */}
      {showJourneyModal && selectedJourneyUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card variant="default" padding="none" className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[var(--brand-primary)] to-indigo-950 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl">
                  📜
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {selectedJourneyUser.fullName} — የአባል ጉዞ (Member Journey)
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    የአባሉ ታሪክና የዕድገት ሂደት (Preserved Lifetime Progression)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJourneyModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900">
              {journeyLoading ? (
                <div className="py-16 text-center text-slate-400">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium">የአባሉን ታሪክ በመጫን ላይ...</p>
                </div>
              ) : journeyData ? (
                <div className="space-y-6">
                  {/* Current Active Badges */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        ወቅታዊ ደረጃ (Current Active Role)
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getRoleVariant(journeyData.user?.role)}>
                          {journeyData.user?.role}
                        </Badge>
                        <Badge variant={getStatusVariant(journeyData.user?.status)}>
                          {journeyData.user?.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        የተመደበበት ክፍል (Department)
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {journeyData.user?.departmentId?.name || 'Church-wide / All'}
                      </p>
                    </div>
                  </div>

                  {/* Chronological Role History Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <span>⏳ የደረጃዎች የጊዜ ሰሌዳ (Role Progression Timeline)</span>
                    </h4>

                    {journeyData.user?.roleHistory && journeyData.user.roleHistory.length > 0 ? (
                      <div className="relative pl-6 border-l-2 border-amber-400 space-y-4 py-1">
                        {journeyData.user.roleHistory.map((item, idx) => (
                          <div key={idx} className="relative group">
                            <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 shadow-sm group-hover:scale-125 transition-transform" />
                            <div className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <Badge variant={getRoleVariant(item.role)} size="xs">
                                  {item.role}
                                </Badge>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {new Date(item.startDate).toLocaleDateString()}{' '}
                                  {item.endDate
                                    ? `— ${new Date(item.endDate).toLocaleDateString()}`
                                    : '— Present'}
                                </span>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium pt-0.5">
                                  {item.notes}
                                </p>
                              )}
                              {item.changedBy && (
                                <p className="text-[10px] text-slate-400">
                                  የመዘገበው: {item.changedBy.fullName || item.changedBy.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">
                        የተመዘገበ የታሪክ ማስታወሻ የለም።
                      </div>
                    )}
                  </div>

                  {/* Sub-Profiles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Student Record Card */}
                    <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <span>🎓 የተማሪነት መዝገብ</span>
                        </span>
                        <Badge variant={journeyData.student ? 'approved' : 'neutral'} size="xs">
                          {journeyData.student ? 'ተገኝቷል (Preserved)' : 'የለም'}
                        </Badge>
                      </div>
                      {journeyData.student ? (
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                          <p>
                            <span className="font-semibold">የተማሪ መለያ: </span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              {journeyData.student.studentId || 'TKD-STU'}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">ዓይነት: </span>
                            {journeyData.student.studentType || 'regular'}
                          </p>
                          <p>
                            <span className="font-semibold">ደረጃ/ባች: </span>
                            {journeyData.student.batch || journeyData.student.grade || '—'}
                          </p>
                          {journeyData.student.courses?.length > 0 && (
                            <p>
                              <span className="font-semibold">የተመዘገቡ ኮርሶች: </span>
                              {journeyData.student.courses.length} ኮርሶች
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">የተማሪነት መዝገብ አልተገኘም።</p>
                      )}
                    </div>

                    {/* Teacher Record Card */}
                    <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <span>👨‍🏫 የመምህርነት መዝገብ</span>
                        </span>
                        <Badge variant={journeyData.teacher ? 'approved' : 'neutral'} size="xs">
                          {journeyData.teacher ? 'ተገኝቷል (Preserved)' : 'የለም'}
                        </Badge>
                      </div>
                      {journeyData.teacher ? (
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                          <p>
                            <span className="font-semibold">የመምህር መለያ: </span>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              {journeyData.teacher.teacherId}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">ሁኔታ: </span>
                            {journeyData.teacher.status}
                          </p>
                          <p>
                            <span className="font-semibold">ምዝገባ ቀን: </span>
                            {new Date(
                              journeyData.teacher.registrationDate || journeyData.teacher.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">የመምህርነት መዝገብ አልተገኘም።</p>
                      )}
                    </div>
                  </div>

                  {/* Department Service History */}
                  {journeyData.memberships && journeyData.memberships.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> የአገልግሎት ክፍሎች (Department Memberships)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {journeyData.memberships.map((m) => (
                          <div
                            key={m._id}
                            className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-center justify-between"
                          >
                            <span className="font-bold text-slate-900 dark:text-white">
                              {m.departmentId?.name}
                            </span>
                            <Badge variant="neutral" size="xs">{m.role || 'Member'}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-right">
              <Button variant="outline" size="sm" onClick={() => setShowJourneyModal(false)}>
                ዝጋ (Close)
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card variant="default" padding="none" className="max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-6 bg-gradient-to-r from-[var(--brand-primary)] to-indigo-950 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">Edit User & Role (አባልና ሚና አሻሽል)</h3>
                <p className="text-xs text-blue-200">የአባሉን ሚና ሲቀይሩ ታሪኩና መረጃው አይጠፋም</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit(onSaveEdit)}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <Input
                    {...editRegister('fullName')}
                    icon={Users}
                    error={editErrors.fullName?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role (ሚና) *</label>
                    <Select {...editRegister('role')}>
                      <option value="superadmin">👑 Super Admin (Full Access)</option>
                      <option value="department_admin">🏛️ Department Admin</option>
                      <option value="admin">Admin</option>
                      <option value="teacher">👨‍🏫 Teacher</option>
                      <option value="student">🎓 Student</option>
                      <option value="member">Church Member</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Department</label>
                    <Select {...editRegister('departmentId')}>
                      <option value="">Church-wide / All</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason / Promotion Note (የለውጡ ምክንያት / ማስታወሻ)</label>
                  <Input
                    {...editRegister('notes')}
                    placeholder="e.g. ተማሪነቱን ጨርሶ ወደ መምህርነት ተዛውሯል (Graduated Batch 4)"
                    icon={Sparkles}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                    <Input
                      {...editRegister('phone')}
                      icon={Phone}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <Select {...editRegister('status')}>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="active">Active</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                    <Select {...editRegister('gender')}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                    <Input
                      {...editRegister('city')}
                      icon={MapPin}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={updateUserMutation.isPending || editSubmitting}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;