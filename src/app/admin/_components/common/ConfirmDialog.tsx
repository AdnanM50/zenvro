'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirming?: boolean;
}

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 28 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 22,
      stiffness: 320,
      mass: 0.9,
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 18,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 18, stiffness: 280 },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -14 },
  show: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: 'spring' as const, damping: 11, stiffness: 240, mass: 0.8 },
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete this item?',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  confirming = false,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !confirming) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, confirming]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={confirming ? undefined : onClose}
          />

          {/* Dialog */}
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 text-gray-900 dark:text-gray-100 shadow-2xl z-10"
            data-lenis-prevent
          >
            {/* Top accent line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-transparent opacity-80" />

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-red-500/10 dark:bg-red-500/15 blur-3xl" />

            {/* Close */}
            <motion.button
              type="button"
              variants={itemVariants}
              onClick={onClose}
              disabled={confirming}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <motion.div variants={iconVariants} className="relative mt-1 h-16 w-16">
                <motion.span
                  className="absolute inset-0 rounded-2xl bg-red-500/40"
                  initial={{ scale: 1, opacity: 0.55 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-red-500/15 to-red-600/10 ring-1 ring-red-500/25 shadow-inner">
                  <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" strokeWidth={2} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h3
                variants={itemVariants}
                className="mt-5 font-headline text-lg font-black tracking-tight text-gray-900 dark:text-white"
              >
                {title}
              </motion.h3>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-gray-500 dark:text-gray-400"
              >
                {description}
              </motion.p>

              {/* Actions */}
              <motion.div variants={itemVariants} className="mt-6 flex w-full items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={confirming}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 active:scale-[0.97] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/50"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={confirming}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-500/30 hover:from-red-500 hover:to-red-400 active:scale-[0.97] transition-all disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
                >
                  {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {confirming ? 'Deleting...' : confirmLabel}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
