'use client';

import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import {
  DataTable,
  DataTableColumnHeader,
  Badge,
} from '../../components/ui';
import { useMyStudents } from '../../hooks/queries/useTeacherPortal';

const TeacherStudents = () => {
  const { data: students = [], isLoading } = useMyStudents();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
          const s = row.original;
          return <span className="font-bold text-slate-900 dark:text-white">{s.firstName} {s.lastName}</span>;
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || '-'}</Badge>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{row.original.userId?.email || '-'}</span>,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
            {row.original.studentPhone || row.original.contactPhone || '-'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የእኔ ተማሪዎች (My Students)</span>
        </h2>
        <Badge variant="gold" size="sm">{students.length} ተማሪዎች</Badge>
      </div>

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        emptyMessage="ምንም የተመደበ ተማሪ የለም (No students assigned to you yet)"
        emptyIcon={Users}
      />
    </div>
  );
};

export default TeacherStudents;