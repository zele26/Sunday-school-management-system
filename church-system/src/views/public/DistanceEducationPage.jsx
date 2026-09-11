import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, FeatureCard, Badge } from '../../components/ui';

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
    description: 'የወንጌላት ጥልቅ ትንታኔ፣ የቅዱስ ጳውሎስ ሐዋርያዊ አገልግሎትና መልእክታት፣ ምስጢራተ ቤተክርስቲያን እና የቅዳሴ ትርጓሜ የሚዳሰስበት ዙር ነው።',
    courses: [
      { name: 'የሐዲስ ኪዳን ጥናት (New Testament Survey)', hours: '60 ሰዓታት', icon: '📖' },
      { name: 'ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ (St. Paul & Apostolic Ministry)', hours: '50 ሰዓታት', icon: '📜' },
      { name: 'ምስጢራተ ቤተክርስቲያን (Sacraments of the Church)', hours: '45 ሰዓታት', icon: '🕯️' },
      { name: 'የቅዳሴና የጸሎት ትርጓሜ (Liturgy & Worship)', hours: '40 ሰዓታት', icon: '⛪' },
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50/60 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none -ml-24 -mb-24"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span>🌐 ኦፊሴላዊ የርቀት ትምህርት መድረክ</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ <br />
              <span className="text-[#1657b8] dark:text-blue-400">
                የርቀት ሃይማኖታዊ ትምህርት
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              ባሉበት ሆነው የመጽሐፍ ቅዱስን፣ የነገረ መለኮትን፣ የቤተክርስቲያን ታሪክን እና ሥርዓትን በሊቃውንት መምህራን የተዘጋጁ የበለጸጉ የትምህርት ሞጁሎችን በዘመናዊ የኦንላይን ፖርታል ይማሩ።
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/register-distance"
                className="px-8 py-4 bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-base flex items-center gap-2.5"
              >
                <span>አሁኑኑ ይመዝገቡ (Enroll Now)</span>
                <span className="text-lg">➔</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:opacity-90 text-slate-950 font-black rounded-2xl shadow-sm hover:shadow-md transition-all text-base flex items-center gap-2"
              >
                <span>ወደ መማሪያ ፖርታል (Student Portal)</span>
                <span>🔐</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 text-center lg:text-left">
              <div>
                <p className="text-2xl font-black text-[#1657b8] dark:text-blue-400">4 ባቾች</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">የተሟላ ሥርዓተ ትምህርት</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">በራስ ምቹ ሰዓት የሚጠና</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#1657b8] dark:text-blue-400">ዲጂታል</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">ኦፊሴላዊ የምስክር ወረቀት</p>
              </div>
            </div>
          </div>

          {/* Right Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <Card variant="default" padding="lg" className="space-y-6 w-full max-w-md relative">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-400 text-slate-950 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm">
                    ⛪
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">ተክለ ሳዊሮስ ሰንበት ት/ቤት</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Distance Education Center</p>
                  </div>
                </div>
                <Badge variant="gold" size="sm">
                  ክፍት ነው
                </Badge>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-3.5">
                {[
                  { icon: '🎧', title: 'የድምፅና የቪዲዮ ትምህርቶች', desc: 'በማንኛውም ሰዓትና ቦታ የሚደመጡ' },
                  { icon: '📑', title: 'የተሟሉ የፒዲኤፍ ሞጁሎች', desc: 'ሊወርዱ የሚችሉ የጥናት ማስታወሻዎች' },
                  { icon: '📝', title: 'የኦንላይን ፈተናዎችና ምዘናዎች', desc: 'ቀጥታ ውጤትና የማረጋገጫ ግብረ-መልስ' },
                  { icon: '👨‍🏫', title: 'የመምህራን ቀጥታ ክትትል', desc: 'ጥያቄና መልስ እንዲሁም መንፈሳዊ ምክር' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl p-1 bg-white dark:bg-slate-700 rounded-xl shadow-xs">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/register-distance"
                  className="w-full py-3.5 bg-[#1657b8] hover:bg-[#124796] text-white font-bold rounded-2xl transition-colors text-center text-sm shadow-sm block"
                >
                  የተማሪነት ምዝገባ ጀምር ➔
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#1657b8] dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 font-bold rounded-full text-xs uppercase tracking-wider">
            የትምህርት ጉዞዎ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            የርቀት ትምህርቱ እንዴት ይሰራል?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
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
              iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 border-blue-100 dark:border-blue-900',
            },
            {
              step: '02',
              title: 'ሞጁሎችን ያግኙ',
              desc: 'ወደ ተማሪ ፖርታል በመግባት የድምፅ ትምህርቶችን፣ ቪዲዮዎችን እና የንባብ ማቴሪያሎችን በምቹ ሰዓት ያንብቡ።',
              icon: '📚',
              iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
            },
            {
              step: '03',
              title: 'ፈተናዎችን ይውሰዱ',
              desc: 'በየሳምንቱና በየምዕራፉ የሚሰጡ ፈተናዎችንና የቤት ሥራዎችን በፖርታሉ በቀላሉ ሰርተው ያስገቡ።',
              icon: '📝',
              iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 border-blue-100 dark:border-blue-900',
            },
            {
              step: '04',
              title: 'ይመረቁና ይሰርተፊኬት ይውሰዱ',
              desc: 'የባችዎን ትምህርት ሲያጠናቅቁ በደብሩ የታተመ ኦፊሴላዊ የዲፕሎማ የምስክር ወረቀት ይቀበሉ።',
              icon: '🎓',
              iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
            },
          ].map((item, idx) => (
            <FeatureCard
              key={idx}
              step={item.step}
              icon={item.icon}
              iconBg={item.iconBg}
              title={item.title}
              description={item.desc}
            />
          ))}
        </div>
      </section>

      {/* Curriculum & Batches Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 font-bold rounded-full text-xs uppercase tracking-wider">
              ሥርዓተ ትምህርት (Curriculum)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              የ4 ዓመታት የጥናት መርሃ ግብር
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              ከመሠረታዊ እስከ ጥልቅ የነገረ መለኮትና የቤተክርስቲያን ቀኖና ጥናቶች የተዋቀረ።
            </p>
          </div>

          {/* Batch Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-3xl mx-auto border border-slate-200 dark:border-slate-700">
            {batchesData.map((b, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedBatch(idx)}
                className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all text-center ${selectedBatch === idx
                    ? 'bg-[#1657b8] text-white shadow-sm font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700'
                  }`}
              >
                {b.batch}
              </button>
            ))}
          </div>

          {/* Active Batch Showcase Card */}
          <Card variant="default" padding="lg" className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div>
                <Badge variant="gold" size="sm">
                  {batchesData[selectedBatch].badge}
                </Badge>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {batchesData[selectedBatch].title}
                </h3>
              </div>
              <Link
                href="/register-distance"
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-colors"
              >
                ይመዝገቡ ➔
              </Link>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {batchesData[selectedBatch].description}
            </p>

            {/* Courses in this batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {batchesData[selectedBatch].courses.map((course, cIdx) => (
                <div
                  key={cIdx}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs">{course.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{course.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{course.hours}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#1657b8] dark:text-blue-400 font-bold">የተሟላ ሞጁል</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* 🌟 STUDENT LIFE & GRADUATION SHOWCASE */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3.5 py-1 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 font-bold rounded-full text-xs uppercase tracking-wider">
            የተማሪዎች ገጽታና ምርቃት
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            የሰንበት ትምህርት ቤት ሕይወት በምስል
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            ትምህርታቸውን ያጠናቀቁ ተማሪዎች የምስክር ወረቀት አሰጣጥና የመንፈሳዊ መድረክ ትዕይንቶች
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm group">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src="/church-photos/photo12.png"
                alt="የምርቃት ሥነ-ሥርዓት"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                🎓 ይፋዊ የምርቃት ሥነ-ሥርዓት
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">የዲፕሎማ የምስክር ወረቀት አሰጣጥ</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                የ 4 ዓመታት የርቀትና የመደበኛ ትምህርታቸውን ላጠናቀቁ ተማሪዎች በደብሩ አስተዳደር የሚሰጥ ይፋዊ ሰርተፊኬት።
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm group">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src="/church-photos/photo6.png"
                alt="የመንፈሳዊ መጻሕፍትና ትምህርት"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                📚 ጥራት ያላቸው ሞጁሎች
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">የተሟሉ የትምህርት ማስታወሻዎች</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                በሊቃውንተ ቤተክርስቲያን የተዘጋጁ ጥልቀት ያላቸው የፒዲኤፍ፣ የድምፅና የቪዲዮ ትምህርቶች።
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm group">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src="/church-photos/photo16.png"
                alt="የአባቶች ቡራኬ"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                ✝️ የአባቶች ቡራኬና መመሪያ
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">ቀጣይነት ያለው መንፈሳዊ ምክር</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                በቀጥታ ከአገልጋይ አባቶችና መምህራን ጋር የሚደረግ የጥያቄና መልስ እንዲሁም የመንፈሳዊ ህይወት መመሪያ።
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 font-bold rounded-full text-xs uppercase tracking-wider">
            ተደጋጋሚ ጥያቄዎች (FAQs)
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ስለ ርቀት ትምህርቱ የተለመዱ ጥያቄዎች
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, fIdx) => (
            <Card
              key={fIdx}
              variant="default"
              padding="none"
              className="overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm sm:text-base"
              >
                <span>{faq.q}</span>
                <span className="text-xl text-slate-400 ml-4">
                  {openFaq === fIdx ? '−' : '+'}
                </span>
              </button>
              {openFaq === fIdx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 bg-slate-50/50 dark:bg-slate-800/30">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            የመንፈሳዊ እውቀት ጉዞዎን ዛሬውኑ ይጀምሩ!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            በዓለም ዙሪያ የሚገኙ በሺዎች የሚቆጠሩ ኦርቶዶክሳውያን ተማሪዎችን ይቀላቀሉ።
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/register-distance"
              className="px-8 py-4 bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-base"
            >
              አሁኑኑ ይመዝገቡ (Register for Distance) ➔
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:opacity-90 text-slate-950 font-black rounded-2xl shadow-sm hover:shadow-md transition-all text-base"
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

