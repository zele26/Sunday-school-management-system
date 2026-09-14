'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  School,
  BookOpen,
  Bell,
  FileText,
  ClipboardList,
  BarChart3,
  AlertTriangle,
  Award,
  Settings,
  ShieldAlert,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  UserPlus,
  UserCheck,
  QrCode,
  GraduationCap,
  Layers,
  ChevronRight,
  Activity,
  Check,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '../../components/motion';
import { apiFetch } from '../../api/apiClient';
import { useLanguage } from '../../hooks/useLanguage';
import useAuthStore from '../../store/authStore';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';

function formatRelativeTime(dateString, isAmharic) {
  if (!dateString) return isAmharic ? 'ዛሬ' : 'Today';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) {
    return isAmharic ? 'አሁን' : 'Just now';
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return isAmharic ? `ከ ${diffMin} ደቂቃ በፊት` : `${diffMin}m ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return isAmharic ? `ከ ${diffHours} ሰዓት በፊት` : `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return isAmharic ? 'ትናንት' : 'Yesterday';
  }
  if (diffDays < 7) {
    return isAmharic ? `ከ ${diffDays} ቀን በፊት` : `${diffDays}d ago`;
  }
  return date.toLocaleDateString(isAmharic ? 'am-ET' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const AdminOverviewContent = () => {
  const navigate = useNavigate();
  const { t, isAmharic } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    pendingApprovals: 0,
    pendingUsers: 0,
    pendingRegistrations: 0,
    classes: 12,
    courses: 5,
    modules: 6,
    announcements: 0,
    certificates: 0,
    activeComplaints: 0,
    academicYear: '2017 ዓ.ም',
    academicYearEn: '2025/2026',
    activities: [],
  });

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/admin/stats');
        if (res.ok && isMounted) {
          const data = await res.json();
          setStats({
            users: data.totalUsers ?? 0,
            pendingApprovals: data.pendingCount ?? 0,
            pendingUsers: data.pendingUsers ?? 0,
            pendingRegistrations: data.pendingRegistrations ?? 0,
            classes: data.classes ?? 12,
            courses: data.courses ?? 5,
            modules: data.modules ?? 6,
            announcements: data.announcements ?? 0,
            certificates: data.certificates ?? 0,
            activeComplaints: data.activeComplaints ?? 0,
            academicYear: data.academicYear || '2017 ዓ.ም',
            academicYearEn: data.academicYearEn || '2025/2026',
            activities: Array.isArray(data.activities) ? data.activities : [],
          });
        }
      } catch (err) {
        // preserve current state on error
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => [
    { id: 'all', label: t('catAll', 'ሁሉም') },
    { id: 'academic', label: t('catAcademic', '🎓 አካዳሚክና ተማሪዎች') },
    { id: 'communication', label: t('catCommunication', '📢 ተግባቦትና ይዘት') },
    { id: 'system', label: t('catSystem', '⚙️ ሲስተምና ሪፖርቶች') },
  ], [t]);

  const user = useAuthStore((state) => state.user);

  const allModules = useMemo(() => [
    // Academics
    {
      category: 'academic',
      path: '/admin/users',
      label: t('moduleUsers', 'ተጠቃሚዎች'),
      icon: Users,
      permission: PERMISSIONS.USERS_MANAGE,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      countKey: 'users',
      unit: t('unitUsers', 'ተጠቃሚዎች'),
    },
    {
      category: 'academic',
      path: '/admin/approvals',
      label: t('moduleApprovals', 'ማረጋገጫዎች'),
      icon: CheckCircle2,
      permission: PERMISSIONS.USERS_MANAGE,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      countKey: 'pendingApprovals',
      unit: t('unitPending', 'በመጠባበቅ ላይ'),
      highlight: true,
    },
    {
      category: 'academic',
      path: '/admin/distance-hub',
      label: t('moduleDistanceHub', 'የርቀት ትምህርት ማዕከል'),
      icon: GraduationCap,
      permission: PERMISSIONS.ACADEMIC_DISTANCE_HUB,
      color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      badge: `${stats.modules} ${t('unitModules', 'ሞጁሎች')}`,
    },
    {
      category: 'academic',
      path: '/admin/classes',
      label: t('moduleClasses', 'ክፍሎች'),
      icon: School,
      permission: PERMISSIONS.ACADEMIC_CLASSES,
      color: 'from-sky-500/20 to-sky-600/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      countKey: 'classes',
      unit: t('unitClasses', 'ንቁ ክፍሎች'),
    },
    {
      category: 'academic',
      path: '/admin/courses',
      label: t('moduleCourses', 'ትምህርቶች'),
      icon: BookOpen,
      permission: PERMISSIONS.ACADEMIC_COURSES,
      color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      countKey: 'courses',
      unit: t('unitCourses', 'ኮርሶች'),
    },
    {
      category: 'academic',
      path: '/admin/attendance-reports',
      label: t('moduleAttendance', 'የመገኘት ክትትል'),
      icon: ClipboardList,
      permission: [PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_MANAGE, PERMISSIONS.ATTENDANCE_SCAN],
      color: 'from-teal-500/20 to-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      badge: t('badgeAttendance', 'መገኘት'),
    },

    // Communication & Media
    {
      category: 'communication',
      path: '/admin/announcements',
      label: t('moduleAnnouncements', 'ማስታወቂያዎች'),
      icon: Bell,
      permission: PERMISSIONS.ANNOUNCEMENTS_MANAGE,
      color: 'from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: `${stats.announcements > 0 ? stats.announcements : ''} ${t('badgeOfficial', 'ይፋዊ')}`.trim(),
    },
    {
      category: 'communication',
      path: '/admin/resources',
      label: t('moduleResources', 'የትምህርት መርጃዎች'),
      icon: FileText,
      permission: PERMISSIONS.RESOURCES_MANAGE,
      color: 'from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      badge: t('badgeResources', 'ፒዲኤፍ/ቪዲዮ'),
    },
    {
      category: 'communication',
      path: '/admin/certificates',
      label: t('moduleCertificates', 'የምስክር ወረቀቶች'),
      icon: Award,
      permission: [PERMISSIONS.CERTIFICATES_VIEW, PERMISSIONS.CERTIFICATES_ISSUE],
      color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      badge: `${stats.certificates > 0 ? stats.certificates : ''} ${t('badgeQRVerified', 'በQR የተረጋገጠ')}`.trim(),
    },
    {
      category: 'communication',
      path: '/admin/church-memberships',
      label: t('moduleMemberships', 'የአባልነት መታወቂያዎች'),
      icon: Layers,
      permission: PERMISSIONS.MEMBERSHIPS_MANAGE,
      color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      badge: t('badgeIDCards', 'መታወቂያ'),
    },

    // System & Reports
    {
      category: 'system',
      path: '/admin/reports',
      label: t('moduleReports', 'ሪፖርቶች'),
      icon: BarChart3,
      permission: PERMISSIONS.REPORTS_VIEW,
      color: 'from-violet-500/20 to-violet-600/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      badge: t('badgeStats', 'ስታቲስቲክስ'),
    },
    {
      category: 'system',
      path: '/admin/complaints',
      label: t('moduleComplaints', 'ቅሬታዎች'),
      icon: AlertTriangle,
      permission: PERMISSIONS.USERS_MANAGE,
      color: 'from-rose-500/20 to-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      countKey: 'activeComplaints',
      unit: t('unitUnresolved', 'ያልተፈቱ'),
    },
    {
      category: 'system',
      path: '/admin/audit-logs',
      label: t('moduleAuditLogs', 'የሲስተም እንቅስቃሴ መዝገቦች'),
      icon: ShieldAlert,
      permission: PERMISSIONS.AUDIT_LOGS_VIEW,
      color: 'from-slate-500/20 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
      badge: t('badgeSecurity', 'ደህንነት'),
    },
    {
      category: 'system',
      path: '/admin/settings',
      label: t('moduleSettings', 'መቼቶችና ማዋቀሪያ'),
      icon: Settings,
      permission: PERMISSIONS.SETTINGS_MANAGE,
      color: 'from-neutral-500/20 to-neutral-600/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
      badge: t('badgeConfig', 'ማዋቀሪያ'),
    },
  ], [t, stats]);

  // Filter modules based on user permissions
  const permittedModules = useMemo(() => {
    return allModules.filter((mod) => {
      if (!mod.permission) return true;
      return hasPermission(user, mod.permission);
    });
  }, [allModules, user]);

  const filteredModules = useMemo(() => {
    return permittedModules.filter((mod) => {
      const matchesCategory =
        selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        mod.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, permittedModules]);

  const quickActionsList = useMemo(() => [
    {
      path: '/admin/qr-scanner',
      label: t('quickQRScanner', 'የQR መገኘት መቆጣጠሪያ'),
      icon: QrCode,
      iconColor: 'text-emerald-600',
      hoverStyle: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-200 dark:hover:border-emerald-900',
      permission: PERMISSIONS.ATTENDANCE_SCAN,
    },
    {
      path: '/admin/add-student',
      label: t('quickAddStudent', 'አዲስ ተማሪ መዝግብ'),
      icon: UserPlus,
      iconColor: 'text-[#1657b8]',
      hoverStyle: 'hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#1657b8] dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-900',
      permission: PERMISSIONS.STUDENTS_MANAGE,
    },
    {
      path: '/admin/add-teacher',
      label: t('quickAddTeacher', 'አዲስ መምህር መድብ'),
      icon: UserCheck,
      iconColor: 'text-amber-600',
      hoverStyle: 'hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-200 dark:hover:border-amber-900',
      permission: PERMISSIONS.TEACHERS_MANAGE,
    },
    {
      path: '/admin/announcements',
      label: t('quickPostAnnouncement', 'ማስታወቂያ ልቀቅ'),
      icon: Bell,
      iconColor: 'text-purple-600',
      hoverStyle: 'hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-200 dark:hover:border-purple-900',
      permission: PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    },
    {
      path: '/admin/certificates',
      label: t('moduleCertificates', 'የምስክር ወረቀቶች'),
      icon: Award,
      iconColor: 'text-yellow-600',
      hoverStyle: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/40 hover:text-yellow-700 dark:hover:text-yellow-300 hover:border-yellow-200 dark:hover:border-yellow-900',
      permission: PERMISSIONS.CERTIFICATES_ISSUE,
    },
  ], [t]);

  const permittedQuickActions = useMemo(() => {
    return quickActionsList.filter((item) => !item.permission || hasPermission(user, item.permission));
  }, [quickActionsList, user]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* 🌟 1. Crisp Top Header with Full Bilingual Support */}
      <FadeIn direction="down" duration={0.35}>
        <PageHeader
          title={t('adminOverviewTitle', 'የአስተዳዳሪ ማጠቃለያ ማዕከል')}
          subtitle={t('sundaySchoolFullTitle', 'የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን • ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት')}
          icon={TrendingUp}
          badge={
            <Badge variant="gold" size="sm" className="gap-1.5 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{t('activeSystemBadge', 'ንቁ ሲስተም')}</span>
            </Badge>
          }
        />
      </FadeIn>

      {/* 🌟 2. Real Actionable Attention Banner (Displays only when real pending approvals exist and user has permission) */}
      {stats.pendingApprovals > 0 &&
        (hasPermission(user, PERMISSIONS.USERS_MANAGE) || hasPermission(user, PERMISSIONS.REGISTRATIONS_APPROVE)) && (
        <FadeIn direction="up" duration={0.3}>
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                🔔
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {stats.pendingApprovals} {t('pendingApprovalsAlertTitle', 'የሚጠበቁ ማረጋገጫዎች አሉ')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  {t('pendingApprovalsAlertDesc', 'አዲስ የተመዘገቡ ተማሪዎችንና መምህራንን ገምግመው ያጽድቁ።')}
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/approvals')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 self-start sm:self-auto gap-2 px-4 shadow-md"
            >
              <span>{t('reviewNowBtn', 'አሁን ገምግም')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </FadeIn>
      )}

      {/* 🌟 3. Real Live KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Users */}
        <MotionCard
          hoverY={-3}
          onClick={() => navigate('/admin/users')}
          className="cursor-pointer"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-[#1657b8]/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {stats.users > 0 ? `+${stats.users}` : '0'}
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.users}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('totalUsersLabel', 'አጠቃላይ ተጠቃሚዎች')}
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Approvals */}
        <MotionCard
          hoverY={-3}
          onClick={() => navigate('/admin/approvals')}
          className="cursor-pointer"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 shadow-sm hover:border-amber-500 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                {t('actionNeededBadge', 'ትኩረት')}
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {stats.pendingApprovals}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('pendingApprovalsLabel', 'የሚጠበቁ ማረጋገጫዎች')}
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Classes */}
        <MotionCard
          hoverY={-3}
          onClick={() => navigate('/admin/classes')}
          className="cursor-pointer"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-sky-500/50 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <School className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {isAmharic ? stats.academicYear : stats.academicYearEn}
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.classes}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('activeClassesLabel', 'ንቁ ክፍሎች')}
              </p>
            </div>
          </div>
        </MotionCard>

        {/* Courses */}
        <MotionCard
          hoverY={-3}
          onClick={() => navigate('/admin/courses')}
          className="cursor-pointer"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                {t('activeBadge', 'ንቁ')}
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.courses}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('totalCoursesLabel', 'አጠቃላይ ትምህርቶች')}
              </p>
            </div>
          </div>
        </MotionCard>

        {/* System Health */}
        <MotionCard
          hoverY={-3}
          onClick={() => navigate('/admin/audit-logs')}
          className="cursor-pointer col-span-2 lg:col-span-1"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-purple-500/50 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                {t('readyBadge', '100% ዝግጁ')}
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t('systemStatusHealthy', 'ሰላማዊ')}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {t('systemStatusLabel', 'የሲስተም ሁኔታ')}
              </p>
            </div>
          </div>
        </MotionCard>
      </div>

      {/* 🌟 4. Main Two-Column Work Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-2">
        {/* Left Column (2 Cols): Streamlined Module Navigator */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#1657b8] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Quick Filter Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchModulePlaceholder', 'ሞጁል ፈልግ...')}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#1657b8] transition-all"
              />
            </div>
          </div>

          {/* Clean Module Grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredModules.map((item) => {
              const Icon = item.icon;
              const liveCount = item.countKey ? stats[item.countKey] : null;

              return (
                <StaggerItem key={item.path}>
                  <MotionCard
                    hoverY={-2}
                    onClick={() => navigate(item.path)}
                    className="cursor-pointer h-full"
                  >
                    <div
                      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 flex items-center justify-between group shadow-xs ${
                        item.highlight && liveCount > 0
                          ? 'border-amber-300 dark:border-amber-700/60 hover:border-amber-500 bg-amber-50/20'
                          : 'border-slate-200/80 dark:border-slate-800 hover:border-[#1657b8]/40 dark:hover:border-blue-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center shrink-0 transition-transform group-hover:scale-108`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1657b8] dark:group-hover:text-blue-400 transition-colors truncate">
                            {item.label}
                          </h4>
                          {liveCount !== null ? (
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              {liveCount} {item.unit || ''}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {item.badge || t('openModuleBtn', 'ክፈት')}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-[#1657b8] text-slate-400 group-hover:text-white flex items-center justify-center shrink-0 transition-all ml-2">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </MotionCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>

        {/* Right Column (1 Col): Quick Action Shortcuts & Live Database Feed */}
        <div className="space-y-6">
          {/* ⚡ Quick Action Shortcuts */}
          {permittedQuickActions.length > 0 && (
            <Card
              variant="default"
              padding="md"
              className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('quickActionsTitle', '⚡ ፈጣን ተግባራት')}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold">{t('quickActionsSub', 'ፈጣን ምርጫዎች')}</span>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-1">
                {permittedQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.path}
                      onClick={() => navigate(action.path)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer border border-transparent ${action.hoverStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${action.iconColor}`} />
                        <span>{action.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 🕒 Real Live Recent Activity Feed */}
          <Card
            variant="default"
            padding="md"
            className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{t('recentActivityTitle', '🕒 የቅርብ ጊዜ እንቅስቃሴዎች')}</span>
              </h3>
              <Badge variant="neutral" size="sm">{t('liveActivityFeed', 'የቀጥታ መዝገብ')}</Badge>
            </div>

            {stats.activities && stats.activities.length > 0 ? (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2.5 space-y-4 pt-1">
                {stats.activities.map((act) => {
                  const ringColor =
                    act.color === 'emerald'
                      ? 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950'
                      : act.color === 'blue'
                      ? 'bg-blue-500 ring-blue-100 dark:ring-blue-950'
                      : act.color === 'purple'
                      ? 'bg-purple-500 ring-purple-100 dark:ring-purple-950'
                      : 'bg-amber-500 ring-amber-100 dark:ring-amber-950';

                  const textAm = act.titleAm || act.title;
                  const textEn = act.titleEn || act.title;
                  const actorAm = act.actorAm || act.actor || 'አድሚን';
                  const actorEn = act.actorEn || act.actor || 'Admin';

                  return (
                    <div key={act.id || Math.random()} className="relative pl-5">
                      <div className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ${ringColor} ring-4`} />
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {isAmharic ? textAm : textEn}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {isAmharic ? actorAm : actorEn} • {formatRelativeTime(act.time, isAmharic)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">
                {t('noRecentActivity', 'ምንም የቅርብ ጊዜ እንቅስቃሴ የለም።')}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewContent;