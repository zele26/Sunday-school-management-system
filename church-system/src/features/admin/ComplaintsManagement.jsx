'use client';

import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const ComplaintsManagement = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="ቅሬታዎችና ጥቆማዎች (Complaints)"
        subtitle="ከተማሪዎች እና መምህራን የቀረቡ ቅሬታዎችን ያስተዳድሩ"
        icon={AlertTriangle}
        badge={<Badge variant="approved" size="sm">0 ቅሬታዎች</Badge>}
      />

      <Card variant="subtle" padding="lg" className="text-center py-16">
        <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 opacity-60 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">ምንም አዲስ የቀረበ ቅሬታ የለም</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ሁሉም ነገሮች በሰላም እየተካሄዱ ናቸው (No complaints received)</p>
      </Card>
    </div>
  );
};

export default ComplaintsManagement;