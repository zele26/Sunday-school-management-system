// src/features/student/StudentAttendance.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

const StudentAttendance = () => {
  return (
    <Card variant="default" padding="lg" className="space-y-4 font-sans">
      <CardHeader>
        <CardTitle>የመገኘት መዝገብ (Attendance History)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          ምንም የመገኘት መዝገብ አልተገኘም።
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAttendance;