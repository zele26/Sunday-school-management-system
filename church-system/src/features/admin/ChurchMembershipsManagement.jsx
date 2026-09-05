'use client';

import React, { useState, useMemo } from 'react';
import { Church, RefreshCw, UserPlus, Search } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useChurchMemberships,
  useAssignChurchMembership,
} from '../../hooks/queries/usePeople';
import { formatEthiopianDate } from '../../utils/ethiopianDate';

const ChurchMembershipsManagement = () => {
  const [personId, setPersonId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: memberships = [], isLoading, isFetching, refetch } = useChurchMemberships();
  const assignMutation = useAssignChurchMembership();

  const handlePersonSearch = async (e) => {
    const query = e.target.value;
    setPersonSearch(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/core/persons?search=${encodeURIComponent(query)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.persons || []);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPerson = (person) => {
    setPersonId(person._id);
    setPersonSearch(`${person.firstName} ${person.lastName}`);
    setShowDropdown(false);
  };

  const handleAssign = (e) => {
    e.preventDefault();
    if (!personId || !memberId) {
      alert('እባክዎ ሰው ይምረጡና የቤተክርስቲያን መታወቂያ ያስገቡ');
      return;
    }
    assignMutation.mutate(
      { personId, memberId },
      {
        onSuccess: () => {
          setPersonId('');
          setMemberId('');
          setPersonSearch('');
        },
      }
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'person',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Person" />,
        cell: ({ row }) => {
          const p = row.original.personId;
          const name = p ? `${p.firstName} ${p.lastName}` : 'Unknown';
          return <span className="font-bold text-slate-900 dark:text-white">{name}</span>;
        },
      },
      {
        accessorKey: 'memberId',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Church Member ID" />,
        cell: ({ getValue }) => (
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
            {getValue() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: () => <Badge variant="approved" size="sm">Active Member</Badge>,
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned Date" />,
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {getValue() ? formatEthiopianDate(getValue()) : '-'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የቤተክርስቲያን አባልነት (Church Memberships)"
        subtitle="የምእመናንን የደብረ ሳዊሮስ ቅዱስ ተክለሃይማኖት ይፋዊ የአባልነት መታወቂያ ያስተዳድሩ"
        icon={Church}
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

      {/* Assignment Card */}
      <Card variant="default" padding="md">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          የቤተክርስቲያን መታወቂያ ቁጥር መድብ
        </h3>
        <form onSubmit={handleAssign} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Input
              icon={Search}
              placeholder="ሰው በስም ይፈልጉ..."
              value={personSearch}
              onChange={handlePersonSearch}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => selectPerson(p)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 last:border-0"
                  >
                    {p.firstName} {p.middleName} {p.lastName}{' '}
                    <span className="text-xs text-slate-400">({p.phone || 'No phone'})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Church Member ID (e.g. CM-1002)"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
            />
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={assignMutation.isPending}
            className="gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{assignMutation.isPending ? 'በመመደብ ላይ...' : 'መድብ (Assign)'}</span>
          </Button>
        </form>
      </Card>

      {/* Memberships Table */}
      <DataTable
        columns={columns}
        data={memberships}
        isLoading={isLoading}
        emptyMessage="ምንም የተመዘገበ የቤተክርስቲያን አባል የለም"
        emptyIcon={Church}
      />
    </div>
  );
};

export default ChurchMembershipsManagement;