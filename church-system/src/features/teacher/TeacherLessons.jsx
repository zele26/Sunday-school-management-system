'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ListOrdered } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../../components/ui';

const TeacherLessons = () => {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', courseId: '', order: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
    fetchLessons();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/teacher/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setCourses(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/teacher/lessons`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setLessons(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/teacher/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ title: '', content: '', courseId: '', order: 0 });
        fetchLessons();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="default" padding="lg">
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
              <span>የትምህርት ክፍለ ጊዜያት (My Lessons)</span>
            </CardTitle>
            <Badge variant="neutral" size="sm">{lessons.length} ክፍሎች</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 p-0">
          <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--brand-primary)]" />
              <span>አዲስ ትምህርት ጨምር (Add New Lesson)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="title"
                placeholder="የክፍለ ጊዜው ርዕስ (Lesson Title)"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <select
                name="courseId"
                required
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">ኮርስ ይምረጡ (Select Course)</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <textarea
              name="content"
              placeholder="የትምህርቱ ማብራሪያና ይዘት (Lesson Content)"
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="flex items-center gap-4">
              <div className="w-32">
                <input
                  type="number"
                  name="order"
                  placeholder="ተራ ቁጥር (Order)"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <Button type="submit" disabled={loading} size="sm" className="font-bold">
                {loading ? 'በመጫን ላይ...' : 'ትምህርቱን ጫን (Upload Lesson)'}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-amber-500" />
              <span>የተዘጋጁ ትምህርቶች (Existing Lessons)</span>
            </h3>

            {lessons.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                ምንም የተጫነ ትምህርት የለም (No lessons uploaded yet)
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                {lessons.map((l) => (
                  <div key={l._id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{l.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.course?.name || 'ኮርስ ያልተገለጸ'}</p>
                    </div>
                    <Badge variant="subtle" size="sm">ተራ፡ {l.order}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherLessons;