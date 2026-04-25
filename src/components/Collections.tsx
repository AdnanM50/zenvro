"use client";
import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  fadeUp, fadeIn, staggerContainer, staggerItem,
  VIEWPORT_CONFIG, EASE_LUXURY,
} from "@/lib/animations";

const collectionsData = [
  { id: 1, title: "Statement Pieces 2025", description: "Your go-to wardrobe staples, crafted for comfort and effortless style.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAN8FAzZ6Z98nZ8sYGleNSAKoti9_iF3fu8z7I65Bw3HONXl-SUhJFYxpU2jhhzXvfS9KTh-dHu4EE8Y2dcvTOb06mudpwFstqK7Iivzugrvbf-uf2_72GnEVFBZEkoflE7ChpGtu1ql9yTVkx2L25xQ62yFuKTcVw0oYF85SEBPSiWSpCN1Rigaj21UKn4GdayMsDE64POVE4d_jGtny91Wtv11ljhddqyuDDKA497rJFWHbwFER3RnmpWT3aF108NvbpfXEUdehWf" },
  { id: 2, title: "Everyday Essentials 2026", description: "Modern essentials designed for the rhythm of your daily life.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSUs8fzjaFq_UgiWHvEzssIE8LZz9u9S90I27yrJOmb8d9gRWmzjPxDqM7DXIlkP5iVLDm18Jil46QbiF_nWze1U6u45vN3tyoOfZeruHZhlvjTGDwSMZkTAdI3Zn7pdcPEntaCKxCTnZDDy3aY_3Vsx0ezQCPj1USMTLR7BDWozA0Usj2EpH4L7aGRTq4d-02iWLb3HUpBLgbuIQEhPOM-5JCNVA16Eze95sfztoWgSUCVbhGV_3DERa3OJo2wHqZVKc61zKD7UCq" },
  { id: 3, title: "Timeless Classics 2026", description: "Enduring pieces that transcend seasons and trends with effortless grace.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD1RoW5cBcoqT10u7JT7K7anHFGjv3NTjr8_mysaiCsk27iFErOxdP6goslnhBKFrJAC_iy8B-WQiIX7V9Tfq3ZQQ0DbKX0r3VZWRvRL8rx9a5vZ6yrB9wQOagG01U8I61_Y8LQ3h4X_uq6u5aA3yI1A8TPHK0I6FEbFTGhj8IPMtbCubZDYHng1tq9dl0pwI8nDdjwgiNLq4eIJQQwAMDg4xcvoJK2t1TVCM5VYhXT2E4qhkIg7Sq7cXGPMSQGBTsIMkBZr007K2R_" },
  { id: 4, title: "Seasonal Collections 2025", description: "Fresh arrivals curated for the current season's palette and mood.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve" },
];

const marqueeItems = [
  "CRAFTED STORIES", "PREMIUM MATERIALS", "PREMIUM FABRICS", "TIMELESS CUTS",
  "URBAN INFLUENCE", "SMART STYLE", "BOLD EXPRESSION", "REFINED DETAILS",
];

const Collections = () => {
  const [activeItem, setActiveItem] = useState(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section className="relative" id="collections-section">
      {/* Marquee Ticker Bar */}
      <div className="w-full border-y border-outline-variant py-3.5 overflow-hidden bg-surface">
        <div className="collections-marquee flex whitespace-nowrap">
          {[0, 1, 2].map((setIndex) => (
            <div key={setIndex} className="flex items-center shrink-0" aria-hidden={setIndex > 0}>
              {marqueeItems.map((text, i) => (
                <span key={`${setIndex}-${i}`} className="flex items-center">
                  <span className="font-label text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface px-4">{text}</span>
                  <span className="text-outline text-sm font-light">+</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-20 items-start">

          {/* Left Side: Clip-Path Image with Parallax */}
          <motion.div className="md:col-span-5 flex flex-col"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG} custom={0.1}>
            <motion.p className="font-body text-[13px] text-secondary leading-[1.7] max-w-[250px] mb-6"
              variants={fadeIn} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG} custom={0.2}>
              From enduring classics to daring statement{" "}pieces, our collections are crafted with intention.
            </motion.p>

            <div className="relative" ref={imageRef}>
              <motion.div className="collections-image-clip w-full overflow-hidden bg-surface-container" style={{ y: imageY }}>
                <img className="w-full h-full object-cover object-top" alt="Fashion model in minimalist light grey outfit"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmkJcw9YoYQsZHRiFf7H7KH3xRZyb_aYU4C7r3tffqaHqoyVKcPPLYoPhXRd7ZwQSlMieJrx5hQnmZvISItWIBj_f2EOhOXv7u3CxTN7jAQQpje6qCmuyPzquibOLEFvxPAcaezFSUmiXrVBqFcEjh0SI6u-PxB-62T34PWhO-wWIpHy_olj_K373paLFRyhzhjmm78s5jspSnyUstR6AOOKbiGXN-stQM3JqaIXTfnHDqacTyuDx-B6D0zH-11r0mb2nK5A07a8ve"
                  style={{ aspectRatio: "3/4" }} />
              </motion.div>
            </div>

            <motion.p className="font-body text-[12px] text-secondary mt-6 tracking-wide"
              variants={fadeIn} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG} custom={0.4}>
              Being Part Of Our Journey.
            </motion.p>
          </motion.div>

          {/* Right Side: Accordion List */}
          <motion.div className="md:col-span-7 flex flex-col pt-0 md:pt-8"
            variants={staggerContainer(0.12, 0.15)} initial="hidden" whileInView="visible" viewport={VIEWPORT_CONFIG}>
            {collectionsData.map((item, index) => (
              <motion.div key={item.id} variants={staggerItem}
                className={`collections-accordion-item border-b border-outline-variant ${index === 0 ? "border-t" : ""}`}
                onMouseEnter={() => setActiveItem(index)}>
                <div className="py-5 md:py-6 flex items-start justify-between cursor-pointer gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline text-xl md:text-[1.65rem] font-bold tracking-tight leading-tight text-on-surface">
                      {item.title}
                    </h3>
                    <div className={`collections-expand overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                      activeItem === index ? "max-h-[220px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}`}>
                      <p className="font-body text-[13px] text-secondary leading-relaxed max-w-[330px] mb-5">{item.description}</p>
                      <motion.button whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }}
                        className="collections-cta border border-on-surface rounded-full px-6 py-2.5 font-label text-[11px] font-bold tracking-[0.15em] uppercase flex items-center gap-3 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                        GET STARTED
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </motion.button>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-start">
                    {activeItem === index ? (
                      <div className="w-[120px] h-[88px] md:w-[150px] md:h-[105px] overflow-hidden transition-all duration-500">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center transition-all duration-300 hover:border-on-surface hover:scale-110 mt-1">
                        <span className="material-symbols-outlined text-[15px] text-secondary">arrow_forward</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Collections;
