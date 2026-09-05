'use client';

// src/pages/public/Home.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import logoImage from '../../assets/ChurchLogo.png';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-[var(--brand-gold)] selection:text-slate-950">
      {/* 🌟 1. HERO SECTION - Clean, Light & Centered on Official Church Logo */}
      <section className="relative py-16 sm:py-24 px-4 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-7">

          {/* Centered Church Logo with Golden Halo */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 rounded-full bg-amber-300/30 blur-lg"></div>
            <div className="relative w-full h-full p-2.5 rounded-full bg-white border-2 border-amber-400 shadow-xl flex items-center justify-center overflow-hidden">
              <img
                src={logoImage?.src || logoImage}
                alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት አርማ"
                className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-[#1657b8] border border-blue-200 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-sm tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              የደብረ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-[#1657b8]">
              ተክለ ሳዊሮስ ሰንበት ት/ቤት
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              የሕፃናት፣ የወጣቶችና የጎልማሶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
            </p>
          </div>

          {/* Hero Actions */}
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3.5">
            {/* Register button */}
            <button
              onClick={() => setShowRegOptions(true)}
              className="w-full sm:w-auto bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white px-8 py-3.5 rounded-xl font-bold shadow-sm transition-colors text-base cursor-pointer"
            >
              ይመዝገቡ (Register Now) ➔
            </button>

            {/* Distance Education Direct Link */}
            <Link
              href="/distance-education"
              className="w-full sm:w-auto bg-[var(--brand-gold)] hover:bg-[#dfa500] active:opacity-90 text-slate-950 px-7 py-3.5 rounded-xl font-bold shadow-sm transition-colors text-base flex items-center justify-center gap-2"
            >
              <span>🌐 የርቀት ትምህርት (Distance Ed)</span>
            </Link>

            {/* Login button */}
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white hover:bg-slate-100 active:opacity-90 border border-slate-300 text-slate-700 px-7 py-3.5 rounded-xl font-bold shadow-sm transition-colors text-base text-center"
            >
              ይግቡ (Sign In) 🔐
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 2. VISION / MISSION / VALUES SECTION */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Vision */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 transition-all text-center group">
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
          </div>

          {/* Mission */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all text-center group">
            <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[var(--brand-gold)] group-hover:text-slate-950 transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">ተልዕኳችን</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              ለሁሉም የዕድሜ ክልል ጥራት ያለውና ተደራሽ የሆነ የሰንበት ትምህርት አገልግሎት መስጠት።
            </p>
          </div>

          {/* Values */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1657b8]/40 transition-all text-center group">
            <div className="w-14 h-14 bg-blue-50 text-[#1657b8] rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#1657b8] group-hover:text-white transition-all">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">እሴቶቻችን</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              እምነት፣ ፍቅር፣ አንድነት፣ ትህትና እና ታማኝነት።
            </p>
          </div>
        </div>
      </section>

      {/* 🌟 3. WHY CHOOSE US SECTION */}
      <section className="bg-slate-100/70 py-16 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1657b8] mb-3 tracking-tight">ለምን እኛን ይመርጣሉ?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-sm sm:text-base">
            በሰንበት ትምህርት ቤታችን ህፃናትና ወጣቶች በመንፈሳዊ ዕውቀትና በበጎ ምግባር ታንፀው እንዲያድጉ ምቹ ሁኔታዎችን አመቻችተናል።
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 text-right">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3.5 space-x-reverse">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1657b8] flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">ተሞክሮ ያላቸው መምህራን</h4>
                <p className="text-xs text-slate-600 leading-relaxed">በመንፈሳዊ ትምህርት የዳበረ ልምድ ባላቸው መምህራን የሚሰጥ ትምህርት።</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3.5 space-x-reverse">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-base shrink-0 border border-amber-200">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">የተለያዩ የዕድሜ ክፍሎች</h4>
                <p className="text-xs text-slate-600 leading-relaxed">ከህፃናት እስከ ወጣቶች ለሁሉም ተስማሚ የሆኑ የትምህርት መርሃ ግብሮች።</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3.5 space-x-reverse">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1657b8] flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">መንፈሳዊና ማህበራዊ እንቅስቃሴዎች</h4>
                <p className="text-xs text-slate-600 leading-relaxed">መዝሙር፣ ጉዞዎችና ማህበራዊ አገልግሎቶች።</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 4. REGISTRATION CHOICE MODAL */}
      {showRegOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl p-7 max-w-sm w-full text-center border border-slate-200 space-y-4">
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
              <Link
                href="/register-regular"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-[#1657b8] hover:bg-[#124796] text-white py-3 rounded-xl font-bold shadow-sm transition-colors text-sm"
              >
                መደበኛ (Regular)
              </Link>

              <Link
                href="/register-distance"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-[var(--brand-gold)] hover:bg-[#dfa500] text-slate-950 py-3 rounded-xl font-bold shadow-sm transition-colors text-sm"
              >
                ርቀት (Distance)
              </Link>
            </div>

            <button
              onClick={() => setShowRegOptions(false)}
              className="mt-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider block mx-auto py-1"
            >
              ሰርዝ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
