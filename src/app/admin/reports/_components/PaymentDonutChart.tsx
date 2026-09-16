"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PaymentMethodBreakdown } from "@/models/sales-report.model";

type PaymentDonutChartProps = {
  data: PaymentMethodBreakdown[];
};

const GATEWAY_COLORS: Record<string, { stroke: string; bg: string; text: string }> = {
  stripe: { stroke: "#6366f1", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
  cod: { stroke: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  paypal: { stroke: "#06b6d4", bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  other: { stroke: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
};

export default function PaymentDonutChart({ data }: PaymentDonutChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs font-bold text-secondary">
        No payment methods data available.
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  // SVG Donut calculation
  const size = 180;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const getMethodKey = (methodName: string) => {
    const lower = methodName.toLowerCase();
    if (lower.includes("stripe")) return "stripe";
    if (lower.includes("cod") || lower.includes("cash")) return "cod";
    if (lower.includes("paypal")) return "paypal";
    return "other";
  };

  return (
    <div className="flex flex-col items-center gap-6 py-2 w-full">
      {/* SVG Donut Chart */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center my-2">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90 select-none">
          {data.map((item, index) => {
            const percent = totalRevenue > 0 ? item.revenue / totalRevenue : 0;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercent * circumference;
            cumulativePercent += percent;

            const methodKey = getMethodKey(item.method);
            const colorConfig = GATEWAY_COLORS[methodKey] || GATEWAY_COLORS.other;

            return (
              <motion.circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={colorConfig.stroke}
                strokeWidth={activeIdx === index ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                onMouseEnter={() => setActiveIdx(index)}
                onMouseLeave={() => setActiveIdx(null)}
                className="transition-all cursor-pointer"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            );
          })}
        </svg>

        {/* Center Donut Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
            {activeIdx !== null ? data[activeIdx].method : "Total Sales"}
          </span>
          <span className="text-base font-black text-on-surface mt-0.5">
            {activeIdx !== null
              ? formatCurrency(data[activeIdx].revenue)
              : formatCurrency(totalRevenue)}
          </span>
          <span className="text-[10px] font-bold text-primary">
            {activeIdx !== null ? `${data[activeIdx].percentage}% Share` : `${data.length} Gateways`}
          </span>
        </div>
      </div>

      {/* Brand Legend Breakdown */}
      <div className="w-full space-y-2.5">
        {data.map((item, index) => {
          const methodKey = getMethodKey(item.method);
          const colorConfig = GATEWAY_COLORS[methodKey] || GATEWAY_COLORS.other;
          const isSelected = activeIdx === index;

          return (
            <div
              key={index}
              onMouseEnter={() => setActiveIdx(index)}
              onMouseLeave={() => setActiveIdx(null)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-surface-container-high border-primary shadow-xs"
                  : "bg-surface border-surface-container-high hover:border-outline-variant"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: colorConfig.stroke }}
                  />
                  <span className="text-on-surface truncate">{item.method}</span>
                </div>
                <span className="font-black text-on-surface shrink-0">{formatCurrency(item.revenue)}</span>
              </div>
              <div className="flex items-center justify-between mt-2 text-[10px] text-secondary">
                <span>{item.count} {item.count === 1 ? "transaction" : "transactions"}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${colorConfig.bg} ${colorConfig.text}`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
