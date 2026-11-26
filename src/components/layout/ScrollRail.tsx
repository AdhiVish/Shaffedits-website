import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { createPortal } from "react-dom";

const SECTIONS = [
  ["top", "Home"],
  ["services", "Services"],
  ["stats", "Numbers"],
  ["work", "Work"],
  ["videos", "Reels"],
  ["socials", "Socials"],
  ["team", "Team"],
  ["clients", "Clients"],
  ["reviews", "Reviews"],
  ["contact", "Contact"],
] as const;

/**
 * Desktop-only rail on the right edge (replaces the browser scrollbar, which is hidden):
 * a thin line that fills blue as you scroll, with a dot per section. The current
 * section's name shows beside it; hover shows the others; click jumps there.
 * Over white sections (marked `data-rail-light`) it switches to dark ink.
 */
export function ScrollRail() {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [active, setActive] = useState<string>("top");
  const [light, setLight] = useState(false);

  useEffect(() => {
    const pick = () => {
      const mid = window.innerHeight * 0.5;
      let cur = "top";
      for (const [id] of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= mid) cur = id;
      }
      setActive(cur);
      const lights = document.querySelectorAll<HTMLElement>("[data-rail-light]");
      let onLight = false;
      lights.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) onLight = true;
      });
      setLight(onLight);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, []);

  const go = (id: string) => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number | HTMLElement, o?: object) => void } }).__lenis;
    const el = id === "top" ? null : document.getElementById(id);
    if (lenis) lenis.scrollTo(el ?? 0, { duration: 1.4 });
    else if (el) el.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ink = light ? "#0a0a0a" : "#ffffff";
  const mute = light ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";

  return createPortal(
    <nav aria-label="Sections" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div className="relative flex flex-col gap-[18px]">
        <span
          aria-hidden
          className="absolute bottom-0 right-[3px] top-0 w-px transition-colors duration-300"
          style={{ background: light ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)" }}
        >
          <motion.span className="absolute inset-0 origin-top bg-[#2641FF]" style={{ scaleY: fill }} />
        </span>
        {SECTIONS.map(([id, label]) => {
          const on = id === active;
          return (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              aria-current={on ? "true" : undefined}
              className="group relative flex cursor-pointer items-center justify-end gap-3 border-0 bg-transparent p-0"
            >
              <span
                className={
                  "text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 " +
                  (on ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100")
                }
                style={{ color: on ? ink : mute }}
              >
                {label}
              </span>
              <span
                className="relative block size-[7px] rounded-full border transition-all duration-300"
                style={{
                  borderColor: on ? "#2641FF" : mute,
                  background: on ? "#2641FF" : light ? "#ffffff" : "#000000",
                  transform: on ? "scale(1.4)" : "none",
                  boxShadow: on ? "0 0 0 3px rgba(38,65,255,0.25)" : "none",
                }}
              />
            </button>
          );
        })}
      </div>
    </nav>,
    document.body,
  );
}
