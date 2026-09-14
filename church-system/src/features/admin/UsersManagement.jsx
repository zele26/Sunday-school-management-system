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
  UserPlus,
  ShieldCheck,
  Key,
  Mail,
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
  useCreateUser,
  useUpdateUser,
  useApproveUser,
  useRejectUser,
  useDeleteUser,
  useBulkApproveUsers,
  useBulkRejectUsers,
  useBulkDeleteUsers,
} from '../../hooks/queries/useUsers';
import { useDepartments } from '../../hooks/queries/useDepartments';
import { userEditModalSchema, userCreateModalSchema } from '../../schemas';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { PermissionSelector } from '../../components/admin/PermissionSelector';
import { useLanguage } from '../../hooks/useLanguage';

const UsersManagement = () => {
  const { t, isAmharic } = useLanguage();

  // Query parameters & pagination
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPermissions, setCreatePermissions] = useState(['attendance:scan', 'attendance:view']);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);

  // Create Form
  const {
    register: createRegister,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    setValue: setCreateValue,
    watch: watchCreate,
    formState: { errors: createErrors, isSubmitting: createSubmitting },
  } = useForm({
    resolver: zodResolver(userCreateModalSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      departmentId: '',
      status: 'approved',
      gender: '',
      city: '',
      notes: '',
    },
  });

  const createRole = watchCreate('role');

  // Edit Form
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    setValue: setEditValue,
    watch: watchEdit,
    formState: { errors: editErrors, isSubmitting: editSubmitting },
  } = useForm({
    resolver: zodResolver(userEditModalSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: '',
      departmentId: '',
      status: 'approved',
      gender: '',
      city: '',
      notes: '',
    },
  });

  const editRole = watchEdit('role');

  const openCreateModal = () => {
    resetCreateForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      departmentId: '',
      status: 'approved',
      gender: '',
      city: '',
      notes: '',
    });
    setCreatePermissions(['attendance:scan', 'attendance:view']);
    setShowCreateModal(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    resetEditForm({
      fullName: u.fullName || u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'member',
      departmentId: u.department?._id || u.departmentId || '',
      status: u.status || 'approved',
      gender: u.gender || '',
      city: u.city || '',
      notes: '',
    });
    setEditPermissions(Array.isArray(u.permissions) ? u.permissions : []);
    setShowEditModal(true);
  };

  const onSaveCreate = (data) => {
    createUserMutation.mutate(
      {
        ...data,
        permissions: createPermissions,
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          resetCreateForm();
        },
      }
    );
  };

  const onSaveEdit = (data) => {
    if (!editingUser) return;
    updateUserMutation.mutate(
      {
        id: editingUser._id,
        payload: {
          ...data,
          permissions: editPermissions,
        },
      },
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
  const createUserMutation = useCreateUser();
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
      staff: users.filter((u) => u.role === 'staff').length,
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
    if (!confirm(isAmharic ? `${selectedUserIds.length} ተጠቃሚዎችን ማጽደቅ ይፈልጋሉ?` : `Approve ${selectedUserIds.length} users?`)) return;
    bulkApproveMutation.mutate(selectedUserIds, {
      onSuccess: () => setRowSelection({}),
    });
  };

  const handleBulkReject = () => {
    if (!confirm(isAmharic ? `${selectedUserIds.length} ተጠቃሚዎችን ውድቅ ማድረግ ይፈልጋሉ?` : `Reject ${selectedUserIds.length} users?`)) return;
    bulkRejectMutation.mutate(selectedUserIds, {
      onSuccess: () => setRowSelection({}),
    });
  };

  const handleBulkDelete = () => {
    if (!confirm(isAmharic ? `${selectedUserIds.length} ተጠቃሚዎችን መሰረዝ ይፈልጋሉ?` : `Delete ${selectedUserIds.length} users?`)) return;
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
      case 'staff':
        return 'warning';
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
        header: ({ column }) => <DataTableColumnHeader column={column} title={isAmharic ? 'ተጠቃሚ' : 'User'} />,
        cell: ({ row }) => (
          <div>
            <div className="font-bold text-slate-900 dark:text-white">{row.original.fullName}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {row.original.email || 'ኢሜይል የለም'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title={isAmharic ? 'ሚና' : 'Role'} />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant={getRoleVariant(row.original.role)} size="sm">
              {row.original.role === 'superadmin' && '👑 '}
              {row.original.role === 'department_admin' && '🏛️ '}
              {row.original.role === 'staff' && '🛡️ '}
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
        id: 'permissions',
        header: isAmharic ? 'የተፈቀዱ ተግባራት' : 'Permissions',
        cell: ({ row }) => {
          const u = row.original;
          if (u.role === 'superadmin' || u.role === 'admin') {
            return (
              <Badge variant="gold" size="xs">
                👑 {isAmharic ? 'ሙሉ ፈቃድ' : 'Universal'}
              </Badge>
            );
          }
          const perms = Array.isArray(u.permissions) ? u.permissions : [];
          if (perms.length === 0) {
            return <span className="text-xs text-slate-400 italic">{isAmharic ? 'መደበኛ' : 'Standard'}</span>;
          }
          return (
            <Badge variant="info" size="xs" className="font-medium">
              🛡️ {perms.length} {isAmharic ? 'ተግባራት' : 'Tasks'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'department',
        header: isAmharic ? 'ክፍል' : 'Department',
        cell: ({ row }) => {
          const dept = row.original.departmentId;
          return dept ? (
            <span className="px-2.5 py-0.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-700">
              {dept.name || dept}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">{isAmharic ? 'ጠቅላላ ቤተክርስቲያን' : 'General'}</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title={isAmharic ? 'ሁኔታ' : 'Status'} />,
        cell: ({ getValue }) => <Badge variant={getStatusVariant(getValue())} size="sm">{getValue()}</Badge>,
      },
      {
        accessorKey: 'contact',
        header: isAmharic ? 'አድራሻ' : 'Contact',
        cell: ({ row }) => (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <div>{row.original.phone || '—'}</div>
            <div>{row.original.city || ''}</div>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">{isAmharic ? 'ተግባራት' : 'Actions'}</div>,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
              <Button
                size="xs"
                variant="gold"
                onClick={() => openJourneyModal(u)}
                title={isAmharic ? 'የአባሉን ሙሉ ጉዞና መዝገብ ይመልከቱ' : 'View member journey profile'}
              >
                <History className="w-3.5 h-3.5 mr-1" /> {isAmharic ? 'የአባል ጉዞ' : 'Journey'}
              </Button>

              {u.status === 'pending' && (
                <>
                  <Button
                    size="xs"
                    variant="success"
                    onClick={() => {
                      if (confirm(isAmharic ? 'ይህን ተጠቃሚ ማጽደቅ ይፈልጋሉ?' : 'Approve this user?')) approveUserMutation.mutate(u._id);
                    }}
                    disabled={approveUserMutation.isPending}
                  >
                    {isAmharic ? 'አጽድቅ' : 'Approve'}
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => {
                      if (confirm(isAmharic ? 'ይህን ተጠቃሚ ውድቅ ማድረግ ይፈልጋሉ?' : 'Reject this user?')) rejectUserMutation.mutate(u._id);
                    }}
                    disabled={rejectUserMutation.isPending}
                  >
                    {isAmharic ? 'ውድቅ አድርግ' : 'Reject'}
                  </Button>
                </>
              )}
              <Button size="xs" variant="secondary" onClick={() => openEditModal(u)}>
                <Edit className="w-3.5 h-3.5 mr-1" /> {isAmharic ? 'አርም' : 'Edit'}
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  if (confirm(isAmharic ? 'ይህን ተጠቃሚ መሰረዝ ይፈልጋሉ?' : 'Delete this user?')) deleteUserMutation.mutate(u._id);
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
    [approveUserMutation, rejectUserMutation, deleteUserMutation, isAmharic]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={isAmharic ? 'የተጠቃሚዎችና የሚና አስተዳደር' : 'User Accounts & Roles Management'}
          subtitle={
            isAmharic
              ? 'የተጠቃሚ መለያዎችን ያስተዳድሩ፣ የአስተዳዳሪ እና የክፍል ኃላፊ ሚናዎችን ይመድቡ፣ የአባላትን ታሪክ ይከታተሉ'
              : 'Manage user accounts, assign delegated task permissions, and monitor member progression'
          }
          icon={Users}
        />

        {/* Create User Button */}
        <Button
          variant="primary"
          onClick={openCreateModal}
          className="gap-2 shadow-md hover:shadow-lg shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAmharic ? 'አዲስ ተጠቃሚ ፍጠር' : 'Create User'}</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isAmharic ? 'አጠቃላይ ተጠቃሚዎች' : 'Total Users'}
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-amber-500/30 bg-amber-500/5">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Crown className="w-3.5 h-3.5" /> {isAmharic ? 'ዋና አስተዳዳሪዎች' : 'Admins'}
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.superadmin || stats.admin}
          </p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-indigo-500/30 bg-indigo-500/5">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> {isAmharic ? 'የክፍል ኃላፊዎች' : 'Dept Heads'}
          </span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{stats.department_admin}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-orange-500/30 bg-orange-500/5">
          <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> {isAmharic ? 'መምህራን' : 'Teachers'}
          </span>
          <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{stats.teacher}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-blue-500/30 bg-blue-500/5">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {isAmharic ? 'ተማሪዎች' : 'Students'}
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.student}</p>
        </Card>
        <Card variant="elevated" padding="sm" className="flex flex-col justify-center border-yellow-500/30 bg-yellow-500/5">
          <span className="text-[11px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {isAmharic ? 'በመጠባበቅ ላይ' : 'Pending'}
          </span>
          <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400 mt-1">{stats.pending}</p>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <Card variant="default" padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Input
              label={isAmharic ? 'ፈልግ' : 'Search'}
              placeholder={isAmharic ? 'በስም፣ በኢሜይል ወይም በስልክ ይፈልጉ...' : 'Search by name, email or phone...'}
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
              label={isAmharic ? 'በሚና ለይ' : 'Filter by Role'}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <option value="">{isAmharic ? 'ሁሉም ሚናዎች' : 'All Roles'}</option>
              <option value="superadmin">👑 {isAmharic ? 'ዋና አስተዳዳሪ' : 'Super Admin'}</option>
              <option value="department_admin">🏛️ {isAmharic ? 'የክፍል አስተዳዳሪ' : 'Dept Admin'}</option>
              <option value="admin">{isAmharic ? 'አስተዳዳሪ' : 'Admin'}</option>
              <option value="staff">🛡️ {isAmharic ? 'ሰራተኛ / ተወካይ' : 'Staff'}</option>
              <option value="teacher">{isAmharic ? 'መምህር' : 'Teacher'}</option>
              <option value="student">{isAmharic ? 'ተማሪ' : 'Student'}</option>
              <option value="member">{isAmharic ? 'የሰንበት ት/ቤት አባል' : 'Member'}</option>
            </Select>
          </div>
          <div>
            <Select
              label={isAmharic ? 'በክፍል ለይ' : 'Filter by Department'}
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <option value="">{isAmharic ? 'ሁሉም ክፍላት' : 'All Departments'}</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              label={isAmharic ? 'በሁኔታ ለይ' : 'Filter by Status'}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((p) => ({ ...p, pageIndex: 0 }));
              }}
            >
              <option value="">{isAmharic ? 'ሁሉም ሁኔታዎች' : 'All Statuses'}</option>
              <option value="approved">{isAmharic ? 'የጸደቀ' : 'Approved'}</option>
              <option value="active">{isAmharic ? 'ንቁ' : 'Active'}</option>
              <option value="pending">{isAmharic ? 'በመጠባበቅ ላይ' : 'Pending'}</option>
              <option value="rejected">{isAmharic ? 'ውድቅ የተደረገ' : 'Rejected'}</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Banner */}
      {selectedUserIds.length > 0 && (
        <div className="p-3 bg-[#1657b8]/10 border border-[#1657b8]/30 rounded-2xl flex items-center justify-between animate-in fade-in">
          <span className="text-xs font-bold text-[#1657b8] dark:text-blue-300">
            {selectedUserIds.length} {isAmharic ? 'ተጠቃሚዎች ተመርጠዋል' : 'users selected'}
          </span>
          <div className="flex gap-2">
            <Button size="xs" variant="success" onClick={handleBulkApprove}>
              <Check className="w-3.5 h-3.5 mr-1" /> {isAmharic ? 'በጅምላ አጽድቅ' : 'Bulk Approve'}
            </Button>
            <Button size="xs" variant="danger" onClick={handleBulkReject}>
              <X className="w-3.5 h-3.5 mr-1" /> {isAmharic ? 'በጅምላ ውድቅ አድርግ' : 'Bulk Reject'}
            </Button>
            <Button size="xs" variant="outline" onClick={handleBulkDelete}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> {isAmharic ? 'ሰርዝ' : 'Delete'}
            </Button>
          </div>
        </div>
      )}

      {/* TanStack Data Table */}
      <DataTable
        columns={columns}
        data={users}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        isLoading={isLoading}
      />

      {/* ======================================================== */}
      {/* 🌟 1. CREATE USER MODAL WITH PERMISSION SELECTOR         */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card variant="default" padding="none" className="max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-6 bg-gradient-to-r from-[#124796] to-indigo-950 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-amber-400" />
                  <span>{isAmharic ? 'አዲስ ተጠቃሚና የሥራ ፈቃድ መፍጠር' : 'Create New User & Permissions'}</span>
                </h3>
                <p className="text-xs text-blue-200">
                  {isAmharic
                    ? 'የተጠቃሚ መለያ ይፍጠሩ እና ሊያከናውኗቸው የሚፈቀዱትን ተግባራት ይምረጡ'
                    : 'Create account and assign specific delegated tasks'}
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit(onSaveCreate)}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900">
                {/* Basic User Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ሙሉ ስም *' : 'Full Name *'}
                    </label>
                    <Input
                      {...createRegister('fullName')}
                      placeholder={isAmharic ? 'ለምሳሌ፡ ዮሐንስ ተስፋዬ' : 'e.g. John Doe'}
                      icon={Users}
                      error={createErrors.fullName?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ስልክ ቁጥር *' : 'Phone Number *'}
                    </label>
                    <Input
                      {...createRegister('phone')}
                      placeholder="0911234567"
                      icon={Phone}
                      error={createErrors.phone?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ኢሜይል (አማራጭ)' : 'Email (Optional)'}
                    </label>
                    <Input
                      {...createRegister('email')}
                      placeholder="user@teklesawiros.org"
                      icon={Mail}
                      error={createErrors.email?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'የይለፍ ቃል * (ቢያንስ 6 ፊደላት)' : 'Password * (Min 6 chars)'}
                    </label>
                    <Input
                      {...createRegister('password')}
                      type="password"
                      placeholder="••••••••"
                      icon={Key}
                      error={createErrors.password?.message}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'የሥራ ሚና (Role) *' : 'Role *'}
                    </label>
                    <Select {...createRegister('role')}>
                      <option value="staff">🛡️ {isAmharic ? 'ሰራተኛ / ተወካይ (Staff)' : 'Staff (Delegated Tasks)'}</option>
                      <option value="admin">{isAmharic ? 'አስተዳዳሪ (Admin)' : 'Admin'}</option>
                      <option value="department_admin">🏛️ {isAmharic ? 'የክፍል አስተዳዳሪ (Dept Admin)' : 'Department Admin'}</option>
                      <option value="teacher">👨‍🏫 {isAmharic ? 'መምህር (Teacher)' : 'Teacher'}</option>
                      <option value="student">🎓 {isAmharic ? 'ተማሪ (Student)' : 'Student'}</option>
                      <option value="member">{isAmharic ? 'የሰንበት ት/ቤት አባል (Member)' : 'Member'}</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'የተመደበበት ክፍል' : 'Assigned Department'}
                    </label>
                    <Select {...createRegister('departmentId')}>
                      <option value="">{isAmharic ? 'ጠቅላላ ቤተክርስቲያን (General)' : 'General Church'}</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Granular Permission Selector */}
                <div className="pt-2">
                  <PermissionSelector
                    selectedPermissions={createPermissions}
                    onChange={setCreatePermissions}
                    currentRole={createRole}
                    onRoleChange={(r) => setCreateValue('role', r)}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateModal(false)}>
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={createUserMutation.isPending || createSubmitting}
                >
                  {createUserMutation.isPending ? (isAmharic ? 'በመፍጠር ላይ...' : 'Creating...') : (isAmharic ? 'ተጠቃሚውን ፍጠር' : 'Create User')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 2. EDIT USER MODAL WITH PERMISSION SELECTOR           */}
      {/* ======================================================== */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card variant="default" padding="none" className="max-w-2xl w-full overflow-hidden shadow-2xl">
            <div className="p-6 bg-gradient-to-r from-[var(--brand-primary)] to-indigo-950 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>{isAmharic ? 'ተጠቃሚና ፈቃዶች አሻሽል' : 'Edit User & Permissions'}</span>
                </h3>
                <p className="text-xs text-blue-200">
                  {isAmharic ? 'የአባሉን ሚናና የተፈቀዱ ተግባራት ሲቀይሩ ታሪኩና መረጃው አይጠፋም' : 'Update role, task permissions, and details'}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit(onSaveEdit)}>
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ሙሉ ስም *' : 'Full Name *'}
                    </label>
                    <Input
                      {...editRegister('fullName')}
                      icon={Users}
                      error={editErrors.fullName?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ስልክ ቁጥር' : 'Phone'}
                    </label>
                    <Input
                      {...editRegister('phone')}
                      icon={Phone}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ሚና *' : 'Role *'}
                    </label>
                    <Select {...editRegister('role')}>
                      <option value="superadmin">👑 {isAmharic ? 'ዋና አስተዳዳሪ' : 'Super Admin'}</option>
                      <option value="admin">{isAmharic ? 'አስተዳዳሪ' : 'Admin'}</option>
                      <option value="staff">🛡️ {isAmharic ? 'ሰራተኛ / ተወካይ (Staff)' : 'Staff'}</option>
                      <option value="department_admin">🏛️ {isAmharic ? 'የክፍል አስተዳዳሪ' : 'Dept Admin'}</option>
                      <option value="teacher">👨‍🏫 {isAmharic ? 'መምህር' : 'Teacher'}</option>
                      <option value="student">🎓 {isAmharic ? 'ተማሪ' : 'Student'}</option>
                      <option value="member">{isAmharic ? 'የሰንበት ት/ቤት አባል' : 'Member'}</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'የተመደበበት ክፍል' : 'Assigned Department'}
                    </label>
                    <Select {...editRegister('departmentId')}>
                      <option value="">{isAmharic ? 'ጠቅላላ ቤተክርስቲያን' : 'General'}</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'አዲስ የይለፍ ቃል (ከተፈለገ ብቻ)' : 'New Password (Optional)'}
                    </label>
                    <Input
                      {...editRegister('password')}
                      type="password"
                      placeholder={isAmharic ? 'ሳይቀየር እንዲቆይ ባዶ ይተዉ' : 'Leave blank to keep unchanged'}
                      icon={Key}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {isAmharic ? 'ሁኔታ' : 'Status'}
                    </label>
                    <Select {...editRegister('status')}>
                      <option value="approved">{isAmharic ? 'የጸደቀ' : 'Approved'}</option>
                      <option value="pending">{isAmharic ? 'በመጠባበቅ ላይ' : 'Pending'}</option>
                      <option value="rejected">{isAmharic ? 'ውድቅ የተደረገ' : 'Rejected'}</option>
                      <option value="active">{isAmharic ? 'ንቁ' : 'Active'}</option>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isAmharic ? 'የለውጡ ምክንያት / ማስታወሻ' : 'Notes / Change Reason'}
                  </label>
                  <Input
                    {...editRegister('notes')}
                    placeholder={isAmharic ? 'ለምሳሌ፡ የተማሪ መገኘት እንዲቆጣጠር ፈቃድ ተሰጥቶታል' : 'e.g. Granted attendance QR scanning task'}
                    icon={Sparkles}
                  />
                </div>

                {/* Granular Permission Selector */}
                <div className="pt-2">
                  <PermissionSelector
                    selectedPermissions={editPermissions}
                    onChange={setEditPermissions}
                    currentRole={editRole}
                    onRoleChange={(r) => setEditValue('role', r)}
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setShowEditModal(false)}>
                  {isAmharic ? 'ሰርዝ' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={updateUserMutation.isPending || editSubmitting}
                >
                  {updateUserMutation.isPending ? (isAmharic ? 'በማስቀመጥ ላይ...' : 'Saving...') : (isAmharic ? 'ለውጦችን አስቀምጥ' : 'Save Changes')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🌟 3. USER JOURNEY MODAL                                 */}
      {/* ======================================================== */}
      {showJourneyModal && selectedJourneyUser && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card variant="default" padding="none" className="max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <History className="w-5 h-5" /> {selectedJourneyUser.fullName} — {isAmharic ? 'የአባልነትና የአገልግሎት ጉዞ' : 'Member Progression Profile'}
                </h3>
                <p className="text-xs text-amber-200">
                  {isAmharic ? 'የተማሪነት፣ የመምህርነት እና የአስተዳዳሪነት የተሟላ ታሪክ' : 'Comprehensive service and academic history'}
                </p>
              </div>
              <button
                onClick={() => setShowJourneyModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-slate-900">
              {journeyLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>{isAmharic ? 'የአባሉን ማህደር በመጫን ላይ...' : 'Loading member records...'}</span>
                </div>
              ) : journeyData ? (
                <div className="space-y-6">
                  {/* Summary Profile Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block">
                        {isAmharic ? 'የአሁን ንቁ ሚና' : 'Current Active Role'}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getRoleVariant(journeyData.user?.role)} size="md">
                          {journeyData.user?.role}
                        </Badge>
                        {journeyData.user?.departmentId && (
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            • {journeyData.user.departmentId.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 sm:text-right">
                      <p>
                        <span className="font-semibold">{isAmharic ? 'ስልክ:' : 'Phone:'}</span> {journeyData.user?.phone || '—'}
                      </p>
                      <p>
                        <span className="font-semibold">{isAmharic ? 'ኢሜይል:' : 'Email:'}</span> {journeyData.user?.email || '—'}
                      </p>
                    </div>
                  </div>

                  {/* Career Progression Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {isAmharic ? 'የሚና እና የኃላፊነት ታሪክ' : 'Role Progression History'}
                    </h4>
                    {journeyData.user?.roleHistory && journeyData.user.roleHistory.length > 0 ? (
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-400/40">
                        {journeyData.user.roleHistory.map((item, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <Badge variant={getRoleVariant(item.role)} size="xs">
                                  {item.role}
                                </Badge>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  {formatEthiopianDate(item.startDate)}{' '}
                                  {item.endDate
                                    ? `— ${formatEthiopianDate(item.endDate)}`
                                    : (isAmharic ? '— አሁን' : '— Present')}
                                </span>
                              </div>
                              {item.notes && (
                                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium pt-0.5">
                                  {item.notes}
                                </p>
                              )}
                              {item.changedBy && (
                                <p className="text-[10px] text-slate-400">
                                  {isAmharic ? 'የመዘገበው:' : 'Recorded by:'} {item.changedBy.fullName || item.changedBy.email}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700">
                        {isAmharic ? 'የተመዘገበ የታሪክ ማስታወሻ የለም።' : 'No recorded role history.'}
                      </div>
                    )}
                  </div>

                  {/* Sub-Profiles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Student Record Card */}
                    <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <span>🎓 {isAmharic ? 'የተማሪነት መዝገብ' : 'Student Record'}</span>
                        </span>
                        <Badge variant={journeyData.student ? 'approved' : 'neutral'} size="xs">
                          {journeyData.student ? (isAmharic ? 'ተገኝቷል' : 'Found') : (isAmharic ? 'የለም' : 'None')}
                        </Badge>
                      </div>
                      {journeyData.student ? (
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                          <p>
                            <span className="font-semibold">{isAmharic ? 'የተማሪ መለያ: ' : 'Student ID: '}</span>
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                              {journeyData.student.studentId || 'TKD-STU'}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">{isAmharic ? 'ዓይነት: ' : 'Type: '}</span>
                            {journeyData.student.studentType || 'regular'}
                          </p>
                          <p>
                            <span className="font-semibold">{isAmharic ? 'ደረጃ/ባች: ' : 'Grade/Batch: '}</span>
                            {journeyData.student.batch || journeyData.student.grade || '—'}
                          </p>
                          {journeyData.student.courses?.length > 0 && (
                            <p>
                              <span className="font-semibold">{isAmharic ? 'የተመዘገቡ ኮርሶች: ' : 'Enrolled Courses: '}</span>
                              {journeyData.student.courses.length} {isAmharic ? 'ኮርሶች' : 'courses'}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">{isAmharic ? 'የተማሪነት መዝገብ አልተገኘም።' : 'No student profile record.'}</p>
                      )}
                    </div>

                    {/* Teacher Record Card */}
                    <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                          <span>👨‍🏫 {isAmharic ? 'የመምህርነት መዝገብ' : 'Teacher Record'}</span>
                        </span>
                        <Badge variant={journeyData.teacher ? 'approved' : 'neutral'} size="xs">
                          {journeyData.teacher ? (isAmharic ? 'ተገኝቷል' : 'Found') : (isAmharic ? 'የለም' : 'None')}
                        </Badge>
                      </div>
                      {journeyData.teacher ? (
                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                          <p>
                            <span className="font-semibold">{isAmharic ? 'የመምህር መለያ: ' : 'Teacher ID: '}</span>
                            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                              {journeyData.teacher.teacherId}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">{isAmharic ? 'ሁኔታ: ' : 'Status: '}</span>
                            {journeyData.teacher.status}
                          </p>
                          <p>
                            <span className="font-semibold">{isAmharic ? 'ምዝገባ ቀን: ' : 'Registration Date: '}</span>
                            {formatEthiopianDate(
                              journeyData.teacher.registrationDate || journeyData.teacher.createdAt
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">{isAmharic ? 'የመምህርነት መዝገብ አልተገኘም።' : 'No teacher profile record.'}</p>
                      )}
                    </div>
                  </div>

                  {/* Department Service History */}
                  {journeyData.memberships && journeyData.memberships.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> {isAmharic ? 'የአገልግሎት ክፍሎች' : 'Department Memberships'}
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
                {isAmharic ? 'ዝጋ' : 'Close'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;