"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/lib/products";
import {
  fadeUp, fadeIn, staggerContainer, staggerItem,
  VIEWPORT_CONFIG, EASE_LUXURY,
} from "@/lib/animations";

const Product = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextSlide = () => setActiveIndex((p) => (p + 1) % products.length);
  const prevSlide = () => setActiveIndex((p) => (p - 1 + products.length) % products.length);
  const getProduct = (offset: number) => products[(activeIndex + offset + products.length * 2) % products.length];
  const activeProduct = getProduct(0);

  const sideHover = { y: -4, scale: 1.02 };
  const sideTrans = { duration: 0.3, ease: EASE_LUXURY };

  return (
    <section id="products" className="pt-24 pb-12 overflow-hidden bg-white">
      <motion.header className="px-6 md:px-8 max-w-[1600px] mx-auto w-full relative z-20"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG} custom={0}>
        <h1 className="font-headline font-black text-3xl md:text-4xl xl:text-5xl tracking-tighter leading-none pt-4">
          ©velour - <br className="hidden md:block"/>jacket momento
        </h1>
      </motion.header>

      <motion.div className="w-full max-w-[1200px] mx-auto px-6 md:px-8 flex xl:grid xl:grid-cols-3 justify-between items-end mt-6 xl:mt-12 xl:mb-[-80px] relative z-30 pointer-events-none"
        variants={fadeIn} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG} custom={0.2}>
        <div className="hidden xl:flex justify-end items-end pb-4 pr-12 pointer-events-auto">
          <span className="font-label text-xs font-bold text-secondary tracking-widest">2026</span>
        </div>
        <div className="hidden xl:block"></div>
        <div className="w-full xl:w-auto flex justify-between items-end pb-2 xl:pl-12 pointer-events-auto">
          <div className="flex xl:hidden flex-col gap-1 mb-2">
            <span className="font-label text-[10px] md:text-xs font-bold text-secondary tracking-widest">2026</span>
            <span className="font-label text-[10px] md:text-xs font-bold text-secondary tracking-widest">[Other]</span>
          </div>
          <span className="hidden xl:inline-block font-label text-xs font-bold text-secondary tracking-widest mb-3">[Other]</span>
          <div className="flex gap-2">
            <motion.button onClick={prevSlide} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all duration-300 pointer-events-auto">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </motion.button>
            <motion.button onClick={nextSlide} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center bg-white hover:bg-black hover:text-white transition-all duration-300 pointer-events-auto">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      <motion.div className="flex items-center xl:items-end justify-center gap-3 md:gap-4 xl:gap-6 w-full overflow-hidden mt-6 xl:mt-4 pb-12 relative z-10"
        variants={staggerContainer(0.1, 0.2)} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG}>

        <motion.div className="hidden xl:block w-[18vw] min-w-[200px] shrink-0 opacity-40 translate-x-[-20%] pb-[90px]" variants={staggerItem}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt={getProduct(-2).name} className="w-full h-full object-cover" src={getProduct(-2).image} />
          </div>
        </motion.div>

        <motion.div className="w-[15vw] md:w-[25vw] xl:w-[20vw] xl:min-w-[260px] shrink-0 opacity-40 md:opacity-50 xl:opacity-100 pb-0 xl:pb-[90px] cursor-pointer"
          onClick={prevSlide} variants={staggerItem} whileHover={sideHover} transition={sideTrans}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt={getProduct(-1).name} className="w-full h-full object-cover" src={getProduct(-1).image} />
          </div>
        </motion.div>

        <motion.div className="w-[65vw] md:w-[45vw] xl:w-[28vw] xl:min-w-[340px] shrink-0 flex flex-col items-center xl:translate-y-[-24px]" variants={staggerItem}>
          <Link href={`/products/${activeProduct.slug}`} className="group block w-full" aria-label={`View ${activeProduct.name} details`}>
            <motion.div
              whileHover={{ y: -8, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.35, ease: EASE_LUXURY }}
              className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative overflow-hidden"
            >
              <img alt={activeProduct.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={activeProduct.image} />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4">
                  <span className="font-label text-[10px] md:text-xs font-black tracking-[0.18em] uppercase">{activeProduct.name}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </motion.div>
          </Link>
          <div className="h-[70px] xl:h-[90px] w-full mt-4 flex flex-col items-center justify-start">
            <span className="max-w-full px-2 text-center font-label text-[10px] md:text-xs font-bold tracking-widest text-primary mb-4 xl:mb-6">[{activeProduct.tagline}]</span>
            <div className="flex gap-2">
              {products.map((product, dot) => (
                <span key={product.slug} className={`w-6 xl:w-8 h-[2px] xl:h-[3px] transition-colors duration-300 ${activeIndex === dot ? 'bg-black' : 'bg-surface-container-high'}`}></span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="w-[15vw] md:w-[25vw] xl:w-[20vw] xl:min-w-[260px] shrink-0 opacity-40 md:opacity-50 xl:opacity-100 pb-0 xl:pb-[90px] cursor-pointer"
          onClick={nextSlide} variants={staggerItem} whileHover={sideHover} transition={sideTrans}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt={getProduct(1).name} className="w-full h-full object-cover" src={getProduct(1).image} />
          </div>
        </motion.div>

        <motion.div className="hidden xl:block w-[18vw] min-w-[200px] shrink-0 opacity-40 translate-x-[20%] pb-[90px]" variants={staggerItem}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt={getProduct(2).name} className="w-full h-full object-cover" src={getProduct(2).image} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Product;
