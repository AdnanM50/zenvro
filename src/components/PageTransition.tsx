"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { lenisStore } from "@/lib/lenis";
import { isPublicRoute } from "@/lib/routes";

// ─── Transition curtain ──────────────────────────────────────────────
const BANDS = [
  { top: "0%", height: "34%" },
  { top: "31%", height: "38%" },
  { top: "65%", height: "35%" },
];

// Parallelogram — every band shares the same diagonal so the seams read
// as one continuous slash across the screen, echoing the site's clip language.
const BAND_CLIP = "polygon(0 0, 100% 0, calc(100% - 6vw) 100%, -6vw 100%)";

const LABELS: Record<string, string> = {
  "/": "MAISON",
  "/about": "THE HOUSE",
  "/products": "THE EDIT",
  "/cart": "SHOPPING",
  "/login": "SIGN IN",
  "/signup": "JOIN",
  "/contact": "CONTACT",
  "/contacte": "CONTACT",
  "/privacy": "PRIVACY",
  "/terms": "TERMS",
};

function routeLabel(pathname: string) {
  if (pathname in LABELS) return LABELS[pathname];
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg ? seg.replace(/-/g, " ").toUpperCase() : "MAISON";
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const prevPathRef = useRef(pathname);
  const busyRef = useRef(false);
  const counterValueRef = useRef(0);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Safety net: only ever run on public routes (admin / dashboard panels
    // are excluded by PublicLayoutWrapper too).
    if (!isPublicRoute(pathname)) return;

    if (pathname === prevPathRef.current || busyRef.current) return;
    prevPathRef.current = pathname;

    const overlay = overlayRef.current;
    const content = contentRef.current;
    if (!overlay || !content) return;

    const bands = Array.from(overlay.querySelectorAll<HTMLElement>("[data-band]"));
    const slash = overlay.querySelector<HTMLElement>("[data-slash]");
    const stamp = overlay.querySelector<HTMLElement>("[data-stamp]");
    if (bands.length === 0 || !slash || !stamp) return;

    busyRef.current = true;
    counterValueRef.current += 1;

    if (labelRef.current) labelRef.current.textContent = routeLabel(pathname);
    if (counterRef.current) counterRef.current.textContent = `(0${counterValueRef.current})`;

    const scrollTop = () => {
      lenisStore.instance?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    };

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(content, { autoAlpha: 1 });
        busyRef.current = false;
      },
    });
    timelineRef.current = tl;

    // Cover — slanted bands sweep in, stamp marks the route
    tl.set(overlay, { autoAlpha: 1 });
    tl.fromTo(
      bands,
      { xPercent: -115 },
      { xPercent: 0, duration: 0.5, stagger: 0.09, ease: "power4.inOut" },
      0
    );
    tl.fromTo(slash, { xPercent: -115 }, { xPercent: 0, duration: 0.45, ease: "power3.out" }, 0);
    tl.fromTo(
      stamp,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: "power3.out" },
      0.12
    );

    // Fully covered → silently reset scroll to the top of the new route
    tl.call(scrollTop, undefined, 0.7);

    // Uncover — stamp lifts, bands peel away with a subtle fold
    tl.to(stamp, { autoAlpha: 0, y: -24, duration: 0.25, ease: "power3.in" }, 0.95);
    tl.to(
      bands,
      {
        xPercent: 115,
        y: (index: number) => (index === 0 ? "-8%" : index === 2 ? "8%" : "0%"),
        duration: 0.6,
        stagger: 0.09,
        ease: "power4.inOut",
      },
      0.95
    );
    tl.to(slash, { xPercent: 115, duration: 0.5, ease: "power3.in" }, 1.0);

    // The freshly mounted page settles in as the curtain lifts
    tl.fromTo(content, { autoAlpha: 0.2 }, { autoAlpha: 1, duration: 0.45, ease: "power1.out" }, 1.05);
  }, [pathname]);

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  return (
    <>
      <div ref={contentRef}>{children}</div>

      {/* Route transition curtain */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[100]"
        style={{ visibility: "hidden", opacity: 0 }}
        aria-hidden="true"
      >
        {BANDS.map((band, i) => (
          <div
            key={i}
            data-band
            className={`absolute left-0 w-full bg-background ${i > 0 ? "border-t border-outline-variant/60" : ""}`}
            style={{ top: band.top, height: band.height, clipPath: BAND_CLIP }}
          />
        ))}

        <div data-slash className="absolute inset-y-[-12%] left-0 w-28 origin-left -skew-x-12 bg-primary/90" />

        <div data-stamp className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <span className="font-label text-[11px] font-black uppercase tracking-[0.4em] text-secondary">
            VELOUR — ROUTING
          </span>
          <span
            ref={labelRef}
            className="font-headline text-5xl md:text-8xl font-black tracking-tighter uppercase text-foreground"
          />
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <span ref={counterRef} className="font-mono text-xs text-secondary">
              (00)
            </span>
            <span className="h-px w-8 bg-primary" />
          </div>
        </div>
      </div>
    </>
  );
}
