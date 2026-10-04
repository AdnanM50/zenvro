"use client";

import React from "react";
import { ShoppingBag, DollarSign, Users, ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp } from "lucide-react";

export default function TopMetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. TOTAL SALES */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Hexagon style icon container */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/15 to-rose-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/20 shadow-xs group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                TOTAL SALES
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+1.56%</span>
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            34,945
          </div>
        </div>

        {/* Wavy Underline Sparkline */}
        <div className="mt-4 pt-1">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 16">
            <path
              d="M0 10 Q 25 3, 50 9 T 100 8 T 140 12 T 160 6"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. TOTAL INCOME */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Hexagon style icon container */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                TOTAL INCOME
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-500/20">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-1.56%</span>
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            $378,802
          </div>
        </div>

        {/* Wavy Underline Sparkline */}
        <div className="mt-4 pt-1">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 16">
            <path
              d="M0 12 Q 30 14, 60 7 T 110 11 T 145 6 T 160 9"
              fill="none"
              stroke="#F97316"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. TOTAL VISITOR */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
        <div>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {/* Hexagon style icon container */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                TOTAL VISITOR
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/20">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+1.56%</span>
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            34,945
          </div>
        </div>

        {/* Wavy Underline Sparkline */}
        <div className="mt-4 pt-1">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none" viewBox="0 0 160 16">
            <path
              d="M0 8 Q 30 3, 60 9 T 115 5 T 145 9 T 160 7"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 4. TODAY'S SALE BANNER */}
      <div className="bg-gradient-to-br from-[#0052FF] via-[#1E40AF] to-[#2563EB] text-white rounded-2xl sm:rounded-3xl p-5 shadow-lg shadow-blue-600/15 relative overflow-hidden flex flex-col justify-between group">
        {/* Subtle decorative mesh background */}
        <div className="absolute -right-6 -bottom-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-20 60 Q 40 10, 100 50 T 220 30 T 320 70"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
          <path
            d="M-10 90 Q 60 40, 130 80 T 260 50 T 360 90"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
              <span className="text-lg">🎧</span>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Today&apos;s Sale
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
              <div className="text-xs text-blue-100 font-medium truncate max-w-[140px] sm:max-w-[170px]">
                HeadPhones 68 x 2 samsung
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-white border border-white/30 shadow-xs transition-colors">
            Price: $9.99
          </span>
          <span className="text-[11px] text-blue-100/90 font-medium flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg border border-white/10">
            <TrendingUp className="w-3 h-3 text-emerald-300" />
            High Demand
          </span>
        </div>
      </div>
    </div>
  );
}
