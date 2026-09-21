"use client";

import { ShoppingCart, DollarSign, Clock, Truck, PackageCheck } from "lucide-react";

export interface OrderSummaryData {
  totalOrders: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  paidRevenue: number;
}

interface OrderStatsCardsProps {
  summary: OrderSummaryData;
  formatCurrency: (val: number) => string;
}

export default function OrderStatsCards({ summary, formatCurrency }: OrderStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Total Orders
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-on-surface mt-3">
          {summary.totalOrders}
        </p>
        <span className="text-[10px] text-secondary font-medium mt-1">
          Total recorded checkouts
        </span>
      </div>

      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Paid Revenue
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-on-surface mt-3">
          {formatCurrency(summary.paidRevenue)}
        </p>
        <span className="text-[10px] text-emerald-600 font-bold mt-1">
          Gross fulfilled sales
        </span>
      </div>

      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Processing
          </span>
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-on-surface mt-3">
          {summary.processing}
        </p>
        <span className="text-[10px] text-amber-600 font-bold mt-1">
          Awaiting fulfillment
        </span>
      </div>

      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Shipped
          </span>
          <div className="w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
            <Truck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-on-surface mt-3">
          {summary.shipped}
        </p>
        <span className="text-[10px] text-cyan-600 font-bold mt-1">
          In transit to customer
        </span>
      </div>

      <div className="rounded-2xl border border-surface-container bg-surface-container-low p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
            Delivered
          </span>
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-black text-on-surface mt-3">
          {summary.delivered}
        </p>
        <span className="text-[10px] text-indigo-600 font-bold mt-1">
          Completed deliveries
        </span>
      </div>
    </div>
  );
}
