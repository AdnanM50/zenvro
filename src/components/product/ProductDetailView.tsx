"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import type { Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { EASE_LUXURY } from "@/lib/animations";

import ProductHeader from "./ProductHeader";
import ProductPurchaseSection from "./ProductPurchaseSection";
import ProductGallery from "./ProductGallery";
import ProductReviewsSection from "./ProductReviewsSection";
import RelatedProductsSection from "./RelatedProductsSection";

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
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000";
  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const images = rawImages.filter((img) => Boolean(img) && typeof img === "string" && img.trim() !== "");
  if (images.length === 0) images.push(DEFAULT_IMAGE);

  const handleAddToBag = () => {
    if (!user) {
      toast.error("Please sign in to add products to your bag");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!selectedSize) {
      toast.error("Select a size first");
      return;
    }
    addItem(product, selectedSize);
    toast.success(`${product.name} added to bag`);
  };

  // Trigger Lenis resize on mount / image change to guarantee smooth full-page scrolling
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedImage]);

  return (
    <main className="bg-surface text-on-surface overflow-x-hidden min-h-screen">
      <section className="min-h-screen pt-28 md:pt-32 pb-14 px-5 md:px-10 lg:px-16">
        <motion.div
          variants={pageEnter}
          initial="hidden"
          animate="visible"
          className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16"
        >
          {/* Left Column - Product Info & Purchase Options */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            <ProductHeader product={product} />
            <ProductPurchaseSection
              product={product}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              onAddToBag={handleAddToBag}
            />
          </div>

          {/* Right Column - Image Gallery */}
          <ProductGallery
            product={product}
            images={images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        </motion.div>
      </section>

      {/* Reviews & User Comments */}
      <ProductReviewsSection product={product} />

      {/* Related Products Grid */}
      <RelatedProductsSection relatedProducts={relatedProducts} />
    </main>
  );
}