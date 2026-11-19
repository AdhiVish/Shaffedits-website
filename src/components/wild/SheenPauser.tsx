import { useEffect } from "react";

const SELECTOR = ".chrome-text, .chrome-bg, .chrome-surface, .neon-line, .lime-text";

/**
 * The neon-chrome sheen is a background-position animation, which the browser
 * has to repaint every frame. With ~50 chrome elements on the home page that
 * was the single biggest scroll cost. CSS keeps the sheen paused by default;
 * this one observer flags only the elements actually on screen
 * (`data-sheen-on`) so just those few animate.
 */
export function SheenPauser() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.setAttribute("data-sheen-on", "");
          else e.target.removeAttribute("data-sheen-on");
        }
      },
      { rootMargin: "120px 0px" },
    );

    const watch = (root: ParentNode) => {
      if (root instanceof Element && root.matches(SELECTOR)) io.observe(root);
      root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    };
    const unwatch = (root: Node) => {
      if (!(root instanceof Element)) return;
      if (root.matches(SELECTOR)) io.unobserve(root);
      root.querySelectorAll(SELECTOR).forEach((el) => io.unobserve(el));
    };

    watch(document.body);
    // Pick up chrome elements mounted later (route changes, lazy sections).
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => n instanceof Element && watch(n));
        r.removedNodes.forEach(unwatch);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
