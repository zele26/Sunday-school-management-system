'use client';

// src/views/public/Home.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, AnimatedModal } from '../../components/motion';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui';
import { useRegistrationStatus } from '../../hooks/queries';
import { Eye, Target, Award, ArrowRight, Sparkles, GraduationCap, ExternalLink, Camera } from 'lucide-react';

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
  const academicYear = regStatus?.academicYear || '2017 ዓ.ም';

  const activeContent = visionMissionValues.find((item) => item.id === activeTab) || visionMissionValues[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 selection:bg-[var(--brand-gold)] selection:text-slate-950 overflow-x-hidden">
      {/* 🌟 1. HERO SECTION - Clean, Focused Above-the-Fold Typography & CTAs */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-18 px-4 bg-gradient-to-b from-blue-50/50 via-slate-50/20 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Ambient soft glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[280px] bg-blue-500/8 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 sm:space-y-5">
          {/* Main Hero Title */}
          <FadeIn delay={0.05}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              <span className="text-[#1e3a8a] dark:text-blue-400">ተክለ ሳዊሮስ</span>{' '}
              <span>ሰንበት ትምህርት ቤት</span>
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.1}>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed font-medium">
              የኦርቶዶክሳዊት ተዋሕዶ ሃይማኖት ትምህርትና የመንፈሳዊ ዕውቀት ይፋዊ የትምህርት ፖርታል
            </p>
          </FadeIn>

          {/* Dual Action CTAs */}
          <FadeIn delay={0.15} className="pt-2 space-y-3.5">
            {isAnyOpen ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md mx-auto">
                {/* Primary CTA: Regular Registration (Church Blue) */}
                {isRegularOpen ? (
                  <Link
                    href="/register-regular"
                    className="w-full sm:flex-1 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm text-white bg-[#1e3a8a] hover:bg-[#163177] active:scale-95 shadow-md shadow-blue-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-blue-400/30 min-h-[46px]"
                  >
                    <span>የመደበኛ ተማሪ ምዝገባ</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </Link>
                ) : (
                  <div className="w-full sm:flex-1 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center min-h-[46px] flex items-center justify-center">
                    መደበኛ (ተዘግቷል)
                  </div>
                )}

                {/* Secondary CTA: Distance Registration (Church Gold / Yellow) */}
                {isDistanceOpen ? (
                  <Link
                    href="/register-distance"
                    className="w-full sm:flex-1 px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 dark:bg-amber-500 dark:hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-amber-500/50 dark:border-amber-400/50 min-h-[46px]"
                  >
                    <span>የርቀት ተማሪ ምዝገባ</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
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
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </Link>
              </div>
            )}

            {/* Auxiliary Simple Inline Links */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
              <span>ቀደም ሲል ተመዝግበዋል?</span>
              <Link
                href="/login"
                className="font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                <span>ይግቡ</span>
                <span>→</span>
              </Link>
              <span className="opacity-40">•</span>
              <Link
                href="/check-status"
                className="font-bold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
              >
                <span>ሁኔታ ያረጋግጡ</span>
                <span>→</span>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 🌟 2. CORE PILLARS (ራዕይ፣ ተልዕኮ፣ እሴቶች) - Compact, Balanced Cards */}
      <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4">
        {/* Mobile Tabbed Switcher */}
        <div className="md:hidden space-y-4">
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            {visionMissionValues.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 relative select-none min-h-[44px] cursor-pointer ${
                    isActive
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

        {/* Desktop 3-Card Compact Layout */}
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

      {/* 🌟 3. ASYMMETRIC 3-PHOTO BENTO COLLAGE (Replaces heavy 8-card gallery) */}
      <section className="py-14 sm:py-18 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>የፎቶ ማህደር</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              የሰንበት ትምህርት ቤታችን ድባብ
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              መንፈሳዊ ትውፊት፣ የልጆች ትምህርትና የወጣቶች ኅብረት
            </p>
          </div>

          {/* Asymmetric 3-Photo Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-w-6xl mx-auto">
            {/* Left Featured Slot (Col Span 7) */}
            <div className="md:col-span-7 h-[320px] md:h-[420px] rounded-2xl overflow-hidden relative shadow-md group border border-slate-200/80 dark:border-slate-800">
              <Image
                src="/church-photos/photo2.png"
                alt="ቅዳሴና መንፈሳዊ አገልግሎት"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 text-xs font-black shadow-xs">
                  ቅዳሴና መንፈሳዊ አገልግሎት
                </span>
                <p className="text-xs sm:text-sm text-slate-200 font-medium">
                  ጥንታዊና ሐዋርያዊ የኦርቶዶክስ ተዋሕዶ ቅዳሴና መንፈሳዊ ሥርዓት
                </p>
              </div>
            </div>

            {/* Right Stacked Slots (Col Span 5) */}
            <div className="md:col-span-5 flex flex-col gap-4 h-auto md:h-[420px]">
              {/* Top Card */}
              <div className="h-[190px] md:h-[202px] rounded-2xl overflow-hidden relative shadow-md group border border-slate-200/80 dark:border-slate-800">
                <Image
                  src="/church-photos/photo3.png"
                  alt="የሕፃናትና ወጣቶች ትምህርት"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-xs font-bold shadow-xs">
                    የሕፃናትና ወጣቶች ትምህርት
                  </span>
                </div>
              </div>

              {/* Bottom Card */}
              <div className="h-[190px] md:h-[202px] rounded-2xl overflow-hidden relative shadow-md group border border-slate-200/80 dark:border-slate-800">
                <Image
                  src="/church-photos/photo1.png"
                  alt="የወጣቶች ኅብረትና ዝማሬ"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-600/90 text-white text-xs font-bold shadow-xs">
                    የወጣቶች ኅብረትና ዝማሬ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Understated Archive Text Link */}
          <div className="text-center pt-2">
            <a
              href="https://t.me/teklesawiros"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline py-1"
            >
              <span>ተጨማሪ የክንውን ፎቶዎችን በቴሌግራም ቻናላችን ይመልከቱ</span>
              <span>→</span>
            </a>
          </div>
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
                <AccordionTrigger>የትምህርት ማስረጃ ወይም የምስክር ወረቀት ይሰጣል?</AccordionTrigger>
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
    </div>
  );
};

export default Home;
