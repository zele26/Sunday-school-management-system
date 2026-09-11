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
import { useRegistrationStatus } from '../../hooks/queries';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);
  const { data: regStatus } = useRegistrationStatus();

  const isMasterOpen = regStatus?.isRegistrationOpen !== false;
  const isRegularOpen = isMasterOpen && regStatus?.isRegularOpen !== false;
  const isDistanceOpen = isMasterOpen && regStatus?.isDistanceOpen !== false;
  const isAnyOpen = isRegularOpen || isDistanceOpen;
  const academicYear = regStatus?.academicYear || '2017 ዓ.ም';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 selection:bg-[var(--brand-gold)] selection:text-slate-950 overflow-x-hidden">
      {/* 🌟 1. HERO SECTION - Elevated Clean Sacred Design */}
      <section className="relative pt-8 pb-14 sm:pt-12 sm:pb-18 px-4 bg-gradient-to-b from-blue-50/50 via-white to-slate-50/30 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200/70 dark:border-slate-800/80 overflow-hidden">
        {/* Subtle, soft ambient backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
          {/* Centered Church Logo with crisp elevation & golden accent */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-28 h-28 sm:w-36 sm:h-36 mx-auto flex items-center justify-center cursor-pointer group"
          >
            {/* Emblem Shield with golden ring */}
            <div className="relative w-full h-full rounded-full p-2 bg-white dark:bg-slate-900 border-2 border-amber-400/90 shadow-lg ring-4 ring-amber-400/20 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <Image
                src={ChurchLogo}
                alt="ተክለሳዊሮስ ሰንበት ትምህርት ቤት"
                width={150}
                height={150}
                priority
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
          </motion.div>

          {/* Mottos & Church Identity */}
          <FadeIn delay={0.1} className="space-y-3">
            {/* Church Name Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium tracking-wide shadow-2xs">
              <span className="text-amber-500 text-sm">🏛️</span>
              <span>የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን</span>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-[#1657b8] via-blue-600 to-[#0f4699] dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 bg-clip-text text-transparent">
                ተክለ ሳዊሮስ
              </span>{' '}
              ሰንበት ትምህርት ቤት
            </h1>

            {/* Spiritual Quote */}
            <p className="text-xs sm:text-sm font-semibold text-[#1657b8] dark:text-blue-300 italic max-w-xl mx-auto">
              «ልጅን በሚሄድበት መንገድ ምራው፥ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።»{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400 not-italic">(ምሳ. ፳፪፥፮)</span>
            </p>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-normal">
              የኦርቶዶክሳዊት ተዋሕዶ ሃይማኖት ትምህርትና የመንፈሳዊ ዕውቀት ይፋዊ የትምህርት ፖርታል
            </p>
          </FadeIn>

          {/* Action CTA: Focused Single Primary Button */}
          <FadeIn delay={0.2} className="pt-2 space-y-3">
            <div className="flex justify-center items-center max-w-xs mx-auto">
              {/* Primary CTA: Register button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRegOptions(true)}
                className={`w-full px-8 py-3.5 rounded-xl font-extrabold shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer border ${isAnyOpen
                    ? 'bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] text-white shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 border-blue-400/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-slate-900/20 border-slate-700'
                  }`}
              >
                <span>{isAnyOpen ? 'ይመዝገቡ' : 'የምዝገባ መረጃ'}</span>
                <span className="text-amber-300 font-black text-base">➔</span>
              </motion.button>
            </div>

            {/* Quick Helper Links: Login & Check Status */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
              <span>ቀደም ሲል ተመዝግበዋል?</span>
              <Link
                href="/login"
                className="font-bold text-[#1657b8] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>🔐 ይግቡ</span>
                <span>➔</span>
              </Link>
              <span>•</span>
              <Link
                href="/check-status"
                className="font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>ሁኔታ ያረጋግጡ</span>
                <span>➔</span>
              </Link>
            </div>
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
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">ራዕይ</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                በኦርቶዶክሳዊት ተዋሕዶ ሃይማኖቱ የጸና፣ በምግባሩ የቀና፣ መንፈሳዊና ዘመናዊ ዕውቀትን አቀናጅቶ ለሀገርና ለቤተክርስቲያን የሚጠቅም ትውልድ ማፍራት።
              </p>
            </MotionCard>
          </StaggerItem>

          {/* Mission */}
          <StaggerItem>
            <MotionCard className="h-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 dark:hover:border-blue-500/40 transition-all text-center group">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/50 text-[var(--brand-gold)] rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--brand-gold)] group-hover:text-slate-950 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">ተልዕኮ</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                ጥራት ያለው ሃይማኖታዊ ትምህርት በዘመናዊ ቴክኖሎጂ ታግዞ ማዳረስ፤ ወጣቶችንና ሕፃናትን በሥርዓተ ቤተክርስቲያን አሳድጎ ለመንፈሳዊ አገልግሎት ማዘጋጀት።
              </p>
            </MotionCard>
          </StaggerItem>

          {/* Core Values */}
          <StaggerItem>
            <MotionCard className="h-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 dark:hover:border-blue-500/40 transition-all text-center group">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">እሴቶች</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                ቅድስና፣ ትጋት፣ ፍቅር፣ ታማኝነት፣ ወንድማማችነት እና ለቤተክርስቲያን ትውፊት ጥብቅ ተገዢነት።
              </p>
            </MotionCard>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* 🌟 3. CHURCH PHOTO GALLERY SECTION */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <ChurchGallery maxItems={8} showViewAll={true} />
        </div>
      </section>

      {/* 🌟 4. FAQ / FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 max-w-4xl mx-auto px-4">
        <FadeIn>
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1657b8] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              ጥያቄና መልስ
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              ተደጋግመው የሚጠየቁ ጥያቄዎች (FAQ)
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
              ስለ ሰንበት ትምህርት ቤታችን የምዝገባና የትምህርት አሰጣጥ ሂደት አጫጭር ማብራሪያዎች
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>የመደበኛና የርቀት ትምህርት ልዩነቱ ምንድን ነው?</AccordionTrigger>
                <AccordionContent>
                  የመደበኛ ትምህርት በቤተክርስቲያን ቅጥር ግቢ በአካል በክፍል ውስጥ ቅዳሜና እሑድ ወይም በማታ የሚሰጥ ሲሆን፤ የርቀት ትምህርት ደግሞ በየትኛውም ቦታ ሆነው በድረ-ገጻችን ፖርታል በቪዲዮና በንባብ የሚማሩበት ዘመናዊ የኦንላይን መርሃ ግብር ነው።
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>የምዝገባ መስፈርቶች ምንድናቸው?</AccordionTrigger>
                <AccordionContent>
                  ዕድሜያቸው ከ 14 ዓመት በላይ የሆነ ማንኛውም የኦርቶዶክስ ተዋሕዶ አማኝ መመዝገብ ይችላል። ለመደበኛ ተማሪዎች ከ7ኛ እስከ 12ኛ ክፍል ባሉት ደረጃዎች መመደብ ሲቻል፣ ለርቀት ተማሪዎች ደግሞ ደረጃ በደረጃ የሚጠናቀቁ የኮርስ ሞጁሎች ተዘጋጅተዋል።
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>የትምህርት ማስረጃ (ሰርተፊኬት) ይሰጣል?</AccordionTrigger>
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
              <span>{academicYear} የተማሪዎች ምዝገባ</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              የምዝገባ ዓይነት ይምረጡ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              ለመማር የሚፈልጉትን የትምህርት መርሃ ግብር ይምረጡና ምዝገባዎን ያጠናቅቁ
            </p>
          </div>
        </div>

        {/* Master Closed Alert Banner (if overall registration is closed) */}
        {!isAnyOpen && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs leading-relaxed text-center font-bold">
            📢 {regStatus?.generalClosedMessage || 'የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።'}
          </div>
        )}

        {/* Interactive Option Cards */}
        <div className="space-y-3.5 text-left pt-1">
          {/* Option 1: Regular In-Person */}
          <motion.div whileHover={isRegularOpen ? { scale: 1.01, y: -2 } : {}} whileTap={isRegularOpen ? { scale: 0.99 } : {}}>
            {isRegularOpen ? (
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 border border-emerald-300/60">
                        🟢 ክፍት ነው
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
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700/60 opacity-80 cursor-not-allowed">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-2xl shrink-0">
                    🏛️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-500 dark:text-slate-400">
                        መደበኛ ተማሪ (Regular)
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 shrink-0 border border-rose-300/60">
                        🔴 ለጊዜው ተዘግቷል
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {regStatus?.regularClosedMessage || 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።'}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>ምዝገባ ተዘግቷል (Registration Closed)</span>
                  <span>🔒</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Option 2: Distance Online */}
          <motion.div whileHover={isDistanceOpen ? { scale: 1.01, y: -2 } : {}} whileTap={isDistanceOpen ? { scale: 0.99 } : {}}>
            {isDistanceOpen ? (
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 border border-emerald-300/60">
                        🟢 ክፍት ነው
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
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700/60 opacity-80 cursor-not-allowed">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-2xl shrink-0">
                    🌐
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-500 dark:text-slate-400">
                        የርቀት ተማሪ (Distance)
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 shrink-0 border border-rose-300/60">
                        🔴 ለጊዜው ተዘግቷል
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {regStatus?.distanceClosedMessage || 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል።'}
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>ምዝገባ ተዘግቷል (Registration Closed)</span>
                  <span>🔒</span>
                </div>
              </div>
            )}
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
