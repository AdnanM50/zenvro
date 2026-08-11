'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Copy, Sparkles, Tag, X, Zap } from 'lucide-react';
import Link from 'next/link';
import gsap from 'gsap';

interface PopupBannerItem {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  discountCode?: string;
}

const DEFAULT_POPUP: PopupBannerItem = {
  _id: 'default-popup',
  title: 'Unlock 20% Off Your First Order',
  description: 'Join the VELORA inner circle and get instant access to secret flash deals & free express shipping.',
  imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
  buttonText: 'Claim My Discount Now',
  buttonLink: '/products',
  discountCode: 'WELCOME20',
};

export default function FlashPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [banner, setBanner] = useState<PopupBannerItem | null>(null);
  const [copied, setCopied] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch active popup configuration from public API
  useEffect(() => {
    // Check frequency cap in sessionStorage
    const dismissed = sessionStorage.getItem('velora_popup_dismissed');
    if (dismissed) return;

    fetch('/api/marketing/popups')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.length > 0) {
          setBanner(json.data[0]);
        } else {
          setBanner(DEFAULT_POPUP);
        }
      })
      .catch(() => {
        setBanner(DEFAULT_POPUP);
      });
  }, []);

  // Trigger setup (Timer delay 5s + Scroll trigger 35% + Exit Intent)
  useEffect(() => {
    if (!banner) return;
    const dismissed = sessionStorage.getItem('velora_popup_dismissed');
    if (dismissed) return;

    let triggered = false;

    const triggerShow = () => {
      if (triggered) return;
      triggered = true;
      setIsOpen(true);
    };

    // 1. Time delay: 5 seconds
    const timer = setTimeout(() => {
      triggerShow();
    }, 5000);

    // 2. Scroll percentage: 35%
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTotal > 0) {
        const scrollPct = (window.scrollY / scrollTotal) * 100;
        if (scrollPct >= 35) {
          triggerShow();
        }
      }
    };

    // 3. Exit intent: mouse moves above viewport top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        triggerShow();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [banner]);

  // GSAP Animation when modal opens
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    sessionStorage.setItem('velora_popup_dismissed', 'true');
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.25,
        ease: 'power2.in',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen || !banner) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl text-white"
      >
        {/* Clear Close Button "X" */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-white text-white hover:text-black border border-white/10 transition-all cursor-pointer shadow-lg group"
          aria-label="Close popup"
        >
          <X className="w-4 h-4 transition-transform group-hover:scale-110" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px]">
          {/* Image Banner Left Column */}
          <div className="md:col-span-5 relative bg-gray-900 overflow-hidden hidden md:block">
            <img
              src={
                banner.imageUrl ||
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop'
              }
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider shadow-lg">
                <Zap className="w-3 h-3 fill-black" />
                Limited Offer
              </span>
            </div>
          </div>

          {/* Content Column */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                  Exclusive Reward
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-2 leading-tight">
                {banner.title}
              </h3>

              {banner.description && (
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                  {banner.description}
                </p>
              )}

              {/* Promo Code Box */}
              {banner.discountCode && (
                <div className="mb-6 p-3 bg-gray-900/90 border border-dashed border-amber-500/40 rounded-2xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">Promo Code</div>
                      <div className="font-mono font-bold text-amber-300 text-sm tracking-widest">
                        {banner.discountCode}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyCode(banner.discountCode!)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* CTA Button */}
            <div className="space-y-2">
              <Link
                href={banner.buttonLink || '/products'}
                onClick={handleClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.98]"
              >
                {banner.buttonText || 'Claim My Discount Now'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-[10px] text-center text-gray-500">
                No spam. Unsubscribe anytime.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
