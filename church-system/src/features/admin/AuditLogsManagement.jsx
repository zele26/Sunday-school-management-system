'use client';

import React from 'react';
import { ShieldAlert, Clock, User } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const AuditLogsManagement = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="የሲስተም ኦዲት እና እንቅስቃሴዎች (Audit Logs)"
        subtitle="በሲስተሙ ውስጥ የተከናወኑ ሁሉንም አስተዳደራዊ እንቅስቃሴዎች ይመልከቱ"
        icon={ShieldAlert}
        badge={<Badge variant="gold" size="sm">የደህንነት መዝገብ</Badge>}
      />

      <Card variant="default" padding="none">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-blue-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">አድሚን ሲስተሙ ውስጥ ገብቷል (Admin Logged In)</p>
                <p className="text-[11px] text-slate-400">IP: 127.0.0.1 • Role: Superadmin</p>
              </div>
            </div>
            <Badge variant="neutral" size="sm">ዛሬ 09:00</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogsManagement;