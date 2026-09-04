'use client';

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  RotateCw,
  Eye,
  Check,
  X,
  FileText,
  AlertCircle,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Input,
  Select,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useRegistrations,
  useApproveRegistration,
  useRejectRegistration,
} from '../../hooks/queries/useRegistrations';

const RegistrationsManagement = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Queries & Mutations
  const { data: rawRegistrations = [], isLoading, isFetching, refetch } = useRegistrations();
  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();

  // Client-side filtering on data
  const filteredRegistrations = useMemo(() => {
    return rawRegistrations.filter((r) => {
      const matchesSearch =
        !search ||
        (r.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.registrationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.phone || '').includes(search) ||
        (r.transactionRef || '').toLowerCase().includes(search.toLowerCase());

      const matchesType = !typeFilter || r.studentType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [rawRegistrations, search, typeFilter]);

  const handleApprove = (id) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        setShowDetailModal(false);
        setSelectedRegistration(null);
      },
    });
  };

  const handleReject = (id) => {
    if (!rejectReason.trim()) {
      alert('እባክዎ የውድቅ ማድረጊያውን ምክንያት ያስገቡ (Please provide rejection reason)');
      return;
    }
    rejectMutation.mutate(
      { id, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setShowDetailModal(false);
          setSelectedRegistration(null);
          setRejectReason('');
        },
      }
    );
  };

  const openDetailModal = (registration) => {
    setSelectedRegistration(registration);
    setRejectReason('');
    setShowDetailModal(true);
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'registrationNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reg Number" />,
        cell: ({ getValue }) => (
          <span className="font-mono font-bold text-[var(--brand-primary)] text-xs">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Full Name" />,
        cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Grade / Batch" />,
        cell: ({ getValue }) => <span>{getValue() || '—'}</span>,
      },
      {
        accessorKey: 'studentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'distance' ? 'gold' : 'approved'} size="sm">
            {getValue() || 'regular'}
          </Badge>
        ),
      },
      {
        accessorKey: 'transactionRef',
        header: 'Transaction Ref',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {getValue() || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'receiptUrl',
        header: 'Receipt',
        cell: ({ getValue }) => {
          const url = getValue();
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--brand-primary)] hover:underline text-xs font-semibold inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> View Receipt
            </a>
          ) : (
            <span className="text-slate-400 text-xs">No receipt</span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button size="sm" variant="primary" onClick={() => openDetailModal(row.original)}>
              <Eye className="w-3.5 h-3.5 mr-1" /> Review
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Registrations Review (የአዳዲስ ተማሪዎች ምዝገባ ፍተሻ)"
        subtitle="Review public applications, verify bank transaction receipts, and approve students into the system."
        icon={UserCheck}
        badge={<Badge variant="gold" size="sm">{rawRegistrations.length} Pending</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching} className="gap-1.5">
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>እደስ (Refresh)</span>
          </Button>
        }
      />

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="በስም፣ በመለያ ወይም በደረሰኝ ቁጥር ይፈልጉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types (ሁሉም)</option>
            <option value="regular">Regular (መደበኛ)</option>
            <option value="distance">Distance (የርቀት)</option>
          </Select>
        </div>
      </div>

      {/* Registrations Table */}
      <DataTable
        columns={columns}
        data={filteredRegistrations}
        isLoading={isLoading}
        emptyMessage="ምንም በመጠባበቅ ላይ ያለ ምዝገባ የለም (No pending registrations found)"
        emptyIcon={AlertCircle}
      />

      {/* Detail & Review Modal */}
      {showDetailModal && selectedRegistration && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <Card variant="default" padding="none" className="max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 bg-gradient-to-r from-[var(--brand-primary)] to-indigo-950 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Registration Application Details</h3>
                <p className="text-xs text-blue-200">የተማሪውን መረጃና ደረሰኝ ያረጋግጡ</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              {/* Top info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Full Name</span>
                  <span className="text-slate-900 dark:text-white font-bold text-base">{selectedRegistration.fullName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Student Type</span>
                  <Badge variant={selectedRegistration.studentType === 'distance' ? 'gold' : 'approved'} size="sm">
                    {selectedRegistration.studentType}
                  </Badge>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Registration Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedRegistration.registrationNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Grade / Batch</span>
                  <span className="text-slate-900 dark:text-white font-medium">{selectedRegistration.grade}</span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">First Name</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.firstName || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Middle Name</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.middleName || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Last Name</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.lastName || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Education Level</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.educationLevel || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Gender</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.gender || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Phone</span>
                  <span className="text-slate-900 dark:text-white font-mono">{selectedRegistration.phone}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Email</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.email || '—'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Address</span>
                  <span className="text-slate-900 dark:text-white">{selectedRegistration.address || '—'}</span>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-3">
                  የአደጋ ጊዜ ተጠሪ (Emergency Contact)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Contact Name</span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {selectedRegistration.emergencyFirstName || selectedRegistration.parentName || '—'}{' '}
                      {selectedRegistration.emergencyMiddleName || ''}{' '}
                      {selectedRegistration.emergencyLastName || ''}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Relationship</span>
                    <span className="text-slate-900 dark:text-white">{selectedRegistration.relationship || 'Parent/Guardian'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Phone</span>
                    <span className="text-slate-900 dark:text-white font-mono">
                      {selectedRegistration.emergencyPhone || selectedRegistration.parentPhone || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Email</span>
                    <span className="text-slate-900 dark:text-white">
                      {selectedRegistration.emergencyEmail || selectedRegistration.parentEmail || '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment / Receipt */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-3">
                  የክፍያና ደረሰኝ ማረጋገጫ (Payment & Receipt)
                </h4>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">Transaction Reference</span>
                    <span className="text-slate-900 dark:text-white font-mono font-bold">{selectedRegistration.transactionRef || '—'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[11px] block mb-1">Receipt Attachment</span>
                    {selectedRegistration.receiptUrl ? (
                      <div>
                        {isImageUrl(selectedRegistration.receiptUrl) ? (
                          <a href={selectedRegistration.receiptUrl} target="_blank" rel="noreferrer">
                            <img
                              src={selectedRegistration.receiptUrl}
                              alt="Receipt"
                              className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:opacity-90 transition-opacity"
                            />
                          </a>
                        ) : (
                          <a
                            href={selectedRegistration.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--brand-primary)] hover:underline text-xs font-bold inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Receipt File
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No receipt uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection reason input */}
              <div>
                <Input
                  label="Rejection Reason (ውድቅ የሚደረግበት ምክንያት)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. የባንክ ደረሰኙ ግልጽ አይደለም (Receipt invalid)..."
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={rejectMutation.isPending}
                onClick={() => handleReject(selectedRegistration._id)}
              >
                <X className="w-4 h-4 mr-1" /> {rejectMutation.isPending ? '...' : 'Reject'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={approveMutation.isPending}
                onClick={() => handleApprove(selectedRegistration._id)}
              >
                <Check className="w-4 h-4 mr-1" /> {approveMutation.isPending ? '...' : 'Approve & Create Account'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RegistrationsManagement;