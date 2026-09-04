'use client';

import React, { useState, useMemo } from 'react';
import { School, Plus, RefreshCw, List, LayoutGrid, Users } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { useClasses } from '../../hooks/queries/useClasses';

const ClassesManagement = () => {
  const [viewMode, setViewMode] = useState('table');
  const { data: classes = [], isLoading, isFetching, refetch } = useClasses();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Class Name" />,
        cell: ({ row }) => {
          const c = row.original;
          return <span className="font-bold text-slate-900 dark:text-white">{c.className || c.name}</span>;
        },
      },
      {
        accessorKey: 'teacherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned Teacher" />,
        cell: ({ getValue }) => (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {getValue() || <span className="text-slate-400 italic">Unassigned</span>}
          </span>
        ),
      },
      {
        accessorKey: 'studentCount',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Students" />,
        cell: ({ getValue }) => <Badge variant="active" size="sm">{getValue() || 0} ተማሪዎች</Badge>,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የክፍሎች አስተዳደር (Classes Management)"
        subtitle="ክፍሎችን እና የተመደቡ መምህራንን ያስተዳድሩ"
        icon={School}
        badge={<Badge variant="neutral" size="sm">{classes.length} ክፍሎች</Badge>}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>አድስ</span>
            </Button>
          </div>
        }
      />

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={classes}
          isLoading={isLoading}
          emptyMessage="ምንም ክፍሎች አልተገኙም (No classes found)"
          emptyIcon={School}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <Card
              key={c._id || c.id}
              variant="default"
              padding="md"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center">
                  <School className="w-4 h-4" />
                </div>
                <Badge variant="active" size="sm">
                  {c.studentCount || 0} ተማሪዎች
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {c.className || c.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                መምህር:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {c.teacherName || 'አልተመደበም'}
                </span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesManagement;