import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";
import { featuredWork } from "@/data/featuredWork";

const base = import.meta.env.BASE_URL;

type Item = { src: string; name: string; tag: string };

const ITEMS: Item[] = [];
{
  const banners = featuredWork.slice(0, 10);
  const shots = ["t01", "t02", "t03", "t04", "t06", "t07", "t08", "t09"];
  for (let i = 0; i < 18; i++) {
    if (i % 2 === 0 && banners[i / 2]) {
      const b = banners[i / 2];
      ITEMS.push({ src: b.images[0], name: b.name, tag: b.category });
    } else {
      const s = shots[(i - 1) >> 1] ?? shots[0];
      ITEMS.push({ src: `${base}showcase/${s}.webp`, name: "Campaign creative", tag: "Social / Content" });
    }
  }
}

const N = ITEMS.length;
const SPACING = 760; // px of depth between pieces

function TunnelPiece({ item, i, progress }: { item: Item; i: number; progress: MotionValue<number> }) {
  // spiral layout around the centre, kept clear of the middle
  const angle = i * 2.35;
  const radius = 30 + (i % 3) * 5; // vw
  const left = 50 + Math.cos(angle) * radius;
  const top = 50 + Math.sin(angle) * radius * 0.55;
  const z = useTransform(progress, (v) => -(i + 1) * SPACING + v * (N + 1.5) * SPACING);
  const opacity = useTransform(z, [-SPACING * 7, -SPACING * 3, 150, 700], [0, 1, 1, 0]);
  const tilt = (i % 2 ? 1 : -1) * (8 + (i % 4) * 3);

  return (
    <motion.figure
      style={{ z, opacity, left: `${left}vw`, top: `${top}%`, rotate: tilt }}
      className="absolute w-[46vw] -translate-x-1/2 -translate-y-1/2 sm:w-[30vw] lg:w-[22vw]"
    >
      <img
        src={item.src}
        alt={item.name}
        loading="lazy"
        draggable={false}
        className="block w-full rounded-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.9)] ring-1 ring-[#ACEC00]/30"
      />
    </motion.figure>
  );
}

/**
 * Selected work as a 3D fly-through: scrolling pushes the camera forward
 * through a spiral of portfolio pieces.
 */
export function WorkTunnel() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(p, "change", (v) => setCurrent(Math.min(N - 1, Math.max(0, Math.floor(v * (N + 1.5) - 0.6)))));

  const titleScale = useTransform(p, [0, 0.15, 1], [0.8, 1, 1.3]);
  const titleOpacity = useTransform(p, [0, 0.05, 0.85, 1], [0, 1, 1, 0.2]);
  const ringRotate = useTransform(p, [0, 1], [0, 720]);
  const item = ITEMS[current];

  return (
    <section id="work" ref={ref} className="relative bg-black text-white" style={{ height: `${100 + N * 55}vh` }}>
      <div className="sticky top-0 h-svh overflow-hidden" style={{ perspective: "1000px" }} data-cursor="Fly">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(172,236,0,0.14), transparent 55%)" }}
        />
        {/* rotating rings for a sense of speed */}
        {[0, 1, 2].map((k) => (
          <motion.div
            key={k}
            aria-hidden
            style={{ rotate: ringRotate, scale: 1 + k * 0.6 }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#ACEC00]/20"
          />
        ))}

        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {ITEMS.map((it, i) => (
            <TunnelPiece key={i} item={it} i={i} progress={p} />
          ))}
        </div>

        <motion.div
          style={{ scale: titleScale, opacity: titleOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center mix-blend-difference"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/70">Featured Work / 03</p>
          <h2 className="font-display text-[clamp(3rem,11vw,10rem)] font-black uppercase leading-[0.85] tracking-tighter">
            Selected
            <br />
            <span className="font-light italic normal-case">projects</span>
          </h2>
        </motion.div>

        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-6 text-xs uppercase tracking-[0.3em] md:left-12 md:right-12">
          <div>
            <div className="font-display text-4xl font-black tabular-nums tracking-tight md:text-6xl">
              <span className="chrome-text">{String(current + 1).padStart(2, "0")}</span>
              <span className="text-white/30">/{N}</span>
            </div>
            <div className="mt-2 text-white/70">{item.name}</div>
            <div className="text-white/40">{item.tag}</div>
          </div>
          <a href="#archive" className="pointer-events-auto text-right text-white/60 hover:text-[#b8ff2e]">
            Skip to full archive ↓
          </a>
        </div>
      </div>
    </section>
  );
}
