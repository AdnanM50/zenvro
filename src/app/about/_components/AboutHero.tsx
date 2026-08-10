"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGsap } from "../../../components/about/useGsap";
import RevealHeading from "../../../components/about/RevealHeading";
import TickerBar from "../../../components/about/TickerBar";
import type { PageSection } from "@/types";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1200";

// ─── Section 01: Hero / Manifesto ────────────────────────────────────
interface AboutHeroProps {
  section?: PageSection;
}

export default function AboutHero({ section }: AboutHeroProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const tag = section?.data?.tag || "// About Velour";
  const estText = section?.data?.estText || "Est. MMXVIII";
  const volText = section?.data?.volText || "(VOL.01)";
  const sideText = section?.data?.sideText || "Where elegance meets sustainability";
  const title = section?.title || "The story\nof VELOUR";
  const description = section?.subtitle || section?.data?.description || "Crafted in small runs. Worn for a lifetime. VELOUR is an independent fashion house chasing the perfect collision of comfort and design.";
  const ctaLabel = section?.data?.ctaLabel || "Scroll to begin";
  const ctaLink = section?.data?.ctaLink || "#story";
  const image1 = section?.data?.image1 || section?.data?.bgImage || FALLBACK_IMAGE;
  const image2 = section?.data?.image2 || FALLBACK_IMAGE;
  const image3 = section?.data?.image3 || FALLBACK_IMAGE;
  const copyrightText = section?.data?.copyrightText || "©International - going distance 2026";
  const seasonTag = section?.data?.seasonTag || "(SS/26)";

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
            {tag}
          </p>
          <p className="hidden md:block font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            {estText}
          </p>
          <p className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-primary-fixed">
            {volText}
          </p>
        </div>

        {/* Center hero text */}
        <div className="mt-10 md:mt-16 grid flex-1 grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div data-hero-side className="lg:col-span-2 hidden lg:flex flex-col gap-6 self-start">
            <span className="text-sideways font-label text-[11px] font-black uppercase tracking-[0.3em] text-secondary self-start">
              {sideText}
            </span>
            <span className="w-1 h-1 bg-primary rounded-full" />
          </div>

          <div className="lg:col-span-8">
            <RevealHeading
              text={title}
              className="font-headline text-[clamp(3.5rem,11vw,9.5rem)] font-black tracking-[-0.03em] leading-[0.88] uppercase"
            />
          </div>

          <div data-hero-cta className="lg:col-span-2 flex flex-col items-start gap-8 lg:items-end self-end">
            <p className="max-w-[240px] font-body text-sm leading-relaxed text-secondary lg:text-right">
              {description}
            </p>
            <a
              href={ctaLink}
              className="group flex items-center gap-3 font-label text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {ctaLabel}
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
        className="mt-10 md:mt-16 grid grid-cols-2 md:grid-cols-12 items-end gap-4 md:gap-6 px-6 md:px-12 lg:px-16 will-change-transform"
      >
        <div data-hero-col className="col-span-1 md:col-span-3 order-last md:order-none">
          <div className="relative aspect-3/4 overflow-hidden bg-surface-container group">
            <Image
              data-hero-img
              data-speed="0.7"
              className="object-cover scale-110 transition-transform duration-700 group-hover:scale-125"
              alt="Hero image 1 close-up"
              src={image1}
              fill
              priority
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 border border-white/10 pointer-events-none" />
          </div>
        </div>

        <div data-hero-col className="col-span-2 md:col-span-6 order-first md:order-none">
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
            <Image
              data-hero-img
              data-speed="1"
              className="object-cover scale-110"
              alt="Hero main image"
              src={image2}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-40 z-10" />
            <div className="absolute inset-0 border border-white/10 pointer-events-none" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
              {copyrightText}
            </span>
            <span className="font-headline text-xl md:text-2xl font-black tracking-tighter text-primary-fixed">
              {seasonTag}
            </span>
          </div>
        </div>

        <div data-hero-col className="col-span-1 md:col-span-3 order-last md:order-none">
          <div className="relative aspect-square md:aspect-square overflow-hidden bg-surface-container group">
            <Image
              data-hero-img
              data-speed="0.5"
              className="object-cover scale-110 transition-transform duration-700 group-hover:scale-125"
              alt="Hero image 3 detail"
              src={image3}
              fill
              priority
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 border border-white/10 pointer-events-none" />
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
