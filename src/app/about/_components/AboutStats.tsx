"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGsap } from "../../../components/about/useGsap";
import RevealHeading from "../../../components/about/RevealHeading";
import TickerBar from "../../../components/about/TickerBar";
import { STATS } from "../../../components/about/data";

// ─── Section 04: Numbers / CTA ───────────────────────────────────────
export default function AboutStats() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsap(sectionRef, () => {
    gsap.from("[data-stat]", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-stats-grid]", start: "top 80%", once: true },
    });

    // Count-up counters
    gsap.utils.toArray<HTMLElement>("[data-stat-value]").forEach((el) => {
      const value = Number(el.dataset.value || "0");
      const suffix = el.dataset.suffix || "";
      const state = { value: 0 };
      gsap.to(state, {
        value,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(state.value)}${suffix}`;
        },
        onComplete: () => {
          el.textContent = `${value}${suffix}`;
        },
      });
    });

    gsap.from("[data-stats-copy]", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-stats-cta]", start: "top 80%", once: true },
    });

    gsap.from("[data-stats-btn]", {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.15,
      scrollTrigger: { trigger: "[data-stats-cta]", start: "top 80%", once: true },
    });

    gsap.from("[data-stats-ticker]", {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-stats-ticker]", start: "top 95%", once: true },
    });
  });

  return (
    <section ref={sectionRef} className="relative bg-background py-20 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-360 px-6 md:px-12 lg:px-16">
        {/* Stats */}
        <div data-stats-grid className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} data-stat className="border-t border-outline-variant pt-6">
              <p className="font-headline text-6xl md:text-7xl font-black tracking-tighter text-primary-fixed">
                <span
                  data-stat-value
                  data-value={stat.value}
                  data-suffix={stat.suffix}
                  className="tabular-nums"
                >
                  0{stat.suffix}
                </span>
              </p>
              <p className="mt-3 font-label text-[11px] font-black uppercase tracking-[0.24em] text-secondary">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div data-stats-cta className="mt-24 md:mt-40 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <RevealHeading
              text={"Become part\nof the story"}
              className="font-headline text-[clamp(2.5rem,7vw,6.5rem)] font-black tracking-[-0.03em] leading-[0.9] uppercase"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col items-start gap-8 lg:items-end">
            <p data-stats-copy className="max-w-[280px] font-body text-sm leading-[1.8] text-secondary lg:text-right">
              Every drop is a small chapter. Join the community and be first to the next one.
            </p>
            <Link
              data-stats-btn
              href="/products"
              className="group inline-flex items-center gap-4 rounded-full bg-primary text-white px-8 py-4 font-label text-xs font-bold tracking-widest transition-colors hover:bg-primary-fixed"
            >
              Explore the edit
              <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Closing ticker */}
      <div data-stats-ticker className="mt-20 md:mt-32">
        <TickerBar />
      </div>
    </section>
  );
}
