import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Plane } from "lucide-react";

/** Countries Shaffedits has collaborated with, and the time zone used for the live clock. */
const COUNTRIES = [
  { name: "United States", code: "US", tz: "America/New_York", city: "New York" },
  { name: "Russia", code: "RU", tz: "Europe/Moscow", city: "Moscow" },
  { name: "Germany", code: "DE", tz: "Europe/Berlin", city: "Berlin" },
  { name: "UAE", code: "AE", tz: "Asia/Dubai", city: "Dubai" },
  { name: "Qatar", code: "QA", tz: "Asia/Qatar", city: "Doha" },
  { name: "Singapore", code: "SG", tz: "Asia/Singapore", city: "Singapore" },
  { name: "Malaysia", code: "MY", tz: "Asia/Kuala_Lumpur", city: "Kuala Lumpur" },
  { name: "India", code: "IN", tz: "Asia/Kolkata", city: "Home base" },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LONGEST = Math.max(...COUNTRIES.map((c) => c.name.length));

/**
 * Split-flap text: once `go` is true, each letter rattles through random
 * glyphs and lands on its real letter, left to right, like a departures board.
 */
function useFlap(text: string, go: boolean, delay: number) {
  const target = text.toUpperCase().padEnd(LONGEST, " ");
  const [shown, setShown] = useState(() => " ".repeat(LONGEST));
  useEffect(() => {
    if (!go) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    let frame = 0;
    let timer = 0;
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        frame++;
        const settled = frame - 6; // letters before this index have landed
        setShown(
          target
            .split("")
            .map((ch, k) => (ch === " " || k < settled ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
            .join(""),
        );
        if (settled > LONGEST) clearInterval(timer);
      }, 55);
    }, delay);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
    };
  }, [go, target, delay]);
  return shown;
}

function Tiles({ text }: { text: string }) {
  return (
    <span className="flex gap-[2px] md:gap-[3px]">
      {text.split("").map((ch, k) => (
        <span
          key={k}
          className={`relative grid h-[1.75em] w-[1.25em] place-items-center overflow-hidden rounded-[3px] font-display font-bold leading-none ${
            ch === " " ? "bg-white/[0.03]" : "bg-[#151515] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          }`}
        >
          {ch === " " ? " " : ch}
          {/* the hinge line across the middle of a split-flap tile */}
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/80" />
        </span>
      ))}
    </span>
  );
}

function Row({ c, i, go, now }: { c: (typeof COUNTRIES)[number]; i: number; go: boolean; now: Date }) {
  const name = useFlap(c.name, go, 200 + i * 140);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
  return (
    <motion.li
      initial={{ opacity: 0, x: -30 }}
      animate={go ? { opacity: 1, x: 0 } : undefined}
      transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-t border-white/[0.07] px-3 py-3 md:grid-cols-[3rem_1fr_5rem_7rem_9rem] md:gap-6 md:px-6 md:py-3.5"
    >
      {/* lime sweep on hover */}
      <span aria-hidden className="absolute inset-0 -z-10 origin-left scale-x-0 bg-[#b8ff2e]/[0.07] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100" />
      <span className="font-display text-xs font-bold tabular-nums text-white/35">{String(i + 1).padStart(2, "0")}</span>
      <span className="min-w-0 overflow-hidden text-[9px] sm:text-[11px] md:text-[15px]" aria-label={c.name}>
        <Tiles text={name} />
      </span>
      <span className="hidden md:block">
        <span className="rounded-md border border-[#b8ff2e]/40 px-2 py-1 font-display text-xs font-bold tracking-[0.2em] text-[#b8ff2e]">{c.code}</span>
      </span>
      <span className="text-right font-display text-xs tabular-nums text-white/80 md:text-left md:text-sm">
        {time}
        <span className="block text-[9px] uppercase tracking-[0.2em] text-white/35 md:text-[10px]">{c.city}</span>
      </span>
      <span className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b8ff2e] md:flex">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#b8ff2e] opacity-60" style={{ animationDelay: `${i * 0.3}s` }} />
          <span className="relative inline-flex size-2 rounded-full bg-[#b8ff2e]" />
        </span>
        Collaborated
      </span>
    </motion.li>
  );
}

/**
 * "Global collaborations" as a glowing departures board: country names flip
 * into place on split-flap tiles, each with its code, a live local clock and
 * a lime "Collaborated" status.
 */
export function GlobalBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const go = useInView(ref, { once: true, amount: 0.25 });
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!go) return;
    let n = 0;
    const t = window.setInterval(() => {
      n++;
      setCount(n);
      if (n >= COUNTRIES.length) clearInterval(t);
    }, 140);
    return () => clearInterval(t);
  }, [go]);

  return (
    <div ref={ref} className="relative mt-20 md:mt-28">
      {/* lime glow behind the board */}
      <div aria-hidden className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[#b8ff2e]/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 50, rotateX: 18 }}
        animate={go ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1200 }}
        className="relative isolate overflow-hidden rounded-3xl border border-[#b8ff2e]/30 bg-[#070707] shadow-[0_40px_100px_-30px_rgba(0,0,0,1),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        {/* slow scan line sweeping down the board */}
        <span aria-hidden className="board-scan pointer-events-none absolute inset-x-0 top-0 -z-10 h-24" />

        <div className="flex flex-wrap items-end justify-between gap-4 px-4 pb-6 pt-6 md:px-6 md:pt-8">
          <div>
            <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#b8ff2e] md:text-xs">
              <Plane className="size-4" strokeWidth={2} /> Global collaborations
            </p>
            <h3 className="font-display text-[clamp(1.8rem,4.5vw,3.6rem)] font-black leading-[0.95] tracking-tight">
              Trusted across <span className="chrome-text pr-[0.04em] tabular-nums">{count}</span> countries.
            </h3>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">
            <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> Live
          </span>
        </div>

        <div className="hidden grid-cols-[3rem_1fr_5rem_7rem_9rem] gap-6 px-6 pb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/35 md:grid">
          <span>No.</span>
          <span>Country</span>
          <span>Code</span>
          <span>Local time</span>
          <span>Status</span>
        </div>
        <ul>
          {COUNTRIES.map((c, i) => (
            <Row key={c.code} c={c} i={i} go={go} now={now} />
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
