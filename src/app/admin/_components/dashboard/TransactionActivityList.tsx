"use client";

import React from "react";
import type { DashboardStats } from "@/models/dashboard.model";

interface TransactionActivityListProps {
  data?: DashboardStats["transactionActivity"];
}

const FALLBACK_TRANSACTIONS = [
  {
    id: "1",
    name: "Stripe",
    date: "Today 7:18 AM",
    amount: "+$580.00",
    isPositive: true,
    initial: "S",
  },
  {
    id: "2",
    name: "Cashback",
    date: "01 Jan, 11:44 AM",
    amount: "+$560.00",
    isPositive: true,
    initial: "C",
  },
  {
    id: "3",
    name: "Refund from amazon",
    date: "Today 7:18 AM",
    amount: "-$60.00",
    isPositive: false,
    initial: "a",
  },
  {
    id: "4",
    name: "Refund from amazon",
    date: "Today 7:18 AM",
    amount: "-$60.00",
    isPositive: false,
    initial: "a",
  },
  {
    id: "5",
    name: "Refund from amazon",
    date: "Today 7:18 AM",
    amount: "-$60.00",
    isPositive: false,
    initial: "a",
  },
  {
    id: "6",
    name: "PayPal Checkout",
    date: "Yesterday 4:20 PM",
    amount: "+$1,280.00",
    isPositive: true,
    initial: "P",
  },
];

export default function TransactionActivityList({ data }: TransactionActivityListProps) {
  const transactions = data?.length ? data : FALLBACK_TRANSACTIONS;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Transaction Activity
        </h2>
      </div>

      <div className="divide-y divide-gray-50 dark:divide-gray-800/80">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="py-3 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold flex items-center justify-center text-sm shrink-0">
                {tx.initial}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                  {tx.name}
                </div>
                <div className="text-[11px] text-gray-400 dark:text-gray-500">
                  {tx.date}
                </div>
              </div>
            </div>

            <div
              className={`text-xs sm:text-sm font-extrabold tracking-tight ${
                tx.isPositive
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-rose-500 dark:text-rose-400"
              }`}
            >
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
