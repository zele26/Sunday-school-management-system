'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, RefreshCw, List, LayoutGrid } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { useAcademicYears } from '../../hooks/queries/useAcademic';

const AcademicYearsManagement = () => {
  const [viewMode, setViewMode] = useState('grid');
  const { data: years = [], isLoading, isFetching, refetch } = useAcademicYears();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Academic Year" />,
        cell: ({ getValue }) => <span className="font-bold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {getValue() ? new Date(getValue()).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'endDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="End Date" />,
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {getValue() ? new Date(getValue()).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'active' ? 'approved' : 'neutral'} size="sm">
            {getValue() || 'inactive'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የትምህርት ዘመናት (Academic Years)"
        subtitle="የሰንበት ትምህርት ቤቱን የትምህርት ዘመናት እና ሁኔታዎች ያስተዳድሩ"
        icon={Calendar}
        badge={<Badge variant="gold" size="sm">{years.length} ዘመናት</Badge>}
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
              <span>አድስ (Refresh)</span>
            </Button>
          </div>
        }
      />

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={years}
          isLoading={isLoading}
          emptyMessage="ምንም የትምህርት ዘመን አልተገኘም (No academic years found)"
          emptyIcon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {years.map((year) => (
            <Card
              key={year._id}
              variant="default"
              padding="md"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <Badge variant={year.status === 'active' ? 'approved' : 'neutral'} size="sm">
                  {year.status || 'inactive'}
                </Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{year.name}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {year.startDate ? new Date(year.startDate).toLocaleDateString() : '—'} -{' '}
                {year.endDate ? new Date(year.endDate).toLocaleDateString() : '—'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademicYearsManagement;