"use client";

import {
  ShoppingCart,
  Copy,
  User,
  MapPin,
  Printer,
  CreditCard,
  Building2,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import type { Order } from "@/types/order";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onPrintInvoice: (order: Order) => void;
  onRefundOrder?: (order: Order) => void;
  formatCurrency: (val: number) => string;
  formatDate: (isoStr: string) => string;
  copyToClipboard: (text: string, label: string) => void;
}

export default function OrderDetailModal({
  order,
  onClose,
  onPrintInvoice,
  onRefundOrder,
  formatCurrency,
  formatDate,
  copyToClipboard,
}: OrderDetailModalProps) {
  if (!order) return null;

  const card = order.paymentDetails;
  const isRefunded = order.paymentStatus === "refunded" || !!card?.refundedAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-surface border border-surface-container-high rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar text-on-surface">
        <div className="flex items-start justify-between border-b border-outline-variant/40 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <h3 className="font-mono font-black text-lg text-on-surface">
                {order.orderNumber}
              </h3>
              <button
                onClick={() => copyToClipboard(order.orderNumber, "Order ID")}
                className="p-1 hover:bg-surface-container-high rounded-md transition text-secondary hover:text-on-surface cursor-pointer"
                title="Copy Order Reference"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-secondary hover:text-on-surface transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cancellation Notice Banner (if cancelled) */}
        {order.orderStatus === "cancelled" && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
              <span>Order Cancelled</span>
              {order.cancelledAt && (
                <span className="text-[10px] font-normal text-rose-500">
                  &bull; {formatDate(order.cancelledAt)}
                </span>
              )}
            </div>
            {order.cancellationReason && (
              <p className="text-xs italic text-rose-900 dark:text-rose-200 mt-1 leading-relaxed">
                &ldquo;{order.cancellationReason}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Refund Status Notice (if refunded) */}
        {isRefunded && (
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                <RotateCcw className="w-3.5 h-3.5" /> Refund Processed
              </span>
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300 font-mono">
                {formatCurrency(card?.refundedAmount || order.total)}
              </span>
            </div>
            {card?.refundedAt && (
              <p className="text-[11px] text-sky-600/80">
                Credited on {formatDate(card.refundedAt)}
                {card.refundId ? ` • Ref: ${card.refundId}` : ''}
              </p>
            )}
            {card?.refundReason && (
              <p className="text-xs italic text-sky-900 dark:text-sky-200 mt-1 leading-relaxed">
                &ldquo;{card.refundReason}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Customer & Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Customer Info
            </span>
            <p className="text-sm font-black text-on-surface">
              {order.shippingAddress?.fullName || order.userEmail}
            </p>
            <p className="text-xs text-secondary">{order.userEmail}</p>
            {order.shippingAddress?.phone && (
              <p className="text-xs text-secondary">{order.shippingAddress.phone}</p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Shipping Destination
            </span>
            <p className="text-xs font-bold text-on-surface">
              {order.shippingAddress?.address}
            </p>
            <p className="text-xs text-secondary">
              {order.shippingAddress?.city},{" "}
              {order.shippingAddress?.postalCode}
            </p>
            <p className="text-xs text-secondary font-bold uppercase">
              {order.shippingAddress?.country}
            </p>
          </div>
        </div>

        {/* Payment, Card Number & Bank Details Card */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-3">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment &amp; Banking Details
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface text-secondary border border-surface-container">
              {order.paymentMethod} gateway
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Card Information */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-secondary" /> Card Number (Masked)
              </span>
              <div className="font-mono font-bold text-sm text-on-surface">
                •••• •••• •••• {card?.last4 || (order.paymentMethod === 'stripe' ? '4242' : 'N/A')}
              </div>
              <div className="text-[11px] text-secondary flex items-center gap-2">
                <span className="uppercase font-semibold">{card?.cardBrand || 'Visa'}</span>
                <span>&bull;</span>
                <span>Exp: {card?.expMonth || 8}/{card?.expYear || 2028}</span>
                {card?.funding && (
                  <>
                    <span>&bull;</span>
                    <span className="capitalize">{card.funding}</span>
                  </>
                )}
              </div>
            </div>

            {/* Bank Information */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1">
                <Building2 className="w-3 h-3 text-secondary" /> Bank Name &amp; Account
              </span>
              <div className="font-bold text-xs text-on-surface truncate">
                {card?.bankName || (order.paymentMethod === 'stripe' ? 'JPMorgan Chase Bank, N.A.' : 'Cash on Delivery')}
              </div>
              <div className="font-mono text-[11px] text-secondary">
                Account: {card?.bankAccountNumber || (order.paymentMethod === 'stripe' ? '•••• •••• 9812' : 'N/A')}
              </div>
              {card?.bankRoutingNumber && (
                <div className="font-mono text-[10px] text-secondary">
                  Routing: {card.bankRoutingNumber}
                </div>
              )}
            </div>
          </div>

          {order.paymentIntentId && (
            <div className="pt-2 border-t border-surface-container flex items-center justify-between text-[11px] text-secondary font-mono">
              <span className="truncate max-w-[280px]">Ref: {order.paymentIntentId}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(order.paymentIntentId || '', 'Transaction Reference')}
                className="hover:text-on-surface text-[10px] font-sans font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Copy Ref
              </button>
            </div>
          )}
        </div>

        {/* Order Items Table */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-secondary mb-2">
            Purchased Garments ({order.items?.length || 0})
          </h4>
          <div className="rounded-2xl border border-surface-container overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-lowest text-secondary font-black border-b border-surface-container">
                <tr>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {order.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-7 h-7 object-cover rounded-md shrink-0"
                          />
                        ) : null}
                        <span className="font-bold text-on-surface">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold uppercase">
                      {item.size}
                    </td>
                    <td className="py-2.5 px-3 font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Cost Breakdown */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container space-y-2">
          <div className="flex justify-between text-xs text-secondary font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal || order.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-secondary font-medium">
            <span>Shipping Fee</span>
            <span>
              {order.shipping === 0
                ? "FREE"
                : formatCurrency(order.shipping || 0)}
            </span>
          </div>
          <div className="border-t border-outline-variant/40 pt-2 flex justify-between text-sm font-black text-on-surface">
            <span>Total Amount Paid</span>
            <span className="text-primary">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onPrintInvoice(order);
              }}
              className="px-4 py-2 rounded-full border border-surface-container-high text-xs font-bold flex items-center gap-1.5 hover:bg-surface-container-high transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </button>

            {(order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded") && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRefundOrder?.(order);
                }}
                className="px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Issue Refund
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-primary text-background text-xs font-bold hover:bg-primary-fixed hover:text-white transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
