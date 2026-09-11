'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  RefreshCw,
  List,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Sparkles,
  Clock,
  Users,
  Check,
  ShieldAlert,
  Search,
  BookOpen,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  Button,
  Badge,
  DataTable,
  DataTableColumnHeader,
  Input,
  Select,
  EthiopianDatePicker,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui';
import {
  useAcademicYears,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useSetActiveAcademicYear,
  useDeleteAcademicYear,
} from '../../hooks/queries/useAcademic';
import {
  formatEthiopianDate,
  getEthiopianAcademicYearDates,
} from '../../utils/ethiopianDate';

const ETHIOPIAN_YEAR_PRESETS = [
  { year: 2016, label: '2016 ዓ.ም' },
  { year: 2017, label: '2017 ዓ.ም' },
  { year: 2018, label: '2018 ዓ.ም' },
  { year: 2019, label: '2019 ዓ.ም' },
  { year: 2020, label: '2020 ዓ.ም' },
  { year: 2021, label: '2021 ዓ.ም' },
  { year: 2022, label: '2022 ዓ.ም' },
];

const AcademicYearsManagement = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '2018 ዓ.ም',
    startDate: '',
    endDate: '',
    status: 'inactive',
    description: '',
    setAsActive: false,
  });

  // Queries & Mutations
  const { data: years = [], isLoading, isFetching, refetch } = useAcademicYears();
  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();
  const setActiveMutation = useSetActiveAcademicYear();
  const deleteMutation = useDeleteAcademicYear();

  // Active Year Finder
  const activeAcademicYear = useMemo(() => {
    return years.find((y) => y.status === 'active') || null;
  }, [years]);

  // Statistics
  const stats = useMemo(() => {
    const total = years.length;
    const active = years.filter((y) => y.status === 'active').length;
    const upcoming = years.filter((y) => y.status === 'inactive').length;
    const completed = years.filter((y) => y.status === 'completed' || y.status === 'archived').length;
    const totalStudents = years.reduce((acc, y) => acc + (y.totalStudents || 0), 0);

    return { total, active, upcoming, completed, totalStudents };
  }, [years]);

  // Filtered Years
  const filteredYears = useMemo(() => {
    return years.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [years, searchQuery, statusFilter]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingYear(null);
    const defaultYear = 2018;
    const dates = getEthiopianAcademicYearDates(defaultYear);
    setFormData({
      name: `${defaultYear} ዓ.ም`,
      startDate: dates.startDate,
      endDate: dates.endDate,
      status: 'inactive',
      description: `የ${defaultYear} ዓ.ም የሰንበት ት/ቤት የትምህርት ዘመን`,
      setAsActive: false,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (year) => {
    setEditingYear(year);
    setFormData({
      name: year.name || '',
      startDate: year.startDate ? new Date(year.startDate).toISOString().split('T')[0] : '',
      endDate: year.endDate ? new Date(year.endDate).toISOString().split('T')[0] : '',
      status: year.status || 'inactive',
      description: year.description || '',
      setAsActive: year.status === 'active',
    });
    setIsModalOpen(true);
  };

  // Select Preset Year
  const handleSelectPreset = (yearNum) => {
    const dates = getEthiopianAcademicYearDates(yearNum);
    setFormData((prev) => ({
      ...prev,
      name: `${yearNum} ዓ.ም`,
      startDate: dates.startDate,
      endDate: dates.endDate,
      description: prev.description ? prev.description : `የ${yearNum} ዓ.ም የሰንበት ት/ቤት የትምህርት ዘመን`,
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingYear) {
      await updateMutation.mutateAsync({
        id: editingYear._id,
        name: formData.name,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.status,
        description: formData.description,
      });
    } else {
      await createMutation.mutateAsync({
        name: formData.name,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.setAsActive ? 'active' : formData.status,
        description: formData.description,
        setAsActive: formData.setAsActive,
      });
    }
    setIsModalOpen(false);
  };

  // Quick Set Active
  const handleQuickSetActive = async (yearId) => {
    await setActiveMutation.mutateAsync(yearId);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (year) => {
    setYearToDelete(year);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!yearToDelete) return;
    await deleteMutation.mutateAsync(yearToDelete._id);
    setIsDeleteModalOpen(false);
    setYearToDelete(null);
  };

  // Table Columns Definition
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የትምህርት ዘመን" />,
        cell: ({ row }) => {
          const year = row.original;
          const isActive = year.status === 'active';
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isActive ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Calendar className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">{year.name}</span>
                  {isActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      አሁን ንቁ
                    </span>
                  )}
                </div>
                {year.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{year.description}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የመጀመሪያ ቀን" />,
        cell: ({ getValue }) => (
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {getValue() ? formatEthiopianDate(getValue()) : '—'}
          </div>
        ),
      },
      {
        accessorKey: 'endDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የማብቂያ ቀን" />,
        cell: ({ getValue }) => (
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {getValue() ? formatEthiopianDate(getValue()) : '—'}
          </div>
        ),
      },
      {
        accessorKey: 'totalStudents',
        header: ({ column }) => <DataTableColumnHeader column={column} title="የተመዘገቡ ተማሪዎች" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Users className="w-3.5 h-3.5 text-[#1657b8]" />
            <span>{row.original.totalStudents || 0} ተማሪዎች</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title="ሁኔታ" />,
        cell: ({ getValue }) => {
          const val = getValue();
          if (val === 'active') return <Badge variant="approved" size="sm">ንቁ</Badge>;
          if (val === 'completed') return <Badge variant="blue" size="sm">የተጠናቀቀ</Badge>;
          if (val === 'archived') return <Badge variant="rose" size="sm">በማህደር</Badge>;
          return <Badge variant="neutral" size="sm">ቀጣይ</Badge>;
        },
      },
      {
        id: 'actions',
        header: () => <span className="text-right block">ተግባራት</span>,
        cell: ({ row }) => {
          const year = row.original;
          const isActive = year.status === 'active';
          return (
            <div className="flex items-center justify-end gap-1.5">
              {!isActive && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleQuickSetActive(year._id)}
                  disabled={setActiveMutation.isPending}
                  className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-[11px] gap-1 font-semibold"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ንቁ አድርግ</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleOpenEditModal(year)}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-1.5"
                title="አስተካክል"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => handleOpenDeleteModal(year)}
                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5"
                title="ሰርዝ"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [setActiveMutation.isPending]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="የትምህርት ዘመናት"
        subtitle="የሰንበት ትምህርት ቤቱን የኢትዮጵያ የቀን አቆጣጠር የትምህርት ዘመናት፣ የጊዜ ገደቦች እና ንቁ ሁኔታዎችን ያስተዳድሩ"
        icon={Calendar}
        badge={<Badge variant="gold" size="sm">{years.length} የትምህርት ዘመናት</Badge>}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 bg-slate-100 dark:bg-slate-900">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 shadow-xs text-[#1657b8] dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>ካርድ</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 shadow-xs text-[#1657b8] dark:text-blue-400'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>ሰንጠረዥ</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>አድስ</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="gap-2 bg-gradient-to-r from-[#1657b8] to-[#0f3c80] text-white shadow-md shadow-blue-500/20 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>አዲስ የትምህርት ዘመን መዝግብ</span>
            </Button>
          </div>
        }
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Year Highlight Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1657b8] via-[#104391] to-[#0a2c63] text-white p-5 shadow-lg shadow-blue-900/15 sm:col-span-2">
          <div className="absolute right-3 -bottom-4 text-white/10 pointer-events-none">
            <Calendar className="w-36 h-36" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                አሁን የሚሠራበት ንቁ የትምህርት ዘመን
              </span>
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {activeAcademicYear ? activeAcademicYear.name : 'አልተመረጠም'}
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                {activeAcademicYear?.startDate && activeAcademicYear?.endDate ? (
                  <span>
                    {formatEthiopianDate(activeAcademicYear.startDate)} — {formatEthiopianDate(activeAcademicYear.endDate)}
                  </span>
                ) : (
                  <span>የቆይታ ቀን አልተወሰነም</span>
                )}
              </p>
            </div>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-blue-200 font-semibold">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-300" />
                <span>መደበኛ እና የርቀት ትምህርት ምዝገባ ክፍት የሆነበት</span>
              </div>
              {activeAcademicYear && (
                <button
                  onClick={() => handleOpenEditModal(activeAcademicYear)}
                  className="text-white hover:text-amber-300 font-bold underline underline-offset-4 transition-colors"
                >
                  አስተካክል →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Total Years Metric */}
        <Card variant="default" padding="md" className="flex flex-col justify-between rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ጠቅላላ የትምህርት ዘመናት
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">ዘመናት</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.active} ንቁ</span>
            <span>•</span>
            <span className="text-slate-600 dark:text-slate-300 font-bold">{stats.upcoming} ቀጣይ</span>
            <span>•</span>
            <span className="text-slate-400 font-bold">{stats.completed} ያለፉ</span>
          </div>
        </Card>

        {/* Total Enrolled Students */}
        <Card variant="default" padding="md" className="flex flex-col justify-between rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              የተማሪዎች ምዝገባ
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalStudents}</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">ጠቅላላ ተማሪዎች</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            በተመዘገቡት የትምህርት ዘመናት ውስጥ የተሳተፉ
          </p>
        </Card>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="በትምህርት ዘመን ስም ፈልግ (ለምሳሌ፡ 2017)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: 'ሁሉም' },
            { key: 'active', label: 'ንቁ' },
            { key: 'inactive', label: 'ቀጣይ' },
            { key: 'completed', label: 'የተጠናቀቀ' },
            { key: 'archived', label: 'በማህደር' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-[#1657b8] text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Content Area (Grid or Table) */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredYears}
          isLoading={isLoading}
          emptyMessage="ምንም የትምህርት ዘመን አልተገኘም"
          emptyIcon={Calendar}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredYears.map((year) => {
            const isActive = year.status === 'active';
            const isCompleted = year.status === 'completed';
            const isArchived = year.status === 'archived';

            return (
              <div
                key={year._id}
                className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-white to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border-2 border-[#1657b8] dark:border-blue-500 shadow-xl shadow-blue-500/10'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Active Glow Badge */}
                {isActive && (
                  <div className="absolute -top-3 right-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      ንቁ የትምህርት ዘመን
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Header: Year Name & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                          isActive
                            ? 'bg-[#1657b8] text-white shadow-md shadow-blue-500/25'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {year.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          የኢትዮጵያ የቀን አቆጣጠር
                        </p>
                      </div>
                    </div>

                    {!isActive && (
                      <Badge
                        variant={isCompleted ? 'blue' : isArchived ? 'rose' : 'neutral'}
                        size="sm"
                      >
                        {isCompleted ? 'የተጠናቀቀ' : isArchived ? 'በማህደር' : 'ቀጣይ'}
                      </Badge>
                    )}
                  </div>

                  {/* Dates Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1657b8]" />
                      <span>የትምህርት ዘመን ቆይታ</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">መጀመሪያ፡</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {year.startDate ? formatEthiopianDate(year.startDate) : 'ያልተወሰነ'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">ማብቂያ፡</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {year.endDate ? formatEthiopianDate(year.endDate) : 'ያልተወሰነ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Notes */}
                  {year.description ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {year.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-4">ምንም ተጨማሪ ማብራሪያ የለም</p>
                  )}
                </div>

                {/* Card Footer: Enrollment Count & Action Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Users className="w-3.5 h-3.5 text-[#1657b8]" />
                    <span>{year.totalStudents || 0} ተማሪዎች</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isActive && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleQuickSetActive(year._id)}
                        disabled={setActiveMutation.isPending}
                        className="text-emerald-700 hover:text-white hover:bg-emerald-600 border-emerald-300 dark:border-emerald-800 text-xs font-bold gap-1 px-2.5 py-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ንቁ አድርግ</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenEditModal(year)}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2 rounded-xl"
                      title="አስተካክል"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleOpenDeleteModal(year)}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-2 rounded-xl"
                      title="ሰርዝ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredYears.length === 0 && (
        <Card variant="default" padding="lg" className="text-center py-12 rounded-3xl border-slate-200 dark:border-slate-800">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">ምንም የትምህርት ዘመን አልተገኘም</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            የተፈለገው ማጣሪያ ጋር የሚስማማ የትምህርት ዘመን አልተገኘም። እባክዎ አዲስ የትምህርት ዘመን ይፍጠሩ ወይም ማጣሪያውን ያስተካክሉ።
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="mt-4 gap-2 bg-[#1657b8] text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>አዲስ የትምህርት ዘመን መዝግብ</span>
          </Button>
        </Card>
      )}

      {/* 5. Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#1657b8] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span>
                {editingYear ? 'የትምህርት ዘመን ማሻሻያ' : 'አዲስ የኢትዮጵያ የትምህርት ዘመን መመዝገቢያ'}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              የትምህርት ዘመኑን ስም፣ መጀመሪያና ማብቂያ ቀን በኢትዮጵያ የቀን አቆጣጠር (ዓ.ም) ይምረጡ።
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 my-2">
            {/* Year Quick Presets (for create mode) */}
            {!editingYear && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  ፈጣን የኢትዮጵያ ዓመተ ምሕረት መምረጫ
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ETHIOPIAN_YEAR_PRESETS.map((p) => {
                    const isSelected = formData.name === p.label;
                    return (
                      <button
                        type="button"
                        key={p.year}
                        onClick={() => handleSelectPreset(p.year)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#1657b8] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Academic Year Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                የትምህርት ዘመን ስም <span className="text-rose-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ለምሳሌ፡ 2017 ዓ.ም"
                required
                className="font-bold text-sm"
              />
            </div>

            {/* Start Date (Ethiopian Date Picker) */}
            <EthiopianDatePicker
              label="የትምህርት ዘመን መጀመሪያ ቀን (መስከረም 1)"
              value={formData.startDate}
              onChange={(val) => setFormData({ ...formData, startDate: val })}
              required
            />

            {/* End Date (Ethiopian Date Picker) */}
            <EthiopianDatePicker
              label="የትምህርት ዘመን ማብቂያ ቀን (ጳጉሜን 5/6)"
              value={formData.endDate}
              onChange={(val) => setFormData({ ...formData, endDate: val })}
              required
            />

            {/* Status Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                የዘመኑ ሁኔታ
              </label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">ንቁ (አሁን የሚሠራበት)</option>
                <option value="inactive">ቀጣይ / ያልጀመረ</option>
                <option value="completed">የተጠናቀቀ (ያለፈ)</option>
                <option value="archived">በማህደር የተቀመጠ</option>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                ማብራሪያ / ማስታወሻ
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="ስለዚህ የትምህርት ዘመን ተጨማሪ ማስታወሻ..."
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-slate-800 dark:text-white"
              />
            </div>

            {/* Set as Active Checkbox */}
            {!editingYear && (
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.setAsActive}
                  onChange={(e) => setFormData({ ...formData, setAsActive: e.target.checked })}
                  className="w-4 h-4 rounded text-[#1657b8] focus:ring-[#1657b8]"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ይህንን የትምህርት ዘመን አሁን ንቁ አድርግ እና የመመዝገቢያ ዘመን አድርገው
                </span>
              </label>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                ይቅር
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#1657b8] text-white text-xs font-bold"
              >
                {createMutation.isPending || updateMutation.isPending ? 'እየተመዘገበ ነው...' : editingYear ? 'አሻሽል' : 'መዝግብ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 6. Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-bold">
              <ShieldAlert className="w-5 h-5" />
              <span>የትምህርት ዘመን መሰረዝ</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 mt-2">
              እርግጠኛ ነዎት <strong className="text-slate-900 dark:text-white font-bold">{yearToDelete?.name}</strong> የትምህርት ዘመንን መሰረዝ ይፈልጋሉ?
              {yearToDelete?.totalStudents > 0 && (
                <span className="block mt-2 text-rose-500 font-semibold">
                  ⚠️ ማሳሰቢያ፡ ይህ የትምህርት ዘመን ከ{yearToDelete.totalStudents} ተማሪዎች ጋር የተያያዘ ነው። ከተቻለ በማህደር ማስቀመጥ ይመረጣል።
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              ይቅር
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-rose-600 text-white text-xs font-bold"
            >
              {deleteMutation.isPending ? 'እየተሰረዘ ነው...' : 'ሰርዝ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicYearsManagement;