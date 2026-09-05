'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, ChevronLeft } from 'lucide-react';

/**
 * Reusable, modern Ethiopian Orthodox Church-themed Back Navigation Button
 */
export const BackButton = ({
  href = '/',
  label = 'ወደ ዋናው ገጽ',
  subLabel = 'Back to Home',
  icon = 'arrow', // 'arrow' | 'home' | 'chevron'
  className = '',
  variant = 'glass', // 'glass' | 'solid' | 'ghost' | 'light'
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03, x: -2 }}
      whileTap={{ scale: 0.97 }}
      className="inline-block"
    >
      <Link
        href={href}
        className={`group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 border shadow-xs hover:shadow-md cursor-pointer ${
          variant === 'glass'
            ? 'bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 hover:text-[#1657b8] dark:hover:text-amber-300 border-slate-200/90 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-400/50 backdrop-blur-md shadow-slate-200/50 dark:shadow-none'
            : variant === 'light'
            ? 'bg-white/95 hover:bg-white text-[#1657b8] hover:text-[#0f3d82] border-blue-100 hover:border-amber-300 shadow-md backdrop-blur-lg'
            : variant === 'solid'
            ? 'bg-[#1657b8] hover:bg-[#124796] text-white border-blue-400/30 shadow-md'
            : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent'
        } ${className}`}
      >
        <span className="w-6 h-6 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-[#1657b8] dark:text-amber-400 group-hover:bg-gradient-to-tr group-hover:from-amber-500 group-hover:to-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-all duration-200 shrink-0 shadow-xs border border-blue-100/60 dark:border-blue-900/40">
          {icon === 'home' ? (
            <Home className="w-3.5 h-3.5" />
          ) : icon === 'chevron' ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ArrowLeft className="w-3.5 h-3.5" />
          )}
        </span>
        <span className="font-extrabold tracking-tight">
          {label} {subLabel && <span className="opacity-75 font-medium text-[11px] sm:text-xs">({subLabel})</span>}
        </span>
      </Link>
    </motion.div>
  );
};

export default BackButton;
