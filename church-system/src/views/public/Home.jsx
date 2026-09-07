'use client';

// src/views/public/Home.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, AnimatedModal } from '../../components/motion';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Badge,
} from '../../components/ui';
import { ChurchGallery } from '../../components/shared/ChurchGallery';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 selection:bg-[var(--brand-gold)] selection:text-slate-950 overflow-x-hidden">
      {/* 🌟 1. HERO SECTION - Elevated Clean Sacred Design */}
      <section className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 bg-gradient-to-b from-blue-50/40 via-white to-slate-50/40 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Subtle, soft ambient backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 sm:space-y-6">
          {/* Centered Church Logo with crisp elevation & golden accent */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center cursor-pointer group"
          >
            {/* White Polished Emblem Shield with crisp, elegant border and soft shadow */}
            <div className="relative w-full h-full p-2 sm:p-2.5 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-400/90 shadow-xl shadow-slate-200/80 dark:shadow-slate-950/60 flex items-center justify-center overflow-hidden ring-4 ring-amber-400/15">
              <Image
                src={ChurchLogo}
                alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት አርማ"
                width={160}
                height={160}
                priority
                className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-500"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </motion.div>

          {/* Title, Parish Badge, Subtitle & Motto Group */}
          <FadeIn delay={0.1} className="space-y-3 sm:space-y-3.5 max-w-3xl mx-auto">
            {/* Church Parish Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 text-slate-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30 text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-1.5 rounded-full shadow-2xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="truncate max-w-[90vw]">
                ⛪ የማህደረ ስብሐት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
              </span>
            </div>

            {/* Main Sacred Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-[#0d3b82] dark:text-white">
              ተክለ ሳዊሮስ ሰንበት ት/ቤት
            </h1>

            {/* Subtitle & Distinct Motto */}
            <div className="space-y-2 pt-0.5">
              <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200">
                የሕፃናት፣ የወጣቶችና የአዋቂዎች መንፈሳዊ ትምህርት ማዕከል
              </p>
              
              {/* Distinguished Motto in dignified quote pill */}
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/80 text-[#1657b8] dark:text-blue-300 text-xs sm:text-sm font-bold tracking-wide italic">
                  «በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።»
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Action CTAs (Primary Register vs Secondary Distance Ed) */}
          <FadeIn delay={0.2} className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 max-w-lg mx-auto">
            {/* Primary CTA: Register button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegOptions(true)}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:opacity-90 text-white px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all text-base flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <span>ይመዝገቡ (Register Now)</span>
              <span className="text-amber-300 font-black text-lg">➔</span>
            </motion.button>

            {/* Secondary CTA: Distance Education Outline Link */}
            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto flex-1">
              <Link
                href="/distance-education"
                className="w-full bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-400/10 dark:hover:bg-amber-400/20 text-amber-900 dark:text-amber-300 border-2 border-amber-500/60 hover:border-amber-500 px-6 py-3 rounded-2xl font-bold shadow-xs hover:shadow-sm transition-all text-base flex items-center justify-center gap-2 text-center"
              >
                <span>🌐</span>
                <span>የርቀት ትምህርት (Distance Ed)</span>
              </Link>
            </motion.div>
          </FadeIn>
        </div>
      </section>

      {/* 🌟 2. VISION / MISSION / VALUES SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {/* Vision */}
          <StaggerItem>
            <MotionCard className="h-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 dark:hover:border-blue-500/40 transition-all text-center group">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#1657b8] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">ራዕያችን</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                ማኅበረሰቡን በእግዚአብሔር ቃልና በኦርቶዶክሳዊት ተዋሕዶ ቤተ ክርስቲያን ስርዓት ማነጽ።
              </p>
            </MotionCard>
          </StaggerItem>

          {/* Mission */}
          <StaggerItem>
            <MotionCard className="h-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all text-center group">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--brand-gold)] group-hover:text-slate-950 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">ተልዕኳችን</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                ለሁሉም የዕድሜ ክልል ጥራት ያለውና ተደራሽ የሆነ የሰንበት ትምህርት አገልግሎት መስጠት።
              </p>
            </MotionCard>
          </StaggerItem>

          {/* Values */}
          <StaggerItem>
            <MotionCard className="h-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 dark:hover:border-blue-500/40 transition-all text-center group">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#1657b8] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">እሴቶቻችን</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                እምነት፣ ፍቅር፣ አንድነት፣ ትህትና እና ታማኝነት።
              </p>
            </MotionCard>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* 🌟 3. WHY CHOOSE US SECTION */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1657b8] dark:text-blue-400 mb-3 tracking-tight">
              ለምን እኛን ይመርጣሉ?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
              በሰንበት ትምህርት ቤታችን ህፃናትና ወጣቶች በመንፈሳዊ ዕውቀትና በበጎ ምግባር ታንፀው እንዲያድጉ ምቹ ሁኔታዎችን አመቻችተናል።
            </p>
          </FadeIn>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 text-left">
            <StaggerItem>
              <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3.5 space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200 dark:border-blue-800">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">ተሞክሮ ያላቸው መምህራን</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    በመንፈሳዊ ትምህርት የዳበረ ልምድ ባላቸው መምህራን የሚሰጥ ትምህርት።
                  </p>
                </div>
              </MotionCard>
            </StaggerItem>

            <StaggerItem>
              <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3.5 space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-base shrink-0 border border-amber-200 dark:border-amber-800">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">የተለያዩ የዕድሜ ክፍሎች</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    ከህፃናት እስከ ወጣቶች ለሁሉም ተስማሚ የሆኑ የትምህርት መርሃ ግብሮች።
                  </p>
                </div>
              </MotionCard>
            </StaggerItem>

            <StaggerItem>
              <MotionCard className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3.5 space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200 dark:border-blue-800">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1">መንፈሳዊና ማህበራዊ እንቅስቃሴዎች</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    መዝሙር፣ ጉዞዎችና ማህበራዊ አገልግሎቶች።
                  </p>
                </div>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 🌟 4. CHURCH PHOTO SHOWCASE GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ChurchGallery
          limit={8}
          showFilters={true}
          title="የሰንበት ትምህርት ቤታችን ገጽታዎች በፎቶ"
          subtitle="የደብረ ፀሐይ ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ተክለ ሳዊሮስ ሰንበት ት/ቤት መንፈሳዊ ጉባኤዎች፣ የዝማሬ መርሃ ግብሮችና የበዓላት ትዕይንት"
        />
        <div className="mt-8 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>ሁሉንም 16 ፎቶዎች በሙሉ ማህደር ይመልከቱ (View Full Gallery)</span>
            <span>➔</span>
          </Link>
        </div>
      </section>

      {/* 🌟 5. FAQ ACCORDION SECTION */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            ተደጋግመው የሚጠየቁ ጥያቄዎች (FAQ)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            ስለ ሰንበት ት/ቤቱ አጠቃላይ መረጃዎች
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            ስለ ምዝገባ፣ የትምህርት ክፍሎችና የርቀት ትምህርት በተደጋጋሚ የሚነሱ ጥያቄዎችና ምላሾች
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>የመደበኛ እና የርቀት ትምህርት ልዩነቱ ምንድን ነው?</AccordionTrigger>
                <AccordionContent>
                  መደበኛ ትምህርት በሳምንቱ መጨረሻ (ቅዳሜና እሑድ) ወይም በማታ በቤተክርስቲያኑ ቅጥር ግቢ በአካል ተገኝቶ የሚማሩት ሲሆን፣ የርቀት ትምህርት ደግሞ በየትኛውም ቦታና ሰዓት በቪዲዮ፣ በንባብና በኦንላይን ፈተናዎች የሚከታተሉት መርሃ ግብር ነው።
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>የምዝገባ ዕድሜ ገደብ ስንት ነው?</AccordionTrigger>
                <AccordionContent>
                  ለተማሪዎች የምዝገባ ዝቅተኛው ዕድሜ ከ 14 ዓመት በላይ (15 ዓመትና ከዚያ በላይ) መሆን ይኖርበታል፤ እንዲሁም የትውልድ ቀናቸውን በኢትዮጵያ የቀን አቆጣጠር መመዝገብ ይችላሉ።
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>የርቀት ትምህርት ምስክር ወረቀት (Certificate) ይሰጣል?</AccordionTrigger>
                <AccordionContent>
                  አዎ፤ ሁሉንም አስፈላጊ ኮርሶች እና ምዘናዎች 100% አጠናቅቀው ሲያልፉ በሲስተሙ በቀጥታ በQR ኮድ የሚረጋገጥ ዲጂታልና የታተመ ይፋዊ የዲፕሎማ ምስክር ወረቀት ይሰጣል።
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>የምዝገባ ክፍያዎችን እንዴት መክፈል ይቻላል?</AccordionTrigger>
                <AccordionContent>
                  በተዘጋጁት የባንክ ሂሳቦች ወይም በኦንላይን የክፍያ አማራጮች ከፍለው ደረሰኝዎን በምዝገባ ቅጹ ላይ በማያያዝ በቀላሉ ማጠናቀቅ ይችላሉ።
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </FadeIn>
      </section>

      {/* 🌟 5. REGISTRATION CHOICE MODAL (Modern Interactive Card Dialog) */}
      <AnimatedModal
        isOpen={showRegOptions}
        onClose={() => setShowRegOptions(false)}
        className="max-w-lg w-full p-6 sm:p-8 text-center space-y-5 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative"
      >
        {/* Top Decorative Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-[#1657b8]" />

        {/* Top Close Button */}
        <button
          onClick={() => setShowRegOptions(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Icon & Title */}
        <div className="space-y-2.5 pt-1">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-800 text-[#1657b8] dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-200/80 dark:border-blue-700/60 shadow-xs ring-4 ring-blue-500/10">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80">
              <span>✨</span>
              <span>2017 ዓ.ም አዲስ የተማሪዎች ምዝገባ</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              የምዝገባ ዓይነት ይምረጡ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              ለመማር የሚፈልጉትን የትምህርት መርሃ ግብር ይምረጡና ምዝገባዎን ያጠናቅቁ
            </p>
          </div>
        </div>

        {/* Interactive Option Cards */}
        <div className="space-y-3.5 text-left pt-1">
          {/* Option 1: Regular In-Person */}
          <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}>
            <Link
              href="/register-regular"
              onClick={() => setShowRegOptions(false)}
              className="group block p-4 sm:p-5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/90 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border-2 border-slate-200/80 hover:border-[#1657b8] dark:border-slate-700 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#1657b8] dark:text-blue-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  🏛️
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#1657b8] dark:group-hover:text-blue-400 transition-colors">
                      መደበኛ ተማሪ (Regular)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 shrink-0">
                      በአካል
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    ቅዳሜና እሑድ ወይም በማታ በደብሩ ቅጥር ግቢ የሚሰጥ መደበኛ መንፈሳዊ ትምህርት
                  </p>
                  
                  {/* Feature chips */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      ✓ ከ7ኛ - 12ኛ ክፍል
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      ✓ የክፍል ውስጥ ውይይት
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button inside card */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-black text-[#1657b8] dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>በመደበኛ ፕሮግራም ይመዝገቡ</span>
                <span className="text-base">➔</span>
              </div>
            </Link>
          </motion.div>

          {/* Option 2: Distance Online */}
          <motion.div whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.99 }}>
            <Link
              href="/register-distance"
              onClick={() => setShowRegOptions(false)}
              className="group block p-4 sm:p-5 rounded-2xl bg-slate-50/80 hover:bg-amber-50/90 dark:bg-slate-800/60 dark:hover:bg-amber-950/40 border-2 border-slate-200/80 hover:border-amber-400 dark:border-slate-700 dark:hover:border-amber-500 transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  🌐
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                      የርቀት ተማሪ (Distance)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 shrink-0">
                      ኦንላይን LMS
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    በየትኛውም ቦታና ሰዓት በቪዲዮ፣ በድምጽና በንባብ በኦንላይን ፖርታል የሚማሩበት
                  </p>

                  {/* Feature chips */}
                  <div className="flex flex-wrap items-center gap-2 mt-2.5">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      ✓ በራስዎ ምቹ ሰዓት
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                      ✓ ዲጂታል ሰርተፊኬት
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button inside card */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-black text-amber-800 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform">
                <span>በርቀት ትምህርት ይመዝገቡ</span>
                <span className="text-base">➔</span>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Existing User Check Status Footer */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>ቀደም ሲል ተመዝግበዋል?</span>
          <Link
            href="/check-status"
            onClick={() => setShowRegOptions(false)}
            className="font-bold text-[#1657b8] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <span>ሁኔታ ያረጋግጡ</span>
            <span>➔</span>
          </Link>
          <span>•</span>
          <Link
            href="/continue-registration"
            onClick={() => setShowRegOptions(false)}
            className="font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <span>ምዝገባዎን ይቀጥሉ</span>
            <span>➔</span>
          </Link>
        </div>
      </AnimatedModal>
    </div>
  );
};

export default Home;
