'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, FeatureCard } from '../../components/ui/Card';
import { useLanguage } from '../../hooks/useLanguage';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';

const PublicAnnouncements = () => {
  const { t, isAmharic } = useLanguage();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      try {
        const res = await apiFetch('/api/announcements');
        if (res.ok && isMounted) {
          const data = await res.json().catch(() => []);
          if (Array.isArray(data)) {
            setAnnouncements(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load public announcements:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAnnouncements();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Hero Section */}
        <FadeIn direction="down" duration={0.5}>
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/80 dark:bg-blue-950/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-50/60 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
                <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {t('announcementsBadge', 'ወቅታዊ መረጃዎች')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {t('announcements', 'ማስታወቂያዎች')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                {t(
                  'announcementsSubheading',
                  'ከሰንበት ትምህርት ቤታችን የሚወጡ አዳዲስ ማስታወቂያዎችን፣ የመርሃ ግብር ለውጦችን እና አስፈላጊ መረጃዎችን እዚህ ያገኛሉ።'
                )}
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Announcements List with Reusable FeatureCard */}
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">
              {isAmharic ? 'ማስታወቂያዎች በመጫን ላይ ናቸው...' : 'Loading announcements...'}
            </p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              {isAmharic ? 'ምንም አዲስ ይፋዊ ማስታወቂያ የለም' : 'No active public announcements'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isAmharic
                ? 'አዳዲስ ይፋዊ ማስታወቂያዎች ሲለጠፉ እዚህ ይዘረዘራሉ።'
                : 'New announcements published by administration will appear here.'}
            </p>
          </div>
        ) : (
          <StaggerContainer staggerChildren={0.12} className="space-y-4">
            {announcements.map((a) => (
              <StaggerItem key={a._id || a.title}>
                <FeatureCard
                  icon={Bell}
                  iconBg={
                    a.priority === 'urgent'
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400'
                  }
                  title={a.title}
                  badge={
                    a.priority === 'urgent'
                      ? (isAmharic ? 'አስቸኳይ ማስታወቂያ' : 'Urgent Notice')
                      : (isAmharic ? 'ይፋዊ መረጃ' : 'Official Notice')
                  }
                  description={a.content || a.message || ''}
                  footer={
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {isAmharic ? 'የተለጠፈበት ቀን፡ ' : 'Posted Date: '}
                        {a.createdAt ? formatEthiopianDate(a.createdAt) : ''}
                      </span>
                    </div>
                  }
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Notice Callout with Reusable Card */}
        <FadeIn delay={0.25}>
          <Card variant="default" padding="lg" className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 mb-1">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isAmharic ? 'አስፈላጊ ማሳሰቢያ' : 'Important Notice'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {isAmharic
                ? 'ለበለጠ መረጃ እና ለተጨማሪ ጥያቄዎች በደወል ወይም በስራ ሰዓት በግንባር በመገኘት መጠየቅ ይችላሉ።'
                : 'For more information and inquiries, you may contact our office via phone or in-person during regular service hours.'}
            </p>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
};

export default PublicAnnouncements;