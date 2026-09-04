'use client';

import React, { useState, useMemo } from 'react';
import { Link2, RefreshCw, Plus } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useDepartmentMemberships,
  useAddDepartmentMembership,
  useDepartments,
  usePersons,
} from '../../hooks/queries/useDepartments';

const DepartmentMembershipsManagement = () => {
  const [form, setForm] = useState({
    personId: '',
    departmentId: '',
    departmentMemberId: '',
    status: 'active',
  });

  const { data: memberships = [], isLoading, isFetching, refetch } = useDepartmentMemberships();
  const { data: people = [] } = usePersons(100);
  const { data: departments = [] } = useDepartments();
  const addMembershipMutation = useAddDepartmentMembership();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddMembership = (e) => {
    e.preventDefault();
    if (!form.personId || !form.departmentId) {
      alert('እባክዎ ሰው እና የአገልግሎት ክፍል ይምረጡ');
      return;
    }
    addMembershipMutation.mutate(form, {
      onSuccess: () => {
        setForm({ personId: '', departmentId: '', departmentMemberId: '', status: 'active' });
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'person',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Person" />,
        cell: ({ row }) => {
          const m = row.original;
          const name = m.personId ? `${m.personId.firstName} ${m.personId.lastName}` : 'Unknown';
          return <span className="font-bold text-slate-900 dark:text-white">{name}</span>;
        },
      },
      {
        accessorKey: 'department',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Department" />,
        cell: ({ row }) => {
          const m = row.original;
          return <span className="text-slate-600 dark:text-slate-300">{m.departmentId?.name || '-'}</span>;
        },
      },
      {
        accessorKey: 'departmentMemberId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dept Member ID" />,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {getValue() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <Badge
              variant={status === 'active' ? 'approved' : status === 'inactive' ? 'neutral' : 'pending'}
              size="sm"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Start Date" />,
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {getValue() ? new Date(getValue()).toLocaleDateString() : '-'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የክፍላት አባላት ምዝገባ (Department Memberships)"
        subtitle="የእያንዳንዱን አባል የአገልግሎት ክፍል ምደባና መታወቂያ ያስተዳድሩ"
        icon={Link2}
        badge={<Badge variant="gold" size="sm">{memberships.length} አባላት</Badge>}
        actions={
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
        }
      />

      {/* Add Membership Card */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          አዲስ የአገልግሎት ክፍል አባል መዝግብ
        </h3>
        <form onSubmit={handleAddMembership} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Select
            name="personId"
            value={form.personId}
            onChange={handleChange}
            required
          >
            <option value="">ሰው ይምረጡ (Select Person)</option>
            {people.map((p) => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </Select>

          <Select
            name="departmentId"
            value={form.departmentId}
            onChange={handleChange}
            required
          >
            <option value="">ክፍል ይምረጡ (Select Dept)</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Input
            type="text"
            name="departmentMemberId"
            placeholder="Dept ID (optional)"
            value={form.departmentMemberId}
            onChange={handleChange}
          />

          <Select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="active">Active (ንቁ)</option>
            <option value="inactive">Inactive (የማይሳተፍ)</option>
            <option value="pending">Pending (በመጠባበቅ ላይ)</option>
          </Select>

          <Button
            variant="primary"
            type="submit"
            disabled={addMembershipMutation.isPending}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{addMembershipMutation.isPending ? 'በመመዝገብ ላይ...' : 'መዝግብ'}</span>
          </Button>
        </form>
      </Card>

      {/* Memberships Table */}
      <DataTable
        columns={columns}
        data={memberships}
        isLoading={isLoading}
        emptyMessage="ምንም የተመዘገበ የክፍል አባል አልተገኘም"
        emptyIcon={Link2}
      />
    </div>
  );
};

export default DepartmentMembershipsManagement;