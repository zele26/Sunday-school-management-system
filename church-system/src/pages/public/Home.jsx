// src/pages/public/Home.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../../assets/Lidetachurch.jpg';

const Home = () => {
  const [showRegOptions, setShowRegOptions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* Hero Section */}
      <section 
        className="relative min-h-[85vh] flex items-center justify-center bg-cover bg-center py-20 px-4" 
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* Dark Overlay with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/90" />

        <div className="relative z-10 max-w-4xl mx-auto text-center text-white space-y-6">
          <span className="inline-block bg-amber-500/20 text-amber-300 border border-amber-500/30 text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm shadow-inner">
            እንኳን ደህና መጡ!
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            ተክለሳዊሮስ ሰንበት ትምህርት ቤት
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-200 font-light leading-relaxed">
            የሕፃናትና ወጣቶች መንፈሳዊ ትምህርት ማዕከል — በሃይማኖትና በምግባር የታነጸ ትውልድ እንገነባለን።
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Register button – opens modal */}
            <button
              onClick={() => setShowRegOptions(true)}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-emerald-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              ይመዝገቡ
            </button>

            <Link 
              to="/login" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              ይግቡ
            </Link>
          </div>
        </div>
      </section>

      {/* Vision / Mission / Values Section */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Vision */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">ራዕያችን</h3>
            <p className="text-slate-600 leading-relaxed">
              ማኅበረሰቡን በእግዚአብሔር ቃልና በኦርቶዶክሳዊት ተዋሕዶ ቤተ ክርስቲያን ስርዓት ማነጽ።
            </p>
          </div>

          {/* Mission */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">ተልዕኳችን</h3>
            <p className="text-slate-600 leading-relaxed">
              ለሁሉም የዕድሜ ክልል ጥራት ያለውና ተደራሽ የሆነ የሰንበት ትምህርት አገልግሎት መስጠት።
            </p>
          </div>

          {/* Values */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center group">
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">እሴቶቻችን</h3>
            <p className="text-slate-600 leading-relaxed">
              እምነት፣ ፍቅር፣ አንድነት፣ ትህትና እና ታማኝነት።
            </p>
          </div>
        </div>
      </section>

      {/* Additional Amharic Content Section */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">ለምን እኛን ይመርጣሉ?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12">
            በሰንበት ትምህርት ቤታችን ህፃናትና ወጣቶች በመንፈሳዊ ዕውቀትና በበጎ ምግባር ታንፀው እንዲያድጉ ምቹ ሁኔታዎችን አመቻችተናል።
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-right">
            <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex items-start space-x-4 space-x-reverse">
              <div className="text-emerald-600 text-2xl font-bold">✓</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg mb-1">ተሞክሮ ያላቸው መምህራን</h4>
                <p className="text-sm text-slate-600">በመንፈሳዊ ትምህርት የዳበረ ልምድ ባላቸው መምህራን የሚሰጥ ትምህርት።</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex items-start space-x-4 space-x-reverse">
              <div className="text-emerald-600 text-2xl font-bold">✓</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg mb-1">የተለያዩ የዕድሜ ክፍሎች</h4>
                <p className="text-sm text-slate-600">ከህፃናት እስከ ወጣቶች ለሁሉም ተስማሚ የሆኑ የትምህርት መርሃ ግብሮች።</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm flex items-start space-x-4 space-x-reverse">
              <div className="text-emerald-600 text-2xl font-bold">✓</div>
              <div>
                <h4 className="font-semibold text-slate-800 text-lg mb-1">መንፈሳዊና ማህበራዊ እንቅስቃሴዎች</h4>
                <p className="text-sm text-slate-600">መዝሙር፣ ጉዞዎችና ማህበራዊ አገልግሎቶች።</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Choice Modal */}
      {showRegOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              ምዝገባ አይነት ይምረጡ
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Regular (መደበኛ) ወይም Distance (ርቀት) ተማሪ ምዝገባ ይምረጡ
            </p>

            <div className="space-y-3">
              <Link
                to="/register-regular"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition"
              >
                መደበኛ (Regular)
              </Link>

              <Link
                to="/register-distance"
                onClick={() => setShowRegOptions(false)}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
              >
                ርቀት (Distance)
              </Link>
            </div>

            <button
              onClick={() => setShowRegOptions(false)}
              className="mt-4 text-sm text-slate-500 underline hover:text-slate-800"
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