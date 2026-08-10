"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const achievementsData = [
  {
    year: "2018",
    title: "The First Atelier",
    description:
      "Started in a tiny 40m² studio with one sewing table and a belief that luxury should never feel out of reach.",
    image:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200",
  },
  {
    year: "2022",
    title: "Archive Drops Debut",
    description:
      "Our limited numbered-run format debuted. Four signature drops sold out in under an hour, and a community was born.",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200",
  },
  {
    year: "2026",
    title: "Global Sustainability",
    description:
      "Overhauling our supply chain—deadstock fabrics and recycled hardware became the non-negotiable core of every piece across twelve countries.",
    image:
      "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&q=80&w=1200",
  },
];

const Achievement = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  useGSAP(
    () => {
      // Animate each card as it enters the viewport
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const imageWrapper = card.querySelector(".achieve-img-wrapper");
        const image = card.querySelector(".achieve-img");
        const textContent = card.querySelector(".achieve-text");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%", // Trigger when the top of the card hits 85% of the viewport height
            toggleActions: "play none none reverse",
          },
        });

        // 1. Image wrapper un-clips from a center horizontal slit to full height
        tl.fromTo(
          imageWrapper,
          { clipPath: "polygon(0% 49%, 100% 49%, 100% 51%, 0% 51%)" },
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 1.2,
            ease: "power4.inOut",
          }
        );

        // 2. Image inside scales down slightly for a parallax reveal feel
        tl.fromTo(
          image,
          { scale: 1.3 },
          { scale: 1, duration: 1.2, ease: "power4.out" },
          "-=1.2"
        );

        // 3. Text content fades and slides up
        tl.fromTo(
          textContent,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.6"
        );
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-background py-24 md:py-32"
    >
      <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative">
        
        {/* Left Column (Sticky Pinned) */}
        <div className="md:sticky md:top-32 h-fit flex flex-col justify-start pb-12">
          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary mb-6">
            // The Journey
          </p>
          <h2 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
            THE<br />ARCHIVE
          </h2>
          <p className="mt-8 font-body text-sm leading-[1.8] text-secondary max-w-[400px]">
            From a single sewing table to a global community. Explore the milestones that defined our craft, shaped our sustainable ethos, and built a legacy over the past decade.
          </p>
          <div className="mt-10 flex gap-2">
            <span className="w-8 h-1 bg-primary rounded-full" />
            <span className="w-4 h-1 bg-outline-variant rounded-full" />
            <span className="w-4 h-1 bg-outline-variant rounded-full" />
          </div>
        </div>

        {/* Right Column (Scrollable Cards) */}
        <div className="flex flex-col gap-24 md:gap-32 pb-32">
          {achievementsData.map((item, index) => (
            <article
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className="flex flex-col gap-6"
            >
              {/* Image Reveal Box */}
              <div
                className="achieve-img-wrapper relative w-full aspect-[4/5] bg-surface-container overflow-hidden"
                style={{ clipPath: "polygon(0% 49%, 100% 49%, 100% 51%, 0% 51%)" }}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="achieve-img w-full h-full object-cover filter grayscale-[20%]"
                />
              </div>

              {/* Text Content */}
              <div className="achieve-text flex flex-col gap-3">
                <span className="font-mono text-sm text-primary-fixed">
                  ({item.year})
                </span>
                <h3 className="font-headline text-3xl md:text-4xl font-black tracking-tight uppercase">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-secondary leading-[1.7] max-w-[480px]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Achievement;
