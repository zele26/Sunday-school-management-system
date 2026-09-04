'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Check,
  X,
  FileText,
  AlertCircle,
  Eye,
  Download,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Select,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useAdminResources,
  useApproveResource,
} from '../../hooks/queries/useResources';

const ResourceApproval = () => {
  const [filter, setFilter] = useState('Pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: resources = [], isLoading, isFetching, refetch } = useAdminResources(filter);
  const approveMutation = useApproveResource();

  const handleApprove = (id) => {
    approveMutation.mutate({ id, action: 'approve' });
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      alert('እባክዎ ውድቅ የተደረገበትን ምክንያት ያስገቡ');
      return;
    }
    approveMutation.mutate(
      { id: rejectId, action: 'reject', rejectionReason: rejectReason.trim() },
      { onSuccess: () => setShowRejectModal(false) }
    );
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'title',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Resource Title" />,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[var(--brand-primary)]" />
                {r.title}
              </div>
              {r.description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{r.description}</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{getValue() || 'Document'}</Badge>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => {
          const s = getValue();
          return (
            <Badge
              variant={s === 'Approved' ? 'approved' : s === 'Rejected' ? 'danger' : 'pending'}
              size="sm"
            >
              {s || 'Pending'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'fileUrl',
        header: 'File',
        cell: ({ getValue }) => {
          const url = getValue();
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--brand-primary)] hover:underline text-xs font-semibold inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Open
            </a>
          ) : (
            <span className="text-xs text-slate-400">No file</span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {r.status === 'Pending' && (
                <>
                  <Button
                    size="xs"
                    variant="success"
                    onClick={() => handleApprove(r._id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button
                    size="xs"
                    variant="danger"
                    onClick={() => openRejectModal(r._id)}
                    disabled={approveMutation.isPending}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [approveMutation]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="የመርጃ ሰነዶች ማጽደቂያ (Resource Approvals)"
        subtitle="በመምህራን የቀረቡ መጻሕፍትን፣ ሰነዶችን እና የትምህርት መርጃዎችን ይገምግሙ"
        icon={CheckCircle2}
        badge={<Badge variant="gold" size="sm">{resources.length} ሰነዶች</Badge>}
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

      <div className="w-full sm:w-48">
        <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="Pending">Pending (የሚጠብቁ)</option>
          <option value="Approved">Approved (የጸደቁ)</option>
          <option value="Rejected">Rejected (ውድቅ የተደረጉ)</option>
          <option value="All">All (ሁሉም)</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={resources}
        isLoading={isLoading}
        emptyMessage="ምንም የመርጃ ሰነድ አልተገኘም"
        emptyIcon={FileText}
      />

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <Card variant="default" padding="md" className="max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              መርጃ ሰነዱን ውድቅ አድርግ
            </h3>
            <p className="text-xs text-slate-500">
              እባክዎ ሰነዱ ውድቅ የሚደረግበትን ምክንያት ይግለጹ፡
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="ምክንያት..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowRejectModal(false)}>
                ሰርዝ
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRejectConfirm}
                disabled={approveMutation.isPending}
              >
                ውድቅ አድርግ
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResourceApproval;