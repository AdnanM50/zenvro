import type { OrderStatus, PaymentStatus } from "@/types/order";

export interface StatusOption<T extends string> {
  value: T;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const PAYMENT_STATUS_OPTIONS: StatusOption<PaymentStatus>[] = [
  {
    value: "paid",
    label: "Paid",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-xs",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  {
    value: "pending",
    label: "Pending",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:border-amber-500/60 shadow-xs",
    dotClass: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
  },
  {
    value: "failed",
    label: "Failed",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:border-rose-500/60 shadow-xs",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
  },
  {
    value: "refunded",
    label: "Refunded",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:border-sky-500/60 shadow-xs",
    dotClass: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]",
  },
];

export const ORDER_STATUS_OPTIONS: StatusOption<OrderStatus>[] = [
  {
    value: "processing",
    label: "Processing",
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:border-purple-500/60 shadow-xs",
    dotClass: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:border-indigo-500/60 shadow-xs",
    dotClass: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]",
  },
  {
    value: "shipped",
    label: "Shipped",
    badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:border-sky-500/60 shadow-xs",
    dotClass: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)]",
  },
  {
    value: "delivered",
    label: "Delivered",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 shadow-xs",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:border-rose-500/60 shadow-xs",
    dotClass: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
  },
];

export const ORDER_FILTER_OPTIONS: StatusOption<string>[] = [
  { value: "all", label: "All Order Statuses", badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700", dotClass: "bg-gray-400" },
  { value: "processing", label: "Processing", badgeClass: "bg-purple-500/10 text-purple-600 border-purple-500/30", dotClass: "bg-purple-500" },
  { value: "confirmed", label: "Confirmed", badgeClass: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30", dotClass: "bg-indigo-500" },
  { value: "shipped", label: "Shipped", badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/30", dotClass: "bg-sky-500" },
  { value: "delivered", label: "Delivered", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", dotClass: "bg-emerald-500" },
  { value: "cancelled", label: "Cancelled", badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/30", dotClass: "bg-rose-500" },
];

export const PAYMENT_FILTER_OPTIONS: StatusOption<string>[] = [
  { value: "all", label: "All Payment Statuses", badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700", dotClass: "bg-gray-400" },
  { value: "paid", label: "Paid Only", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", dotClass: "bg-emerald-500" },
  { value: "pending", label: "Pending Only", badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/30", dotClass: "bg-amber-500" },
  { value: "failed", label: "Failed Only", badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/30", dotClass: "bg-rose-500" },
  { value: "refunded", label: "Refunded Only", badgeClass: "bg-sky-500/10 text-sky-600 border-sky-500/30", dotClass: "bg-sky-500" },
];
