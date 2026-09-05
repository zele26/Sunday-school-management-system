'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fade in element with customizable direction, delay, and duration
export const FadeIn = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className = '',
  viewport = { once: true, margin: '-50px' },
  ...props
}) => {
  const directions = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { x: 24, y: 0 },
    right: { x: -24, y: 0 },
    none: { x: 0, y: 0 },
  };

  const initialOffset = directions[direction] || directions.up;

  return (
    <motion.div
      initial={{ opacity: 0, ...initialOffset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for animating lists/grids of items
export const StaggerContainer = ({
  children,
  staggerChildren = 0.1,
  delayChildren = 0,
  className = '',
  viewport = { once: true, margin: '-50px' },
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={viewport}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Item inside StaggerContainer
export const StaggerItem = ({
  children,
  direction = 'up',
  className = '',
  ...props
}) => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 },
    none: { x: 0, y: 0 },
  };

  const offset = directions[direction] || directions.up;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offset },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            duration: 0.45,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Interactive card with smooth hover elevation and tap feedback
export const MotionCard = ({
  children,
  hoverY = -4,
  tapScale = 0.99,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ y: hoverY, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: tapScale }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated modal with backdrop blur and spring scale-in
export const AnimatedModal = ({
  isOpen,
  onClose,
  children,
  className = 'max-w-lg w-full',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative z-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Multi-step slide animation container
export const StepTransition = ({
  stepKey,
  children,
  direction = 1, // 1 for forward, -1 for backward
  className = '',
}) => {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        initial={{ opacity: 0, x: direction > 0 ? 25 : -25 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction > 0 ? -25 : 25 }}
        transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
