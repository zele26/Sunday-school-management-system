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
import { Bell, Calendar, AlertCircle } from 'lucide-react';

const announcements = [
  { title: 'የ2026/2027 ትምህርት ዓመት መጀመሪያ', date: '2026-09-15' },
  { title: 'የልጆች የጸሎት ቀን', date: '2026-10-02' },
];

const PublicAnnouncements = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Hero Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/80 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-50/60 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              ወቅታዊ መረጃዎች
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
              ማስታወቂያዎች
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
              ከሰንበት ትምህርት ቤታችን የሚወጡ አዳዲስ ማስታወቂያዎችን፣ የመርሃ ግብር ለውጦችን እና አስፈላጊ መረጃዎችን እዚህ ያገኛሉ።
            </p>
          </div>
        </section>

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.map((a) => (
            <div 
              key={a.title} 
              className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="w-12 h-12 bg-blue-50 text-[#1657b8] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#1657b8] group-hover:text-white transition-colors duration-300 border border-blue-100 shadow-sm">
                  <Bell className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-[#1657b8] transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>ቀን:</span>
                    <span className="font-bold text-slate-700">{a.date}</span>
                  </p>
                </div>
              </div>

              <div className="sm:self-center">
                <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-400/15 border border-amber-400/30 px-3.5 py-1.5 rounded-xl">
                  ቀጣይ መርሃ-ግብር
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Notice Callout */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-2 shadow-sm">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-[#1657b8] mb-1">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
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