'use client';

import React from 'react';
import Image from 'next/image';
import ChurchLogo from '../assets/ChurchLogo.png';
import ChurchLeftImg from '../assets/Lidetachurch.jpg';
import ChurchRightImg from '../assets/Lidetachurch2.jpg';

const VerifiableCertificate = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const defaultCourses = [
    { courseName: 'ትምህርተ ሃይማኖት', grade: 'A+', mark: 98 },
    { courseName: 'ሥነ-ፍጥረት', grade: 'A', mark: 95 },
    { courseName: 'አምስቱ አዕማደ ምስጢራት', grade: 'A', mark: 96 },
    { courseName: 'ክርስቲያናዊ ሥነ-ምግባር', grade: 'A+', mark: 99 },
    { courseName: 'ሥርዓተ ቤተ ክርስቲያን', grade: 'A', mark: 94 },
    { courseName: 'ምስጢራተ ቤተ ክርስቲያን', grade: 'A+', mark: 97 },
    { courseName: 'ነገረ ማርያም', grade: 'A+', mark: 98 },
    { courseName: 'ነገረ ክርስቶስ', grade: 'A', mark: 96 },
    { courseName: 'ነገረ ቅዱሳን', grade: 'A', mark: 95 },
    { courseName: 'መጽሐፍ ቅዱስ ጥናት ፩ (ብሉይ ኪዳን)', grade: 'A+', mark: 97 },
    { courseName: 'መጽሐፍ ቅዱስ ጥናት ፪ (ሐዲስ ኪዳን)', grade: 'A+', mark: 98 },
    { courseName: 'የቤተ ክርስቲያን ታሪክ በኢትዮጵያ', grade: 'A', mark: 96 },
    { courseName: 'የቤተ ክርስቲያን ታሪክ በዓለም መድረክ', grade: 'A', mark: 94 },
  ];

  const rawCourses = (certificate.completedCourses && certificate.completedCourses.length > 0)
    ? certificate.completedCourses
    : defaultCourses;

  const mid = Math.ceil(rawCourses.length / 2);
  const col1 = rawCourses.slice(0, mid);
  const col2 = rawCourses.slice(mid);

  const isPending = certificate.status === 'Pending';

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[96vh] overflow-y-auto shadow-2xl border border-amber-300 flex flex-col my-auto print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-[#051533] to-[#08214d] text-white flex justify-between items-center print:hidden rounded-t-3xl border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-amber-400/40 p-1 flex items-center justify-center">
              <Image src={ChurchLogo} alt="Logo" width={28} height={28} className="object-contain" style={{ width: 'auto', height: 'auto' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>ይፋዊ የሰንበት ት/ቤት የምስክር ወረቀት</span>
                {isPending && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-400/40">
                    ይሁንታ የሚጠብቅ ረቂቅ (Pending Review)
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-amber-300/90 font-serif">የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ሰንበት ትምህርት ቤት የዲፕሎማ ምስክር ወረቀት</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <span>🖨️</span>
              <span>አትም / አውርድ (Print / PDF)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Certificate Area */}
        <div className="p-4 sm:p-7 bg-[#fffdf7] flex-1 flex flex-col justify-between print:p-4">
          <div className="relative border-8 border-double border-amber-600/90 p-5 sm:p-8 rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#fffdf5] to-[#fffefc] shadow-xl text-slate-900">
            
            {/* Corner Crosses */}
            <span className="absolute top-2.5 left-3 text-amber-600 font-bold text-lg select-none">✝️</span>
            <span className="absolute top-2.5 right-3 text-amber-600 font-bold text-lg select-none">✝️</span>
            <span className="absolute bottom-2.5 left-3 text-amber-600 font-bold text-lg select-none">✝️</span>
            <span className="absolute bottom-2.5 right-3 text-amber-600 font-bold text-lg select-none">✝️</span>

            {/* Top Church Header with Sunday School Logo */}
            <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 mb-4">
              {/* Left Church Photo (Kidist Lideta) */}
              <div className="col-span-3 flex justify-start">
                <div className="p-1 bg-white border-2 border-amber-500/50 rounded-2xl shadow-xs overflow-hidden">
                  <Image
                    src={ChurchLeftImg}
                    alt="ቅድስት ልደታ ለማርያም"
                    width={100}
                    height={72}
                    className="w-18 h-14 sm:w-24 sm:h-18 object-cover rounded-xl"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                  <p className="text-[7.5px] sm:text-[8px] text-center font-bold text-amber-900 mt-0.5">ቅድስት ልደታ ለማርያም</p>
                </div>
              </div>

              {/* Center Holy Trinity Invocation, Prominent Logo & Church Title */}
              <div className="col-span-6 text-center space-y-1">
                <p className="text-[10.5px] sm:text-xs font-black text-amber-800 tracking-widest font-serif">
                  በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን
                </p>
                
                <div className="flex justify-center my-0.5">
                  <div className="p-1.5 rounded-full bg-amber-50/80 border border-amber-300/80 shadow-xs">
                    <Image
                      src={ChurchLogo}
                      alt="Sunday School Logo"
                      width={60}
                      height={60}
                      className="w-12 h-12 sm:w-15 sm:h-15 object-contain drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]"
                      style={{ width: 'auto', height: 'auto' }}
                    />
                  </div>
                </div>

                <h2 className="text-xs sm:text-sm font-black text-[#0f4c9c] font-serif leading-tight">
                  የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን
                </h2>
                <h3 className="text-xs sm:text-sm font-black text-amber-700 font-serif">
                  ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
                </h3>
              </div>

              {/* Right Church Photo (Debre Medhanit Medhanealem) */}
              <div className="col-span-3 flex justify-end">
                <div className="p-1 bg-white border-2 border-amber-500/50 rounded-2xl shadow-xs overflow-hidden">
                  <Image
                    src={ChurchRightImg}
                    alt="መድኃኔዓለም ቤተክርስቲያን"
                    width={100}
                    height={72}
                    className="w-18 h-14 sm:w-24 sm:h-18 object-cover rounded-xl"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                  <p className="text-[7.5px] sm:text-[8px] text-center font-bold text-amber-900 mt-0.5">ደብረ መድኃኒት መድኃኒዓለም</p>
                </div>
              </div>
            </div>

            {/* Diploma Title Ribbon */}
            <div className="my-2.5 text-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-5 py-1 rounded-2xl bg-gradient-to-r from-[#0f4c9c] via-[#08214d] to-[#0f4c9c] border-2 border-amber-400 shadow-xs">
                {['የ', 'ም', 'ስ', 'ክ', 'ር', '•', 'ወ', 'ረ', 'ቀ', 'ት'].map((char, idx) => (
                  <span
                    key={idx}
                    className="w-5.5 h-6.5 sm:w-6.5 sm:h-7.5 rounded-lg bg-amber-400/20 border border-amber-300/40 text-amber-300 font-serif font-black text-xs sm:text-sm flex items-center justify-center"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Recipient Header with Distinction & GPA */}
            <div className="space-y-2 my-2.5 text-xs sm:text-sm leading-relaxed">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-amber-400/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">ለ፡</span>
                  <span className="text-base sm:text-xl font-black text-[#08214d] font-serif tracking-wide">
                    {certificate.studentNameAmharic || certificate.studentName}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    (መለያ: {certificate.studentNumber})
                  </span>
                </div>

                {/* Distinction & Overall GPA Badge */}
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/15 border border-amber-400/60 text-amber-900 font-serif font-bold text-[11px] sm:text-xs">
                    ውጤት: {certificate.averageScore || 96.5}% • {certificate.honors || 'በከፍተኛ ማዕረግ ተመርቋል'}
                  </span>
                </div>
              </div>

              <p className="text-slate-800 font-serif text-justify text-[11px] sm:text-xs pt-0.5">
                በተክለ ሳዊሮስ ሰንበት ትምህርት ቤት {certificate.program || 'የሰንበት ትምህርት ቤት መደበኛና የርቀት ሥርዓተ ትምህርት'} የሚሰጡትን አጠቃላይ ኮርሶች በሚከተሉት ውጤቶች ተከታትለው በማጠናቀቃቸው ይህ የምስክር ወረቀት ተሰጥቷቸዋል ፡-
              </p>

              {/* Two-Column Courses Grid with Individual Grades & Marks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 p-3 bg-amber-50/50 rounded-2xl border border-amber-200/90 font-serif text-[11px] sm:text-xs text-slate-800 my-2">
                {/* Column 1 */}
                <div className="space-y-1">
                  {col1.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 py-0.5 border-b border-amber-200/40 last:border-none">
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="text-amber-700 font-bold text-[10px]">❖</span>
                        <span className="font-medium truncate">{c.courseName || c.nameAmharic || c.name || c}</span>
                      </p>
                      <span className="shrink-0 px-2 py-0.2 rounded bg-white border border-amber-300/80 text-[10px] font-mono font-bold text-amber-900 shadow-2xs">
                        {c.grade || 'A'} ({c.mark ?? 95}%)
                      </span>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-1">
                  {col2.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 py-0.5 border-b border-amber-200/40 last:border-none">
                      <p className="flex items-center gap-1.5 truncate">
                        <span className="text-amber-700 font-bold text-[10px]">❖</span>
                        <span className="font-medium truncate">{c.courseName || c.nameAmharic || c.name || c}</span>
                      </p>
                      <span className="shrink-0 px-2 py-0.2 rounded bg-white border border-amber-300/80 text-[10px] font-mono font-bold text-amber-900 shadow-2xs">
                        {c.grade || 'A'} ({c.mark ?? 95}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bible Verse Banner */}
              <div className="text-center py-1.5 px-4 bg-gradient-to-r from-amber-100/60 via-amber-200/50 to-amber-100/60 rounded-xl border border-amber-300 text-amber-950 font-serif font-bold text-xs sm:text-sm">
                “አንተ ግን በተማርህበትና በተረዳህበት ነገር ጸንተህ ኑር” (፪ኛ ጢሞ ፫፥፲፬)
              </div>
            </div>

            {/* Signatures & Seal Grid */}
            <div className="grid grid-cols-3 items-end gap-3 pt-4 border-t border-amber-300/80 mt-4 text-center text-xs">
              {/* Signatory 1: Sunday School Chairperson */}
              <div className="space-y-1">
                <div className="h-7 flex items-end justify-center">
                  <span className="font-serif italic text-slate-400 text-xs">ፊርማ</span>
                </div>
                <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
                  የሰንበት ትምህርት ቤቱ ሊቀመንበር
                </div>
                <p className="text-[10px] text-slate-500">ስምና ፊርማ</p>
              </div>

              {/* Center: Official Seal & QR Code */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-[9.5px] font-serif font-bold text-amber-900">የማኅተም ቦታ</span>
                {certificate.qrCodeUrl ? (
                  <Image
                    src={certificate.qrCodeUrl}
                    alt="QR Verification"
                    width={56}
                    height={56}
                    unoptimized
                    style={{ width: 'auto', height: 'auto' }}
                    className="w-13 h-13 sm:w-15 sm:h-15 border border-amber-400 rounded-lg p-1 bg-white shadow-xs"
                  />
                ) : (
                  <div className="w-13 h-13 sm:w-15 sm:h-15 border border-dashed border-amber-400 rounded-lg flex items-center justify-center text-[9px] text-amber-700 font-bold bg-amber-50">
                    ረቂቅ (Draft)
                  </div>
                )}
                <span className="text-[8.5px] font-mono font-bold text-slate-600">
                  {certificate.certificateNumber || '(በግምገማ ላይ)'}
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-wider ${isPending ? 'text-amber-700' : 'text-emerald-800'}`}>
                  {isPending ? '⏳ ይሁንታ የሚጠብቅ ረቂቅ' : '✓ የተረጋገጠ ኦፊሴላዊ ሰነድ'}
                </span>
              </div>

              {/* Signatory 2: Debre Administrator */}
              <div className="space-y-1">
                <div className="h-7 flex items-end justify-center">
                  <span className="font-serif italic text-slate-400 text-xs">ፊርማ</span>
                </div>
                <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
                  የደብሩ አስተዳዳሪ
                </div>
                <p className="text-[10px] text-slate-500">ስምና ፊርማ</p>
              </div>
            </div>

            {/* Patristic Scripture Quote at Footer */}
            <div className="mt-4 pt-2.5 border-t border-dashed border-amber-300 text-center space-y-0.5">
              <p className="text-[9.5px] sm:text-[10.5px] text-slate-600 font-serif italic leading-relaxed max-w-3xl mx-auto">
                “ሕይወትክን በፈተናህ ጊዜያት የትምህርትን የራስህ ቀለበት አድርገህ ወደ እግዚአብሔር ጸሎትና ልመናህን አታቋርጥ፤ እንዲሁም በበረሃ ውስጥ እያለህ ወደ በረከተኞች ገዳማትና ወደ ቅዱሳን ሰዎች ተጓዝ፤ እዚያ ካለ በረከትና በረከት ከአንተ ጋር ትሆናለች።”
              </p>
              <p className="text-[9.5px] font-bold text-amber-800 font-serif">— አባ ጊዮርጊስ ዘጋስጫ</p>
              
              <p className="text-[8.5px] text-slate-400 font-mono pt-0.5">
                የተሰጠበት ቀን: {certificate.issueDateEthiopian || '፳፻፲፯ ዓ.ም'} (ዓ.ም) • ተከታታይ ቁጥር: {certificate.certificateNumber || '(Pending)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiableCertificate;
