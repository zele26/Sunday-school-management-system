'use client';

// src/pages/public/Home.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import logoImage from '../../assets/ChurchLogo.png';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, AnimatedModal } from '../../components/motion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 selection:bg-[var(--brand-gold)] selection:text-slate-950 overflow-x-hidden">
      {/* 🌟 1. HERO SECTION - Elevated Royal Blue & Gold Sacred Design */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 bg-gradient-to-b from-blue-50/80 via-white to-slate-50/60 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Ambient Sacred Mesh Gradients & Aura */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#1657b8]/15 via-amber-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#1657b8]/10 dark:bg-[#1657b8]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Subtle Decorative Background Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-amber-400/15 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-blue-400/10 rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">

          {/* Centered Church Logo with Radiant Golden Halo & Floating Motion */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.05 }}
            className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto flex items-center justify-center group cursor-pointer"
          >
            {/* Pulsating Outer Aura */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.75, 0.4] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400/50 via-yellow-300/40 to-blue-500/30 blur-xl"
            />
            {/* Rotating Decorative Gold Dash Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="absolute -inset-2.5 rounded-full border border-dashed border-amber-400/40 pointer-events-none"
            />
            {/* White Polished Emblem Shield */}
            <div className="relative w-full h-full p-2.5 sm:p-3 rounded-full bg-white dark:bg-slate-900 border-2 border-amber-400/90 shadow-2xl shadow-amber-500/20 flex items-center justify-center overflow-hidden ring-4 ring-amber-400/20">
              <img
                src={logoImage?.src || logoImage}
                alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት አርማ"
                className="w-full h-full object-contain rounded-full transform group-hover:scale-108 transition-transform duration-500"
              />
            </div>
          </motion.div>

          {/* Title & Parish Information */}
          <FadeIn delay={0.15} className="space-y-4">
            {/* Church Parish Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-slate-800 dark:via-slate-850 dark:to-slate-800 text-slate-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-500/30 text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2 rounded-full shadow-sm tracking-wide">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="truncate max-w-[90vw]">
                ⛪ የማህደረ ስብሐት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
              </span>
            </div>

            {/* Main Sacred Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-r from-[#0d3b82] via-[#1657b8] to-[#0a2e66] dark:from-white dark:via-blue-200 dark:to-amber-200 drop-shadow-xs">
              ተክለ ሳዊሮስ ሰንበት ት/ቤት
            </h1>

            {/* Subtitle & Motto */}
            <div className="max-w-3xl mx-auto space-y-1.5">
              <p className="text-base sm:text-xl font-bold text-slate-700 dark:text-slate-200">
                የሕፃናት፣ የወጣቶችና የጎልማሶች መንፈሳዊ ትምህርት ማዕከል
              </p>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium italic">
                «በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።»
              </p>
            </div>
          </FadeIn>

          {/* Action CTAs */}
          <FadeIn delay={0.25} className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3.5 sm:gap-4">
            {/* Register button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowRegOptions(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:opacity-90 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all text-base flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
            >
              <span>ይመዝገቡ (Register Now)</span>
              <span className="text-amber-300 font-black text-lg">➔</span>
            </motion.button>

            {/* Distance Education Direct Link */}
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href="/distance-education"
                className="w-full sm:w-auto bg-gradient-to-r from-[#f5b700] via-[#fab005] to-[#e69900] hover:brightness-105 text-slate-950 px-8 py-4 rounded-2xl font-black shadow-lg shadow-amber-400/25 hover:shadow-xl hover:shadow-amber-400/35 transition-all text-base flex items-center justify-center gap-2 border border-amber-300"
              >
                <span>🌐</span>
                <span>የርቀት ትምህርት (Distance Ed)</span>
              </Link>
            </motion.div>

            {/* Login button */}
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-white/90 dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-7 py-4 rounded-2xl font-extrabold shadow-sm hover:shadow-md transition-all text-base text-center flex items-center justify-center gap-2"
              >
                <span>ይግቡ (Sign In)</span>
                <span>🔐</span>
              </Link>
            </motion.div>
          </FadeIn>

          {/* Quick Highlight Feature Pills */}
          <FadeIn delay={0.35}>
            <div className="pt-4 flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <span className="text-base">🏛️</span>
                <span>መደበኛ ትምህርት (Grades 7–12)</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <span className="text-base">🌐</span>
                <span>የተሟላ የርቀት ትምህርት (Online LMS)</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                <span className="text-base">📜</span>
                <span>ይፋዊ የምስክር ወረቀት (Certified)</span>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* 🌟 2. VISION / MISSION / VALUES SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {/* Vision */}
          <StaggerItem>
            <MotionCard className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 transition-all text-center group">
              <div className="w-14 h-14 bg-blue-50 text-[#1657b8] rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#1657b8] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">ራዕያችን</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                ማኅበረሰቡን በእግዚአብሔር ቃልና በኦርቶዶክሳዊት ተዋሕዶ ቤተ ክርስቲያን ስርዓት ማነጽ።
              </p>
            </MotionCard>
          </StaggerItem>

          {/* Mission */}
          <StaggerItem>
            <MotionCard className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all text-center group">
              <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--brand-gold)] group-hover:text-slate-950 transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">ተልዕኳችን</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                ለሁሉም የዕድሜ ክልል ጥራት ያለውና ተደራሽ የሆነ የሰንበት ትምህርት አገልግሎት መስጠት።
              </p>
            </MotionCard>
          </StaggerItem>

          {/* Values */}
          <StaggerItem>
            <MotionCard className="h-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 transition-all text-center group">
              <div className="w-14 h-14 bg-blue-50 text-[#1657b8] rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#1657b8] group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">እሴቶቻችን</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                እምነት፣ ፍቅር፣ አንድነት፣ ትህትና እና ታማኝነት።
              </p>
            </MotionCard>
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* 🌟 3. WHY CHOOSE US SECTION */}
      <section className="bg-slate-100/70 py-16 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1657b8] mb-3 tracking-tight">ለምን እኛን ይመርጣሉ?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
              በሰንበት ትምህርት ቤታችን ህፃናትና ወጣቶች በመንፈሳዊ ዕውቀትና በበጎ ምግባር ታንፀው እንዲያድጉ ምቹ ሁኔታዎችን አመቻችተናል።
            </p>
          </FadeIn>

          <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 text-right">
            <StaggerItem>
              <MotionCard className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3.5 space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1657b8] flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base mb-1">ተሞክሮ ያላቸው መምህራን</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">በመንፈሳዊ ትምህርት የዳበረ ልምድ ባላቸው መምህራን የሚሰጥ ትምህርት።</p>
                </div>
              </MotionCard>
            </StaggerItem>

            <StaggerItem>
              <MotionCard className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3.5 space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base shrink-0 border border-amber-200">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base mb-1">የተለያዩ የዕድሜ ክፍሎች</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">ከህፃናት እስከ ወጣቶች ለሁሉም ተስማሚ የሆኑ የትምህርት መርሃ ግብሮች።</p>
                </div>
              </MotionCard>
            </StaggerItem>

            <StaggerItem>
              <MotionCard className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3.5 space-x-reverse">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1657b8] flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base mb-1">መንፈሳዊና ማህበራዊ እንቅስቃሴዎች</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">መዝሙር፣ ጉዞዎችና ማህበራዊ አገልግሎቶች።</p>
                </div>
              </MotionCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* 🌟 4. FAQ ACCORDION SECTION */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <FadeIn className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            ተደጋግመው የሚጠየቁ ጥያቄዎች (FAQ)
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ስለ ሰንበት ት/ቤቱ አጠቃላይ መረጃዎች
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            ስለ ምዝገባ፣ የትምህርት ክፍሎችና የርቀት ትምህርት በተደጋጋሚ የሚነሱ ጥያቄዎችና ምላሾች
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
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

      {/* 🌟 5. REGISTRATION CHOICE MODAL (Animated with AnimatedModal) */}
      <AnimatedModal
        isOpen={showRegOptions}
        onClose={() => setShowRegOptions(false)}
        className="max-w-sm w-full p-7 text-center space-y-4"
      >
        <div className="w-12 h-12 bg-blue-50 text-[#1657b8] rounded-xl flex items-center justify-center mx-auto border border-blue-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            ምዝገባ አይነት ይምረጡ
          </h2>
          <p className="text-xs text-slate-500">
            Regular (መደበኛ) ወይም Distance (ርቀት) ተማሪ ምዝገባ ይምረጡ
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/register-regular"
              onClick={() => setShowRegOptions(false)}
              className="block w-full bg-[#1657b8] hover:bg-[#124796] text-white py-3 rounded-xl font-bold shadow-sm transition-colors text-sm"
            >
              መደበኛ (Regular)
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/register-distance"
              onClick={() => setShowRegOptions(false)}
              className="block w-full bg-[var(--brand-gold)] hover:bg-[#dfa500] text-slate-950 py-3 rounded-xl font-bold shadow-sm transition-colors text-sm"
            >
              ርቀት (Distance)
            </Link>
          </motion.div>
        </div>

        <button
          onClick={() => setShowRegOptions(false)}
          className="mt-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider block mx-auto py-1 cursor-pointer"
        >
          ሰርዝ
        </button>
      </AnimatedModal>
    </div>
  );
};

export default Home;

