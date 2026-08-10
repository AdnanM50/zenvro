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
import type { PageSection } from "@/types";

interface HomeHeroProps {
  section?: PageSection;
}

const HomeHero = ({ section }: HomeHeroProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // Subtle parallax on the model image
  const modelY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const modelScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const leftTitle = section?.data?.leftTitle || "where\n- style";
  const tag = section?.data?.tag || "// FASHION";
  const description = section?.subtitle || section?.data?.description || "Explore curated collections, exclusive drops, and everyday essentials all thoughtfully designed in one stylish shopping destination.";
  const newText = section?.data?.newText || "/ New";
  const newSubtext = section?.data?.newSubtext || "Collection 2026";
  const rightTag = section?.data?.rightTag || "// STYLED FOR\nLIFE.";
  const rightTitle = section?.data?.rightTitle || "lives\n- now";
  const modelImage = section?.data?.modelImage || "/hero/model-Photoroom.png";
  const avatar1 = section?.data?.avatar1 || "/hero/avatar1.png";
  const avatar2 = section?.data?.avatar2 || "/hero/avatar2.png";
  const peopleCount = section?.data?.peopleCount || "280K";
  const peopleLabel = section?.data?.peopleLabel || "PEOPLE WE INSPIRE";
  const marquee = section?.data?.marquee || "T STYLING + CRAFTED STORIES + PREMIUM MATERIALS + PREMIUM FABRICS + TIMELESS CUTS + URBAN INFLUENCE";

  const renderTitleLines = (text: string) =>
    text.split("\n").map((line, i) => (
      <span key={i} className="block">
        {line}
      </span>
    ));

  return (
    <div
      id="home"
      ref={heroRef}
      className="bg-background font-sans text-on-surface selection:bg-primary-fixed selection:text-white overflow-hidden min-h-[calc(100vh-72px)] flex flex-col"
    >
      <main className="relative flex-1  pb-1 flex items-start justify-center">
        <div className="w-full max-w-335 mx-auto px-6 md:px-12 relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 md:gap-0">
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
              <div className="hero-text text-foreground">
                {renderTitleLines(leftTitle)}
              </div>

              <div className="space-y-8 md:space-y-12">
                <p className="font-mono text-[10px] md:text-xs tracking-widest text-secondary uppercase font-bold">{tag}</p>
                <p className="text-sm leading-relaxed max-w-60 text-secondary">
                  {description}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] md:text-xs tracking-tight text-secondary">{newText}</p>
                  <p className="font-mono text-[10px] md:text-xs tracking-tight text-secondary">{newSubtext}</p>
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
                src={modelImage}
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
                <p className="font-mono text-[10px] md:text-xs tracking-widest text-secondary uppercase font-bold mb-4 md:mb-8 leading-tight">{renderTitleLines(rightTag)}</p>
                <div className="hero-text text-foreground">
                  {renderTitleLines(rightTitle)}
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
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src={avatar1} alt="Avatar" />
                    <img className="w-10 h-10 rounded-full border-2 border-white object-cover" src={avatar2} alt="Avatar" />
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
                  <p className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{peopleCount}</p>
                  <p className="font-mono text-[10px] tracking-widest text-secondary uppercase">{peopleLabel}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Marquee Footer */}
      <motion.div
        className="mt-8 border-y border-outline-variant py-4 xl:py-6 overflow-hidden w-full"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        custom={0.3}
      >
        <div className="marquee">
          <div className="marquee-content flex items-center gap-6 xl:gap-12 text-foreground font-headline font-black text-lg xl:text-2xl uppercase tracking-[0.2em]">
            <span>{marquee}</span>
            <span aria-hidden="true">{marquee}</span>
            <span aria-hidden="true">{marquee}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeHero;
