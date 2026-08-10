"use client";

import { useRef } from "react";
import { gsap, useGsap } from "../../../components/about/useGsap";
import RevealHeading from "../../../components/about/RevealHeading";
import type { PageSection } from "@/types";

// ─── Section 03: The Craft / Values ──────────────────────────────────
interface AboutValuesProps {
  section?: PageSection;
}

export default function AboutValues({ section }: AboutValuesProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const tag = section?.data?.tag || "// The Craft";
  const title = section?.title || "What we\nstand for";
  const description = section?.subtitle || section?.data?.description || "Six principles, non-negotiable. They shape every cut, every fabric, and every piece we let out the door.";
  const valueItems: Array<{ icon: string; title: string; copy: string; tag: string }> =
    (section?.data?.items || []).map((it: any, idx: number) => ({
      icon: it.icon || "auto_awesome",
      title: it.title || "Craft Value",
      copy: it.copy || it.description || "",
      tag: it.tag || `CRAFT_0${idx + 1}`,
    }));

  useGsap(sectionRef, () => {
    gsap.from("[data-values-label]", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-values-label]", start: "top 85%", once: true },
    });

    gsap.from("[data-values-copy]", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-values-copy]", start: "top 80%", once: true },
    });

    // Cards unfold from a vertical slit to their custom clipped silhouette
    const cards = gsap.utils.toArray<HTMLElement>("[data-values-card]");
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: "[data-values-grid]", start: "top 82%", once: true },
    });

    cards.forEach((card, index) => {
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const cut = 28;
      const full = `polygon(0px 0px, ${w - cut}px 0px, ${w}px ${cut}px, ${w}px ${h}px, ${cut}px ${h}px, 0px ${h - cut}px)`;
      const slit = `polygon(${w / 2}px 0px, ${w / 2}px 0px, ${w / 2}px ${cut}px, ${w / 2}px ${h}px, ${w / 2}px ${h}px, ${w / 2}px ${h - cut}px)`;

      timeline.fromTo(
        card,
        { clipPath: slit, y: 30 },
        {
          clipPath: full,
          y: 0,
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            // Hand clip-path back to the class so hover deepening still works
            gsap.set(card, { clearProps: "clipPath,y" });
            card.classList.add("values-card-ready");
          },
        },
        index * 0.12
      );
    });
  });

  return (
    <section ref={sectionRef} className="relative bg-surface py-20 md:py-32 border-y border-outline-variant">
      <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div data-values-label>
            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              {tag}
            </p>
            <RevealHeading
              text={title}
              className="mt-6 font-headline text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9] uppercase"
            />
          </div>
          <p data-values-copy className="max-w-[300px] font-body text-sm leading-[1.8] text-secondary md:text-right">
            {description}
          </p>
        </div>

        <div data-values-grid className="mt-14 md:mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valueItems.map((value, idx) => (
            <article
              key={value.tag || idx}
              data-values-card
              className="group relative flex min-h-[320px] flex-col justify-between border border-outline-variant bg-background p-8 [clip-path:polygon(0_0,calc(100%_-_28px)_0,100%_28px,100%_100%,28px_100%,0_calc(100%_-_28px))] transition-colors duration-500 hover:bg-primary hover:text-white hover:[clip-path:polygon(0_0,calc(100%_-_52px)_0,100%_52px,100%_100%,52px_100%,0_calc(100%_-_52px))]"
            >
              <span className="pointer-events-none absolute -left-14 top-1/2 h-px w-48 -rotate-45 bg-outline-variant/70 transition-colors duration-500 group-hover:bg-white/20" />

              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container transition-colors duration-500 group-hover:bg-white/15">
                  <span className="material-symbols-outlined text-2xl text-primary-fixed transition-colors duration-500 group-hover:text-white">
                    {value.icon}
                  </span>
                </span>
                <span className="font-mono text-xs text-secondary transition-colors duration-500 group-hover:text-white/60">
                  {value.tag}
                </span>
              </div>

              <div>
                <h3 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">
                  {value.title}
                </h3>
                <p className="mt-4 font-body text-sm leading-[1.7] text-secondary transition-colors duration-500 group-hover:text-white/80">
                  {value.copy}
                </p>
              </div>

              <span className="absolute right-8 top-1/2 h-px w-0 bg-white transition-all duration-500 group-hover:w-16" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
