'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Download,
  QrCode,
  Search,
  Trash2,
  Edit,
  BookOpen,
  UserCheck,
  GraduationCap,
  Globe,
  Eye,
  CheckCircle2,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';

/**
 * Format grade values (e.g. "Grade 10", "GRADE 10", "10") into Amharic ("10ኛ ክፍል")
 */
export const formatGradeAmharic = (grade) => {
  if (!grade) return 'ያልተመደበ';
  const str = String(grade).trim();
  if (str.includes('ክፍል') || str.includes('ኛ')) return str;
  const match = str.match(/\d+/);
  if (match) {
    return `${match[0]}ኛ ክፍል`;
  }
  return str;
};

/**
 * Format learning type / shift (Weekend vs Night)
 */
export const formatShiftAmharic = (shift) => {
  if (!shift) return null;
  const s = String(shift).toLowerCase().trim();
  if (s === 'weekend' || s.includes('weekend') || s.includes('ቀን') || s.includes('ሳምንት')) {
    return 'የሳምንት መጨረሻ (Weekend)';
  }
  if (s === 'night' || s.includes('night') || s.includes('ማታ')) {
    return 'የማታ (Night)';
  }
  return shift;
};

/**
 * Format student count with proper singular/plural Amharic grammar
 */
export const formatStudentCount = (count) => {
  const num = Number(count) || 0;
  if (num === 1) return '1 ተማሪ';
  return `${num} ተማሪዎች`;
};

// Default high-fidelity mock data matching the Sunday School management system
export const initialMockStudents = [
  {
    _id: 'std-001',
    studentId: 'TKR-2019-0001',
    firstName: 'ዘለቀ',
    middleName: 'ፍስሃ',
    lastName: 'ገ/ህይወት',
    grade: 'Grade 10',
    studentType: 'regular',
    shift: 'weekend',
    contactPhone: '+251 911 234 567',
    email: 'zeleke.fisseha@example.com',
    qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/><rect x="20" y="20" width="10" height="10" fill="white"/><rect x="70" y="20" width="10" height="10" fill="white"/><rect x="20" y="70" width="10" height="10" fill="white"/><rect x="50" y="50" width="20" height="20" fill="black"/></svg>',
    teachers: [{ name: 'መምህር ዳዊት', course: 'ነገረ መለኮት' }],
    emergencyFirstName: 'ፍስሃ',
    emergencyLastName: 'ገ/ህይወት',
    relationship: 'አባት',
    emergencyPhone: '+251 912 345 678',
  },
  {
    _id: 'std-002',
    studentId: 'TKR-2019-0002',
    firstName: 'ማርታ',
    middleName: 'ተክሌ',
    lastName: 'ወልደማርያም',
    grade: 'Grade 8',
    studentType: 'regular',
    shift: 'night',
    contactPhone: '+251 922 456 789',
    email: 'marta.tekle@example.com',
    qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/></svg>',
    teachers: [{ name: 'መምህር ዮሐንስ', course: 'የቤተክርስቲያን ታሪክ' }],
    emergencyFirstName: 'ተክሌ',
    emergencyLastName: 'ወልደማርያም',
    relationship: 'አባት',
    emergencyPhone: '+251 922 111 222',
  },
  {
    _id: 'std-003',
    studentId: 'TKR-2020-0045',
    firstName: 'አቤል',
    middleName: 'ዮናስ',
    lastName: 'ተስፋዬ',
    grade: 'Grade 12',
    studentType: 'distance',
    shift: 'night',
    contactPhone: '+251 933 567 890',
    email: 'abel.yonas@example.com',
    qrCode: null,
    teachers: [],
    emergencyFirstName: 'ዮናስ',
    emergencyLastName: 'ተስፋዬ',
    relationship: 'አባት',
    emergencyPhone: '+251 933 999 888',
  },
  {
    _id: 'std-004',
    studentId: 'TKR-2021-0089',
    firstName: 'ሰላማዊት',
    middleName: 'ግርማ',
    lastName: 'አሰፋ',
    grade: 'Grade 9',
    studentType: 'regular',
    shift: 'weekend',
    contactPhone: '+251 944 678 901',
    email: 'selamawit.g@example.com',
    qrCode: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/></svg>',
    teachers: [{ name: 'መምህር ሳሙኤል', course: 'ግእዝ ቋንቋ' }],
    emergencyFirstName: 'ግርማ',
    emergencyLastName: 'አሰፋ',
    relationship: 'አባት',
    emergencyPhone: '+251 944 333 444',
  },
];

/**
 * Accessible Lightweight Tooltip Component
 */
const SimpleTooltip = ({ content, children }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-lg border border-slate-700/60 whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      )}
    </div>
  );
};

export default function StudentManagementTable({
  initialStudents = initialMockStudents,
  onAddNewStudent,
  onExportCsv,
  onGenerateBatchQr,
  onEditStudent,
}) {
  // State
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [qrFilter, setQrFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Modals state
  const [activeStudent, setActiveStudent] = useState(null);
  const [modalType, setModalType] = useState(null); // 'profile' | 'qr' | 'course' | null
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI Metrics Calculation
  const stats = useMemo(() => {
    return {
      total: students.length,
      regular: students.filter((s) => s.studentType === 'regular').length,
      distance: students.filter((s) => s.studentType === 'distance').length,
      withQR: students.filter((s) => Boolean(s.qrCode)).length,
    };
  }, [students]);

  // Filtered dataset (Including search, grade, studentType, shift/learning type, qrStatus)
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase();
      const sId = (s.studentId || '').toLowerCase();
      const phone = (s.contactPhone || '').toLowerCase();
      const query = search.toLowerCase().trim();

      const matchesSearch = !query || fullName.includes(query) || sId.includes(query) || phone.includes(query);
      const matchesGrade = !gradeFilter || s.grade === gradeFilter;
      const matchesType = !typeFilter || s.studentType === typeFilter;
      const matchesShift = !shiftFilter || s.shift === shiftFilter;
      const matchesQr =
        !qrFilter || (qrFilter === 'with_qr' ? Boolean(s.qrCode) : !s.qrCode);

      return matchesSearch && matchesGrade && matchesType && matchesShift && matchesQr;
    });
  }, [students, search, gradeFilter, typeFilter, shiftFilter, qrFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Selection handlers
  const isAllSelected =
    paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedIds.has(s._id));
  const isSomeSelected =
    paginatedStudents.some((s) => selectedIds.has(s._id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedIds);
      paginatedStudents.forEach((s) => newSet.delete(s._id));
      setSelectedIds(newSet);
    } else {
      const newSet = new Set(selectedIds);
      paginatedStudents.forEach((s) => newSet.add(s._id));
      setSelectedIds(newSet);
    }
  };

  const handleToggleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // Bulk Delete
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`እርግጠኛ ነዎት ${selectedIds.size} ተማሪዎችን መሰረዝ ይፈልጋሉ?`)) {
      setStudents((prev) => prev.filter((s) => !selectedIds.has(s._id)));
      setSelectedIds(new Set());
      showToast('የተመረጡት ተማሪዎች በተሳካ ሁኔታ ተሰርዘዋል');
    }
  };

  // Batch QR Generation
  const handleBatchQr = () => {
    if (onGenerateBatchQr) {
      onGenerateBatchQr();
      return;
    }
    setIsGeneratingAll(true);
    setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          qrCode:
            s.qrCode ||
            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/></svg>',
        }))
      );
      setIsGeneratingAll(false);
      showToast('ለሁሉም ተማሪዎች QR ኮድ ተዘጋጅቷል');
    }, 600);
  };

  // Generate QR for single student
  const handleGenerateSingleQr = (studentId) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId
          ? {
              ...s,
              qrCode:
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="white"/><rect x="10" y="10" width="30" height="30" fill="black"/><rect x="60" y="10" width="30" height="30" fill="black"/><rect x="10" y="60" width="30" height="30" fill="black"/></svg>',
            }
          : s
      )
    );
    showToast('ለተማሪው QR ኮድ ተዘጋጅቷል');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    const headers = 'ID,Name,Grade,Type,Shift,Phone,Status\n';
    const rows = filteredStudents
      .map(
        (s) =>
          `"${s.studentId}","${s.firstName} ${s.lastName}","${s.grade}","${s.studentType}","${s.shift || ''}","${s.contactPhone || ''}","${s.qrCode ? 'Active' : 'No QR'}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('የተማሪዎች መረጃ ወደ CSV ተልኳል');
  };

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200 text-xs sm:text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                የተማሪዎች አስተዳደር
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                {formatStudentCount(stats.total)}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              ተማሪዎችን ያስተዳድሩ፤ መምህራንን እና ኮርሶችን ይመድቡ፤ የ QR ኮድ ያመንጩ
            </p>
          </div>
        </div>

        {/* Action Button Visual Hierarchy */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Secondary Action 2: CSV Export */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors focus:outline-none"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>መረጃ ላክ (CSV)</span>
          </button>

          {/* Secondary Action 1: Batch QR Generation */}
          <button
            type="button"
            onClick={handleBatchQr}
            disabled={isGeneratingAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs transition-colors focus:outline-none disabled:opacity-50"
          >
            <QrCode className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>{isGeneratingAll ? 'በማመንጨት ላይ...' : 'ሁሉንም QR አመንጭ'}</span>
          </button>

          {/* Primary Action: Add New Student */}
          <button
            type="button"
            onClick={() => {
              if (onAddNewStudent) onAddNewStudent();
              else window.location.href = '/admin/add-student';
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#1d4ed8] hover:bg-[#1e3a8a] active:bg-[#1e3a8a] text-white shadow-sm transition-colors focus:outline-none"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ አዲስ ተማሪ</span>
          </button>
        </div>
      </div>

      {/* 2. Metric KPI Cards (Visual Anchors) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                አጠቃላይ ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
                {stats.total}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Regular Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                መደበኛ ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1.5 tracking-tight">
                {stats.regular}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Distance Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                የርቀት ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1.5 tracking-tight">
                {stats.distance}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* QR Badge Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                QR ያላቸው ተማሪዎች
              </p>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5 tracking-tight">
                {stats.withQR}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Single Unified Search & Filter Bar (With Weekend / Night Filter) */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="በስም፣ በመለያ ወይም በስልክ ቁጥር ይፈልጉ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Dropdown 1: Classes (1ኛ - 12ኛ ክፍል) */}
        <div className="w-full sm:w-auto min-w-[130px]">
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">ሁሉም ክፍሎች</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={`Grade ${g}`}>
                {g}ኛ ክፍል
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Student Type Filter (መደበኛ / ርቀት) */}
        <div className="w-full sm:w-auto min-w-[140px]">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">ሁሉም ዓይነቶች</option>
            <option value="regular">መደበኛ</option>
            <option value="distance">የርቀት</option>
          </select>
        </div>

        {/* Dropdown 3: Learning Type / Shift Filter (Weekend vs Night) */}
        <div className="w-full sm:w-auto min-w-[165px]">
          <select
            value={shiftFilter}
            onChange={(e) => {
              setShiftFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">የመማሪያ ፈረቃ (ሁሉም)</option>
            <option value="weekend">የሳምንት መጨረሻ (Weekend)</option>
            <option value="night">የማታ (Night)</option>
          </select>
        </div>

        {/* Dropdown 4: QR Status Filter */}
        <div className="w-full sm:w-auto min-w-[130px]">
          <select
            value={qrFilter}
            onChange={(e) => {
              setQrFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">የQR ሁኔታ</option>
            <option value="with_qr">የተዘጋጀለት</option>
            <option value="without_qr">የሌለው</option>
          </select>
        </div>

        {/* Bulk Action Button */}
        {selectedIds.size > 0 && (
          <button
            type="button"
            onClick={handleBulkDelete}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>ሰርዝ ({selectedIds.size})</span>
          </button>
        )}
      </div>

      {/* 4. Enhanced Data Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {/* Select All Checkbox */}
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                  />
                </th>

                {/* Student Name */}
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1 cursor-pointer select-none">
                    <span>የተማሪ ስም</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* Student ID */}
                <th className="py-3 px-4">የተማሪ መለያ</th>

                {/* Grade Level */}
                <th className="py-3 px-4">የትምህርት ደረጃ</th>

                {/* Registration Type & Learning Shift */}
                <th className="py-3 px-4">ዓይነት / ፈረቃ</th>

                {/* Assigned Teachers */}
                <th className="py-3 px-4">የኮርስ መምህራን</th>

                {/* QR Code Status */}
                <th className="py-3 px-4">የQR ኮድ ሁኔታ</th>

                {/* Row Actions */}
                <th className="py-3 px-4 text-right">ተግባራት</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="font-semibold text-sm">ምንም ተማሪ አልተገኘም</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => {
                  const isSelected = selectedIds.has(s._id);
                  const fullName =
                    [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') ||
                    s.fullName ||
                    'ስም ያልተጠቀሰ';

                  return (
                    <tr
                      key={s._id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(s._id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 cursor-pointer"
                        />
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs uppercase">
                            {s.firstName ? s.firstName.charAt(0) : 'ተ'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block leading-tight truncate">
                              {fullName}
                            </span>
                            {s.contactPhone && (
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono block">
                                {s.contactPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Student ID (Monospace) */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded tracking-wider border border-slate-200/60 dark:border-slate-700/60 inline-block">
                          {s.studentId || '-'}
                        </span>
                      </td>

                      {/* Grade Level (Localized Amharic Badge) */}
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2 py-0.5 rounded text-xs inline-flex items-center">
                          {formatGradeAmharic(s.grade)}
                        </span>
                      </td>

                      {/* Registration Type & Learning Shift Badge */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {s.studentType === 'distance' ? (
                            <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              <span>የርቀት</span>
                            </span>
                          ) : (
                            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              <span>መደበኛ</span>
                            </span>
                          )}

                          {/* Learning Type / Shift Badge */}
                          {s.shift === 'night' ? (
                            <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                              <Moon className="w-2.5 h-2.5" />
                              <span>የማታ (Night)</span>
                            </span>
                          ) : s.shift === 'weekend' ? (
                            <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                              <Sun className="w-2.5 h-2.5" />
                              <span>የሳምንት መጨረሻ</span>
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Assigned Teachers */}
                      <td className="py-3 px-4">
                        {s.teachers && s.teachers.length > 0 ? (
                          <div className="flex flex-col gap-0.5 max-w-[200px]">
                            {s.teachers.map((t, idx) => (
                              <div key={idx} className="text-xs leading-tight">
                                <span className="font-bold text-slate-800 dark:text-slate-200">{t.name}</span>
                                {t.course && (
                                  <span className="text-[10px] text-slate-400 ml-1">({t.course})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">ያልተመደበ</span>
                        )}
                      </td>

                      {/* QR Status Chip */}
                      <td className="py-3 px-4">
                        {s.qrCode ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStudent(s);
                              setModalType('qr');
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>✓ ተዘጋጅቷል</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGenerateSingleQr(s._id)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-500" />
                            <span>አልተዘጋጀም (አመንጭ)</span>
                          </button>
                        )}
                      </td>

                      {/* Row Action Icons with Tooltips */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* 1. View Profile */}
                          <SimpleTooltip content="የተማሪ መረጃ (View Profile)">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStudent(s);
                                setModalType('profile');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                              aria-label="የተማሪ መረጃ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </SimpleTooltip>

                          {/* 2. Enrolled Courses */}
                          <SimpleTooltip content="የተመዘገቡ ኮርሶች (Enrolled Courses)">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStudent(s);
                                setModalType('course');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                              aria-label="የተመዘገቡ ኮርሶች"
                            >
                              <BookOpen className="w-4 h-4" />
                            </button>
                          </SimpleTooltip>

                          {/* 3. View/Print QR Badge */}
                          <SimpleTooltip content="የQR ባጅ አሳይ / አትም (View/Print QR Badge)">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStudent(s);
                                setModalType('qr');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              aria-label="የQR ባጅ አሳይ / አትም"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          </SimpleTooltip>

                          {/* 4. Edit Student */}
                          <SimpleTooltip content="አስተካክል (Edit Student)">
                            <button
                              type="button"
                              onClick={() => {
                                if (onEditStudent) onEditStudent(s);
                                else window.location.href = `/admin/edit-student/${s._id}`;
                              }}
                              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              aria-label="አስተካክል"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </SimpleTooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Table Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedIds.size}</span> ከ{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredStudents.length}
              </span>{' '}
              ረድፎች ተመርጠዋል
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap font-medium">በአንድ ገጽ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
              ገጽ <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> ከ{' '}
              <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="የመጀመሪያ ገጽ"
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="ያለፈው ገጽ"
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="ቀጣይ ገጽ"
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="የመጨረሻ ገጽ"
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Modal */}
      {modalType === 'profile' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">የተማሪ ዝርዝር መረጃ</h3>
                  <p className="text-xs text-slate-500">ተክለ ሳዊሮስ ሰንበት ት/ቤት</p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md">
                  {activeStudent.firstName ? activeStudent.firstName.charAt(0) : 'ተ'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {[activeStudent.firstName, activeStudent.middleName, activeStudent.lastName]
                      .filter(Boolean)
                      .join(' ')}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {activeStudent.studentId}
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs px-2 py-0.5 rounded font-medium">
                      {formatGradeAmharic(activeStudent.grade)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">ዓይነት</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {activeStudent.studentType === 'distance' ? 'የርቀት ተማሪ' : 'መደበኛ ተማሪ'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">የመማሪያ ፈረቃ</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {formatShiftAmharic(activeStudent.shift) || 'ያልተገለጸ'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">የQR ሁኔታ</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {activeStudent.qrCode ? '✓ ተዘጋጅቷል' : 'አልተዘጋጀም'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">ስልክ ቁጥር</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                    {activeStudent.contactPhone || 'ያልተገለጸ'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 col-span-2">
                  <span className="text-slate-400 block font-medium">ኢሜይል</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                    {activeStudent.email || 'ያልተገለጸ'}
                  </span>
                </div>
              </div>

              {activeStudent.emergencyFirstName && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                  <p className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>የአደጋ ጊዜ ተጠሪ</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {activeStudent.emergencyFirstName} {activeStudent.emergencyLastName} ({activeStudent.relationship}) —{' '}
                    <span className="font-mono font-semibold">{activeStudent.emergencyPhone}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Badge View & Print Modal */}
      {modalType === 'qr' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                <span>የተማሪ ዲጂታል QR ባጅ</span>
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-full p-6 rounded-2xl bg-gradient-to-b from-[#124796] via-[#0e3b7d] to-[#08224d] text-white shadow-xl border border-blue-400/30 flex flex-col items-center relative overflow-hidden">
                <div className="text-[11px] font-bold text-amber-300 tracking-wider uppercase mb-1">
                  ተክለ ሳዊሮስ ሰንበት ት/ቤት
                </div>
                <div className="text-xs text-blue-200 mb-3">የተማሪ መታወቂያ ባጅ</div>

                <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-amber-400 flex items-center justify-center text-2xl font-black mb-3 shadow-inner">
                  {activeStudent.firstName ? activeStudent.firstName.charAt(0) : 'ተ'}
                </div>

                <div className="font-extrabold text-base text-white">
                  {[activeStudent.firstName, activeStudent.middleName, activeStudent.lastName]
                    .filter(Boolean)
                    .join(' ')}
                </div>

                <div className="text-xs text-blue-300 font-mono tracking-wider mt-0.5">
                  ID: {activeStudent.studentId}
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[11px] font-semibold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                    {formatGradeAmharic(activeStudent.grade)}
                  </span>
                  {activeStudent.shift && (
                    <span className="text-[10px] font-semibold bg-blue-800 text-blue-100 px-2 py-0.5 rounded-full">
                      {formatShiftAmharic(activeStudent.shift)}
                    </span>
                  )}
                </div>

                <div className="mt-4 p-3 bg-white rounded-xl shadow-lg">
                  {activeStudent.qrCode ? (
                    <img src={activeStudent.qrCode} alt="Student QR" className="w-32 h-32 object-contain" />
                  ) : (
                    <div className="w-32 h-32 flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-2 border border-slate-200 rounded-lg">
                      <QrCode className="w-16 h-16 text-slate-800" />
                      <span className="text-[9px] font-mono mt-1 font-bold">{activeStudent.studentId}</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-blue-200/80 mt-3">
                  ለመገኘት እና ለማረጋገጫ ይህን ኮድ ይጠቀሙ
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ዝጋ
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] hover:bg-[#1e3a8a] text-white shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>ባጅ አትም (Print)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Modal */}
      {modalType === 'course' && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">የተመዘገቡ ኮርሶች</h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              የተማሪ {activeStudent.firstName} {activeStudent.lastName} ኮርሶች እና መምህራን
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activeStudent.teachers && activeStudent.teachers.length > 0 ? (
                activeStudent.teachers.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.course || 'አጠቃላይ ትምህርት'}</p>
                      <p className="text-slate-400 mt-0.5">አስተማሪ: {t.name}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                      በመማር ላይ
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ምንም የተመደበ ኮርስ የለም
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
