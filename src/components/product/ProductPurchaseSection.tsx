"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import type { Product } from "@/lib/products";
import ProductCareGuide from "./ProductCareGuide";

type ProductPurchaseSectionProps = {
  product: Product;
  selectedSize: string | null;
  setSelectedSize: (size: string) => void;
  onAddToBag: () => void;
};

export default function ProductPurchaseSection({
  product,
  selectedSize,
  setSelectedSize,
  onAddToBag,
}: ProductPurchaseSectionProps) {
  const filteredDetails = (product.details || []).filter(
    (detail) =>
      Boolean(detail) &&
      !/^[0-9a-fA-F]{24}$/.test(detail) &&
      !(product.tags || []).some((t) => t.toLowerCase() === detail.toLowerCase())
  );

  const filteredTags = (product.tags || []).filter(
    (tag) => Boolean(tag) && !/^[0-9a-fA-F]{24}$/.test(tag)
  );

  return (
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
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-background">
          <span className="material-symbols-outlined text-[20px]">verified</span>
        </div>
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
        {product.color && (
          <div className="flex justify-between gap-4 pb-3 border-b border-outline-variant/50">
            <span className="text-secondary text-sm">Color</span>
            <span className="font-bold text-sm">{product.color}</span>
          </div>
        )}
        {product.material && (
          <div className="flex justify-between gap-4 pb-3 border-b border-outline-variant/50">
            <span className="text-secondary text-sm">Material</span>
            <span className="text-right font-bold text-sm">{product.material}</span>
          </div>
        )}
        {product.fit && (
          <div className="flex justify-between gap-4 pb-3 border-b border-outline-variant/50 md:col-span-2">
            <span className="text-secondary text-sm">Fit</span>
            <span className="text-right font-bold text-sm">{product.fit}</span>
          </div>
        )}
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="py-6 border-t border-outline-variant/60">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-3">
            Description
          </p>
          <p className="text-sm md:text-base leading-7 text-on-surface font-medium">
            {product.description}
          </p>
        </div>
      )}

      {/* Dynamic Specifications */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="py-6 border-t border-outline-variant/60">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-4">
            Product Specifications
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4 pb-3 border-b border-outline-variant/40">
                <span className="text-secondary text-sm font-medium">{key}</span>
                <span className="text-right font-bold text-sm text-on-surface">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {filteredTags.length > 0 && (
        <div className="py-4 border-t border-outline-variant/60">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-3">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-surface-container text-on-surface font-label text-[10px] font-bold uppercase tracking-[0.16em] border border-outline-variant/60 rounded-sm"
              >
                #{tag.replace(/^#/, "").toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      <div className="py-6">
        <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-4">
          Select Size
        </p>
        <div className="grid grid-cols-5 gap-2">
          {(product.sizes || ["S", "M", "L"]).map((size) => (
            <motion.button
              key={size}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSize(size)}
              className={`h-12 border text-xs font-black transition ${
                selectedSize === size
                  ? "border-primary bg-primary text-background"
                  : "border-outline-variant bg-background text-on-surface hover:border-primary hover:bg-primary hover:text-background"
              }`}
            >
              {size}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Key Features / Highlights */}
      {filteredDetails.length > 0 && (
        <div className="space-y-2 py-4 border-t border-outline-variant/60">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-secondary mb-3">
            Key Highlights
          </p>
          {filteredDetails.map((detail, index) => (
            <motion.div
              key={detail}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center gap-3 py-1"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span className="text-xs font-bold text-on-surface">{detail}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add to Bag Button */}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddToBag}
        className="flex h-14 w-full items-center justify-center gap-3 bg-primary px-6 font-label text-[11px] font-black uppercase tracking-[0.2em] text-background shadow-lg hover:bg-primary-fixed hover:text-white transition-colors"
      >
        Add to Bag
        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
      </motion.button>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 pt-6 border-t border-outline-variant/60">
        <div className="flex flex-col items-center text-center p-3 bg-surface-container rounded-sm">
          <span className="material-symbols-outlined text-[20px] text-primary mb-1">local_shipping</span>
          <span className="font-label text-[9px] font-black uppercase tracking-[0.16em]">Free Express</span>
          <span className="text-[10px] text-secondary mt-0.5">Orders over $150</span>
        </div>
        <div className="flex flex-col items-center text-center p-3 bg-surface-container rounded-sm">
          <span className="material-symbols-outlined text-[20px] text-primary mb-1">published_with_changes</span>
          <span className="font-label text-[9px] font-black uppercase tracking-[0.16em]">30-Day Returns</span>
          <span className="text-[10px] text-secondary mt-0.5">Effortless exchange</span>
        </div>
        <div className="flex flex-col items-center text-center p-3 bg-surface-container rounded-sm">
          <span className="material-symbols-outlined text-[20px] text-primary mb-1">verified</span>
          <span className="font-label text-[9px] font-black uppercase tracking-[0.16em]">100% Authentic</span>
          <span className="text-[10px] text-secondary mt-0.5">Velour Direct</span>
        </div>
      </div>

      {/* Care Guide Accordions */}
      <ProductCareGuide product={product} />
    </motion.div>
  );
}
