'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, ArrowLeft, UserPlus, Layers, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatEthiopianDate } from '../../utils/ethiopianDate';

const DepartmentHub = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, [id]);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      if (id) {
        const res = await apiFetch(`/api/core/departments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDepartment(data.department || data);
        }
      }
      const memRes = await apiFetch(`/api/core/department-memberships?departmentId=${id || ''}`);
      if (memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.memberships || memData || []);
      }
    } catch (err) {
      console.error('Error fetching department details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400 dark:text-slate-500">
        <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">የክፍሉ መረጃ በመጫን ላይ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={department?.name || 'Department Control Hub'}
        subtitle={department?.description || 'የክፍሉን አባላት፣ እንቅስቃሴዎች እና ሪፖርቶች እዚህ ያስተዳድሩ'}
        icon={Building2}
        badge={<Badge variant="gold" size="sm">{department?.code || 'DEPT'}</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/departments')}
              className="gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ወደ ክፍሎች ተመለስ</span>
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={() => navigate('/admin/department-memberships')}
              className="gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ አባል መድብ</span>
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Members</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{members.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">ንቁ አገልጋዮችና አባላት</p>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Status</p>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{department?.status || 'Active'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">በቤተክርስቲያኑ ንቁ አገልግሎት ላይ</p>
        </Card>

        <Card variant="elevated" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Module Scoping</p>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">Autonomous</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Role-Based Access Guarded</p>
        </Card>
      </div>

      {/* Members Section */}
      <Card variant="default" padding="none">
        <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">የክፍሉ አገልጋዮችና አባላት</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">ለዚህ የአገልግሎት ክፍል የተመደቡ ግለሰቦች ዝርዝር</p>
          </div>
          <Badge variant="active" size="sm">{members.length} የተመደቡ</Badge>
        </div>

        {members.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Users className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-semibold">ለዚህ ክፍል የተመደበ አባል የለም</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Member ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Start Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {m.personId?.firstName ? `${m.personId.firstName} ${m.personId.lastName || ''}` : (m.personId?.fullName || 'Member')}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[var(--brand-primary)] dark:text-blue-400">
                      {m.departmentMemberId || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={m.status === 'active' ? 'approved' : 'neutral'} size="sm">
                        {m.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {m.startDate ? formatEthiopianDate(m.startDate) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DepartmentHub;
