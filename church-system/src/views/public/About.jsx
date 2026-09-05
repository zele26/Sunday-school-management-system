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
import { BookOpen, Sparkles, Heart, Users, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header / Intro Section */}
        <section className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/60 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              ስለ ሰንበት ትምህርት ቤታችን
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
              ስለ <span className="text-[#1657b8]">ተክለ ሳዊሮስ</span> ሰንበት ት/ቤት
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት ከልጆች እስከ አዋቂዎች ድረስ የመጽሐፍ ቅዱስ ትምህርት እና መንፈሳዊ ሥልጠና የሚሰጥበት ተቋም ነው። 
              በየሳምንቱ በሚካሄደው ትምህርት ተማሪዎች የእግዚአብሔርን ቃል በጥልቀት እንዲማሩ እና በሕይወታቸው እንዲተገብሩ ይበረታታሉ።
            </p>
          </div>
        </section>

        {/* Objectives Grid Section */}
        <section className="grid md:grid-cols-2 gap-8">
          
          {/* Card 1: Our Objectives */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-50 text-[#1657b8] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">ዓላማችን</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              የተከታዮቻችንን መንፈሳዊ እድገት ማፋጠን፣ በመጽሐፍ ቅዱሳዊ ዕውቀት ማበልፀግ እና በክርስቲያናዊ ምግባር የታነፀ ትውልድ ለቤተክርስቲያንና ለሀገር ማበርከት የዋና ዓላማችን አካል ነው።
            </p>
          </div>

          {/* Card 2: Community & Fellowship */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-amber-100">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">ማህበራዊ ህይወት</h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              ከትምህርቱ ባሻገር ተማሪዎች አርስ በእርሳቸው በፍቅርና በአንድነት የሚዛመዱበት፣ በበጎ አድራጎት ስራዎች የሚሳተፉበትና መንፈሳዊ ወንድማማችነትን የሚያጠናክሩበት መድረክ ነው።
            </p>
          </div>

        </section>

        {/* Programs / What We Offer */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1657b8]" />
            <h2 className="text-2xl font-black text-slate-900">አገልግሎቶቻችን እና መርሃ ግብሮቻችን</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 pt-2">
            
            <div className="border-b sm:border-b-0 sm:border-r border-slate-100 pb-6 sm:pb-0 sm:pr-6 space-y-2">
              <h3 className="font-bold text-lg text-[#1657b8]">የሕፃናት ክፍል</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ለህፃናት ተስማሚ በሆኑ የመዝሙር፣ የቅዱሳን ታሪክ እና የስዕል ትምህርቶች የታጀበ መርሃ ግብር።
              </p>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-slate-100 pb-6 sm:pb-0 sm:pr-6 space-y-2">
              <h3 className="font-bold text-lg text-[#1657b8]">የወጣቶች ክፍል</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                የመጽሐፍ ቅዱስ ጥናት፣ የነገረ-መለኮት መሰረቶች እና የወጣቶች ወቅታዊ ጥያቄዎች ምላሽ የሚሰጥበት ክፍል::
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg text-[#1657b8]">የአዋቂዎች ክፍል</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                ጥልቀት ያለው የመጽሐፍ ቅዱስ ጥናት እና የቤተክርስቲያን ታሪክና ስርዓት ትምህርቶች።
              </p>
            </div>

          </div>
        </section>

        {/* Closing Banner */}
        <div className="text-center py-6 bg-amber-50/60 border border-amber-200/60 rounded-2xl p-6">
          <p className="text-slate-700 text-sm font-semibold italic">
            «ህፃንን በቦታው አሳድገው፤ በሸመገለም ጊዜ ከእርሱ ፈቀቅ አይልም።» — ምሳሌ 22:6
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;