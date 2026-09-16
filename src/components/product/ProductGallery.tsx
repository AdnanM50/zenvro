"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EASE_LUXURY, fadeUp } from "@/lib/animations";
import type { Product } from "@/lib/products";

type ProductGalleryProps = {
  product: Product;
  images: string[];
  selectedImage: number;
  setSelectedImage: React.Dispatch<React.SetStateAction<number>>;
};

export default function ProductGallery({
  product,
  images,
  selectedImage,
  setSelectedImage,
}: ProductGalleryProps) {
  return (
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
                    ? "border-primary"
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-12 w-12 items-center justify-center rounded-full bg-background text-on-surface border border-outline-variant shadow-lg hidden lg:flex hover:bg-primary hover:text-background transition"
              aria-label="Previous image"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </motion.button>
            
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-12 w-12 items-center justify-center rounded-full bg-background text-on-surface border border-outline-variant shadow-lg hidden lg:flex hover:bg-primary hover:text-background transition"
              aria-label="Next image"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
