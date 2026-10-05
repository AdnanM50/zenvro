"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";
import type { DashboardStats } from "@/models/dashboard.model";

interface RevenueReportChartProps {
  data?: DashboardStats["revenueReport"];
}

const FALLBACK_YEARLY = [
  { month: "Jan", earning: 22000, expense: 12000 },
  { month: "Feb", earning: 18000, expense: 15000 },
  { month: "Mar", earning: 27000, expense: 16000 },
  { month: "Apr", earning: 43000, expense: 33000 },
  { month: "May", earning: 19000, expense: 16000 },
  { month: "Jun", earning: 25000, expense: 18000 },
  { month: "Jul", earning: 16000, expense: 13000 },
  { month: "Aug", earning: 28000, expense: 18000 },
  { month: "Sep", earning: 47000, expense: 35000 },
  { month: "Oct", earning: 21000, expense: 16000 },
  { month: "Nov", earning: 28000, expense: 19000 },
  { month: "Dec", earning: 24000, expense: 16000 },
];

const FALLBACK_MONTHLY = [
  { month: "W1", earning: 32000, expense: 18000 },
  { month: "W2", earning: 48000, expense: 22000 },
  { month: "W3", earning: 41000, expense: 29000 },
  { month: "W4", earning: 54000, expense: 31000 },
];

export default function RevenueReportChart({ data }: RevenueReportChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<"Yearly" | "Monthly">("Yearly");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const yearlyData = data?.yearly?.length ? data.yearly : FALLBACK_YEARLY;
  const monthlyData = data?.monthly?.length ? data.monthly : FALLBACK_MONTHLY;
  const chartData = timeframe === "Yearly" ? yearlyData : monthlyData;

  const formattedEarnings = data?.formattedEarnings || "$500,00,000.00";
  const formattedExpenses = data?.formattedExpenses || "$20,000.00";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            Revenue Report
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Earning: <span className="font-bold text-gray-900 dark:text-white">{formattedEarnings}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                Expense: <span className="font-bold text-gray-900 dark:text-white">{formattedExpenses}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative shrink-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as "Yearly" | "Monthly")}
            className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 py-1.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer transition-colors"
          >
            <option value="Yearly">Yearly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full mt-2">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                domain={[0, 60000]}
                ticks={[0, 15000, 30000, 45000, 60000]}
                tickFormatter={(val) => (val === 0 ? "0" : `${val}`)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl text-xs">
                        <div className="font-bold text-gray-900 dark:text-white mb-2">
                          {label}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                          Earning: ${(payload[0].value as number).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium mt-1">
                          <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                          Expense: ${(payload[1].value as number).toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Blue Bar for Earning with rounded top */}
              <Bar
                dataKey="earning"
                fill="#2563EB"
                radius={[4, 4, 0, 0]}
                maxBarSize={14}
              />
              {/* Orange Bar for Expense with rounded top */}
              <Bar
                dataKey="expense"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl animate-pulse" />
        )}
      </div>
    </div>
  );
}
