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
import type { DashboardStats } from "@/models/dashboard.model";

interface SalesStatisticsChartProps {
  data?: DashboardStats["salesStatistics"];
}

const FALLBACK_SALES_DATA = [
  { day: "Mon", direct: 50, online: 45, express: 20 },
  { day: "Tue", direct: 68, online: 42, express: 28 },
  { day: "Wed", direct: 55, online: 35, express: 18 },
  { day: "Thu", direct: 72, online: 48, express: 30 },
  { day: "Fri", direct: 80, online: 60, express: 35 },
  { day: "Sat", direct: 90, online: 65, express: 40 },
  { day: "Sun", direct: 70, online: 55, express: 32 },
];

export default function SalesStatisticsChart({ data }: SalesStatisticsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data?.weekly?.length ? data.weekly : FALLBACK_SALES_DATA;
  const timeframe = data?.timeframe || "Weekly";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Sales Statistics
        </h2>
        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
          {timeframe}
        </span>
      </div>

      <div className="h-60 w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                domain={[0, 200]}
                ticks={[0, 50, 100, 150, 200]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((acc, curr) => acc + (curr.value as number), 0);
                    return (
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex justify-between gap-4">
                          <span>{label}</span>
                          <span className="text-emerald-500">Total: {total}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-orange-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#F97316]" /> Express
                          </span>
                          <span>{payload[2]?.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-pink-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#EC4899]" /> Online
                          </span>
                          <span>{payload[1]?.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-indigo-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#6366F1]" /> Direct
                          </span>
                          <span>{payload[0]?.value}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Layer 1 (Bottom): Violet */}
              <Bar dataKey="direct" stackId="a" fill="#6366F1" maxBarSize={16} />
              {/* Layer 2 (Middle): Pink */}
              <Bar dataKey="online" stackId="a" fill="#EC4899" maxBarSize={16} />
              {/* Layer 3 (Top): Orange with rounded top cap */}
              <Bar
                dataKey="express"
                stackId="a"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
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
