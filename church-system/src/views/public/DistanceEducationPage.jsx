'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, FeatureCard, Badge } from '../../components/ui';
import { useLanguage } from '../../hooks/useLanguage';

const DistanceEducationPage = () => {
  const { t, isAmharic } = useLanguage();
  const [selectedBatch, setSelectedBatch] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const batchesData = [
    {
      batch: isAmharic ? 'ዙር 1 (የመጀመሪያ ዓመት)' : 'Batch 1 (Year 1)',
      title: isAmharic
        ? 'የነገረ መለኮት እና የብሉይ ኪዳን መሠረቶች'
        : 'Foundations of Theology & Old Testament',
      badge: isAmharic ? 'መሠረታዊ' : 'Foundational',
      description: isAmharic
        ? 'በዚህ ዙር ተማሪዎች የኦርቶዶክስ ተዋሕዶ እምነት መሠረታዊ አስተምህሮዎችን፣ የብሉይ ኪዳን መጻሕፍትን ታሪክ እና የመጀመሪያውን የክርስትና ሕይወት ሥርዓት ይማራሉ።'
        : 'In this batch, students explore core Orthodox Tewahedo theological dogmas, Old Testament surveys, and early Christian ethical life.',
      courses: [
        {
          name: isAmharic ? 'ነገረ መለኮት እና ዶግማ ፩' : 'Theology & Dogma I',
          hours: isAmharic ? '45 ሰዓታት' : '45 Hours',
          icon: '✝️',
        },
        {
          name: isAmharic ? 'የብሉይ ኪዳን ጥናት' : 'Old Testament Studies',
          hours: isAmharic ? '60 ሰዓታት' : '60 Hours',
          icon: '📜',
        },
        {
          name: isAmharic ? 'የቤተክርስቲያን ታሪክ ፩' : 'Church History I',
          hours: isAmharic ? '40 ሰዓታት' : '40 Hours',
          icon: '🏛️',
        },
        {
          name: isAmharic ? 'የክርስትና ሥነ ምግባር' : 'Christian Morals & Ethics',
          hours: isAmharic ? '30 ሰዓታት' : '30 Hours',
          icon: '🕊️',
        },
      ],
    },
    {
      batch: isAmharic ? 'ዙር 2 (ሁለተኛ ዓመት)' : 'Batch 2 (Year 2)',
      title: isAmharic
        ? 'የሐዲስ ኪዳን እና የሥርዓተ ቤተክርስቲያን ጥናት'
        : 'New Testament & Liturgical Canons',
      badge: isAmharic ? 'መካከለኛ' : 'Intermediate',
      description: isAmharic
        ? 'የወንጌላት ጥልቅ ትንታኔ፣ የቅዱስ ጳውሎስ ሐዋርያዊ አገልግሎትና መልእክታት፣ ምስጢራተ ቤተክርስቲያን እና የቅዳሴ ትርጓሜ የሚዳሰስበት ዙር ነው።'
        : 'Deep exegesis of the Four Gospels, Pauline epistles, the Seven Sacred Sacraments, and Divine Liturgy mysteries.',
      courses: [
        {
          name: isAmharic ? 'የሐዲስ ኪዳን ጥናት' : 'New Testament Exegesis',
          hours: isAmharic ? '60 ሰዓታት' : '60 Hours',
          icon: '📖',
        },
        {
          name: isAmharic
            ? 'ቅዱስ ጳውሎስና ሐዋርያዊ አገልግሎቱ'
            : 'St. Paul & Apostolic Epistles',
          hours: isAmharic ? '50 ሰዓታት' : '50 Hours',
          icon: '📜',
        },
        {
          name: isAmharic ? 'ምስጢራተ ቤተክርስቲያን' : 'Sacraments of the Church',
          hours: isAmharic ? '45 ሰዓታት' : '45 Hours',
          icon: '🕯️',
        },
        {
          name: isAmharic ? 'የቅዳሴና የጸሎት ትርጓሜ' : 'Divine Liturgy & Prayer Insights',
          hours: isAmharic ? '40 ሰዓታት' : '40 Hours',
          icon: '⛪',
        },
      ],
    },
    {
      batch: isAmharic ? 'ዙር 3 (ሦስተኛ ዓመት)' : 'Batch 3 (Year 3)',
      title: isAmharic
        ? 'የአበው ትምህርት እና የሥነ መለኮት ጥልቀት'
        : 'Patristics, Mariology & Advanced Studies',
      badge: isAmharic ? 'ከፍተኛ' : 'Advanced',
      description: isAmharic
        ? 'የቀደምት የቤተክርስቲያን አባቶች አስተምህሮ፣ ነገረ ማርያም፣ እና የሃይማኖት አበው ትምህርት የሚቀርብበት ዙር።'
        : 'Patristic writings of the Holy Fathers, Mariology (Theotokos studies), and spiritual homiletics.',
      courses: [
        {
          name: isAmharic ? 'ነገረ ማርያም' : 'Mariology (Theotokos)',
          hours: isAmharic ? '40 ሰዓታት' : '40 Hours',
          icon: '👑',
        },
        {
          name: isAmharic ? 'ትምህርተ አበው' : 'Patristics (Holy Fathers)',
          hours: isAmharic ? '50 ሰዓታት' : '50 Hours',
          icon: '📜',
        },
        {
          name: isAmharic ? 'የመጽሐፍ ቅዱስ አፈታት ስልት' : 'Biblical Hermeneutics',
          hours: isAmharic ? '45 ሰዓታት' : '45 Hours',
          icon: '🔍',
        },
        {
          name: isAmharic
            ? 'የስብከትና የሐዋርያዊ አገልግሎት ጥበብ'
            : 'Apostolic Preaching & Homiletics',
          hours: isAmharic ? '35 ሰዓታት' : '35 Hours',
          icon: '🗣️',
        },
      ],
    },
    {
      batch: isAmharic ? 'ዙር 4 (አራተኛ ዓመት / ማጠቃለያ)' : 'Batch 4 (Year 4 / Capstone)',
      title: isAmharic
        ? 'የቀኖና ቤተክርስቲያን እና የመመረቂያ ጥናት'
        : 'Ecclesiastical Law, Apologetics & Thesis',
      badge: isAmharic ? 'ማጠቃለያ / ተመራቂ' : 'Capstone / Graduate',
      description: isAmharic
        ? 'የቀኖና መጻሕፍት ጥናት፣ የዘመኑ ጥያቄዎችና ኦርቶዶክሳዊ መልሶች እንዲሁም የማጠቃለያ የምርምር ጽሑፍ ዝግጅት።'
        : 'Study of Fetha Negest, church canons, modern apologetics, and completion of the graduation research thesis.',
      courses: [
        {
          name: isAmharic
            ? 'ፍትሐ ነገሥት እና ቀኖና ቤተክርስቲያን'
            : 'Fetha Negest & Church Canons',
          hours: isAmharic ? '50 ሰዓታት' : '50 Hours',
          icon: '⚖️',
        },
        {
          name: isAmharic ? 'አንቀጸ ሃይማኖትና የንጽጽር ጥናት' : 'Comparative Theology & Apologetics',
          hours: isAmharic ? '45 ሰዓታት' : '45 Hours',
          icon: '🛡️',
        },
        {
          name: isAmharic ? 'የመመረቂያ ጽሑፍና የምርምር ሥራ' : 'Graduation Thesis & Capstone Project',
          hours: isAmharic ? '60 ሰዓታት' : '60 Hours',
          icon: '🎓',
        },
      ],
    },
  ];

  const faqs = [
    {
      q: isAmharic
        ? 'የርቀት ትምህርቱ እንዴት ነው የሚሰጠው?'
        : 'How is the distance education delivered?',
      a: isAmharic
        ? 'ትምህርቱ ሙሉ በሙሉ በበይነመረብ በኩል በድምፅ፣ በቪዲዮ እና በተሟሉ የትምህርት ሞጁሎች የሚቀርብ ሲሆን ተማሪዎች በራሳቸው ጊዜና ምቹ ሰዓት ይማራሉ።'
        : 'Instruction is delivered 100% online through comprehensive audio lectures, curated video lessons, and interactive PDF modules accessible at your self-paced schedule.',
    },
    {
      q: isAmharic
        ? 'ፈተናዎችና የቤት ሥራዎች እንዴት ይወሰዳሉ?'
        : 'How are quizzes and assignments conducted?',
      a: isAmharic
        ? 'በየምዕራፉ መጨረሻ ላይ በመማሪያ መድረኩ በኩል አጫጭር ፈተናዎች እና የጽሑፍ የቤት ሥራዎች ይሰጣሉ። ውጤትዎም ወዲያውኑ ይታወቃል።'
        : 'At the end of each module, short online assessments and written assignments are submitted directly through the LMS portal with instant grading feedback.',
    },
    {
      q: isAmharic
        ? 'ትምህርቱን ሲያጠናቅቁ ምን ዓይነት ማስረጃ ይሰጣል?'
        : 'What credentials are provided upon graduation?',
      a: isAmharic
        ? 'እያንዳንዱን ዙር እና አጠቃላይ የ4 ዓመቱን መርሃ ግብር ያጠናቀቁ ተማሪዎች በሰንበት ትምህርት ቤቱ እና በደብሩ አስተዳደር የተረጋገጠ ሕጋዊ የዲፕሎማ የምስክር ወረቀት ይሰጣቸዋል።'
        : 'Students completing the required modules and assessments earn an officially sealed diploma certificate with verifiable QR verification approved by the church administration.',
    },
    {
      q: isAmharic
        ? 'የክፍያ ሁኔታው እንዴት ነው?'
        : 'What are the tuition and module fee procedures?',
      a: isAmharic
        ? 'ለምዝገባና ለሞጁል ማዘጋጃ የሚሆን ተመጣጣኝ ክፍያ በባንክ ወይም በሞባይል ባንኪንግ ገቢ በማድረግ ደረሰኙን በምዝገባ ገጹ ላይ በቀላሉ በመጫን መመዝገብ ይችላሉ።'
        : 'A modest administrative/module fee is deposited through official designated bank accounts or mobile banking, and the deposit slip is uploaded directly through the online registration form.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 overflow-hidden py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/80 dark:bg-blue-950/20 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50/60 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none -ml-24 -mb-24"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span>🌐 {isAmharic ? 'ኦፊሴላዊ የርቀት ትምህርት መድረክ' : 'Official Distance Education LMS'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              {isAmharic ? (
                <>
                  የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ <br />
                  <span className="text-[#1657b8] dark:text-blue-400">
                    የርቀት ሃይማኖታዊ ትምህርት
                  </span>
                </>
              ) : (
                <>
                  Ethiopian Orthodox Tewahedo <br />
                  <span className="text-[#1657b8] dark:text-blue-400">
                    Distance Theological Education
                  </span>
                </>
              )}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              {isAmharic
                ? 'ባሉበት ሆነው የመጽሐፍ ቅዱስን፣ የነገረ መለኮትን፣ የቤተክርስቲያን ታሪክን እና ሥርዓትን በሊቃውንት መምህራን የተዘጋጁ የበለጸጉ የትምህርት ሞጁሎችን በዘመናዊ የኦንላይን ፖርታል ይማሩ።'
                : 'Study Biblical scriptures, Orthodox theology, church history, and sacred liturgy from anywhere through curated online modules prepared by renowned scholars.'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/register-distance"
                className="px-8 py-4 bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-base flex items-center gap-2.5"
              >
                <span>{isAmharic ? 'አሁኑኑ ይመዝገቡ' : 'Enroll Now'}</span>
                <span className="text-lg">➔</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:opacity-90 text-slate-950 font-black rounded-2xl shadow-sm hover:shadow-md transition-all text-base flex items-center gap-2"
              >
                <span>{isAmharic ? 'ወደ መማሪያ መድረክ' : 'Go to Classroom'}</span>
                <span>🔐</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 text-center lg:text-left">
              <div>
                <p className="text-2xl font-black text-[#1657b8] dark:text-blue-400">
                  {isAmharic ? '4 ዙሮች' : '4 Batches'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'የተሟላ ሥርዓተ ትምህርት' : 'Full Curriculum'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'በራስ ምቹ ሰዓት የሚጠና' : 'Self-Paced Learning'}
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#1657b8] dark:text-blue-400">
                  {isAmharic ? 'ዲጂታል' : 'Certified'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'ኦፊሴላዊ የምስክር ወረቀት' : 'Official Diploma'}
                </p>
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
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                      {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ት/ቤት')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {isAmharic ? 'የርቀት ትምህርት ማስተባበሪያ' : 'Distance Learning Office'}
                    </p>
                  </div>
                </div>
                <Badge variant="gold" size="sm">
                  {isAmharic ? 'ክፍት ነው' : 'Enrollment Open'}
                </Badge>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-3.5">
                {[
                  {
                    icon: '🎧',
                    title: isAmharic ? 'የድምፅና የቪዲዮ ትምህርቶች' : 'Audio & Video Lessons',
                    desc: isAmharic ? 'በማንኛውም ሰዓትና ቦታ የሚደመጡ' : 'Available 24/7 on-demand',
                  },
                  {
                    icon: '📑',
                    title: isAmharic ? 'የተሟሉ የፒዲኤፍ ሞጁሎች' : 'Structured PDF Modules',
                    desc: isAmharic ? 'ሊወርዱ የሚችሉ የጥናት ማስታወሻዎች' : 'Downloadable reading material',
                  },
                  {
                    icon: '📝',
                    title: isAmharic ? 'የኦንላይን ፈተናዎችና ምዘናዎች' : 'Online Quizzes & Assessments',
                    desc: isAmharic ? 'ቀጥታ ውጤትና የማረጋገጫ ግብረ-መልስ' : 'Instant score & feedback',
                  },
                  {
                    icon: '👨‍🏫',
                    title: isAmharic ? 'የመምህራን ቀጥታ ክትትል' : 'Spiritual Instructor Mentorship',
                    desc: isAmharic ? 'ጥያቄና መልስ እንዲሁም መንፈሳዊ ምክር' : 'Q&A and spiritual guidance',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-2xl p-1 bg-white dark:bg-slate-700 rounded-xl shadow-xs">
                      {item.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/register-distance"
                  className="w-full py-3.5 bg-[#1657b8] hover:bg-[#124796] text-white font-bold rounded-2xl transition-colors text-center text-sm shadow-sm block cursor-pointer"
                >
                  {isAmharic ? 'የተማሪነት ምዝገባ ጀምር ➔' : 'Start Application ➔'}
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
            {isAmharic ? 'የትምህርት ጉዞዎ' : 'Study Journey'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAmharic ? 'የርቀት ትምህርቱ እንዴት ይሰራል?' : 'How Distance Learning Works'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            {isAmharic
              ? 'ቀላል እና ግልጽ በሆነ የ4 ደረጃዎች ሂደት ኦርቶዶክሳዊ እውቀትዎን ያሳድጉ።'
              : 'Deepen your Orthodox spiritual knowledge through a clear 4-step learning pathway.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: isAmharic ? 'በኦንላይን ይመዝገቡ' : '1. Register Online',
              desc: isAmharic
                ? 'የምዝገባ ቅጹን ሞልተው የደረሰኝ ፎቶ በመጫን በአጭር ጊዜ የተማሪ መለያ ቁጥር ያግኙ።'
                : 'Fill the registration form, attach your bank receipt, and receive your Student ID.',
              icon: '✍️',
              iconBg:
                'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 border-blue-100 dark:border-blue-900',
            },
            {
              step: '02',
              title: isAmharic ? 'ሞጁሎችን ያግኙ' : '2. Access Modules',
              desc: isAmharic
                ? 'ወደ ተማሪ ፖርታል በመግባት የድምፅ ትምህርቶችን፣ ቪዲዮዎችን እና የንባብ ማቴሪያሎችን በምቹ ሰዓት ያንብቡ።'
                : 'Sign in to access curated audio lectures, streaming videos, and interactive PDF modules.',
              icon: '📚',
              iconBg:
                'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
            },
            {
              step: '03',
              title: isAmharic ? 'ፈተናዎችን ይውሰዱ' : '3. Take Assessments',
              desc: isAmharic
                ? 'በየሳምንቱና በየምዕራፉ የሚሰጡ ፈተናዎችንና የቤት ሥራዎችን በፖርታሉ በቀላሉ ሰርተው ያስገቡ።'
                : 'Complete chapter quizzes and submit assignments through the portal with instant feedback.',
              icon: '📝',
              iconBg:
                'bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 border-blue-100 dark:border-blue-900',
            },
            {
              step: '04',
              title: isAmharic ? 'ይመረቁና ይሰርተፊኬት ይውሰዱ' : '4. Graduate & Certify',
              desc: isAmharic
                ? 'የባችዎን ትምህርት ሲያጠናቅቁ በደብሩ የታተመ ኦፊሴላዊ የዲፕሎማ የምስክር ወረቀት ይቀበሉ።'
                : 'Graduate upon completion and receive an officially sealed, QR-verifiable diploma certificate.',
              icon: '🎓',
              iconBg:
                'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
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
              {isAmharic ? 'ሥርዓተ ትምህርት' : 'Curriculum Structure'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isAmharic ? 'የ4 ዓመታት የጥናት መርሃ ግብር' : '4-Year Modular Curriculum'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              {isAmharic
                ? 'ከመሠረታዊ እስከ ጥልቅ የነገረ መለኮትና የቤተክርስቲያን ቀኖና ጥናቶች የተዋቀረ።'
                : 'Sequentially structured from foundational dogmatics to advanced patristics and ecclesiastical law.'}
            </p>
          </div>

          {/* Batch Selector Pills */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-3xl mx-auto border border-slate-200 dark:border-slate-700">
            {batchesData.map((b, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedBatch(idx)}
                className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  selectedBatch === idx
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
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
              >
                {isAmharic ? 'ይመዝገቡ ➔' : 'Enroll in Batch ➔'}
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
                    <span className="text-2xl p-2 bg-white dark:bg-slate-700 rounded-xl shadow-xs">
                      {course.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {course.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{course.hours}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#1657b8] dark:text-blue-400 font-bold">
                    {isAmharic ? 'የተሟላ ሞጁል' : 'Full Module'}
                  </span>
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
            {isAmharic ? 'የተማሪዎች ገጽታና ምርቃት' : 'Student Life & Graduation'}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAmharic ? 'የሰንበት ትምህርት ቤት ሕይወት በምስል' : 'Life at Our Sunday School'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {isAmharic
              ? 'ትምህርታቸውን ያጠናቀቁ ተማሪዎች የምስክር ወረቀት አሰጣጥና የመንፈሳዊ መድረክ ትዕይንቶች'
              : 'Graduation ceremonies, instructional sessions, and spiritual fellowship'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm group">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src="/church-photos/photo12.png"
                alt={isAmharic ? 'የምርቃት ሥነ-ሥርዓት' : 'Graduation Ceremony'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                🎓 {isAmharic ? 'ይፋዊ የምርቃት ሥነ-ሥርዓት' : 'Official Graduation'}
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAmharic ? 'የዲፕሎማ የምስክር ወረቀት አሰጣጥ' : 'Accredited Diploma Conferral'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAmharic
                  ? 'የ 4 ዓመታት የርቀትና የመደበኛ ትምህርታቸውን ላጠናቀቁ ተማሪዎች በደብሩ አስተዳደር የሚሰጥ ይፋዊ ሰርተፊኬት።'
                  : 'Official parish-certified diplomas awarded to graduates who satisfy all curriculum modules.'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm group">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src="/church-photos/photo6.png"
                alt={isAmharic ? 'የመንፈሳዊ መጻሕፍትና ትምህርት' : 'Reading Materials'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                📚 {isAmharic ? 'ጥራት ያላቸው ሞጁሎች' : 'Curated Modules'}
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAmharic ? 'የተሟሉ የትምህርት ማስታወሻዎች' : 'Rich Learning Materials'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAmharic
                  ? 'በሊቃውንተ ቤተክርስቲያን የተዘጋጁ ጥልቀት ያላቸው የፒዲኤፍ፣ የድምፅና የቪዲዮ ትምህርቶች።'
                  : 'Scholarly theological notes, audio commentaries, and video seminars for every chapter.'}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm group">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src="/church-photos/photo16.png"
                alt={isAmharic ? 'የአባቶች ቡራኬ' : 'Priestly Blessings'}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute bottom-2 left-3 text-xs font-bold text-white bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                ✝️ {isAmharic ? 'የአባቶች ቡራኬና መመሪያ' : 'Patristic Blessings'}
              </span>
            </div>
            <div className="p-5 space-y-1.5">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAmharic ? 'ቀጣይነት ያለው መንፈሳዊ ምክር' : 'Continuous Spiritual Mentorship'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isAmharic
                  ? 'በቀጥታ ከአገልጋይ አባቶችና መምህራን ጋር የሚደረግ የጥያቄና መልስ እንዲሁም የመንፈሳዊ ህይወት መመሪያ።'
                  : 'Direct engagement and guidance with clergy, teachers, and senior church educators.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 font-bold rounded-full text-xs uppercase tracking-wider">
            {t('faqBadge', 'ተደጋጋሚ ጥያቄዎች')}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('faqTitle', 'ስለ ርቀት ትምህርቱ የተለመዱ ጥያቄዎች')}
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
                className="w-full p-5 text-left font-bold text-slate-900 dark:text-white flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm sm:text-base cursor-pointer"
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
            {isAmharic
              ? 'የመንፈሳዊ እውቀት ጉዞዎን ዛሬውኑ ይጀምሩ!'
              : 'Begin Your Spiritual Journey Today!'}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {isAmharic
              ? 'በዓለም ዙሪያ የሚገኙ በሺዎች የሚቆጠሩ ኦርቶዶክሳውያን ተማሪዎችን ይቀላቀሉ።'
              : 'Join thousands of Orthodox students worldwide deepening their faith.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link
              href="/register-distance"
              className="px-8 py-4 bg-[#1657b8] hover:bg-[#124796] active:opacity-90 text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-base cursor-pointer"
            >
              {isAmharic ? 'አሁኑኑ ይመዝገቡ ➔' : 'Register Now ➔'}
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:opacity-90 text-slate-950 font-black rounded-2xl shadow-sm hover:shadow-md transition-all text-base cursor-pointer"
            >
              {t('login', 'ይግቡ')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DistanceEducationPage;

