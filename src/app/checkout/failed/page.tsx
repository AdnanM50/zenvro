"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  XCircle,
  ArrowRight,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="max-w-2xl mx-auto border border-outline-variant bg-background rounded-3xl p-8 md:p-12 shadow-md space-y-8">
      {/* Alert Icon & Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mx-auto flex items-center justify-center">
          <XCircle className="h-9 w-9" />
        </div>
        <p className="font-label text-xs font-black uppercase tracking-[0.25em] text-rose-600 dark:text-rose-400">
          Payment Not Completed
        </p>
        <h1 className="font-headline text-3xl md:text-4xl font-black tracking-tight">
          checkout was interrupted
        </h1>
        <p className="text-secondary text-sm max-w-md mx-auto leading-relaxed">
          Your card has not been charged. The Stripe payment session was either cancelled or could not be finalized. Your luxury bag items have been preserved.
        </p>
      </div>

      {/* Order Reference Box (if available) */}
      {orderNumber && (
        <div className="bg-surface-container rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant">
          <div>
            <span className="text-xs text-secondary font-bold uppercase tracking-wider">
              Attempt Reference
            </span>
            <div className="text-base font-mono font-black mt-0.5">{orderNumber}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Unpaid / Cancelled
            </span>
          </div>
        </div>
      )}

      {/* Helpful Reasons */}
      <div className="p-5 rounded-2xl bg-surface-container border border-outline-variant space-y-3">
        <div className="font-bold text-xs uppercase tracking-wider text-secondary flex items-center gap-2">
          <HelpCircle className="h-4 w-4" /> Common Reasons
        </div>
        <ul className="text-xs text-secondary space-y-2 list-disc list-inside">
          <li>The payment window was closed before completing checkout.</li>
          <li>The issuing bank declined authorization or 3D Secure failed.</li>
          <li>Incorrect card details or expired test credentials were supplied.</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-outline-variant">
        <Link
          href="/checkout"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-label text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md"
        >
          <RotateCcw className="h-4 w-4" />
          Try Payment Again
        </Link>
        <Link
          href="/#products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-outline-variant font-label text-xs font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
        >
          <ShoppingBag className="h-4 w-4" />
          Return to Bag
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <main className="bg-surface text-on-surface min-h-screen pt-32 pb-20 px-5 md:px-10 lg:px-16">
      <Suspense fallback={<div className="text-center py-20 text-secondary">Loading...</div>}>
        <FailedContent />
      </Suspense>
    </main>
  );
}
