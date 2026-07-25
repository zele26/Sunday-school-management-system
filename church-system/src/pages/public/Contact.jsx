// import React from 'react';

// const Contact = () => (
//   <div className="max-w-4xl mx-auto py-16 px-4">
//     <h1 className="text-3xl font-bold text-slate-800 mb-6">ያግኙን</h1>
//     <p className="text-slate-600">ስልክ: 0912-345678</p>
//     <p className="text-slate-600">ኢሜይል: info@sundayschool.et</p>
//     <p className="text-slate-600">አድራሻ: ተክለሳዊሮስ ቤተክርስቲያን፣ አዲስ አበባ</p>
//   </div>
// );

// export default Contact;

import React from 'react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle Background Blur Accent */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              ግንኙነት ያድርጉ
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              ያግኙን
            </h1>
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
              ጥያቄ፣ አስተያየት ወይም ለሰንበት ትምህርት ቤታችን ተጨማሪ መረጃ ለማግኘት ከታች ባሉት የመገናኛ ዘዴዎች ይጠቀሙ።
            </p>
          </div>
        </section>

        {/* Contact Info Cards & Form Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Details (1/3 Width on Large Screens) */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Phone Card */}
            <a 
              href="tel:0912345678"
              className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">ስልክ ቁጥር</h3>
                  <p className="text-slate-800 font-medium text-lg dir-ltr mt-0.5">0912-345678</p>
                </div>
              </div>
            </a>

            {/* Email Card */}
            <a 
              href="mailto:info@sundayschool.et"
              className="block bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">ኢሜይል</h3>
                  <p className="text-slate-800 font-medium text-base mt-0.5">info@sundayschool.et</p>
                </div>
              </div>
            </a>

            {/* Address Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">አድራሻ</h3>
                  <p className="text-slate-800 font-medium text-base mt-0.5 leading-relaxed">
                    ተክለሳዊሮስ ቤተክርስቲያን፣ አዲስ አበባ
                  </p>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-slate-100/70 p-6 rounded-2xl border border-slate-200/60">
              <h4 className="font-semibold text-slate-800 mb-2">የአገልግሎት ሰዓት</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                እሑድ፡ ከጠዋቱ 2:00 - 6:00<br />
                ቅዳሜ፡ ከሰዓት 8:00 - 11:00
              </p>
            </div>

          </div>

          {/* Contact Form Section (2/3 Width on Large Screens) */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">መልእክት ይላኩልን</h2>
            <p className="text-slate-500 text-sm mb-6">
              የሚከተለውን ፎርም በመሙላት ጥያቄዎትን ወይም አስተያየትዎን ይላኩልን።
            </p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ስም</label>
                  <input 
                    type="text" 
                    placeholder="ሙሉ ስምዎ" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ስልክ ቁጥር</label>
                  <input 
                    type="tel" 
                    placeholder="09..." 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ኢሜይል</label>
                <input 
                  type="email" 
                  placeholder="example@mail.com" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">መልእክት</label>
                <textarea 
                  rows="4" 
                  placeholder="መልእክትዎን እዚህ ይጻፉ..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 transform active:scale-95"
              >
                መልእክት ላክ
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;