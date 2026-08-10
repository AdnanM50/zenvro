"use client";

const DEFAULT_MARQUEE_ITEMS = [
  "Independent Atelier",
  "Craft Over Quantity",
  "Built to Endure",
  "Zero-Waste Patterning",
  "Limited Drops Only",
  "Est. MMXVIII",
];

// ─── Marquee Ticker ──────────────────────────────────────────────────
export default function TickerBar({
  className = "",
  items = DEFAULT_MARQUEE_ITEMS,
}: {
  className?: string;
  items?: string[];
}) {
  const list = items.length > 0 ? items : DEFAULT_MARQUEE_ITEMS;

  return (
    <div className={`w-full border-y border-outline-variant py-3.5 overflow-hidden bg-surface ${className}`}>
      <div className="collections-marquee flex whitespace-nowrap">
        {[0, 1, 2].map((setIndex) => (
          <div key={setIndex} className="flex items-center shrink-0" aria-hidden={setIndex > 0}>
            {list.map((text: string, i: number) => (
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
