"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  fadeLeft,
  fadeRight,
  fadeUp,
  scaleIn,
  VIEWPORT_CONFIG,
} from "@/lib/animations";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax on the model image
  const modelY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const modelScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <div
      ref={heroRef}
      className="bg-background font-sans text-on-surface selection:bg-primary-fixed selection:text-white overflow-hidden min-h-[calc(100vh-72px)] flex flex-col"
    >
      <main className="relative flex-1  pb-1 flex items-start justify-center">
        <div className="w-full max-w-[1340px] mx-auto px-6 md:px-12 relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-0">
          {/* Left Side Text Content */}
          <motion.div
            className="col-span-full md:col-span-4 z-20 flex flex-col justify-between h-full py-10 md:py-20 overflow-hidden"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.1}
          >
            <div className="space-y-12 ">
              <div className="hero-text text-black">
                where<br />- style
              </div>

              <div className="space-y-8 md:space-y-12">
                <p className="font-mono text-[10px] md:text-xs tracking-widest text-neutral-500 uppercase font-bold">{"// FASHION"}</p>
                <p className="text-sm leading-relaxed max-w-[240px] text-neutral-600">
                  Explore curated collections, exclusive drops, and everyday essentials all thoughtfully designed in one stylish shopping destination.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] md:text-xs tracking-tight text-neutral-500">/ New</p>
                  <p className="font-mono text-[10px] md:text-xs tracking-tight text-neutral-500">Collection 2026</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Central Image */}
          <motion.div
            className="col-span-full md:col-span-4 flex justify-center z-10 md:-mx-32 pointer-events-none"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.2}
          >
            <motion.div
              className="relative w-full md:w-[100%] aspect-square md:h-[30rem] group pointer-events-auto"
              style={{ y: modelY, scale: modelScale }}
            >
              <img
                alt="High-fashion model"
                className="w-full h-full object-contain"
                style={{
                  maskImage: "radial-gradient(circle, black 60%, transparent 95%)",
                  WebkitMaskImage: "radial-gradient(circle, black 60%, transparent 95%)",
                }}
                src="/hero/model-Photoroom.png"
              />
            </motion.div>
          </motion.div>

          {/* Right Side Text Content */}
          <motion.div
            className="col-span-full md:col-span-4 z-20 flex flex-col justify-between h-full py-10 md:py-20 items-start md:items-end text-left md:text-right overflow-hidden"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.1}
          >
            <div className=" w-full">
              <div className="flex flex-col items-start md:items-end w-full">
                <p className="font-mono text-[10px] md:text-xs tracking-widest text-neutral-500 uppercase font-bold mb-4 md:mb-8 leading-tight">{"// STYLED FOR"}<br />LIFE.</p>
                <div className="hero-text text-black">
                  lives<br />- now
                </div>
              </div>

              <div className="pt-6 md:pt-12 space-y-12 ">
                <motion.div
                  className="flex items-center justify-start md:justify-end gap-3"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT_CONFIG}
                  custom={0.4}
                >
                  <div className="flex -space-x-3">
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/hero/avatar1.png" alt="Avatar" />
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src="/hero/avatar2.png" alt="Avatar" />
                  </div>
                  <button className="w-10 h-10 rounded-full bg-primary-fixed text-white flex items-center justify-center shadow-lg hover:rotate-90 transition-transform duration-300">
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </motion.div>

                <div className="flex justify-start md:justify-end md:pr-12">
                  <span className="material-symbols-outlined text-primary-fixed text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>local_florist</span>
                </div>

                <motion.div
                  className="space-y-1"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={VIEWPORT_CONFIG}
                  custom={0.5}
                >
                  <p className="text-4xl md:text-5xl font-black tracking-tighter">280K</p>
                  <p className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">PEOPLE WE INSPIRE</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Marquee Footer */}
      <motion.div
        className="mt-8 border-y border-surface-container py-4 xl:py-6 overflow-hidden w-full"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        custom={0.3}
      >
        <div className="marquee">
          <div className="marquee-content flex items-center gap-6 xl:gap-12 text-primary font-headline font-black text-lg xl:text-2xl uppercase tracking-[0.2em]">
            <span>T STYLING + CRAFTED STORIES + PREMIUM MATERIALS + PREMIUM FABRICS + TIMELESS CUTS + URBAN INFLUENCE</span>
            <span aria-hidden="true">T STYLING + CRAFTED STORIES + PREMIUM MATERIALS + PREMIUM FABRICS + TIMELESS CUTS + URBAN INFLUENCE</span>
            <span aria-hidden="true">T STYLING + CRAFTED STORIES + PREMIUM MATERIALS + PREMIUM FABRICS + TIMELESS CUTS + URBAN INFLUENCE</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
