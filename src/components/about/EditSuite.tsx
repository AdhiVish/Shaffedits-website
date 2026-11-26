import { useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useTransform, useMotionValueEvent, type MotionValue } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, SkipBack, SkipForward } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useJsScroll } from "@/components/wild/useJsScroll";
import { useIsPhone } from "@/lib/usePhone";
import { GlowButton } from "@/components/ui/GlowButton";
import { team } from "@/components/sections/Team";

/**
 * The About page as a video-editing suite.
 * Scrolling = scrubbing: the timeline slides under a fixed lime playhead and the
 * viewer cuts to whichever clip (chapter) is under it. Each chapter animates with
 * its own progress through the clip. Clips and transport buttons jump between chapters.
 */

const base = import.meta.env.BASE_URL;
const img = (s: string) => `${base}showcase/${s}.webp`;
const WHATSAPP_URL = `https://wa.me/918807705502?text=${encodeURIComponent("Hi Shaffedits! I have an idea")}`;

const CHAPTERS = [
  { label: "Who we are", thumbs: ["a02", "t03", "a07"] },
  { label: "How we work", thumbs: ["a04", "t05", "a09"] },
  { label: "What we believe", thumbs: ["t07", "a05", "t09"] },
  { label: "By the numbers", thumbs: ["a01", "t11", "a03"] },
  { label: "The crew", thumbs: ["t01", "a08", "t12"] },
  { label: "Export", thumbs: ["a10", "t02", "a06"] },
];
const N = CHAPTERS.length;
const FPS = 24;
const RUNTIME = 96; // seconds the whole "edit" pretends to last

const pad = (n: number) => String(n).padStart(2, "0");
function timecode(p: number) {
  const f = Math.round(Math.min(1, Math.max(0, p)) * RUNTIME * FPS);
  const s = Math.floor(f / FPS);
  return `00:${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(f % FPS)}`;
}
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ------------------------------------------------------------------ chapters */

const WHO =
  "At Shaffedits, creativity is communication. We're a multidisciplinary creative agency bringing [img:a02] branding, content, design, [img:t03] digital strategy, filmmaking and web experiences [img:a07] under one creative roof.";
const LOUD = new Set(["communication.", "roof."]);
const whoTokens = WHO.split(" ").map((t) => {
  const m = t.match(/^\[img:(\w+)\]$/);
  return m ? { img: m[1] } : { text: t };
});

function Word({ text, range, lp }: { text: string; range: [number, number]; lp: MotionValue<number> }) {
  const opacity = useTransform(lp, range, [0.14, 1]);
  const y = useTransform(lp, range, ["0.25em", "0em"]);
  return (
    <motion.span
      style={{ opacity, y }}
      className={"mr-[0.25em] inline-block " + (LOUD.has(text) ? "italic font-light text-[#5C72FF]" : "")}
    >
      {text}
    </motion.span>
  );
}

function Pic({ src, range, lp }: { src: string; range: [number, number]; lp: MotionValue<number> }) {
  const width = useTransform(lp, range, ["0em", "1.9em"]);
  const rotate = useTransform(lp, range, [-30, 0]);
  return (
    <motion.span
      style={{ width, rotate }}
      className="mr-[0.25em] inline-block h-[0.82em] overflow-hidden rounded-full align-[-0.08em] ring-2 ring-[#2641FF]"
    >
      <img src={img(src)} alt="" className="h-full w-full object-cover" draggable={false} />
    </motion.span>
  );
}

function Who({ lp }: { lp: MotionValue<number> }) {
  const n = whoTokens.length;
  return (
    <div className="font-display text-[clamp(1.35rem,min(3.4vw,5.4vh),3.6rem)] font-bold leading-[1.06] tracking-tight">
      {whoTokens.map((t, i) => {
        const s = (i / n) * 0.7;
        const range: [number, number] = [s, s + 0.12];
        return "img" in t ? (
          <Pic key={i} src={t.img!} range={range} lp={lp} />
        ) : (
          <Word key={i} text={t.text!} range={range} lp={lp} />
        );
      })}
    </div>
  );
}

const STEPS = [
  { word: "Listen", line: "your business, your audience, your ambitions" },
  { word: "Plan", line: "strategy before a single pixel" },
  { word: "Make", line: "brand, film, content, code" },
  { word: "Launch", line: "then keep it growing" },
];

function Step({ i, lp, word, line }: { i: number; lp: MotionValue<number>; word: string; line: string }) {
  const at = 0.08 + i * 0.17;
  const on = useTransform(lp, [at, at + 0.08], [0, 1]);
  const color = useTransform(on, [0, 1], ["rgba(255,255,255,0.16)", "rgba(255,255,255,1)"]);
  const key = useTransform(on, [0, 1], ["rgba(255,255,255,0.2)", "#AEFF00"]);
  const y = useTransform(on, [0, 1], [18, 0]);
  return (
    <div className="relative pt-7">
      <motion.span
        style={{ backgroundColor: key }}
        className="absolute left-0 top-0 size-3 -translate-y-1/2 rotate-45"
        aria-hidden
      />
      <span className="mb-1 hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 md:block">Step 0{i + 1}</span>
      <motion.span style={{ color, y }} className="block font-display text-[clamp(1.6rem,min(4vw,6vh),4.4rem)] font-bold leading-none tracking-tight">
        {word}
      </motion.span>
      <motion.span style={{ opacity: on }} className="mt-2 hidden max-w-[22ch] text-sm text-white/60 md:block md:text-base">
        {line}
      </motion.span>
    </div>
  );
}

function How({ lp }: { lp: MotionValue<number> }) {
  const lineW = useTransform(lp, [0.05, 0.75], ["0%", "100%"]);
  const outro = useTransform(lp, [0.75, 0.9], [0, 1]);
  return (
    <div>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
        <motion.div style={{ width: lineW }} className="absolute left-0 top-0 h-px bg-[#AEFF00]" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 md:gap-y-8">
          {STEPS.map((s, i) => (
            <Step key={s.word} i={i} lp={lp} {...s} />
          ))}
        </div>
      </div>
      <motion.p style={{ opacity: outro }} className="mt-12 hidden max-w-2xl text-lg leading-relaxed text-white/70 md:block">
        Every project begins with understanding you, before we build anything that's visually compelling and
        commercially effective. Launching, refreshing or scaling, we become an extension of your team.
      </motion.p>
    </div>
  );
}

const BELIEFS = ["Strategy behind every pixel.", "Everything under one creative roof.", "An extension of your team."];
const GRADE = ["Exposure", "Contrast", "Saturation", "Vibe"];

function Belief({ i, lp, text }: { i: number; lp: MotionValue<number>; text: string }) {
  const at = 0.05 + i * 0.25;
  const opacity = useTransform(lp, [at, at + 0.12], [0.12, 1]);
  const x = useTransform(lp, [at, at + 0.12], [-30, 0]);
  return (
    <motion.p style={{ opacity, x }} className="relative pl-8 font-display text-[clamp(1.5rem,min(4.2vw,6.4vh),4.6rem)] font-bold leading-[1.02] tracking-tight md:pl-10">
      <span className="absolute left-0 top-1 font-mono text-xs font-normal text-[#5C72FF] md:text-sm">0{i + 1}</span>
      {text}
    </motion.p>
  );
}

function Slider({ i, lp, name }: { i: number; lp: MotionValue<number>; name: string }) {
  const left = useTransform(lp, [0, 0.85], [`${20 + i * 9}%`, `${62 + ((i * 17) % 30)}%`]);
  return (
    <div>
      <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/50">
        <span>{name}</span>
        <span>{i === 3 ? "max" : "+"}</span>
      </div>
      <div className="relative h-1 rounded-full bg-gradient-to-r from-white/10 via-[#2641FF] to-[#AEFF00]">
        <motion.span style={{ left }} className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </div>
    </div>
  );
}

function Believe({ lp, phone }: { lp: MotionValue<number>; phone: boolean }) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-12">
      <div className="space-y-3 md:col-span-8 md:space-y-5">
        {BELIEFS.map((b, i) => (
          <Belief key={b} i={i} lp={lp} text={b} />
        ))}
      </div>
      {!phone && (
        <div className="col-span-4 space-y-5 rounded-lg border border-white/10 bg-white/[0.03] p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">Colour grade · our look</p>
          {GRADE.map((g, i) => (
            <Slider key={g} i={i} lp={lp} name={g} />
          ))}
        </div>
      )}
    </div>
  );
}

const NUMBERS = [
  { to: 8, suffix: "+", label: "years in the game" },
  { to: 40, suffix: "+", label: "brands trusted us" },
  { to: 1500, suffix: "+", label: "projects delivered" },
  { to: 15, suffix: "M+", label: "views generated" },
];

function Count({ i, lp, to, suffix, label }: { i: number; lp: MotionValue<number>; to: number; suffix: string; label: string }) {
  const at = i * 0.12;
  const text = useTransform(lp, [at, at + 0.45], [0, to], { clamp: true });
  const shown = useTransform(text, (v) => Math.round(v).toLocaleString("en-US") + suffix);
  return (
    <div className="border-t border-white/15 pt-3">
      <motion.span className="lime-text block font-display text-[clamp(2.4rem,min(6vw,9vh),6.5rem)] font-bold leading-none tracking-tight">
        {shown}
      </motion.span>
      <span className="mt-2 block text-sm text-white md:text-lg">{label}</span>
    </div>
  );
}

function Numbers({ lp }: { lp: MotionValue<number> }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 md:gap-x-10">
      {NUMBERS.map((n, i) => (
        <Count key={n.label} i={i} lp={lp} {...n} />
      ))}
    </div>
  );
}

function Crew({ lp }: { lp: MotionValue<number> }) {
  const y = useTransform(lp, [0, 1], ["55%", "-75%"]);
  const people = team.filter((m) => m.name);
  return (
    <div className="relative h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]">
      <motion.div style={{ y }} className="mx-auto max-w-2xl text-center">
        <p className="mb-8 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">A Shaffedits production</p>
        <p className="mb-10 font-display text-3xl font-bold tracking-tight md:text-5xl">Starring</p>
        <div className="space-y-6 md:space-y-8">
          {people.map((m) => (
            <div key={m.name}>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#5C72FF] md:text-xs">{m.role}</p>
              <p className="font-display text-2xl font-bold tracking-tight md:text-4xl">{m.name}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          and 40+ brands in supporting roles
        </p>
      </motion.div>
    </div>
  );
}

function ExportCh({ lp }: { lp: MotionValue<number> }) {
  const w = useTransform(lp, [0.02, 0.5], ["0%", "100%"]);
  const pct = useTransform(lp, [0.02, 0.5], [0, 100], { clamp: true });
  const pctText = useTransform(pct, (v) => `${Math.round(v)}%`);
  const done = useTransform(lp, [0.48, 0.6], [0, 1]);
  const doneY = useTransform(done, [0, 1], [24, 0]);
  const barFade = useTransform(done, [0, 1], [1, 0.35]);
  return (
    <div className="mx-auto w-full max-w-3xl">
      <motion.div style={{ opacity: barFade }}>
        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-white/60 md:text-xs">
          <span>Rendering your_brand.mp4</span>
          <motion.span>{pctText}</motion.span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div style={{ width: w }} className="chrome-bg h-full rounded-full" />
        </div>
      </motion.div>
      <motion.div style={{ opacity: done, y: doneY }} className="mt-8 md:mt-12">
        <p className="font-display text-[clamp(2rem,min(6vw,9vh),6rem)] font-bold leading-[0.95] tracking-tight">
          Render complete.
          <br />
          <span className="italic font-light text-[#5C72FF]">Your turn.</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
          <GlowButton as="a" href="/#contact" tone="lime">
            Let's Build Your Brand
          </GlowButton>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold transition-colors hover:border-[#2641FF] hover:bg-[#2641FF] hover:text-[#AEFF00]"
          >
            <FaWhatsapp className="size-4" /> Chat on WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}

function Chapter({ i, p, phone }: { i: number; p: MotionValue<number>; phone: boolean }) {
  const lp = useTransform(p, (v) => clamp01(v * N - i));
  switch (i) {
    case 0: return <Who lp={lp} />;
    case 1: return <How lp={lp} />;
    case 2: return <Believe lp={lp} phone={phone} />;
    case 3: return <Numbers lp={lp} />;
    case 4: return <Crew lp={lp} />;
    default: return <ExportCh lp={lp} />;
  }
}

/* ------------------------------------------------------------------ suite chrome */

function Corners() {
  const c = "absolute size-4 border-white/40";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-3 md:inset-5">
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

// deterministic "audio" so the waveform looks the same every visit
function wave(seed: number) {
  let d = "";
  for (let k = 0; k < 60; k++) {
    const h = 3 + Math.abs(Math.sin(seed * 12.9 + k * 0.7) * Math.cos(k * 0.31 + seed)) * 15;
    d += `M${k * 2 + 0.5} ${10 - h / 2}h1v${h}h-1z`;
  }
  return d;
}

function Row({ label, children, h }: { label: string; children: ReactNode; h: string }) {
  return (
    <div className={`flex ${h}`}>
      <span className="grid w-9 shrink-0 place-items-center border-r border-white/10 text-[9px] text-white/50 md:w-11">
        {label}
      </span>
      <div className="relative flex-1">{children}</div>
    </div>
  );
}

export function EditSuite() {
  const ref = useRef<HTMLElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const phone = useIsPhone();
  const { scrollYProgress: p } = useJsScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(p, "change", (v) => {
    const i = Math.min(N - 1, Math.max(0, Math.floor(v * N)));
    setActive((a) => (a === i ? a : i));
    if (tcRef.current) tcRef.current.textContent = timecode(v);
  });

  // the tracks slide left under the fixed playhead
  const trackX = useTransform(p, [0, 1], ["0%", "-100%"]);
  const clipW = phone ? 56 : 30; // vw per clip

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const k = Math.min(N - 1, Math.max(0, i));
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((k + 0.3) / N) * (el.offsetHeight - window.innerHeight);
    const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const btn =
    "grid size-8 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white md:size-9";

  return (
    <section ref={ref} id="about" className="relative bg-black text-white" style={{ height: `${N * (phone ? 115 : 135)}svh` }}>
      <div className="sticky top-0 flex h-svh flex-col gap-2 px-3 pb-3 pt-[5.5rem] md:gap-3 md:px-6 md:pb-5 md:pt-28">
        {/* project bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50 md:text-xs"
        >
          <Link to="/" aria-label="Back to the home page" className="group inline-flex items-center gap-2 text-white">
            <span className="grid size-8 place-items-center rounded-full bg-[#2641FF] text-[#AEFF00] transition-transform duration-300 group-hover:-translate-x-1 md:size-9">
              <ArrowLeft className="size-4" />
            </span>
            Back
          </Link>
          <span className="hidden truncate md:block">shaffedits_about_FINAL_final_v8.prproj</span>
          <span>About / 01</span>
        </motion.div>

        {/* program viewer */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#060609]">
          <Corners />
          <div className="absolute inset-x-5 top-4 z-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/50 md:inset-x-8 md:top-6 md:text-xs">
            <span>
              Clip 0{active + 1}/0{N} — <span className="text-white">{CHAPTERS[active].label}</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-red-500" /> {phone ? "REC" : "REC · 4K · 24fps"}
            </span>
          </div>

          <AnimatePresence>
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={
                "absolute inset-0 flex flex-col px-6 md:px-14 " +
                (active === 4 ? "py-12 md:py-14" : "justify-center py-14 md:py-16")
              }
            >
              <Chapter i={active} p={p} phone={phone} />
            </motion.div>
          </AnimatePresence>
          {/* the cut: one quick white frame */}
          <motion.div
            key={`flash-${active}`}
            aria-hidden
            initial={{ opacity: 0.22 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        </div>

        {/* transport */}
        <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-widest text-white/50 md:text-xs">
          <span className="hidden w-48 md:block">Program · about_us.mp4</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Previous chapter" className={btn} onClick={() => goTo(active - 1)}>
              <SkipBack className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Play next chapter"
              className="grid size-9 place-items-center rounded-full bg-[#2641FF] text-[#AEFF00] transition-transform hover:scale-110 md:size-10"
              onClick={() => goTo(active + 1)}
            >
              <Play className="size-4 fill-current" />
            </button>
            <button type="button" aria-label="Next chapter" className={btn} onClick={() => goTo(active + 1)}>
              <SkipForward className="size-4" />
            </button>
          </div>
          <span ref={tcRef} className="w-48 text-right text-sm tabular-nums tracking-wider text-[#AEFF00] md:text-base">
            00:00:00:00
          </span>
        </div>

        {/* timeline */}
        <div className="relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b10] py-1.5 font-mono">
          <div className="relative space-y-1">
            <Row label="" h="h-4">
              <div className="absolute inset-0 overflow-hidden">
                <motion.div style={{ x: trackX, width: `${N * clipW}vw` }} className="absolute inset-y-0 left-1/2 flex">
                  {CHAPTERS.map((_, i) => (
                    <div
                      key={i}
                      className="relative h-full shrink-0 border-l border-white/30 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.18)_0_1px,transparent_1px_12px)] bg-[length:100%_40%] bg-bottom bg-no-repeat"
                      style={{ width: `${clipW}vw` }}
                    >
                      <span className="absolute left-1 top-0 text-[8px] leading-none text-white/45">{timecode(i / N)}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </Row>
            <Row label="V2" h={phone ? "h-7" : "h-10"}>
              <div className="absolute inset-0 overflow-hidden">
                <motion.div style={{ x: trackX, width: `${N * clipW}vw` }} className="absolute inset-y-0 left-1/2 flex">
                  {CHAPTERS.map((c, i) => (
                    <div key={i} className="h-full shrink-0 px-px" style={{ width: `${clipW}vw` }}>
                      <div className="flex h-full overflow-hidden rounded-[4px] border border-white/15">
                        {c.thumbs.map((t) => (
                          <img key={t} src={img(t)} alt="" loading="lazy" draggable={false} className="h-full min-w-0 flex-1 object-cover opacity-70" />
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </Row>
            <Row label="V1" h={phone ? "h-7" : "h-9"}>
              <div className="absolute inset-0 overflow-hidden">
                <motion.div style={{ x: trackX, width: `${N * clipW}vw` }} className="absolute inset-y-0 left-1/2 flex">
                  {CHAPTERS.map((c, i) => (
                    <div key={i} className="h-full shrink-0 px-px" style={{ width: `${clipW}vw` }}>
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        className={
                          "chrome-bg flex h-full w-full items-center gap-2 rounded-[4px] px-2 text-left text-[10px] font-bold uppercase tracking-widest !text-[#AEFF00] transition-[filter] md:text-xs " +
                          (i === active ? "ring-2 ring-inset ring-white" : "brightness-75 hover:brightness-100")
                        }
                      >
                        <span className="opacity-60">0{i + 1}</span>
                        <span className="truncate">{c.label}</span>
                      </button>
                    </div>
                  ))}
                </motion.div>
              </div>
            </Row>
            <Row label="A1" h={phone ? "h-6" : "h-8"}>
              <div className="absolute inset-0 overflow-hidden">
                <motion.div style={{ x: trackX, width: `${N * clipW}vw` }} className="absolute inset-y-0 left-1/2 flex">
                  {CHAPTERS.map((_, i) => (
                    <div key={i} className="h-full shrink-0 px-px" style={{ width: `${clipW}vw` }}>
                      <svg viewBox="0 0 120 20" preserveAspectRatio="none" className="h-full w-full rounded-[4px] bg-[#2641FF]/15">
                        <path d={wave(i + 1)} fill="#5C72FF" />
                      </svg>
                    </div>
                  ))}
                </motion.div>
              </div>
            </Row>

            {/* playhead (centre of the track area) */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-9 right-0 md:left-11">
              <div className="absolute -top-1.5 bottom-0 left-1/2 w-px -translate-x-1/2 bg-[#AEFF00] shadow-[0_0_8px_#AEFF00]">
                <span className="absolute -left-[5px] top-0 size-[11px] rotate-45 bg-[#AEFF00]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
