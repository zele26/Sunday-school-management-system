// src/features/teacher/TeacherCommunication.jsx
'use client';

import React from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../../components/ui';

const TeacherCommunication = () => {
  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የግንኙነት ሰሌዳ (Communication)</span>
        </CardTitle>
        <CardDescription>ለተማሪዎች ወይም ለወላጆች መልእክት ይላኩ።</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <textarea
          rows={4}
          placeholder="መልእክትዎን እዚህ ይጻፉ... (Write your announcement or message here)"
          className="w-full p-3.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
        ></textarea>
        <div>
          <Button variant="default" size="sm" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>መልእክት ላክ (Send Message)</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherCommunication;