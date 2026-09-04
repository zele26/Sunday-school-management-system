'use client';

import React, { useState, useMemo } from 'react';
import { Users, RefreshCw, Search } from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Input,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import { usePeople } from '../../hooks/queries/usePeople';

const PeopleManagement = () => {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching, refetch } = usePeople({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search,
  });

  const people = data?.persons || [];
  const totalPages = data?.totalPages || 1;
  const totalPeople = data?.total || people.length;

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
        cell: ({ row }) => {
          const p = row.original;
          return (
            <span className="font-bold text-slate-900 dark:text-white">
              {p.firstName} {p.middleName || ''} {p.lastName || ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-300 font-mono">{getValue() || '-'}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => <span className="text-slate-600 dark:text-slate-300">{getValue() || '-'}</span>,
      },
      {
        accessorKey: 'gender',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'Unknown'}</Badge>,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የሰዎች መዝገብ (People Registry)"
        subtitle="በቤተክርስቲያኑና በሰንበት ትምህርት ቤቱ ያሉ አባላት፣ ወላጆችና ተማሪዎች መረጃ"
        icon={Users}
        badge={<Badge variant="gold" size="sm">{totalPeople} ሰዎች</Badge>}
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

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          icon={Search}
          placeholder="በስም፣ በስልክ ወይም በኢሜይል ይፈልጉ..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={people}
        pageCount={totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        totalItemsCount={totalPeople}
        emptyMessage="ምንም ሰው አልተገኘም (No people found)"
        emptyIcon={Users}
      />
    </div>
  );
};

export default PeopleManagement;