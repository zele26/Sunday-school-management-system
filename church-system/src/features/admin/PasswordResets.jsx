'use client';

import React, { useState, useMemo } from 'react';
import { KeyRound, RefreshCw, Check, X, Dice5 } from 'lucide-react';
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
  usePasswordResets,
  useApprovePasswordReset,
  useRejectPasswordReset,
} from '../../hooks/queries/usePasswordResets';

const PasswordResets = () => {
  const [selectedReq, setSelectedReq] = useState(null);
  const [tempPassword, setTempPassword] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const { data: requests = [], isLoading, isFetching, refetch } = usePasswordResets();
  const approveMutation = useApprovePasswordReset();
  const rejectMutation = useRejectPasswordReset();

  const pendingRequests = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests]);
  const processedRequests = useMemo(() => requests.filter((r) => r.status !== 'pending'), [requests]);

  const handleOpenApproveModal = (req) => {
    setSelectedReq(req);
    const randomPass = `Pass${Math.floor(1000 + Math.random() * 9000)}`;
    setTempPassword(randomPass);
    setAdminNote('');
  };

  const handleApprove = () => {
    if (!selectedReq) return;
    approveMutation.mutate(
      { reqId: selectedReq._id, tempPassword, adminNote },
      { onSuccess: () => setSelectedReq(null) }
    );
  };

  const handleReject = (reqId) => {
    if (!window.confirm('ይህን የፓስዎርድ ጥያቄ ውድቅ ማድረግ ይፈልጋሉ?')) return;
    rejectMutation.mutate(reqId);
  };

  const pendingColumns = useMemo(
    () => [
      {
        accessorKey: 'user',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div>
              <div className="font-bold text-slate-900 dark:text-white">
                {req.fullName || req.user?.fullName || 'N/A'}
              </div>
              <div className="text-xs text-slate-400 font-normal">
                {req.email || req.phone || ''}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
        cell: ({ getValue }) => <Badge variant="gold" size="sm">{getValue() || 'student'}</Badge>,
      },
      {
        accessorKey: 'identifier',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Identifier" />,
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(getValue()).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => handleOpenApproveModal(req)}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>አጽድቅ</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(req._id)}
                disabled={rejectMutation.isPending}
                className="gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>ውድቅ</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [rejectMutation]
  );

  const historyColumns = useMemo(
    () => [
      {
        accessorKey: 'user',
        header: ({ column }) => <DataTableColumnHeader column={column} title="User" />,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <span className="font-bold text-slate-900 dark:text-white">
              {req.fullName || req.user?.fullName}
            </span>
          );
        },
      },
      {
        accessorKey: 'identifier',
        header: 'Identifier',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'approved' ? 'approved' : 'danger'} size="sm">
            {getValue() === 'approved' ? 'ተፈቅዷል' : 'ውድቅ ተደርጓል'}
          </Badge>
        ),
      },
      {
        accessorKey: 'tempPasswordIssued',
        header: 'Temp Password',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-bold text-[var(--brand-primary)] dark:text-blue-400">
            {getValue() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Processed Date" />,
        cell: ({ row }) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(row.original.updatedAt || row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የፓስዎርድ ቅያሬ ጥያቄዎች (Password Resets)"
        subtitle="የተጠቃሚዎችን የይለፍ ቃል ቅያሬ ጥያቄ ማረጋገጫ እና ማጽደቂያ መድረክ"
        icon={KeyRound}
        badge={<Badge variant="pending" size="sm">{pendingRequests.length} የሚጠብቁ</Badge>}
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

      {/* Pending Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span>ማረጋገጫ የሚጠብቁ ጥያቄዎች (Pending Requests)</span>
        </h3>
        <DataTable
          columns={pendingColumns}
          data={pendingRequests}
          isLoading={isLoading}
          emptyMessage="ማረጋገጫ የሚጠብቅ የፓስዎርድ ጥያቄ የለም"
          emptyIcon={KeyRound}
        />
      </div>

      {/* History Table */}
      {processedRequests.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            የተከናወኑ ጥያቄዎች ታሪክ (Processed History)
          </h3>
          <DataTable
            columns={historyColumns}
            data={processedRequests}
            emptyMessage="ምንም ታሪክ የለም"
            emptyIcon={KeyRound}
          />
        </div>
      )}

      {/* Approval Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <Card variant="default" padding="md" className="max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">የፓስዎርድ ጥያቄ ማጽደቂያ</h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl text-xs space-y-1">
              <p><strong>ተጠቃሚ፡</strong> {selectedReq.fullName || selectedReq.user?.fullName}</p>
              <p><strong>ኢሜይል/ስልክ፡</strong> {selectedReq.email || selectedReq.phone || selectedReq.identifier}</p>
              <p><strong>ሚና፡</strong> {selectedReq.role}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  ለተጠቃሚው የሚሰጥ ጊዜያዊ ፓስዎርድ *
                </label>
                <div className="flex gap-2">
                  <Input
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="font-mono font-bold"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setTempPassword(`Pass${Math.floor(1000 + Math.random() * 9000)}`)}
                    className="gap-1.5 shrink-0"
                  >
                    <Dice5 className="w-4 h-4" />
                    <span>አዲስ ሠራ</span>
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  ማስታወሻ (Admin Note - Optional)
                </label>
                <Input
                  placeholder="ማስታወሻ ያስገቡ..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedReq(null)}>
                ሰርዝ
              </Button>
              <Button
                variant="success"
                size="sm"
                disabled={approveMutation.isPending}
                onClick={handleApprove}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{approveMutation.isPending ? 'በማጽደቅ ላይ...' : 'አጽድቅና ጊዜያዊ ፓስዎርድ ስጥ'}</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PasswordResets;
