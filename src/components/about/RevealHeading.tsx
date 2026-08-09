"use client";

import { motion } from "framer-motion";
import { wordContainer, wordReveal, VIEWPORT_CONFIG } from "@/lib/animations";

// ─── Staggered Word Reveal Heading ────────────────────────────────────
export default function RevealHeading({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
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
