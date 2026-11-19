import { useEffect, useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";
import { GlowButton } from "../ui/GlowButton";
import { ArrowButton } from "../ui/ArrowButton";
import { VelocityMarquee } from "../wild/VelocityMarquee";
import logoWhite from "@/assets/logo-white.png";

const EASE = [0.16, 1, 0.3, 1] as const;
const base = import.meta.env.BASE_URL;

type Card = {
  src: string;
  pos: string;
  w: string;
  rot: number;
  /** parallax depth: higher = moves more with cursor */
  depth: number;
  /** direction the card is flung when you scroll: -1 left/up, 1 right/down */
  fx: number;
  fy: number;
  far?: boolean;
  desktopOnly?: boolean;
};

const CARDS: Card[] = [
  { src: "a01", pos: "left-[-2%] top-[9%]", w: "w-[26vw] md:w-[11vw]", rot: -7, depth: 34, fx: -1, fy: -1 },
  { src: "a05", pos: "left-[2%] top-[39%]", w: "w-[24vw] md:w-[10vw]", rot: 4, depth: 52, fx: -1.3, fy: 0, desktopOnly: true },
  { src: "a06", pos: "left-[7%] top-[66%]", w: "w-[26vw] md:w-[11vw]", rot: -4, depth: 40, fx: -1, fy: 1 },
  { src: "a02", pos: "right-[-2%] top-[10%]", w: "w-[26vw] md:w-[11vw]", rot: 6, depth: 36, fx: 1, fy: -1 },
  { src: "a08", pos: "right-[3%] top-[40%]", w: "w-[24vw] md:w-[10vw]", rot: -5, depth: 54, fx: 1.3, fy: 0, desktopOnly: true },
  { src: "a07", pos: "right-[8%] top-[66%]", w: "w-[26vw] md:w-[11vw]", rot: 5, depth: 42, fx: 1, fy: 1 },
  { src: "a03", pos: "left-[16%] top-[8%]", w: "md:w-[7vw]", rot: 8, depth: 14, fx: -0.6, fy: -1.4, far: true, desktopOnly: true },
  { src: "a10", pos: "left-[22%] top-[80%]", w: "md:w-[8vw]", rot: -6, depth: 16, fx: -0.6, fy: 1.4, far: true, desktopOnly: true },
  { src: "a04", pos: "right-[16%] top-[7%]", w: "md:w-[8vw]", rot: -7, depth: 14, fx: 0.6, fy: -1.4, far: true, desktopOnly: true },
  { src: "a09", pos: "right-[22%] top-[80%]", w: "md:w-[7vw]", rot: 6, depth: 16, fx: 0.6, fy: 1.4, far: true, desktopOnly: true },
];

function FloatingCard({ card, index, progress }: { card: Card; index: number; progress: MotionValue<number> }) {
  // On scroll the cards get flung out of the frame toward the viewer.
  const x = useTransform(progress, [0, 0.7], ["0vw", `${card.fx * 42}vw`]);
  const y = useTransform(progress, [0, 0.7], ["0vh", `${card.fy * 38}vh`]);
  const scale = useTransform(progress, [0, 0.7], [1, card.far ? 1.6 : 2.4]);
  const spin = useTransform(progress, [0, 0.7], [0, card.fx * 50]);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${card.pos} ${card.w} ${card.desktopOnly ? "hidden md:block" : ""} ${
        card.far ? "" : "opacity-45 md:opacity-100"
      }`}
      style={{
        transform: `translate3d(calc(var(--px, 0) * ${card.depth}px), calc(var(--py, 0) * ${card.depth}px), 0) rotate(${card.rot}deg)`,
      }}
    >
      <motion.div style={{ x, y, scale, rotate: spin }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 120, rotate: card.fx * -40 }}
          animate={{ opacity: card.far ? 0.5 : 1, scale: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 14, delay: 1.3 + index * 0.08 }}
        >
          <motion.img
            src={`${base}showcase/${card.src}.webp`}
            alt=""
            draggable={false}
            decoding="async"
            className="block h-auto w-full rounded-xl"
            style={{
              boxShadow: `0 40px 70px -24px rgba(0,0,0,0.9), 0 0 0 1px ${
                card.far ? "rgba(255,255,255,0.08)" : "rgba(172,236,0,0.28)"
              }, 0 0 40px -8px rgba(172,236,0,${card.far ? 0.05 : 0.16})`,
              filter: card.far ? "blur(1.5px) saturate(0.8)" : undefined,
            }}
            animate={{ y: [0, -14, 0], rotate: [0, card.fx * 2, 0] }}
            transition={{ duration: 6 + (index % 4), repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** One headline line whose words rise out from behind a mask. */
function MaskedLine({
  words,
  start,
  accentIndex,
  x,
}: {
  words: string[];
  start: number;
  accentIndex?: number;
  x: MotionValue<string>;
}) {
  return (
    <motion.span className="block" style={{ x }}>
      {words.map((w, i) => (
        <span key={w + i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={"inline-block " + (i === accentIndex ? "chrome-text pr-[0.08em] italic font-light" : "")}
            initial={{ y: "110%", rotate: 6 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 1.1, delay: start + i * 0.09, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

const TICKER = [
  "Branding & Design",
  "Content Creation & Animation",
  "Social Media Management",
  "Videography & Photography",
  "Meta Ads",
  "Website Design & Development",
];

function Ribbon({ className, reverse, dark }: { className: string; reverse?: boolean; dark?: boolean }) {
  return (
    <div
      aria-hidden
      className={`absolute left-[-6%] w-[112%] ${className} ${
        dark ? "border-y border-[#b8ff2e]/40 bg-black text-[#b8ff2e] [text-shadow:0_0_10px_rgba(184,255,46,0.35)]" : "chrome-bg text-black"
      }`}
    >
      <VelocityMarquee baseVelocity={reverse ? -2 : 2.6} innerClassName="py-2.5 md:py-3">
        {TICKER.map((t) => (
          <span
            key={t}
            className="flex shrink-0 items-center font-display text-xs font-black uppercase tracking-[0.18em] md:text-sm"
          >
            <span className="px-6 md:px-8">{t}</span>
            <span aria-hidden className="text-[0.9em]">✦</span>
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  // The hero is only a little taller than the screen: one short pinned beat, then straight on to the next section.
  const { scrollYProgress: p } = useJsScroll({ target: sectionRef, offset: ["start start", "end end"] });

  const headScale = useTransform(p, [0, 0.6], [1, 0.72]);
  const headOpacity = useTransform(p, [0.05, 0.5], [1, 0]);
  const headBlur = useTransform(p, [0.05, 0.5], ["blur(0px)", "blur(14px)"]);
  const line1X = useTransform(p, [0, 0.6], ["0vw", "-38vw"]);
  const line2X = useTransform(p, [0, 0.6], ["0vw", "38vw"]);
  const subY = useTransform(p, [0, 0.45], ["0vh", "18vh"]);
  const ribbonsY = useTransform(p, [0, 0.4], ["0%", "160%"]);
  const hintOpacity = useTransform(p, [0, 0.08], [1, 0]);

  // The dimmed Shaffedits logo behind the hero: as you scroll it brightens and rises,
  // then carries on up the screen with the hero as the next section arrives.
  const logoOpacity = useTransform(p, [0, 0.6], [0.07, 0.35]);
  const logoY = useTransform(p, [0, 1], ["0vh", "-14vh"]);
  const logoScale = useTransform(p, [0, 1], [1, 1.12]);

  // Cursor spotlight + card parallax: written straight to CSS variables (no re-renders).
  useEffect(() => {
    const stage = stageRef.current;
    const spot = spotRef.current;
    if (!stage || !spot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Phones/tablets have no cursor to follow — skip the loop entirely.
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    let tx = stage.clientWidth / 2;
    let ty = stage.clientHeight * 0.45;
    let x = tx;
    let y = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      // Wake the easing loop; it puts itself to sleep once it catches up,
      // so nothing runs (or repaints) while the cursor is still or off the hero.
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) {
        x = tx;
        y = ty;
        raf = 0;
      }
      const w = stage.clientWidth || 1;
      const h = stage.clientHeight || 1;
      spot.style.setProperty("--mx", `${x}px`);
      spot.style.setProperty("--my", `${y}px`);
      stage.style.setProperty("--px", (-(x / w - 0.5) * 2).toFixed(3));
      stage.style.setProperty("--py", (-(y / h - 0.5) * 2).toFixed(3));
      if (raf) raf = requestAnimationFrame(loop);
    };
    stage.addEventListener("pointermove", onMove);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} id="top" className="relative h-[150vh] bg-black text-white">
      <div
        ref={stageRef}
        className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-6 pb-40 pt-36"
      >
        {/* Lime horizon glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(172,236,0,0.22), transparent 70%)" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[110px]"
          animate={{ x: ["-18%", "14%", "-6%", "-18%"], y: ["-10%", "8%", "14%", "-10%"], scale: [1, 1.15, 0.95, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Soft cursor spotlight */}
        <div ref={spotRef} aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(440px circle at var(--mx, 50%) var(--my, 45%), rgba(172,236,0,0.13), transparent 70%)",
            }}
          />
        </div>

        {/* Dimmed Shaffedits logo in the background */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ y: logoY, scale: logoScale, opacity: logoOpacity }}
        >
          <motion.img
            src={logoWhite}
            alt=""
            draggable={false}
            decoding="async"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, delay: 1, ease: EASE }}
            className="w-[92vw] max-w-[1500px] select-none md:w-[78vw]"
          />
        </motion.div>

        {CARDS.map((c, i) => (
          <FloatingCard key={c.src} card={c} index={i} progress={p} />
        ))}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]"
        />

        <motion.div
          style={{ scale: headScale, opacity: headOpacity, filter: headBlur }}
          className="relative z-10 mx-auto max-w-6xl text-center"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.9em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.4, delay: 1.3, ease: EASE }}
            className="mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase text-white/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="chrome-bg absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" />
              <span className="chrome-bg relative inline-flex h-2 w-2 rounded-full" />
            </span>
            Creative Agency
          </motion.p>

          <h1 className="mx-auto max-w-5xl font-display text-[clamp(2.75rem,8vw,7.5rem)] font-black leading-[0.95] tracking-tight">
            <MaskedLine words={["We", "build", "brands"]} start={1.5} x={line1X} />
            <MaskedLine words={["people", "remember"]} start={1.85} accentIndex={0} x={line2X} />
          </h1>

          <motion.div style={{ y: subY }}>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.3 }}
              className="mx-auto mt-8 max-w-2xl text-base text-white/75 md:text-lg"
            >
              Creative strategy. Exceptional storytelling. Content that performs.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.5 }}
              className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row"
            >
              <GlowButton as="a" href="#contact" tone="onDark">
                Book a Call
              </GlowButton>
              <ArrowButton as="a" href="#work" tone="onDark" label="View Our Work" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-36 left-1/2 z-10 -translate-x-1/2 text-center md:bottom-40"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.1 }}
            className="flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/50"
          >
            scroll
            <motion.span
              className="neon-line block h-8 w-px origin-top"
              animate={{ scaleY: [0, 1, 0], y: [0, 0, 16] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Two crossing ribbons that react to scroll speed */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 2.9, ease: EASE }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-32"
        >
          <motion.div style={{ y: ribbonsY }} className="absolute inset-0">
            <Ribbon dark reverse className="bottom-9 rotate-[2.2deg] md:bottom-10" />
            <Ribbon className="bottom-5 -rotate-[2deg] md:bottom-6" />
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
