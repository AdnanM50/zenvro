"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  fadeIn,
  scaleUp,
  staggerContainer,
  staggerItem,
  VIEWPORT_CONFIG,
  EASE_LUXURY,
} from "@/lib/animations";

const Testimonial = () => {
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
        <div className="font-headline font-extrabold text-2xl tracking-tighter">01/8</div>
        <div className="text-center absolute left-1/2 -translate-x-1/2">
          <span className="font-label text-xs tracking-[0.3em] uppercase opacity-50">[Testimonial]</span>
        </div>
        <div className="hidden md:block">
          <span className="material-symbols-outlined text-5xl text-surface-container-highest" data-icon="format_quote">format_quote</span>
        </div>
      </motion.div>

      {/* Hero Quote Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
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
            <div className="absolute inset-0 bg-primary-fixed opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-lg z-10 pointer-events-none"></div>
            <div className="relative w-full aspect-3/4 shadow-xl geometric-clip overflow-hidden">
              <Image
                alt="Fashion Stylist Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn86UomaXCYKGME9gdwpyjHvfq2QMkZYhlDZQzwXii2NJ3QutwTXQln53Kv_G431CcLy9zi8lL-znmVkSvPZxjBfFo-aOnii8DFdgO-DOYz7BiZ9n-OUAs4VZBuPuJbeGHmo1eKxmwkLdaVJdvHN7d9Rev5g9Z_oMTlaIljZzxiS77OAXok8rHgTvlmvntOER1bqZsk9yruNKXIsgo0dTG9xefrrp3Z_f95Np6z2-XLodRzf_snomxfiw2h45UgrrfYVnaoVtY6BmG"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                quality={75}
                priority
                className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </motion.div>
          {/* Then author info */}
          <motion.div variants={staggerItem}>
            <h3 className="font-headline font-bold text-xl uppercase tracking-tight">[Emma Williams]</h3>
            <p className="font-label text-sm text-secondary uppercase tracking-widest mt-1">Fashion Stylist</p>
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
              Everything is absolutely perfect! From the fabric quality to the flawless fit every piece feels premium. This brand has completely transformed my wardrobe.
            </p>
          </motion.blockquote>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <motion.div
              className="flex flex-col gap-4 border-l-2 border-primary-fixed pl-8"
              variants={staggerItem}
            >
              <div className="flex items-center gap-1 text-primary-fixed">
                <span className="material-symbols-outlined" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" data-icon="star" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="ml-2 font-headline font-bold text-foreground">5.0 (49 Reviews)</span>
              </div>
              <p className="font-label text-xs uppercase tracking-widest text-secondary">See What Our Customers Are Saying</p>
            </motion.div>

            {/* Navigation Controls */}
            <motion.div
              className="flex items-center gap-3 pl-8 sm:pl-0 shrink-0"
              variants={staggerItem}
            >
              <motion.button
                type="button"
                aria-label="Previous testimonial"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-outline-variant flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 group"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: EASE_LUXURY }}
              >
                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" data-icon="arrow_back">arrow_back</span>
              </motion.button>
              <motion.button
                type="button"
                aria-label="Next testimonial"
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black text-white flex items-center justify-center hover:bg-primary-fixed transition-all duration-300 group"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: EASE_LUXURY }}
              >
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonial;
