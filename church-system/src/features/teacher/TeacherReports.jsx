// src/features/teacher/TeacherReports.jsx
'use client';

import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../components/ui';

const TeacherReports = () => {
  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle>የመምህራን ሪፖርት</CardTitle>
        <CardDescription>የክፍል መገኘት እና የውጤት ሪፖርቶችን ያውጡ።</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3 p-0">
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>የመገኘት ሪፖርት (PDF)</span>
        </Button>
        <Button variant="neutral" size="sm" className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          <span>የውጤት ሪፖርት (Excel)</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TeacherReports;