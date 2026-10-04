"use client";

import React from "react";
import { Package, Users, ShoppingCart, BarChart3 } from "lucide-react";

export default function StatGridCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {/* Total Products */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Total Products
          </span>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            300
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Increase by <span className="text-emerald-500 font-bold">+200</span> this week
          </div>
        </div>
      </div>

      {/* Total Customer */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Total Customer
          </span>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            50,000
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Increase by <span className="text-rose-500 font-bold">-5k</span> this week
          </div>
        </div>
      </div>

      {/* Total Orders */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Total Orders
          </span>
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            1500
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Increase by <span className="text-emerald-500 font-bold">+1k</span> this week
          </div>
        </div>
      </div>

      {/* Total Sales */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-gray-200 dark:hover:border-gray-700 transition-all">
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Total Sales
          </span>
          <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">
            $25,00,000.00
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Increase by <span className="text-emerald-500 font-bold">+$10k</span> this week
          </div>
        </div>
      </div>
    </div>
  );
}
