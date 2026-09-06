// src/features/teacher/TeacherOverview.jsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, ActionCard } from '../../components/ui';
import { StatCard } from '../../components/shared/StatCard';
import { BookOpen, Users, FileText, CheckSquare, Send, BarChart2 } from 'lucide-react';

const TeacherOverview = () => {
  const [stats, setStats] = useState({ classes: 0, students: 0, assignments: 0, pendingExams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/teacher/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statsList = [
    { label: 'የተመደቡ ክፍሎች', value: loading ? '...' : stats.classes, icon: BookOpen },
    { label: 'ተማሪዎች', value: loading ? '...' : stats.students, icon: Users },
    { label: 'የቤት ሥራዎች', value: loading ? '...' : stats.assignments, icon: FileText },
    { label: 'የሚጠበቁ ፈተናዎች', value: loading ? '...' : stats.pendingExams, icon: CheckSquare, variant: 'gold' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Stats Cards */}
      <StatCard stats={statsList} gridCols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />

      {/* Activities & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>የቅርብ ጊዜ የክፍል እንቅስቃሴዎች</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-2.5 list-disc list-inside">
              <li>ለክፍል 1ሀ አዲስ የትምህርት እቅድ ተዘጋጅቷል።</li>
              <li>ለወላጆች የማስታወቂያ መረጃ ተልኳል።</li>
              <li>የተማሪዎች ውጤት ተገምግሞ አዲስ የመማሪያ ማስታወሻ ተጭኗል።</li>
            </ul>
          </CardContent>
        </Card>

        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>ፈጣን ተግባራት</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/teacher/exams" className="block">
              <ActionCard
                icon={FileText}
                title="ትምህርት/ፈተና"
                description="አዲስ ይፍጠሩ"
              />
            </Link>
            <Link href="/teacher/results" className="block">
              <ActionCard
                icon={CheckSquare}
                title="ሥራዎችን መገምገም"
                description="ውጤት መዝግብ"
              />
            </Link>
            <Link href="/teacher/communication" className="block">
              <ActionCard
                icon={Send}
                title="ማስታወቂያ"
                description="መልእክት ላክ"
              />
            </Link>
            <Link href="/teacher/reports" className="block">
              <ActionCard
                icon={BarChart2}
                title="ሪፖርት"
                description="ስታቲስቲክስ አውጣ"
              />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherOverview;