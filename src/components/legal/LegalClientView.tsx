"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import TickerBar from "@/components/about/TickerBar";
import {
  fadeUp,
  fadeIn,
  wordContainer,
  wordReveal,
  staggerContainer,
  staggerItem,
  VIEWPORT_CONFIG,
} from "@/lib/animations";
import { usePublicPage } from "@/hooks";
import type { Page } from "@/types";

const LEGAL_MARQUEE = [
  "LEGAL & COMPLIANCE",
  "DATA PROTECTION",
  "PRIVACY FIRST",
  "TRANSPARENT TERMS",
  "SECURITY GUARANTEED",
  "YOUR RIGHTS",
  "CUSTOMER CARE",
];

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

// ─── CMS slug → decorative meta labels ────────────────────────────────
const EYEBROWS: Record<string, string> = {
  "privacy-policy": "// Privacy Policy",
  "terms-conditions": "// Terms & Conditions",
};

const DOC_CODES: Record<string, string> = {
  "privacy-policy": "LEGAL_DOC_PRIVACY_V01",
  "terms-conditions": "LEGAL_DOC_TERMS_V01",
};

type PolicyClause = {
  title?: string;
  content?: string;
};

function formatLastUpdated(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface LegalClientViewProps {
  slug: string;
  initialPage?: Page | null;
}

// ─── CMS-Driven Legal Page Layout ─────────────────────────────────────
export default function LegalClientView({ slug, initialPage }: LegalClientViewProps) {
  const { data, isError } = usePublicPage({ slug, initialPage });
  const page = data?.data ?? null;

  const activeSections = (page?.sections || [])
    .filter((sec) => sec.isActive)
    .sort((a, b) => a.order - b.order);

  const policySection = activeSections.find((sec) => sec.type === "policyClauses");

  const clauses: Array<{ id: string; num: string; title: string; body: string[] }> = (
    (policySection?.data?.clauses as PolicyClause[] | undefined) || []
  ).map((clause, index) => ({
    id: `clause-${index + 1}`,
    num: String(index + 1).padStart(2, "0"),
    title: clause?.title?.trim() || `Clause ${index + 1}`,
    body: (clause?.content || "")
      .split(/\n+/)
      .map((s: string) => s.trim())
      .filter(Boolean),
  }));

  const title = page?.title || (slug === "terms-conditions" ? "Terms & Conditions" : "Privacy Policy");
  const intro = policySection?.subtitle || "";
  const lastUpdated = formatLastUpdated(policySection?.data?.lastUpdated);
  const eyebrow = EYEBROWS[slug] || `// ${page?.title || slug}`;
  const docCode = DOC_CODES[slug] || "LEGAL_DOC";

  return (
    <main className="bg-background text-on-surface overflow-hidden min-h-screen">
      {/* Network / Error Notice (Graceful degrade) */}
      {isError && !page && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2.5 text-xs text-center font-medium">
          Note: Currently displaying standard cached view due to network connection.
        </div>
      )}

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
          {intro && (
            <p className="max-w-[520px] font-body text-sm leading-[1.8] text-secondary md:col-span-7">
              {intro}
            </p>
          )}
          <div className="flex flex-col items-start gap-3 md:col-span-5 md:items-end">
            {lastUpdated && (
              <span className="font-label text-[11px] font-black uppercase tracking-[0.24em] text-secondary">
                Last updated — {lastUpdated}
              </span>
            )}
            <div className="flex gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              <span className="w-4 h-1 bg-outline-variant rounded-full" />
              <span className="w-4 h-1 bg-outline-variant rounded-full" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* MARQUEE TICKER BAR */}
      <TickerBar items={LEGAL_MARQUEE} />

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
                {clauses.map((clause) => (
                  <motion.a
                    key={clause.id}
                    href={`#${clause.id}`}
                    variants={staggerItem}
                    className="group flex items-baseline gap-4 border-b border-outline-variant py-3.5 transition-colors hover:text-primary-fixed"
                  >
                    <span className="font-mono text-[11px] text-secondary transition-colors group-hover:text-primary-fixed">
                      {clause.num}
                    </span>
                    <span className="font-headline text-sm md:text-base font-black tracking-tight uppercase transition-transform duration-300 group-hover:translate-x-1">
                      {clause.title}
                    </span>
                  </motion.a>
                ))}
              </motion.nav>
            </div>
          </aside>

          {/* Clauses */}
          <div className="lg:col-span-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT_CONFIG}
              custom={0.1}
            >
              {clauses.length > 0 ? (
                clauses.map((clause) => (
                  <section
                    key={clause.id}
                    id={clause.id}
                    className="scroll-mt-28 border-b border-outline-variant py-10 md:py-12 first:pt-0 last:border-b-0"
                  >
                    <div className="flex items-baseline gap-4 md:gap-6">
                      <span className="font-mono text-xs text-primary-fixed shrink-0">
                        ({clause.num})
                      </span>
                      <h2 className="font-headline text-2xl md:text-3xl font-black tracking-tight uppercase">
                        {clause.title}
                      </h2>
                    </div>
                    <div className="mt-6 space-y-4 pl-0 md:pl-16">
                      {clause.body.map((paragraph, i) => (
                        <p key={i} className="max-w-[680px] font-body text-sm leading-[1.9] text-secondary">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <p className="font-body text-sm leading-[1.8] text-secondary">
                  Content is being prepared. Please check back shortly.
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* QUESTIONS? WRITE TO US BANNER */}
      <section className="border-t border-outline-variant bg-surface py-16 md:py-24 px-6 md:px-12 lg:px-16">
        <div className="mx-auto max-w-[1440px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tight uppercase leading-tight">
              QUESTIONS?<br />WRITE TO US
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-4">
            <p className="max-w-[320px] font-body text-xs leading-relaxed text-secondary md:text-right">
              Our legal & support team is here to assist with any questions regarding policies or orders. We reply within one working day.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 py-3.5 font-label text-xs font-bold uppercase tracking-widest hover:bg-primary-fixed transition-colors"
              >
                Contact Us <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container px-6 py-3.5 font-label text-xs font-bold uppercase tracking-widest text-on-surface hover:bg-outline-variant transition-colors"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
