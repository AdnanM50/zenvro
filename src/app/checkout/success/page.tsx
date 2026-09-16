"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  MapPin,
} from "lucide-react";
import { useCart, formatPrice } from "@/contexts/CartContext";
import type { Order } from "@/types";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear bag immediately on successful checkout confirmation
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const url = sessionId
          ? `/api/orders/${orderNumber}?session_id=${encodeURIComponent(sessionId)}`
          : `/api/orders/${orderNumber}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.success && json.data) {
          setOrder(json.data);
        }
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, sessionId]);

  return (
    <div className="max-w-3xl mx-auto border border-outline-variant bg-background rounded-3xl p-8 md:p-12 shadow-md space-y-8">
      {/* Success Badge */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <p className="font-label text-xs font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
          Payment Confirmed
        </p>
        <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tight">
          thank you for your order
        </h1>
        <p className="text-secondary text-sm max-w-md mx-auto">
          Your payment was processed successfully via Stripe. A confirmation receipt has been sent to your email.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="bg-surface-container rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant">
        <div>
          <span className="text-xs text-secondary font-bold uppercase tracking-wider">Order Reference</span>
          <div className="text-lg font-mono font-black mt-0.5">{order?.orderNumber || orderNumber || "VL-CONFIRMED"}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Paid & Confirmed
          </span>
        </div>
      </div>

      {/* Order Details (if loaded) */}
      {order && (
        <div className="space-y-6 pt-2">
          {/* Items Breakdown */}
          <div>
            <h3 className="font-label text-xs font-black uppercase tracking-wider text-secondary mb-3 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" /> Purchased Items ({order.items.length})
            </h3>
            <div className="divide-y divide-outline-variant border-y border-outline-variant">
              {order.items.map((item) => (
                <div key={item.key} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="w-12 h-14 bg-surface rounded-lg overflow-hidden shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm">{item.name}</div>
                      <div className="text-xs text-secondary mt-0.5">Size {item.size} &bull; Qty {item.quantity}</div>
                    </div>
                  </div>
                  <div className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="bg-surface-container rounded-2xl p-5 space-y-2 text-sm border border-outline-variant">
            <div className="flex justify-between text-secondary">
              <span>Subtotal</span>
              <span className="font-bold text-on-surface">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-secondary">
              <span>Shipping</span>
              <span className="font-bold text-on-surface">
                {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="border-t border-outline-variant pt-2 flex justify-between font-bold text-base">
              <span>Amount Paid</span>
              <span className="font-black text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-outline-variant space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-secondary uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" /> Shipping Address
              </div>
              <div className="font-bold text-sm text-on-surface mt-1">{order.shippingAddress.fullName}</div>
              <div className="text-secondary">{order.shippingAddress.address}</div>
              <div className="text-secondary">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</div>
              <div className="text-secondary">{order.shippingAddress.country}</div>
            </div>

            <div className="p-4 rounded-xl border border-outline-variant space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-secondary uppercase tracking-wider">
                <CreditCard className="h-3.5 w-3.5" /> Payment Details
              </div>
              <div className="font-bold text-sm text-on-surface mt-1 uppercase">{order.paymentMethod} Gateway</div>
              <div className="text-secondary">Status: <strong className="text-emerald-600 uppercase">{order.paymentStatus}</strong></div>
              {order.paymentIntentId && (
                <div className="text-secondary font-mono text-[10px] truncate">Ref: {order.paymentIntentId}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-outline-variant">
        <Link
          href="/#products"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-label text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/user-dashboard"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-outline-variant font-label text-xs font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
        >
          View Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="bg-surface text-on-surface min-h-screen pt-32 pb-20 px-5 md:px-10 lg:px-16">
      <Suspense fallback={<div className="text-center py-20 text-secondary">Loading order confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}
