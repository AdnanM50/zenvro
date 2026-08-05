"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { products, type Product } from "@/lib/products";
import {
  EASE_LUXURY,
  VIEWPORT_CONFIG,
  fadeUp,
  fadeIn,
} from "@/lib/animations";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "name";

const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price · Low to high" },
  { value: "price-desc", label: "Price · High to low" },
  { value: "rating", label: "Rating" },
  { value: "name", label: "Name · A to Z" },
];

function parsePrice(value: string): number {
  const parsed = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = activeCategory === "All"
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case "price-desc":
        list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case "rating":
        list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return list;
  }, [activeCategory, sort]);

  return (
    <main className="bg-surface text-on-surface overflow-hidden">
      {/* ─── Header ─── */}
      <section className="pt-28 md:pt-36 pb-10 px-5 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.05}
            className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary"
          >
            {"// The collection"}
          </motion.p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl"
            >
              the edit
            </motion.h1>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
              className="flex items-center gap-4 pb-1"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5c00]" />
              <p className="font-label text-xs font-black uppercase tracking-[0.2em] text-secondary">
                {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Marquee divider ─── */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={0.2}
        className="border-y border-outline-variant py-3 overflow-hidden bg-background"
      >
        <div className="marquee">
          <div className="marquee-content flex items-center gap-6 font-label text-xs font-black uppercase tracking-[0.3em] text-secondary">
            <span>Timeless cuts</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>Quiet fabrics</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>Limited drops</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>Urban influence</span>
            <span aria-hidden="true">Timeless cuts</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span aria-hidden="true">Quiet fabrics</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span aria-hidden="true">Limited drops</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span aria-hidden="true">Urban influence</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Filters ─── */}
      <section className="px-5 md:px-10 lg:px-16 pt-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 border-b border-outline-variant pb-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.05, ease: EASE_LUXURY }}
                onClick={() => setActiveCategory(category)}
                className={`border px-4 py-2.5 font-label text-[10px] font-black uppercase tracking-[0.18em] transition ${
                  activeCategory === category
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-outline-variant bg-background hover:border-black hover:bg-black hover:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen((v) => !v)}
              className="inline-flex h-11 items-center gap-3 border border-outline-variant bg-background px-4 font-label text-[10px] font-black uppercase tracking-[0.18em] transition hover:border-black"
            >
              {sortOptions.find((o) => o.value === sort)?.label}
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${isSortOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: EASE_LUXURY }}
                  className="absolute right-0 z-30 mt-2 w-56 border border-outline-variant bg-background shadow-xl"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSort(option.value);
                        setIsSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-label text-[10px] font-black uppercase tracking-[0.16em] transition hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black ${
                        sort === option.value ? "text-[#ff5c00]" : ""
                      }`}
                    >
                      {option.label}
                      {sort === option.value && (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ─── Grid ─── */}
      <section className="px-5 md:px-10 lg:px-16 py-12">
        <div className="mx-auto max-w-[1400px]">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE_LUXURY }}
                className="flex flex-col items-center py-24 text-center"
              >
                <span className="material-symbols-outlined text-5xl text-primary-fixed">search_off</span>
                <h2 className="mt-6 font-headline text-3xl font-black tracking-tight md:text-4xl">
                  nothing in this cut
                </h2>
                <p className="mt-3 max-w-[360px] text-sm leading-6 text-secondary">
                  No pieces match that filter right now — try another category.
                </p>
                <button
                  onClick={() => setActiveCategory("All")}
                  className="mt-8 inline-flex h-12 items-center gap-3 bg-black px-6 font-label text-[11px] font-black uppercase tracking-[0.2em] text-white dark:bg-white dark:text-black"
                >
                  Reset filters
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${sort}`}
                layout
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((product, index) => (
                    <ProductCard key={product.slug} product={product} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Bottom CTA strip ─── */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        className="border-t border-outline-variant bg-black px-5 py-16 text-white md:px-10 lg:px-16"
      >
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-white/50">
              {"// Not sure yet"}
            </p>
            <h2 className="mt-3 font-headline text-4xl font-black leading-[0.95] tracking-tight md:text-5xl">
              take a closer look
            </h2>
          </div>
          <Link
            href="/#collections-section"
            className="inline-flex h-14 items-center gap-3 border border-white px-8 font-label text-[11px] font-black uppercase tracking-[0.2em] transition hover:bg-white hover:text-black"
          >
            Explore collections
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </motion.section>
    </main>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, ease: EASE_LUXURY, delay: index * 0.04 }}
    >
      <Link href={`/products/${product.slug}`} className="group block" aria-label={`View ${product.name} details`}>
        <div className="relative aspect-4/5 geometric-clip-product overflow-hidden bg-surface-container">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-center justify-between gap-4 bg-white/90 px-4 py-3 backdrop-blur-sm dark:bg-black/80">
              <span className="font-label text-[10px] font-black uppercase tracking-[0.18em]">
                {product.name}
              </span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>

          {/* Year tag */}
          <div className="absolute right-3 top-3 bg-black/80 px-2.5 py-1 backdrop-blur-sm">
            <span className="font-label text-[9px] font-black uppercase tracking-[0.16em] text-white">
              {product.year}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 py-4">
          <div>
            <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
              {product.category}
            </p>
            <h3 className="mt-1.5 text-xl font-black tracking-tight group-hover:underline">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="text-xs font-black">{product.rating}</span>
              <span className="text-[11px] font-bold text-secondary">
                ({product.reviewsCount})
              </span>
            </div>
          </div>
          <p className="text-lg font-black">{product.price}</p>
        </div>
      </Link>
    </motion.article>
  );
}
