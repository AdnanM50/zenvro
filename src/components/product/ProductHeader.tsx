"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeIn, fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import type { Product } from "@/lib/products";

type ProductHeaderProps = {
  product: Product;
  isBookmarked?: boolean;
  bookmarkLoading?: boolean;
  onToggleBookmark?: () => void;
};

export default function ProductHeader({
  product,
  isBookmarked = false,
  bookmarkLoading = false,
  onToggleBookmark,
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between">
          <Link
            href="/#products"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-background text-on-surface transition hover:bg-primary hover:text-background"
            aria-label="Back to products"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>

          {onToggleBookmark && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleBookmark}
              disabled={bookmarkLoading}
              className={`inline-flex h-10 px-4 items-center justify-center gap-2 rounded-full border text-xs font-bold uppercase tracking-wider transition-all ${
                isBookmarked
                  ? "border-pink-500 bg-pink-500 text-white shadow-md"
                  : "border-outline-variant bg-background text-on-surface hover:border-pink-500 hover:text-pink-500"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isBookmarked ? "bookmark_added" : "bookmark"}
              </span>
              <span>{isBookmarked ? "Saved" : "Save"}</span>
            </motion.button>
          )}
        </div>

        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          custom={0.1}
          className="mt-12 font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary"
        >
          {product.category} / {product.year}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.15}
          className="mt-5 max-w-[720px] font-headline text-5xl font-black leading-[0.9] tracking-tight text-on-surface md:text-7xl lg:text-8xl"
        >
          {product.name}
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.25}
          className="mt-7 max-w-[530px] text-sm leading-7 text-secondary md:text-base font-medium"
        >
          {product.shortDescription || product.tagline || product.description}
        </motion.p>
      </div>

      {/* Stats Row */}
      <motion.div
        variants={staggerContainer(0.08, 0.25)}
        initial="hidden"
        animate="visible"
        className="grid max-w-[620px] grid-cols-3 border-y border-outline-variant"
      >
        {[
          ["Rating", product.rating],
          ["Reviews", product.reviewsCount.toString()],
          ["Price", product.price],
        ].map(([label, value]) => (
          <motion.div
            key={label}
            variants={staggerItem}
            className="border-r border-outline-variant px-3 py-5 last:border-r-0"
          >
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
              {label}
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
