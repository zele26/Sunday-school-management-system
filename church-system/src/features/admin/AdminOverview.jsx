'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Card, ActionCard } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import StatCard from '../../components/shared/StatCard';

const quickAccessLinks = [
  { path: '/admin/users', label: 'ተጠቃሚዎች (Users)', icon: Users, count: '142' },
  { path: '/admin/approvals', label: 'ማረጋገጫዎች (Approvals)', icon: CheckCircle2, count: '7' },
  { path: '/admin/classes', label: 'ክፍሎች (Classes)', icon: School, count: '12' },
  { path: '/admin/courses', label: 'ትምህርቶች (Courses)', icon: BookOpen, count: '5' },
  { path: '/admin/announcements', label: 'ማስታወቂያዎች (Announcements)', icon: Bell },
  { path: '/admin/resources', label: 'የትምህርት መርጃዎች (Resources)', icon: FileText },
  { path: '/admin/attendance-reports', label: 'ክትትል (Attendance)', icon: ClipboardList },
  { path: '/admin/reports', label: 'ሪፖርቶች (Reports)', icon: BarChart3 },
  { path: '/admin/complaints', label: 'ቅሬታዎች (Complaints)', icon: AlertTriangle },
  { path: '/admin/certificates', label: 'ምስክር ወረቀቶች (Certificates)', icon: Award },
  { path: '/admin/settings', label: 'መቼቶች (Settings)', icon: Settings },
  { path: '/admin/audit-logs', label: 'የሲስተም መዝገቦች (Audit)', icon: ShieldAlert },
];

const AdminOverviewContent = () => {
  const navigate = useNavigate();
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
        await new Promise((resolve) => setTimeout(resolve, 300));
        setStats({
          users: 142,
          pendingApprovals: 7,
          classes: 12,
          courses: 5,
          activeComplaints: 0,
        });
      } catch (err) {
        console.warn('የዳሽቦርድ መረጃ አልተገኘም:', err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'አጠቃላይ ተጠቃሚዎች',
      value: stats.users,
      icon: Users,
      variant: 'default',
      badge: '+12% በዚህ ወር',
    },
    {
      label: 'የሚጠበቁ ማረጋገጫዎች',
      value: stats.pendingApprovals,
      icon: Clock,
      variant: 'gold',
      badge: 'ትኩረት የሚሹ',
    },
    {
      label: 'ንቁ ክፍሎች',
      value: stats.classes,
      icon: School,
      variant: 'default',
      badge: '2017 ዓ.ም',
    },
    {
      label: 'አጠቃላይ ትምህርቶች',
      value: stats.courses,
      icon: BookOpen,
      variant: 'default',
      badge: '5 ኮርሶች',
    },
    {
      label: 'ያልተፈቱ ቅሬታዎች',
      value: stats.activeComplaints,
      icon: AlertTriangle,
      variant: 'default',
      badge: stats.activeComplaints === 0 ? 'ሰላማዊ' : 'አጣዳፊ',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <FadeIn direction="down" duration={0.35}>
        <PageHeader
          title="የአስተዳዳሪ ማዕከል (Admin Overview)"
          subtitle="የተክለሳዊሮስ ሰንበት ትምህርት ቤት አጠቃላይ የሲስተም ሁኔታና ፈጣን መቆጣጠሪያ"
          icon={TrendingUp}
          badge={<Badge variant="gold" size="sm"><Sparkles className="w-3 h-3" /> ንቁ ሲስተም</Badge>}
        />
      </FadeIn>

      {/* Top Stat Cards Section with Reusable StatCard */}
      <StatCard statCards={statCards} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Access Grid with Reusable ActionCard */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              ፈጣን መዳረሻ (Quick Access)
            </h3>
            <span className="text-xs text-slate-400">12 ሞጁሎች</span>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {quickAccessLinks.map((item) => (
              <StaggerItem key={item.path}>
                <ActionCard
                  icon={item.icon}
                  title={item.label}
                  description="ክፈትና አስተዳድር"
                  count={item.count}
                  onClick={() => navigate(item.path)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>

        {/* Recent Activity Timeline */}
        <FadeIn delay={0.2} className="xl:col-span-1 space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            የቅርብ ጊዜ እንቅስቃሴዎች (Activities)
          </h3>
          <Card variant="default" padding="md" className="h-full max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-6">
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center" />
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  የመምህር አካውንት ጸድቋል
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="approved" size="sm">ሲስተም አድሚን</Badge>
                  <span className="text-[11px] text-slate-400">03:20 ጠዋት</span>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-950 border-2 border-blue-500 flex items-center justify-center" />
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  መምህር ለ1ኛ 'ሀ' ክፍል ተመድቧል
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="active" size="sm">ሲስተም አድሚን</Badge>
                  <span className="text-[11px] text-slate-400">04:05 ጠዋት</span>
                </div>
              </div>

              <div className="relative pl-6 pt-4 opacity-60">
                <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-slate-400 flex items-center justify-center" />
                <p className="text-xs italic text-slate-400">የቅርብ ጊዜ እንቅስቃሴዎች መጨረሻ</p>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default AdminOverviewContent;