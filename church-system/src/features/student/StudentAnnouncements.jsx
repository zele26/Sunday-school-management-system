// src/features/student/StudentAnnouncements.jsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

const StudentAnnouncements = () => {
  return (
    <Card variant="default" padding="lg" className="space-y-4 font-sans">
      <CardHeader>
        <CardTitle>ማስታወቂያዎች (Announcements)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          አዲስ ማስታወቂያ የለም።
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentAnnouncements;