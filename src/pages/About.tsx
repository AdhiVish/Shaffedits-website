import { useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/services";
import { Manifesto } from "@/components/wild/Manifesto";

/** Where the last click landed, so the page can open out of that exact spot (e.g. the navbar's About link). */
const origin = { x: 50, y: 8 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      origin.x = (e.clientX / window.innerWidth) * 100;
      origin.y = (e.clientY / window.innerHeight) * 100;
    },
    true,
  );
}

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * The About page: the "About / 01" manifesto that used to sit on the home page.
 * Entering: the lime page opens in a circle from wherever you clicked.
 * Leaving: a black curtain with a neon edge sweeps up over it, then the next page appears.
 * Esc goes back home.
 */
export default function About() {
  const navigate = useNavigate();
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const at = `${origin.x}% ${origin.y}%`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <>
      <SEOHead
        title="Shaffedits | About"
        description="Shaffedits is a multidisciplinary creative agency bringing branding, content, design, digital strategy, filmmaking and web experiences under one creative roof."
        path="/about"
      />
      <motion.div
        initial={still ? { opacity: 0 } : { clipPath: `circle(0% at ${at})` }}
        animate={still ? { opacity: 1 } : { clipPath: `circle(150% at ${at})`, transitionEnd: { clipPath: "none" } }}
        exit={{ opacity: 1, transition: { duration: 0.6 } }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        <Manifesto page />
      </motion.div>

      {/* exit curtain: waits below the screen, sweeps up when the page leaves */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] bg-black"
        initial={{ y: "101%" }}
        animate={{ y: "101%" }}
        exit={still ? { y: "101%" } : { y: "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="neon-line absolute inset-x-0 top-0 h-[3px]" />
        <motion.span
          className="absolute inset-0 grid place-items-center font-display text-[18vw] font-black uppercase leading-none tracking-tighter text-white/[0.06]"
          initial={{ y: "30%" }}
          exit={{ y: "0%" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          shaff
        </motion.span>
      </motion.div>
    </>
  );
}
