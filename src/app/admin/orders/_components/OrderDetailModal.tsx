"use client";

import { ShoppingCart, Copy, User, MapPin, Printer } from "lucide-react";
import type { Order } from "@/types/order";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onPrintInvoice: (order: Order) => void;
  formatCurrency: (val: number) => string;
  formatDate: (isoStr: string) => string;
  copyToClipboard: (text: string, label: string) => void;
}

export default function OrderDetailModal({
  order,
  onClose,
  onPrintInvoice,
  formatCurrency,
  formatDate,
  copyToClipboard,
}: OrderDetailModalProps) {
  if (!order) return null;

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

        <div className="pt-2 flex justify-between items-center">
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
