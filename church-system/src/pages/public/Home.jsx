// src/pages/public/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../../assets/Lidetachurch.jpg';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 selection:bg-amber-500 selection:text-slate-950">
      {/* Hero Section */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center py-24 px-4 overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Deep Royal Blue & Dark Overlay with subtle gradient to match the institution logo */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-slate-950/80 to-slate-950/95" />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white space-y-8">
          <span className="inline-flex items-center gap-2 bg-amber-500/15 text-amber-300 border border-amber-500/30 text-sm font-semibold px-5 py-2 rounded-full backdrop-blur-md shadow-lg shadow-amber-500/10 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            እንኳን ደህና መጡ!</span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            ተክለሳዊሮስ ሰንበት ትምህርት ቤት
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 font-light leading-relaxed">
            የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Register button – opens modal (Styled with Institution's Gold/Amber Brand Accent) */}
            <button
              onClick={() => setShowRegOptions(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 px-9 py-4 rounded-2xl font-bold shadow-xl shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              ይመዝገቡ
            </button>

            {/* Login button (Styled with Royal Blue Glassmorphism) */}
            <Link
              to="/login"
              className="w-full sm:w-auto bg-blue-900/40 hover:bg-blue-900/60 border border-blue-400/30 backdrop-blur-xl text-white px-9 py-4 rounded-2xl font-semibold shadow-lg shadow-blue-950/50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              ይግቡ
            </Link>
          </div>
        </div>
      </section>

      {/* Vision / Mission / Values Section */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Vision */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-1.5 text-center group">
            <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 group-hover:text-white shadow-md shadow-blue-500/10 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">ራዕያችን</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              ማኅበረሰቡን በእግዚአብሔር ቃልና በኦርቶዶክሳዊት ተዋሕዶ ቤተ ክርስቲያን ስርዓት ማነጽ።
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-1.5 text-center group">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-500 group-hover:text-slate-950 shadow-md shadow-amber-500/10 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">ተልዕኳችን</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              ለሁሉም የዕድሜ ክልል ጥራት ያለውና ተደራሽ የሆነ የሰንበት ትምህርት አገልግሎት መስጠት።
            </p>
          </div>

          {/* Values */}
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-amber-500/30 transition-all duration-300 transform hover:-translate-y-1.5 text-center group">
            <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-700 group-hover:text-white shadow-md shadow-blue-500/10 transition-all duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">እሴቶቻችን</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              እምነት፣ ፍቅር፣ አንድነት፣ ትህትና እና ታማኝነት።
            </p>
          </div>
        </div>
      </section>

      {/* Additional Amharic Content Section */}
      <section className="bg-gradient-to-b from-slate-100/50 to-blue-50/40 py-20 border-y border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">ለምን እኛን ይመርጣሉ?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-14 text-base font-medium">
            በሰንበት ትምህርት ቤታችን ህፃናትና ወጣቶች በመንፈሳዊ ዕውቀትና በበጎ ምግባር ታንፀው እንዲያድጉ ምቹ ሁኔታዎችን አመቻችተናል።
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-right">
            <div className="bg-white/90 backdrop-blur-md p-7 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 flex items-start space-x-4 space-x-reverse transition-all hover:border-amber-500/40">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200 shadow-sm">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1.5">ተሞክሮ ያላቸው መምህራን</h4>
                <p className="text-sm text-slate-600 leading-relaxed">በመንፈሳዊ ትምህርት የዳበረ ልምድ ባላቸው መምህራን የሚሰጥ ትምህርት።</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-7 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 flex items-start space-x-4 space-x-reverse transition-all hover:border-amber-500/40">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200 shadow-sm">✓</div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg mb-1.5">የተለያዩ የዕድሜ ክፍሎች</h4>
                <p className="text-sm text-slate-600 leading-relaxed">ከህፃናት እስከ ወጣቶች ለሁሉም ተስማሚ የሆኑ የትምህርት መርሃ ግብሮች።</p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-7 rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-200/50 flex items-start space-x-4 space-x-reverse transition-all hover:border-amber-500/40">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg shrink-0 border border-amber-200 shadow-sm">✓</div>
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
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
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
                to="/register-regular"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-blue-900/20 transition-all"
              >
                መደበኛ (Regular)
              </Link>

              <Link
                to="/register-distance"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 py-3.5 rounded-2xl font-bold shadow-md shadow-amber-500/20 transition-all"
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



