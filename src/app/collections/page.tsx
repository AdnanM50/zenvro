"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useApiGet } from "@/hooks/use-api";
import { getPublicCollections } from "@/services/collection.service";
import type { CollectionItem } from "@/types";
import {
  EASE_LUXURY,
  VIEWPORT_CONFIG,
  fadeUp,
  fadeIn,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

const fallbackCollections: Partial<CollectionItem>[] = [
  {
    _id: "col-1",
    name: "Winter Monolith '26",
    slug: "winter-monolith-26",
    banner:
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80",
    description: "Architectural wool silhouettes, padded storm layers, and deep earth tones crafted for northern urban winters.",
    startDate: "2026-11-01",
    endDate: "2027-02-28",
    isActive: true,
  },
  {
    _id: "col-2",
    name: "Quiet Utility Capsule",
    slug: "quiet-utility-capsule",
    banner:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    description: "Minimalist workwear tailoring featuring corozo buttons, dense cotton twills, and concealed storm pockets.",
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    isActive: true,
  },
  {
    _id: "col-3",
    name: "Velour Noir Drop",
    slug: "velour-noir-drop",
    banner:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    description: "Midnight satin textures, supple vegan leathers, and razor-sharp cropped proportions.",
    startDate: "2026-08-15",
    endDate: "2026-10-31",
    isActive: true,
  },
];

export default function CollectionsPage() {
  const { data: collectionsData, isLoading } = useApiGet<CollectionItem[]>({
    queryKey: ["public-collections"],
    queryFn: () => getPublicCollections({ all: true }),
  });

  const collections = useMemo(() => {
    if (collectionsData?.data && collectionsData.data.length > 0) {
      return collectionsData.data;
    }
    return fallbackCollections as CollectionItem[];
  }, [collectionsData]);

  return (
    <main className="bg-surface text-on-surface overflow-x-hidden min-h-screen">
      {/* ─── Header ─── */}
      <section className="pt-28 md:pt-36 pb-12 px-5 md:px-10 lg:px-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.05}
            className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary"
          >
            {"// Curated Drops"}
          </motion.p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="font-headline text-5xl font-black leading-[0.9] tracking-tight md:text-7xl lg:text-8xl"
            >
              collections
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
                {collections.length} {collections.length === 1 ? "edition" : "editions"}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Marquee Divider ─── */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        custom={0.2}
        className="border-y border-outline-variant py-3 overflow-hidden bg-background"
      >
        <div className="marquee">
          <div className="marquee-content flex items-center gap-6 font-label text-xs font-black uppercase tracking-[0.3em] text-secondary">
            <span>Seasonal drops</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>Archival releases</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>Limited edition capsule</span>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">local_florist</span>
            <span>VELOUR DIRECT EXCLUSIVE</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Collections Grid ─── */}
      <section className="px-5 md:px-10 lg:px-16 py-16">
        <div className="mx-auto max-w-[1400px]">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16"
          >
            {collections.map((item, index) => (
              <motion.article key={item.slug || item._id} variants={staggerItem}>
                <Link
                  href={`/collections/${item.slug || item._id}`}
                  className="group block border border-outline-variant bg-background overflow-hidden transition duration-500 hover:border-black dark:hover:border-white"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-container">
                    <img
                      src={
                        item.banner ||
                        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />

                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-sm">
                      <span className="font-label text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Curated Release
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="font-headline text-2xl md:text-4xl font-black tracking-tight group-hover:text-primary transition">
                          {item.name}
                        </h2>
                        <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </div>

                      {item.description && (
                        <p className="mt-3 text-sm leading-6 text-secondary line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-outline-variant/60 pt-4 font-label text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                      <span>Explore Collection</span>
                      <span>Velour Edition →</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
