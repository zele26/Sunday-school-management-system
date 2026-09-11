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

const MODULE_CATEGORIES = [
  { id: 'all', label: 'ሁሉም' },
  { id: 'academic', label: '🎓 አካዳሚክና ተማሪዎች' },
  { id: 'communication', label: '📢 ተግባቦትና ይዘት' },
  { id: 'system', label: '⚙️ ሲስተምና ሪፖርቶች' },
];

const ALL_MODULES = [
  // Academics
  {
    category: 'academic',
    path: '/admin/users',
    label: 'ተጠቃሚዎች',
    icon: Users,
    color: 'from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    countKey: 'users',
    unit: 'ተጠቃሚዎች',
  },
  {
    category: 'academic',
    path: '/admin/approvals',
    label: 'ማረጋገጫዎች',
    icon: CheckCircle2,
    color: 'from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    countKey: 'pendingApprovals',
    unit: 'በመጠባበቅ ላይ',
    highlight: true,
  },
  {
    category: 'academic',
    path: '/admin/distance-hub',
    label: 'የርቀት ትምህርት ማዕከል',
    icon: GraduationCap,
    color: 'from-indigo-500/20 to-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    badge: '6 ሞጁሎች',
  },
  {
    category: 'academic',
    path: '/admin/classes',
    label: 'ክፍሎች',
    icon: School,
    color: 'from-sky-500/20 to-sky-600/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    countKey: 'classes',
    unit: 'ንቁ ክፍሎች',
  },
  {
    category: 'academic',
    path: '/admin/courses',
    label: 'ትምህርቶች',
    icon: BookOpen,
    color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    countKey: 'courses',
    unit: 'ኮርሶች',
  },
  {
    category: 'academic',
    path: '/admin/attendance-reports',
    label: 'የመገኘት ክትትል',
    icon: ClipboardList,
    color: 'from-teal-500/20 to-teal-600/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    badge: 'መገኘት',
  },

  // Communication & Media
  {
    category: 'communication',
    path: '/admin/announcements',
    label: 'ማስታወቂያዎች',
    icon: Bell,
    color: 'from-amber-500/20 to-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    badge: 'ይፋዊ',
  },
  {
    category: 'communication',
    path: '/admin/resources',
    label: 'የትምህርት መርጃዎች',
    icon: FileText,
    color: 'from-blue-500/20 to-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    badge: 'ፒዲኤፍ/ቪዲዮ',
  },
  {
    category: 'communication',
    path: '/admin/certificates',
    label: 'የምስክር ወረቀቶች',
    icon: Award,
    color: 'from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    badge: 'በQR የተረጋገጠ',
  },
  {
    category: 'communication',
    path: '/admin/church-memberships',
    label: 'የአባልነት መታወቂያዎች',
    icon: Layers,
    color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    badge: 'መታወቂያ',
  },

  // System & Reports
  {
    category: 'system',
    path: '/admin/reports',
    label: 'ሪፖርቶች',
    icon: BarChart3,
    color: 'from-violet-500/20 to-violet-600/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    badge: 'ስታቲስቲክስ',
  },
  {
    category: 'system',
    path: '/admin/complaints',
    label: 'ቅሬታዎች',
    icon: AlertTriangle,
    color: 'from-rose-500/20 to-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    countKey: 'activeComplaints',
    unit: 'ያልተፈቱ',
  },
  {
    category: 'system',
    path: '/admin/audit-logs',
    label: 'የሲስተም እንቅስቃሴ መዝገቦች',
    icon: ShieldAlert,
    color: 'from-slate-500/20 to-slate-600/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    badge: 'ደህንነት',
  },
  {
    category: 'system',
    path: '/admin/settings',
    label: 'መቼቶችና ማዋቀሪያ',
    icon: Settings,
    color: 'from-neutral-500/20 to-neutral-600/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
    badge: 'ማዋቀሪያ',
  },
];

const AdminOverviewContent = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    users: 142,
    pendingApprovals: 7,
    classes: 12,
    courses: 5,
    activeComplaints: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            users: data.totalUsers ?? prev.users,
            pendingApprovals: data.pendingCount ?? prev.pendingApprovals,
          }));
        }
      } catch (err) {
        // graceful fallback to initial stats
      }
    };
    fetchStats();
  }, []);

  const filteredModules = useMemo(() => {
    return ALL_MODULES.filter((mod) => {
      const matchesCategory =
        selectedCategory === 'all' || mod.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        mod.label.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 font-sans">
      {/* 🌟 1. Crisp Top Header */}
      <FadeIn direction="down" duration={0.35}>
        <PageHeader
          title="የአስተዳዳሪ ማጠቃለያ ማዕከል"
          subtitle="የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን • ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት"
          icon={TrendingUp}
          badge={
            <Badge variant="gold" size="sm" className="gap-1.5 font-bold">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>ንቁ ሲስተም</span>
            </Badge>
          }
        />
      </FadeIn>

      {/* 🌟 2. Actionable Attention Banner (if pending approvals exist) */}
      {stats.pendingApprovals > 0 && (
        <FadeIn direction="up" duration={0.3}>
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                🔔
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {stats.pendingApprovals} የሚጠበቁ ማረጋገጫዎች አሉ
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  አዲስ የተመዘገቡ ተማሪዎችንና መምህራንን ገምግመው ያጽድቁ።
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/admin/approvals')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 self-start sm:self-auto gap-2 px-4 shadow-md"
            >
              <span>አሁን ገምግም</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </FadeIn>
      )}

      {/* 🌟 3. Executive KPI Metrics Strip (Interactive with 1-click navigation) */}
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
                +12%
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.users}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                አጠቃላይ ተጠቃሚዎች
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
                ትኩረት
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {stats.pendingApprovals}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                የሚጠበቁ ማረጋገጫዎች
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
                2017 ዓ.ም
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.classes}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                ንቁ ክፍሎች
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
                ንቁ
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.courses}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                አጠቃላይ ትምህርቶች
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
                100% ዝግጁ
              </span>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ሰላማዊ
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                የሲስተም ሁኔታ
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
              {MODULE_CATEGORIES.map((cat) => (
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
                placeholder="ሞጁል ፈልግ..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#1657b8] transition-all"
              />
            </div>
          </div>

          {/* Clean Module Grid (Compact, High-Functionality, NO redundant repetitive text) */}
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
                              {item.badge || 'ክፈት'}
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

        {/* Right Column (1 Col): Quick Action Shortcuts & Live Feed */}
        <div className="space-y-6">
          {/* ⚡ Quick Action Shortcuts */}
          <Card
            variant="default"
            padding="md"
            className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>⚡ ፈጣን ተግባራት</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">ፈጣን ምርጫዎች</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                onClick={() => navigate('/admin/add-student')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-[#1657b8] dark:hover:text-blue-400 font-bold text-xs transition-all cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-[#1657b8]" />
                  <span>አዲስ ተማሪ መዝግብ</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => navigate('/admin/add-teacher')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 font-bold text-xs transition-all cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-900"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-amber-600" />
                  <span>አዲስ መምህር መድብ</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => navigate('/admin/announcements')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-200 hover:text-purple-700 dark:hover:text-purple-300 font-bold text-xs transition-all cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-900"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span>ማስታወቂያ ልቀቅ</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              <button
                onClick={() => navigate('/admin/qr-scanner')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-xs transition-all cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-900"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>የQR መገኘት መቆጣጠሪያ</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            </div>
          </Card>

          {/* 🕒 Recent Activity Stream */}
          <Card
            variant="default"
            padding="md"
            className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🕒 የቅርብ ጊዜ እንቅስቃሴዎች</span>
              </h3>
              <Badge variant="neutral" size="sm">የቀጥታ መዝገብ</Badge>
            </div>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2.5 space-y-4 pt-1">
              <div className="relative pl-5">
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" />
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  የመምህር አካውንት ጸድቋል
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">ሲስተም አድሚን • ዛሬ</span>
                </div>
              </div>

              <div className="relative pl-5">
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950" />
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  መምህር ለ1ኛ 'ሀ' ክፍል ተመድቧል
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">ሲስተም አድሚን • ትናንት</span>
                </div>
              </div>

              <div className="relative pl-5">
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950" />
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  አዲስ የርቀት ትምህርት ምዝገባ ገብቷል
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    ማረጋገጫ በመጠባበቅ ላይ
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewContent;