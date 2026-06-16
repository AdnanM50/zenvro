"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { products } from "@/lib/products";
import {
  fadeUp, fadeIn,
  VIEWPORT_CONFIG, EASE_LUXURY,
} from "@/lib/animations";

const Product = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((p) => (p + 1) % products.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((p) => (p - 1 + products.length) % products.length);
  }, []);

  const activeProduct = products[activeIndex];
  const prevProduct = products[(activeIndex - 1 + products.length) % products.length];
  const nextProduct = products[(activeIndex + 1) % products.length];

  // Auto-play carousel
  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isHovering, nextSlide]);

  // Slide variants for AnimatePresence
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const sideVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
    hover: { y: -6, scale: 1.03 },
  };

  return (
    <section
      id="products"
      className="pt-24 pb-12 overflow-hidden bg-white"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Header — simplified, no 2026 / [Other] */}
      <motion.header
        className="px-6 md:px-8 max-w-[1600px] mx-auto w-full relative z-20 flex items-end justify-between"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        custom={0}
      >
        <h1 className="font-headline font-black text-3xl md:text-4xl xl:text-5xl tracking-tighter leading-none pt-4">
          ©velour - <br className="hidden md:block" />
          jacket momento
        </h1>

        <div className="flex gap-2 pb-2">
          <motion.button
            onClick={prevSlide}
            whileHover={{ scale: 1.15, backgroundColor: "#000", color: "#fff" }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center bg-white text-black transition-colors duration-300"
            aria-label="Previous slide"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </motion.button>
          <motion.button
            onClick={nextSlide}
            whileHover={{ scale: 1.15, backgroundColor: "#000", color: "#fff" }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full border border-outline-variant flex items-center justify-center bg-white text-black transition-colors duration-300"
            aria-label="Next slide"
          >
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Carousel */}
      <motion.div
        className="w-full max-w-[1200px] mx-auto px-6 md:px-8 mt-8 xl:mt-12 relative z-10"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_CONFIG}
        custom={0.2}
      >
        <div className="flex items-center justify-center gap-3 md:gap-5 xl:gap-8">
          {/* Far left — hidden on small screens */}
          <motion.div
            className="hidden xl:block w-[16vw] min-w-[180px] shrink-0"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 0.35, x: 0 }}
            viewport={VIEWPORT_CONFIG}
            transition={{ duration: 0.6, ease: EASE_LUXURY }}
          >
            <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative overflow-hidden">
              <img
                alt={products[(activeIndex - 2 + products.length) % products.length].name}
                className="w-full h-full object-cover"
                src={products[(activeIndex - 2 + products.length) % products.length].image}
              />
            </div>
          </motion.div>

          {/* Left side product */}
          <motion.div
            className="w-[18vw] md:w-[22vw] xl:w-[18vw] xl:min-w-[220px] shrink-0 cursor-pointer"
            variants={sideVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={VIEWPORT_CONFIG}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
            onClick={prevSlide}
          >
            <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative overflow-hidden">
              <img
                alt={prevProduct.name}
                className="w-full h-full object-cover"
                src={prevProduct.image}
              />
            </div>
          </motion.div>

          {/* Center — animated with AnimatePresence */}
          <div className="w-[55vw] md:w-[40vw] xl:w-[26vw] xl:min-w-[320px] shrink-0 flex flex-col items-center relative">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeProduct.slug}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE_LUXURY }}
                className="w-full"
              >
                <Link
                  href={`/products/${activeProduct.slug}`}
                  className="group block w-full"
                  aria-label={`View ${activeProduct.name} details`}
                >
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.35, ease: EASE_LUXURY }}
                    className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative overflow-hidden"
                  >
                    <img
                      alt={activeProduct.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={activeProduct.image}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      <div className="bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
                        <span className="font-label text-[10px] md:text-xs font-black tracking-[0.18em] uppercase">
                          {activeProduct.name}
                        </span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Tagline + dots */}
            <div className="h-[70px] xl:h-[80px] w-full mt-4 flex flex-col items-center justify-start">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeProduct.slug}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-full px-2 text-center font-label text-[10px] md:text-xs font-bold tracking-widest text-primary mb-4 xl:mb-5"
                >
                  [{activeProduct.tagline}]
                </motion.span>
              </AnimatePresence>

              <div className="flex gap-2">
                {products.map((product, dot) => (
                  <motion.span
                    key={product.slug}
                    onClick={() => {
                      setDirection(dot > activeIndex ? 1 : -1);
                      setActiveIndex(dot);
                    }}
                    className={`h-[2px] xl:h-[3px] cursor-pointer rounded-full ${
                      activeIndex === dot ? "bg-black" : "bg-surface-container-high"
                    }`}
                    animate={{
                      width: activeIndex === dot ? 32 : 24,
                    }}
                    transition={{ duration: 0.3, ease: EASE_LUXURY }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right side product */}
          <motion.div
            className="w-[18vw] md:w-[22vw] xl:w-[18vw] xl:min-w-[220px] shrink-0 cursor-pointer"
            variants={sideVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={VIEWPORT_CONFIG}
            transition={{ duration: 0.4, ease: EASE_LUXURY }}
            onClick={nextSlide}
          >
            <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative overflow-hidden">
              <img
                alt={nextProduct.name}
                className="w-full h-full object-cover"
                src={nextProduct.image}
              />
            </div>
          </motion.div>

          {/* Far right — hidden on small screens */}
          <motion.div
            className="hidden xl:block w-[16vw] min-w-[180px] shrink-0"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 0.35, x: 0 }}
            viewport={VIEWPORT_CONFIG}
            transition={{ duration: 0.6, ease: EASE_LUXURY }}
          >
            <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative overflow-hidden">
              <img
                alt={products[(activeIndex + 2) % products.length].name}
                className="w-full h-full object-cover"
                src={products[(activeIndex + 2) % products.length].image}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Product;