'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';
import type { Order } from '@/types/order';

interface CancelOrderReasonModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onProceed: (reason: string) => void;
}

const PRESET_REASONS = [
  'Item temporarily out of stock in our studio atelier.',
  'Customer requested order cancellation via concierge support.',
  'Unable to verify shipping address / delivery restrictions.',
  'System inventory discrepancy or sizing availability issue.',
  'Duplicate checkout detected and merged with prior order.',
];

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 24,
      stiffness: 300,
      mass: 0.9,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

export default function CancelOrderReasonModal({
  isOpen,
  order,
  onClose,
  onProceed,
}: CancelOrderReasonModalProps) {
  const [reason, setReason] = useState(PRESET_REASONS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason(PRESET_REASONS[0]);
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = reason.trim();
    if (!clean || clean.length < 5) {
      setError('Please provide a meaningful reason (at least 5 characters).');
      return;
    }
    setError('');
    onProceed(clean);
  };

  const customerName =
    order.shippingAddress?.fullName || order.userEmail.split('@')[0] || 'Customer';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 text-gray-900 dark:text-gray-100 shadow-2xl z-10"
        >
          {/* Top accent bar */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 ring-1 ring-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Fulfillment Cancellation
              </span>
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                Order #{order.orderNumber}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Customer: <strong className="text-gray-800 dark:text-gray-200">{customerName}</strong> ({order.userEmail})
              </p>
            </div>
          </div>

          {/* Notice banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 mb-4 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <MessageSquare className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <strong>Email Notice:</strong> This reason will be politely quoted in the official notification email sent to the customer upon confirmation.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quick Reason Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" /> Quick Reason Presets
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {PRESET_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReason(preset);
                      setError('');
                    }}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      reason === preset
                        ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Cancellation Reason Message
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter a polite and clear reason for cancelling this order..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 resize-none transition"
              />
              <div className="flex justify-between items-center mt-1">
                {error ? (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                    {error}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400">
                    Be humble, polite, and specific for the client.
                  </span>
                )}
                <span className="text-[10px] text-gray-400">{reason.length} chars</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-xs font-bold text-white shadow-md shadow-rose-600/25 hover:from-rose-500 hover:to-red-500 transition cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
