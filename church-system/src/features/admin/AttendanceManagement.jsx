'use client';

import React, { useState } from 'react';
import { ClipboardList, Calendar, Search } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const AttendanceManagement = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="የተማሪዎች ቁጥጥርና አቴንዳንስ (Attendance Tracking)"
        subtitle="የክፍሎችን አቴንዳንስ እና የተማሪዎችን መገኘት ይከታተሉ"
        icon={ClipboardList}
        badge={<Badge variant="neutral" size="sm">የቀን መከታተያ</Badge>}
      />

      <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          icon={Calendar}
        />
        <Button variant="primary" className="gap-2 shrink-0">
          <Search className="w-4 h-4" />
          <span>አቴንዳንስ ፈልግ</span>
        </Button>
      </div>

      <Card variant="subtle" padding="lg" className="text-center py-16">
        <ClipboardList className="w-12 h-12 mx-auto text-slate-400 opacity-40 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">ምንም የአቴንዳንስ መረጃ አልተገኘም</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ለተመረጠው ቀን ({date}) የተመዘገበ የአቴንዳንስ መረጃ የለም።</p>
      </Card>
    </div>
  );
};

export default AttendanceManagement;