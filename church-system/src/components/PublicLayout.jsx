'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ChurchLogo from '../assets/ChurchLogo.png';
import { ThemeToggle } from './ui/ThemeToggle';
import { useRegistrationStatus } from '../hooks/queries';
import { Send, Phone, MapPin, Clock, Compass, BookOpen, Search, LogIn, ExternalLink } from 'lucide-react';

// Inspirational Bible verses & Church Announcements for the sliding ticker
const tickerItems = [
  {
    type: '📖 የዕለቱ ቃል',
    text: '«ልጆችን ወደ እኔ ይምጡ አትከልክሏቸው፤ የእግዚአብሔር መንግሥት እንደ እነዚህ ላሉት ናትና።» (ማር. ፲፥፲፬)',
    bg: 'from-amber-600/20 via-amber-500/10 to-transparent',
    borderColor: 'border-amber-500/30',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    type: '📢 ማስታወቂያ',
    text: 'የ 2017 ዓ.ም አዲሱ የሰንበት ትምህርት ቤት የመደበኛ እና የርቀት ምዝገባ በይፋ ተጀምሯል! አሁኑኑ ይመዝገቡ።',
    bg: 'from-emerald-600/20 via-emerald-500/10 to-transparent',
    borderColor: 'border-emerald-500/30',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    type: '🙏 መንፈሳዊ መልእክት',
    text: '«ከሕፃናትና ከሚጠቡ ልጆች አፍ ምስጋናን አዘጋጀህ...» (መዝ. ፰፥፪) — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።',
    bg: 'from-sky-600/20 via-sky-500/10 to-transparent',
    borderColor: 'border-sky-500/30',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
];

const PublicLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  const { data: regStatus } = useRegistrationStatus();
  const isMasterOpen = regStatus?.isRegistrationOpen !== false;
  const isRegularOpen = isMasterOpen && regStatus?.isRegularOpen !== false;
  const isDistanceOpen = isMasterOpen && regStatus?.isDistanceOpen !== false;
  const isAnyOpen = isRegularOpen || isDistanceOpen;
  const academicYear = regStatus?.academicYear || '2017 ዓ.ም';

  const pathname = usePathname();
  const dropdownRef = useRef(null);

  // Auto-slide ticker every 6 seconds unless hovered
  useEffect(() => {
    if (isTickerPaused) return;
    const timer = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isTickerPaused]);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsRegDropdownOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRegDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNavLinks = [
    { to: '/about', label: 'ስለ እኛ' },
    { to: '/classes', label: 'የትምህርት ክፍሎች' },
    { to: '/distance-education', label: 'የርቀት ትምህርት' },
    { to: '/announcements', label: 'ማስታወቂያዎች' },
    { to: '/contact', label: 'ያግኙን' },
  ];

  const registrationLinks = [
    { to: '/distance-education', label: 'ስለ ርቀት ትምህርት መረጃ', icon: '📖' },
    { to: '/register-regular', label: 'የመደበኛ ተማሪ ምዝገባ', icon: '📝' },
    { to: '/register-distance', label: 'የርቀት ተማሪ ምዝገባ', icon: '🌐' },
    { to: '/continue-registration', label: 'ምዝገባዎን ይቀጥሉ', icon: '🔄' },
    { to: '/check-status', label: 'ሁኔታ ያረጋግጡ', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-[var(--brand-gold)] selection:text-slate-950 font-sans transition-colors duration-200">
      {/* 🌟 1. SLIDING BIBLE VERSE & PROMOTION TICKER */}
      <div
        className="relative z-50 bg-gradient-to-r from-blue-950 via-[#1e3a8a] to-blue-900 text-white text-xs sm:text-sm transition-all duration-500 overflow-hidden border-b border-amber-400/30 shadow-xs"
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5 flex-1 overflow-hidden">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-black border shrink-0 bg-amber-400 text-slate-950 border-amber-300 shadow-xs leading-none">
              {tickerItems[currentTickerIndex].type}
            </span>
            <p className="truncate sm:whitespace-normal text-blue-50 font-medium tracking-wide text-xs sm:text-sm leading-normal">
              {tickerItems[currentTickerIndex].text}
            </p>
          </div>

          {/* Ticker Controls / Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {tickerItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTickerIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentTickerIndex === idx ? 'w-5 bg-amber-400 shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 2. HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand Name */}
            <Link
              href="/"
              className="flex items-center space-x-3 sm:space-x-3.5 space-x-reverse group focus:outline-none transition-all duration-300"
            >
              {/* Logo Container with Refined Subtle Primary Blue Border */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="relative p-1 rounded-2xl bg-white dark:bg-slate-800 border border-[#1e3a8a]/20 dark:border-blue-500/30 shadow-xs group-hover:border-[#1e3a8a] dark:group-hover:border-blue-400 group-hover:shadow-md transition-all duration-300">
                  <Image
                    src={ChurchLogo}
                    alt="ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት"
                    width={48}
                    height={48}
                    priority
                    className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Church Name and Subtitle */}
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-black text-base sm:text-lg lg:text-xl tracking-tight text-[#1e3a8a] dark:text-blue-300 leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-200 transition-colors duration-300 truncate">
                  ተክለ ሳዊሮስ
                </span>
                <span className="text-[10px] sm:text-[11px] lg:text-xs text-amber-700 dark:text-amber-400 font-extrabold tracking-wider uppercase mt-0.5 truncate flex items-center gap-1">
                  <span>ሰንበት ትምህርት ቤት</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 text-sm font-semibold">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`px-3.5 xl:px-4 py-2 rounded-xl transition-all duration-200 relative whitespace-nowrap min-h-[42px] flex items-center ${
                    pathname === link.to
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-[#1e3a8a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              ))}

              {/* Registration Services Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}
                  className={`flex items-center space-x-2 space-x-reverse px-3.5 xl:px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer whitespace-nowrap min-h-[42px] ${
                    registrationLinks.some((item) => item.to === pathname)
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-[#1e3a8a] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>ምዝገባና አገልግሎት</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isRegDropdownOpen ? 'rotate-180 text-[#1e3a8a] dark:text-amber-400' : 'text-slate-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu Popup */}
                {isRegDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-76 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">
                        የተማሪዎች አገልግሎት
                      </span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300/40">
                        {academicYear}
                      </span>
                    </div>

                    <div className="pt-1.5 space-y-0.5 px-1.5">
                      {registrationLinks.map((item) => (
                        <Link
                          key={item.to}
                          href={item.to}
                          className={`flex items-center space-x-3.5 space-x-reverse px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group min-h-[44px] ${
                            pathname === item.to
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 font-bold border-l-3 border-[#1e3a8a]'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1e3a8a] dark:hover:text-blue-400'
                          }`}
                        >
                          <span className="text-base p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-108 transition-transform shadow-2xs">
                            {item.icon}
                          </span>
                          <span className="flex-1 text-xs sm:text-sm">{item.label}</span>
                          <span className="text-slate-400 group-hover:text-[#1e3a8a] dark:group-hover:text-amber-400 transition-colors">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Actions (ThemeToggle + Login) */}
            <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
              <ThemeToggle className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[42px] min-w-[42px]" />
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#163177] active:opacity-90 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 space-x-reverse border border-blue-400/20 min-h-[42px]"
              >
                <span className="text-base">🔐</span>
                <span>ይግቡ</span>
              </Link>
            </div>

            {/* Mobile Menu Actions */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px]" />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:text-[#1e3a8a] dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:outline-none transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Toggle Navigation"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-5 animate-in slide-in-from-top duration-300">
            {/* Primary Nav Links */}
            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="px-3 text-[11px] font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider">
                ዋና ገጾች
              </span>
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all min-h-[46px] flex items-center ${
                    pathname === link.to
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 font-bold border-l-4 border-[#1e3a8a]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1e3a8a] dark:hover:text-blue-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Registration Services Links */}
            <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="px-3 text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                ምዝገባና አገልግሎቶች
              </span>
              {registrationLinks.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex items-center space-x-3.5 space-x-reverse px-4 py-3 rounded-xl text-base font-medium transition-all min-h-[46px] ${
                    pathname === item.to
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold border-l-4 border-amber-500'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1e3a8a] dark:hover:text-blue-300'
                  }`}
                >
                  <span className="text-xl bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Login Button */}
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full bg-[#1e3a8a] hover:bg-[#163177] text-white font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center space-x-2.5 space-x-reverse text-base transition-all duration-200 min-h-[48px]"
              >
                <LogIn className="w-5 h-5" />
                <span>ወደ አካውንቶ ይግቡ</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 🌟 3. MAIN CONTENT AREA */}
      <main className="flex-1 relative">
        {children}
      </main>

      {/* 🌟 4. PRE-FOOTER PROMOTION & CTA BANNER */}
      <section className="bg-slate-100/70 dark:bg-slate-900/70 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-[#1e3a8a] to-blue-900 rounded-3xl p-7 sm:p-12 shadow-xl border border-blue-700/60 flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
            {/* Ambient background glows */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />

            {/* Left Content */}
            <div className="space-y-3 text-center lg:text-left max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wide">
                <span>✨ ዮሐንስ ፩፥፩</span>
                <span>•</span>
                <span>«በመጀመሪያ ቃል ነበረ»</span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                የተሟላ መንፈሳዊ ዕውቀት ለመቅሰም አሁኑኑ ይመዝገቡ!
              </h3>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl">
                {isAnyOpen
                  ? `የ${academicYear} የተማሪዎች ምዝገባ በይፋ ተጀምሯል፤ በመደበኛም ሆነ በርቀት ትምህርት ፕሮግራሞቻችን ተመዝግበው ይማሩ።`
                  : (regStatus?.generalClosedMessage || 'የተማሪዎች ምዝገባ ለጊዜው ተጠናቋል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።')}
              </p>
            </div>

            {/* Right Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto relative z-10">
              {isAnyOpen ? (
                <>
                  {isRegularOpen ? (
                    <Link
                      href="/register-regular"
                      className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-[#1e3a8a] font-bold text-sm shadow-md hover:shadow-lg text-center transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                    >
                      <span>የመደበኛ ምዝገባ</span>
                      <span>➔</span>
                    </Link>
                  ) : (
                    <div className="px-5 py-3.5 rounded-xl bg-white/20 text-white/70 font-bold text-sm text-center border border-white/20 min-h-[46px] flex items-center justify-center">
                      መደበኛ (ተዘግቷል)
                    </div>
                  )}

                  {isDistanceOpen ? (
                    <Link
                      href="/register-distance"
                      className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm border border-white/30 backdrop-blur-xs shadow-xs hover:shadow-md text-center transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                    >
                      <span>የርቀት ምዝገባ</span>
                      <span>➔</span>
                    </Link>
                  ) : (
                    <div className="px-5 py-3.5 rounded-xl bg-white/20 text-white/70 font-bold text-sm text-center border border-white/20 min-h-[46px] flex items-center justify-center">
                      ርቀት (ተዘግቷል)
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/check-status"
                  className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-[#1e3a8a] font-bold text-sm shadow-md hover:shadow-lg text-center transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[46px]"
                >
                  <span>የምዝገባ ሁኔታ ያረጋግጡ</span>
                  <span>➔</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 5. STREAMLINED 3-COLUMN FOOTER */}
      <footer className="bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-14 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1: Brand Info & Telegram Channel */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center p-1 border border-[#1e3a8a]/20 dark:border-blue-500/30 shadow-xs overflow-hidden">
                  <Image src={ChurchLogo} alt="Logo" width={44} height={44} className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-base text-[#1e3a8a] dark:text-blue-300">ተክለ ሳዊሮስ</span>
                  <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">ሰንበት ትምህርት ቤት</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
              </p>
              <div className="pt-1">
                <a
                  href="https://t.me/teklesawiros"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#1e3a8a] dark:text-blue-300 text-xs font-bold border border-blue-200/80 dark:border-blue-800 transition-all shadow-2xs group"
                >
                  <Send className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                  <span>የቴሌግራም ቻናል ይቀላቀሉ</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>

            {/* Column 2: Utility & Resources (Non-repetitive) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#1e3a8a] dark:text-blue-400" />
                <span>አገልግሎቶችና መመሪያዎች</span>
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li>
                  <Link href="/login" className="hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors py-1 inline-block">
                    የተማሪዎች መግቢያ
                  </Link>
                </li>
                <li>
                  <Link href="/check-status" className="hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors py-1 inline-block">
                    የምዝገባ ሁኔታ መከታተያ
                  </Link>
                </li>
                <li>
                  <Link href="/classes" className="hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors py-1 inline-block">
                    ዓመታዊ የትምህርት ካላንደር
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors py-1 inline-block">
                    የስርዓተ ትምህርት መመሪያ
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors py-1 inline-block">
                    የመተዳደሪያ ደንብ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact & Church Hours */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>አድራሻና ግንኙነት</span>
              </h4>
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <a
                  href="https://maps.google.com/?q=Lideta+St.+Mary+Church+Addis+Ababa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="leading-relaxed">
                    ማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን፣ አዲስ አበባ
                  </span>
                </a>

                <div className="flex items-center gap-2 pt-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <a href="tel:+251115512233" className="hover:underline font-semibold text-slate-700 dark:text-slate-300">
                    +251 11 551 2233
                  </a>
                </div>

                <div className="flex items-start gap-2 pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    የቢሮ ሰዓታት፦ ቅዳሜ እና እሁድ ከጠዋቱ 2:30 – 11:30
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean One-Line Copyright Bar */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500">
            <p>
              © 2026 ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት። መብቱ በሕግ የተጠበቀ ነው።
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;