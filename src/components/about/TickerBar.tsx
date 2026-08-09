"use client";

import { MARQUEE_ITEMS } from "./data";

// ─── Marquee Ticker ──────────────────────────────────────────────────
export default function TickerBar({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full border-y border-outline-variant py-3.5 overflow-hidden bg-surface ${className}`}>
      <div className="collections-marquee flex whitespace-nowrap">
        {[0, 1, 2].map((setIndex) => (
          <div key={setIndex} className="flex items-center shrink-0" aria-hidden={setIndex > 0}>
            {MARQUEE_ITEMS.map((text, i) => (
              <span key={`${setIndex}-${i}`} className="flex items-center">
                <span className="font-label text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface px-4">{text}</span>
                <span className="text-outline text-sm font-light">+</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
