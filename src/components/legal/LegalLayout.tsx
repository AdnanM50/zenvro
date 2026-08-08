"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  fadeUp,
  fadeIn,
  wordContainer,
  wordReveal,
  staggerContainer,
  staggerItem,
  VIEWPORT_CONFIG,
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

function TickerBar() {
  return (
    <div className="w-full border-y border-outline-variant py-3.5 overflow-hidden bg-surface">
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

// ─── Types ────────────────────────────────────────────────────────────
export type LegalSection = {
  id: string;
  num: string;
  title: string;
  body: string[];
  list?: string[];
};

export type LegalLayoutProps = {
  eyebrow: string;
  docCode: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  children?: React.ReactNode;
};

// ─── Legal Page Layout ────────────────────────────────────────────────
export default function LegalLayout({
  eyebrow,
  docCode,
  title,
  intro,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  return (
    <main className="bg-background text-on-surface overflow-hidden">
      {/* HERO */}
      <section className="relative px-6 md:px-12 lg:px-16 pt-24 md:pt-32 pb-16 md:pb-24">
        <motion.div
          className="flex items-start justify-between"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.05}
        >
          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            {eyebrow}
          </p>
          <p className="hidden md:block font-mono text-xs text-secondary">{docCode}</p>
          <p className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-primary-fixed">
            (LEGAL)
          </p>
        </motion.div>

        <motion.div
          className="mt-12 md:mt-16 max-w-5xl"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
        >
          <RevealHeading
            text={title}
            className="font-headline text-[clamp(2.75rem,9vw,8rem)] font-black tracking-[-0.03em] leading-[0.88] uppercase"
          />
        </motion.div>

        <motion.div
          className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:items-end"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.25}
        >
          <p className="max-w-[520px] font-body text-sm leading-[1.8] text-secondary md:col-span-7">
            {intro}
          </p>
          <div className="flex flex-col items-start gap-3 md:col-span-5 md:items-end">
            <span className="font-label text-[11px] font-black uppercase tracking-[0.24em] text-secondary">
              Last updated — {lastUpdated}
            </span>
            <div className="flex gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              <span className="w-4 h-1 bg-outline-variant rounded-full" />
              <span className="w-4 h-1 bg-outline-variant rounded-full" />
            </div>
          </div>
        </motion.div>
      </section>

      <TickerBar />

      {/* CONTENT */}
      <section className="relative px-6 md:px-12 lg:px-16 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Sticky TOC */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                custom={0.05}
              >
                <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                  {"// On this page"}
                </p>
              </motion.div>
              <motion.nav
                className="mt-6"
                variants={staggerContainer(0.06, 0.05)}
                initial="hidden"
                whileInView="visible"
                viewport={VIEWPORT_CONFIG}
                aria-label="Table of contents"
              >
                {sections.map((section) => (
                  <motion.a
                    key={section.id}
                    href={`#${section.id}`}
                    variants={staggerItem}
                    className="group flex items-baseline gap-4 border-b border-outline-variant py-3.5 transition-colors hover:text-primary-fixed"
                  >
                    <span className="font-mono text-[11px] text-secondary transition-colors group-hover:text-primary-fixed">
                      {section.num}
                    </span>
                    <span className="font-headline text-sm md:text-base font-black tracking-tight uppercase transition-transform duration-300 group-hover:translate-x-1">
                      {section.title}
                    </span>
                  </motion.a>
                ))}
              </motion.nav>
            </div>
          </aside>

          {/* Sections */}
          <div className="lg:col-span-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.1}
            >
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 border-b border-outline-variant py-10 md:py-12 first:pt-0 last:border-b-0"
                >
                  <div className="flex items-baseline gap-4 md:gap-6">
                    <span className="font-mono text-xs text-primary-fixed shrink-0">
                      ({section.num})
                    </span>
                    <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase">
                      {section.title}
                    </h2>
                  </div>
                  <div className="mt-6 space-y-4 pl-0 md:pl-16">
                    {section.body.map((paragraph, i) => (
                      <p key={i} className="max-w-[680px] font-body text-sm leading-[1.9] text-secondary">
                        {paragraph}
                      </p>
                    ))}
                    {section.list && (
                      <ul className="space-y-3 pl-1">
                        {section.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 font-body text-sm leading-[1.8] text-secondary">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-fixed" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              ))}

              {children}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative bg-surface border-t border-outline-variant py-20 md:py-28">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12 lg:px-16">
          <motion.div
            className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_CONFIG}
            custom={0.1}
          >
            <div className="lg:col-span-8">
              <RevealHeading
                text={"Questions?\nWrite to us"}
                className="font-headline text-[clamp(2.25rem,6vw,5.5rem)] font-black tracking-[-0.03em] leading-[0.9] uppercase"
              />
            </div>
            <div className="lg:col-span-4 flex flex-col items-start gap-6 lg:items-end">
              <p className="max-w-[280px] font-body text-sm leading-[1.8] text-secondary lg:text-right">
                Our team replies within one working day. We are happy to walk you through any detail.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-4 rounded-full bg-primary text-white px-8 py-4 font-label text-xs font-bold tracking-widest transition-colors hover:bg-primary-fixed"
                >
                  Contact us
                  <span className="material-symbols-outlined text-[16px] transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-4 rounded-full border border-outline-variant px-8 py-4 font-label text-xs font-bold tracking-widest transition hover:border-primary-fixed hover:text-primary-fixed"
                >
                  Back home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
