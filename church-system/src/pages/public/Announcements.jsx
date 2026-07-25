// import React from 'react';

// const announcements = [
//   { title: 'የ2026/2027 ትምህርት ዓመት መጀመሪያ', date: '2026-09-15' },
//   { title: 'የልጆች የጸሎት ቀን', date: '2026-10-02' },
// ];

// const PublicAnnouncements = () => (
//   <div className="max-w-4xl mx-auto py-16 px-4">
//     <h1 className="text-3xl font-bold text-slate-800 mb-6">ማስታወቂያዎች</h1>
//     {announcements.map(a => (
//       <div key={a.title} className="bg-white p-4 rounded-xl shadow mb-3">
//         <h3 className="font-semibold text-slate-700">{a.title}</h3>
//         <p className="text-xs text-slate-500">{a.date}</p>
//       </div>
//     ))}
//   </div>
// );

// export default PublicAnnouncements;


import React from 'react';

const announcements = [
  { title: 'የ2026/2027 ትምህርት ዓመት መጀመሪያ', date: '2026-09-15' },
  { title: 'የልጆች የጸሎት ቀን', date: '2026-10-02' },
];

const PublicAnnouncements = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Accent Glow Circle */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              ወቅታዊ መረጃዎች
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              ማስታወቂያዎች
            </h1>
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
              ከሰንበት ትምህርት ቤታችን የሚወጡ አዳዲስ ማስታወቂያዎችን፣ የመርሃ ግብር ለውጦችን እና አስፈላጊ መረጃዎችን እዚህ ያገኛሉ።
            </p>
          </div>
        </section>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((a) => (
            <div 
              key={a.title} 
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    ቀን: <span className="font-medium text-slate-600">{a.date}</span>
                  </p>
                </div>
              </div>

              <div className="sm:self-center">
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg">
                  ቀጣይ መርሃ-ግብር
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Notice Callout */}
        <section className="bg-slate-100/80 rounded-2xl p-6 sm:p-8 border border-slate-200/60 text-center space-y-2">
          <h3 className="text-base font-bold text-slate-800">
            አስፈላጊ ማሳሰቢያ
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ለበለጠ መረጃ እና ለተጨማሪ ጥያቄዎች በደወል ወይም በስራ ሰዓት በግንባር በመገኘት መጠየቅ ይችላሉ።
          </p>
        </section>

      </div>
    </div>
  );
};

export default PublicAnnouncements;