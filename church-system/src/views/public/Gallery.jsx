'use client';

// src/views/public/Gallery.jsx
import React from 'react';
import { ChurchGallery } from '../../components/shared/ChurchGallery';
import { FadeIn } from '../../components/motion';

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        <ChurchGallery
          title="የተክለ ሳዊሮስ ሰንበት ት/ቤት የፎቶ ማህደር"
          subtitle="የደብረ ፀሐይ ቅድስት ልደታ ለማርያምና ደብረ መድኃኒት መድኃኔዓለም ቤተክርስቲያን የሰንበት ትምህርት ቤት መንፈሳዊ እንቅስቃሴዎች፣ የበዓላት ድባብና የአገልግሎት ገጽታዎች"
          showFilters={true}
        />
      </div>
    </div>
  );
}

export default GalleryPage;
