"use client";

import { useRef } from "react";
import { gsap, useGsap } from "../../../components/about/useGsap";
import RevealHeading from "../../../components/about/RevealHeading";
import { TIMELINE, IMG } from "../../../components/about/data";

// ─── Section 02: Our Story / Timeline ────────────────────────────────
export default function AboutStory() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsap(sectionRef, () => {
    gsap.from("[data-story-label]", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-story-label]", start: "top 85%", once: true },
    });

    gsap.from("[data-story-copy]", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-story-copy]", start: "top 80%", once: true },
    });

    gsap.from("[data-story-meta]", {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-story-meta]", start: "top 85%", once: true },
    });

    // Parallax editorial image inside the sticky column
    gsap.fromTo(
      "[data-story-img]",
      { y: 60 },
      {
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-story-img-frame]",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );

    // Timeline entries stagger in
    gsap.from("[data-timeline-item]", {
      y: 50,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: "[data-timeline-list]", start: "top 75%", once: true },
    });
  });

  return (
    <section id="story" ref={sectionRef} className="relative px-6 md:px-12 lg:px-16 py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
        {/* Sticky intro */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div data-story-label>
              <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                {"// Our Story"}
              </p>
              <RevealHeading
                text={"Eight years\nin the making"}
                className="mt-6 font-headline text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] uppercase"
              />
            </div>

            <p data-story-copy className="mt-8 max-w-[360px] font-body text-sm leading-[1.8] text-secondary">
              What began as a single sewing table in a tiny studio is now a
              house with one obsession: clothes that feel like they were made
              for you, and made to last. No seasons to chase. No trends to
              obey. Just craft, cut, and intention.
            </p>

            {/* Parallax image */}
            <div
              data-story-img-frame
              className="relative mt-12 hidden lg:block overflow-hidden bg-surface-container collections-image-clip"
            >
              <img
                data-story-img
                className="w-full h-full object-cover scale-125"
                alt="Editorial fashion photography of high-end accessories"
                src={IMG.editorial}
              />
            </div>

            <div data-story-meta className="mt-8 flex items-end gap-4">
              <span className="font-label text-xs font-mono text-secondary">PROJECT_STORY_V02</span>
              <div className="flex gap-2">
                <span className="w-8 h-1 bg-primary rounded-full" />
                <span className="w-4 h-1 bg-outline-variant rounded-full" />
                <span className="w-4 h-1 bg-outline-variant rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div data-timeline-list className="lg:col-span-7 flex flex-col">
          {TIMELINE.map((item) => (
            <div
              key={item.year}
              data-timeline-item
              className="group relative border-l border-outline-variant pl-8 md:pl-14 pb-12 last:pb-0"
            >
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary-fixed transition-transform duration-300 group-hover:scale-150" />
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <span className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-outline-variant transition-colors duration-500 group-hover:text-primary-fixed">
                  {item.year}
                </span>
                <h3 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">
                  {item.title}
                </h3>
              </div>
              <p className="mt-4 max-w-[520px] font-body text-sm leading-[1.8] text-secondary">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
