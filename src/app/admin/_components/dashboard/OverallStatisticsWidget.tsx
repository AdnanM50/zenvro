"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function OverallStatisticsWidget() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Overall Statistics
        </h2>
      </div>

      <div className="space-y-4">
        {/* Metric 1: Total Expenses */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Total Expenses</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-0.5 text-[11px]">
              0.45% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
            $134,032
          </div>
          <div className="h-7 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 30" preserveAspectRatio="none">
              <path
                d="M 0 20 C 30 5, 60 25, 90 12 C 120 22, 150 8, 200 15"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: New Users */}
        <div className="pt-2 border-t border-gray-50 dark:border-gray-800/80">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>New Users</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-0.5 text-[11px]">
              11.05% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
            7,893
          </div>
          <div className="h-7 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 30" preserveAspectRatio="none">
              <path
                d="M 0 24 C 35 22, 65 8, 100 18 C 135 25, 165 14, 200 10"
                fill="none"
                stroke="#F97316"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: Returning Users */}
        <div className="pt-2 border-t border-gray-50 dark:border-gray-800/80">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Returning Users</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-0.5 text-[11px]">
              1.69% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">
            3,258
          </div>
          <div className="h-7 w-full overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 200 30" preserveAspectRatio="none">
              <path
                d="M 0 16 C 30 25, 70 8, 110 20 C 145 10, 175 22, 200 12"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
