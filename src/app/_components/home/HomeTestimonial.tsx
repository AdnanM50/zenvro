"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  fadeUp,
  fadeIn,
  scaleUp,
  staggerContainer,
  staggerItem,
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

  // Clamp during render so a shrinking list (e.g. admin deletes items) never
  // yields an out-of-bounds index — no effect or cascading re-render needed.
  const currentIndex = testimonials.length > 0 ? Math.min(activeIndex, testimonials.length - 1) : 0;
  const current = testimonials.length > 0 ? testimonials[currentIndex] : null;

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
        <>
          {/* Hero Quote Section */}
          <div
            key={current._id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10"
          >
            {/* Left Column: Image & Author */}
            <motion.div
              className="lg:col-span-4 flex flex-col gap-8 order-2 lg:order-1"
              variants={staggerContainer(0.15, 0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
            >
              {/* Image appears first */}
              <motion.div className="relative group" variants={scaleUp}>
                <div className="absolute inset-0 bg-primary-fixed opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg"></div>
                {current.avatar ? (
                  <img
                    alt={`${current.name} Profile`}
                    className="w-full aspect-3/4 object-cover filter grayscale hover:grayscale-0 transition-all duration-700 shadow-xl geometric-clip"
                    src={current.avatar}
                  />
                ) : (
                  <div className="w-full aspect-3/4 bg-surface-container flex items-center justify-center geometric-clip">
                    <span className="font-headline text-9xl font-black text-primary-fixed">
                      {current.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </motion.div>
              {/* Then author info */}
              <motion.div variants={staggerItem}>
                <h3 className="font-headline font-bold text-xl uppercase tracking-tight">{current.name}</h3>
                <p className="font-label text-sm text-secondary uppercase tracking-widest mt-1">{current.role}</p>
              </motion.div>
            </motion.div>

            {/* Right Column: The Quote & Social Proof */}
            <motion.div
              className="lg:col-span-8 order-1 lg:order-2 flex flex-col justify-center gap-12"
              variants={staggerContainer(0.2, 0.2)}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
            >
              <motion.blockquote className="relative" variants={staggerItem}>
                <p className="text-huge font-headline font-extrabold text-foreground tracking-tight leading-none">
                  {current.quote}
                </p>
              </motion.blockquote>
              <motion.div
                className="flex flex-col gap-4 border-l-2 border-primary-fixed pl-8"
                variants={staggerItem}
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
              </motion.div>
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <motion.div
            className="flex justify-between items-center mt-20 md:mt-32"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.2}
          >
            <motion.button
              type="button"
              onClick={goPrev}
              disabled={testimonials.length <= 1}
              aria-label="Previous testimonial"
              className="w-16 h-16 rounded-full border border-outline-variant flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 group disabled:opacity-30 disabled:pointer-events-none"
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
              className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center hover:bg-primary-fixed transition-all duration-300 group disabled:opacity-30 disabled:pointer-events-none"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE_LUXURY }}
            >
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
            </motion.button>
          </motion.div>
        </>
      )}
    </section>
  );
};

export default HomeTestimonial;
