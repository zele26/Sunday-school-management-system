'use client';

// src/pages/public/Home.jsx
import React, { useState } from 'react';
import Link from 'next/link';
import bgImage from '../../assets/Lidetachurch.jpg';
import logoImage from '../../assets/ChurchLogo.png';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-amber-400 selection:text-slate-950">
      {/* Hero Section with Official Logo & Church Colors */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center bg-cover bg-center py-20 px-4 overflow-hidden"
        style={{ backgroundImage: `url(${bgImage?.src || bgImage})` }}
      >
        {/* Deep Royal Blue & Liturgical Navy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#051533]/95 via-[#08214d]/85 to-[#051533]/95" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center text-white space-y-7">

          {/* Centered Church Logo with Golden Halo */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center group cursor-pointer animate-in fade-in zoom-in duration-500">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative w-full h-full p-2.5 rounded-full bg-white border-2 border-amber-400 shadow-2xl flex items-center justify-center overflow-hidden">
              <img
                src={logoImage?.src || logoImage}
                alt="ተክለ ሳዊሮስ ሰንበት ት/ቤት አርማ"
                className="w-full h-full object-contain rounded-full transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-bold px-5 py-1.5 rounded-full backdrop-blur-md shadow-lg shadow-amber-400/10 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              የደብረ ገነት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን
            </span>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              ተክለ ሳዊሮስ ሰንበት ት/ቤት
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-xl text-blue-100 font-light leading-relaxed">
              የሕፃናት፣ የወጣቶችና የጎልማሶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Register button – opens modal */}
            <button
              onClick={() => setShowRegOptions(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:opacity-90 text-slate-950 px-9 py-4 rounded-2xl font-black shadow-md shadow-amber-400/25 transition-colors duration-150 text-base cursor-pointer"
            >
              ይመዝገቡ (Register Now) ➔
            </button>

            {/* Distance Education Direct Link */}
            <Link
              href="/distance-education"
              className="w-full sm:w-auto bg-blue-600/30 hover:bg-blue-600/50 active:opacity-90 border border-blue-400/40 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold shadow-md transition-colors duration-150 text-base flex items-center justify-center gap-2"
            >
              <span>🌐 የርቀት ትምህርት (Distance Ed)</span>
            </Link>

            {/* Login button */}
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 active:opacity-90 border border-white/20 backdrop-blur-xl text-white px-8 py-4 rounded-2xl font-bold shadow-md transition-colors duration-150 text-base text-center"
            >
              ይግቡ (Sign In) 🔐
            </Link>
          </div>
        </div>
      </section>

      {/* Vision / Mission / Values Section */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Vision */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 text-center group">
            <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#0f4c9c] group-hover:text-white shadow-md shadow-blue-500/10 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">ራዕያችን</h3>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              ማኅበረሰቡን በእግዚአብሔር ቃልና በኦርቶዶክሳዊት ተዋሕዶ ቤተ ክርስቲያን ስርዓት ማነጽ።
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 text-center group">
            <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-400 group-hover:text-slate-950 shadow-md shadow-amber-500/10 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">ተልዕኳችን</h3>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              ለሁሉም የዕድሜ ክልል ጥራት ያለውና ተደራሽ የሆነ የሰንበት ትምህርት አገልግሎት መስጠት።
            </p>
          </div>

          {/* Values */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 text-center group">
            <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#0f4c9c] group-hover:text-white shadow-md shadow-blue-500/10 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">እሴቶቻችን</h3>
            <p className="text-slate-600 leading-relaxed font-medium text-sm">
              እምነት፣ ፍቅር፣ አንድነት፣ ትህትና እና ታማኝነት።
            </p>
          </div>
        </div>
      </section>

      {/* Additional Amharic Content Section */}
      <section className="bg-gradient-to-b from-slate-100/60 to-blue-50/50 py-20 border-y border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">ለምን እኛን ይመርጣሉ?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-14 text-base font-medium">
            በሰንበት ትምህርት ቤታችን ህፃናትና ወጣቶች በመንፈሳዊ ዕውቀትና በበጎ ምግባር ታንፀው እንዲያድጉ ምቹ ሁኔታዎችን አመቻችተናል።
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-right">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 flex items-start space-x-4 space-x-reverse transition-all hover:border-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200 shadow-sm">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1.5">ተሞክሮ ያላቸው መምህራን</h4>
                <p className="text-sm text-slate-600 leading-relaxed">በመንፈሳዊ ትምህርት የዳበረ ልምድ ባላቸው መምህራን የሚሰጥ ትምህርት።</p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 flex items-start space-x-4 space-x-reverse transition-all hover:border-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200 shadow-sm">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1.5">የተለያዩ የዕድሜ ክፍሎች</h4>
                <p className="text-sm text-slate-600 leading-relaxed">ከህፃናት እስከ ወጣቶች ለሁሉም ተስማሚ የሆኑ የትምህርት መርሃ ግብሮች።</p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 flex items-start space-x-4 space-x-reverse transition-all hover:border-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200 shadow-sm">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1.5">መንፈሳዊና ማህበራዊ እንቅስቃሴዎች</h4>
                <p className="text-sm text-slate-600 leading-relaxed">መዝሙር፣ ጉዞዎችና ማህበራዊ አገልግሎቶች።</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Choice Modal */}
      {showRegOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-slate-100 space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                ምዝገባ አይነት ይምረጡ
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Regular (መደበኛ) ወይም Distance (ርቀት) ተማሪ ምዝገባ ይምረጡ
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/register-regular"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-blue-900/20 transition-all"
              >
                መደበኛ (Regular)
              </Link>

              <Link
                href="/register-distance"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 py-3.5 rounded-2xl font-bold shadow-md shadow-amber-400/20 transition-all"
              >
                ርቀት (Distance)
              </Link>
            </div>

            <button
              onClick={() => setShowRegOptions(false)}
              className="mt-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider block mx-auto py-2"
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
