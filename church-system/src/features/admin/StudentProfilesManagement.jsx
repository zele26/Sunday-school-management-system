'use client';

import React, { useState, useMemo } from 'react';
import { GraduationCap, RefreshCw, Eye, TrendingUp, X } from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
} from '../../components/ui';
import {
  useStudentProfiles,
  useProgressStudent,
} from '../../hooks/queries/usePeople';

const StudentProfilesManagement = () => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProgressConfirm, setShowProgressConfirm] = useState(false);

  const { data: profiles = [], isLoading, isFetching, refetch } = useStudentProfiles();
  const progressMutation = useProgressStudent();

  const getCurrentGrade = (profile) => {
    const enroll = profile.latestEnrollment;
    if (!enroll) return '—';
    return enroll.gradeId?.name || (enroll.programId?.type === 'distance' ? 'Batch 1' : '—');
  };

  const getAcademicYear = (profile) => {
    return profile.latestEnrollment?.academicYearId?.name || '—';
  };

  const openDetails = (profile) => {
    setSelectedProfile(profile);
    setShowDetailModal(true);
    setShowProgressConfirm(false);
  };

  const handleConfirmProgress = () => {
    if (!selectedProfile) return;
    progressMutation.mutate(selectedProfile._id, {
      onSuccess: () => {
        setShowDetailModal(false);
        setShowProgressConfirm(false);
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'studentNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Student ID" />,
        cell: ({ getValue }) => (
          <span className="font-mono font-bold text-xs text-[var(--brand-primary)] dark:text-blue-400">
            {getValue()}
          </span>
        ),
      },
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
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Current Grade / Batch" />,
        cell: ({ row }) => <Badge variant="active" size="sm">{getCurrentGrade(row.original)}</Badge>,
      },
      {
        accessorKey: 'academicYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Year" />,
        cell: ({ row }) => <span className="text-slate-600 dark:text-slate-300">{getAcademicYear(row.original)}</span>,
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'active' ? 'approved' : 'neutral'} size="sm">
            {getValue() || 'active'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="primary"
              size="sm"
              onClick={() => openDetails(row.original)}
              className="gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ዝርዝር (Details)</span>
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
        title="የተማሪዎች ፕሮፋይል (Student Profiles)"
        subtitle="የእያንዳንዱን ተማሪ የትምህርት ደረጃ፣ የምዝገባ ታሪክ እና የደረጃ ሽግግር ያስተዳድሩ"
        icon={GraduationCap}
        badge={<Badge variant="gold" size="sm">{profiles.length} ተማሪዎች</Badge>}
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

      <DataTable
        columns={columns}
        data={profiles}
        isLoading={isLoading}
        emptyMessage="ምንም የተማሪ ፕሮፋይል አልተገኘም"
        emptyIcon={GraduationCap}
      />

      {/* Student Details Modal */}
      {showDetailModal && selectedProfile && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card
            variant="default"
            padding="md"
            className="w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedProfile.personId?.firstName} {selectedProfile.personId?.lastName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Student ID:{' '}
                  <span className="font-bold text-[var(--brand-primary)] dark:text-blue-400">
                    {selectedProfile.studentNumber}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Enrollment Summary */}
            {selectedProfile.latestEnrollment && (
              <div className="bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/20 p-4 rounded-2xl">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  Current Enrollment
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Academic Year</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedProfile.latestEnrollment.academicYearId?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Program</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedProfile.latestEnrollment.programId?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grade/Batch</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {getCurrentGrade(selectedProfile)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Study Mode</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedProfile.latestEnrollment.studyModeId?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Status</span>
                    <Badge variant="approved" size="sm">
                      {selectedProfile.latestEnrollment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Actions: Progress Student */}
            <div className="flex justify-between items-center pt-2">
              <Button
                variant="gold"
                size="sm"
                onClick={() => setShowProgressConfirm(true)}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                <span>ቀጣይ ደረጃ አሸጋግር (Progress Student)</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                ዝጋ (Close)
              </Button>
            </div>

            {/* Progress Confirmation Box */}
            {showProgressConfirm && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  ተማሪውን ወደሚቀጥለው የትምህርት ደረጃ እና ዘመን ማሸጋገር እርግጠኛ ነዎት?
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="gold"
                    size="sm"
                    loading={progressMutation.isPending}
                    onClick={handleConfirmProgress}
                  >
                    አዎ፣ አሸጋግር
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowProgressConfirm(false)}
                  >
                    ሰርዝ
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentProfilesManagement;