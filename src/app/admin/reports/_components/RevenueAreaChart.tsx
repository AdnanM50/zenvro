"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SalesTimelinePoint } from "@/models/sales-report.model";

type RevenueAreaChartProps = {
  data: SalesTimelinePoint[];
};

export default function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-bold text-secondary">
        No sales timeline data available for chart rendering.
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Dimensions for SVG coordinate space
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const chartWidth = svgWidth - paddingX * 2;

  // Calculate coordinates for points
  const points = data.map((item, index) => {
    const x = paddingX + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2);
    const y = paddingTop + chartHeight - (item.revenue / maxRevenue) * chartHeight;
    return { x, y, item };
  });

  // Generate SVG path string with smooth Bezier curve
  const generateAreaPath = () => {
    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${svgHeight - paddingBottom} Z`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;

      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    // Close path to bottom for gradient fill
    const areaPath = `${path} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;
    return { linePath: path, areaPath };
  };

  const pathResult = generateAreaPath();
  const linePath = typeof pathResult === "object" ? pathResult.linePath : "";
  const areaPath = typeof pathResult === "object" ? pathResult.areaPath : "";

  // Y-axis grid ticks
  const yTicks = [0, maxRevenue * 0.33, maxRevenue * 0.66, maxRevenue];

  return (
    <div className="relative w-full overflow-hidden pt-2">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #ff5c00)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary, #ff5c00)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => {
          const y = paddingTop + chartHeight - (tick / maxRevenue) * chartHeight;
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-outline-variant/30"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-secondary text-[10px] font-bold"
              >
                {formatCurrency(tick)}
              </text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        <motion.path
          d={areaPath}
          fill="url(#revenueGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Smooth Curved Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-primary, #ff5c00)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* Data Points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === i ? 7 : 4}
              className="fill-background stroke-primary stroke-[3px] transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
            {/* X-axis date labels */}
            <text
              x={pt.x}
              y={svgHeight - 8}
              textAnchor="middle"
              className={`text-[10px] font-bold uppercase transition-all ${
                hoveredIndex === i ? "fill-primary font-black text-xs" : "fill-secondary"
              }`}
            >
              {pt.item.date.split(",")[0]}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating Interactive Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-20 bg-black/90 text-white p-3 rounded-xl shadow-xl backdrop-blur-sm pointer-events-none transition-all transform -translate-x-1/2 -translate-y-full border border-white/20"
          style={{
            left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
            top: `${(points[hoveredIndex].y / svgHeight) * 100 - 8}%`,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            {points[hoveredIndex].item.date}
          </p>
          <p className="text-base font-black text-primary mt-0.5">
            {formatCurrency(points[hoveredIndex].item.revenue)}
          </p>
          <p className="text-[11px] font-bold text-gray-200 mt-0.5">
            {points[hoveredIndex].item.ordersCount} {points[hoveredIndex].item.ordersCount === 1 ? "order" : "orders"}
          </p>
        </div>
      )}
    </div>
  );
}
