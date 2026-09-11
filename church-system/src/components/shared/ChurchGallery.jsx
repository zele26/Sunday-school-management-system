'use client';

// src/components/shared/ChurchGallery.jsx
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { churchPhotos, photoCategories } from '../../data/churchPhotos';
import { FadeIn, StaggerContainer, StaggerItem, AnimatedModal } from '../motion';
import { Badge } from '../ui/Badge';
import { ChevronLeft, ChevronRight, X, Sparkles, ZoomIn, Camera } from 'lucide-react';
import { cn } from '../ui/utils';

export function ChurchGallery({
  limit,
  initialCategory = 'all',
  showFilters = true,
  title = 'የሰንበት ትምህርት ቤታችን ገጽታዎች በፎቶ',
  subtitle = 'የመንፈሳዊ አገልግሎት፣ የዝማሬ፣ የበዓላትና የተማሪዎች የኅብረት ቆይታ በምስል',
  className,
}) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [activePhoto, setActivePhoto] = useState(null);

  const filteredPhotos = churchPhotos.filter((photo) => {
    if (selectedCategory === 'all') return true;
    return photo.category === selectedCategory;
  });

  const displayPhotos = limit ? filteredPhotos.slice(0, limit) : filteredPhotos;

  const currentPhotoIndex = activePhoto
    ? displayPhotos.findIndex((p) => p.id === activePhoto.id)
    : -1;

  const handlePrev = () => {
    if (currentPhotoIndex > 0) {
      setActivePhoto(displayPhotos[currentPhotoIndex - 1]);
    } else {
      setActivePhoto(displayPhotos[displayPhotos.length - 1]);
    }
  };

  const handleNext = () => {
    if (currentPhotoIndex < displayPhotos.length - 1) {
      setActivePhoto(displayPhotos[currentPhotoIndex + 1]);
    } else {
      setActivePhoto(displayPhotos[0]);
    }
  };

  return (
    <section className={cn('space-y-8', className)}>
      {/* Header */}
      <FadeIn className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-900 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>የፎቶ ማህደር</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </FadeIn>

      {/* Category Tabs - Touch-Friendly Horizontal Swipe Carousel */}
      {showFilters && (
        <FadeIn delay={0.1}>
          <div className="w-full flex items-center justify-start sm:justify-center overflow-x-auto whitespace-nowrap scrollbar-none gap-2.5 px-2 sm:px-4 py-2 scroll-smooth -mx-2 sm:mx-0">
            {photoCategories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shrink-0 min-h-[44px] flex items-center justify-center select-none active:scale-95',
                    isActive
                      ? 'bg-[#1e3a8a] text-white shadow-md shadow-blue-900/25 ring-2 ring-[#1e3a8a]/30'
                      : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/70 dark:hover:bg-slate-700/80'
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Photo Grid */}
      <StaggerContainer
        staggerChildren={0.07}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
      >
        {displayPhotos.map((photo) => (
          <StaggerItem key={photo.id}>
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => setActivePhoto(photo)}
              className="group relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400/50 dark:hover:border-amber-400/40 transition-all duration-300 cursor-pointer flex flex-col h-full"
            >
              {/* Image Aspect Box */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                />

                {/* Dark Gradient Overlay for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                {/* Top Category Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-white/10 shadow-xs">
                    {photo.categoryAm}
                  </span>
                </div>

                {/* Hover Zoom Icon */}
                <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 dark:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                  <ZoomIn className="w-4 h-4 text-[#1657b8] dark:text-amber-400" />
                </div>

                {/* Bottom Title on Image */}
                <div className="absolute bottom-3 left-3 right-3 z-10">
                  <h3 className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition-colors drop-shadow-sm">
                    {photo.title}
                  </h3>
                </div>
              </div>

              {/* Card Footer Caption */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {photo.description}
                </p>
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-[#1657b8] dark:text-blue-400">
                  <span>በሙሉ ምስል ይመልከቱ</span>
                  <span>➔</span>
                </div>
              </div>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl border border-amber-400/40 flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-[#0d3b82] to-[#1657b8] text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {activePhoto.categoryAm}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Area */}
              <div className="relative w-full h-80 sm:h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">
                <Image
                  src={activePhoto.src}
                  alt={activePhoto.title}
                  fill
                  className="object-contain"
                  priority
                />

                {/* Left/Right Navigation Arrows */}
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-[#1657b8] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-[#1657b8] text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Description Footer */}
              <div className="p-5 sm:p-6 space-y-2 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                    {activePhoto.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">
                    {currentPhotoIndex + 1} ከ {displayPhotos.length}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activePhoto.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default ChurchGallery;
