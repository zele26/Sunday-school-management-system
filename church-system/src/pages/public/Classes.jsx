// import React from 'react';

// const classList = [
//   { grade: 'Grade 7', age: '12-13', description: 'የመጀመሪያ ደረጃ የመጽሐፍ ቅዱስ ትምህርት' },
//   { grade: 'Grade 8', age: '13-14', description: 'የክርስትና ሕይወት መሠረቶች' },
//   { grade: 'Grade 9', age: '14-15', description: 'የወንጌል ታሪክ እና ትምህርት' },
//   { grade: 'Grade 10', age: '15-16', description: 'የብሉይ ኪዳን አጠቃላይ እይታ' },
//   { grade: 'Grade 11', age: '16-17', description: 'የሐዋርያት ሥራ እና የመጀመሪያዎቹ አብያተ ክርስቲያናት' },
//   { grade: 'Grade 12', age: '17-18', description: 'የክርስትና መሪነት እና የሕይወት ዝግጅት' },
// ];

// const Classes = () => (
//   <div className="max-w-4xl mx-auto py-16 px-4">
//     <h1 className="text-3xl font-bold text-slate-800 mb-6">ክፍሎቻችን</h1>
//     <div className="grid md:grid-cols-2 gap-4">
//       {classList.map(c => (
//         <div key={c.grade} className="bg-white p-4 rounded-xl shadow border">
//           <h3 className="font-bold text-slate-700">{c.grade} ({c.age})</h3>
//           <p className="text-sm text-slate-500 mt-1">{c.description}</p>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// export default Classes;


import React from 'react';

const classList = [
  { grade: 'Grade 7', age: '12-13', description: 'የመጀመሪያ ደረጃ የመጽሐፍ ቅዱስ ትምህርት' },
  { grade: 'Grade 8', age: '13-14', description: 'የክርስትና ሕይወት መሠረቶች' },
  { grade: 'Grade 9', age: '14-15', description: 'የወንጌል ታሪክ እና ትምህርት' },
  { grade: 'Grade 10', age: '15-16', description: 'የብሉይ ኪዳን አጠቃላይ እይታ' },
  { grade: 'Grade 11', age: '16-17', description: 'የሐዋርያት ሥራ እና የመጀመሪያዎቹ አብያተ ክርስቲያናት' },
  { grade: 'Grade 12', age: '17-18', description: 'የክርስትና መሪነት እና የሕይወት ዝግጅት' },
];

const Classes = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Accent Glow Circle */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              የትምህርት መርሃ-ግብር
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              ክፍሎቻችን
            </h1>
            <p className="text-slate-300 text-base sm:text-lg font-light leading-relaxed">
              በየደረጃው ያሉ ተማሪዎች የመጽሐፍ ቅዱስ ዕውቀትና መንፈሳዊ ብስለት እንዲያገኙ በጥንቃቄ የተዘጋጁ የትምህርት ክፍሎች።
            </p>
          </div>
        </section>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {classList.map((c) => (
            <div 
              key={c.grade} 
              className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    ዕድሜ {c.age}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {c.grade}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-medium text-emerald-600">
                <span>የጥናት ክፍለ ጊዜ</span>
                <span>በየሳምንቱ እሑድ →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Box */}
        <section className="bg-slate-100/80 rounded-2xl p-6 sm:p-8 border border-slate-200/60 text-center space-y-3">
          <h3 className="text-lg font-bold text-slate-800">
            የትምህርት አሰጣጥ ስርዓታችን
          </h3>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            ትምህርቱ በንድፈ-ሀሳብ ብቻ ሳይወሰን በተግባራዊ ክርስቲያናዊ ህይወት፣ በመዝሙር እና በነፃ ውይይት የተደገፈ ነው።
          </p>
        </section>

      </div>
    </div>
  );
};

export default Classes;