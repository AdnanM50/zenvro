"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem, VIEWPORT_CONFIG } from "@/lib/animations";
import type { Product } from "@/lib/products";

type ProductReviewsSectionProps = {
  product: Product;
};

export default function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  return (
    <section className="border-y border-outline-variant bg-background px-5 py-12 md:px-10 lg:px-16">
      <div className="mx-auto grid max-w-[1360px] grid-cols-1 gap-10 lg:grid-cols-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          className="lg:col-span-4"
        >
          <p className="font-label text-[11px] font-black uppercase tracking-[0.28em] text-secondary">
            Reviews and Comments
          </p>
          <h2 className="mt-4 font-headline text-4xl font-black tracking-tight md:text-5xl">
            Worn, rated, discussed.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          className="lg:col-span-4 space-y-4"
        >
          {(product.reviews || []).map((review) => (
            <motion.article key={review.name} variants={staggerItem} className="border border-outline-variant p-5">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-black">{review.name}</h3>
                <div className="flex" aria-label={`${review.rating} star review`}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <span
                      key={index}
                      className="material-symbols-outlined text-[16px] text-primary-fixed"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-secondary">{review.comment}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_CONFIG}
          custom={0.15}
          className="lg:col-span-4"
        >
          <div className="border border-outline-variant p-5">
            <div className="space-y-4">
              {(product.comments || []).map((comment) => (
                <div key={`${comment.author}-${comment.time}`} className="border-b border-outline-variant pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold">{comment.author}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-secondary">{comment.time}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary">{comment.text}</p>
                </div>
              ))}
            </div>

            <form className="mt-6 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <textarea
                className="min-h-28 w-full resize-none border border-outline-variant bg-surface px-4 py-3 text-sm text-on-surface placeholder:text-secondary outline-none transition focus:border-primary"
                placeholder="Write a comment"
                aria-label="Write a comment"
              />
              <button className="flex h-11 w-full items-center justify-center gap-2 bg-primary font-label text-[11px] font-black uppercase tracking-[0.18em] text-background hover:bg-primary-fixed hover:text-white transition-colors">
                Post Comment
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
