import { useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Equal, Plus } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { VelocityMarquee } from "@/components/wild/VelocityMarquee";
import { useJsScroll } from "@/components/wild/useJsScroll";
import { serviceContent, type Capability, type ServiceContent } from "@/data/serviceContent";
import { services } from "@/data/services";
import { EASE, Kicker, clamp } from "./WorkScenes";

const THEMES = [
  "chrome-bg text-black",
  "bg-neutral-950 text-white ring-1 ring-white/15",
  "bg-white text-black",
] as const;

/* ------------------------------------------------------------------ */
/* 4. CAPABILITIES — cards slam onto a stack, one per scroll beat        */
/* ------------------------------------------------------------------ */

function StackCard({ cap, i, n, p }: { cap: Capability; i: number; n: number; p: MotionValue<number> }) {
  const Icon = cap.icon;
  const transform = useTransform(p, (v) => {
    const t = Math.min(v * n, n - 1); // how many cards have arrived (the last one is never buried)
    const arrive = i === 0 ? 1 : clamp(t - (i - 1));
    const e = 1 - Math.pow(1 - arrive, 3);
    const depth = Math.max(0, t - i - 0.15); // how buried under newer cards
    const y = (1 - e) * 130;
    const rot = (1 - e) * (i % 2 ? 14 : -14) + depth * (i % 2 ? 1.2 : -1.2);
    return `translateY(calc(${y}% - ${Math.min(depth, 4) * 18}px)) scale(${1 - Math.min(depth, 4) * 0.055}) rotate(${rot}deg)`;
  });
  const filter = useTransform(p, (v) => `brightness(${1 - clamp(Math.min(v * n, n - 1) - i - 0.15, 0, 3) * 0.18})`);
  return (
    <motion.article
      className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)] md:p-9 ${THEMES[i % 3]}`}
      style={{ transform, filter, zIndex: i }}
    >
      <div className="flex items-start justify-between">
        <span className="svc-num font-display text-[clamp(3.5rem,9vw,7rem)] font-black leading-[0.8] tracking-tighter">
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="grid size-12 place-items-center rounded-full border border-current/25">
          <Icon className="size-5" strokeWidth={1.6} />
        </span>
      </div>
      <div>
        <h3 className="font-display text-[clamp(1.6rem,3.4vw,3rem)] font-black leading-[0.95] tracking-tight">{cap.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed opacity-70 md:text-base">{cap.desc}</p>
      </div>
    </motion.article>
  );
}

export function CapabilityStack({ content }: { content: ServiceContent }) {
  const caps = content.capabilities;
  const n = caps.length;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const shown = useTransform(p, (v) => Math.min(n, Math.floor(v * n + 1)));
  const [count, setCount] = useState(1);
  useMotionValueEvent(shown, "change", (v) => setCount(v));

  return (
    <section ref={ref} className="relative bg-black text-white" style={{ height: `${100 + n * 35}vh` }}>
      <div className="sticky top-0 mx-auto grid h-svh max-w-7xl items-center gap-8 px-5 pt-20 md:grid-cols-[0.85fr_1.15fr] md:gap-14 md:px-12">
        <div>
          <Kicker>What we do / 02</Kicker>
          <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] font-black leading-[0.92] tracking-tight">
            {n} things,
            <br />
            <span className="chrome-text pr-[0.06em] font-light italic">done properly.</span>
          </h2>
          <div className="mt-8 hidden items-center gap-4 md:flex">
            {caps.map((c, i) => (
              <span
                key={c.title}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ width: i < count ? 34 : 12, background: i < count ? "#AEFF00" : "rgba(255,255,255,0.18)" }}
              />
            ))}
            <span className="font-display text-sm font-bold tabular-nums text-white/50">
              {String(count).padStart(2, "0")}/{String(n).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="relative mx-auto h-[min(56svh,520px)] w-full max-w-xl">
          {caps.map((c, i) => (
            <StackCard key={c.title} cap={c} i={i} n={n} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 5. PROCESS — a sideways rail; a neon line draws and steps light up    */
/* ------------------------------------------------------------------ */

function RailStep({ step, i, n, p }: { step: { title: string; desc: string }; i: number; n: number; p: MotionValue<number> }) {
  const at = 0.08 + (i / Math.max(1, n - 1)) * 0.78;
  const lit = useTransform(p, [at - 0.06, at], [0, 1], { clamp: true });
  const y = useTransform(lit, [0, 1], [70, 0]);
  const rotate = useTransform(lit, [0, 1], [i % 2 ? 8 : -8, 0]);
  const opacity = useTransform(lit, [0, 1], [0.25, 1]);
  const dot = useTransform(lit, [0, 1], [0.4, 1.4]);
  const glow = useTransform(lit, (v) => `0 0 ${v * 30}px rgba(174,255,0,${v * 0.7})`);
  return (
    <div className="relative flex w-[78vw] shrink-0 flex-col sm:w-[360px]">
      <motion.span
        className="relative z-10 mb-8 block size-4 rounded-full bg-[#AEFF00]"
        style={{ scale: dot, boxShadow: glow }}
      />
      <motion.div style={{ y, rotate, opacity }} className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm">
        <span className="svc-num font-display text-7xl font-black leading-none tracking-tighter text-white">
          {String(i + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-5 font-display text-2xl font-black uppercase tracking-tight">{step.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{step.desc}</p>
      </motion.div>
    </div>
  );
}

export function ProcessRail({ content }: { content: ServiceContent }) {
  const steps = content.process;
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dist = useMotionValue(0);
  const [height, setHeight] = useState("300vh");
  useLayoutEffect(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      const d = Math.max(0, t.scrollWidth - window.innerWidth);
      dist.set(d);
      setHeight(`${d * 0.8 + window.innerHeight * 1.2}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [dist]);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(() => -clamp((p.get() - 0.05) / 0.85) * dist.get());
  const line = useTransform(p, [0.05, 0.9], [0, 1]);

  return (
    <section ref={ref} className="relative bg-black text-white" style={{ height }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="relative flex w-max items-start gap-10 px-5 md:gap-16 md:px-12">
          {/* the rail the steps sit on */}
          <div className="absolute left-0 right-0 top-[calc(50%-1px)] hidden" />
          <div className="flex w-[80vw] shrink-0 flex-col justify-center self-center sm:w-[420px]">
            <Kicker>How we work / 03</Kicker>
            <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] font-black leading-[0.92] tracking-tight">
              From first call
              <br />
              <span className="chrome-text pr-[0.06em] font-light italic">to final file.</span>
            </h2>
            <p className="mt-6 flex items-center gap-3 text-sm text-white/50">
              <ArrowRight className="size-4 text-[#AEFF00]" /> scroll to move along the process
            </p>
          </div>
          <div className="relative flex gap-10 md:gap-16">
            <div className="absolute left-2 right-0 top-[7px] h-[2px] bg-white/10">
              <motion.div className="neon-line h-full origin-left" style={{ scaleX: line }} />
            </div>
            {steps.map((s, i) => (
              <RailStep key={s.title} step={s} i={i} n={steps.length} p={p} />
            ))}
          </div>
          <div className="w-[10vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 6. NUMBERS — counted out by the scroll, over a capability marquee     */
/* ------------------------------------------------------------------ */

function Count({ value, p, range }: { value: string; p: MotionValue<number>; range: [number, number] }) {
  const m = value.match(/^(\d+)(.*)$/);
  const target = m ? parseInt(m[1], 10) : 0;
  const suffix = m ? m[2] : value;
  const v = useTransform(p, range, [0, target], { clamp: true });
  const [n, setN] = useState(0);
  useMotionValueEvent(v, "change", (x) => setN(Math.round(x)));
  return (
    <>
      {m ? n.toLocaleString("en-IN") : ""}
      {suffix}
    </>
  );
}

export function StatsBurst({ content }: { content: ServiceContent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start end", "center center"] });
  return (
    <section ref={ref} className="relative overflow-hidden bg-black py-24 text-white md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-12">
        <Kicker>By the numbers / 04</Kicker>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {content.stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 60, rotate: i % 2 ? 4 : -4 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }}
                className="border-t border-white/15 pt-6"
              >
                <Icon className="mb-4 size-5 text-[#AEFF00]" strokeWidth={1.6} />
                <p className="font-display text-[clamp(3rem,7.5vw,6.5rem)] font-black leading-[0.85] tracking-tighter tabular-nums">
                  <span className="chrome-text pr-[0.04em]">
                    <Count value={s.value} p={p} range={[0.1 + i * 0.08, 0.85 + i * 0.05]} />
                  </span>
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.25em] text-white/55">{s.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="mt-20 -rotate-[3deg] scale-110 chrome-bg py-3 text-black md:mt-28">
        <VelocityMarquee baseVelocity={2.4}>
          {content.capabilities.map((c) => (
            <span key={c.title} className="flex items-center font-display text-4xl font-black uppercase tracking-tight md:text-7xl">
              <span className="px-6">{c.title}</span>
              <span className="text-3xl md:text-5xl">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 7. HOW IT CONNECTS — the ingredients fly in and collide into a result */
/* ------------------------------------------------------------------ */

function Ingredient({ label, i, n, p }: { label: string; i: number; n: number; p: MotionValue<number> }) {
  const side = i - (n - 1) / 2;
  const x = useTransform(p, [0.05, 0.5], [`${side * 60 + (side === 0 ? 0 : Math.sign(side) * 20)}vw`, "0vw"]);
  const y = useTransform(p, [0.05, 0.5], [`${(i % 2 ? 1 : -1) * 40}vh`, "0vh"]);
  const rotate = useTransform(p, [0.05, 0.5], [(i % 2 ? 1 : -1) * 45, 0]);
  const scale = useTransform(p, [0.5, 0.58, 0.66], [1, 1.12, 1]);
  return (
    <motion.div
      style={{ x, y, rotate, scale }}
      className="rounded-2xl border-2 border-black bg-white px-5 py-4 text-center font-display text-lg font-black shadow-[6px_6px_0_#000] md:px-8 md:py-6 md:text-2xl"
    >
      {label}
    </motion.div>
  );
}

export function FormulaCollide({ content }: { content: ServiceContent }) {
  const { inputs, output } = content.formula;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const plus = useTransform(p, [0.42, 0.55], [0, 1]);
  const plusRotate = useTransform(p, [0.42, 0.55], [-180, 0]);
  const eq = useTransform(p, [0.55, 0.65], [0, 1]);
  const outScale = useTransform(p, [0.6, 0.75], [3, 1]);
  const outOpacity = useTransform(p, [0.6, 0.68], [0, 1]);
  const outRotate = useTransform(p, [0.6, 0.75], [-12, 0]);
  const flood = useTransform(p, [0.78, 0.95], ["circle(0% at 50% 60%)", "circle(150% at 50% 60%)"]);
  const headY = useTransform(p, [0, 0.3], [40, 0]);

  return (
    <section ref={ref} className="relative h-[155vh] bg-white text-black">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-5">
        <motion.div style={{ clipPath: flood }} aria-hidden className="chrome-surface absolute inset-0" />
        <motion.div style={{ y: headY }} className="relative mb-12 text-center md:mb-16">
          <Kicker dark={false}>How it connects / 05</Kicker>
          <h2 className="font-display text-[clamp(2rem,5vw,4.5rem)] font-black leading-[0.92] tracking-tight">
            This discipline rarely
            <br />
            works <span className="font-light italic text-black/45">alone.</span>
          </h2>
        </motion.div>
        <div className="relative flex flex-wrap items-center justify-center gap-3 md:gap-5">
          {inputs.map((t, i) => (
            <div key={t.label} className="flex items-center gap-3 md:gap-5">
              <Ingredient label={t.label} i={i} n={inputs.length} p={p} />
              {i < inputs.length - 1 && (
                <motion.span style={{ opacity: plus, rotate: plusRotate }}>
                  <Plus className="size-6 md:size-8" strokeWidth={3} />
                </motion.span>
              )}
            </div>
          ))}
          <motion.span style={{ opacity: eq, scale: eq }}>
            <Equal className="size-7 md:size-9" strokeWidth={3} />
          </motion.span>
          <motion.div
            style={{ scale: outScale, opacity: outOpacity, rotate: outRotate }}
            className="rounded-2xl bg-black px-6 py-4 text-center font-display text-lg font-black text-[#AEFF00] shadow-[6px_6px_0_rgba(0,0,0,0.35)] md:px-9 md:py-6 md:text-2xl"
          >
            {output.label}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 8. THE OTHER SERVICES — rows sweep in from alternating sides          */
/* ------------------------------------------------------------------ */

function EcoRow({ i, currentSlug }: { i: number; currentSlug: string }) {
  const s = services[i];
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start end", "center 0.6"] });
  const x = useTransform(p, [0, 1], [i % 2 ? "40%" : "-40%", "0%"]);
  const opacity = useTransform(p, [0, 0.7], [0, 1]);
  const current = s.slug === currentSlug;
  const accent = serviceContent[s.slug].accent;
  const inner = (
    <>
      <span className="font-display text-sm font-bold tabular-nums opacity-50">{String(i + 1).padStart(2, "0")}</span>
      <span className="flex-1 font-display text-[clamp(1.4rem,4vw,3.4rem)] font-black leading-none tracking-tight">{s.title}</span>
      {current ? (
        <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
          You are here
        </span>
      ) : (
        <ArrowUpRight className="size-6 shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 md:size-8" />
      )}
    </>
  );
  return (
    <motion.li ref={ref} style={{ x, opacity }} className="border-b border-white/10">
      {current ? (
        <div className="chrome-bg flex items-center gap-5 rounded-2xl px-5 py-6 text-black md:gap-8 md:px-8" aria-current="page">
          {inner}
        </div>
      ) : (
        <Link to={s.path} className="group relative flex items-center gap-5 overflow-hidden px-5 py-6 text-white/80 transition-colors hover:text-black md:gap-8 md:px-8">
          <span className="chrome-bg absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
          {inner}
        </Link>
      )}
    </motion.li>
  );
}

export function EcosystemRows({ currentSlug }: { currentSlug: string }) {
  return (
    <section className="relative isolate overflow-hidden bg-black px-0 py-24 text-white md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-12">
        <Kicker>The Shaffedits system / 06</Kicker>
        <h2 className="mb-12 font-display text-[clamp(2rem,5vw,4.5rem)] font-black leading-[0.92] tracking-tight">
          Six disciplines.
          <br />
          <span className="chrome-text pr-[0.06em] font-light italic">One creative engine.</span>
        </h2>
        <ul className="border-t border-white/10">
          {services.map((s, i) => (
            <EcoRow key={s.slug} i={i} currentSlug={currentSlug} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 9. CLOSING — the closing line zooms in from huge, then the CTA lands  */
/* ------------------------------------------------------------------ */

export function ClosingZoom({ content }: { content: ServiceContent }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(p, [0, 0.55], [4, 1]);
  const opacity = useTransform(p, [0, 0.15], [0.35, 1]);
  const blur = useTransform(p, [0, 0.45], ["blur(16px)", "blur(0px)"]);
  const ctaO = useTransform(p, [0.55, 0.7], [0, 1]);
  const ctaY = useTransform(p, [0.55, 0.7], [40, 0]);
  const glow = useTransform(p, [0.3, 1], [0.2, 1]);
  const next = services.find((s) => s.slug === content.nextSlug);

  return (
    <section ref={ref} className="relative h-[140vh] bg-black text-white">
      <div className="sticky top-0 flex h-svh flex-col items-center justify-center overflow-hidden px-5 text-center">
        <motion.div
          aria-hidden
          style={{ opacity: glow }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_60%,rgba(174,255,0,0.2),transparent_70%)]"
        />
        <motion.div style={{ scale, opacity, filter: blur }} className="relative">
          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#AEFF00] md:text-xs">{content.closingKicker}</p>
          <h2 className="mx-auto max-w-5xl font-display text-[clamp(2.2rem,7vw,6.5rem)] font-black uppercase leading-[0.9] tracking-tight">
            {content.closingPlain} <span className="chrome-text pr-[0.04em]">{content.closingAccent}</span>
          </h2>
        </motion.div>
        <motion.div style={{ opacity: ctaO, y: ctaY }} className="relative mt-12 flex flex-col items-center gap-8">
          <GlowButton as="a" href="/#contact" tone="onDark">
            Start a Project <ArrowRight className="h-4 w-4" />
          </GlowButton>
          {next && (
            <Link to={next.path} className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-white/55 transition-colors hover:text-white">
              Next: {next.title}
              <ArrowRight className="size-4 text-[#AEFF00] transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
}
