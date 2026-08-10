// import React, { useState, useEffect, useRef } from 'react';
// import { Link, Outlet, useLocation } from 'react-router-dom';

// const PublicLayout = () => {
// const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
// const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
// const location = useLocation();
// const dropdownRef = useRef(null);

// // Close mobile menu and dropdowns on route change
// useEffect(() => {
// setIsMobileMenuOpen(false);
// setIsRegDropdownOpen(false);
// }, [location]);

// // Close dropdown when clicking outside
// useEffect(() => {
// const handleClickOutside = (event) => {
// if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
// setIsRegDropdownOpen(false);
// }
// };
// document.addEventListener('mousedown', handleClickOutside);
// return () => document.removeEventListener('mousedown', handleClickOutside);
// }, []);

// const primaryNavLinks = [
// { to: '/about', label: 'ስለኛ' },
// { to: '/classes', label: 'ክፍሎች' },
// { to: '/announcements', label: 'ማስታወቂያዎች' },
// { to: '/contact', label: 'ያግኙን' },
// ];

// const registrationLinks = [
// { to: '/register-regular', label: 'የመደበኛ ተማሪ ምዝገባ', icon: '📝' },
// { to: '/register-distance', label: 'የርቀት ተማሪ ምዝገባ', icon: '🌐' },
// { to: '/continue-registration', label: 'ምዝገባዎን ይቀጥሉ', icon: '🔄' },
// { to: '/check-status', label: 'ሁኔታ አረጋግጥ', icon: '🔍' },
// ];

// return (

//  <div>
//   {/* Header / Navigation Bar */}
//   <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//       <div className="flex items-center justify-between h-20">
        
//         {/* Logo & Brand Name */}
//         <Link 
//           to="/" 
//           className="flex items-center space-x-3 space-x-reverse group focus:outline-none"
//         >
//           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//             </svg>
//           </div>
//           <div className="flex flex-col">
//             <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
//               ተክለሳዊሮስ
//             </span>
//             <span className="text-[10px] text-emerald-400 font-medium -mt-1 tracking-wider uppercase">
//               ሰንበት ትምህርት ቤት
//             </span>
//           </div>
//         </Link>

//         {/* Desktop Navigation Links */}
//         <nav className="hidden lg:flex items-center space-x-1 space-x-reverse text-sm font-medium">
          
//           {/* Main Nav Items */}
//           {primaryNavLinks.map((link) => (
//             <Link
//               key={link.to}
//               to={link.to}
//               className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
//                 location.pathname === link.to
//                   ? 'bg-slate-800 text-emerald-400 font-semibold'
//                   : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
//               }`}
//             >
//               {link.label}
//             </Link>
//           ))}

//           {/* Registration Services Dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}
//               className={`flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 rounded-xl transition-all duration-200 focus:outline-none ${
//                 registrationLinks.some((item) => item.to === location.pathname)
//                   ? 'bg-slate-800 text-emerald-400 font-semibold'
//                   : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
//               }`}
//             >
//               <span>ምዝገባና አገልግሎት</span>
//               <svg
//                 className={`w-4 h-4 transition-transform duration-200 ${
//                   isRegDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
//                 }`}
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>

//             {/* Dropdown Card */}
//             {isRegDropdownOpen && (
//               <div className="absolute left-0 mt-3 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
//                 <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
//                   የተማሪዎች አገልግሎት
//                 </div>
//                 {registrationLinks.map((item) => (
//                   <Link
//                     key={item.to}
//                     to={item.to}
//                     className={`flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm transition-colors ${
//                       location.pathname === item.to
//                         ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-r-2 border-emerald-400'
//                         : 'text-slate-300 hover:bg-slate-800 hover:text-white'
//                     }`}
//                   >
//                     <span className="text-base">{item.icon}</span>
//                     <span>{item.label}</span>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>
//         </nav>

//         {/* Desktop Login Button */}
//         <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
//           <Link
//             to="/login"
//             className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 transform active:scale-95 flex items-center space-x-2 space-x-reverse text-sm"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//             </svg>
//             <span>ይግቡ</span>
//           </Link>
//         </div>

//         {/* Mobile Menu Button (Hamburger) */}
//         <div className="lg:hidden flex items-center">
//           <button
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
//             aria-label="Toggle Navigation"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               {isMobileMenuOpen ? (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//               ) : (
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//               )}
//             </svg>
//           </button>
//         </div>

//       </div>
//     </div>

//     {/* Mobile Navigation Drawer */}
//     {isMobileMenuOpen && (
//       <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-300">
        
//         {/* Primary Nav Links */}
//         <div className="space-y-1 border-b border-slate-800/80 pb-3">
//           <span className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
//             ዋና ገጾች
//           </span>
//           {primaryNavLinks.map((link) => (
//             <Link
//               key={link.to}
//               to={link.to}
//               className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
//                 location.pathname === link.to
//                   ? 'bg-slate-800 text-emerald-400 font-semibold'
//                   : 'text-slate-200 hover:bg-slate-800/60 hover:text-white'
//               }`}
//             >
//               {link.label}
//             </Link>
//           ))}
//         </div>

//         {/* Registration Services Links */}
//         <div className="space-y-1 border-b border-slate-800/80 pb-3">
//           <span className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
//             ምዝገባና አገልግሎቶች
//           </span>
//           {registrationLinks.map((item) => (
//             <Link
//               key={item.to}
//               to={item.to}
//               className={`flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
//                 location.pathname === item.to
//                   ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
//                   : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
//               }`}
//             >
//               <span className="text-base">{item.icon}</span>
//               <span>{item.label}</span>
//             </Link>
//           ))}
//         </div>

//         {/* Mobile Login Button */}
//         <div className="pt-2">
//           <Link
//             to="/login"
//             className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 space-x-reverse text-base transition-colors"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//             </svg>
//             <span>ይግቡ</span>
//           </Link>
//         </div>

//       </div>
//     )}
//   </header>

//   {/* Main Content Area */}
//   <main className="flex-1">
//     <Outlet />
//   </main>

//   {/* Footer Section */}
//   <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
//         {/* Column 1: Brand Info */}
//         <div className="md:col-span-2 space-y-4">
//           <div className="flex items-center space-x-3 space-x-reverse">
//             <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
//               ተ
//             </div>
//             <span className="font-bold text-xl text-white">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</span>
//           </div>
//           <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
//             የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
//           </p>
//         </div>

//         {/* Column 2: Navigation Links */}
//         <div className="space-y-3">
//           <h4 className="text-sm font-semibold text-white uppercase tracking-wider">ፈጣን ሊንኮች</h4>
//           <ul className="space-y-2 text-sm">
//             <li><Link to="/about" className="hover:text-emerald-400 transition-colors">ስለኛ</Link></li>
//             <li><Link to="/classes" className="hover:text-emerald-400 transition-colors">ክፍሎች</Link></li>
//             <li><Link to="/announcements" className="hover:text-emerald-400 transition-colors">ማስታወቂያዎች</Link></li>
//             <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">ያግኙን</Link></li>
//           </ul>
//         </div>

//         {/* Column 3: Registration Links */}
//         <div className="space-y-3">
//           <h4 className="text-sm font-semibold text-white uppercase tracking-wider">ምዝገባ</h4>
//           <ul className="space-y-2 text-sm">
//             <li><Link to="/register-regular" className="hover:text-emerald-400 transition-colors">የመደበኛ ተማሪ ምዝገባ</Link></li>
//             <li><Link to="/register-distance" className="hover:text-emerald-400 transition-colors">የርቀት ተማሪ ምዝገባ</Link></li>
//             <li><Link to="/continue-registration" className="hover:text-emerald-400 transition-colors">ምዝገባዎን ይቀጥሉ</Link></li>
//             <li><Link to="/check-status" className="hover:text-emerald-400 transition-colors">ሁኔታ አረጋግጥ</Link></li>
//           </ul>
//         </div>

//       </div>

//       {/* Copyright Sub-footer */}
//       <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
//         <p>© {new Date().getFullYear()} ተክለሳዊሮስ ሰንበት ትምህርት ቤት። መብቱ በሕግ የተጠበቀ ነው።</p>
//         <p className="text-slate-400">አዲስ አበባ፣ ኢትዮጵያ</p>
//       </div>

//     </div>
//   </footer>

// </div>


// );
// };

// export default PublicLayout;





import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import ChurchLogo from '../assets/ChurchLogo.png';

// Inspirational Bible verses & Church Announcements for the sliding ticker
const tickerItems = [
  {
    type: "📖 የዕለቱ ቃል",
    text: "«ልጆችን ወደ እኔ ይምጡ አትከልክሏቸው፤ የእግዚአብሔር መንግሥት እንደ እነዚህ ላሉት ናትና።» (ማር. ፲፥፲፬)",
    bg: "from-amber-600/20 via-amber-500/10 to-transparent",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40"
  },
  {
    type: "📢 ማስታወቂያ",
    text: "የ 2017 ዓ.ም አዲሱ የሰንበት ትምህርት ቤት የመደበኛ እና የርቀት ምዝገባ በይፋ ተጀምሯል! አሁኑኑ ይመዝገቡ።",
    bg: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    borderColor: "border-emerald-500/30",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
  },
  {
    type: "🙏 መንፈሳዊ መልእክት",
    text: "«ከሕፃናትና ከሚጠቡ ልጆች አፍ ምስጋናን አዘጋጀህ...» (መዝ. ፰፥፪) — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።",
    bg: "from-sky-600/20 via-sky-500/10 to-transparent",
    borderColor: "border-sky-500/30",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/40"
  }
];

const PublicLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [isTickerPaused, setIsTickerPaused] = useState(false);
  
  const location = useLocation();
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
  }, [location]);

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
    { to: '/classes', label: 'ክፍሎች' },
    { to: '/announcements', label: 'ማስታወቂያዎች' },
    { to: '/contact', label: 'ያግኙን' },
  ];

  const registrationLinks = [
    { to: '/register-regular', label: 'የመደበኛ ተማሪ ምዝገባ', icon: '📝' },
    { to: '/register-distance', label: 'የርቀት ተማሪ ምዝገባ', icon: '🌐' },
    { to: '/continue-registration', label: 'ምዝገባዎን ይቀጥሉ', icon: '🔄' },
    { to: '/check-status', label: 'ሁኔታ አረጋግጥ', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--brand-blue-dark)] text-white selection:bg-[var(--brand-yellow)] selection:text-[var(--brand-blue-dark)] font-sans">
      
      {/* 🌟 1. SLIDING BIBLE VERSE & PROMOTION TICKER */}
      <div 
        className="relative z-50 bg-[var(--brand-blue)] border-b border-white/10 text-xs sm:text-sm transition-all duration-500 overflow-hidden"
        onMouseEnter={() => setIsTickerPaused(true)}
        onMouseLeave={() => setIsTickerPaused(false)}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${tickerItems[currentTickerIndex].bg} transition-all duration-700 pointer-events-none`} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 flex-1 overflow-hidden">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 shadow-sm transition-colors duration-500 ${tickerItems[currentTickerIndex].badgeColor}`}>
              {tickerItems[currentTickerIndex].type}
            </span>
            <p className="truncate sm:whitespace-normal text-slate-200 font-medium tracking-wide animate-fade-in">
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
                  currentTickerIndex === idx ? 'w-5 bg-emerald-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🌟 2. HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[var(--brand-blue)]/95 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl shadow-blue-950/40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 sm:h-28">
            
            {/* Logo & Brand Name */}
            <Link 
              to="/" 
              className="flex items-center space-x-4 space-x-reverse group focus:outline-none transition-all duration-300"
            >
              {/* Logo Container with Enhanced Styling */}
              <div className="relative flex items-center justify-center">
                {/* Outer glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-yellow)]/40 via-blue-400/20 to-[var(--brand-yellow)]/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105"></div>
                
                {/* Logo frame with border */}
                <div className="relative p-2 rounded-2xl bg-white/5 border-2 border-white/20 backdrop-blur-sm group-hover:border-[var(--brand-yellow)]/60 group-hover:bg-white/10 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:shadow-[var(--brand-yellow)]/20">
                  <img 
                    src={ChurchLogo} 
                    alt="ተክለሳዊሮስ ሰንበት ትምህርት ቤት" 
                    className="h-16 sm:h-20 w-auto drop-shadow-lg group-hover:drop-shadow-2xl group-hover:scale-105 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Church Name and Subtitle */}
              <div className="hidden sm:flex flex-col justify-center">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-tight group-hover:text-[var(--brand-yellow)] transition-colors duration-300">
                  ተክለሳዊሮስ
                </span>
                <span className="text-[10px] sm:text-xs text-[var(--brand-yellow)] font-bold tracking-wider uppercase mt-0.5 group-hover:text-white transition-colors duration-300">
                  ሰንበት ትምህርት ቤት
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1.5 space-x-reverse text-sm font-medium">
              
              {/* Main Nav Items */}
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2.5 rounded-xl transition-all duration-200 relative group ${
                    location.pathname === link.to
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                  {location.pathname === link.to && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </Link>
              ))}

              {/* Registration Services Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}
                  className={`flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl transition-all duration-200 focus:outline-none border ${
                    registrationLinks.some((item) => item.to === location.pathname)
                      ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-400 font-bold border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
                  }`}
                >
                  <span className="text-amber-400">✨</span>
                  <span>ምዝገባና አገልግሎት</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isRegDropdownOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Card */}
                {isRegDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/80 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 divide-y divide-slate-800/60">
                    <div className="px-4 py-2.5 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                        የተማሪዎች አገልግሎት
                      </span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                        2017 ዓ.ም
                      </span>
                    </div>
                    
                    <div className="pt-1.5 space-y-0.5 px-1.5">
                      {registrationLinks.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`flex items-center space-x-3.5 space-x-reverse px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                            location.pathname === item.to
                              ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-300 font-semibold border-l-2 border-emerald-400 shadow-sm'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-1'
                          }`}
                        >
                          <span className="text-lg p-1.5 rounded-lg bg-slate-800/60 group-hover:scale-110 transition-transform">{item.icon}</span>
                          <span className="flex-1">{item.label}</span>
                          <span className="text-slate-600 group-hover:text-emerald-400 transition-colors">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Desktop Login Button */}
            <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
              <Link
                to="/login"
                className="relative group overflow-hidden rounded-xl p-px font-semibold text-sm focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--brand-blue)] via-blue-600 to-[var(--brand-yellow)] group-hover:opacity-90 transition-opacity duration-300 animate-pulse" />
                <div className="relative px-5 py-2.5 rounded-[11px] bg-[var(--brand-blue-dark)] group-hover:bg-opacity-0 transition-all duration-300 flex items-center space-x-2 space-x-reverse text-white">
                  <svg className="w-4 h-4 text-[var(--brand-yellow)] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>ይግቡ</span>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 focus:outline-none transition-all duration-200"
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
          <div className="lg:hidden bg-slate-900/95 backdrop-blur-2xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-5 animate-in slide-in-from-top duration-300">
            
            {/* Primary Nav Links */}
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <span className="px-3 text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider">
                ዋና ገጾች
              </span>
              {primaryNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 font-bold border-l-4 border-emerald-400'
                      : 'text-slate-200 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Registration Services Links */}
            <div className="space-y-1.5 border-b border-slate-800/80 pb-4">
              <span className="px-3 text-[11px] font-bold text-amber-400/80 uppercase tracking-wider">
                ምዝገባና አገልግሎቶች
              </span>
              {registrationLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-3.5 space-x-reverse px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    location.pathname === item.to
                      ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-300 font-bold border-l-4 border-amber-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <span className="text-xl bg-slate-800/80 p-1.5 rounded-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Login Button */}
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2.5 space-x-reverse text-base transition-all duration-300"
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
        {/* Subtle decorative background glow for visual depth */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--brand-yellow)]/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <Outlet />
      </main>

      {/* 🌟 4. PRE-FOOTER PROMOTION & CTA BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-blue-dark)] via-[var(--brand-blue)] to-blue-950 border-t border-white/10 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-700/60 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/30 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            
            {/* Decorative background glow */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 text-center lg:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-yellow)]/20 border border-[var(--brand-yellow)]/40 text-[var(--brand-yellow)] text-xs font-semibold">
                <span>✨ የእግዚአብሔር ቃል ለትውልድ</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                ልጅዎን በሰንበት ትምህርት ቤት መንፈሳዊ ዕውቀት ያሳድጉ!
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                የመደበኛና የርቀት ትምህርት ምዝገባዎች አሁን ክፍት ናቸው። በመንፈሳዊ ሥነ-ምግባርና ዕውቀት የበለጸገ ትውልድ ለማፍራት አብረን እንሥራ።
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto shrink-0">
              <Link
                to="/register-regular"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-yellow)] hover:from-blue-700 hover:to-yellow-400 text-white font-bold text-sm shadow-lg shadow-blue-900/30 hover:shadow-yellow-500/40 hover:-translate-y-0.5 transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <span>📝 በመደበኛ ይመዝገቡ</span>
              </Link>
              <Link
                to="/register-distance"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 hover:border-white/40 transition-all duration-200 text-center flex items-center justify-center gap-2"
              >
                <span>🌐 በርቀት ይመዝገቡ</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 🌟 5. FOOTER SECTION */}
      <footer className="bg-[var(--brand-blue)] text-blue-100 border-t border-white/10 pt-14 pb-10 relative overflow-hidden">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--brand-yellow)]/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12">
            
            {/* Column 1: Brand Info */}
            <div className="md:col-span-2 space-y-5">
              <div className="flex items-center space-x-5 space-x-reverse group">
                {/* Logo Container with Enhanced Styling */}
                <div className="relative flex-shrink-0">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-yellow)]/50 via-blue-400/30 to-[var(--brand-yellow)]/40 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  {/* Logo frame with border */}
                  <div className="relative p-3 rounded-2xl bg-white/5 border-2 border-white/30 backdrop-blur-sm group-hover:border-[var(--brand-yellow)]/80 group-hover:bg-white/15 transition-all duration-300 shadow-xl group-hover:shadow-2xl group-hover:shadow-[var(--brand-yellow)]/30">
                    <img 
                      src={ChurchLogo} 
                      alt="ተክለሳዊሮስ ሰንበት ትምህርት ቤት" 
                      className="h-20 sm:h-24 w-auto drop-shadow-lg group-hover:drop-shadow-2xl group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Text Information */}
                <div>
                  <span className="font-extrabold text-xl sm:text-2xl text-white block leading-tight group-hover:text-[var(--brand-yellow)] transition-colors duration-300">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</span>
                  <span className="text-xs sm:text-sm text-[var(--brand-yellow)] font-bold mt-1.5 inline-block group-hover:text-white transition-colors duration-300">የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ፣ ለቤተክርስቲያንና ለሀገር የሚጠቅም ትውልድ እንገነባለን።
              </p>
              
              {/* Spiritual Badge */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300">
                  📍 አዲስ አበባ፣ ኢትዮጵያ
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/50 text-emerald-400">
                  🙏 መንፈሳዊ ማዕከል
                </span>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-3.5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-emerald-500 pl-2.5">
                ፈጣን ሊንኮች
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">✦</span>
                    <span>ስለኛ</span>
                  </Link>
                </li>
                <li>
                  <Link to="/classes" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">✦</span>
                    <span>ክፍሎች</span>
                  </Link>
                </li>
                <li>
                  <Link to="/announcements" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">✦</span>
                    <span>ማስታወቂያዎች</span>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-emerald-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-emerald-400 transition-colors">✦</span>
                    <span>ያግኙን</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Registration Links */}
            <div className="space-y-3.5">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-l-2 border-amber-500 pl-2.5">
                ምዝገባና ክትትል
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/register-regular" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors">→</span>
                    <span>የመደበኛ ተማሪ ምዝገባ</span>
                  </Link>
                </li>
                <li>
                  <Link to="/register-distance" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors">→</span>
                    <span>የርቀት ተማሪ ምዝገባ</span>
                  </Link>
                </li>
                <li>
                  <Link to="/continue-registration" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors">→</span>
                    <span>ምዝገባዎን ይቀጥሉ</span>
                  </Link>
                </li>
                <li>
                  <Link to="/check-status" className="hover:text-amber-400 transition-colors flex items-center gap-2 group">
                    <span className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors">→</span>
                    <span>ሁኔታ አረጋግጥ</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Copyright Sub-footer */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p className="flex items-center gap-1.5 text-center sm:text-left">
              <span>© {new Date().getFullYear()} ተክለሳዊሮስ ሰንበት ትምህርት ቤት።</span>
              <span className="hidden sm:inline">መብቱ በሕግ የተጠበቀ ነው።</span>
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="hover:text-slate-300 transition-colors cursor-default">ሰላምና ፍቅር ለሀገራችን 🇪ተ</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default PublicLayout;