import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/** Pages that play an exit animation; leaving them, the jump to the top waits for the exit to finish (see App). */
const ANIMATED_EXIT = new Set(["/about"]);

/** Jump to the top instantly (used for plain route changes). */
export function scrollToTopNow() {
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

/**
 * Mounted once, globally. Whenever the route/hash changes, scrolls the
 * matching in-page element into view — the same smooth-scroll behaviour
 * the browser already gives plain `<a href="#section">` links (via
 * `scroll-behavior: smooth` in index.css), just re-implemented so it also
 * works when the hash target lives on a different route (e.g. a "Book a
 * Call" button on a /services page linking to "/#contact").
 */
export function ScrollToHash() {
  const { pathname, hash, key } = useLocation();
  const prevPath = useRef(pathname);

  useEffect(() => {
    const from = prevPath.current;
    prevPath.current = pathname;
    if (!hash) {
      // Plain route change: jump to top like a normal new page — unless the page
      // we're leaving is still animating out; App does it once that exit completes.
      if (from !== pathname && ANIMATED_EXIT.has(from)) return;
      scrollToTopNow();
      return;
    }
    const id = hash.replace("#", "");
    // The target may live on a page that is still waiting for the previous page's
    // exit animation, so keep looking for it for a little while.
    let raf = 0;
    let retry = 0;
    const t0 = performance.now();
    const go = (el: HTMLElement) => {
      const lenis = window.__lenis;
      if (lenis) {
        // Lenis caches the page height; a page that just mounted is taller than the one it replaced
        lenis.resize();
        lenis.scrollTo(el, { duration: 1.6 });
      } else el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const look = () => {
      const el = document.getElementById(id);
      if (el) {
        go(el);
        // pinned sections finish measuring a moment later; aim again once the layout has settled
        retry = window.setTimeout(() => go(el), 400);
        return;
      }
      if (performance.now() - t0 < 2500) raf = requestAnimationFrame(look);
    };
    raf = requestAnimationFrame(look);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(retry);
    };
  }, [pathname, hash, key]);

  return null;
}
