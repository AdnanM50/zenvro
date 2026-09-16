"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT_CONFIG } from "@/lib/animations";
import type { Product } from "@/lib/products";

type RelatedProductsSectionProps = {
  relatedProducts: Product[];
};

export default function RelatedProductsSection({ relatedProducts }: RelatedProductsSectionProps) {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <section className="px-5 py-14 md:px-10 lg:px-16">
      <div className="mx-auto max-w-[1360px]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
              Related Product
            </p>
            <h2 className="mt-3 font-headline text-4xl font-black tracking-tight md:text-5xl">
              Complete the rotation
            </h2>
          </div>
          <Link href="/products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]">
            View all
            <span className="material-symbols-outlined text-[17px]">arrow_forward</span>
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1, 0)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          {relatedProducts.map((related) => (
            <motion.article key={related.slug} variants={staggerItem}>
              <Link href={`/products/${related.slug}`} className="group block border border-outline-variant bg-background">
                <div className="aspect-[4/5] overflow-hidden bg-surface-container">
                  <img
                    src={related.image}
                    alt={related.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">{related.category}</p>
                    <h3 className="mt-2 text-xl font-black tracking-tight">{related.name}</h3>
                  </div>
                  <p className="text-lg font-black">{related.price}</p>
                </div>
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
