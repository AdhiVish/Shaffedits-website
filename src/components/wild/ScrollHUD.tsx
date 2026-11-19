import { motion, useSpring } from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";

/** Site-wide scroll progress: a lime bar along the top of the screen. */
export function ScrollHUD() {
  const { scrollYProgress } = useJsScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: bar }}
      className="neon-line fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
    />
  );
}

/** Animated film grain over everything. Pure CSS, no pointer events. */
export function Grain() {
  return <div aria-hidden className="grain-overlay" />;
}
