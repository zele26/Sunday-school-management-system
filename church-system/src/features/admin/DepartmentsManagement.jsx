'use client';

import React, { useState, useMemo } from 'react';
import { Building2, RefreshCw, List, LayoutGrid } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { useDepartments } from '../../hooks/queries/useDepartments';

const DepartmentsManagement = () => {
  const [viewMode, setViewMode] = useState('grid');
  const { data: departments = [], isLoading, isFetching, refetch } = useDepartments();

  const columns = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'DEPT'}</Badge>,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department Name" />,
        cell: ({ getValue }) => <span className="font-bold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span className="text-slate-600 dark:text-slate-400 text-xs line-clamp-2">
            {getValue() || '—'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የአገልግሎት ክፍሎች (Departments)"
        subtitle="የሰንበት ትምህርት ቤቱ እና የቤተክርስቲያኑ ንኡሳን ክፍላትና አገልግሎቶች"
        icon={Building2}
        badge={<Badge variant="gold" size="sm">{departments.length} ክፍሎች</Badge>}
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
          data={departments}
          isLoading={isLoading}
          emptyMessage="ምንም የአገልግሎት ክፍል አልተገኘም (No departments found)"
          emptyIcon={Building2}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card
              key={dept._id}
              variant="default"
              padding="md"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <Badge variant="active" size="sm">
                  {dept.code || 'DEPT'}
                </Badge>
                <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{dept.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                {dept.description || 'ምንም ዝርዝር መግለጫ አልተሰጠም።'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsManagement;