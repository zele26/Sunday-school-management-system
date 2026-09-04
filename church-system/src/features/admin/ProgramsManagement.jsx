'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, RefreshCw, List, LayoutGrid } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { usePrograms } from '../../hooks/queries/useAcademic';

const ProgramsManagement = () => {
  const [viewMode, setViewMode] = useState('grid');
  const { data: programs = [], isLoading, isFetching, refetch } = usePrograms();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'PROG'}</Badge>,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Program Name" />,
        cell: ({ getValue }) => <span className="font-bold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'distance' ? 'gold' : 'approved'} size="sm">
            {getValue() || 'መደበኛ'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የትምህርት ፕሮግራሞች (Education Programs)"
        subtitle="የመደበኛና የርቀት ትምህርት መርሃግብሮችን እዚህ ያስተዳድሩ"
        icon={BookOpen}
        badge={<Badge variant="gold" size="sm">{programs.length} ፕሮግራሞች</Badge>}
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
          data={programs}
          isLoading={isLoading}
          emptyMessage="ምንም ፕሮግራም አልተገኘም (No programs found)"
          emptyIcon={BookOpen}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <Card
              key={program._id}
              variant="default"
              padding="md"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="active" size="sm">
                  {program.code || 'PROG'}
                </Badge>
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{program.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                ዓይነት:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {program.type || 'መደበኛ'}
                </span>
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramsManagement;