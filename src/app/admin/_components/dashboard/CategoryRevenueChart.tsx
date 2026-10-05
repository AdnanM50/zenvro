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

interface CategoryRevenueChartProps {
  data?: DashboardStats["categoryRevenue"];
}

const FALLBACK_CATEGORY_DATA = [
  { name: "Store A", category: "Electronics", revenue: 4800 },
  { name: "Store B", category: "Wearables", revenue: 7200 },
  { name: "Store C", category: "Audio", revenue: 4500 },
  { name: "Store D", category: "Mobiles", revenue: 8000 },
  { name: "Store E", category: "Gaming", revenue: 6500 },
  { name: "Store F", category: "Laptops", revenue: 9200 },
  { name: "Store G", category: "Cameras", revenue: 6400 },
  { name: "Store H", category: "Displays", revenue: 6300 },
  { name: "Store I", category: "Smart Home", revenue: 3200 },
  { name: "Store J", category: "Storage", revenue: 6500 },
  { name: "Store K", category: "Network", revenue: 6500 },
  { name: "Store W", category: "Accessories", revenue: 3500 },
  { name: "Store X", category: "Cables", revenue: 6600 },
  { name: "Store Z", category: "Power", revenue: 6800 },
];

export default function CategoryRevenueChart({ data }: CategoryRevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = data?.categories?.length ? data.categories : FALLBACK_CATEGORY_DATA;
  const totalRevenue = data?.totalRevenue ? `$${data.totalRevenue.toLocaleString()}` : "$30,000";
  const totalCategories = data?.totalCategories || 14;
  const averageRevenue = data?.averageRevenue ? `$${data.averageRevenue.toLocaleString()}` : "$6,000";
  const highest = data?.highestCategory ? `${data.highestCategory.name} ($${data.highestCategory.amount.toLocaleString()})` : "Laptops ($9,200)";
  const lowest = data?.lowestCategory ? `${data.lowestCategory.name} ($${data.lowestCategory.amount.toLocaleString()})` : "Smart Home ($3,200)";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header & Sub-metrics */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Top Category Revenue Statistics
            </h2>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Total Revenue: <span className="font-semibold text-gray-800 dark:text-gray-200">{totalRevenue}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Highest: <span className="font-semibold text-gray-800 dark:text-gray-200">{highest}</span>{" "}
              Lowest: <span className="font-semibold text-gray-800 dark:text-gray-200">{lowest}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:text-right shrink-0">
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Total Categories</div>
              <div className="text-sm sm:text-base font-black text-gray-900 dark:text-white">{totalCategories}</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Average Revenue</div>
              <div className="text-sm sm:text-base font-black text-emerald-500">{averageRevenue}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 sm:h-72 w-full mt-4">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-gray-100 dark:text-gray-800"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 10 }}
                domain={[0, 10000]}
                ticks={[0, 2500, 5000, 7500, 10000]}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const itemData = payload[0].payload;
                    return (
                      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl text-xs space-y-1">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {itemData.category} ({itemData.name})
                        </div>
                        <div className="text-emerald-500 font-extrabold text-sm">
                          ${itemData.revenue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Performance: +14.2% vs last month
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Rounded pill shaped green bars like screenshot */}
              <Bar
                dataKey="revenue"
                fill="#10B981"
                radius={[8, 8, 8, 8]}
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
