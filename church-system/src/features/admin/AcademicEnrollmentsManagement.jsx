'use client';

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, RefreshCw, Eye } from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { useAcademicEnrollments } from '../../hooks/queries/useAcademic';

const AcademicEnrollmentsManagement = () => {
  const { data: enrollments = [], isLoading, isFetching, refetch } = useAcademicEnrollments();

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'active';
      case 'completed':
      case 'approved':
        return 'approved';
      case 'pending':
        return 'pending';
      case 'dropped':
      case 'rejected':
        return 'rejected';
      default:
        return 'neutral';
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'student',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
        cell: ({ row }) => {
          const profile = row.original.studentProfileId?.personId;
          const name = profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown';
          return <span className="font-bold text-slate-900 dark:text-white">{name}</span>;
        },
      },
      {
        accessorKey: 'academicYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
        cell: ({ row }) => <span>{row.original.academicYearId?.name || '-'}</span>,
      },
      {
        accessorKey: 'program',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Program" />,
        cell: ({ row }) => <span>{row.original.programId?.name || '-'}</span>,
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade / Batch" />,
        cell: ({ row }) => <span>{row.original.gradeId?.name || '-'}</span>,
      },
      {
        accessorKey: 'studyMode',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Mode" />,
        cell: ({ row }) => <span>{row.original.studyModeId?.name || '-'}</span>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <Badge variant={getStatusVariant(getValue())} size="sm">
            {getValue() || 'pending'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Link
              to={`/admin/academic-enrollments/${row.original._id}`}
              className="inline-flex items-center gap-1.5 text-xs bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 hover:bg-[var(--brand-primary)] hover:text-white dark:hover:bg-blue-600 font-bold px-3 py-1.5 rounded-xl transition-all duration-150"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የአካዳሚክ ምዝገባዎች (Academic Enrollments)"
        subtitle="የተማሪዎችን የክፍልና የትምህርት ዘመን ምዝገባ ሁኔታዎች እዚህ ይከታተሉ"
        icon={ClipboardList}
        badge={<Badge variant="gold" size="sm">{enrollments.length} ምዝገባዎች</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>አድስ (Refresh)</span>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={enrollments}
        isLoading={isLoading}
        emptyMessage="ምንም የተመዘገበ ተማሪ አልተገኘም (No enrollments found)"
        emptyIcon={ClipboardList}
      />
    </div>
  );
};

export default AcademicEnrollmentsManagement;