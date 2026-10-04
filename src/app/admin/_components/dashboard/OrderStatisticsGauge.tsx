"use client";

import React from "react";
import { ArrowUpRight, HelpCircle } from "lucide-react";

export default function OrderStatisticsGauge() {
  // Arc calculation for smooth horseshoe gauge
  // SVG radius 68, center (90, 85)
  // Circumference of full circle = 2 * PI * 68 ≈ 427.25
  // 70% arc = 300 dash length
  const dashArray = 300;
  const percentage = 87.8;
  const dashOffset = dashArray * (1 - percentage / 100);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Order Statistics
          </h2>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
            <span>Earnings</span>
            <HelpCircle className="w-3 h-3 text-emerald-500" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            TOTAL ORDERS
          </span>
          <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            3,736
          </span>
          <span className="inline-flex items-center text-xs font-bold text-emerald-500">
            <ArrowUpRight className="w-3.5 h-3.5" /> 0.57%
          </span>
        </div>
      </div>

      {/* Horseshoe Radial Gauge */}
      <div className="relative flex flex-col items-center justify-center my-3 sm:my-5">
        <svg className="w-48 sm:w-56 h-36 sm:h-40 overflow-visible" viewBox="0 0 180 140">
          <defs>
            <linearGradient id="orderGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d="M 25 110 A 65 65 0 1 1 155 110"
            fill="none"
            stroke="currentColor"
            className="text-gray-100 dark:text-gray-800"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <path
            d="M 25 110 A 65 65 0 1 1 155 110"
            fill="none"
            stroke="url(#orderGaugeGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray="260"
            strokeDashoffset="32"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 text-center">
          <div className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">
            Pending
          </div>
          <div className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            87.8%
          </div>
        </div>
      </div>

      {/* Status Legends */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 font-medium truncate">Delivered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 font-medium truncate">Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 font-medium truncate">Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
          <span className="text-gray-600 dark:text-gray-300 font-medium truncate">Returned</span>
        </div>
      </div>
    </div>
  );
}
