import { useEffect, useRef, type CSSProperties } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { GlowButton } from "../ui/GlowButton";
import { ArrowButton } from "../ui/ArrowButton";

const EASE = [0.16, 1, 0.3, 1] as const;
const LIME = "#ACEC00";
const base = import.meta.env.BASE_URL;

type Card = {
  src: string;
  /** position inside the hero */
  pos: string;
  /** width, responsive */
  w: string;
  rot: number;
  /** parallax depth: higher = moves more with cursor and scroll */
  depth: number;
  /** far-away cards are smaller, blurred and dimmer */
  far?: boolean;
  /** hidden on small screens */
  desktopOnly?: boolean;
};

const CARDS: Card[] = [
  { src: "a01", pos: "left-[-2%] top-[9%]", w: "w-[26vw] md:w-[11vw]", rot: -7, depth: 34 },
  { src: "a05", pos: "left-[2%] top-[39%]", w: "w-[24vw] md:w-[10vw]", rot: 4, depth: 52, desktopOnly: true },
  { src: "a06", pos: "left-[7%] top-[66%]", w: "w-[26vw] md:w-[11vw]", rot: -4, depth: 40 },
  { src: "a02", pos: "right-[-2%] top-[10%]", w: "w-[26vw] md:w-[11vw]", rot: 6, depth: 36 },
  { src: "a08", pos: "right-[3%] top-[40%]", w: "w-[24vw] md:w-[10vw]", rot: -5, depth: 54, desktopOnly: true },
  { src: "a07", pos: "right-[8%] top-[66%]", w: "w-[26vw] md:w-[11vw]", rot: 5, depth: 42 },
  { src: "a03", pos: "left-[16%] top-[8%]", w: "md:w-[7vw]", rot: 8, depth: 14, far: true, desktopOnly: true },
  { src: "a10", pos: "left-[22%] top-[80%]", w: "md:w-[8vw]", rot: -6, depth: 16, far: true, desktopOnly: true },
  { src: "a04", pos: "right-[16%] top-[7%]", w: "md:w-[8vw]", rot: -7, depth: 14, far: true, desktopOnly: true },
  { src: "a09", pos: "right-[22%] top-[80%]", w: "md:w-[7vw]", rot: 6, depth: 16, far: true, desktopOnly: true },
];

function FloatingCard({
  card,
  index,
  progress,
}: {
  card: Card;
  index: number;
  progress: MotionValue<number>;
}) {
  // scroll parallax: cards drift upward at different speeds as you leave the hero
  const y = useTransform(progress, [0, 1], [0, -card.depth * 4]);
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${card.pos} ${card.w} ${
        card.desktopOnly ? "hidden md:block" : ""
      } ${card.far ? "" : "opacity-45 md:opacity-100"}`}
      style={{
        // cursor parallax (variables are written on the section by the effect below)
        transform: `translate3d(calc(var(--px, 0) * ${card.depth}px), calc(var(--py, 0) * ${card.depth}px), 0) rotate(${card.rot}deg)`,
      }}
    >
      <motion.div style={{ y }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 60 }}
          animate={{ opacity: card.far ? 0.5 : 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.3 + index * 0.1, ease: EASE }}
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
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 6 + (index % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.4,
            }}
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
}: {
  words: string[];
  start: number;
  accentIndex?: number;
}) {
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={w + i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className={"inline-block " + (i === accentIndex ? "italic font-light" : "")}
            style={i === accentIndex ? { color: LIME } : undefined}
            initial={{ y: "110%", rotate: 4 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{ duration: 1.1, delay: start + i * 0.09, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
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

function Ribbon({
  className,
  reverse,
  dark,
}: {
  className: string;
  reverse?: boolean;
  dark?: boolean;
}) {
  const row = [...TICKER, ...TICKER];
  return (
    <div
      aria-hidden
      className={`absolute left-[-6%] w-[112%] overflow-hidden ${className} ${
        dark ? "border-y border-[#ACEC00]/60 bg-black text-[#ACEC00]" : "bg-[#ACEC00] text-black"
      }`}
    >
      <div
        className="animate-marquee flex w-max items-center py-2.5 md:py-3"
        style={
          {
            "--marquee-duration": reverse ? "46s" : "38s",
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {[0, 1].map((rep) =>
          row.map((t, i) => (
            <span
              key={rep + "-" + i}
              className="flex shrink-0 items-center font-display text-xs font-black uppercase tracking-[0.18em] md:text-sm"
            >
              <span className="px-6 md:px-8">{t}</span>
              <span aria-hidden className="text-[0.9em]">✦</span>
            </span>
          )),
        )}
      </div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Cursor spotlight + card parallax: written straight to CSS variables (no re-renders).
  useEffect(() => {
    const section = sectionRef.current;
    const spot = spotRef.current;
    if (!section || !spot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r0 = section.getBoundingClientRect();
    let tx = r0.width / 2;
    let ty = r0.height * 0.45;
    let x = tx;
    let y = ty;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const loop = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      const w = section.clientWidth || 1;
      const h = section.clientHeight || 1;
      spot.style.setProperty("--mx", `${x}px`);
      spot.style.setProperty("--my", `${y}px`);
      section.style.setProperty("--px", (-(x / w - 0.5) * 2).toFixed(3));
      section.style.setProperty("--py", (-(y / h - 0.5) * 2).toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    section.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      section.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-black px-6 pb-44 pt-40 text-white md:pb-48"
    >
      {/* Lime horizon glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(172,236,0,0.22), transparent 70%)",
        }}
      />

      {/* Slow drifting light */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-[110px]"
        animate={{ x: ["-18%", "14%", "-6%", "-18%"], y: ["-10%", "8%", "14%", "-10%"], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cursor spotlight + a fine grid that only shows under it */}
      <div ref={spotRef} aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(440px circle at var(--mx, 50%) var(--my, 45%), rgba(172,236,0,0.13), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(172,236,0,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(172,236,0,0.16) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            WebkitMaskImage:
              "radial-gradient(380px circle at var(--mx, 50%) var(--my, 45%), #000 0%, transparent 75%)",
            maskImage:
              "radial-gradient(380px circle at var(--mx, 50%) var(--my, 45%), #000 0%, transparent 75%)",
          }}
        />
      </div>

      {/* Floating portfolio work */}
      {CARDS.map((c, i) => (
        <FloatingCard key={c.src} card={c} index={i} progress={scrollYProgress} />
      ))}

      {/* Subtle grain / vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.9em" }}
          animate={{ opacity: 1, letterSpacing: "0.4em" }}
          transition={{ duration: 1.4, delay: 1.3, ease: EASE }}
          className="mb-6 inline-flex items-center gap-3 text-xs font-medium uppercase text-white/70"
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: LIME }}
            />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: LIME }} />
          </span>
          Creative Agency
        </motion.p>

        <h1 className="mx-auto max-w-5xl font-display text-[clamp(2.75rem,8vw,7.5rem)] font-black leading-[0.95] tracking-tight">
          <MaskedLine words={["We", "build", "brands"]} start={1.5} />
          <MaskedLine words={["people", "remember"]} start={1.85} accentIndex={0} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.3 }}
          className="mx-auto mt-8 max-w-2xl text-base text-white/75 md:text-lg"
        >
          Creative strategy. Exceptional storytelling. Content that performs.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.45 }}
          className="mx-auto mt-6 max-w-3xl text-sm leading-relaxed text-white/60 md:text-base"
        >
          We help businesses bring their ideas to life through creativity, technology,
          and innovation. Whether it's branding, design, web development, content creation,
          digital solutions, or business growth strategies, we craft experiences that
          leave a lasting impression. Every project is built with one purpose — helping
          your brand stand out with confidence.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.65 }}
          className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row"
        >
          <GlowButton as="a" href="#contact" tone="onDark">Book a Call</GlowButton>
          <ArrowButton as="a" href="#work" tone="onDark" label="View Our Work" />
        </motion.div>
      </div>

      {/* Two crossing ribbons of the agency's services */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 2.9, ease: EASE }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 md:h-32"
      >
        <Ribbon dark reverse className="bottom-9 rotate-[2.2deg] md:bottom-10" />
        <Ribbon className="bottom-5 -rotate-[2deg] md:bottom-6" />
      </motion.div>
    </section>
  );
}
