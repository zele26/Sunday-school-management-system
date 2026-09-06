'use client';

import React from 'react';
import { BookOpen, Sparkles, Heart, Users } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, FeatureCard, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header / Intro Section */}
        <FadeIn direction="down" duration={0.5}>
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/80 dark:bg-blue-950/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/60 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />
            
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ስለ ሰንበት ትምህርት ቤታችን
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                ስለ <span className="text-[#1657b8] dark:text-blue-400">ተክለ ሳዊሮስ</span> ሰንበት ት/ቤት
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                ተክለሳዊሮስ ሰንበት ትምህርት ቤት ከልጆች እስከ አዋቂዎች ድረስ የመጽሐፍ ቅዱስ ትምህርት እና መንፈሳዊ ሥልጠና የሚሰጥበት ተቋም ነው። 
                በየሳምንቱ በሚካሄደው ትምህርት ተማሪዎች የእግዚአብሔርን ቃል በጥልቀት እንዲማሩ እና በሕይወታቸው እንዲተገብሩ ይበረታታሉ።
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Objectives Grid Section using Reusable FeatureCard */}
        <StaggerContainer staggerChildren={0.15} className="grid md:grid-cols-2 gap-8">
          {/* Card 1: Our Objectives */}
          <StaggerItem>
            <FeatureCard
              icon={BookOpen}
              iconBg="bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400"
              title="ዓላማችን"
              description="የተከታዮቻችንን መንፈሳዊ እድገት ማፋጠን፣ በመጽሐፍ ቅዱሳዊ ዕውቀት ማበልፀግ እና በክርስቲያናዊ ምግባር የታነፀ ትውልድ ለቤተክርስቲያንና ለሀገር ማበርከት የዋና ዓላማችን አካል ነው።"
            />
          </StaggerItem>

          {/* Card 2: Community & Fellowship */}
          <StaggerItem>
            <FeatureCard
              icon={Heart}
              iconBg="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
              title="ማህበራዊ ህይወት"
              description="ከትምህርቱ ባሻገር ተማሪዎች አርስ በእርሳቸው በፍቅርና በአንድነት የሚዛመዱበት፣ በበጎ አድራጎት ስራዎች የሚሳተፉበትና መንፈሳዊ ወንድማማችነትን የሚያጠናክሩበት መድረክ ነው።"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Programs / What We Offer */}
        <FadeIn delay={0.2}>
          <Card variant="default" padding="lg" className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1657b8] dark:text-blue-400" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">አገልግሎቶቻችን እና መርሃ ግብሮቻችን</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 pt-2">
              <div className="border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-6 sm:pb-0 sm:pr-6 space-y-2">
                <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">የሕፃናት ክፍል</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  ለህፃናት ተስማሚ በሆኑ የመዝሙር፣ የቅዱሳን ታሪክ እና የስዕል ትምህርቶች የታጀበ መርሃ ግብር።
                </p>
              </div>

              <div className="border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-6 sm:pb-0 sm:pr-6 space-y-2">
                <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">የወጣቶች ክፍል</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  የመጽሐፍ ቅዱስ ጥናት፣ የነገረ-መለኮት መሰረቶች እና የወጣቶች ወቅታዊ ጥያቄዎች ምላሽ የሚሰጥበት ክፍል::
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">የአዋቂዎች ክፍል</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  ጥልቀት ያለው የመጽሐፍ ቅዱስ ጥናት እና የቤተክርስቲያን ታሪክና ስርዓት ትምህርቶች።
                </p>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Closing Banner */}
        <FadeIn delay={0.3}>
          <Card variant="gold" padding="md" className="text-center">
            <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold italic">
              «ህፃንን በቦታው አሳድገው፤ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» — ምሳሌ 22:6
            </p>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
};

export default About;