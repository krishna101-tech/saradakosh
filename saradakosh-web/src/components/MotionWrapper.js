'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * PageTransition component wraps entire page layouts to animate route transitions.
 * Performs a gentle fade-in and subtle 12px Y-translation over 300ms.
 */
export function PageTransition({ children }) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1], // easeOut
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer coordinates staggered loading of child StaggerItems.
 */
export function StaggerContainer({ children, delay = 0.05, className = '' }) {
  const variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: delay,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem defines the transition for a single item within a StaggerContainer.
 * Limits transition to 250ms fade and 12px slide-up.
 */
export function StaggerItem({ children, className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 12,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div variants={variants} className={className}>
      {children}
    </motion.div>
  );
}
