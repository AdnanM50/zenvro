"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  fadeUp, fadeIn, staggerContainer, staggerItem,
  VIEWPORT_CONFIG, EASE_LUXURY,
} from "@/lib/animations";

const products = [
  { id: 1, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuApqkDG7nrp_PbIMaiExWjRhCV6icWvah6de_G_Gn3rSrWWNk_D0SJonSKh2K9ltLuwEwLJ7l25Web5eiN-dY0hmzeKv_HeieLnWUQ3To4U34O44lzguJC6a_SxfpuHzedpqNicBTPnj6oFgm6BEAgm1fURLpPmC-SxMJGiZr0wIYw_DixMZ3pzJTx1xLj4lpTlwetP_s7LXe7sr9VZxlp_MrJ_SNT3wrpHm5QvALb3TUPZtqqZHYX2nzR3-XI-GEUdxeAwZo5CnFJ5" },
  { id: 2, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWUkkfOLkPA1s_eOv5emSCzRkDMp1u-bXn3gd1HekVg_oQ0VXGJG2wYICd4X0AUPJc7eSp5KdrYphfl4WnMvx2YTCjKvDbnPLnzy_SND7wqodNIOSsrnHaEXqObVOewcGJnxNQAvGNiUm3_EV7HQglEYIPmiZul0Cxx2MnEvc75IjyGwS-c2ilIQJF6RjFzOhih7b9SDCUhX3DstkoEncM23xxSP_W7aX3aTSMUPtudXC-LSR0LVxvoZpl_kTIabPntTdSLQd9fh8J" },
  { id: 3, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCmCQPxDqEmDCl9pMCnXP-4xFVjMrSM47OhMm03qJTwdIOhnrRPzft-91CzH32mhGZ6D5ofcbGQeX6L6GsZOkFq6ESe9KDiQmKm_EIFuoXK1CkqzhNHGRD7NsCMLqwL204ymZo_VL61OrH4batQwE46rn1fcSdljMsjR2LKf8BIkWmDy2fzDpuvUvFubsZqmhZNQ3zlwTZCThgXzHgt0MnIv8I2wZAPgd0hQwp-kMOYY0_jVTphJ9lrSIsqpY96F5EwN_hVtH2fjUkf" },
  { id: 4, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBw-H6Lo7uHeSKQkkehwJ0obz6I87jHbVj4zkYmRhpYZcGseme6lf4Rgdmll6lz06j-oiOYvEIMTbnjze7cAoasqctetYOoRoAy5WDVV00FfXFyPxxhk1XeHI9zxoF9sNhvN-zjtsTBAccW1YtFVaXuXpZMV7r_uzUt7D4I6U9WbUISCZWcmwHq_K_ByL5hHDRo3uB4ZQTA0uFpMncIeTLgwLehGJdsJzQe2y39_CL8BfOVzMH2ruPF80UmCRx1KMCvDO0PNuFXZEHP" },
];

const Product = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const nextSlide = () => setActiveIndex((p) => (p + 1) % products.length);
  const prevSlide = () => setActiveIndex((p) => (p - 1 + products.length) % products.length);
  const getImg = (offset: number) => products[(activeIndex + offset + products.length * 2) % products.length].image;

  const sideHover = { y: -4, scale: 1.02 };
  const sideTrans = { duration: 0.3, ease: EASE_LUXURY };

  return (
    <section className="pt-24 pb-12 overflow-hidden bg-white">
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
            <img alt="Model -2" className="w-full h-full object-cover" src={getImg(-2)} />
          </div>
        </motion.div>

        <motion.div className="w-[15vw] md:w-[25vw] xl:w-[20vw] xl:min-w-[260px] shrink-0 opacity-40 md:opacity-50 xl:opacity-100 pb-0 xl:pb-[90px] cursor-pointer"
          onClick={prevSlide} variants={staggerItem} whileHover={sideHover} transition={sideTrans}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt="Model -1" className="w-full h-full object-cover" src={getImg(-1)} />
          </div>
        </motion.div>

        <motion.div className="w-[65vw] md:w-[45vw] xl:w-[28vw] xl:min-w-[340px] shrink-0 flex flex-col items-center xl:translate-y-[-24px]" variants={staggerItem}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt="Model active" className="w-full h-full object-cover" src={getImg(0)} />
          </div>
          <div className="h-[70px] xl:h-[90px] w-full mt-4 flex flex-col items-center justify-start">
            <span className="font-label text-[10px] md:text-xs font-bold tracking-widest text-primary mb-4 xl:mb-6">[Wear the Moment]</span>
            <div className="flex gap-2">
              {[0,1,2].map((dot) => (
                <span key={dot} className={`w-6 xl:w-8 h-[2px] xl:h-[3px] transition-colors duration-300 ${activeIndex % 3 === dot ? 'bg-black' : 'bg-surface-container-high'}`}></span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="w-[15vw] md:w-[25vw] xl:w-[20vw] xl:min-w-[260px] shrink-0 opacity-40 md:opacity-50 xl:opacity-100 pb-0 xl:pb-[90px] cursor-pointer"
          onClick={nextSlide} variants={staggerItem} whileHover={sideHover} transition={sideTrans}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt="Model 1" className="w-full h-full object-cover" src={getImg(1)} />
          </div>
        </motion.div>

        <motion.div className="hidden xl:block w-[18vw] min-w-[200px] shrink-0 opacity-40 translate-x-[20%] pb-[90px]" variants={staggerItem}>
          <div className="w-full aspect-4/5 geometric-clip-product bg-surface-container relative">
            <img alt="Model 2" className="w-full h-full object-cover" src={getImg(2)} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Product;
