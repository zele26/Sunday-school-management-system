import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const PublicLayout = () => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);
const location = useLocation();
const dropdownRef = useRef(null);

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

 <div>
  {/* Header / Navigation Bar */}
  <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        
        {/* Logo & Brand Name */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 space-x-reverse group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
              ተክለሳዊሮስ
            </span>
            <span className="text-[10px] text-emerald-400 font-medium -mt-1 tracking-wider uppercase">
              ሰንበት ትምህርት ቤት
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 space-x-reverse text-sm font-medium">
          
          {/* Main Nav Items */}
          {primaryNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3.5 py-2 rounded-xl transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Registration Services Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsRegDropdownOpen(!isRegDropdownOpen)}
              className={`flex items-center space-x-1.5 space-x-reverse px-3.5 py-2 rounded-xl transition-all duration-200 focus:outline-none ${
                registrationLinks.some((item) => item.to === location.pathname)
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>ምዝገባና አገልግሎት</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
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
              <div className="absolute left-0 mt-3 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  የተማሪዎች አገልግሎት
                </div>
                {registrationLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm transition-colors ${
                      location.pathname === item.to
                        ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-r-2 border-emerald-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Login Button */}
        <div className="hidden lg:flex items-center space-x-3 space-x-reverse">
          <Link
            to="/login"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 transform active:scale-95 flex items-center space-x-2 space-x-reverse text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>ይግቡ</span>
          </Link>
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
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
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top duration-300">
        
        {/* Primary Nav Links */}
        <div className="space-y-1 border-b border-slate-800/80 pb-3">
          <span className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ዋና ገጾች
          </span>
          {primaryNavLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                location.pathname === link.to
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-200 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Registration Services Links */}
        <div className="space-y-1 border-b border-slate-800/80 pb-3">
          <span className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            ምዝገባና አገልግሎቶች
          </span>
          {registrationLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 space-x-reverse px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                location.pathname === item.to
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Login Button */}
        <div className="pt-2">
          <Link
            to="/login"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 space-x-reverse text-base transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>ይግቡ</span>
          </Link>
        </div>

      </div>
    )}
  </header>

  {/* Main Content Area */}
  <main className="flex-1">
    <Outlet />
  </main>

  {/* Footer Section */}
  <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              ተ
            </div>
            <span className="font-bold text-xl text-white">ተክለሳዊሮስ ሰንበት ትምህርት ቤት</span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">ፈጣን ሊንኮች</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-emerald-400 transition-colors">ስለኛ</Link></li>
            <li><Link to="/classes" className="hover:text-emerald-400 transition-colors">ክፍሎች</Link></li>
            <li><Link to="/announcements" className="hover:text-emerald-400 transition-colors">ማስታወቂያዎች</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">ያግኙን</Link></li>
          </ul>
        </div>

        {/* Column 3: Registration Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">ምዝገባ</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/register-regular" className="hover:text-emerald-400 transition-colors">የመደበኛ ተማሪ ምዝገባ</Link></li>
            <li><Link to="/register-distance" className="hover:text-emerald-400 transition-colors">የርቀት ተማሪ ምዝገባ</Link></li>
            <li><Link to="/continue-registration" className="hover:text-emerald-400 transition-colors">ምዝገባዎን ይቀጥሉ</Link></li>
            <li><Link to="/check-status" className="hover:text-emerald-400 transition-colors">ሁኔታ አረጋግጥ</Link></li>
          </ul>
        </div>

      </div>

      {/* Copyright Sub-footer */}
      <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} ተክለሳዊሮስ ሰንበት ትምህርት ቤት። መብቱ በሕግ የተጠበቀ ነው።</p>
        <p className="text-slate-400">አዲስ አበባ፣ ኢትዮጵያ</p>
      </div>

    </div>
  </footer>

</div>


);
};

export default PublicLayout;