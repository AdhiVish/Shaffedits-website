import { useEffect } from "react";
import Lenis from "lenis";
import { isPhone } from "@/lib/usePhone";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Inertia ("buttery") scrolling for the whole site. Lenis drives the real
 * window scroll position, so every scroll-linked animation (motion's
 * useScroll) keeps working — it just glides instead of stepping.
 * Disabled for people who ask the OS for reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Phones: plain native scrolling. Lenis only smooths mouse wheels anyway, but its
    // per-frame loop and scroll-state class flips still cost frames on a phone.
    if (isPhone()) return;
    const lenis = new Lenis({
      lerp: 0.12, // higher = catches up faster (0.085 felt floaty/slow)
      wheelMultiplier: 1,
      anchors: true,
      autoRaf: true,
    });
    window.__lenis = lenis;
    return () => {
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
  return null;
}
