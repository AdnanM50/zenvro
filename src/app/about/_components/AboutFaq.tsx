"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_LUXURY } from "@/lib/animations";
import { gsap, useGsap } from "../../../components/about/useGsap";
import RevealHeading from "../../../components/about/RevealHeading";

import type { PageSection } from "@/types";

// ─── Accordion ───────────────────────────────────────────────────────
function FaqAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="border-t border-outline-variant">
      {items.map((faq, index) => {
        const isOpen = open === index;
        return (
          <div key={faq.q || index} className="collections-accordion-item border-b border-outline-variant">
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

// ─── Section 05: FAQ ─────────────────────────────────────────────────
interface AboutFaqProps {
  section?: PageSection;
}

export default function AboutFaq({ section }: AboutFaqProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  const tag = section?.data?.tag || "// FAQ";
  const title = section?.title || "Questions,\nanswered";
  const description = section?.subtitle || section?.data?.description || "Everything you need to know before your first drop. Still curious? Our team replies within one working day.";
  const metaCode = section?.data?.metaCode || "PROJECT_SUPPORT_V01";
  const displayFaqs: Array<{ q: string; a: string }> =
    (section?.data?.items || []).map((it: any) => ({
      q: it.q || it.question || "",
      a: it.a || it.answer || "",
    }));

  useGsap(sectionRef, () => {
    gsap.from("[data-faq-label]", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-faq-label]", start: "top 85%", once: true },
    });

    gsap.from("[data-faq-copy]", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-faq-copy]", start: "top 80%", once: true },
    });

    gsap.from("[data-faq-meta]", {
      y: 30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-faq-meta]", start: "top 85%", once: true },
    });

    gsap.from("[data-faq-accordion]", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-faq-accordion]", start: "top 80%", once: true },
    });
  });

  return (
    <section ref={sectionRef} className="relative bg-surface border-t border-outline-variant py-20 md:py-32">
      <div className="mx-auto max-w-[1440px] grid grid-cols-1 gap-14 px-6 md:px-12 lg:grid-cols-12 lg:gap-12 lg:px-16">
        {/* Sticky header */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <div data-faq-label>
              <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
                {tag}
              </p>
              <RevealHeading
                text={title}
                className="mt-6 font-headline text-4xl sm:text-6xl font-black tracking-tighter leading-[0.9] uppercase"
              />
            </div>

            <p data-faq-copy className="mt-8 max-w-[340px] font-body text-sm leading-[1.8] text-secondary">
              {description}
            </p>

            <div data-faq-meta className="mt-10 hidden items-end gap-4 lg:flex">
              <span className="font-label text-xs font-mono text-secondary">{metaCode}</span>
              <div className="flex gap-2">
                <span className="w-8 h-1 bg-primary rounded-full" />
                <span className="w-4 h-1 bg-outline-variant rounded-full" />
                <span className="w-4 h-1 bg-outline-variant rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Accordion */}
        <div data-faq-accordion className="lg:col-span-7">
          <FaqAccordion items={displayFaqs} />
        </div>
      </div>
    </section>
  );
}
