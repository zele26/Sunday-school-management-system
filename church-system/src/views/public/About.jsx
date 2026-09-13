'use client';

// src/views/public/About.jsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Sparkles, Heart, Users, Camera, ShieldCheck } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, FeatureCard } from '../../components/ui/Card';
import { ChurchGallery } from '../../components/shared/ChurchGallery';
import { useLanguage } from '../../hooks/useLanguage';

const About = () => {
  const { t, isAmharic } = useLanguage();

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
                  {t('aboutBadge', 'ስለ ሰንበት ትምህርት ቤታችን')}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {isAmharic ? (
                    <>ስለ <span className="text-[#1657b8] dark:text-blue-400">ተክለ ሳዊሮስ</span> ሰንበት ት/ቤት</>
                  ) : (
                    <>About <span className="text-[#1657b8] dark:text-blue-400">Tekle Sawiros</span> Sunday School</>
                  )}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
                  {t('aboutParagraph1', 'ተክለሳዊሮስ ሰንበት ትምህርት ቤት በማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን ሥር የሚገኝ ጥንታዊ፣ ታሪካዊና መንፈሳዊ ተቋም ነው።')}
                  {' '}
                  {t('aboutParagraph2', 'ከልጆች እስከ አዋቂዎች ድረስ የመጽሐፍ ቅዱስ ትምህርት፣ የቤተክርስቲያን ስርዓትና የዜማ ሥልጠና የሚሰጥበት የተቀደሰ መድረክ ነው።')}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>{t('viewGalleryBtn', 'የፎቶ ማህደር ይመልከቱ')}</span>
                  </Link>
                  <Link
                    href="/distance-education"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1657b8] dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <span>{t('distanceEducation', 'የርቀት ትምህርት')}</span>
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
                    {t('choirLabel', 'መዘምራን')}
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
                    {t('liturgyLabel', 'ቅዳሴና አገልግሎት')}
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
                    {t('classroomsLabel', 'የተማሪዎች ክፍል')}
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
                    {t('holidaysLabel', 'በዓላትና ኅብረት')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* 🌟 Dedicated Historic Founder & Church Builder Tribute Section */}
        <FadeIn delay={0.1}>
          <section className="bg-gradient-to-br from-amber-500/10 via-blue-900/5 to-slate-900/5 dark:from-amber-950/20 dark:via-blue-950/30 dark:to-slate-900 rounded-3xl p-6 sm:p-10 lg:p-12 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-lg relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Framed Sacred Portrait */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-3/4 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/60 dark:border-amber-400/40 group bg-slate-950">
                  <Image
                    src="/church-photos/founder.jpg"
                    alt={isAmharic ? 'የደብሩና የሰንበት ት/ቤቱ መስራች' : 'The Church Builder & Sunday School Founder'}
                    fill
                    sizes="(max-width: 640px) 100vw, 360px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {/* Subtle Gradient & Gold Trim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  
                  {/* Bottom Image Caption */}
                  <div className="absolute bottom-4 left-4 right-4 text-center space-y-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md tracking-wide">
                      {isAmharic ? 'መስራችና ባለውለታ' : 'Church Founder & Patron'}
                    </span>
                    <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium drop-shadow">
                      {isAmharic
                        ? 'በቀኝ እጃቸው ቅዱስ መስቀልና በግራ እጃቸው ያነጹትን ቤተመቅደስ ይዘው'
                        : 'Holding the Holy Cross & Church Sanctuary'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Historical Tribute Narrative */}
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{isAmharic ? 'ታሪካዊ ቅርስና መስራች' : 'Historical Heritage & Founder'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    {isAmharic ? (
                      <>የደብሩና የሰንበት ት/ቤቱ <span className="text-amber-600 dark:text-amber-400">መስራችና ባለውለታ</span></>
                    ) : (
                      <>The Founder & <span className="text-amber-600 dark:text-amber-400">Church Builder</span></>
                    )}
                  </h2>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  {isAmharic
                    ? 'እኚህ ታላቅ አባት ቤተክርስቲያኑን በገዛ ጥረታቸው ያነጹ፣ ሰንበት ትምህርት ቤቱም በስማቸው የተሰየመላቸው ታላቅ ባለውለታና መስራች ናቸው። ለመንፈሳዊው ትውልድ ያኖሩትን የማይጠፋ የሃይማኖትና የበረከት አሻራ በታላቅ አክብሮትና ምስጋና እንዘክራለን።'
                    : 'He is the revered patron and builder who built the church and established the foundational cornerstone for our Sunday School, which proudly bears his name. We honor his lifelong dedication, faith, and lasting spiritual legacy.'}
                </p>

                {/* 4 Feature highlight pills */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-300/40 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="text-amber-600 dark:text-amber-400 font-black text-xs sm:text-sm flex items-center gap-1.5">
                      <span>🏛️</span>
                      <span>{isAmharic ? 'የቤተመቅደሱ ገንቢ' : 'Church Builder'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAmharic ? 'ደብሩን በጽናት ያነጹ ታላቅ ባለውለታ' : 'Built the sacred church sanctuary'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-300/40 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="text-[#1657b8] dark:text-blue-400 font-black text-xs sm:text-sm flex items-center gap-1.5">
                      <span>📖</span>
                      <span>{isAmharic ? 'የሰንበት ት/ቤቱ ስያሜ' : 'Sunday School Namesake'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAmharic ? 'ተቋሙ በስማቸው ተሰይሞ ይገኛል' : 'Sunday School named in his honor'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-300/40 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="text-amber-600 dark:text-amber-400 font-black text-xs sm:text-sm flex items-center gap-1.5">
                      <span>✝️</span>
                      <span>{isAmharic ? 'የተዋሕዶ እምነት ጠባቂ' : 'Devout Orthodox Patron'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAmharic ? 'በእምነትና በምግባር የታነጸ ህይወት' : 'A life of faithful devotion & service'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-blue-300/40 dark:border-slate-800 shadow-2xs space-y-1">
                    <div className="text-[#1657b8] dark:text-blue-400 font-black text-xs sm:text-sm flex items-center gap-1.5">
                      <span>🌟</span>
                      <span>{isAmharic ? 'የዘላለም መታሰቢያ' : 'Enduring Heritage'}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAmharic ? 'ለትውልድ የሚተላለፍ መንፈሳዊ ቅርስ' : 'A lasting foundation for generations'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/gallery"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1657b8] dark:text-blue-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
                  >
                    <span>{isAmharic ? 'በፎቶ ማህደር ውስጥ ታሪካዊ ፎቶዎችን ይመልከቱ' : 'View Historical Photos in Gallery'}</span>
                    <span>→</span>
                  </Link>
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
              title={isAmharic ? 'ዓላማችን' : 'Our Objective'}
              description={
                isAmharic
                  ? 'የተከታዮቻችንን መንፈሳዊ እድገት ማፋጠን፣ በመጽሐፍ ቅዱሳዊ ዕውቀት ማበልፀግ እና በክርስቲያናዊ ምግባር የታነፀ ትውልድ ለቤተክርስቲያንና ለሀገር ማበርከት የዋና ዓላማችን አካል ነው።'
                  : 'To accelerate the spiritual growth of our followers, enrich them with Biblical knowledge, and contribute a generation rooted in Christian morals to the Church and nation.'
              }
            />
          </StaggerItem>

          {/* Card 2: Community & Fellowship */}
          <StaggerItem>
            <FeatureCard
              icon={Heart}
              iconBg="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
              title={isAmharic ? 'ማህበራዊ ህይወት' : 'Community & Fellowship'}
              description={
                isAmharic
                  ? 'ከትምህርቱ ባሻገር ተማሪዎች አርስ በእርሳቸው በፍቅርና በአንድነት የሚዛመዱበት፣ በበጎ አድራጎት ስራዎች የሚሳተፉበትና መንፈሳዊ ወንድማማችነትን የሚያጠናክሩበት መድረክ ነው።'
                  : 'Beyond classroom learning, our Sunday School provides a loving environment where students connect in unity, engage in charitable deeds, and strengthen spiritual brotherhood.'
              }
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Programs / What We Offer with Photo Cards */}
        <FadeIn delay={0.2}>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1657b8] dark:text-blue-400" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {isAmharic ? 'አገልግሎቶቻችን እና መርሃ ግብሮቻችን' : 'Our Educational Programs & Ministries'}
              </h2>
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
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">
                    {isAmharic ? 'የሕፃናት መርሃ ግብር' : 'Children Program'}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">
                    {isAmharic ? 'የሕፃናት ክፍል' : 'Children Ministry'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAmharic
                      ? 'ለህፃናት ተስማሚ በሆኑ የመዝሙር፣ የቅዱሳን ታሪክ እና የስዕል ትምህርቶች የታጀበ መርሃ ግብር።'
                      : 'Age-appropriate lessons in hymns, stories of holy saints, spiritual drawing, and Christian values.'}
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
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">
                    {isAmharic ? 'የወጣቶች መርሃ ግብር' : 'Youth Program'}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">
                    {isAmharic ? 'የወጣቶች ክፍል' : 'Youth Ministry'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAmharic
                      ? 'የመጽሐፍ ቅዱስ ጥናት፣ የነገረ-መለኮት መሰረቶች እና የወጣቶች ወቅታዊ ጥያቄዎች ምላሽ የሚሰጥበት ክፍል::'
                      : 'In-depth Bible study, theological foundations, apologetics, and addressing contemporary youth questions.'}
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
                  <span className="absolute bottom-2 left-3 text-xs font-bold text-white">
                    {isAmharic ? 'የአዋቂዎች መርሃ ግብር' : 'Adult Program'}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-[#1657b8] dark:text-blue-400">
                    {isAmharic ? 'የአዋቂዎች ክፍል' : 'Adult Ministry'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAmharic
                      ? 'ጥልቀት ያለው የመጽሐፍ ቅዱስ ጥናት እና የቤተክርስቲያን ታሪክና ስርዓት ትምህርቶች።'
                      : 'Advanced biblical exegesis, Patristics, Church history, and sacramental theology.'}
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
            title={isAmharic ? 'የደብሩና የሰንበት ት/ቤቱ ገጽታዎች' : 'Parish & Sunday School Highlights'}
            subtitle={isAmharic ? 'በተክለ ሳዊሮስ ሰንበት ትምህርት ቤት የሚካሄዱ መንፈሳዊ ትዕይንቶች' : 'Spiritual activities and celebrations at Tekle Sawiros'}
          />
        </FadeIn>

        {/* Closing Banner */}
        <FadeIn delay={0.3}>
          <Card variant="gold" padding="md" className="text-center">
            <p className="text-slate-800 dark:text-slate-200 text-sm font-semibold italic">
              {isAmharic
                ? '«ልጅን በሚሄድበት መንገድ ምራው፥ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» — (ምሳሌ ፳፪፥፮)'
                : '“Train up a child in the way he should go, and when he is old he will not depart from it.” — (Proverbs 22:6)'}
            </p>
          </Card>
        </FadeIn>

      </div>
    </div>
  );
};

export default About;