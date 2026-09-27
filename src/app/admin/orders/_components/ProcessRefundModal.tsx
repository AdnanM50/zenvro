'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RotateCcw,
  CreditCard,
  Building2,
  DollarSign,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import type { Order } from '@/types/order';

interface ProcessRefundModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
  formatCurrency: (val: number) => string;
}

const PRESET_REFUND_REASONS = [
  'Customer return / silhouette exchange request.',
  'Order cancelled upon administrative inventory review.',
  'Defective or damaged garment identified prior to dispatch.',
  'Accidental duplicate checkout / billing discrepancy.',
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

export default function ProcessRefundModal({
  isOpen,
  order,
  onClose,
  onSuccess,
  formatCurrency,
}: ProcessRefundModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState(PRESET_REFUND_REASONS[0]);
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && order) {
      setAmount(order.total);
      setReason(PRESET_REFUND_REASONS[0]);
      setBankName(order.paymentDetails?.bankName || '');
      setBankAccountNumber(order.paymentDetails?.bankAccountNumber || '');
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const cardDetails = order.paymentDetails;
  const isCard = cardDetails?.last4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > order.total) {
      setError(`Refund amount must be between $0.01 and ${formatCurrency(order.total)}.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await fetch('/api/admin/orders/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderNumber,
          amount,
          reason: reason.trim(),
          bankName: bankName.trim() || undefined,
          bankAccountNumber: bankAccountNumber.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to process refund');
      }

      onSuccess(json.data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refund failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={submitting ? undefined : onClose}
        />

        {/* Modal Window */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="relative w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 sm:p-7 text-gray-900 dark:text-gray-100 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Top accent bar */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 ring-1 ring-sky-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Payment &amp; Gateway Action
              </span>
              <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                Process Refund for #{order.orderNumber}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Total Paid: <strong className="text-gray-900 dark:text-white font-mono">{formatCurrency(order.total)}</strong>
              </p>
            </div>
          </div>

          {/* Card / Bank Destination Info Box */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/80 mb-5 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              Customer Payment &amp; Card Reference
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-gray-400 text-[11px] block">Card / Method:</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {cardDetails?.cardBrand ? `${cardDetails.cardBrand.toUpperCase()} •••• ${cardDetails.last4 || '4242'}` : 'Stripe Card Gateway'}
                </span>
                {cardDetails?.expMonth && cardDetails?.expYear && (
                  <span className="text-[10px] text-gray-500 block">
                    Exp: {cardDetails.expMonth}/{cardDetails.expYear}
                  </span>
                )}
              </div>

              <div>
                <span className="text-gray-400 text-[11px] block">Bank Name / Origin:</span>
                <span className="font-bold text-gray-900 dark:text-white truncate block">
                  {cardDetails?.bankName || 'JPMorgan Chase / Issuer Bank'}
                </span>
                {cardDetails?.funding && (
                  <span className="text-[10px] text-gray-500 uppercase block">
                    {cardDetails.funding} Card
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Refund Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Refund Amount (USD)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(order.total)}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  Full Total ({formatCurrency(order.total)})
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={order.total}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-mono font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  required
                />
              </div>
            </div>

            {/* Quick Reason Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Refund Reason Presets
              </label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {PRESET_REFUND_REASONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(preset)}
                    className={`w-full text-left text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      reason === preset
                        ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-bold'
                        : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-300'
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
                Refund Note / Reason for Customer
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason to be politely explained in the customer refund confirmation email..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
              />
            </div>

            {/* Bank Details Inputs (Optional for records/wire) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-sky-500" /> Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Account / Routing Reference
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="e.g. •••• •••• 9812"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reassurance Banner */}
            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/40 text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-600 mt-0.5" />
              <div>
                Executing this refund will update the order to <strong>REFUNDED</strong> and automatically dispatch a polite confirmation email to <strong>{order.userEmail}</strong>.
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || amount <= 0}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-xs font-bold text-white shadow-md shadow-sky-600/25 hover:from-sky-500 hover:to-blue-500 transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Refund...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Issue {formatCurrency(amount)} Refund</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
