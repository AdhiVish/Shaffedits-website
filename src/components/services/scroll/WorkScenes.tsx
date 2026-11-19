import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { useJsScroll } from "@/components/wild/useJsScroll";
import type { ServiceContent } from "@/data/serviceContent";
import type { WorkPiece } from "@/data/serviceWork";
import { services } from "@/data/services";

export const EASE = [0.16, 1, 0.3, 1] as const;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
/** Small deterministic "random" so every page scatters the same way on every visit. */
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const splitAlt = (alt: string) => {
  const [client, ...rest] = alt.split(" · ");
  return { client, piece: rest.join(" · ") || "Selected work" };
};

export function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

/** Section label used on every scene: "The work / 01". */
export function Kicker({ children, dark = true }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.4em] md:text-xs ${dark ? "text-white/55" : "text-black/50"}`}>
      <span className="neon-line inline-block h-px w-8" />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* 1. HERO — the headline scatters while the work flies out at you      */
/* ------------------------------------------------------------------ */

const THUMB_SPOTS = [
  { left: "6%", top: "18%", w: "13vw", r: -9 },
  { left: "80%", top: "14%", w: "12vw", r: 8 },
  { left: "3%", top: "60%", w: "11vw", r: 6 },
  { left: "84%", top: "58%", w: "13vw", r: -7 },
  { left: "22%", top: "78%", w: "9vw", r: -4 },
  { left: "66%", top: "80%", w: "9vw", r: 5 },
];

function HeroThumb({ piece, i, p }: { piece: WorkPiece; i: number; p: MotionValue<number> }) {
  const s = THUMB_SPOTS[i];
  const dx = (parseFloat(s.left) - 50) * 1.4;
  const dy = (parseFloat(s.top) - 50) * 1.6;
  const x = useTransform(p, [0, 0.85], ["0vw", `${dx}vw`]);
  const y = useTransform(p, [0, 0.85], ["0vh", `${dy}vh`]);
  const scale = useTransform(p, [0, 0.85], [1, 2.8]);
  const rotate = useTransform(p, [0, 0.85], [s.r, s.r * 3]);
  const opacity = useTransform(p, [0.5, 0.85], [1, 0]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute hidden md:block"
      style={{ left: s.left, top: s.top, width: s.w, x, y, scale, rotate, opacity }}
    >
      <motion.img
        src={piece.src}
        alt=""
        draggable={false}
        initial={{ opacity: 0, scale: 0.3, rotate: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.5 + i * 0.09 }}
        className="block aspect-[4/5] w-full rounded-xl object-cover shadow-[0_40px_70px_-20px_rgba(0,0,0,0.9)] ring-1 ring-[#b8ff2e]/30"
      />
    </motion.div>
  );
}

function ScatterWord({ word, i, p, accent }: { word: string; i: number; p: MotionValue<number>; accent: boolean }) {
  const dx = (rnd(i) - 0.5) * 120;
  const dy = (rnd(i, 2) - 0.5) * 90;
  const x = useTransform(p, [0.04, 0.8], ["0vw", `${dx}vw`]);
  const y = useTransform(p, [0.04, 0.8], ["0vh", `${dy}vh`]);
  const rotate = useTransform(p, [0.04, 0.8], [0, (rnd(i, 3) - 0.5) * 120]);
  const opacity = useTransform(p, [0.35, 0.8], [1, 0]);
  const filter = useTransform(p, [0.1, 0.8], ["blur(0px)", "blur(12px)"]);
  return (
    <motion.span className="inline-block" style={{ x, y, rotate, opacity, filter }}>
      <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
        <motion.span
          className={"inline-block " + (accent ? "chrome-text pr-[0.06em] font-light italic" : "")}
          initial={{ y: "110%", rotate: 8 }}
          animate={{ y: "0%", rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 + i * 0.07, ease: EASE }}
        >
          {word}
        </motion.span>
      </span>
      &nbsp;
    </motion.span>
  );
}

export function ScrollHero({ content, work }: { content: ServiceContent; work: WorkPiece[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const plain = content.headlinePlain.split(" ");
  const accent = content.headlineAccent.split(" ");
  const supportY = useTransform(p, [0, 0.4], ["0vh", "12vh"]);
  const supportO = useTransform(p, [0, 0.3], [1, 0]);
  const numY = useTransform(p, [0, 1], ["0%", "-40%"]);
  const numO = useTransform(p, [0, 0.6], [1, 0]);
  const cue = useTransform(p, [0, 0.08], [1, 0]);
  const glow = useTransform(p, [0, 0.6], [0.6, 1]);

  return (
    <section ref={ref} className="relative h-[165vh] bg-black text-white">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-5 pt-28 md:px-12 md:pt-32">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ opacity: glow, background: `radial-gradient(60% 55% at 50% 45%, ${content.accentSoft}, transparent 70%)` }}
        />
        {/* giant outlined index number drifting behind */}
        <motion.span
          aria-hidden
          style={{ y: numY, opacity: numO }}
          className="text-outline pointer-events-none absolute -right-[4vw] top-[8vh] font-display text-[42vw] font-black leading-none text-white/[0.06]"
        >
          {String(content.order).padStart(2, "0")}
        </motion.span>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative z-10 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] md:text-xs"
        >
          <Link to="/#services" className="group inline-flex items-center gap-2 text-white/55 transition-colors hover:text-white">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" /> All services
          </Link>
          <span style={{ color: content.accent }}>
            {String(content.order).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
            <span className="hidden text-white/35 sm:inline"> — {content.eyebrow}</span>
          </span>
        </motion.div>

        {work.slice(0, 6).map((w, i) => (
          <HeroThumb key={i} piece={w} i={i} p={p} />
        ))}

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="max-w-6xl font-display text-[clamp(2.6rem,8.5vw,8.5rem)] font-black leading-[0.92] tracking-tight">
            {plain.map((w, i) => (
              <ScatterWord key={`p${i}`} word={w} i={i} p={p} accent={false} />
            ))}
            <br className="hidden md:block" />
            {accent.map((w, i) => (
              <ScatterWord key={`a${i}`} word={w} i={i + plain.length} p={p} accent />
            ))}
          </h1>
          <motion.div style={{ y: supportY, opacity: supportO }} className="mt-8 flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="max-w-xl text-sm leading-relaxed text-white/65 md:text-lg"
            >
              {content.heroSupport}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.05 }}
              className="mt-8"
            >
              <GlowButton as="a" href="/#contact" tone="onDark">
                {content.heroCta}
              </GlowButton>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: cue }}
          className="relative z-10 mb-6 flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-white/50"
        >
          scroll for the work
          <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <ArrowDown className="size-4 text-[#b8ff2e]" />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2. THE WORK — a 3D spiral of highlights you scroll through           */
/* ------------------------------------------------------------------ */

const STEP = 38; // degrees between cards around the spiral

function HelixCard({ piece, i, pos, dy, r, w }: { piece: WorkPiece; i: number; pos: MotionValue<number>; dy: number; r: number; w: number }) {
  const d = useTransform(pos, (v) => Math.abs(i - v));
  const opacity = useTransform(d, [0, 1.2, 3.2], [1, 0.75, 0]);
  const filter = useTransform(d, [0, 1.5], ["brightness(1) saturate(1)", "brightness(0.45) saturate(0.4)"]);
  return (
    <motion.figure
      className="absolute left-1/2 top-1/2 m-0"
      style={{
        width: w,
        marginLeft: -w / 2,
        marginTop: (-w * 1.25) / 2,
        transform: `rotateY(${i * STEP}deg) translateZ(${r}px) translateY(${-i * dy}px)`,
        backfaceVisibility: "hidden",
        opacity,
        filter,
      }}
    >
      <img
        src={piece.src}
        alt={piece.alt}
        loading={i < 3 ? "eager" : "lazy"}
        draggable={false}
        className="block aspect-[4/5] w-full rounded-2xl bg-neutral-900 object-cover shadow-[0_50px_90px_-30px_rgba(0,0,0,1)] ring-1 ring-white/10"
      />
    </motion.figure>
  );
}

export function WorkHelix({ work, title }: { work: WorkPiece[]; title: [string, string] }) {
  const items = work.slice(0, Math.min(work.length, 12));
  const n = items.length;
  const ref = useRef<HTMLElement>(null);
  const phone = useMedia("(max-width: 767px)");
  const w = phone ? Math.min(window.innerWidth * 0.6, 260) : Math.min(window.innerWidth * 0.24, 330);
  const r = w * (phone ? 1.05 : 1.45);
  const dy = w * 0.32;
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const pos = useTransform(p, [0.06, 0.94], [0, n - 1], { clamp: true });
  const stage = useTransform(pos, (v) => `translateZ(${-r}px) translateY(${v * dy}px) rotateY(${-v * STEP}deg)`);
  const [cur, setCur] = useState(0);
  useMotionValueEvent(pos, "change", (v) => setCur(Math.round(v)));
  const bar = useTransform(p, [0.06, 0.94], [0, 1]);
  const ghostX = useTransform(p, [0, 1], ["10%", "-60%"]);
  const { client, piece } = splitAlt(items[cur]?.alt ?? "");

  return (
    <section id="work" ref={ref} className="relative bg-black text-white" style={{ height: `${110 + n * 32}vh` }}>
      <div className="sticky top-0 h-svh overflow-hidden" style={{ perspective: phone ? 900 : 1300 }}>
        {/* client name, huge and outlined, sliding behind the spiral */}
        <motion.div
          aria-hidden
          style={{ x: ghostX }}
          className="text-outline pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[22vw] font-black uppercase leading-none text-white/[0.07]"
        >
          {client} {client}
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(45% 55% at 50% 55%, rgba(184,255,46,0.12), transparent 70%)" }}
        />

        <div className="absolute left-5 top-24 z-10 md:left-12 md:top-28">
          <Kicker>The work / 01</Kicker>
          <h2 className="max-w-md font-display text-[clamp(1.6rem,3.4vw,3rem)] font-black leading-[0.95] tracking-tight">
            {title[0]} <span className="chrome-text pr-[0.06em] font-light italic">{title[1]}</span>
          </h2>
        </div>

        <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: stage }}>
          {items.map((it, i) => (
            <HelixCard key={i} piece={it} i={i} pos={pos} dy={dy} r={r} w={w} />
          ))}
        </motion.div>

        {/* caption for the card at the front */}
        <div className="absolute inset-x-5 bottom-6 z-10 flex items-end justify-between gap-6 md:inset-x-12 md:bottom-10">
          <div className="min-w-0">
            <div className="font-display text-4xl font-black tabular-nums tracking-tight md:text-6xl">
              <span className="chrome-text">{String(cur + 1).padStart(2, "0")}</span>
              <span className="text-white/25">/{String(n).padStart(2, "0")}</span>
            </div>
            <div className="mt-2 h-12 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={cur}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className="truncate font-display text-lg font-bold md:text-2xl">{client}</p>
                  <p className="truncate text-[11px] uppercase tracking-[0.25em] text-white/50">{piece}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="mb-2 hidden w-56 md:block">
            <div className="h-px w-full bg-white/15">
              <motion.div className="neon-line h-full origin-left" style={{ scaleX: bar }} />
            </div>
            <p className="mt-2 text-right text-[10px] uppercase tracking-[0.3em] text-white/40">keep scrolling to turn</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3. THE FULL COLLECTION — a tilted wall of every piece                */
/* ------------------------------------------------------------------ */

function WallColumn({ pieces, i, p, offset }: { pieces: WorkPiece[]; i: number; p: MotionValue<number>; offset: number }) {
  // neighbouring columns run in opposite directions
  const up = i % 2 === 0;
  const y = useTransform(p, [0, 1], up ? ["0%", `-${offset}%`] : [`-${offset}%`, "0%"]);
  return (
    <motion.div className="flex flex-1 flex-col gap-3 md:gap-4" style={{ y }}>
      {pieces.map((w, k) => (
        <div key={k} className="group relative overflow-hidden rounded-xl bg-neutral-900 ring-1 ring-white/10 md:rounded-2xl">
          <img
            src={w.src}
            alt={w.alt}
            loading="lazy"
            draggable={false}
            className="block aspect-[4/5] w-full object-cover grayscale-[60%] transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 to-transparent p-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-transform duration-500 group-hover:translate-y-0">
            {w.alt}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

export function WorkWall({ work }: { work: WorkPiece[] }) {
  const ref = useRef<HTMLElement>(null);
  const phone = useMedia("(max-width: 767px)");
  const cols = phone ? 3 : 5;
  const perCol = phone ? 12 : 9;
  // deal every piece round-robin into the columns, repeating if needed so the wall is never empty
  const columns: WorkPiece[][] = Array.from({ length: cols }, () => []);
  const total = Math.max(work.length, cols * perCol);
  for (let k = 0; k < total; k++) columns[k % cols].push(work[k % work.length]);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(p, [0.1, 0.5], [32, 6]);
  const rotateZ = useTransform(p, [0.1, 0.5], [-10, -4]);
  const scale = useTransform(p, [0.1, 0.5], [1.35, 1.08]);
  const headScale = useTransform(p, [0.15, 0.45, 0.85], [0.6, 1, 1.15]);
  const headOpacity = useTransform(p, [0.15, 0.35, 0.8, 0.95], [0, 1, 1, 0]);

  return (
    <section ref={ref} className="relative h-[200vh] bg-black text-white">
      <div className="sticky top-0 h-svh overflow-hidden" style={{ perspective: 1400 }}>
        <motion.div
          className="absolute -inset-x-[12%] -inset-y-[30%] flex gap-3 md:gap-4"
          style={{ rotateX, rotateZ, scale, transformOrigin: "50% 40%" }}
        >
          {columns.map((c, i) => (
            <WallColumn key={i} pieces={c} i={i} p={p} offset={phone ? 45 : 40} />
          ))}
        </motion.div>
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25),rgba(0,0,0,0.9)_75%)]" />
        <motion.div
          style={{ scale: headScale, opacity: headOpacity }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/70 md:text-xs">The full collection</p>
          <p className="font-display text-[clamp(4rem,16vw,14rem)] font-black leading-[0.8] tracking-tighter">
            <span className="chrome-text">{work.length}</span>
          </p>
          <p className="mt-2 font-display text-xl font-light italic text-white/80 md:text-3xl">pieces of real client work</p>
        </motion.div>
      </div>
    </section>
  );
}
