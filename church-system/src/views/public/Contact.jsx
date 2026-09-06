'use client';

import React from 'react';
import { Phone, Mail, MapPin, Clock, Send, Sparkles } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '../../components/motion';
import { Card, ActionCard } from '../../components/ui/Card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans antialiased text-slate-800 dark:text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <FadeIn direction="down" duration={0.5}>
          <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/80 dark:bg-blue-950/30 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-50/60 dark:bg-amber-950/20 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />

            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-400/30 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ግንኙነት ያድርጉ
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                ያግኙን
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
                ጥያቄ፣ አስተያየት ወይም ለሰንበት ትምህርት ቤታችን ተጨማሪ መረጃ ለማግኘት ከታች ባሉት የመገናኛ ዘዴዎች ይጠቀሙ።
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Contact Info Cards & Form Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Contact Details with Reusable ActionCard & Card */}
          <StaggerContainer staggerChildren={0.1} className="lg:col-span-1 space-y-4">
            
            {/* Phone Card */}
            <StaggerItem>
              <ActionCard
                icon={Phone}
                iconClassName="bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400"
                title="ስልክ ቁጥር"
                description="0912-345678"
                onClick={() => {
                  window.location.href = 'tel:0912345678';
                }}
              />
            </StaggerItem>

            {/* Email Card */}
            <StaggerItem>
              <ActionCard
                icon={Mail}
                iconClassName="bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                title="ኢሜይል"
                description="info@sundayschool.et"
                onClick={() => {
                  window.location.href = 'mailto:info@sundayschool.et';
                }}
              />
            </StaggerItem>

            {/* Address Card */}
            <StaggerItem>
              <Card variant="default" padding="md">
                <div className="flex items-start space-x-4 space-x-reverse">
                  <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/50 text-[#1657b8] dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 dark:border-slate-800 shadow-xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">አድራሻ</h3>
                    <p className="text-slate-900 dark:text-white font-bold text-sm sm:text-base mt-0.5 leading-relaxed">
                      ተክለሳዊሮስ ቤተክርስቲያን፣ አዲስ አበባ
                    </p>
                  </div>
                </div>
              </Card>
            </StaggerItem>

            {/* Operating Hours Card */}
            <StaggerItem>
              <Card variant="default" padding="md">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">የአገልግሎት ሰዓት</h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  እሑድ፡ ከጠዋቱ 2:00 - 6:00<br />
                  ቅዳሜ፡ ከሰዓት 8:00 - 11:00
                </p>
              </Card>
            </StaggerItem>

          </StaggerContainer>

          {/* Contact Form Section (2/3 Width on Large Screens) with Reusable Card */}
          <FadeIn direction="left" delay={0.15} className="lg:col-span-2">
            <Card variant="default" padding="lg">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">መልእክት ይላኩልን</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                የሚከተለውን ፎርም በመሙላት ጥያቄዎትን ወይም አስተያየትዎን ይላኩልን።
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">ስም</label>
                    <input 
                      type="text" 
                      placeholder="ሙሉ ስምዎ" 
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">ስልክ ቁጥር</label>
                    <input 
                      type="tel" 
                      placeholder="09..." 
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">ኢሜይል</label>
                  <input 
                    type="email" 
                    placeholder="example@mail.com" 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">መልእክት</label>
                  <textarea 
                    rows="4" 
                    placeholder="መልእክትዎን እዚህ ይጻፉ..." 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1657b8]/20 focus:border-[#1657b8] transition-all text-sm resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full sm:w-auto bg-[#1657b8] hover:bg-[#124796] active:scale-[0.98] text-white font-bold px-8 py-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>መልእክት ላክ</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </Card>
          </FadeIn>

        </div>

      </div>
    </div>
  );
};

export default Contact;