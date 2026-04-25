import type { Variants } from "framer-motion";

// ─── Shared Constants ───────────────────────────────────────────────
export const EASE_LUXURY = [0.25, 0.1, 0.25, 1] as const;

export const VIEWPORT_CONFIG = { once: true, margin: "-100px" } as const;

// ─── Fade Up ────────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_LUXURY, delay },
  }),
};

// ─── Fade In (opacity only) ─────────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.8, ease: EASE_LUXURY, delay },
  }),
};

// ─── Fade Left (slide from left) ────────────────────────────────────
export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE_LUXURY, delay },
  }),
};

// ─── Fade Right (slide from right) ──────────────────────────────────
export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: EASE_LUXURY, delay },
  }),
};

// ─── Scale In ───────────────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: EASE_LUXURY, delay },
  }),
};

// ─── Scale Up (subtle 0.95 → 1) ────────────────────────────────────
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_LUXURY, delay },
  }),
};

// ─── Stagger Container ─────────────────────────────────────────────
export const staggerContainer = (
  stagger: number = 0.15,
  delayChildren: number = 0
): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

// ─── Stagger Item (used inside staggerContainer) ────────────────────
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_LUXURY },
  },
};

// ─── Word Reveal (for staggered text) ───────────────────────────────
export const wordContainer = (stagger: number = 0.08): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
    },
  },
});

export const wordReveal: Variants = {
  hidden: { opacity: 0, y: 30, rotateX: 20 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: EASE_LUXURY },
  },
};
