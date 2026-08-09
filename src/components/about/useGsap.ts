"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Runs a GSAP setup callback scoped to a section ref, cleaning up every
 * tween / ScrollTrigger on unmount (and on HMR / route change).
 */
export function useGsap(scope: RefObject<HTMLElement | null>, callback: () => void) {
  useEffect(() => {
    const ctx = gsap.context(callback, scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);
}
