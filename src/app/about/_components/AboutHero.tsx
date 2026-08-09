"use client";

import { useRef } from "react";
import { gsap, useGsap } from "../../../components/about/useGsap";
import RevealHeading from "../../../components/about/RevealHeading";
import TickerBar from "../../../components/about/TickerBar";
import { IMG } from "../../../components/about/data";

// ─── Section 01: Hero / Manifesto ────────────────────────────────────
export default function AboutHero() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useGsap(sectionRef, () => {
    // On-load entrance
    gsap.from("[data-hero-meta]", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.05,
    });

    gsap.from("[data-hero-side]", {
      x: -40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.2,
    });

    gsap.from("[data-hero-cta]", {
      x: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      delay: 0.25,
    });

    gsap.from("[data-hero-col]", {
      y: 60,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.3,
    });

    gsap.from("[data-hero-ticker]", {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "[data-hero-ticker]",
        start: "top 95%",
        once: true,
      },
    });

    // Scroll parallax — the whole strip drifts + scales while scrolling out
    gsap.to("[data-hero-strip]", {
      y: 70,
      scale: 1.04,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Per-image differential parallax inside their frames
    gsap.utils.toArray<HTMLElement>("[data-hero-img]").forEach((img) => {
      const speed = parseFloat(img.dataset.speed || "0");
      if (!speed) return;
      gsap.fromTo(
        img,
        { y: -22 * speed },
        {
          y: 22 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  });

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] flex-col">
      <div className="flex-1 px-6 md:px-12 lg:px-16 pt-28 md:pt-36 flex flex-col">
        {/* Header meta row */}
        <div data-hero-meta className="flex items-start justify-between">
          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            {"// About Velour"}
          </p>
          <p className="hidden md:block font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            Est. MMXVIII
          </p>
          <p className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-primary-fixed">
            (VOL.01)
          </p>
        </div>

        {/* Center hero text */}
        <div className="mt-10 md:mt-16 grid flex-1 grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div data-hero-side className="lg:col-span-2 hidden lg:flex flex-col gap-6 self-start">
            <span className="text-sideways font-label text-[11px] font-black uppercase tracking-[0.3em] text-secondary self-start">
              Where elegance meets sustainability
            </span>
            <span className="w-1 h-1 bg-primary rounded-full" />
          </div>

          <div className="lg:col-span-8">
            <RevealHeading
              text={"The story\nof VELOUR"}
              className="font-headline text-[clamp(3.5rem,11vw,9.5rem)] font-black tracking-[-0.03em] leading-[0.88] uppercase"
            />
          </div>

          <div data-hero-cta className="lg:col-span-2 flex flex-col items-start gap-8 lg:items-end self-end">
            <p className="max-w-[240px] font-body text-sm leading-relaxed text-secondary lg:text-right">
              Crafted in small runs. Worn for a lifetime. VELOUR is an independent fashion house chasing the perfect collision of comfort and design.
            </p>
            <a
              href="#story"
              className="group flex items-center gap-3 font-label text-[11px] font-black uppercase tracking-[0.2em]"
            >
              Scroll to begin
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                <span className="material-symbols-outlined text-[18px] animate-bounce">south</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Editorial image strip */}
      <div
        data-hero-strip
        className="mt-10 md:mt-16 grid grid-cols-12 items-end gap-4 md:gap-6 px-6 md:px-12 lg:px-16 will-change-transform"
      >
        <div data-hero-col className="col-span-4 md:col-span-3">
          <div className="aspect-3/4 overflow-hidden bg-surface-container geometric-clip group">
            <img
              data-hero-img
              data-speed="0.7"
              className="w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-125"
              alt="Close-up of a colorful streetwear jacket"
              src={IMG.jacket}
            />
          </div>
        </div>

        <div data-hero-col className="col-span-8 md:col-span-6">
          <div className="relative overflow-hidden bg-surface-container zig-zag-mask">
            <img
              data-hero-img
              data-speed="1"
              className="w-full h-full object-cover scale-110"
              alt="Model posing in a tan and black luxury streetwear jacket"
              src={IMG.model}
              style={{ aspectRatio: "4/3" }}
            />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-40" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
              ©International - going distance 2026
            </span>
            <span className="font-headline text-2xl font-black tracking-tighter text-primary-fixed">
              (SS/26)
            </span>
          </div>
        </div>

        <div data-hero-col className="col-span-4 md:col-span-3 hidden md:block">
          <div className="aspect-square overflow-hidden bg-surface-container rounded-bl-[4rem] zig-zag-mask group">
            <img
              data-hero-img
              data-speed="0.5"
              className="w-full h-full object-cover scale-110 transition-transform duration-700 group-hover:scale-125"
              alt="Back detail of a jacket with artistic graphic design"
              src={IMG.back}
            />
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div data-hero-ticker>
        <TickerBar className="mt-10 md:mt-16 border-l-0 border-r-0" />
      </div>
    </section>
  );
}
