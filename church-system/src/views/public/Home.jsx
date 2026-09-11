'use client';

// src/views/public/Home.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, AnimatedModal } from '../../components/motion';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui';
import { ChurchGallery } from '../../components/shared/ChurchGallery';
import { useRegistrationStatus } from '../../hooks/queries';
import { Eye, Target, Award, ArrowRight, CheckCircle2, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

const visionMissionValues = [
  {
    id: 'vision',
    label: 'ራዕይ',
    title: 'የሰንበት ት/ቤቱ ራዕይ',
    icon: Eye,
    color: 'blue',
    bgLight: 'bg-blue-50 text-[#1e3a8a]',
    bgDark: 'dark:bg-blue-950/60 dark:text-blue-300',
    borderActive: 'border-[#1e3a8a] dark:border-blue-500',
    description:
      'በኦርቶዶክሳዊት ተዋሕዶ ሃይማኖቱ የጸና፣ በምግባሩ የቀና፣ መንፈሳዊና ዘመናዊ ዕውቀትን አቀናጅቶ ለሀገርና ለቤተክርስቲያን የሚጠቅም ትውልድ ማፍራት።',
  },
  {
    id: 'mission',
    label: 'ተልዕኮ',
    title: 'የሰንበት ት/ቤቱ ተልዕኮ',
    icon: Target,
    color: 'amber',
    bgLight: 'bg-amber-50 text-amber-800',
    bgDark: 'dark:bg-amber-950/60 dark:text-amber-300',
    borderActive: 'border-amber-400 dark:border-amber-500',
    description:
      'ጥራት ያለው ሃይማኖታዊ ትምህርት በዘመናዊ ቴክኖሎጂ ታግዞ ማዳረስ፤ ወጣቶችንና ሕፃናትን በሥርዓተ ቤተክርስቲያን አሳድጎ ለመንፈሳዊ አገልግሎት ማዘጋጀት።',
  },
  {
    id: 'values',
    label: 'እሴቶች',
    title: 'የሰንበት ት/ቤቱ እሴቶች',
    icon: Award,
    color: 'emerald',
    bgLight: 'bg-emerald-50 text-emerald-800',
    bgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300',
    borderActive: 'border-emerald-500 dark:border-emerald-400',
    description:
      'ቅድስና፣ ትጋት፣ ፍቅር፣ ታማኝነት፣ ወንድማማችነት እና ለቤተክርስቲያን ቀኖናና ትውፊት ጥብቅ ተገዢነት።',
  },
];

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);
  const [activeTab, setActiveTab] = useState('vision');
  const { data: regStatus } = useRegistrationStatus();

  const isMasterOpen = regStatus?.isRegistrationOpen !== false;
  const isRegularOpen = isMasterOpen && regStatus?.isRegularOpen !== false;
  const isDistanceOpen = isMasterOpen && regStatus?.isDistanceOpen !== false;
  const isAnyOpen = isRegularOpen || isDistanceOpen;
  const academicYear = regStatus?.academicYear || '2019 ዓ.ም';

  const activeContent = visionMissionValues.find((item) => item.id === activeTab) || visionMissionValues[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 selection:bg-[var(--brand-gold)] selection:text-slate-950 overflow-x-hidden">
      {/* 🌟 1. HERO SECTION - Clean, Compact Above-the-Fold Mobile Hierarchy */}
      <section className="relative pt-6 pb-10 sm:pt-10 sm:pb-14 px-4 bg-gradient-to-b from-blue-50/60 via-white to-slate-50/40 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Ambient soft glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[260px] bg-blue-500/8 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-3.5 sm:space-y-4">
          {/* Church Parish Identity Badge */}
          <FadeIn delay={0.05}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-[#1e3a8a] dark:text-blue-300 text-xs sm:text-sm font-semibold tracking-wide shadow-2xs">
              <span className="text-amber-500 text-sm">🏛️</span>
              <span className="truncate max-w-[290px] sm:max-w-none">
                የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
              </span>
            </div>
          </FadeIn>

          {/* Main Title */}
          <FadeIn delay={0.1}>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight pt-1">
              <span className="text-[#1e3a8a] dark:text-blue-400">ተክለ ሳዊሮስ</span>{' '}
              <span>ሰንበት ትምህርት ቤት</span>
            </h1>
          </FadeIn>

          {/* Spiritual Verse Quote - Elevated Higher */}
          <FadeIn delay={0.15}>
            <p className="text-xs sm:text-sm md:text-base font-bold text-[#1e3a8a] dark:text-blue-300 italic max-w-xl mx-auto leading-relaxed">
              «ልጅን በሚሄድበት መንገድ ምራው፥ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።»{' '}
              <span className="font-bold text-amber-600 dark:text-amber-400 not-italic">(ምሳ. ፳፪፥፮)</span>
            </p>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.2}>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-normal">
              የኦርቶዶክሳዊት ተዋሕዶ ሃይማኖት ትምህርትና የመንፈሳዊ ዕውቀት ይፋዊ የትምህርት ፖርታል
            </p>
          </FadeIn>

          {/* Action CTAs: Dual-Button Mobile & Desktop Layout */}
          <FadeIn delay={0.25} className="pt-2 space-y-3">
            {isAnyOpen ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
                {/* Option A: Regular Registration Button */}
                {isRegularOpen ? (
                  <Link
                    href="/register-regular"
                    className="w-full sm:flex-1 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white bg-[#1e3a8a] hover:bg-[#163177] active:scale-95 shadow-md shadow-blue-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-blue-400/30 min-h-[46px]"
                  >
                    <span>የመደበኛ ተማሪ ምዝገባ</span>
                    <span className="text-amber-300 font-bold">➔</span>
                  </Link>
                ) : (
                  <div className="w-full sm:flex-1 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-h-[46px] flex items-center justify-center">
                    መደበኛ (ተዘግቷል)
                  </div>
                )}

                {/* Option B: Distance Registration Button */}
                {isDistanceOpen ? (
                  <Link
                    href="/register-distance"
                    className="w-full sm:flex-1 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm text-amber-950 dark:text-amber-300 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95 border-2 border-amber-400/90 dark:border-amber-500/80 shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 min-h-[46px]"
                  >
                    <span>የርቀት ተማሪ ምዝገባ</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">➔</span>
                  </Link>
                ) : (
                  <div className="w-full sm:flex-1 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-h-[46px] flex items-center justify-center">
                    ርቀት (ተዘግቷል)
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-xs mx-auto">
                <Link
                  href="/check-status"
                  className="w-full px-6 py-3.5 rounded-xl font-black text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 shadow-md flex items-center justify-center gap-2 min-h-[46px]"
                >
                  <span>የምዝገባ ሁኔታ ያረጋግጡ</span>
                  <span>➔</span>
                </Link>
              </div>
            )}

            {/* Quick Helper Sub-Actions (Ample Touch Padding) */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
              <span>ቀደም ሲል ተመዝግበዋል?</span>
              <Link
                href="/login"
                className="font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline inline-flex items-center gap-1 py-2 px-2.5 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-950/40 min-h-[44px]"
              >
                <span>🔐 ይግቡ</span>
                <span>➔</span>
              </Link>
              <span className="opacity-40">•</span>
              <Link
                href="/check-status"
                className="font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 py-2 px-2.5 rounded-lg hover:bg-amber-50/80 dark:hover:bg-amber-950/40 min-h-[44px]"
              >
                <span>ሁኔታ ያረጋግጡ</span>
                <span>➔</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 🌟 2. VISION / MISSION / VALUES SECTION - Touch Tabs for Mobile, Sleek Cards for Desktop */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4">
        {/* Mobile Tabbed Switcher (Saves 400px+ vertical scroll on phones) */}
        <div className="md:hidden space-y-4">
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            {visionMissionValues.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 relative select-none min-h-[44px] cursor-pointer ${isActive
                      ? 'bg-white dark:bg-slate-800 text-[#1e3a8a] dark:text-white shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Card on Mobile */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeContent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 ${activeContent.borderActive} shadow-sm text-center space-y-3`}
            >
              <div
                className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${activeContent.bgLight} ${activeContent.bgDark} shadow-2xs`}
              >
                {React.createElement(activeContent.icon, { className: 'w-6 h-6' })}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {activeContent.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeContent.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop 3-Card Layout (Sleek, Compact Cards) */}
        <div className="hidden md:grid md:grid-cols-3 gap-5">
          {visionMissionValues.map((item) => {
            const Icon = item.icon;
            return (
              <MotionCard
                key={item.id}
                className="h-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-[#1e3a8a]/40 dark:hover:border-blue-500/40 transition-all text-center group flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${item.bgLight} ${item.bgDark} group-hover:scale-105 transition-transform shadow-2xs`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white">
                    {item.label}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm font-normal">
                    {item.description}
                  </p>
                </div>
              </MotionCard>
            );
          })}
        </div>
      </section>

      {/* 🌟 3. CHURCH PHOTO GALLERY SECTION */}
      <section className="py-14 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <ChurchGallery limit={8} showFilters={true} />
        </div>
      </section>

      {/* 🌟 4. FAQ / FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <FadeIn>
          <div className="text-center space-y-2.5 mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
              ጥያቄና መልስ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              ተደጋግመው የሚጠየቁ ጥያቄዎች
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
              ስለ ሰንበት ትምህርት ቤታችን የምዝገባና የትምህርት አሰጣጥ ሂደት አጫጭር ማብራሪያዎች
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Accordion type="single" collapsible className="w-full space-y-1">
              <AccordionItem value="item-1">
                <AccordionTrigger>የመደበኛና የርቀት ትምህርት ልዩነቱ ምንድን ነው?</AccordionTrigger>
                <AccordionContent>
                  የመደበኛ ትምህርት በቤተክርስቲያን ቅጥር ግቢ በአካል በክፍል ውስጥ ቅዳሜና እሑድ ወይም በማታ የሚሰጥ ሲሆን፤ የርቀት ትምህርት ደግሞ በየትኛውም ቦታ ሆነው በድረ-ገጻችን ፖርታል በቪዲዮና በንባብ የሚማሩበት ዘመናዊ የኦንላይን መርሃ ግብር ነው።
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>የምዝገባ መስፈርቶች ምንድን ናቸው?</AccordionTrigger>
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

      {/* 🌟 5. REGISTRATION CHOICE MODAL (Modern Interactive Dialog) */}
      <AnimatedModal
        isOpen={showRegOptions}
        onClose={() => setShowRegOptions(false)}
        className="max-w-lg w-full p-6 sm:p-8 text-center space-y-5 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden relative"
      >
        {/* Top Decorative Accent Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 via-amber-400 to-[#1e3a8a]" />

        {/* Top Close Button */}
        <button
          onClick={() => setShowRegOptions(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Icon & Title */}
        <div className="space-y-2.5 pt-1">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/80 text-[#1e3a8a] dark:text-blue-300 rounded-2xl flex items-center justify-center mx-auto border border-blue-200/80 dark:border-blue-700/60 shadow-xs ring-4 ring-blue-500/10">
            <GraduationCap className="w-7 h-7" />
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
        <div className="space-y-3 text-left pt-1">
          {/* Option 1: Regular In-Person */}
          <motion.div whileHover={isRegularOpen ? { scale: 1.01, y: -2 } : {}} whileTap={isRegularOpen ? { scale: 0.99 } : {}}>
            {isRegularOpen ? (
              <Link
                href="/register-regular"
                onClick={() => setShowRegOptions(false)}
                className="group block p-4 sm:p-5 rounded-2xl bg-slate-50/80 hover:bg-blue-50/90 dark:bg-slate-800/60 dark:hover:bg-blue-950/40 border-2 border-slate-200/80 hover:border-[#1e3a8a] dark:border-slate-700 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-[#1e3a8a] dark:text-blue-300 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                    🏛️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors">
                        የመደበኛ ተማሪዎች መርሃ ግብር
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 border border-emerald-300/60">
                        🟢 ክፍት ነው
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      ቅዳሜና እሑድ ወይም በማታ በደብሩ ቅጥር ግቢ የሚሰጥ መደበኛ መንፈሳዊ ትምህርት
                    </p>

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

                <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-black text-[#1e3a8a] dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
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
                        የመደበኛ ተማሪዎች መርሃ ግብር
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
                  <span>ምዝገባው ለጊዜው ተዘግቷል</span>
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
                        የርቀት ተማሪዎች መርሃ ግብር
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 border border-emerald-300/60">
                        🟢 ክፍት ነው
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      በየትኛውም ቦታና ሰዓት በቪዲዮ፣ በድምጽና በንባብ በኦንላይን ፖርታል የሚማሩበት
                    </p>

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
                        የርቀት ተማሪዎች መርሃ ግብር
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
                  <span>ምዝገባው ለጊዜው ተዘግቷል</span>
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
            className="font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline inline-flex items-center gap-1 py-1.5 px-2"
          >
            <span>ሁኔታ ያረጋግጡ</span>
            <span>➔</span>
          </Link>
          <span>•</span>
          <Link
            href="/continue-registration"
            onClick={() => setShowRegOptions(false)}
            className="font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1 py-1.5 px-2"
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
