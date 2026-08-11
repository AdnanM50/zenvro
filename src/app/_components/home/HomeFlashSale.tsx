'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Flame, ShoppingBag, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';

interface FlashSaleProduct {
  _id: string;
  name: string;
  slug: string;
  featuredImage?: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  sold?: number;
  category?: string;
  isNewArrival?: boolean;
}

interface FlashSaleItem {
  _id: string;
  title: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  startsAt?: string;
  endsAt?: string;
  products?: FlashSaleProduct[];
}

// Default fallback sample sale if backend hasn't seeded one yet
const DEFAULT_SAMPLE_SALE: FlashSaleItem = {
  _id: 'default-flash-sale',
  title: 'Limited Flash Deals',
  description: 'Unbeatable price cuts on premium jackets and urban streetwear.',
  discountType: 'percentage',
  discountValue: 35,
  endsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  products: [
    {
      _id: 'sample-1',
      name: 'Olive Urban Shell',
      slug: 'olive-urban-shell',
      regularPrice: 186,
      salePrice: 129,
      stock: 5,
      sold: 24,
      category: "Men's Jackets",
      featuredImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    },
    {
      _id: 'sample-2',
      name: 'Studio Hanger Coat',
      slug: 'studio-hanger-coat',
      regularPrice: 164,
      salePrice: 109,
      stock: 8,
      sold: 18,
      category: "Women's Jackets",
      featuredImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop',
    },
    {
      _id: 'sample-3',
      name: 'Brown Racer Leather',
      slug: 'brown-racer-leather',
      regularPrice: 328,
      salePrice: 219,
      stock: 3,
      sold: 29,
      category: "Men's Jackets",
      featuredImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    },
    {
      _id: 'sample-4',
      name: 'Black Cloud Puffer',
      slug: 'black-cloud-puffer',
      regularPrice: 232,
      salePrice: 149,
      stock: 6,
      sold: 21,
      category: "Men's Jackets",
      featuredImage: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?q=80&w=800&auto=format&fit=crop',
    },
  ],
};

export default function HomeFlashSale() {
  const [sale, setSale] = useState<FlashSaleItem | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 1,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLDivElement>(null);

  // Fetch active flash sale
  useEffect(() => {
    fetch('/api/marketing/flash-sales')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setSale(json.data[0]);
        } else {
          setSale(DEFAULT_SAMPLE_SALE);
        }
      })
      .catch(() => {
        setSale(DEFAULT_SAMPLE_SALE);
      });
  }, []);

  // Live Countdown Timer calculation
  useEffect(() => {
    if (!sale) return;

    const targetTime = sale.endsAt
      ? new Date(sale.endsAt).getTime()
      : Date.now() + 36 * 3600 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [sale]);

  // GSAP Smooth Scroll Entrance & Card Pulse Animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.flash-sale-badge', {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      });

      gsap.from('.flash-product-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [sale]);

  // Scroll Left / Right Handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  if (!sale) return null;

  const products = sale.products || [];

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-16 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white"
    >
      {/* Background Glow Overlay */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-gray-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flash-sale-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-red-500 text-black shadow-lg shadow-amber-500/20 uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 fill-black animate-bounce" />
                Live Flash Sale
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Ending Soon
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {sale.title}
            </h2>
            {sale.description && (
              <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-xl">
                {sale.description}
              </p>
            )}
          </div>

          {/* Bold Live Digital Countdown Clock */}
          <div ref={timerRef} className="flex items-center gap-3 bg-gray-900/80 border border-gray-800 p-3 rounded-2xl shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-amber-400 pr-2 border-r border-gray-800">
              <Clock className="w-4 h-4 animate-spin text-amber-400" style={{ animationDuration: '6s' }} />
              <span className="text-xs font-semibold uppercase tracking-wide hidden sm:inline">Ends In</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-center">
              <div className="bg-black/90 border border-amber-500/30 px-2.5 py-1.5 rounded-xl min-w-[42px]">
                <span className="text-base md:text-lg font-bold text-white leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Days</span>
              </div>
              <span className="text-amber-500 font-bold text-lg">:</span>
              <div className="bg-black/90 border border-amber-500/30 px-2.5 py-1.5 rounded-xl min-w-[42px]">
                <span className="text-base md:text-lg font-bold text-white leading-none">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Hrs</span>
              </div>
              <span className="text-amber-500 font-bold text-lg">:</span>
              <div className="bg-black/90 border border-amber-500/30 px-2.5 py-1.5 rounded-xl min-w-[42px]">
                <span className="text-base md:text-lg font-bold text-white leading-none">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Min</span>
              </div>
              <span className="text-amber-500 font-bold text-lg">:</span>
              <div className="bg-black/90 border border-amber-500/40 px-2.5 py-1.5 rounded-xl min-w-[42px] bg-amber-500/10">
                <span className="text-base md:text-lg font-bold text-amber-400 leading-none">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-amber-400/80 uppercase tracking-wider">Sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Controls & Slider */}
        <div className="relative">
          {/* Scroll Nav Buttons */}
          <div className="absolute -top-14 right-0 hidden sm:flex items-center gap-2 z-20">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Previous items"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors shadow-md"
              aria-label="Next items"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Scrollable Row */}
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-1"
          >
            {products.map((prod) => {
              const reg = prod.regularPrice || 100;
              const saleP = prod.salePrice || reg * 0.7;
              const pct = Math.round(((reg - saleP) / reg) * 100);
              const totalStock = (prod.stock || 5) + (prod.sold || 15);
              const soldCount = prod.sold || 15;
              const claimedPct = Math.min(95, Math.round((soldCount / totalStock) * 100));

              return (
                <div
                  key={prod._id}
                  className="flash-product-card flex-none w-[270px] sm:w-[300px] snap-start bg-gray-900/90 border border-gray-800/90 hover:border-amber-500/40 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-1.5 shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Area */}
                    <div className="relative aspect-[4/4] rounded-xl overflow-hidden bg-gray-950 mb-3">
                      <img
                        src={
                          prod.featuredImage ||
                          'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop'
                        }
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Bright Discount Badge */}
                      <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                        -{pct > 0 ? pct : 35}% OFF
                      </span>

                      {/* Stock Badge */}
                      <span className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md text-amber-300 font-semibold text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {prod.stock || 5} Left
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">
                      {prod.category || 'Outerwear'}
                    </div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                      {prod.name}
                    </h3>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-extrabold text-amber-400">
                        ${saleP.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500 line-through font-medium">
                        ${reg.toFixed(2)}
                      </span>
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                        <span>Claimed: {claimedPct}%</span>
                        <span className="text-amber-400 font-semibold">Only {prod.stock || 5} remaining</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${claimedPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/products/${prod.slug}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Claim Deal Now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
