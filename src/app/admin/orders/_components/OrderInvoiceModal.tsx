"use client";

import { Printer } from "lucide-react";
import type { Order } from "@/types/order";

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  formatCurrency: (val: number) => string;
  formatDate: (isoStr: string) => string;
}

export default function OrderInvoiceModal({
  order,
  onClose,
  formatCurrency,
  formatDate,
}: OrderInvoiceModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="print-invoice-modal relative w-full max-w-2xl bg-white text-black border border-gray-300 rounded-3xl p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 print:hidden">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
            Official Order Invoice
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-200 transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6 text-black font-sans">
          <div className="flex items-center justify-between border-b border-black pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-widest">
                ZENVRO
              </h2>
              <p className="text-xs text-gray-500 font-bold uppercase">
                Order Invoice & Receipt
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-mono font-black text-sm">
                #{order.orderNumber}
              </p>
              <p className="text-gray-500">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-b border-gray-200 pb-4">
            <div>
              <p className="font-bold uppercase text-gray-500">Customer</p>
              <p className="font-bold text-sm">
                {order.shippingAddress?.fullName || order.userEmail}
              </p>
              <p className="text-gray-600">{order.userEmail}</p>
            </div>
            <div>
              <p className="font-bold uppercase text-gray-500">Shipping Address</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode}
              </p>
              <p className="font-bold uppercase">
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-300 font-bold bg-gray-100">
                <th className="py-2 px-2">Item Description</th>
                <th className="py-2 px-2">Size</th>
                <th className="py-2 px-2">Qty</th>
                <th className="py-2 px-2 text-right">Unit Price</th>
                <th className="py-2 px-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2 px-2 font-bold">{item.name}</td>
                  <td className="py-2 px-2 uppercase">{item.size}</td>
                  <td className="py-2 px-2">{item.quantity}</td>
                  <td className="py-2 px-2 text-right">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-2 px-2 text-right font-bold">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-2">
            <div className="w-1/2 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  {formatCurrency(
                    order.subtotal || order.total
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shipping === 0
                    ? "FREE"
                    : formatCurrency(order.shipping || 0)}
                </span>
              </div>
              <div className="border-t border-black pt-2 flex justify-between font-black text-sm">
                <span>Total Amount Paid</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
