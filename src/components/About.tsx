"use client";

import { motion } from "framer-motion";
import {
  fadeUp,
  fadeLeft,
  fadeRight,
  fadeIn,
  scaleUp,
  wordContainer,
  wordReveal,
  staggerContainer,
  staggerItem,
  VIEWPORT_CONFIG,
} from "@/lib/animations";

// ─── Staggered Word Reveal Component ────────────────────────────────
function RevealHeading({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <motion.h1
      className={className}
      variants={wordContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block">
          {line.split(" ").map((word, wordIdx) => (
            <motion.span
              key={`${lineIdx}-${wordIdx}`}
              variants={wordReveal}
              className="inline-block mr-[0.3em]"
              style={{ perspective: 400 }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.h1>
  );
}

const About = () => {
  return (
    <section id="about" className="pt-12 md:pt-24 pb-12 px-6 max-w-[1440px] mx-auto min-h-screen">
      {/* Hero Editorial Section */}
      <div className="editorial-grid md:min-h-[870px]">
        {/* Left Editorial Column */}
        <motion.div
          className="col-span-1 md:col-span-4 flex flex-col justify-between py-4 md:py-8"
          variants={fadeLeft}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={0.1}
        >
          <div>
            <RevealHeading
              text={"All - about\nmoments\n©26"}
              className="font-headline text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.85] text-primary uppercase mb-6 md:mb-8"
            />
            <motion.div
              className="max-w-xs space-y-4"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.4}
            >
              <p className="font-body text-sm leading-relaxed uppercase tracking-tight text-secondary">
                Where Elegance Meets Sustainability Luxury Made Accessible
              </p>
              <motion.button
                className="bg-primary text-white px-8 py-4 rounded-full flex items-center gap-3 font-label font-bold text-xs tracking-widest hover:bg-primary-fixed transition-colors"
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.97 }}
              >
                LEARN MORE
                <span className="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
              </motion.button>
            </motion.div>
          </div>
          <motion.div
            className="mt-12 md:mt-0 flex items-end gap-6"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.3}
          >
            <div className="w-32 aspect-3/4 bg-surface-container overflow-hidden group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Close-up of a colorful streetwear jacket"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf"
              />
            </div>
            <div>
              <span className="font-label text-xs font-bold tracking-widest text-primary-fixed uppercase block mb-1">New Drop</span>
              <span className="font-headline text-lg font-black tracking-tighter italic">($120)</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Central Hero Image */}
        <motion.div
          className="col-span-1 md:col-span-5 relative flex flex-col items-center mt-8 md:mt-0"
          variants={scaleUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={0.2}
        >
          <div className="absolute -top-6 z-10 text-primary-fixed">
            <span
              className="material-symbols-outlined text-5xl"
              data-icon="local_florist"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              local_florist
            </span>
          </div>
          <div className="w-full aspect-4/5 bg-surface-container overflow-hidden relative zig-zag-mask">
            <img
              className="w-full h-full object-cover"
              alt="Model posing in a tan and black luxury streetwear jacket"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve"
            />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-40"></div>
          </div>
          <motion.div
            className="w-full mt-4"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.5}
          >
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary text-left">
              ©International - going distance 2026
            </p>
          </motion.div>
        </motion.div>

        {/* Right Visual Column */}
        <motion.div
          className="col-span-1 md:col-span-3 flex flex-col justify-between py-4 md:py-8"
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={0.2}
        >
          <div className="text-right flex flex-col items-end mt-4">
            <h3 className="font-headline text-2xl font-black tracking-tighter uppercase mb-4 leading-none">
              Design<br />Philosophy
            </h3>
            <p className="font-body text-xs text-secondary leading-relaxed w-[85%]">
              Blending avant-garde aesthetics with everyday utility, our pieces are crafted for those who define their own path. Every stitch tells a story of innovation.
            </p>
            <div className="mt-6 flex gap-2 w-full justify-end">
              <span className="w-1 h-1 bg-primary rounded-full"></span>
              <span className="w-1 h-1 bg-primary rounded-full"></span>
              <span className="w-8 h-1 bg-primary rounded-full"></span>
            </div>
          </div>

          <div className="flex flex-col items-end w-full space-y-12">
            <motion.div
              className="flex flex-col items-end"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.4}
            >
              <div className="w-full aspect-square bg-surface-container overflow-hidden rounded-bl-[4rem] zig-zag-mask scale-90 origin-right opacity-80">
                <img
                  className="w-full h-full object-cover"
                  alt="Back detail of a jacket with artistic graphic design"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq"
                />
              </div>
              <div className="mt-4 text-right">
                <p className="font-label text-[10px] uppercase tracking-widest text-secondary leading-none">
                  ©International - just do it 2026
                </p>
              </div>
            </motion.div>
            <div className="flex justify-between items-end border-t border-outline-variant pt-4 w-full">
              <span className="font-label text-xs font-mono text-secondary">PROJECT_V01</span>
              <span className="font-headline text-4xl font-black tracking-tighter text-primary-fixed">(45%)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Product Highlight Bento Section */}
      <motion.div
        className="mt-16 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer(0.15, 0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
      >
        <motion.div
          className="bg-surface-container-low p-8 md:p-12 flex flex-col justify-between h-[300px] md:h-[400px]"
          variants={staggerItem}
        >
          <h3 className="font-headline text-3xl font-bold tracking-tighter">THE ARCHIVE</h3>
          <p className="font-body text-sm text-secondary uppercase leading-relaxed">
            Curated selections from the last decade of street culture evolution.
          </p>
          <div className="flex gap-2">
            <div className="w-12 h-1 bg-primary"></div>
            <div className="w-12 h-1 bg-outline-variant"></div>
            <div className="w-12 h-1 bg-outline-variant"></div>
          </div>
        </motion.div>
        <motion.div
          className="md:col-span-2 bg-surface-container p-0 overflow-hidden relative group"
          variants={staggerItem}
        >
          <img
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt="Editorial fashion photography of high-end accessories"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1RoW5cBcoqT10u7JT7K7anHFGjv3NTjr8_mysaiCsk27iFErOxdP6goslnhBKFrJAC_iy8B-WQiIX7V9Tfq3ZQQ0DbKX0r3VZWRvRL8rx9a5vZ6yrB9wQOagG01U8I61_Y8LQ3h4X_uq6u5aA3yI1A8TPHK0I6FEbFTGhj8IPMtbCubZDYHng1tq9dl0pwI8nDdjwgiNLq4eIJQQwAMDg4xcvoJK2t1TVCM5VYhXT2E4qhkIg7Sq7cXGPMSQGBTsIMkBZr007K2R_"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
            <span className="text-white font-label tracking-[0.3em] uppercase text-xs mb-2">Exclusive Look</span>
            <h3 className="text-white font-headline text-3xl md:text-5xl font-black tracking-tighter">SS/26 ACCESSORIES</h3>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About;
