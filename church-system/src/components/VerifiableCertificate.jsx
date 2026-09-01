// src/components/VerifiableCertificate.jsx
import React from 'react';
import ChurchLogo from '../assets/ChurchLogo.png';
import ChurchLeftImg from '../assets/Lidetachurch.jpg';
import ChurchRightImg from '../assets/Lidetachurch2.jpg';

const VerifiableCertificate = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const col1Courses = [
    'ትምህርተ ሃይማኖት',
    'ሥነ-ፍጥረት',
    'አምስቱ አዕማደ ምስጢራት',
    'ክርስቲያናዊ ሥነ-ምግባር',
    'ሥርዓተ ቤተ ክርስቲያን',
    'ምስጢራተ ቤተ ክርስቲያን',
    'ነገረ ማርያም',
  ];

  const col2Courses = [
    'ነገረ ክርስቶስ',
    'ነገረ ቅዱሳን',
    'መጽሐፍ ቅዱስ ጥናት ፩ (ብሉይ ኪዳን)',
    'መጽሐፍ ቅዱስ ጥናት ፪ (ሐዲስ ኪዳን)',
    'የቤተ ክርስቲያን ታሪክ በኢትዮጵያ',
    'የቤተ ክርስቲያን ታሪክ በዓለም መድረክ',
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[96vh] overflow-y-auto shadow-2xl border border-amber-300 flex flex-col my-auto print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:rounded-none">
        
        {/* Action Header (Hidden during print) */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#051533] to-[#08214d] text-white flex justify-between items-center print:hidden rounded-t-3xl border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <img src={ChurchLogo} alt="Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,204,0,0.6)]" />
            <div>
              <h3 className="font-extrabold text-sm text-white">ይፋዊ የሰንበት ት/ቤት የምስክር ወረቀት</h3>
              <p className="text-[10px] text-amber-300">Official Ethiopian Orthodox Sunday School Diploma</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 transition-all shadow-md flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>አትም / አውርድ (Print / PDF)</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Certificate Canvas Area */}
        <div className="p-4 sm:p-8 bg-[#fffdf7] flex-1 flex flex-col justify-between print:p-4">
          <div className="relative border-8 border-double border-amber-600/90 p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#fffefc] via-[#fffdf5] to-[#fffefc] shadow-xl text-slate-900">
            
            {/* Corner Cross Ornaments */}
            <span className="absolute top-2 left-3 text-amber-600 font-bold text-lg select-none">✝️</span>
            <span className="absolute top-2 right-3 text-amber-600 font-bold text-lg select-none">✝️</span>
            <span className="absolute bottom-2 left-3 text-amber-600 font-bold text-lg select-none">✝️</span>
            <span className="absolute bottom-2 right-3 text-amber-600 font-bold text-lg select-none">✝️</span>

            {/* Top Church Header with Left and Right Church Photos */}
            <div className="grid grid-cols-12 items-center gap-2 sm:gap-4 mb-5">
              {/* Left Church Photo (Kidist Lideta) */}
              <div className="col-span-3 flex justify-start">
                <div className="p-1 bg-white border-2 border-amber-500/60 rounded-2xl shadow-md overflow-hidden">
                  <img
                    src={ChurchLeftImg}
                    alt="ቅድስት ልደታ ለማርያም"
                    className="w-20 h-16 sm:w-28 sm:h-20 object-cover rounded-xl"
                  />
                  <p className="text-[8px] text-center font-bold text-amber-900 mt-0.5">ቅድስት ልደታ ለማርያም</p>
                </div>
              </div>

              {/* Center Holy Trinity Invocation & Church Title */}
              <div className="col-span-6 text-center space-y-1">
                <p className="text-[11px] sm:text-xs font-black text-amber-800 tracking-widest font-serif">
                  በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን
                </p>
                <div className="flex justify-center my-1">
                  <img
                    src={ChurchLogo}
                    alt="Church Seal"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_0_10px_rgba(255,204,0,0.7)]"
                  />
                </div>
                <h2 className="text-xs sm:text-sm md:text-base font-black text-[#0f4c9c] font-serif leading-tight">
                  ደብረ ፀሐይ ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም
                </h2>
                <h3 className="text-xs sm:text-sm font-black text-amber-700 font-serif">
                  ቤ/ክ ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
                </h3>
              </div>

              {/* Right Church Photo (Debre Medhanit Medhanealem) */}
              <div className="col-span-3 flex justify-end">
                <div className="p-1 bg-white border-2 border-amber-500/60 rounded-2xl shadow-md overflow-hidden">
                  <img
                    src={ChurchRightImg}
                    alt="መድኃኔዓለም ቤተክርስቲያን"
                    className="w-20 h-16 sm:w-28 sm:h-20 object-cover rounded-xl"
                  />
                  <p className="text-[8px] text-center font-bold text-amber-900 mt-0.5">ደብረ መድኃኒት መድኃኔዓለም</p>
                </div>
              </div>
            </div>

            {/* Distinctive 9-Character Arched Diploma Title Ribbon */}
            <div className="my-3 text-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-6 py-1.5 rounded-2xl bg-gradient-to-r from-[#0f4c9c] via-[#08214d] to-[#0f4c9c] border-2 border-amber-400 shadow-md">
                {['የ', 'ም', 'ስ', 'ክ', 'ር', '•', 'ወ', 'ረ', 'ቀ', 'ት'].map((char, idx) => (
                  <span
                    key={idx}
                    className="w-6 h-7 sm:w-7 sm:h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 text-amber-300 font-serif font-black text-xs sm:text-sm flex items-center justify-center shadow-xs"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* Recipient Statement */}
            <div className="space-y-2.5 my-3 text-xs sm:text-sm leading-relaxed">
              <div className="flex items-center gap-2 border-b-2 border-dashed border-amber-400/80 pb-1">
                <span className="font-bold text-slate-800 text-sm">ለ፡</span>
                <span className="text-base sm:text-2xl font-black text-[#08214d] font-serif tracking-wide">
                  {certificate.studentNameAmharic || certificate.studentName}
                </span>
                <span className="ml-auto text-[11px] font-mono font-bold text-slate-500">
                  (ተማሪ መለያ: {certificate.studentNumber})
                </span>
              </div>

              <p className="text-slate-800 font-serif text-justify pt-0.5">
                በማኅበረ ስብሐት ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተ ክርስቲያን የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት በርቀት ትምህርት የሚሰጡትን ፲፫ (13) አጠቃላይ ኮርሶች፡-
              </p>

              {/* Two-Column 13 Standalone Courses with Liturgical Bullets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200/80 font-serif text-[11px] sm:text-xs text-slate-800 my-2.5">
                {/* Column 1 */}
                <div className="space-y-1">
                  {col1Courses.map((c, idx) => (
                    <p key={idx} className="flex items-center gap-1.5">
                      <span className="text-amber-700 font-bold text-[10px]">❖</span>
                      <span className="font-medium">{c}</span>
                    </p>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-1">
                  {col2Courses.map((c, idx) => (
                    <p key={idx} className="flex items-center gap-1.5">
                      <span className="text-amber-700 font-bold text-[10px]">❖</span>
                      <span className="font-medium">{c}</span>
                    </p>
                  ))}
                </div>
              </div>

              <p className="text-slate-800 font-serif text-justify">
                በሚሉ የትምህርት ርዕሶች ተከታትለው በማጠናቀቃቸው ይህ የምስክር ወረቀት ተሰጥቷቸዋል ።
              </p>

              {/* Bible Verse Banner */}
              <div className="text-center py-1.5 px-4 bg-gradient-to-r from-amber-100/60 via-amber-200/50 to-amber-100/60 rounded-xl border border-amber-300 text-amber-950 font-serif font-bold text-xs sm:text-sm">
                “አንተ ግን በተማርህበትና በተረዳህበት ነገር ጸንተህ ኑር” (፪ኛ ጢሞ ፫፥፲፬)
              </div>
            </div>

            {/* Signatures & Seal Grid */}
            <div className="grid grid-cols-3 items-end gap-4 pt-5 border-t border-amber-300/80 mt-5 text-center text-xs">
              {/* Signatory 1: Sunday School Chairperson */}
              <div className="space-y-1">
                <div className="h-8 flex items-end justify-center">
                  <span className="font-serif italic text-slate-400 text-xs">ፊርማ (Signature)</span>
                </div>
                <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
                  የሰንበት ትምህርት ቤቱ ሊቀመንበር ስምና ፊርማ
                </div>
                <p className="text-[10px] text-slate-500">Sunday School Chair</p>
              </div>

              {/* Center: Official Seal & QR Code */}
              <div className="flex flex-col items-center justify-center space-y-1">
                <span className="text-[10px] font-serif font-bold text-amber-900">የማኅተም ቦታ (Seal)</span>
                {certificate.qrCodeUrl && (
                  <img
                    src={certificate.qrCodeUrl}
                    alt="QR Verification"
                    className="w-14 h-14 sm:w-16 sm:h-16 border border-amber-400 rounded-lg p-1 bg-white shadow-xs"
                  />
                )}
                <span className="text-[9px] font-mono font-bold text-slate-600">
                  {certificate.certificateNumber}
                </span>
                <span className="text-[8px] text-emerald-800 font-bold uppercase tracking-wider">
                  ✓ VERIFIED AUTHENTIC
                </span>
              </div>

              {/* Signatory 2: Debre Administrator */}
              <div className="space-y-1">
                <div className="h-8 flex items-end justify-center">
                  <span className="font-serif italic text-slate-400 text-xs">ፊርማ (Signature)</span>
                </div>
                <div className="border-t border-slate-700 pt-1 font-bold text-slate-900 text-[11px] sm:text-xs">
                  የደብሩ አስተዳዳሪ ስምና ፊርማ
                </div>
                <p className="text-[10px] text-slate-500">Parish Administrator</p>
              </div>
            </div>

            {/* Patristic Scripture Quote at Footer */}
            <div className="mt-5 pt-3 border-t border-dashed border-amber-300 text-center space-y-0.5">
              <p className="text-[10px] sm:text-[11px] text-slate-600 font-serif italic leading-relaxed max-w-3xl mx-auto">
                “ሕይወትክን በፈተናህ ጊዜያት የትምህርትን የራስህ ቀለበት አድርገህ ወደ እግዚአብሔር ጸሎትና ልመናህን አታቋርጥ፤ እንዲሁም በበረሃ ውስጥ እያለህ ወደ በረከተኞች ገዳማትና ወደ ቅዱሳን ሰዎች ተጓዝ፤ እዚያ ካለ በረከትና በረከት ከአንተ ጋር ትሆናለች።”
              </p>
              <p className="text-[10px] font-bold text-amber-800 font-serif">— አባ ጊዮርጊስ ዘጋስጫ</p>
              
              <p className="text-[9px] text-slate-400 font-mono pt-0.5">
                የተሰጠበት ቀን: {certificate.issueDateEthiopian} (ዓ.ም) • Serial: {certificate.certificateNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiableCertificate;
