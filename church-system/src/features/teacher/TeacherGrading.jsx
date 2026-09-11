// src/features/teacher/TeacherGrading.jsx
'use client';

import React from 'react';
import { Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui';

const TeacherGrading = () => {
  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>ውጤት መስጫ</span>
        </CardTitle>
        <CardDescription>የተማሪዎችን ፈተና እና የቤት ሥራ ውጤቶች ያስገቡ።</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          ለውጤት አሰጣጥ የተላከ የቤት ሥራ የለም።
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherGrading;