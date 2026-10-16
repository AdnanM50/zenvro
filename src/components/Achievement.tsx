"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { PageSection } from "@/types";

gsap.registerPlugin(ScrollTrigger);

const defaultAchievementsData = [
  {
    year: "2018",
    title: "The First Atelier",
    description:
      "Started in a tiny 40m² studio with one sewing table and a belief that luxury should never feel out of reach.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf",
  },
  {
    year: "2022",
    title: "Archive Drops Debut",
    description:
      "Our limited numbered-run format debuted. Four signature drops sold out in under an hour, and a community was born.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq",
  },
  {
    year: "2026",
    title: "Global Sustainability",
    description:
      "Overhauling our supply chain—deadstock fabrics and recycled hardware became the non-negotiable core of every piece across twelve countries.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve",
  },
];

interface AchievementProps {
  section?: PageSection | null;
}

const Achievement = ({ section }: AchievementProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);

  if (section && section.isActive === false) {
    return null;
  }

  const tag = section?.data?.tag || "// The Journey";
  const title = section?.title || section?.data?.title || "THE\nARCHIVE";
  const description =
    section?.subtitle ||
    section?.data?.description ||
    section?.data?.subtitle ||
    "From a single sewing table to a global community. Explore the milestones that defined our craft, shaped our sustainable ethos, and built a legacy over the past decade.";
  const items =
    section?.data?.items && section.data.items.length > 0
      ? section.data.items
      : defaultAchievementsData;

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
            {tag}
          </p>
          <h2 className="font-headline text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.9]">
            {title.includes("\n") ? (
              title.split("\n").map((line: string, i: number) => (
                <React.Fragment key={i}>
                  {line}
                  {i < title.split("\n").length - 1 && <br />}
                </React.Fragment>
              ))
            ) : (
              title
            )}
          </h2>
          <p className="mt-8 font-body text-sm leading-[1.8] text-secondary max-w-[400px]">
            {description}
          </p>
          <div className="mt-10 flex gap-2">
            <span className="w-8 h-1 bg-primary rounded-full" />
            <span className="w-4 h-1 bg-outline-variant rounded-full" />
            <span className="w-4 h-1 bg-outline-variant rounded-full" />
          </div>
        </div>

        {/* Right Column (Scrollable Cards) */}
        <div className="flex flex-col gap-24 md:gap-32 pb-32">
          {items.map((item: any, index: number) => (
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
