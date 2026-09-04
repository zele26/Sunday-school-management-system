'use client';

import React, { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import {
  DataTable,
  DataTableColumnHeader,
  Badge,
} from '../../components/ui';
import { useMyCourses } from '../../hooks/queries/useTeacherPortal';

const TeacherCourses = () => {
  const { data: courses = [], isLoading } = useMyCourses();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Course Name" />,
        cell: ({ getValue }) => <span className="font-bold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'ageGroup',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Age Group / Grade" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'Youth'}</Badge>,
      },
      {
        accessorKey: 'schedule',
        header: 'Schedule',
        cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-300">{getValue() || '-'}</span>,
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
    ],
    []
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የእኔ ኮርሶች (My Courses)</span>
        </h2>
        <Badge variant="gold" size="sm">{courses.length} ኮርሶች</Badge>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        isLoading={isLoading}
        emptyMessage="ምንም የተመደበ ኮርስ የለም (You are not assigned to any courses yet)"
        emptyIcon={BookOpen}
      />
    </div>
  );
};

export default TeacherCourses;