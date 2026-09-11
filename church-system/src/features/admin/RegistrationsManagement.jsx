'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  useAdminRegistrationSettings,
  useUpdateRegistrationSettings,
} from '../../hooks/queries';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { Sliders, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

const RegistrationsManagement = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Queries & Mutations
  const { data: rawRegistrations = [], isLoading, isFetching, refetch } = useRegistrations();
  const approveMutation = useApproveRegistration();
  const rejectMutation = useRejectRegistration();

  // Admin Settings Queries & Mutation
  const { data: regSettings = {}, isLoading: isSettingsLoading } = useAdminRegistrationSettings();
  const updateSettingsMutation = useUpdateRegistrationSettings();

  // Settings form state
  const [formData, setFormData] = useState({
    academicYear: '',
    generalClosedMessage: '',
    regularClosedMessage: '',
    distanceClosedMessage: '',
  });

  // Sync settings when loaded
  React.useEffect(() => {
    if (regSettings && regSettings.key) {
      setFormData({
        academicYear: regSettings.academicYear || '2017 ዓ.ም',
        generalClosedMessage: regSettings.generalClosedMessage || '',
        regularClosedMessage: regSettings.regularClosedMessage || '',
        distanceClosedMessage: regSettings.distanceClosedMessage || '',
      });
    }
  }, [regSettings]);

  const handleToggle = (field, currentValue) => {
    updateSettingsMutation.mutate({
      [field]: !currentValue,
    });
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData, {
      onSuccess: () => setShowConfigModal(false),
    });
  };

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
      alert('እባክዎ ውድቅ የሚደረግበትን ምክንያት ያስገቡ');
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
        header: ({ column }) => <DataTableColumnHeader column={column} title="የምዝገባ ቁጥር" />,
        cell: ({ getValue }) => (
          <span className="font-mono font-bold text-[var(--brand-primary)] text-xs">
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'fullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሙሉ ስም" />,
        cell: ({ getValue }) => <span className="font-semibold text-slate-900 dark:text-white">{getValue()}</span>,
      },
      {
        accessorKey: 'grade',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የክፍል ደረጃ / ምድብ" />,
        cell: ({ getValue }) => <span>{getValue() || '—'}</span>,
      },
      {
        accessorKey: 'studentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ዓይነት" />,
        cell: ({ getValue }) => (
          <Badge variant={getValue() === 'distance' ? 'gold' : 'approved'} size="sm">
            {getValue() === 'distance' ? 'የርቀት' : 'መደበኛ'}
          </Badge>
        ),
      },
      {
        accessorKey: 'transactionRef',
        header: 'የግብይት መለያ',
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
            {getValue() || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'receiptUrl',
        header: 'ደረሰኝ',
        cell: ({ getValue }) => {
          const url = getValue();
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--brand-primary)] hover:underline text-xs font-semibold inline-flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> ደረሰኝ ይመልከቱ
            </a>
          ) : (
            <span className="text-slate-400 text-xs">ደረሰኝ የለም</span>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">ተግባር</div>,
        cell: ({ row }) => (
          <div className="text-right">
            <Button size="sm" variant="primary" onClick={() => openDetailModal(row.original)}>
              <Eye className="w-3.5 h-3.5 mr-1" /> መርምር
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
        title="የአዳዲስ ተማሪዎች ምዝገባ ፍተሻ"
        subtitle="የህዝብ ማመልከቻዎችን ይገምግሙ፣ የባንክ ግብይት ደረሰኞችን ያረጋግጡ እና ተማሪዎችን ወደ ስርዓቱ ያጽድቁ።"
        icon={UserCheck}
        badge={<Badge variant="gold" size="sm">{rawRegistrations.length} በመጠባበቅ ላይ</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading || isFetching} className="gap-1.5">
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>እደስ</span>
          </Button>
        }
      />

      {/* 🎛️ REGISTRATION INTAKE CONTROL PANEL */}
      <Card variant="default" padding="md" className="border-2 border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#1657b8] dark:text-blue-300 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <span>የምዝገባ ሁኔታ መቆጣጠሪያ</span>
                <Badge variant={regSettings.isRegistrationOpen !== false ? 'approved' : 'rejected'} size="sm">
                  {regSettings.isRegistrationOpen !== false ? '🟢 ክፍት ነው' : '🔴 ተዘግቷል'}
                </Badge>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                የአዳዲስ ተማሪዎች የመደበኛ እና የርቀት ምዝገባዎችን በቀጥታ ይክፈቱ ወይም ይዝጉ።
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfigModal(true)}
            className="gap-2 shrink-0"
          >
            <Sliders className="w-4 h-4" />
            <span>ማስታወቂያዎችንና ዓመተ ምሕረት አስተካክል</span>
          </Button>
        </div>

        {/* Quick Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Toggle 1: Master Switch */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            regSettings.isRegistrationOpen !== false
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">አጠቃላይ ምዝገባ</span>
              <span className={`text-sm font-black ${
                regSettings.isRegistrationOpen !== false ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {regSettings.isRegistrationOpen !== false ? '🟢 ሙሉ በሙሉ ክፍት' : '🔴 ሙሉ በሙሉ ተዘግቷል'}
              </span>
            </div>
            <Button
              size="sm"
              variant={regSettings.isRegistrationOpen !== false ? 'danger' : 'primary'}
              onClick={() => handleToggle('isRegistrationOpen', regSettings.isRegistrationOpen !== false)}
              disabled={updateSettingsMutation.isPending}
            >
              {regSettings.isRegistrationOpen !== false ? 'ዝጋ' : 'ክፈት'}
            </Button>
          </div>

          {/* Toggle 2: Regular (In-person) */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            regSettings.isRegularOpen !== false && regSettings.isRegistrationOpen !== false
              ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60'
              : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">🏛️ መደበኛ (በአካል)</span>
              <span className={`text-sm font-black ${
                regSettings.isRegularOpen !== false && regSettings.isRegistrationOpen !== false
                  ? 'text-[#1657b8] dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {regSettings.isRegularOpen !== false && regSettings.isRegistrationOpen !== false ? '🟢 ክፍት ነው' : '🔴 ተዘግቷል'}
              </span>
            </div>
            <Button
              size="sm"
              variant={regSettings.isRegularOpen !== false ? 'secondary' : 'primary'}
              onClick={() => handleToggle('isRegularOpen', regSettings.isRegularOpen !== false)}
              disabled={updateSettingsMutation.isPending || regSettings.isRegistrationOpen === false}
            >
              {regSettings.isRegularOpen !== false ? 'ዝጋ' : 'ክፈት'}
            </Button>
          </div>

          {/* Toggle 3: Distance (Online LMS) */}
          <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            regSettings.isDistanceOpen !== false && regSettings.isRegistrationOpen !== false
              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
              : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
          }`}>
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-0.5">🌐 የርቀት ትምህርት</span>
              <span className={`text-sm font-black ${
                regSettings.isDistanceOpen !== false && regSettings.isRegistrationOpen !== false
                  ? 'text-amber-800 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
                {regSettings.isDistanceOpen !== false && regSettings.isRegistrationOpen !== false ? '🟢 ክፍት ነው' : '🔴 ተዘግቷል'}
              </span>
            </div>
            <Button
              size="sm"
              variant={regSettings.isDistanceOpen !== false ? 'secondary' : 'primary'}
              onClick={() => handleToggle('isDistanceOpen', regSettings.isDistanceOpen !== false)}
              disabled={updateSettingsMutation.isPending || regSettings.isRegistrationOpen === false}
            >
              {regSettings.isDistanceOpen !== false ? 'ዝጋ' : 'ክፈት'}
            </Button>
          </div>
        </div>
      </Card>

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
            <option value="">ሁሉም ዓይነቶች</option>
            <option value="regular">መደበኛ</option>
            <option value="distance">የርቀት</option>
          </Select>
        </div>
      </div>

      {/* Registrations Table */}
      <DataTable
        columns={columns}
        data={filteredRegistrations}
        isLoading={isLoading}
        emptyMessage="ምንም በመጠባበቅ ላይ ያለ ምዝገባ አልተገኘም"
        emptyIcon={AlertCircle}
      />

      {/* Detail & Review Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRegistration && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowDetailModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 max-w-2xl w-full"
            >
              <Card variant="default" padding="none" className="w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-5 bg-gradient-to-r from-[var(--brand-primary)] to-indigo-950 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">የምዝገባ ማመልከቻ ዝርዝር</h3>
                    <p className="text-xs text-blue-200">የተማሪውን መረጃና ደረሰኝ ያረጋግጡ</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
                  {/* Top info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ሙሉ ስም</span>
                      <span className="text-slate-900 dark:text-white font-bold text-base">{selectedRegistration.fullName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የተማሪ ዓይነት</span>
                      <Badge variant={selectedRegistration.studentType === 'distance' ? 'gold' : 'approved'} size="sm">
                        {selectedRegistration.studentType === 'distance' ? 'የርቀት' : 'መደበኛ'}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የምዝገባ ቁጥር</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{selectedRegistration.registrationNumber}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የክፍል ደረጃ / ምድብ</span>
                      <span className="text-slate-900 dark:text-white font-medium">{selectedRegistration.grade}</span>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ስም</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.firstName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የአባት ስም</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.middleName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የአያት ስም</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.lastName || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ዕድሜ</span>
                      <span className="text-slate-900 dark:text-white font-semibold">{selectedRegistration.age || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የትምህርት ደረጃ</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.educationLevel || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ጾታ</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.gender || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የትውልድ ቀን</span>
                      <span className="text-slate-900 dark:text-white font-medium">{formatEthiopianDate(selectedRegistration.dateOfBirth)}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የተመዘገበበት ቀን</span>
                      <span className="text-slate-900 dark:text-white font-medium">{formatEthiopianDate(selectedRegistration.createdAt)}</span>
                    </div>
                    {selectedRegistration.studentType === 'regular' && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የመማሪያ ፈረቃ</span>
                        <Badge variant={selectedRegistration.shift === 'night' ? 'gold' : 'approved'} size="sm">
                          {selectedRegistration.shift === 'night' ? 'የማታ' : 'የቀን'}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ስልክ ቁጥር</span>
                      <span className="text-slate-900 dark:text-white font-mono">{selectedRegistration.phone}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ኢሜይል</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.email || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ክፍለ ከተማ</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.subcity || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ወረዳ</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.woreda || '—'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ቀበሌ / የቤት ቁጥር</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.kebele || '—'}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ተጨማሪ አድራሻ</span>
                      <span className="text-slate-900 dark:text-white">{selectedRegistration.address || '—'}</span>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-3">
                      የአደጋ ጊዜ ተጠሪ
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የተጠሪ ስም</span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {selectedRegistration.emergencyFirstName || selectedRegistration.parentName || '—'}{' '}
                          {selectedRegistration.emergencyMiddleName || ''}{' '}
                          {selectedRegistration.emergencyLastName || ''}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ዝምድና</span>
                        <span className="text-slate-900 dark:text-white">{selectedRegistration.relationship || 'ወላጅ/አሳዳጊ'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ስልክ ቁጥር</span>
                        <span className="text-slate-900 dark:text-white font-mono">
                          {selectedRegistration.emergencyPhone || selectedRegistration.parentPhone || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">ኢሜይል</span>
                        <span className="text-slate-900 dark:text-white">
                          {selectedRegistration.emergencyEmail || selectedRegistration.parentEmail || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment / Receipt */}
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-wider mb-3">
                      የክፍያና ደረሰኝ ማረጋገጫ
                    </h4>
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-0.5">የግብይት መለያ ቁጥር</span>
                        <span className="text-slate-900 dark:text-white font-mono font-bold">{selectedRegistration.transactionRef || '—'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[11px] block mb-1">የተያያዘ ደረሰኝ</span>
                        {selectedRegistration.receiptUrl ? (
                          <div>
                            {isImageUrl(selectedRegistration.receiptUrl) ? (
                              <a href={selectedRegistration.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <Image
                                  src={selectedRegistration.receiptUrl}
                                  alt="ደረሰኝ"
                                  width={384}
                                  height={260}
                                  unoptimized
                                  className="w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:opacity-90 transition-opacity object-contain"
                                />
                              </a>
                            ) : (
                              <a
                                href={selectedRegistration.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--brand-primary)] hover:underline text-xs font-bold inline-flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> የተያያዘውን ሰነድ ክፈት
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">ምንም ደረሰኝ አልተያያዘም</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(selectedRegistration._id)}
                    disabled={rejectMutation.isPending || approveMutation.isPending}
                    className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    <X className="w-4 h-4 mr-1" /> {rejectMutation.isPending ? 'በማስኬድ ላይ...' : 'ውድቅ አድርግ'}
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedRegistration._id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-1" /> {approveMutation.isPending ? 'በማስኬድ ላይ...' : 'አጽድቅና አካውንት ፍጠር'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ⚙️ Intake Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative z-10 max-w-lg w-full"
            >
              <Card variant="default" padding="none" className="w-full shadow-2xl overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-[var(--brand-primary)] to-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white">የምዝገባ ማስታወቂያዎችና ዓመተ ምሕረት</h3>
                    <p className="text-xs text-blue-200">ምዝገባ ሲዘጋ ለተማሪዎች የሚታዩ መልእክቶችን ያዘጋጁ</p>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSaveConfig} className="p-6 space-y-4 bg-white dark:bg-slate-900">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      የትምህርት ዘመን
                    </label>
                    <Input
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      placeholder="ለምሳሌ፡ 2017 ዓ.ም"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      አጠቃላይ የምዝገባ መዘጋት ማስታወቂያ
                    </label>
                    <textarea
                      value={formData.generalClosedMessage}
                      onChange={(e) => setFormData({ ...formData, generalClosedMessage: e.target.value })}
                      rows={2}
                      className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1657b8]"
                      placeholder="የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      የመደበኛ ምዝገባ መዘጋት ማስታወቂያ
                    </label>
                    <textarea
                      value={formData.regularClosedMessage}
                      onChange={(e) => setFormData({ ...formData, regularClosedMessage: e.target.value })}
                      rows={2}
                      className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1657b8]"
                      placeholder="የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      የርቀት ምዝገባ መዘጋት ማስታወቂያ
                    </label>
                    <textarea
                      value={formData.distanceClosedMessage}
                      onChange={(e) => setFormData({ ...formData, distanceClosedMessage: e.target.value })}
                      rows={2}
                      className="w-full text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1657b8]"
                      placeholder="የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConfigModal(false)}
                    >
                      ሰርዝ
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={updateSettingsMutation.isPending}
                    >
                      ቅንብሮችን አስቀምጥ
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistrationsManagement;