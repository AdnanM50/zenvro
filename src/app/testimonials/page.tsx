"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApiGet } from "@/hooks/use-api";
import { getPublicTestimonials } from "@/services/testimonial.service";
import type { Testimonial } from "@/types";
import {
  EASE_LUXURY,
  VIEWPORT_CONFIG,
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

export default function TestimonialsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const { data: testimonialsData, isLoading } = useApiGet<Testimonial[]>({
    queryKey: ["public-testimonials", searchTerm],
    queryFn: () => getPublicTestimonials({ all: true, search: searchTerm || undefined }),
  });

  const testimonials: Testimonial[] = useMemo(() => {
    const raw: any = testimonialsData?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.testimonials)) return raw.testimonials;
    return [];
  }, [testimonialsData]);

  return (
    <main className="bg-surface text-on-surface overflow-hidden min-h-screen">
      {/* ─── Header ─── */}
      <section className="pt-28 md:pt-36 pb-12 px-5 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.05}
            className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary"
          >
            {"// Voices & Reviews"}
          </motion.p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl"
            >
              testimonials
            </motion.h1>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
              className="flex items-center gap-4 pb-1"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c00]" />
              <p className="font-label text-xs font-black uppercase tracking-[0.2em] text-secondary">
                {testimonials.length} verified {testimonials.length === 1 ? "review" : "reviews"}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Marquee Divider ─── */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={0.2}
        className="border-y border-outline-variant py-3 overflow-hidden bg-background"
      >
        <div className="marquee">
          <div className="marquee-content flex items-center gap-6 font-label text-xs font-black uppercase tracking-[0.3em] text-secondary">
            <span>Verified buyers</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>Architectural quality</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>5.0 rated customer experience</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>VELOUR DIRECT VOICES</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Stats & Filter Bar ─── */}
      <section className="px-5 md:px-10 lg:px-16 pt-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="border border-outline-variant bg-background p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <div>
                <p className="font-headline text-2xl font-black">4.9 / 5.0</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                  Average Rating
                </p>
              </div>
            </div>

            <div className="border border-outline-variant bg-background p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="font-headline text-2xl font-black">100%</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                  Verified Buyers
                </p>
              </div>
            </div>

            <div className="border border-outline-variant bg-background p-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <div>
                <p className="font-headline text-2xl font-black">Worldwide</p>
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                  Global Shipping & Support
                </p>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-12">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search testimonials by keyword, reviewer, or location..."
              className="w-full h-14 border border-outline-variant bg-background pl-12 pr-4 text-sm font-medium text-on-surface placeholder:text-secondary outline-none transition focus:border-black dark:focus:border-white"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-[20px]">
              search
            </span>
          </div>

          {/* ─── Testimonials Grid ─── */}
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20"
          >
            {testimonials.map((item) => (
              <motion.article
                key={item._id}
                variants={staggerItem}
                className="border border-outline-variant bg-background p-8 flex flex-col justify-between gap-6 transition duration-500 hover:border-black dark:hover:border-white"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[18px] text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-base leading-7 font-medium text-on-surface">
                    "{item.quote}"
                  </p>
                </div>

                {/* Reviewer Profile */}
                <div className="flex items-center gap-4 border-t border-outline-variant/60 pt-6">
                  {item.avatar && !imageErrors[item._id] ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      onError={() => setImageErrors((prev) => ({ ...prev, [item._id]: true }))}
                      className="h-12 w-12 rounded-full object-cover border border-outline-variant"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container font-headline text-lg font-black text-primary">
                      {item.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline text-base font-black">{item.name}</h3>
                      <span className="material-symbols-outlined text-[16px] text-primary" title="Verified Buyer">
                        verified
                      </span>
                    </div>
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-secondary mt-0.5">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
