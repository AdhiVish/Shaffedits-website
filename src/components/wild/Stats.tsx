import { useRef } from "react";
import { motion, useTransform } from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";

const STATS = [
  { value: 40, suffix: "+", label: "brands trusted us" },
  { value: 15, suffix: "M+", label: "cumulative views generated" },
  { value: 1500, suffix: "+", label: "projects delivered" },
  { value: 300, suffix: "+", label: "brand videos produced" },
  { value: 10000, suffix: "+", label: "hours of creative work" },
  { value: 8, suffix: "+", label: "years in the game" },
];

const COUNTRIES = ["United States", "Russia", "Germany", "UAE", "Qatar", "Singapore", "Malaysia", "India"];

function Stat({ value, suffix, label, i }: { value: number; suffix: string; label: string; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // the number counts in lock-step with your scroll; scroll back and it counts down
  const { scrollYProgress } = useJsScroll({ target: ref, offset: ["start end", "center 0.55"] });
  const count = useTransform(scrollYProgress, [0, 1], [0, value]);
  const text = useTransform(count, (v) => Math.round(v).toLocaleString("en-US"));
  const x = useTransform(scrollYProgress, [0, 1], [i % 2 ? "18%" : "-18%", "0%"]);
  const skew = useTransform(scrollYProgress, [0, 1], [i % 2 ? -14 : 14, 0]);
  const flip = i % 2 === 1;

  return (
    <motion.div
      ref={ref}
      style={{ x, skewX: skew }}
      className={`flex flex-col items-baseline gap-2 border-t border-white/10 py-6 md:flex-row md:gap-10 ${
        flip ? "md:flex-row-reverse md:text-right" : ""
      }`}
    >
      <span className="font-display text-[clamp(4.5rem,15vw,13rem)] font-black leading-[0.85] tracking-tighter text-[#ACEC00] tabular-nums">
        <motion.span>{text}</motion.span>
        {suffix}
      </span>
      <span className="max-w-[14ch] font-display text-xl font-medium leading-tight text-white/70 md:text-3xl">{label}</span>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="bg-black px-6 py-28 text-white md:py-40">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-white/50">By the numbers</p>
        <h2 className="mb-16 max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] font-black leading-none tracking-tight">
          Numbers, because <span className="font-light italic text-white/50">clients like numbers.</span>
        </h2>
        {STATS.map((s, i) => (
          <Stat key={s.label} {...s} i={i} />
        ))}
        <div className="mt-14 border-t border-white/10 pt-8 text-xs uppercase tracking-[0.35em] text-white/50 md:text-sm">
          <span className="text-white/80">Global collaborations</span>: {COUNTRIES.join(" · ")}
        </div>
      </div>
    </section>
  );
}
