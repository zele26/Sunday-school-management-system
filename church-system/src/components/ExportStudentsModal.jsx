'use client';

import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Download,
  X,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckSquare,
  Square,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { apiFetch } from '../api/apiClient';
import useAuthStore from '../store/authStore';
import { formatGradeAmharic, formatShiftAmharic } from '../constants/registrationOptions';
import { formatEthiopianDate } from '../utils/ethiopianDate';

const AVAILABLE_COLUMNS = [
  { id: 'studentId', label: 'የተማሪ መለያ (Student ID)', group: 'basic', default: true },
  { id: 'registrationNumber', label: 'የምዝገባ ቁጥር (Reg No)', group: 'basic', default: true },
  { id: 'fullName', label: 'ሙሉ ስም (Full Name)', group: 'basic', default: true },
  { id: 'firstName', label: 'ስም (First Name)', group: 'basic', default: false },
  { id: 'middleName', label: 'የአባት ስም (Father Name)', group: 'basic', default: false },
  { id: 'lastName', label: 'የአያት ስም (Grandfather Name)', group: 'basic', default: false },
  { id: 'christianName', label: 'የክርስትና ስም (Christian Name)', group: 'spiritual', default: true },
  { id: 'gender', label: 'ጾታ (Gender)', group: 'basic', default: true },
  { id: 'age', label: 'ዕድሜ (Age)', group: 'basic', default: true },
  { id: 'dob', label: 'የትውልድ ቀን (Date of Birth)', group: 'basic', default: false },
  { id: 'grade', label: 'ክፍል / ደረጃ (Grade)', group: 'academic', default: true },
  { id: 'studentType', label: 'የትምህርት ዘርፍ (Regular / Distance)', group: 'academic', default: true },
  { id: 'shift', label: 'ፈረቃ (Weekend / Night)', group: 'academic', default: true },
  { id: 'teacher', label: 'የተመደበ መምህር (Assigned Teacher)', group: 'academic', default: true },
  { id: 'courses', label: 'የተመዘገቡ ኮርሶች (Enrolled Courses)', group: 'academic', default: false },
  { id: 'status', label: 'የአካውንት ሁኔታ (Account Status)', group: 'academic', default: false },
  { id: 'studentPhone', label: 'የተማሪ ስልክ ቁጥር (Student Phone)', group: 'contact', default: true },
  { id: 'email', label: 'ኢሜይል (Email)', group: 'contact', default: true },
  { id: 'address', label: 'አድራሻ (Address)', group: 'contact', default: false },
  { id: 'subcity', label: 'ክፍለ ከተማ (Subcity)', group: 'contact', default: false },
  { id: 'woreda', label: 'ወረዳ (Woreda)', group: 'contact', default: false },
  { id: 'kebele', label: 'ቀበሌ (Kebele)', group: 'contact', default: false },
  { id: 'hasConfessionFather', label: 'የንስሐ አባት (Confession Father)', group: 'spiritual', default: true },
  { id: 'confessionFatherName', label: 'የንስሐ አባት ስም (Father Name)', group: 'spiritual', default: true },
  { id: 'confessionFatherPhone', label: 'የንስሐ አባት ስልክ (Father Phone)', group: 'spiritual', default: false },
  { id: 'emergencyName', label: 'የአስቸኳይ ጊዜ ተጠሪ ስም (Emergency Name)', group: 'emergency', default: true },
  { id: 'emergencyRelationship', label: 'ዝምድና (Relationship)', group: 'emergency', default: false },
  { id: 'emergencyPhone', label: 'የአስቸኳይ ጊዜ ስልክ (Emergency Phone)', group: 'emergency', default: true },
  { id: 'registrationDate', label: 'የተመዘገበበት ቀን (Registration Date)', group: 'academic', default: true },
];

export default function ExportStudentsModal({
  isOpen,
  onClose,
  initialFilters = {},
  selectedStudentIds = [],
  totalAvailableCount = 0,
}) {
  // Filter states
  const [gradeFilter, setGradeFilter] = useState(initialFilters.grade || '');
  const [typeFilter, setTypeFilter] = useState(initialFilters.studentType || '');
  const [shiftFilter, setShiftFilter] = useState(initialFilters.shift || '');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [confessionFilter, setConfessionFilter] = useState('');
  const [exportScope, setExportScope] = useState(selectedStudentIds.length > 0 ? 'selected' : 'all');
  const [fileFormat, setFileFormat] = useState('xlsx'); // 'xlsx' | 'csv'

  // Sync state whenever modal opens or selection changes
  useEffect(() => {
    if (isOpen) {
      setGradeFilter(initialFilters.grade || '');
      setTypeFilter(initialFilters.studentType || '');
      setShiftFilter(initialFilters.shift || '');
      setGenderFilter('');
      setStatusFilter('');
      setConfessionFilter('');
      setExportScope(selectedStudentIds.length > 0 ? 'selected' : 'all');
      setExportError('');
      setExportSuccess(false);
    }
  }, [isOpen, selectedStudentIds.length, initialFilters.grade, initialFilters.studentType, initialFilters.shift]);

  // Selected Columns
  const [selectedColumns, setSelectedColumns] = useState(() =>
    AVAILABLE_COLUMNS.filter((c) => c.default).map((c) => c.id)
  );

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Toggle single column
  const toggleColumn = (id) => {
    setSelectedColumns((prev) =>
      prev.includes(id) ? prev.filter((colId) => colId !== id) : [...prev, id]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setGradeFilter('');
    setTypeFilter('');
    setShiftFilter('');
    setGenderFilter('');
    setStatusFilter('');
    setConfessionFilter('');
    setExportScope('all');
    setExportError('');
  };

  // Presets
  const applyPreset = (preset) => {
    if (preset === 'all') {
      setSelectedColumns(AVAILABLE_COLUMNS.map((c) => c.id));
    } else if (preset === 'basic') {
      setSelectedColumns(['studentId', 'fullName', 'grade', 'studentType', 'shift', 'studentPhone', 'email']);
    } else if (preset === 'academic') {
      setSelectedColumns(['studentId', 'fullName', 'grade', 'studentType', 'shift', 'teacher', 'courses', 'status']);
    } else if (preset === 'spiritual') {
      setSelectedColumns(['studentId', 'fullName', 'christianName', 'grade', 'shift', 'hasConfessionFather', 'confessionFatherName', 'confessionFatherPhone']);
    } else if (preset === 'emergency') {
      setSelectedColumns(['studentId', 'fullName', 'grade', 'studentPhone', 'emergencyName', 'emergencyRelationship', 'emergencyPhone']);
    }
  };

  // Build clean filename based on applied filters
  const generateFilename = () => {
    const parts = ['የተማሪዎች_ዝርዝር'];
    if (exportScope === 'selected') {
      parts.push(`የተመረጡ_${selectedStudentIds.length}`);
    } else {
      if (typeFilter === 'regular') parts.push('መደበኛ');
      else if (typeFilter === 'distance') parts.push('የርቀት');

      if (gradeFilter) parts.push(gradeFilter.replace(/\s+/g, '_'));
      if (shiftFilter === 'night') parts.push('የማታ');
      else if (shiftFilter === 'weekend') parts.push('የቀን');
    }

    const dateStr = new Date().toISOString().split('T')[0];
    return `${parts.join('_')}_${dateStr}.${fileFormat}`;
  };

  const handleExecuteExport = async () => {
    setIsExporting(true);
    setExportError('');
    setExportSuccess(false);

    try {
      const token = useAuthStore.getState().accessToken || (typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null);
      const params = new URLSearchParams();

      if (exportScope === 'selected' && selectedStudentIds.length > 0) {
        params.append('selectedIds', selectedStudentIds.join(','));
      } else {
        if (gradeFilter) params.append('grade', gradeFilter);
        if (typeFilter) params.append('studentType', typeFilter);
        if (shiftFilter) params.append('shift', shiftFilter);
        if (genderFilter) params.append('gender', genderFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (confessionFilter) params.append('hasConfessionFather', confessionFilter);
      }

      if (token) params.append('token', token);
      params.append('format', 'json'); // fetch structured JSON to build styled Excel/CSV

      let rawData = [];
      let isRawCsv = false;
      let responseText = '';

      // Primary Attempt: Try dedicated /export endpoint
      try {
        const response = await apiFetch(`/api/admin/students/export?${params.toString()}`, {
          skipCache: true,
        });

        if (response.ok) {
          responseText = await response.text();
          if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
            const jsonRes = JSON.parse(responseText);
            rawData = Array.isArray(jsonRes) ? jsonRes : (jsonRes.students || jsonRes.data || []);
          } else {
            isRawCsv = true;
          }
        }
      } catch (err) {
        console.warn('Dedicated export endpoint attempt failed, trying fallback list endpoint...', err);
      }

      // Secondary Fallback Attempt: If /export did not return data, fetch from /api/admin/students
      if (!isRawCsv && rawData.length === 0) {
        try {
          const listParams = new URLSearchParams();
          listParams.append('limit', '5000');
          listParams.append('page', '1');
          if (gradeFilter) listParams.append('grade', gradeFilter);
          if (typeFilter) listParams.append('studentType', typeFilter);
          if (shiftFilter) listParams.append('shift', shiftFilter);
          if (token) listParams.append('token', token);

          const listResponse = await apiFetch(`/api/admin/students?${listParams.toString()}`, {
            skipCache: true,
          });

          if (listResponse.ok) {
            const listData = await listResponse.json();
            rawData = Array.isArray(listData) ? listData : (listData.students || listData.data || []);
          }
        } catch (fallbackErr) {
          console.error('Fallback students fetch failed:', fallbackErr);
        }
      }

      // If scope is selected IDs, filter client-side
      if (exportScope === 'selected' && selectedStudentIds.length > 0 && rawData.length > 0) {
        rawData = rawData.filter((s) =>
          selectedStudentIds.includes(s._id) ||
          selectedStudentIds.includes(s.id) ||
          selectedStudentIds.includes(s.studentId) ||
          selectedStudentIds.includes(s.registrationNumber)
        );
      }

      // Apply additional filters client-side if needed
      if (rawData.length > 0 && exportScope !== 'selected') {
        if (gradeFilter) {
          const gf = gradeFilter.toLowerCase().trim();
          rawData = rawData.filter((s) => {
            const g = (s.grade || s.batch || '').toLowerCase().trim();
            return g === gf || g.includes(gf) || gf.includes(g);
          });
        }
        if (typeFilter) {
          const tf = typeFilter.toLowerCase().trim();
          rawData = rawData.filter((s) => (s.studentType || 'regular').toLowerCase().trim() === tf);
        }
        if (shiftFilter) {
          const sf = shiftFilter.toLowerCase().trim();
          rawData = rawData.filter((s) => {
            const sh = (s.shift || '').toLowerCase().trim();
            if (sf === 'night') return sh.includes('night') || sh.includes('ማታ');
            if (sf === 'weekend') return sh.includes('weekend') || sh.includes('ቀን') || sh.includes('ሳምንት');
            return sh === sf;
          });
        }
        if (genderFilter) {
          rawData = rawData.filter((s) => s.gender === genderFilter);
        }
        if (statusFilter) {
          rawData = rawData.filter((s) => {
            const isDeactivated = s.userId?.status === 'disabled' || s.status === 'disabled';
            return statusFilter === 'disabled' ? isDeactivated : !isDeactivated;
          });
        }
        if (confessionFilter !== '') {
          const boolVal = confessionFilter === 'true';
          rawData = rawData.filter((s) => Boolean(s.hasConfessionFather) === boolVal);
        }
      }

      const filename = generateFilename();

      // If the backend returned direct CSV or if JSON was not returned
      if (isRawCsv || (rawData.length === 0 && responseText.includes('የተማሪ'))) {
        const cleanCsv = responseText.startsWith('\uFEFF') ? responseText : '\uFEFF' + responseText;
        if (fileFormat === 'xlsx') {
          const workbook = XLSX.read(cleanCsv, { type: 'string' });
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
          });
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        } else {
          const blob = new Blob([cleanCsv], { type: 'text/csv;charset=utf-8;' });
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.setAttribute('download', filename.endsWith('.csv') ? filename : filename.replace('.xlsx', '.csv'));
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        }

        setExportSuccess(true);
        setTimeout(() => {
          onClose();
          setExportSuccess(false);
        }, 1200);
        return;
      }

      if (rawData.length === 0) {
        throw new Error('በተመረጡት ማጣሪያዎች መሠረት ምንም ተማሪ አልተገኘም። እባክዎ ማጣሪያዎችን አጽድተው እንደገና ይሞክሩ።');
      }

      // Format row objects according to selected columns
      const formattedRows = rawData.map((s, index) => {
        const row = { 'ተ.ቁ (No)': index + 1 };
        const fullName = [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') || s.fullName || '';

        selectedColumns.forEach((colId) => {
          const colDef = AVAILABLE_COLUMNS.find((c) => c.id === colId);
          const colName = colDef?.label?.split(' (')[0] || colId;

          switch (colId) {
            case 'studentId':
              row[colName] = s.studentId || s.registrationNumber || '-';
              break;
            case 'registrationNumber':
              row[colName] = s.registrationNumber || '-';
              break;
            case 'fullName':
              row[colName] = fullName;
              break;
            case 'firstName':
              row[colName] = s.firstName || '';
              break;
            case 'middleName':
              row[colName] = s.middleName || '';
              break;
            case 'lastName':
              row[colName] = s.lastName || '';
              break;
            case 'christianName':
              row[colName] = s.christianName || '-';
              break;
            case 'gender':
              row[colName] = s.gender === 'Female' ? 'ሴት' : (s.gender === 'Male' ? 'ወንድ' : (s.gender || '-'));
              break;
            case 'age':
              row[colName] = s.age || '-';
              break;
            case 'dob':
              row[colName] = s.dob ? formatEthiopianDate(s.dob) : '-';
              break;
            case 'grade':
              row[colName] = formatGradeAmharic(s.grade || s.batch) || '-';
              break;
            case 'studentType':
              row[colName] = s.studentType === 'distance' ? 'የርቀት (Distance)' : 'መደበኛ (Regular)';
              break;
            case 'shift':
              row[colName] = s.shift === 'night' ? 'የማታ (Night)' : (s.shift === 'weekend' ? 'የቀን / ሳምንት መጨረሻ (Weekend)' : (s.shift || '-'));
              break;
            case 'teacher':
              row[colName] = s.teacher?.fullName || s.teacherName || '-';
              break;
            case 'courses':
              row[colName] = Array.isArray(s.courses) ? s.courses.map((c) => c.name || c).join(', ') : (s.courses || '-');
              break;
            case 'status':
              row[colName] = (s.userId?.status === 'disabled' || s.status === 'disabled') ? 'የታገደ (Deactivated)' : 'ንቁ (Active)';
              break;
            case 'studentPhone':
              row[colName] = s.studentPhone || s.contactPhone || s.phone || '-';
              break;
            case 'email':
              row[colName] = s.userId?.email || s.email || '-';
              break;
            case 'address':
              row[colName] = s.address || '-';
              break;
            case 'subcity':
              row[colName] = s.subcity || '-';
              break;
            case 'woreda':
              row[colName] = s.woreda || '-';
              break;
            case 'kebele':
              row[colName] = s.kebele || '-';
              break;
            case 'hasConfessionFather':
              row[colName] = s.hasConfessionFather ? 'አላቸው' : 'የላቸውም';
              break;
            case 'confessionFatherName':
              row[colName] = s.confessionFatherName || '-';
              break;
            case 'confessionFatherPhone':
              row[colName] = s.confessionFatherPhone || '-';
              break;
            case 'emergencyName':
              row[colName] = [s.emergencyFirstName, s.emergencyMiddleName, s.emergencyLastName].filter(Boolean).join(' ') || s.parentName || '-';
              break;
            case 'emergencyRelationship':
              row[colName] = s.relationship || '-';
              break;
            case 'emergencyPhone':
              row[colName] = s.emergencyPhone || s.contactPhone || s.parentPhone || '-';
              break;
            case 'registrationDate':
              row[colName] = s.registrationDate ? formatEthiopianDate(s.registrationDate) : (s.createdAt ? formatEthiopianDate(s.createdAt) : '-');
              break;
            default:
              row[colName] = s[colId] || '-';
          }
        });

        return row;
      });

      if (fileFormat === 'xlsx') {
        // Generate Excel Worksheet
        const worksheet = XLSX.utils.json_to_sheet(formattedRows);

        // Auto-fit column widths
        const colWidths = Object.keys(formattedRows[0] || {}).map((key) => ({
          wch: Math.max(key.length * 2, 14),
        }));
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'የተማሪዎች ዝርዝር');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      } else {
        // Generate UTF-8 BOM CSV for Excel compatibility
        const worksheet = XLSX.utils.json_to_sheet(formattedRows);
        const csvContent = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', filename.endsWith('.csv') ? filename : filename.replace('.xlsx', '.csv'));
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      }

      setExportSuccess(true);
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 1200);
    } catch (err) {
      console.error('Export error:', err);
      setExportError(err.message || 'ማውረድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const hasActiveFilters = gradeFilter || typeFilter || shiftFilter || genderFilter || statusFilter || confessionFilter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                የተማሪዎች መረጃ ማውረጃ (Export Students)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                በክፍል፣ በፈረቃና በትምህርት ዘርፍ አጣርተው በExcel ወይም CSV ያውርዱ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
          {/* Section 1: File Format & Scope */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>1. የፋይል ዓይነት እና ወሰን (Format & Scope)</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              {/* Excel Format Option */}
              <button
                type="button"
                onClick={() => setFileFormat('xlsx')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  fileFormat === 'xlsx'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  XLSX
                </div>
                <div>
                  <div className="font-bold text-xs">Microsoft Excel</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">የተስተካከለ የሰንጠረዥ ፋይል</div>
                </div>
              </button>

              {/* CSV Format Option */}
              <button
                type="button"
                onClick={() => setFileFormat('csv')}
                className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  fileFormat === 'csv'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                  CSV
                </div>
                <div>
                  <div className="font-bold text-xs">CSV Spreadsheet</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">ለሁሉም ሲስተሞች ተስማሚ</div>
                </div>
              </button>
            </div>

            {/* Scope Selection (if rows selected) */}
            {selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="exportScope"
                    value="selected"
                    checked={exportScope === 'selected'}
                    onChange={() => setExportScope('selected')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                    የተመረጡትን {selectedStudentIds.length} ተማሪዎች ብቻ
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="exportScope"
                    value="all"
                    checked={exportScope === 'all'}
                    onChange={() => setExportScope('all')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    ሁሉንም ተማሪዎች (ጠቅላላ)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Section 2: Detailed Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-blue-500" />
                <span>2. ማጣሪያዎች (Filter Mechanism)</span>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>ማጣሪያዎችን አጽዳ (ሁሉንም አውርድ)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Student Type / Track */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  የትምህርት ዘርፍ (Track)
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">ሁሉም ዘርፎች (All Tracks)</option>
                  <option value="regular">መደበኛ ትምህርት (Regular)</option>
                  <option value="distance">የርቀት ትምህርት (Distance)</option>
                </select>
              </div>

              {/* Class / Grade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ክፍል / ደረጃ (Grade)
                </label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">ሁሉም ክፍሎች (All Classes)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={`Grade ${g}`}>
                      {g}ኛ ክፍል (Grade {g})
                    </option>
                  ))}
                  <option value="Distance">የርቀት ትምህርት (Distance)</option>
                </select>
              </div>

              {/* Shift */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ፈረቃ (Shift)
                </label>
                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">ሁሉም ፈረቃዎች (All Shifts)</option>
                  <option value="weekend">☀️ የቀን / ቅዳሜና እሑድ (Weekend)</option>
                  <option value="night">🌙 የማታ ፈረቃ (Night Shift)</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ጾታ (Gender)
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">ሁሉም (All Genders)</option>
                  <option value="Male">ወንድ (Male)</option>
                  <option value="Female">ሴት (Female)</option>
                </select>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ሁኔታ (Account Status)
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">ሁሉም ሁኔታዎች (All Statuses)</option>
                  <option value="approved">✅ ንቁ / የጸደቁ (Active)</option>
                  <option value="disabled">⛔ የታገዱ / የተዘጉ (Disabled)</option>
                </select>
              </div>

              {/* Confession Father */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  የንስሐ አባት (Confession Father)
                </label>
                <select
                  value={confessionFilter}
                  onChange={(e) => setConfessionFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">ሁሉም (All)</option>
                  <option value="true">የንስሐ አባት ያላቸው ብቻ</option>
                  <option value="false">የንስሐ አባት የሌላቸው</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Column Selection & Presets */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-purple-500" />
                <span>3. የሚካተቱ አምዶች ({selectedColumns.length} አምዶች ተመርጠዋል)</span>
              </label>

              {/* Presets Button Group */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">ፈጣን ምርጫ፦</span>
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium"
                >
                  ሁሉም
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('basic')}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium"
                >
                  መሠረታዊ
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('academic')}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium"
                >
                  የትምህርት
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('spiritual')}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium"
                >
                  መንፈሳዊ
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('emergency')}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium"
                >
                  አስቸኳይ ጊዜ
                </button>
              </div>
            </div>

            {/* Column Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-h-48 overflow-y-auto">
              {AVAILABLE_COLUMNS.map((col) => {
                const isSelected = selectedColumns.includes(col.id);
                return (
                  <label
                    key={col.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleColumn(col.id)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={isSelected ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}>
                      {col.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Feedback & Error states */}
          {exportError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{exportError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetFilters();
                  setTimeout(() => handleExecuteExport(), 50);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ማጣሪያዎችን አጽድተህ ሁሉንም አውርድ</span>
              </button>
            </div>
          )}

          {exportSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>የተማሪዎች ዝርዝር በተሳካ ሁኔታ ወርዷል!</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            የፋይል ስም፦ <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{generateFilename()}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ተመለስ
            </button>

            <button
              type="button"
              onClick={handleExecuteExport}
              disabled={isExporting || selectedColumns.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'በማውረድ ላይ...' : `አሁን አውርድ (${fileFormat.toUpperCase()})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
