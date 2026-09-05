'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChurchLogo from '../assets/ChurchLogo.png';
import { ThemeToggle } from './ui/ThemeToggle';

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
    { to: '/about', label: 'ስለኛ' },
    { to: '/distance-education', label: 'የርቀት ትምህርት (Distance Ed)' },
    { to: '/classes', label: 'ክፍሎች' },
    { to: '/announcements', label: 'ማስታወቂያዎች' },
    { to: '/contact', label: 'ያግኙን' },
  ];

  const registrationLinks = [
    { to: '/distance-education', label: 'ስለ ርቀት ትምህርት መረጃ', icon: '📖' },
    { to: '/register-distance', label: 'የርቀት ተማሪ ምዝገባ (Distance)', icon: '🌐' },
    { to: '/register-regular', label: 'የመደበኛ ተማሪ ምዝገባ (Regular)', icon: '📝' },
    { to: '/continue-registration', label: 'ምዝገባዎን ይቀጥሉ', icon: '🔄' },
    { to: '/check-status', label: 'ሁኔታ አረጋግጥ', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-[var(--brand-gold)] selection:text-slate-950 font-sans transition-colors duration-200">
      {/* 🌟 1. SLIDING BIBLE VERSE & PROMOTION TICKER */}
      <div
        className="relative z-50 bg-gradient-to-r from-blue-900 via-[#1657b8] to-blue-950 text-white text-xs sm:text-sm transition-all duration-500 overflow-hidden border-b border-amber-400/30 shadow-xs"
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black border shrink-0 bg-amber-400 text-slate-950 border-amber-300 shadow-xs">
              {tickerItems[currentTickerIndex].type}
            </span>
            <p className="truncate sm:whitespace-normal text-blue-50 font-medium tracking-wide text-xs sm:text-sm">
              {tickerItems[currentTickerIndex].text}
            </p>
          </div>

          {/* Ticker Controls / Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {tickerItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTickerIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentTickerIndex === idx ? 'w-5 bg-amber-400 shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 2. HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-white shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 lg:h-22">
            {/* Logo & Brand Name */}
            <Link
              href="/"
              className="flex items-center space-x-3 sm:space-x-3.5 space-x-reverse group focus:outline-none transition-all duration-300"
            >
              {/* Logo Container with Enhanced Styling */}
              <div className="relative flex items-center justify-center flex-shrink-0">
                <div className="relative p-1 rounded-2xl bg-white dark:bg-slate-800 border border-amber-400/80 shadow-md group-hover:border-[#1657b8] group-hover:shadow-lg transition-all duration-300">
                  <img
                    src={ChurchLogo?.src || ChurchLogo}
                    alt="ተክለሳዊሮስ ሰንበት ትምህርት ቤት"
                    className="h-11 sm:h-13 lg:h-14 w-auto object-contain group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Church Name and Subtitle */}
              <div className="flex flex-col justify-center min-w-0">
                <span className="font-black text-base sm:text-lg lg:text-xl tracking-tight text-[#1657b8] dark:text-blue-400 leading-tight group-hover:text-[#124796] dark:group-hover:text-blue-300 transition-colors duration-300 truncate">
                  ተክለሳዊሮስ
                </span>
                <span className="text-[10px] sm:text-[11px] lg:text-xs text-amber-600 dark:text-amber-400 font-extrabold tracking-wider uppercase mt-0.5 truncate flex items-center gap-1">
                  <span>ሰንበት ትምህርት ቤት</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1.5 space-x-reverse text-sm font-semibold">
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`px-3.5 py-2 rounded-xl transition-all duration-200 relative ${pathname === link.to
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1657b8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
                  className={`flex items-center space-x-2 space-x-reverse px-3.5 py-2 rounded-xl transition-all duration-200 focus:outline-none cursor-pointer ${registrationLinks.some((item) => item.to === pathname)
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#1657b8] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>ምዝገባና አገልግሎት</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isRegDropdownOpen ? 'rotate-180 text-[#1657b8] dark:text-amber-400' : 'text-slate-400'
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
                      <span className="text-xs font-black text-[#1657b8] dark:text-blue-400 uppercase tracking-wider">
                        የተማሪዎች አገልግሎት
                      </span>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-300/40">
                        2017 ዓ.ም
                      </span>
                    </div>

                    <div className="pt-1.5 space-y-0.5 px-1.5">
                      {registrationLinks.map((item) => (
                        <Link
                          key={item.to}
                          href={item.to}
                          className={`flex items-center space-x-3.5 space-x-reverse px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${pathname === item.to
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-300 font-bold border-l-3 border-[#1657b8]'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#1657b8] dark:hover:text-blue-400'
                            }`}
                        >
                          <span className="text-base p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-108 transition-transform shadow-2xs">
                            {item.icon}
                          </span>
                          <span className="flex-1 text-xs sm:text-sm">{item.label}</span>
                          <span className="text-slate-400 group-hover:text-[#1657b8] dark:group-hover:text-amber-400 transition-colors">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Actions (ThemeToggle + Login) */}
            <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
              <ThemeToggle className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700" />
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] active:opacity-90 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2 space-x-reverse border border-blue-400/20"
              >
                <span className="text-base">🔐</span>
                <span>ይግቡ</span>
              </Link>
            </div>

            {/* Mobile Menu Actions */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200" />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-700 hover:text-[#1657b8] bg-slate-100 hover:bg-slate-200 border border-slate-200 focus:outline-none transition-all duration-200"
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
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-5 animate-in slide-in-from-top duration-300">
            {/* Primary Nav Links */}
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <span className="px-3 text-[11px] font-bold text-[#1657b8] uppercase tracking-wider">
                ዋና ገጾች
              </span>
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === link.to
                    ? 'bg-blue-50 text-[#1657b8] font-bold border-l-4 border-[#1657b8]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#1657b8]'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Registration Services Links */}
            <div className="space-y-1.5 border-b border-slate-100 pb-4">
              <span className="px-3 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                ምዝገባና አገልግሎቶች
              </span>
              {registrationLinks.map((item) => (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex items-center space-x-3.5 space-x-reverse px-4 py-3 rounded-xl text-base font-medium transition-all ${pathname === item.to
                    ? 'bg-amber-50 text-amber-900 font-bold border-l-4 border-amber-500'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#1657b8]'
                    }`}
                >
                  <span className="text-xl bg-slate-100 p-1.5 rounded-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Login Button */}
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full bg-[#1657b8] hover:bg-[#124796] text-white font-bold py-3.5 rounded-xl shadow-sm flex items-center justify-center space-x-2.5 space-x-reverse text-base transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
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
      <section className="bg-slate-100/70 dark:bg-slate-900/70   border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <span>✨ በመጀመሪያ ቃል ነበረል</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-snug">
                ልጅዎን በሰንበት ትምህርት ቤት መንፈሳዊ ዕውቀት ያሳድጉ!
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                የተክለሳዊሮስ ሰንበት ትምህርት ቤት የ 2017 ዓ.ም የተማሪዎች ምዝገባ በይፋ ተጀምሯል። በመደበኛም ሆነ በርቀት ትምህርት ፕሮግራማችን ተመዝግበው ይማሩ።
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
              <Link
                href="/register-regular"
                className="px-6 py-3.5 rounded-xl bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white font-bold text-sm shadow-sm text-center transition-colors"
              >
                የመደበኛ ምዝገባ ➔
              </Link>
              <Link
                href="/register-distance"
                className="px-6 py-3.5 rounded-xl bg-[var(--brand-gold)] hover:bg-[#dfa500] active:opacity-90 text-slate-950 font-bold text-sm shadow-sm text-center transition-colors"
              >
                የርቀት ምዝገባ ➔
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 5. FOOTER SECTION */}
      <footer className="bg-white text-slate-600 border-t border-slate-200 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Brand Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 border border-slate-200 shadow-sm">
                  <img src={ChurchLogo?.src || ChurchLogo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base text-[#1657b8]">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</span>
                  <span className="text-[10px] text-amber-600 font-bold uppercase">ደብረ ሳዊሮስ ቅዱስ ተክለሃይማኖት</span>
                </div>
              </div>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1657b8] uppercase tracking-wider">
                ፈጣን ማውጫ
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-[#1657b8] transition-colors">
                    ስለኛ
                  </Link>
                </li>
                <li>
                  <Link href="/distance-education" className="hover:text-[#1657b8] transition-colors">
                    የርቀት ትምህርት (LMS)
                  </Link>
                </li>
                <li>
                  <Link href="/classes" className="hover:text-[#1657b8] transition-colors">
                    ክፍሎችና መርሃግብራት
                  </Link>
                </li>
                <li>
                  <Link href="/announcements" className="hover:text-[#1657b8] transition-colors">
                    ማስታወቂያዎች
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#1657b8] transition-colors">
                    ያግኙን
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Registration Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                ምዝገባና ክትትል
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/register-regular" className="hover:text-amber-700 transition-colors">
                    የመደበኛ ተማሪ ምዝገባ
                  </Link>
                </li>
                <li>
                  <Link href="/register-distance" className="hover:text-amber-700 transition-colors">
                    የርቀት ተማሪ ምዝገባ
                  </Link>
                </li>
                <li>
                  <Link href="/continue-registration" className="hover:text-amber-700 transition-colors">
                    ምዝገባዎን ይቀጥሉ
                  </Link>
                </li>
                <li>
                  <Link href="/check-status" className="hover:text-amber-700 transition-colors">
                    ሁኔታ አረጋግጥ
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Sub-footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>
              © {new Date().getFullYear()} ተክለሳዊሮስ ሰንበት ትምህርት ቤት። መብቱ በሕግ የተጠበቀ ነው።
            </p>
            <div>
              <span className="text-slate-500">ደብረ ሳዊሮስ ቅዱስ ተክለሃይማኖት ሰንበት ት/ቤት</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;