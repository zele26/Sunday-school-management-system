'use client';

import React from 'react';
import {
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  QrCode,
  FileCheck,
  GraduationCap,
  Award,
  Bell,
  Building2,
  BarChart3,
  Settings,
  Users,
} from 'lucide-react';
import { Badge, Button } from '../ui';
import { PERMISSION_CATEGORIES, ROLE_PRESETS } from '../../utils/permissions';
import { useLanguage } from '../../hooks/useLanguage';

const CATEGORY_ICONS = {
  attendance: QrCode,
  registrations: FileCheck,
  students_teachers: Users,
  academic: GraduationCap,
  certificates: Award,
  announcements_resources: Bell,
  departments: Building2,
  reports: BarChart3,
  system: Settings,
};

export function PermissionSelector({
  selectedPermissions = [],
  onChange = () => {},
  currentRole = 'staff',
  onRoleChange = () => {},
}) {
  const { isAmharic } = useLanguage();

  const handleTogglePermission = (permKey) => {
    let next;
    if (selectedPermissions.includes(permKey)) {
      next = selectedPermissions.filter((k) => k !== permKey);
    } else {
      next = [...selectedPermissions, permKey];
    }
    onChange(next);
  };

  const handleApplyPreset = (preset) => {
    if (preset.id === 'custom') return;
    if (preset.permissions.includes('*')) {
      // Full admin: select all available individual permissions + wildcard
      const allPerms = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.key));
      onChange(allPerms);
    } else {
      onChange(preset.permissions);
    }
    if (preset.role && onRoleChange) {
      onRoleChange(preset.role);
    }
  };

  const handleToggleCategory = (category, selectAll) => {
    const categoryKeys = category.permissions.map((p) => p.key);
    let next;
    if (selectAll) {
      next = Array.from(new Set([...selectedPermissions, ...categoryKeys]));
    } else {
      next = selectedPermissions.filter((k) => !categoryKeys.includes(k));
    }
    onChange(next);
  };

  const totalPossible = PERMISSION_CATEGORIES.flatMap((c) => c.permissions).length;
  const isAllSelected = selectedPermissions.length >= totalPossible;

  const handleMasterToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      const allKeys = PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.key));
      onChange(allKeys);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Presets & Summary Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isAmharic ? 'የተጠቃሚው የተፈቀዱ ተግባራት (Permissions)' : 'Assigned Task Permissions'}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAmharic
                  ? 'ተጠቃሚው በሲስተሙ ውስጥ እንዲያከናውናቸው የሚፈቀዱትን ሥራዎች ይምረጡ'
                  : 'Select the specific tasks this user is authorized to perform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Badge variant="gold" size="sm">
              {selectedPermissions.length} / {totalPossible} {isAmharic ? 'ተግባራት ተመርጠዋል' : 'Selected'}
            </Badge>
            <button
              type="button"
              onClick={handleMasterToggleAll}
              className="text-xs font-bold text-[#1657b8] dark:text-amber-400 hover:underline cursor-pointer"
            >
              {isAllSelected ? (isAmharic ? 'ሁሉንም ሰርዝ' : 'Deselect All') : (isAmharic ? 'ሁሉንም ምረጥ' : 'Select All')}
            </button>
          </div>
        </div>

        {/* 1-Click Role Presets Quick Pills */}
        <div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
            {isAmharic ? '⚡ ፈጣን የሥራ መደብ አብነቶች (Role Presets):' : '⚡ Quick Role Presets:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {ROLE_PRESETS.map((preset) => {
              const isMatch =
                preset.id !== 'custom' &&
                preset.permissions.length > 0 &&
                preset.permissions.every((k) => selectedPermissions.includes(k)) &&
                selectedPermissions.length === preset.permissions.length;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isMatch
                      ? 'bg-[#1657b8] text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400'
                  }`}
                >
                  {isAmharic ? preset.nameAm : preset.nameEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categorized Permission Checkbox Accordions */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {PERMISSION_CATEGORIES.map((category) => {
          const CatIcon = CATEGORY_ICONS[category.id] || ShieldCheck;
          const categoryKeys = category.permissions.map((p) => p.key);
          const selectedInCat = categoryKeys.filter((k) => selectedPermissions.includes(k));
          const isCategoryAllSelected = selectedInCat.length === categoryKeys.length;

          return (
            <div
              key={category.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs space-y-3 transition-colors"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 flex items-center justify-center">
                    <CatIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isAmharic ? category.titleAm : category.titleEn}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {isAmharic ? category.descriptionAm : category.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    {selectedInCat.length}/{categoryKeys.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category, !isCategoryAllSelected)}
                    className="text-[11px] font-bold text-[#1657b8] dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {isCategoryAllSelected
                      ? (isAmharic ? 'አጽዳ' : 'Clear')
                      : (isAmharic ? 'ሁሉንም ምረጥ' : 'Select All')}
                  </button>
                </div>
              </div>

              {/* Category Permissions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.permissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      onClick={() => handleTogglePermission(perm.key)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/80 text-blue-950 dark:text-blue-100 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 text-[#1657b8] dark:text-amber-400">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 fill-[#1657b8]/20 text-[#1657b8] dark:text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block leading-snug">
                          {isAmharic ? perm.labelAm : perm.labelEn}
                        </span>
                        <code className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                          {perm.key}
                        </code>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PermissionSelector;
