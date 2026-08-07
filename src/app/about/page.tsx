"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, animate, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  fadeUp,
  fadeIn,
  fadeLeft,
  fadeRight,
  scaleUp,
  staggerContainer,
  staggerItem,
  wordContainer,
  wordReveal,
  VIEWPORT_CONFIG,
  EASE_LUXURY,
} from "@/lib/animations";

// ─── Staggered Word Reveal Heading ────────────────────────────────────
function RevealHeading({ text, className }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <motion.h1
      className={className}
      variants={wordContainer(0.06)}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT_CONFIG}
    >
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block overflow-hidden pb-0.5">
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

// ─── Animated Counter ─────────────────────────────────────────────────
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 2.2,
      ease: EASE_LUXURY as [number, number, number, number],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      0{suffix}
    </span>
  );
}

// ─── Marquee Ticker ──────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "CRAFTED STORIES",
  "PREMIUM MATERIALS",
  "TIMELESS CUTS",
  "URBAN INFLUENCE",
  "SUSTAINABLE FIRST",
  "LIMITED DROPS",
  "HAND-FINISHED",
];

function TickerBar({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full border-y border-outline-variant py-3.5 overflow-hidden bg-surface ${className}`}>
      <div className="collections-marquee flex whitespace-nowrap">
        {[0, 1, 2].map((setIndex) => (
          <div key={setIndex} className="flex items-center shrink-0" aria-hidden={setIndex > 0}>
            {MARQUEE_ITEMS.map((text, i) => (
              <span key={`${setIndex}-${i}`} className="flex items-center">
                <span className="font-label text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface px-4">{text}</span>
                <span className="text-outline text-sm font-light">+</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Imagery ──────────────────────────────────────────────────
const IMG = {
  jacket: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf",
  model: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve",
  back: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq",
  editorial: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1RoW5cBcoqT10u7JT7K7anHFGjv3NTjr8_mysaiCsk27iFErOxdP6goslnhBKFrJAC_iy8B-WQiIX7V9Tfq3ZQQ0DbKX0r3VZWRvRL8rx9a5vZ6yrB9wQOagG01U8I61_Y8LQ3h4X_uq6u5aA3yI1A8TPHK0I6FEbFTGhj8IPMtbCubZDYHng1tq9dl0pwI8nDdjwgiNLq4eIJQQwAMDg4xcvoJK2t1TVCM5VYhXT2E4qhkIg7Sq7cXGPMSQGBTsIMkBZr007K2R_",
};

// ─── Section 03: Values ──────────────────────────────────────────────
const VALUES = [
  {
    icon: "auto_awesome",
    title: "Material Obsession",
    copy: "Premiere fabrics sourced from heritage mills — wool, silk, and technical weaves chosen to age beautifully.",
    tag: "CRAFT_01",
  },
  {
    icon: "recycling",
    title: "Sustainable First",
    copy: "Deadstock fabrics, recycled hardware, and zero-waste pattern cutting across every single collection.",
    tag: "CRAFT_02",
  },
  {
    icon: "handshake",
    title: "Hand-Finished",
    copy: "Every piece passes through our atelier for a final hand inspection — because detail is the difference.",
    tag: "CRAFT_03",
  },
  {
    icon: "inventory_2",
    title: "Limited Drops",
    copy: "We produce in small, numbered runs. When a drop sells out, it stays out — no mass reproduction.",
    tag: "CRAFT_04",
  },
  {
    icon: "schedule",
    title: "Timeless Cuts",
    copy: "Silhouettes engineered to outlive trends. Designed for the years ahead, not just the season.",
    tag: "CRAFT_05",
  },
  {
    icon: "public",
    title: "Global Fit",
    copy: "Patterns graded across international sizing so our pieces fit every body, in every city we ship to.",
    tag: "CRAFT_06",
  },
];

// ─── Section 02: Timeline ────────────────────────────────────────────
const TIMELINE = [
  {
    year: "2018",
    title: "The First Atelier",
    copy: "VELOUR is founded in a 40m² studio with one sewing table and a belief that luxury should never feel out of reach.",
  },
  {
    year: "2020",
    title: "The Sustainable Shift",
    copy: "We overhaul our supply chain — deadstock fabrics and recycled hardware become the non-negotiable core of every piece.",
  },
  {
    year: "2022",
    title: "The Archive Drops",
    copy: "Our limited numbered-run format debuts. Four drops sell out in under an hour, and a community is born.",
  },
  {
    year: "2024",
    title: "Global Expansion",
    copy: "VELOUR ships to twelve countries. Editorial lookbooks replace campaign shoots, and the aesthetic finds its voice.",
  },
  {
    year: "2026",
    title: "SS/26 & Beyond",
    copy: "The current season — our most ambitious yet. Accessories, silhouettes, and collaborations still to come.",
  },
];

// ─── Stats ───────────────────────────────────────────────────────────
const STATS = [
  { value: 8, suffix: "", label: "Years of craft" },
  { value: 45, suffix: "", label: "Signature collections" },
  { value: 280, suffix: "K", label: "Community members" },
  { value: 12, suffix: "", label: "Countries served" },
];

// ─── FAQ ─────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Where does VELOUR ship, and how fast?",
    a: "We ship worldwide to 12+ countries. Every order includes express tracking, and in most regions pieces arrive within 3–7 working days. Duties and taxes are calculated at checkout, so there are no surprises at the door.",
  },
  {
    q: "How do limited drops work?",
    a: "Every collection is produced as a small, numbered run. When a drop sells out, it stays out — we never mass-produce or quietly restock. If you want a piece, the drop window is your moment.",
  },
  {
    q: "What makes VELOUR sustainable?",
    a: "Sustainability is our starting point, not a label. We use deadstock and upcycled fabrics, recycled hardware, and zero-waste pattern cutting. Our atelier runs on short production runs, which means nothing is made to landfill.",
  },
  {
    q: "What is your return and exchange policy?",
    a: "You have 30 days from delivery to return any unworn piece in its original condition, with tags attached. Exchanges for a different size are free — and the return label is always on us.",
  },
  {
    q: "How should I care for my pieces?",
    a: "Most pieces wash cold and hang dry beautifully. Premium wools and silks carry a care label with specific instructions, and our technical weaves are made to shrug off the everyday.",
  },
  {
    q: "Will sold-out items ever come back?",
    a: "Never in the same form. Sold-out silhouettes sometimes return in a new season with a new fabric and a new color story — but each release stays true to the limited-run spirit.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-outline-variant">
      {FAQS.map((faq, index) => {
        const isOpen = open === index;
        return (
          <div key={faq.q} className="collections-accordion-item border-b border-outline-variant">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center gap-4 py-6 text-left md:gap-8 md:py-7"
            >
              <span className="font-mono text-xs text-secondary shrink-0 w-8">
                (0{index + 1})
              </span>
              <span
                className={`flex-1 font-headline text-lg font-black tracking-tight uppercase transition-colors duration-300 md:text-2xl ${
                  isOpen ? "text-primary-fixed" : ""
                }`}
              >
                {faq.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE_LUXURY }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant text-xl font-light transition-colors duration-300"
              >
                <span className="material-symbols-outlined text-lg">add</span>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_LUXURY }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[560px] pb-7 pl-12 md:pl-16 font-body text-sm leading-[1.8] text-secondary">
                    {faq.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.06]);

  const { scrollYProgress: storyProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"],
  });
  const storyY = useTransform(storyProgress, [0, 1], [60, -60]);

  return (
    <main className="bg-background text-on-surface overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          SECTION 01 — HERO / MANIFESTO
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative flex min-h-[100svh] flex-col">
        <div className="flex-1 px-6 md:px-12 lg:px-16 pt-28 md:pt-36 flex flex-col">
          {/* Header meta row */}
          <motion.div
            className="flex items-start justify-between"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.05}
          >
            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              {"// About Velour"}
            </p>
            <p className="hidden md:block font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              Est. MMXVIII
            </p>
            <p className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-primary-fixed">
              (VOL.01)
            </p>
          </motion.div>

          {/* Center hero text */}
          <div className="mt-10 md:mt-16 grid flex-1 grid-cols-1 items-end gap-8 lg:grid-cols-12">
            <motion.div
              className="lg:col-span-2 hidden lg:flex flex-col gap-6 self-start"
              variants={staggerContainer(0.15, 0.3)}
              initial="hidden"
              animate="visible"
            >
              <motion.span variants={staggerItem} className="text-sideways font-label text-[11px] font-black uppercase tracking-[0.3em] text-secondary self-start">
                Where elegance meets sustainability
              </motion.span>
              <motion.span variants={staggerItem} className="w-1 h-1 bg-primary rounded-full" />
            </motion.div>

            <motion.div
              className="lg:col-span-8"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
            >
              <RevealHeading
                text={"The story\nof VELOUR"}
                className="font-headline text-[clamp(3.5rem,11vw,9.5rem)] font-black tracking-[-0.03em] leading-[0.88] uppercase"
              />
            </motion.div>

            <motion.div
              className="lg:col-span-2 flex flex-col items-start gap-8 lg:items-end self-end"
              variants={fadeRight}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              <p className="max-w-[240px] font-body text-sm leading-relaxed text-secondary lg:text-right">
                Crafted in small runs. Worn for a lifetime. VELOUR is an independent fashion house chasing the perfect collision of comfort and design.
              </p>
              <a
                href="#story"
                className="group flex items-center gap-3 font-label text-[11px] font-black uppercase tracking-[0.2em]"
              >
                Scroll to begin
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant transition group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                  <span className="material-symbols-outlined text-[18px] animate-bounce">south</span>
                </span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Editorial image strip */}
        <motion.div
          className="mt-10 md:mt-16 grid grid-cols-12 items-end gap-4 md:gap-6 px-6 md:px-12 lg:px-16"
          style={{ y: heroY, scale: heroScale }}
        >
          <motion.div
            className="col-span-4 md:col-span-3"
            variants={fadeLeft}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.2}
          >
            <div className="aspect-3/4 overflow-hidden bg-surface-container geometric-clip group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Close-up of a colorful streetwear jacket"
                src={IMG.jacket}
              />
            </div>
          </motion.div>

          <motion.div
            className="col-span-8 md:col-span-6"
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.15}
          >
            <div className="relative overflow-hidden bg-surface-container zig-zag-mask">
              <img
                className="w-full h-full object-cover"
                alt="Model posing in a tan and black luxury streetwear jacket"
                src={IMG.model}
                style={{ aspectRatio: "4/3" }}
              />
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-40" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-label text-[10px] uppercase tracking-widest text-secondary">
                ©International - going distance 2026
              </span>
              <span className="font-headline text-2xl font-black tracking-tighter text-primary-fixed">
                (SS/26)
              </span>
            </div>
          </motion.div>

          <motion.div
            className="col-span-4 md:col-span-3 hidden md:block"
            variants={fadeRight}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.25}
          >
            <div className="aspect-square overflow-hidden bg-surface-container rounded-bl-[4rem] zig-zag-mask group">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt="Back detail of a jacket with artistic graphic design"
                src={IMG.back}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Ticker */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={0.1}
        >
          <TickerBar className="mt-10 md:mt-16 border-l-0 border-r-0" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 02 — OUR STORY / TIMELINE
      ═══════════════════════════════════════════════════════════════ */}
      <section id="story" ref={storyRef} className="relative px-6 md:px-12 lg:px-16 py-20 md:py-32">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
          {/* Sticky intro */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.05}
              >
                <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                  {"// Our Story"}
                </p>
              </motion.div>

              <motion.div
                className="mt-6"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.1}
              >
                <RevealHeading
                  text={"Eight years\nin the making"}
                  className="font-headline text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] uppercase"
                />
              </motion.div>

              <motion.p
                className="mt-8 max-w-[360px] font-body text-sm leading-[1.8] text-secondary"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.18}
              >
                What began as a single sewing table in a tiny studio is now a
                house with one obsession: clothes that feel like they were made
                for you, and made to last. No seasons to chase. No trends to
                obey. Just craft, cut, and intention.
              </motion.p>

              {/* Parallax image */}
              <motion.div
                className="relative mt-12 hidden lg:block overflow-hidden bg-surface-container collections-image-clip"
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.2}
              >
                <motion.img
                  className="w-full h-full object-cover"
                  style={{ y: storyY }}
                  alt="Editorial fashion photography of high-end accessories"
                  src={IMG.editorial}
                />
              </motion.div>

              <motion.div
                className="mt-8 flex items-end gap-4"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.25}
              >
                <span className="font-label text-xs font-mono text-secondary">PROJECT_STORY_V02</span>
                <div className="flex gap-2">
                  <span className="w-8 h-1 bg-primary rounded-full" />
                  <span className="w-4 h-1 bg-outline-variant rounded-full" />
                  <span className="w-4 h-1 bg-outline-variant rounded-full" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Timeline */}
          <motion.div
            className="lg:col-span-7 flex flex-col"
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
          >
            {TIMELINE.map((item) => (
              <motion.div
                key={item.year}
                variants={staggerItem}
                className="group relative border-l border-outline-variant pl-8 md:pl-14 pb-12 last:pb-0"
              >
                <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary-fixed transition-transform duration-300 group-hover:scale-150" />
                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  <span className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-outline-variant transition-colors duration-500 group-hover:text-primary-fixed">
                    {item.year}
                  </span>
                  <h3 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-4 max-w-[520px] font-body text-sm leading-[1.8] text-secondary">
                  {item.copy}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 03 — THE CRAFT / VALUES
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-surface py-20 md:py-32 border-y border-outline-variant">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.05}
            >
              <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                {"// The Craft"}
              </p>
              <RevealHeading
                text={"What we\nstand for"}
                className="mt-6 font-headline text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9] uppercase"
              />
            </motion.div>
            <motion.p
              className="max-w-[300px] font-body text-sm leading-[1.8] text-secondary md:text-right"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.15}
            >
              Six principles, non-negotiable. They shape every cut, every fabric, and every piece we let out the door.
            </motion.p>
          </div>

          <motion.div
            className="mt-14 md:mt-20 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer(0.1, 0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
          >
            {VALUES.map((value) => (
              <motion.article
                key={value.tag}
                variants={staggerItem}
                className="group relative flex min-h-[280px] flex-col justify-between border border-outline-variant bg-background p-8 transition-colors duration-500 hover:bg-primary hover:text-white"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container transition-colors duration-500 group-hover:bg-white/15">
                    <span className="material-symbols-outlined text-2xl text-primary-fixed transition-colors duration-500 group-hover:text-white">
                      {value.icon}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-secondary transition-colors duration-500 group-hover:text-white/60">
                    {value.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-headline text-xl md:text-2xl font-black tracking-tight uppercase">
                    {value.title}
                  </h3>
                  <p className="mt-4 font-body text-sm leading-[1.7] text-secondary transition-colors duration-500 group-hover:text-white/80">
                    {value.copy}
                  </p>
                </div>

                <span className="absolute right-8 top-1/2 h-px w-0 bg-white transition-all duration-500 group-hover:w-16" />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 04 — NUMBERS / CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-background py-20 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="border-t border-outline-variant pt-6"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={index * 0.08}
              >
                <p className="font-headline text-6xl md:text-7xl font-black tracking-tighter text-primary-fixed">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 font-label text-[11px] font-black uppercase tracking-[0.24em] text-secondary">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-24 md:mt-40 grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <motion.div
              className="lg:col-span-8"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.1}
            >
              <RevealHeading
                text={"Become part\nof the story"}
                className="font-headline text-[clamp(2.5rem,7vw,6.5rem)] font-black tracking-[-0.03em] leading-[0.9] uppercase"
              />
            </motion.div>

            <motion.div
              className="lg:col-span-4 flex flex-col items-start gap-8 lg:items-end"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.2}
            >
              <p className="max-w-[280px] font-body text-sm leading-[1.8] text-secondary lg:text-right">
                Every drop is a small chapter. Join the community and be first to the next one.
              </p>
              <Link
                href="/products"
                className="group inline-flex items-center gap-4 rounded-full bg-primary text-white px-8 py-4 font-label text-xs font-bold tracking-widest transition-colors hover:bg-primary-fixed"
              >
                Explore the edit
                <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Closing ticker */}
        <motion.div
          className="mt-20 md:mt-32"
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={0.1}
        >
          <TickerBar />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECTION 05 — FAQ
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-surface border-t border-outline-variant py-20 md:py-32">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 gap-14 px-6 md:px-12 lg:grid-cols-12 lg:gap-12 lg:px-16">
          {/* Sticky header */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.05}
              >
                <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                  {"// FAQ"}
                </p>
                <RevealHeading
                  text={"Questions,\nanswered"}
                  className="mt-6 font-headline text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9] uppercase"
                />
              </motion.div>

              <motion.p
                className="mt-8 max-w-[340px] font-body text-sm leading-[1.8] text-secondary"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.15}
              >
                Everything you need to know before your first drop. Still curious? Our team replies within one working day.
              </motion.p>

              <motion.div
                className="mt-10 hidden items-end gap-4 lg:flex"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.2}
              >
                <span className="font-label text-xs font-mono text-secondary">PROJECT_SUPPORT_V01</span>
                <div className="flex gap-2">
                  <span className="w-8 h-1 bg-primary rounded-full" />
                  <span className="w-4 h-1 bg-outline-variant rounded-full" />
                  <span className="w-4 h-1 bg-outline-variant rounded-full" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Accordion */}
          <motion.div
            className="lg:col-span-7"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.1}
          >
            <FaqAccordion />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
