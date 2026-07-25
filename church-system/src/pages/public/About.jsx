// import React from 'react';

// const About = () => (
//   <div className="max-w-4xl mx-auto py-16 px-4">
//     <h1 className="text-3xl font-bold text-slate-800 mb-6">ስለ እኛ</h1>
//     <p className="text-slate-600 leading-relaxed">
//       ተክለሳዊሮስ ሰንበት ትምህርት ቤት ከልጆች እስከ አዋቂዎች ድረስ የመጽሐፍ ቅዱስ ትምህርት እና መንፈሳዊ ሥልጠና የሚሰጥበት ተቋም ነው።
//       በየሳምንቱ በሚካሄደው ትምህርት ተማሪዎች የእግዚአብሔርን ቃል በጥልቀት እንዲማሩ እና በሕይወታቸው እንዲተገብሩ ይበረታታሉ።
//     </p>
//   </div>
// );

// export default About;

import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header / Intro Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle Background Accent Circle */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              ስለ ሰንበት ትምህርት ቤታችን
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              ስለ እኛ
            </h1>
            <p className="text-slate-200 text-lg sm:text-xl leading-relaxed font-light">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት ከልጆች እስከ አዋቂዎች ድረስ የመጽሐፍ ቅዱስ ትምህርት እና መንፈሳዊ ሥልጠና የሚሰጥበት ተቋም ነው። 
              በየሳምንቱ በሚካሄደው ትምህርት ተማሪዎች የእግዚአብሔርን ቃል በጥልቀት እንዲማሩ እና በሕይወታቸው እንዲተገብሩ ይበረታታሉ።
            </p>
          </div>
        </section>

        {/* Objectives Grid Section */}
        <section className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Our Objectives */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">ዓላማችን</h2>
            <p className="text-slate-600 leading-relaxed">
              የተከታዮቻችንን መንፈሳዊ እድገት ማፋጠን፣ በመጽሐፍ ቅዱሳዊ ዕውቀት ማበልፀግ እና በክርስቲያናዊ ምግባር የታነፀ ትውልድ ለቤተክርስቲያንና ለሀገር ማበርከት የዋና ዓላማችን አካል ነው።
            </p>
          </div>

          {/* Card 2: Community & Fellowship */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">ማህበራዊ ህይወት</h2>
            <p className="text-slate-600 leading-relaxed">
              ከትምህርቱ ባሻገር ተማሪዎች አርስ በእርሳቸው በፍቅርና በአንድነት የሚዛመዱበት፣ በበጎ አድራጎት ስራዎች የሚሳተፉበትና መንፈሳዊ ወንድማማችነትን የሚያጠናክሩበት መድረክ ነው።
            </p>
          </div>

        </section>

        {/* Programs / What We Offer */}
        <section className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">አገልግሎቶቻችን እና መርሃ ግብሮቻችን</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            
            <div className="border-r-0 sm:border-r border-slate-100 pr-0 sm:pr-4">
              <h3 className="font-semibold text-lg text-slate-800 mb-2 text-emerald-600">የሕፃናት ክፍል</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ለህፃናት ተስማሚ በሆኑ የመዝሙር፣ የቅዱሳን ታሪክ እና የስዕል ትምህርቶች የታጀበ መርሃ ግብር።
              </p>
            </div>

            <div className="border-r-0 sm:border-r border-slate-100 pr-0 sm:pr-4">
              <h3 className="font-semibold text-lg text-slate-800 mb-2 text-emerald-600">የወጣቶች ክፍል</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                የመጽሐፍ ቅዱስ ጥናት፣ የነገረ-መለኮት መሰረቶች እና የወጣቶች ወቅታዊ ጥያቄዎች ምላሽ የሚሰጥበት ክፍል::
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-slate-800 mb-2 text-emerald-600">የአዋቂዎች ክፍል</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ጥልቀት ያለው የመጽሐፍ ቅዱስ ጥናት እና የቤተክርስቲያን ታሪክና ስርዓት ትምህርቶች።
              </p>
            </div>

          </div>
        </section>

        {/* Closing Banner */}
        <div className="text-center py-6">
          <p className="text-slate-500 text-sm">
            «ህፃንን በቦታው አሳድገው፤ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» — ምሳሌ 22:6
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;