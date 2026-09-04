import React, { useState } from 'react';
import Link from 'next/link';

const batchesData = [
  {
    batch: 'Batch 1 (የመጀመሪያ ዓመት)',
    title: 'የነገረ መለኮት እና የብሉይ ኪዳን መሠረቶች',
    badge: 'መሠረታዊ',
    description: 'በዚህ ዙር ተማሪዎች የኦርቶዶክስ ተዋሕዶ እምነት መሠረታዊ አስተምህሮዎችን፣ የብሉይ ኪዳን መጻሕፍትን ታሪክ እና የመጀመሪያውን የክርስትና ሕይወት ሥርዓት ይማራሉ።',
    courses: [
      { name: 'ነገረ መለኮት (Theology & Dogma I)', hours: '45 ሰዓታት', icon: '✝️' },
      { name: 'የብሉይ ኪዳን ጥናት (Old Testament Survey)', hours: '60 ሰዓታት', icon: '📜' },
      { name: 'የቤተክርስቲያን ታሪክ I (Church History I)', hours: '40 ሰዓታት', icon: '🏛️' },
      { name: 'የክርስትና ሥነ ምግባር (Christian Ethics)', hours: '30 ሰዓታት', icon: '🕊️' },
    ],
  },
  {
    batch: 'Batch 2 (ሁለተኛ ዓመት)',
    title: 'የሐዲስ ኪዳን እና የሥርዓተ ቤተክርስቲያን ጥናት',
    badge: 'መካከለኛ',
    description: 'የወንጌላት ጥልቅ ትንታኔ፣ የሐዋርያት መልእክታት፣ ምስጢራተ ቤተክርስቲያን እና የቅዳሴ ትርጓሜ የሚዳሰስበት ዙር ነው።',
    courses: [
      { name: 'የሐዲስ ኪዳን ጥናት (New Testament Survey)', hours: '60 ሰዓታት', icon: '📖' },
      { name: 'ምስጢራተ ቤተክርስቲያን (Sacraments of the Church)', hours: '45 ሰዓታት', icon: '🕯️' },
      { name: 'የቅዳሴና የጸሎት ትርጓሜ (Liturgy & Worship)', hours: '40 ሰዓታት', icon: '⛪' },
      { name: 'የቤተክርስቲያን ታሪክ II (Church History II)', hours: '35 ሰዓታት', icon: '📜' },
    ],
  },
  {
    batch: 'Batch 3 (ሦስተኛ ዓመት)',
    title: 'የአበው ትምህርት እና የሥነ መለኮት ጥልቀት',
    badge: 'ከፍተኛ',
    description: 'የቀደምት የቤተክርስቲያን አባቶች (Patristics) አስተምህሮ፣ ነገረ ማርያም፣ እና የሃይማኖት አበው ትምህርት የሚቀርብበት ዙር።',
    courses: [
      { name: 'ነገረ ማርያም (Mariology)', hours: '40 ሰዓታት', icon: '👑' },
      { name: 'ትምህርተ አበው (Patristics)', hours: '50 ሰዓታት', icon: '📜' },
      { name: 'የመጽሐፍ ቅዱስ አፈታት ስልት (Hermeneutics)', hours: '45 ሰዓታት', icon: '🔍' },
      { name: 'የስብከትና የሐዋርያዊ አገልግሎት ጥበብ (Homiletics)', hours: '35 ሰዓታት', icon: '🗣️' },
    ],
  },
  {
    batch: 'Batch 4 (አራተኛ ዓመት / ማጠቃለያ)',
    title: 'የቀኖና ቤተክርስቲያን እና የመመረቂያ ጥናት',
    badge: 'ማጠቃለያ / ተመራቂ',
    description: 'የቀኖና መጻሕፍት ጥናት፣ የዘመኑ ጥያቄዎችና ኦርቶዶክሳዊ መልሶች እንዲሁም የማጠቃለያ የምርምር ጽሑፍ ዝግጅት።',
    courses: [
      { name: 'ፍትሐ ነገሥት እና ቀኖና ቤተክርስቲያን (Canon Law)', hours: '50 ሰዓታት', icon: '⚖️' },
      { name: 'አንቀጸ ሃይማኖትና የንጽጽር ጥናት (Apologetics)', hours: '45 ሰዓታት', icon: '🛡️' },
      { name: 'የመመረቂያ ጽሑፍና የምርምር ሥራ (Senior Thesis)', hours: '60 ሰዓታት', icon: '🎓' },
    ],
  },
];

const faqs = [
  {
    q: 'የርቀት ትምህርቱ እንዴት ነው የሚሰጠው?',
    a: 'ትምህርቱ ሙሉ በሙሉ በበይነመረብ (Online) በኩል በድምፅ (Audio)፣ በቪዲዮ (Video lectures) እና በፒዲኤፍ (PDF modules) የሚቀርብ ሲሆን ተማሪዎች በራሳቸው ጊዜና ምቹ ሰዓት ይማራሉ።',
  },
  {
    q: 'ፈተናዎችና የቤት ሥራዎች እንዴት ይወሰዳሉ?',
    a: 'በየምዕራፉ መጨረሻ ላይ በኦንላይን ፖርታሉ በኩል አጫጭር ፈተናዎች (Online Quizzes) እና የጽሑፍ የቤት ሥራዎች (Assignments) ይሰጣሉ። ውጤትዎም ወዲያውኑ ይታወቃል።',
  },
  {
    q: 'ትምህርቱን ሲያጠናቅቁ ምን ዓይነት ማስረጃ ይሰጣል?',
    a: 'እያንዳንዱን ባች እና አጠቃላይ የ4 ዓመቱን መርሃ ግብር ያጠናቀቁ ተማሪዎች በሰንበት ትምህርት ቤቱ እና በደብሩ አስተዳደር የተረጋገጠ ሕጋዊ የዲፕሎማ የምስክር ወረቀት (Certificate) ይሰጣቸዋል።',
  },
  {
    q: 'የክፍያ ሁኔታው እንዴት ነው?',
    a: 'ለምዝገባና ለሞጁል ማዘጋጃ የሚሆን ተመጣጣኝ ክፍያ በባንክ ወይም በሞባይል ባንኪንግ ገቢ በማድረግ ደረሰኙን በምዝገባ ገጹ ላይ በቀላሉ በመጫን መመዝገብ ይችላሉ።',
  },
];

const DistanceEducationPage = () => {
  const [selectedBatch, setSelectedBatch] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-amber-400 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white overflow-hidden py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]"></div>

        {/* Glow Spheres */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span>🌐 ኦፊሴላዊ የርቀት ትምህርት መድረክ</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
              የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                የርቀት ሃይማኖታዊ ትምህርት
              </span>
            </h1>

            <p className="text-blue-100/90 text-base sm:text-lg max-w-2xl leading-relaxed">
              ባሉበት ሆነው የመጽሐፍ ቅዱስን፣ የነገረ መለኮትን፣ የቤተክርስቲያን ታሪክን እና ሥርዓትን በሊቃውንት መምህራን የተዘጋጁ የበለጸጉ የትምህርት ሞጁሎችን በዘመናዊ የኦንላይን ፖርታል ይማሩ።
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/register-distance"
                className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 active:opacity-90 text-slate-950 font-black rounded-2xl shadow-md shadow-amber-500/25 transition-colors duration-150 text-base flex items-center gap-2.5"
              >
                <span>አሁኑኑ ይመዝገቡ (Enroll Now)</span>
                <span className="text-lg">➔</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition-all text-base flex items-center gap-2"
              >
                <span>ወደ መማሪያ ፖርታል (Student Portal)</span>
                <span>🔐</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 text-center lg:text-left">
              <div>
                <p className="text-2xl font-black text-amber-400">4 ባቾች</p>
                <p className="text-xs text-blue-200">የተሟላ ሥርዓተ ትምህርት</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">100%</p>
                <p className="text-xs text-blue-200">በራስ ምቹ ሰዓት የሚጠና</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">ዲጂታል</p>
                <p className="text-xs text-blue-200">ኦፊሴላዊ የምስክር ወረቀት</p>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6 w-full max-w-md relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md">
                    ⛪
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">ደብረ ሳዊሮስ ሰንበት ት/ቤት</h3>
                    <p className="text-xs text-blue-200">Distance Education Center</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  ክፍት ነው
                </span>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-3.5">
                {[
                  { icon: '🎧', title: 'የድምፅና የቪዲዮ ትምህርቶች', desc: 'በማንኛውም ሰዓትና ቦታ የሚደመጡ' },
                  { icon: '📑', title: 'የተሟሉ የፒዲኤፍ ሞጁሎች', desc: 'ሊወርዱ የሚችሉ የጥናት ማስታወሻዎች' },
                  { icon: '📝', title: 'የኦንላይን ፈተናዎችና ምዘናዎች', desc: 'ቀጥታ ውጤትና የማረጋገጫ ግብረ-መልስ' },
                  { icon: '👨‍🏫', title: 'የመምህራን ቀጥታ ክትትል', desc: 'ጥያቄና መልስ እንዲሁም መንፈሳዊ ምክር' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <span className="text-2xl p-1 bg-white/10 rounded-xl">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title}</h4>
                      <p className="text-xs text-blue-200/80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/register-distance"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl transition-colors text-center text-sm shadow-md block"
                >
                  የተማሪነት ምዝገባ ጀምር ➔
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-xs uppercase tracking-wider">
            የትምህርት ጉዞዎ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            የርቀት ትምህርቱ እንዴት ይሰራል?
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            ቀላል እና ግልጽ በሆነ የ4 ደረጃዎች ሂደት ኦርቶዶክሳዊ እውቀትዎን ያሳድጉ።
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'በኦንላይን ይመዝገቡ',
              desc: 'የምዝገባ ቅጹን ሞልተው የደረሰኝ ፎቶ በመጫን በአጭር ጊዜ የተማሪ መለያ ቁጥር (TKD ID) ያግኙ።',
              icon: '✍️',
              color: 'from-blue-600 to-indigo-600',
            },
            {
              step: '02',
              title: 'ሞጁሎችን ያግኙ',
              desc: 'ወደ ተማሪ ፖርታል በመግባት የድምፅ ትምህርቶችን፣ ቪዲዮዎችን እና የንባብ ማቴሪያሎችን በምቹ ሰዓት ያንብቡ።',
              icon: '📚',
              color: 'from-indigo-600 to-purple-600',
            },
            {
              step: '03',
              title: 'ፈተናዎችን ይውሰዱ',
              desc: 'በየሳምንቱና በየምዕራፉ የሚሰጡ ፈተናዎችንና የቤት ሥራዎችን በፖርታሉ በቀላሉ ሰርተው ያስገቡ።',
              icon: '📝',
              color: 'from-purple-600 to-pink-600',
            },
            {
              step: '04',
              title: 'ይመረቁና ይሰርተፊኬት ይውሰዱ',
              desc: 'የባችዎን ትምህርት ሲያጠናቅቁ በደብሩ የታተመ ኦፊሴላዊ የዲፕሎማ የምስክር ወረቀት ይቀበሉ።',
              icon: '🎓',
              color: 'from-amber-500 to-yellow-500',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 transition-all space-y-4 relative overflow-hidden group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center text-2xl shadow-lg`}>
                {item.icon}
              </div>
              <span className="text-4xl font-black text-slate-100 absolute top-4 right-4 pointer-events-none group-hover:text-amber-100 transition-colors">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum & Batches Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 bg-amber-400/20 text-amber-300 font-bold rounded-full text-xs uppercase tracking-wider border border-amber-400/30">
              ሥርዓተ ትምህርት (Curriculum)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              የ4 ዓመታት የጥናት መርሃ ግብር
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              ከመሠረታዊ እስከ ጥልቅ የነገረ መለኮትና የቤተክርስቲያን ቀኖና ጥናቶች የተዋቀረ።
            </p>
          </div>

          {/* Batch Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-800/80 backdrop-blur-md rounded-2xl max-w-3xl mx-auto border border-slate-700">
            {batchesData.map((b, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedBatch(idx)}
                className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all text-center ${selectedBatch === idx
                    ? 'bg-amber-400 text-slate-950 shadow-lg font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
              >
                {b.batch}
              </button>
            ))}
          </div>

          {/* Active Batch Showcase Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-700 pb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  {batchesData[selectedBatch].badge}
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-2">
                  {batchesData[selectedBatch].title}
                </h3>
              </div>
              <Link
                href="/register-distance"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                ይመዝገቡ ➔
              </Link>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              {batchesData[selectedBatch].description}
            </p>

            {/* Courses in this batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {batchesData[selectedBatch].courses.map((course, cIdx) => (
                <div
                  key={cIdx}
                  className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-800 rounded-xl">{course.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{course.name}</h4>
                      <p className="text-xs text-slate-400">{course.hours}</p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">የተሟላ ሞጁል</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-xs uppercase tracking-wider">
            ተደጋጋሚ ጥያቄዎች (FAQs)
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            ስለ ርቀት ትምህርቱ የተለመዱ ጥያቄዎች
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => (
            <div
              key={fIdx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                className="w-full p-5 text-left font-bold text-slate-900 flex justify-between items-center hover:bg-slate-50 transition-colors text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                <span className="text-xl text-slate-400 ml-4">
                  {openFaq === fIdx ? '−' : '+'}
                </span>
              </button>
              {openFaq === fIdx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            የመንፈሳዊ እውቀት ጉዞዎን ዛሬውኑ ይጀምሩ!
          </h2>
          <p className="text-blue-100/90 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            በዓለም ዙሪያ የሚገኙ በሺዎች የሚቆጠሩ ኦርቶዶክሳውያን ተማሪዎችን ይቀላቀሉ።
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/register-distance"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:opacity-90 text-slate-950 font-black rounded-2xl shadow-md shadow-amber-400/20 transition-colors duration-150 text-base"
            >
              አሁኑኑ ይመዝገቡ (Register for Distance) ➔
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition-colors text-base"
            >
              የተማሪ መግቢያ (Student Login)
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DistanceEducationPage;
