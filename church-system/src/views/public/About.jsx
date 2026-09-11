'use client';

// src/views/public/About.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Sparkles, Heart, Users, Camera, ShieldCheck } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, FeatureCard } from '../../components/ui/Card';
import { ChurchGallery } from '../../components/shared/ChurchGallery';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header / Intro Section with Real Church Photos Collage */}
        <FadeIn direction="down" duration={0.5}>
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/80 dark:bg-blue-950/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/60 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />
            
            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  ስለ ሰንበት ትምህርት ቤታችን
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  ስለ <span className="text-[#1657b8] dark:text-blue-400">ተክለ ሳዊሮስ</span> ሰንበት ት/ቤት
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                  ተክለሳዊሮስ ሰንበት ትምህርት ቤት በማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን ሥር የሚገኝ ጥንታዊ፣ ታሪካዊና መንፈሳዊ ተቋም ነው። 
                  ከልጆች እስከ አዋቂዎች ድረስ የመጽሐፍ ቅዱስ ትምህርት፣ የቤተክርስቲያን ስርዓትና የዜማ ሥልጠና የሚሰጥበት የተቀደሰ መድረክ ነው።
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>የፎቶ ማህደር ይመልከቱ</span>
                  </Link>
                  <Link
                    href="/distance-education"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1657b8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <span>የርቀት ትምህርት</span>
                  </Link>
                </div>
              </div>

              {/* Real Church Photos Mini Collage */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-amber-400/40">
                  <Image
                    src="/church-photos/photo1.png"
                    alt="የሰንበት ት/ቤት መዘምራን"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/70 text-[9px] text-white px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                    መዘምራን
                  </span>
                </div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-blue-400/40 mt-4">
                  <Image
                    src="/church-photos/photo2.png"
                    alt="የቅዳሴ አገልግሎት"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/70 text-[9px] text-white px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                    ቅዳሴና አገልግሎት
                  </span>
                </div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-amber-400/40">
                  <Image
                    src="/church-photos/photo3.png"
                    alt="የትምህርት ክፍል"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/70 text-[9px] text-white px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                    የተማሪዎች ክፍል
                  </span>
                </div>
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-blue-400/40 mt-4">
                  <Image
                    src="/church-photos/photo4.png"
                    alt="የበዓል አከባበር"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-slate-950/70 text-[9px] text-white px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                    በዓላትና ኅብረት
                  </span>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Objectives Grid Section */}
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

        {/* Programs / What We Offer with Photo Cards */}
        <FadeIn delay={0.2}>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1657b8] dark:text-blue-400" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">አገልግሎቶቻችን እና መርሃ ግብሮቻችን</h2>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6">
              {/* Program 1 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-16/10 w-full overflow-hidden">
                  <Image
                    src="/church-photos/photo10.png"
                    alt="የሕፃናት ክፍል"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">የሕፃናት መርሃ ግብር</span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">የሕፃናት ክፍል</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    ለህፃናት ተስማሚ በሆኑ የመዝሙር፣ የቅዱሳን ታሪክ እና የስዕል ትምህርቶች የታጀበ መርሃ ግብር።
                  </p>
                </div>
              </div>

              {/* Program 2 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-16/10 w-full overflow-hidden">
                  <Image
                    src="/church-photos/photo7.png"
                    alt="የወጣቶች ክፍል"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">የወጣቶች መርሃ ግብር</span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">የወጣቶች ክፍል</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    የመጽሐፍ ቅዱስ ጥናት፣ የነገረ-መለኮት መሰረቶች እና የወጣቶች ወቅታዊ ጥያቄዎች ምላሽ የሚሰጥበት ክፍል::
                  </p>
                </div>
              </div>

              {/* Program 3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div className="relative aspect-16/10 w-full overflow-hidden">
                  <Image
                    src="/church-photos/photo5.png"
                    alt="የአዋቂዎች ክፍል"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">የአዋቂዎች መርሃ ግብር</span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">የአዋቂዎች ክፍል</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    ጥልቀት ያለው የመጽሐፍ ቅዱስ ጥናት እና የቤተክርስቲያን ታሪክና ስርዓት ትምህርቶች።
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Embedded Church Photo Gallery Section */}
        <FadeIn delay={0.25}>
          <ChurchGallery
            limit={8}
            showFilters={false}
            title="የደብሩና የሰንበት ት/ቤቱ ገጽታዎች"
            subtitle="በተክለ ሳዊሮስ ሰንበት ትምህርት ቤት የሚካሄዱ መንፈሳዊ ትዕይንቶች"
          />
        </FadeIn>

        {/* Closing Banner */}
        <FadeIn delay={0.3}>
          <Card variant="gold" padding="md" className="text-center">
            <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold italic">
              «ልጅን በሚሄድበት መንገድ ምራው፥ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» — (ምሳሌ ፳፪፥፮)
            </p>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
};

export default About;