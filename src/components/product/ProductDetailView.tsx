"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/lib/products";
import {
  EASE_LUXURY,
  VIEWPORT_CONFIG,
  fadeIn,
  fadeUp,
  staggerContainer,
  staggerItem,
} from "@/lib/animations";

type ProductDetailViewProps = {
  product: Product;
  relatedProducts: Product[];
};

const pageEnter = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_LUXURY },
  },
};

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  
  // Support single image or multiple images
  const images = product.images || [product.image];

  return (
    <main className="bg-surface text-on-surface overflow-hidden">
      <section className="min-h-screen pt-28 md:pt-32 pb-14 px-5 md:px-10 lg:px-16">
        <motion.div
          variants={pageEnter}
          initial="hidden"
          animate="visible"
          className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16"
        >
          {/* Left Section - Product Info & Purchase */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            <div>
              <Link
                href="/#products"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-white transition hover:bg-black hover:text-white"
                aria-label="Back to products"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </Link>

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
                className="mt-5 max-w-[720px] font-headline text-5xl font-black leading-[0.9] tracking-tight text-black md:text-7xl lg:text-8xl"
              >
                {product.name}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={0.25}
                className="mt-7 max-w-[530px] text-sm leading-7 text-secondary md:text-base"
              >
                {product.description}
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

            {/* Purchase Section - Integrated */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.35}
              className="border-t border-outline-variant pt-10"
            >
              <div className="flex items-center justify-between gap-4 pb-6 border-b border-outline-variant">
                <div>
                  <p className="font-label text-[10px] font-black uppercase tracking-[0.22em] text-secondary">
                    Official Store
                  </p>
                  <p className="mt-1 text-lg font-black">Velour Direct</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-white">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                <div className="flex justify-between gap-4 pb-3 border-b border-outline-variant/50">
                  <span className="text-secondary text-sm">Color</span>
                  <span className="font-bold text-sm">{product.color}</span>
                </div>
                <div className="flex justify-between gap-4 pb-3 border-b border-outline-variant/50">
                  <span className="text-secondary text-sm">Material</span>
                  <span className="text-right font-bold text-sm">{product.material}</span>
                </div>
                <div className="flex justify-between gap-4 pb-3 border-b border-outline-variant/50 md:col-span-2">
                  <span className="text-secondary text-sm">Fit</span>
                  <span className="text-right font-bold text-sm">{product.fit}</span>
                </div>
              </div>

              {/* Size Selection */}
              <div className="py-6">
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-4">
                  Select Size
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 border text-xs font-black transition ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-outline-variant bg-white hover:border-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 pb-8">
                {product.details.map((detail, index) => (
                  <motion.div
                    key={detail}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3 py-2"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>
                    <span className="text-sm font-bold">{detail}</span>
                  </motion.div>
                ))}
              </div>

              {/* Add to Bag Button */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-14 w-full items-center justify-center gap-3 bg-black px-6 font-label text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-lg"
              >
                Add to Bag
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Right Section - Image Gallery */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="lg:col-span-5"
          >
            <div className="sticky top-32">
              {/* Main Image */}
              <motion.div
                initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                animate={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 88% 100%, 0 100%)" }}
                transition={{ duration: 0.9, ease: EASE_LUXURY, delay: 0.15 }}
                className="relative mx-auto aspect-[4/5] overflow-hidden bg-surface-container"
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={images[selectedImage]}
                    alt={`${product.name} - View ${selectedImage + 1}`}
                    className="h-full w-full object-cover"
                    initial={{ scale: 1.12, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE_LUXURY }}
                  />
                </AnimatePresence>
                
                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-xs font-bold text-white">
                      {selectedImage + 1} / {images.length}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Navigation */}
              {images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 grid grid-cols-4 gap-3"
                >
                  {images.map((img, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative aspect-square overflow-hidden bg-surface-container border-2 transition ${
                        selectedImage === index
                          ? "border-black"
                          : "border-transparent hover:border-outline-variant"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {selectedImage === index && (
                        <div className="absolute inset-0 bg-black/10" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-12 w-12 items-center justify-center rounded-full bg-white border border-outline-variant shadow-lg hidden lg:flex hover:bg-black hover:text-white transition"
                    aria-label="Previous image"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </motion.button>
                  
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-12 w-12 items-center justify-center rounded-full bg-white border border-outline-variant shadow-lg hidden lg:flex hover:bg-black hover:text-white transition"
                    aria-label="Next image"
                  >
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Rest of the sections remain the same */}
      <section className="border-y border-outline-variant bg-white px-5 py-12 md:px-10 lg:px-16">
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
            {product.reviews.map((review) => (
              <motion.article key={review.name} variants={staggerItem} className="border border-outline-variant p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-black">{review.name}</h3>
                  <div className="flex" aria-label={`${review.rating} star review`}>
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <span key={index} className="material-symbols-outlined text-[16px] text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
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
                {product.comments.map((comment) => (
                  <div key={`${comment.author}-${comment.time}`} className="border-b border-outline-variant pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-bold">{comment.author}</p>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-secondary">{comment.time}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-secondary">{comment.text}</p>
                  </div>
                ))}
              </div>

              <form className="mt-6 space-y-3">
                <textarea
                  className="min-h-28 w-full resize-none border border-outline-variant bg-surface px-4 py-3 text-sm outline-none transition focus:border-black"
                  placeholder="Write a comment"
                  aria-label="Write a comment"
                />
                <button className="flex h-11 w-full items-center justify-center gap-2 bg-black font-label text-[11px] font-black uppercase tracking-[0.18em] text-white">
                  Post Comment
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

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
            <Link href="/#products" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em]">
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
                <Link href={`/products/${related.slug}`} className="group block border border-outline-variant bg-white">
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
    </main>
  );
}