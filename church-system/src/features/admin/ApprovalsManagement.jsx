'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, RefreshCw, Check, X } from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useApprovals,
  useApprovePendingUser,
  useRejectPendingUser,
} from '../../hooks/queries/useApprovals';

const ApprovalsManagement = () => {
  const { data: pendingUsers = [], isLoading, isFetching, refetch } = useApprovals();
  const approveMutation = useApprovePendingUser();
  const rejectMutation = useRejectPendingUser();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
        cell: ({ row }) => {
          const u = row.original;
          return <span className="font-bold text-slate-900 dark:text-white">{u.fullName || u.username}</span>;
        },
      },
      {
        accessorKey: 'contact',
        header: 'Phone / Username',
        cell: ({ row }) => {
          const u = row.original;
          return <span className="text-slate-600 dark:text-slate-300">{u.phone || u.username}</span>;
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ getValue }) => <Badge variant="gold" size="sm">{getValue()}</Badge>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: () => <Badge variant="pending" size="sm">Pending</Badge>,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => approveMutation.mutate(u._id)}
                disabled={approveMutation.isPending}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approveMutation.isPending ? '...' : 'አጽድቅ (Approve)'}</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => rejectMutation.mutate(u._id)}
                disabled={rejectMutation.isPending}
                className="gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>{rejectMutation.isPending ? '...' : 'ውድቅ አድርግ'}</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [approveMutation, rejectMutation]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የማጽደቂያ ጥያቄዎች (Pending Approvals)"
        subtitle="አዳዲስ የተመዘገቡ ተጠቃሚዎችን እና መምህራንን ያጽድቁ ወይም ውድቅ ያድርጉ"
        icon={CheckCircle2}
        badge={<Badge variant="pending" size="sm">{pendingUsers.length} የሚጠብቁ</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>አድስ (Refresh)</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={pendingUsers}
        isLoading={isLoading}
        emptyMessage="ምንም የሚጠብቅ የማጽደቂያ ጥያቄ የለም (All requests resolved)"
        emptyIcon={CheckCircle2}
      />
    </div>
  );
};

export default ApprovalsManagement;