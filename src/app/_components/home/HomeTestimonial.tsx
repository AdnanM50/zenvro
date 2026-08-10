"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  fadeIn,
  VIEWPORT_CONFIG,
  EASE_LUXURY,
} from "@/lib/animations";
import { usePublicTestimonials } from "@/hooks";
import type { PageSection, Testimonial } from "@/types";

interface HomeTestimonialProps {
  section?: PageSection;
  /** Testimonials prerendered by the server (ISR). Seeds the client cache so
   *  the first paint is instant and no network request fires on mount. */
  initialTestimonials?: Testimonial[] | null;
}

const HomeTestimonial = ({ section, initialTestimonials }: HomeTestimonialProps) => {
  const { data } = usePublicTestimonials({ initialTestimonials });
  const testimonials = data?.data ?? initialTestimonials ?? [];
  const [activeIndex, setActiveIndex] = useState(0);

  const headerIndex = section?.data?.headerIndex || "01/8";
  const tag = section?.data?.tag || "[Testimonial]";
  const footerText = section?.subtitle || section?.data?.footerText || "See What Our Customers Are Saying";

  // Clamp during render so a shrinking list never yields out-of-bounds index
  const currentIndex = testimonials.length > 0 ? Math.min(activeIndex, testimonials.length - 1) : 0;
  const current = testimonials.length > 0 ? testimonials[currentIndex] : null;

  // Refs for GSAP animation targets
  const containerRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const ratingRef = useRef<HTMLDivElement>(null);

  // GSAP animation triggered whenever the active testimonial changes
  useGSAP(
    () => {
      if (!current) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate Avatar Image with luxury scale + opacity fade
      if (imageRef.current) {
        tl.fromTo(
          imageRef.current,
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 0.65 },
          0
        );
      }

      // Animate Hero Quote text reveal
      if (quoteRef.current) {
        tl.fromTo(
          quoteRef.current,
          { opacity: 0, y: 24, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 },
          0.1
        );
      }

      // Animate Author Name & Role
      if (authorRef.current) {
        tl.fromTo(
          authorRef.current.children,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
          0.2
        );
      }

      // Animate Rating Stars & Footer Subtitle
      if (ratingRef.current) {
        tl.fromTo(
          ratingRef.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 0.5 },
          0.25
        );
      }
    },
    { dependencies: [current?._id, activeIndex], scope: containerRef }
  );

  const goPrev = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goNext = () => {
    if (testimonials.length === 0) return;
    setActiveIndex((currentIndex + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="min-h-screen pt-24 pb-12 px-6 md:px-12 max-w-[1600px] mx-auto relative overflow-hidden">
      {/* Header Indicators */}
      <motion.div
        className="flex justify-between items-start mb-16"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        custom={0}
      >
        <div className="font-headline font-extrabold text-2xl tracking-tighter">{headerIndex}</div>
        <div className="text-center absolute left-1/2 -translate-x-1/2">
          <span className="font-label text-xs tracking-[0.3em] uppercase opacity-50">{tag}</span>
        </div>
        <div className="hidden md:block">
          <span className="material-symbols-outlined text-5xl text-surface-container-highest" data-icon="format_quote">format_quote</span>
        </div>
      </motion.div>

      {!current ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <p className="font-label text-xs uppercase tracking-widest text-secondary">
            No testimonials available yet.
          </p>
        </div>
      ) : (
        <div ref={containerRef}>
          {/* Hero Quote Section */}
          <div
            key={current._id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"
          >
            {/* Left Column: Image & Author */}
            <div className="lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1">
              {/* Next.js Optimized Image */}
              <div ref={imageRef} className="relative group overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-primary-fixed opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg z-10 pointer-events-none"></div>
                {current.avatar ? (
                  <div className="relative w-full aspect-3/4 shadow-xl geometric-clip overflow-hidden">
                    <Image
                      alt={`${current.name} Profile`}
                      src={current.avatar}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      quality={75}
                      priority
                      className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-3/4 bg-surface-container flex items-center justify-center geometric-clip">
                    <span className="font-headline text-9xl font-black text-primary-fixed">
                      {current.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Author info */}
              <div ref={authorRef}>
                <h3 className="font-headline font-bold text-xl uppercase tracking-tight">{current.name}</h3>
                <p className="font-label text-sm text-secondary uppercase tracking-widest mt-1">{current.role}</p>
              </div>
            </div>

            {/* Right Column: The Quote & Social Proof */}
            <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col justify-center gap-12">
              <blockquote className="relative">
                <p
                  ref={quoteRef}
                  className="text-huge font-headline font-extrabold text-foreground tracking-tight leading-none"
                >
                  {current.quote}
                </p>
              </blockquote>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                {/* Rating Info */}
                <div
                  ref={ratingRef}
                  className="flex flex-col gap-4 border-l-2 border-primary-fixed pl-8"
                >
                  <div className="flex items-center gap-1 text-primary-fixed">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`material-symbols-outlined ${i < current.rating ? "" : "opacity-20"}`}
                        data-icon="star"
                        data-weight="fill"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                    <span className="ml-2 font-headline font-bold text-foreground">
                      {current.rating.toFixed(1)}
                      {current.reviewCount != null ? ` (${current.reviewCount} Reviews)` : ""}
                    </span>
                  </div>
                  <p className="font-label text-xs uppercase tracking-widest text-secondary">{footerText}</p>
                </div>

                {/* Navigation Controls in Red Marked Area */}
                <div className="flex items-center gap-3 pl-8 sm:pl-0 shrink-0">
                  <motion.button
                    type="button"
                    onClick={goPrev}
                    disabled={testimonials.length <= 1}
                    aria-label="Previous testimonial"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-outline-variant flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 group disabled:opacity-30 disabled:pointer-events-none"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: EASE_LUXURY }}
                  >
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" data-icon="arrow_back">arrow_back</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={goNext}
                    disabled={testimonials.length <= 1}
                    aria-label="Next testimonial"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white flex items-center justify-center hover:bg-primary-fixed transition-all duration-300 group disabled:opacity-30 disabled:pointer-events-none"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: EASE_LUXURY }}
                  >
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HomeTestimonial;
