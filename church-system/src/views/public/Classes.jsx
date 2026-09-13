'use client';

import React from 'react';
import { GraduationCap, Clock, Sparkles } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, FeatureCard } from '../../components/ui/Card';
import { useLanguage } from '../../hooks/useLanguage';

const Classes = () => {
  const { t, isAmharic } = useLanguage();

  const classList = [
    {
      grade: t('grade7Title', '7ኛ ክፍል'),
      age: '12-13',
      description: t('grade7Desc', 'የመጀመሪያ ደረጃ የመጽሐፍ ቅዱስ ትምህርት'),
    },
    {
      grade: t('grade8Title', '8ኛ ክፍል'),
      age: '13-14',
      description: t('grade8Desc', 'የክርስትና ሕይወት መሠረቶች'),
    },
    {
      grade: t('grade9Title', '9ኛ ክፍል'),
      age: '14-15',
      description: t('grade9Desc', 'የወንጌል ታሪክ እና ትምህርት'),
    },
    {
      grade: t('grade10Title', '10ኛ ክፍል'),
      age: '15-16',
      description: t('grade10Desc', 'የብሉይ ኪዳን አጠቃላይ እይታ'),
    },
    {
      grade: t('grade11Title', '11ኛ ክፍል'),
      age: '16-17',
      description: t('grade11Desc', 'የሐዋርያት ሥራ እና የመጀመሪያዎቹ አብያተ ክርስቲያናት'),
    },
    {
      grade: t('grade12Title', '12ኛ ክፍል'),
      age: '17-18',
      description: t('grade12Desc', 'የክርስትና መሪነት እና የሕይወት ዝግጅት'),
    },
  ];

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
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {t('classesBadge', 'የትምህርት መርሃ-ግብር')}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {t('ourClassesHeading', 'ክፍሎቻችን')}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                {t('classesSubheading', 'በየደረጃው ያሉ ተማሪዎች የመጽሐፍ ቅዱስ ዕውቀትና መንፈሳዊ ብስለት እንዲያገኙ በጥንቃቄ የተዘጋጁ የትምህርት ክፍሎች።')}
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Classes Grid with Reusable FeatureCard */}
        <StaggerContainer staggerChildren={0.1} className="grid md:grid-cols-2 gap-6">
          {classList.map((c) => (
            <StaggerItem key={c.grade}>
              <FeatureCard
                icon={GraduationCap}
                iconBg="bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400"
                title={c.grade}
                badge={`${t('ageRangeLabel', 'ዕድሜ')} ${c.age}`}
                description={c.description}
                footer={
                  <div className="flex items-center justify-between text-xs font-bold text-[#1657b8] dark:text-blue-400">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {t('studySessionLabel', 'የጥናት ክፍለ ጊዜ')}
                    </span>
                    <span>{t('weeklyScheduleNote', 'በየሳምንቱ እሑድ →')}</span>
                  </div>
                }
              />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Additional Info Box with Reusable Card */}
        <FadeIn delay={0.25}>
          <Card variant="default" padding="lg" className="text-center space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t('teachingMethodologyTitle', 'የትምህርት አሰጣጥ ስርዓታችን')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t('teachingMethodologyDesc', 'ትምህርቱ በንድፈ-ሀሳብ ብቻ ሳይወሰን በተግባራዊ ክርስቲያናዊ ህይወት፣ በመዝሙር እና በነፃ ውይይት የተደገፈ ነው።')}
            </p>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
};

export default Classes;