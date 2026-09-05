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
import { BookOpen, GraduationCap, Clock, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Hero Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/80 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-50/60 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              የትምህርት መርሃ-ግብር
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
              ክፍሎቻችን
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-normal leading-relaxed">
              በየደረጃው ያሉ ተማሪዎች የመጽሐፍ ቅዱስ ዕውቀትና መንፈሳዊ ብስለት እንዲያገኙ በጥንቃቄ የተዘጋጁ የትምህርት ክፍሎች።
            </p>
          </div>
        </section>

        {/* Classes Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {classList.map((c) => (
            <div 
              key={c.grade} 
              className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 bg-blue-50 text-[#1657b8] rounded-2xl flex items-center justify-center group-hover:bg-[#1657b8] group-hover:text-white transition-colors duration-300 border border-blue-100 shadow-sm">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-3.5 py-1 bg-amber-400/15 text-amber-900 rounded-full border border-amber-400/30">
                    ዕድሜ {c.age}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-[#1657b8] transition-colors">
                  {c.grade}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1657b8]">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  የጥናት ክፍለ ጊዜ
                </span>
                <span>በየሳምንቱ እሑድ →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Box */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-2 shadow-sm">
          <h3 className="text-lg font-black text-slate-900">
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