"use client";

import React from "react";
import {
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  Sparkles,
} from "lucide-react";
import type { DashboardStats } from "@/models/dashboard.model";

interface TopMetricCardsProps {
  data?: DashboardStats["topMetrics"];
}

export default function TopMetricCards({ data }: TopMetricCardsProps) {
  const totalIncome = data?.totalIncome;
  const totalVisitors = data?.totalVisitors;
  const totalBalance = data?.totalBalance;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
      {/* LEFT SECTION (9 COLUMNS): Metric Cards matching marked width */}
      <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-stretch">
        {/* 1. TOTAL INCOME */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-green-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                  TOTAL INCOME
                </span>
              </div>
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                totalIncome?.isPositive !== false
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/20"
                  : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-500/20"
              }`}>
                {totalIncome?.isPositive !== false ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{totalIncome ? `${totalIncome.growth > 0 ? '+' : ''}${totalIncome.growth}%` : "-1.56%"}</span>
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {totalIncome?.formatted || "$378,802"}
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

        {/* 2. TOTAL VISITOR */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/15 to-indigo-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
                  TOTAL VISITOR
                </span>
              </div>
              <div className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                totalVisitors?.isPositive !== false
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-500/20"
                  : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-500/20"
              }`}>
                {totalVisitors?.isPositive !== false ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{totalVisitors ? `${totalVisitors.growth > 0 ? '+' : ''}${totalVisitors.growth}%` : "+1.56%"}</span>
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {totalVisitors?.formatted || "34,945"}
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
      </div>

      {/* RIGHT SECTION (3 COLUMNS): Premium ZENVRO Debit Card with Total Balance */}
      <div className="lg:col-span-3 flex flex-col">
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-950 via-slate-900 to-black text-white p-5 sm:p-5.5 shadow-xl shadow-black/25 border border-white/10 flex flex-col justify-between h-full min-h-[180px] group transition-all duration-300 hover:shadow-2xl hover:border-white/20">
          {/* Subtle metallic sheen & holographic background effects */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          
          {/* ZENVRO subtle background watermark */}
          <div className="absolute right-3 bottom-2 text-white/[0.04] font-black text-5xl tracking-tighter select-none pointer-events-none uppercase">
            ZENVRO
          </div>

          {/* Card Top: Brand Name + Chip + Contactless */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-[0.22em] text-white uppercase drop-shadow-sm">
                  ZENVRO
                </span>
                <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded tracking-widest uppercase">
                  DEBIT
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                Business Platinum
              </span>
            </div>

            {/* Contactless Wave Icon */}
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-gray-300 rotate-90" />
              {/* EMV Smart Chip Graphic */}
              <div className="w-8 h-6 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 p-[1.5px] shadow-xs shrink-0">
                <div className="w-full h-full rounded-[4px] bg-amber-400/90 border border-amber-600/40 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-700/50" />
                  <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-700/50" />
                  <div className="w-2.5 h-2 rounded-[2px] border border-amber-700/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Card Middle: Total Balance Amount (Total Sell Amount) */}
          <div className="relative z-10 my-3">
            <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <span>TOTAL BALANCE</span>
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-[28px] font-black tracking-tight text-white mt-0.5 drop-shadow-md">
              {totalBalance?.formatted || "$378,802.00"}
            </div>
          </div>

          {/* Card Bottom: Masked Card Number, Expiry, Dual Circle Hologram */}
          <div className="relative z-10 flex items-end justify-between pt-2 border-t border-white/10">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-gray-300">
                {totalBalance?.cardNumber || "•••• •••• •••• 8842"}
              </div>
              <div className="flex items-center gap-3 text-[9px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider">
                <span>CARDHOLDER: {totalBalance?.cardHolder || "ZENVRO STORE"}</span>
                <span>EXP: {totalBalance?.expiry || "12/29"}</span>
              </div>
            </div>

            {/* Overlapping Luxury Network Circles */}
            <div className="flex -space-x-2 shrink-0">
              <div className="w-5 h-5 rounded-full bg-rose-500/80 backdrop-blur-xs border border-white/20 shadow-xs" />
              <div className="w-5 h-5 rounded-full bg-amber-400/80 backdrop-blur-xs border border-white/20 shadow-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
