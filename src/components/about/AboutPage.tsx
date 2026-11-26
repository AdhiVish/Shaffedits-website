import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useJsScroll } from "@/components/wild/useJsScroll";
import { useIsPhone } from "@/lib/usePhone";
import { GlowButton } from "@/components/ui/GlowButton";
import { team } from "@/components/sections/Team";

/**
 * The About page: a quiet, mostly scroll-driven read.
 *  1. intro + manifesto that lights up word by word
 *  2. "What we do": the services drift sideways as you scroll (hover one = its photo follows the cursor)
 *  3. "How we work": a line draws down through the four steps
 *  4. numbers that count up
 *  5. "The people": hover a name and their real signature writes in
 *  6. a small closing line
 */

const base = import.meta.env.BASE_URL;
const EASE = [0.16, 1, 0.3, 1] as const;
const WHATSAPP_URL = `https://wa.me/918807705502?text=${encodeURIComponent("Hi Shaffedits! I have an idea")}`;

/* ------------------------------------------------------------------ 1. manifesto */

const TEXT =
  "At Shaffedits, creativity is communication. We're a multidisciplinary creative agency bringing [img:a02] branding, content, design, [img:t03] digital strategy, filmmaking and web experiences [img:a07] under one creative roof. Strategy behind every pixel.";
const LOUD = new Set(["communication.", "pixel."]);
const tokens = TEXT.split(" ").map((t) => {
  const m = t.match(/^\[img:(\w+)\]$/);
  return m ? { img: m[1] } : { text: t };
});

function Word({ text, range, p }: { text: string; range: [number, number]; p: MotionValue<number> }) {
  const opacity = useTransform(p, range, [0.15, 1]);
  return (
    <motion.span
      style={{ opacity }}
      className={"mr-[0.25em] inline-block " + (LOUD.has(text) ? "italic font-light text-[#5C72FF]" : "")}
    >
      {text}
    </motion.span>
  );
}

function Pic({ src, range, p }: { src: string; range: [number, number]; p: MotionValue<number> }) {
  const width = useTransform(p, range, ["0em", "1.8em"]);
  return (
    <motion.span
      style={{ width }}
      className="mr-[0.25em] inline-block h-[0.8em] overflow-hidden rounded-full align-[-0.06em]"
    >
      <img src={`${base}showcase/${src}.webp`} alt="" className="h-full w-full object-cover" draggable={false} />
    </motion.span>
  );
}

function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start 0.8", "end 0.45"] });
  const n = tokens.length;
  return (
    <section className="mx-auto max-w-6xl px-6 pb-28 pt-36 md:pb-44 md:pt-44">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
      >
        <Link
          to="/"
          aria-label="Back to the home page"
          className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-white/70 hover:text-white"
        >
          <span className="grid size-10 place-items-center rounded-full border border-white/20 transition-all duration-300 group-hover:-translate-x-1 group-hover:border-[#2641FF] group-hover:bg-[#2641FF] group-hover:text-[#AEFF00]">
            <ArrowLeft className="size-4" />
          </span>
          Back
        </Link>
      </motion.div>

      <p className="mb-6 mt-16 text-xs font-bold uppercase tracking-[0.4em] text-white/50 md:mt-24">About</p>
      <h1 className="font-display text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.92] tracking-tight">
        {["Hello, we're", "Shaffedits."].map((line, i) => (
          <span key={line} className="block overflow-hidden pb-[0.08em]">
            <motion.span
              className={"block " + (i === 1 ? "italic font-light text-[#5C72FF]" : "")}
              initial={{ y: "105%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.65 + i * 0.12, ease: EASE }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </h1>

      <div
        ref={ref}
        className="mt-24 max-w-5xl font-display text-[clamp(1.6rem,3.6vw,3.3rem)] font-medium leading-[1.15] tracking-tight md:mt-36"
      >
        {tokens.map((t, i) => {
          const s = i / n;
          const range: [number, number] = [s, Math.min(1, s + 2 / n)];
          return "img" in t ? (
            <Pic key={i} src={t.img!} range={range} p={p} />
          ) : (
            <Word key={i} text={t.text!} range={range} p={p} />
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 2. what we do */

const SERVICES = [
  { name: "Branding", img: "card-01" },
  { name: "Content & Animation", img: "card-02" },
  { name: "Social Media", img: "card-03" },
  { name: "Meta Ads", img: "card-05" },
  { name: "Websites", img: "card-04" },
  { name: "Technical Graphics", img: "card-06" },
];

function Services() {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useRef(0);
  const phone = useIsPhone();
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(p, (v) => -v * dist.current);
  const bar = useTransform(p, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const measure = () => {
      if (track.current) dist.current = Math.max(0, track.current.scrollWidth - window.innerWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    return () => ro.disconnect();
  }, []);

  // the hovered service's photo trails the cursor (desktop only)
  const [hover, setHover] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 260, damping: 28 });
  const sy = useSpring(my, { stiffness: 260, damping: 28 });

  return (
    <section
      ref={ref}
      className="relative"
      style={{ height: phone ? "260svh" : "320svh" }}
      onPointerMove={(e) => {
        mx.set(e.clientX);
        my.set(e.clientY);
      }}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-6xl items-end justify-between px-6 md:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">What we do</p>
          <div className="h-px w-24 bg-white/15 md:w-40">
            <motion.div style={{ width: bar }} className="h-full bg-[#2641FF]" />
          </div>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max items-baseline gap-[8vw] px-6 md:px-[8vw]">
          {SERVICES.map((s, i) => (
            <div
              key={s.name}
              onPointerEnter={() => !phone && setHover(i)}
              onPointerLeave={() => setHover((h) => (h === i ? null : h))}
              className="group flex items-start gap-3 md:gap-5"
            >
              <span className="mt-[0.6em] font-mono text-xs text-[#5C72FF] md:text-sm">0{i + 1}</span>
              <span
                className="font-band whitespace-nowrap text-[clamp(3rem,10vw,9rem)] uppercase leading-none tracking-tight text-transparent transition-colors duration-500 [-webkit-text-stroke:1px_rgba(255,255,255,0.4)] group-hover:text-white"
              >
                {s.name}
              </span>
            </div>
          ))}
        </motion.div>
        <p className="mx-auto mt-10 w-full max-w-6xl px-6 text-sm text-white/40 md:mt-16">
          {phone ? "Keep scrolling" : "Hover a service for a peek"}
        </p>
      </div>

      {!phone && createPortal(
        <motion.div
          aria-hidden
          style={{ x: sx, y: sy }}
          className="pointer-events-none fixed left-0 top-0 z-40"
        >
          <AnimatePresence>
            {hover !== null && (
              <motion.img
                key={hover}
                src={`${base}services/${SERVICES[hover].img}.webp`}
                alt=""
                initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute -left-28 -top-36 h-72 w-56 max-w-none rounded-xl object-cover shadow-2xl"
              />
            )}
          </AnimatePresence>
        </motion.div>,
        document.body,
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ 3. how we work */

const STEPS = [
  { word: "Listen", line: "We start with your business, your audience and your ambitions." },
  { word: "Plan", line: "Strategy first, so every pixel has a reason to be there." },
  { word: "Make", line: "Brand, film, content and code, made under one roof." },
  { word: "Launch", line: "Then we stay on as an extension of your team, and keep it growing." },
];

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const scaleY = useTransform(p, [0, 1], [0, 1]);
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-6 py-28 md:grid-cols-12 md:py-44">
      <div className="md:col-span-4">
        <div className="md:sticky md:top-36">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.4em] text-white/50">How we work</p>
          <p className="max-w-xs text-white/60">
            Launching, refreshing or scaling, it always runs the same four steps.
          </p>
        </div>
      </div>
      <div ref={ref} className="relative md:col-span-8">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-white/10" />
        <motion.div style={{ scaleY }} className="absolute bottom-0 left-0 top-0 w-px origin-top bg-[#2641FF]" />
        {STEPS.map((s, i) => (
          <motion.div
            key={s.word}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -20% 0px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="relative pb-16 pl-8 last:pb-0 md:pb-24 md:pl-14"
          >
            <span className="absolute -left-[4px] top-3 size-[9px] rounded-full bg-[#2641FF] md:top-5" />
            <span className="font-mono text-xs text-white/40">0{i + 1}</span>
            <h3 className="mt-1 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-none tracking-tight">
              {s.word}
            </h3>
            <p className="mt-4 max-w-md text-white/60 md:text-lg">{s.line}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 4. numbers */

const NUMBERS = [
  { to: 8, suffix: "+", label: "years in the game" },
  { to: 40, suffix: "+", label: "brands trusted us" },
  { to: 1500, suffix: "+", label: "projects delivered" },
  { to: 15, suffix: "M+", label: "views generated" },
];

function Count({ p, to, suffix, label }: { p: MotionValue<number>; to: number; suffix: string; label: string }) {
  const shown = useTransform(p, (v) => Math.round(v * to).toLocaleString("en-US") + suffix);
  return (
    <div className="border-t border-white/15 pt-4">
      <motion.span className="block font-display text-[clamp(2.4rem,5vw,4.5rem)] font-bold leading-none tracking-tight">
        {shown}
      </motion.span>
      <span className="mt-2 block text-sm text-white/50">{label}</span>
    </div>
  );
}

function Numbers() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useJsScroll({ target: ref, offset: ["start 0.95", "start 0.45"] });
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div ref={ref} className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10">
        {NUMBERS.map((n) => (
          <Count key={n.label} p={scrollYProgress} {...n} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ 5. the people */

function People() {
  const phone = useIsPhone();
  const [open, setOpen] = useState<number | null>(null);
  const people = team.filter((m) => m.name);
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 md:py-44">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4 md:mb-16">
        <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">The people</p>
        <p className="text-sm text-white/40">{phone ? "Tap a name" : "Hover a name"}, they signed it.</p>
      </div>
      <ul>
        {people.map((m, i) => {
          const on = open === i;
          return (
            <motion.li
              key={m.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
              onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setOpen((o) => (o === i ? null : o))}
              onClick={() => !window.matchMedia("(hover: hover)").matches && setOpen((o) => (o === i ? null : i))}
              className="relative flex cursor-default flex-col items-start gap-2 border-b border-white/10 py-5 md:flex-row md:items-center md:justify-between md:gap-4 md:py-7"
            >
              <span
                className={
                  "font-display text-[clamp(1.8rem,5vw,4rem)] font-bold leading-none tracking-tight transition-all duration-500 " +
                  (on ? "translate-x-3 text-white" : open === null ? "text-white" : "text-white/30")
                }
              >
                {m.name}
              </span>
              <span
                className={
                  "text-[10px] uppercase tracking-[0.2em] transition-colors duration-500 md:shrink-0 md:text-right md:text-sm " +
                  (on ? "text-[#5C72FF]" : "text-white/40")
                }
              >
                {m.role}
              </span>
              {m.signature && (
                <motion.img
                  src={m.signature}
                  alt=""
                  aria-hidden
                  draggable={false}
                  initial={false}
                  animate={on ? { clipPath: "inset(0 0% 0 0)", opacity: 1 } : { clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                  transition={{ duration: on ? 0.9 : 0.3, ease: EASE }}
                  className="pointer-events-none absolute right-0 top-1/2 h-[110%] w-auto max-w-[50%] -translate-y-1/2 object-contain [filter:brightness(0)_invert(1)] md:left-[55%] md:right-auto md:h-[140%] md:max-w-[45%]"
                />
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ 6. close */

function Close() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-36 pt-12 md:pb-48">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
        className="flex flex-col gap-10 border-t border-white/10 pt-16 md:flex-row md:items-end md:justify-between"
      >
        <p className="font-display text-[clamp(2.4rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
          Got something
          <br />
          <span className="italic font-light text-[#5C72FF]">in mind?</span>
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <GlowButton as="a" href="/#contact" tone="lime">
            Let's Build Your Brand
          </GlowButton>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold transition-colors hover:border-[#2641FF] hover:bg-[#2641FF] hover:text-[#AEFF00]"
          >
            <FaWhatsapp className="size-4" /> WhatsApp
          </a>
        </div>
      </motion.div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div id="about" className="relative overflow-x-clip bg-black text-white">
      <Intro />
      <Services />
      <Process />
      <Numbers />
      <People />
      <Close />
    </div>
  );
}
