'use client';

// src/features/student/StudentAnnouncements.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Pin, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { FadeIn, MotionCard } from '../../components/motion';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([
    {
      _id: '1',
      title: 'የ2017 ዓ.ም የመንፈቀ ዓመት የፈተና መርሐ ግብር ይፋ ሆኗል',
      content: 'የመጀመሪያ መንፈቀ ዓመት ማጠቃለያ ፈተና ከኅዳር 15 ጀምሮ ስለሚሰጥ ተማሪዎች አስቀድማችሁ እንድትዘጋጁ እናሳስባለን። የፈተናውን ዝርዝር የጊዜ ሰሌዳ ከቢሮ ወይም ከድረ-ገጹ ማግኘት ትችላላችሁ።',
      category: 'አካዳሚክ',
      isPinned: true,
      isNew: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'የመዘምራን ልዩ ልምምድ ቅዳሜ ከሰዓት 8:00 ይካሄዳል',
      content: 'ለመጪው የበዓለ ንግሥ አገልግሎት ዝግጅት የሚሆን የዝማሬ ልምምድ ስለሚኖር የዝማሬ ክፍሉ አባላት በሙሉ በሰዓቱ እንድትገኙ ተጠርታችኋል።',
      category: 'ዝማሬና አገልግሎት',
      isPinned: false,
      isNew: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      title: 'የሰንበት ትምህርት ቤት ዓመታዊ መንፈሳዊ ጉዞ ምዝገባ',
      content: 'ወደ ጥንታዊው ገዳም የሚደረገው ዓመታዊ ጉዞ ምዝገባ ተጀምሯል። ቦታዎች ውስን ስለሆኑ አስቀድመው ይመዝገቡ።',
      category: 'አጠቃላይ',
      isPinned: false,
      isNew: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await apiFetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAnnouncements(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load announcements:', err);
      }
    };
    fetchNotices();
  }, []);

  const filteredAnnouncements = selectedFilter === 'all'
    ? announcements
    : announcements.filter((a) => a.category === selectedFilter);

  return (
    <div className="space-y-6 font-sans">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              የሰንበት ትምህርት ቤት ማስታወቂያዎች
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ወቅታዊ መረጃዎችን እና የአገልግሎት ጥሪዎችን እዚህ ያግኙ
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'አካዳሚክ', 'ዝማሬና አገልግሎት', 'አጠቃላይ'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-[#1e3a8a] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'ሁሉም' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="grid gap-4">
        {filteredAnnouncements.map((notice) => (
          <FadeIn key={notice._id || notice.title}>
            <div
              className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border transition-all space-y-3 ${
                notice.isPinned
                  ? 'border-amber-400/80 dark:border-amber-500/60 shadow-md ring-1 ring-amber-400/20'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {notice.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 text-[11px] font-black border border-amber-300/40">
                      <Pin className="w-3 h-3 rotate-45" />
                      <span>ተሰክቷል</span>
                    </span>
                  )}
                  {notice.isNew && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      አዲስ
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {notice.category || 'ማስታወቂያ'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatEthiopianDate(notice.createdAt)}</span>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {notice.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {notice.content}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
};

export default StudentAnnouncements;