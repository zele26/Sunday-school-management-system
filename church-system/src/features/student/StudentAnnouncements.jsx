'use client';

// src/features/student/StudentAnnouncements.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Pin } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { FadeIn } from '../../components/motion';
import { useLanguage } from '../../hooks/useLanguage';

const StudentAnnouncements = () => {
  const { t, isAmharic } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const fetchNotices = async () => {
      try {
        const res = await apiFetch('/api/announcements');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAnnouncements(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load announcements:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchNotices();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAnnouncements =
    selectedFilter === 'all'
      ? announcements
      : announcements.filter(
          (a) =>
            a.targetType === selectedFilter ||
            a.category === selectedFilter ||
            (selectedFilter === 'urgent' && a.priority === 'urgent')
        );

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isAmharic ? 'የሰንበት ትምህርት ቤት ማስታወቂያዎች' : 'Official Announcements'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAmharic
                ? 'ወቅታዊ መረጃዎችን እና ይፋዊ መግለጫዎችን እዚህ ያግኙ'
                : 'Stay informed with the latest updates and notices'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', labelAm: 'ሁሉም', labelEn: 'All' },
            { id: 'urgent', labelAm: 'አስቸኳይ', labelEn: 'Urgent' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedFilter === cat.id
                  ? 'bg-[#1e3a8a] text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isAmharic ? cat.labelAm : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">
            {isAmharic ? 'ማስታወቂያዎች በመጫን ላይ ናቸው...' : 'Loading announcements...'}
          </p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            {isAmharic ? 'ምንም አዲስ ማስታወቂያ የለም' : 'No active announcements'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isAmharic
              ? 'አዳዲስ ይፋዊ ማስታወቂያዎች ሲለጠፉ እዚህ ይዘረዘራሉ።'
              : 'New announcements published by administration will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAnnouncements.map((notice) => (
            <FadeIn key={notice._id || notice.title}>
              <div
                className={`bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border transition-all space-y-3 ${
                  notice.priority === 'urgent'
                    ? 'border-amber-400/80 dark:border-amber-500/60 shadow-md ring-1 ring-amber-400/20'
                    : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {notice.priority === 'urgent' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 text-[11px] font-black border border-amber-300/40">
                        <Pin className="w-3 h-3 rotate-45" />
                        <span>{isAmharic ? 'አስቸኳይ' : 'Urgent'}</span>
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                      {notice.targetType === 'all'
                        ? isAmharic
                          ? 'አጠቃላይ'
                          : 'General'
                        : isAmharic
                        ? 'ማስታወቂያ'
                        : 'Notice'}
                    </span>
                  </div>

                  {notice.createdAt && (
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatEthiopianDate(notice.createdAt)}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {notice.message || notice.content}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAnnouncements;