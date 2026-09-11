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
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሙሉ ስም" />,
        cell: ({ row }) => {
          const u = row.original;
          return <span className="font-bold text-slate-900 dark:text-white">{u.fullName || u.username}</span>;
        },
      },
      {
        accessorKey: 'contact',
        header: 'ስልክ / የተጠቃሚ ስም',
        cell: ({ row }) => {
          const u = row.original;
          return <span className="text-slate-600 dark:text-slate-300">{u.phone || u.username}</span>;
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሚና" />,
        cell: ({ getValue }) => {
          const role = getValue();
          const roleLabel =
            role === 'teacher'
              ? 'መምህር'
              : role === 'student'
              ? 'ተማሪ'
              : role === 'admin'
              ? 'አስተዳዳሪ'
              : role === 'superadmin'
              ? 'ዋና አስተዳዳሪ'
              : role;
          return <Badge variant="gold" size="sm">{roleLabel}</Badge>;
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሁኔታ" />,
        cell: () => <Badge variant="pending" size="sm">በመጠባበቅ ላይ</Badge>,
      },
      {
        id: 'actions',
        header: () => <div className="text-right">ተግባራት</div>,
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
                <span>{approveMutation.isPending ? '...' : 'አጽድቅ'}</span>
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
        title="የተጠቃሚዎች ማረጋገጫና ማጽደቂያ"
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
            <span>አድስ</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={pendingUsers}
        isLoading={isLoading}
        emptyMessage="ምንም የሚጠብቅ የማጽደቂያ ጥያቄ የለም"
        emptyIcon={CheckCircle2}
      />
    </div>
  );
};

export default ApprovalsManagement;