import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";

const LINES = ["GOT AN", "IDEA?"];

// stable pseudo-random numbers so every letter falls differently
const rand = (seed: number) => {
  const x = Math.sin(seed * 999.7) * 10000;
  return x - Math.floor(x);
};

function Letter({ ch, seed, progress }: { ch: string; seed: number; progress: MotionValue<number> }) {
  const start = rand(seed) * 0.25;
  const end = start + 0.35 + rand(seed + 1) * 0.15;
  const y = useTransform(progress, [start, end], [`${-120 - rand(seed + 2) * 80}vh`, "0vh"]);
  const rotate = useTransform(progress, [start, end], [(rand(seed + 3) - 0.5) * 360, (rand(seed + 4) - 0.5) * 14]);
  return (
    <motion.span
      style={{ y, rotate }}
      whileHover={{ scaleY: 1.35, color: "#000", transition: { type: "spring", stiffness: 500, damping: 10 } }}
      className="inline-block origin-bottom"
    >
      {ch === " " ? " " : ch}
    </motion.span>
  );
}

/** The letters rain down and land as you scroll into the contact form. */
export function BigOutro() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const sub = useTransform(scrollYProgress, [0.6, 0.85], [0, 1]);
  const subY = useTransform(scrollYProgress, [0.6, 0.85], ["40px", "0px"]);
  let seed = 1;

  return (
    <section ref={ref} className="relative h-[220vh] bg-[#ACEC00] text-black">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-4 text-center">
        <h2 aria-label="Got an idea?" className="font-display text-[clamp(4rem,19vw,20rem)] font-black leading-[0.82] tracking-tight">
          {LINES.map((line) => (
            <span key={line} aria-hidden className="block whitespace-nowrap">
              {line.split("").map((ch) => (
                <Letter key={seed} ch={ch} seed={seed++} progress={scrollYProgress} />
              ))}
            </span>
          ))}
        </h2>
        <motion.p style={{ opacity: sub, y: subY }} className="mt-8 max-w-md text-lg font-medium md:text-xl">
          Good. Let's make it loud. Tell us about it below ↓
        </motion.p>
      </div>
    </section>
  );
}
