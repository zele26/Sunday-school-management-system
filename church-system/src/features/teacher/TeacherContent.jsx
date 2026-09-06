// src/features/teacher/TeacherContent.jsx
'use client';

import React from 'react';
import { Layers, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../components/ui';

const TeacherContent = () => {
  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>ይዘት እና ፈተናዎች (Content & Exams)</span>
          </CardTitle>
          <CardDescription>የትምህርት ቁሳቁሶችን እና ፈተናዎችን ይስቀሉ ወይም ያዘጋጁ።</CardDescription>
        </div>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>አዲስ ይዘት ያክሉ</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          እስካሁን ምንም የተጫነ ትምህርት ወይም ፈተና የለም።
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherContent;