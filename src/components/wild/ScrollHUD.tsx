import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";


/**
 * Site-wide scroll instruments: a lime progress bar along the top and a
 * spinning "keep scrolling" badge that spins faster the faster you scroll
 * (and backwards when you scroll up). Click it to jump to the contact form.
 */
export function ScrollHUD() {
  const { scrollY, scrollYProgress } = useJsScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const spin = useTransform(scrollY, (v) => v * 0.25);
  const velocity = useVelocity(scrollY);
  const wobble = useSpring(useTransform(velocity, [-3000, 3000], [0.85, 1.25]), {
    stiffness: 300,
    damping: 20,
  });
  const [pct, setPct] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setPct(Math.round(v * 100)));

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: bar }}
        className="neon-line fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      />
      <motion.a
        href="#contact"
        data-cursor="Talk"
        aria-label="Jump to contact"
        style={{ scale: wobble }}
        className="fixed bottom-5 right-5 z-[55] hidden h-24 w-24 items-center justify-center md:flex"
      >
        <motion.svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ rotate: spin }}>
          <defs>
            <linearGradient id="hud-chrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6f9f00" />
              <stop offset="0.35" stopColor="#ecffc2" />
              <stop offset="0.55" stopColor="#b8ff2e" />
              <stop offset="1" stopColor="#4d7a00" />
            </linearGradient>
            <path id="hud-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <circle cx="50" cy="50" r="49" fill="#000" stroke="url(#hud-chrome)" strokeWidth="1" />
          <text fill="url(#hud-chrome)" fontSize="10.5" fontWeight="800" letterSpacing="2.4" fontFamily="Space Grotesk, sans-serif">
            <textPath href="#hud-circle">KEEP SCROLLING ✦ OR SAY HI ✦</textPath>
          </text>
        </motion.svg>
        <span className="chrome-text relative font-display text-sm font-black tabular-nums">
          {String(pct).padStart(2, "0")}%
        </span>
      </motion.a>
    </>
  );
}

/** Animated film grain over everything. Pure CSS, no pointer events. */
export function Grain() {
  return <div aria-hidden className="grain-overlay" />;
}
