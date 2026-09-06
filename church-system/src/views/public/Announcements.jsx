'use client';

import React from 'react';
import { Bell, Calendar, AlertCircle } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, FeatureCard } from '../../components/ui/Card';

const announcements = [
  { title: 'የ2026/2027 ትምህርት ዓመት መጀመሪያ', date: 'መስከረም 5 / 2026 ዓ.ም' },
  { title: 'የልጆች የጸሎትና የምስጋና ቀን', date: 'ጥቅምት 2 / 2026 ዓ.ም' },
];

const PublicAnnouncements = () => {
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
                ወቅታዊ መረጃዎች
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                ማስታወቂያዎች
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                ከሰንበት ትምህርት ቤታችን የሚወጡ አዳዲስ ማስታወቂያዎችን፣ የመርሃ ግብር ለውጦችን እና አስፈላጊ መረጃዎችን እዚህ ያገኛሉ።
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Announcements List with Reusable FeatureCard */}
        <StaggerContainer staggerChildren={0.12} className="space-y-4">
          {announcements.map((a) => (
            <StaggerItem key={a.title}>
              <FeatureCard
                icon={Bell}
                iconBg="bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400"
                title={a.title}
                badge="ቀጣይ መርሃ-ግብር"
                description={`ቀን: ${a.date}`}
                footer={
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>የተለጠፈበት ቀን፡ {a.date}</span>
                  </div>
                }
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Notice Callout with Reusable Card */}
        <FadeIn delay={0.25}>
          <Card variant="default" padding="lg" className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 mb-1">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              አስፈላጊ ማሳሰቢያ
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              ለበለጠ መረጃ እና ለተጨማሪ ጥያቄዎች በደወል ወይም በስራ ሰዓት በግንባር በመገኘት መጠየቅ ይችላሉ።
            </p>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
};

export default PublicAnnouncements;