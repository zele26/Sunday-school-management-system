'use client';

import React, { useState, useMemo } from 'react';
import { Users, Eye, X, Phone, ShieldAlert, BookOpen } from 'lucide-react';
import {
  DataTable,
  DataTableColumnHeader,
  Badge,
  Card,
  Button,
} from '../../components/ui';
import { useMyStudents } from '../../hooks/queries/useTeacherPortal';
import { formatGradeAmharic } from '../../constants/registrationOptions';

const TeacherStudents = () => {
  const { data: students = [], isLoading } = useMyStudents();
  const [selectedStudent, setSelectedStudent] = useState(null);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የተማሪ ስም" />,
        cell: ({ row }) => {
          const s = row.original;
          const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ');
          return (
            <div className="flex items-center gap-3">
              {s.photoUrl ? (
                <img
                  src={s.photoUrl}
                  alt={fullName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {s.firstName ? s.firstName.charAt(0) : 'ተ'}
                </div>
              )}
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block leading-tight truncate">
                  {fullName}
                </span>
                {s.christianName && (
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium block truncate">
                    † {s.christianName}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ክፍል" />,
        cell: ({ getValue }) => <Badge variant="neutral" size="sm">{formatGradeAmharic(getValue())}</Badge>,
      },
      {
        accessorKey: 'confessionFather',
        header: 'የንስሐ አባት',
        cell: ({ row }) => {
          const s = row.original;
          if (s.hasConfessionFather) {
            return (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                ✓ {s.confessionFatherName || 'አላቸው'}
              </span>
            );
          }
          if (s.hasConfessionFather === false) {
            return (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                የላቸውም
              </span>
            );
          }
          return <span className="text-xs text-slate-400">-</span>;
        },
      },
      {
        accessorKey: 'phone',
        header: 'ስልክ ቁጥር',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
            {row.original.studentPhone || row.original.contactPhone || row.original.phone || '-'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">ተግባር</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedStudent(row.original)}
              className="gap-1 text-xs text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ዝርዝር</span>
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <Card variant="default" padding="lg" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የእኔ ተማሪዎች</span>
        </h2>
        <Badge variant="gold" size="sm">{students.length} ተማሪዎች</Badge>
      </div>

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        emptyMessage="ምንም የተመደበ ተማሪ የለም።"
        emptyIcon={Users}
      />

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--brand-primary)]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪ መረጃ</h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Avatar & Name */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                {selectedStudent.photoUrl ? (
                  <img
                    src={selectedStudent.photoUrl}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                    {selectedStudent.firstName ? selectedStudent.firstName.charAt(0) : 'ተ'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {[selectedStudent.firstName, selectedStudent.middleName, selectedStudent.lastName].filter(Boolean).join(' ')}
                  </h4>
                  {selectedStudent.christianName && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold mt-0.5">
                      † የክርስትና ስም: {selectedStudent.christianName}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {selectedStudent.studentId || selectedStudent._id?.slice(-8)?.toUpperCase()}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded font-medium">
                      {formatGradeAmharic(selectedStudent.grade)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confession Father Card */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 dark:text-amber-300">† የንስሐ አባት ሁኔታ</span>
                  {selectedStudent.hasConfessionFather ? (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      ✓ አላቸው
                    </span>
                  ) : (
                    <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-700">
                      የላቸውም / አልያዙም
                    </span>
                  )}
                </div>
                {selectedStudent.hasConfessionFather && (selectedStudent.confessionFatherName || selectedStudent.confessionFatherPhone) ? (
                  <div className="pt-1 text-slate-700 dark:text-slate-300 space-y-0.5">
                    {selectedStudent.confessionFatherName && <div><strong>ስም:</strong> {selectedStudent.confessionFatherName}</div>}
                    {selectedStudent.confessionFatherPhone && <div className="font-mono"><strong>ስልክ:</strong> {selectedStudent.confessionFatherPhone}</div>}
                  </div>
                ) : !selectedStudent.hasConfessionFather ? (
                  <p className="text-[11px] text-amber-800 dark:text-amber-400">
                    * ተማሪው የንስሐ አባት እንዲይዝ መንፈሳዊ ድጋፍ ያስፈልጋል።
                  </p>
                ) : null}
              </div>

              {/* Emergency Contact */}
              {(selectedStudent.emergencyFirstName || selectedStudent.emergencyPhone || selectedStudent.emergencyContactPhoto) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs flex items-center gap-3">
                  {selectedStudent.emergencyContactPhoto && (
                    <img
                      src={selectedStudent.emergencyContactPhoto}
                      alt="Emergency Contact"
                      className="w-12 h-12 rounded-xl object-cover border border-amber-300/80 shadow-xs shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-0.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>የአደጋ ጊዜ ተጠሪ</span>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 truncate">
                      {[selectedStudent.emergencyFirstName, selectedStudent.emergencyLastName].filter(Boolean).join(' ')}{' '}
                      {selectedStudent.relationship && `(${selectedStudent.relationship})`}
                    </p>
                    {selectedStudent.emergencyPhone && (
                      <p className="font-mono font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                        {selectedStudent.emergencyPhone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
                ዝጋ
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TeacherStudents;