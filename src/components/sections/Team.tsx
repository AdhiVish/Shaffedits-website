import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

type Member = { name: string; role: string; bio?: string; image?: string };

// The team, in book order. Leave `name` empty for a spot that is still to be filled.
// Add `image` (a path under public/) once a photo arrives, and `bio` for the description.
const team: Member[] = [
  {
    name: "Mohammed Shafeeq",
    role: "Founder & Creative Director",
    bio: "Leads the agency's creative vision, brand strategy, client relationships, and campaign direction while ensuring every project creates meaningful business impact.",
  },
  { name: "Juhainaah", role: "Content & Project Manager" },
  { name: "Adhi", role: "Web Developer" },
  { name: "Rukshandha", role: "Video Editor" },
  { name: "", role: "" },
  { name: "", role: "" },
];

type Page =
  | { kind: "cover" }
  | { kind: "back" }
  | { kind: "blank" }
  | { kind: "end" }
  | { kind: "member"; m: Member; i: number };

const FLIP_S = 0.9;
const EASE = [0.45, 0, 0.2, 1] as const;
const RATIO = 1.38; // page height / width

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */

function CoverPage() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-r-[0.9em] rounded-l-[0.25em] bg-[#0b0b0b] text-white">
      {/* spine */}
      <div className="chrome-bg absolute inset-y-0 left-0 w-[0.9em]" />
      <div className="absolute inset-y-0 left-[0.9em] w-[0.5em] bg-gradient-to-r from-black/70 to-transparent" />
      {/* soft light + embossed frame */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_15%,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="absolute inset-y-[1.3em] left-[2.2em] right-[1.3em] rounded-[0.5em] border border-white/[0.12]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center pl-[0.9em]">
        <img src={logoWhite} alt="Shaffedits" draggable={false} className="w-[62%] select-none object-contain" />
        <p className="mt-[1.6em] text-[0.62em] font-medium uppercase tracking-[0.45em] text-white/55">Meet the team</p>
      </div>
      <p className="absolute bottom-[2.4em] right-[2.4em] inline-flex items-center gap-[0.5em] text-[0.6em] font-medium uppercase tracking-[0.3em] text-white/45">
        Open <ArrowRight className="h-[1.2em] w-[1.2em]" />
      </p>
    </div>
  );
}

function BackCover() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-l-[0.9em] rounded-r-[0.25em] bg-[#0b0b0b]">
      <div className="chrome-bg absolute inset-y-0 right-0 w-[0.9em]" />
      <div className="absolute inset-y-[1.3em] left-[1.3em] right-[2.2em] rounded-[0.5em] border border-white/[0.12]" />
      <div className="absolute inset-0 flex items-center justify-center pr-[0.9em]">
        <img src={logoWhite} alt="" draggable={false} className="w-[34%] select-none object-contain opacity-40" />
      </div>
    </div>
  );
}

/** Paper with a soft shadow toward the spine. */
function Paper({ side, children }: { side: "left" | "right"; children?: ReactNode }) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-[#f4f2ee] text-black ${
        side === "right" ? "rounded-r-[0.9em]" : "rounded-l-[0.9em]"
      }`}
    >
      {children}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 w-[2.2em] ${
          side === "right" ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"
        } from-black/15 to-transparent`}
      />
    </div>
  );
}

function MemberPage({ m, i, side }: { m: Member; i: number; side: "left" | "right" }) {
  const open = !m.name;
  return (
    <Paper side={side}>
      <div className="absolute inset-0 flex flex-col p-[1.5em]">
        <div className="flex items-center justify-between text-[0.56em] font-medium uppercase tracking-[0.32em] text-black/40">
          <span>Shaffedits · Team</span>
          <span>
            {String(i + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")}
          </span>
        </div>

        {/* photo */}
        <div className="relative mt-[0.9em] grid aspect-[4/3.3] place-items-center overflow-hidden rounded-[0.6em] bg-black/[0.05] ring-1 ring-black/10">
          {m.image ? (
            <img src={m.image} alt={m.name} draggable={false} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-[0.6em] text-black/30">
              <Camera className="h-[1.8em] w-[1.8em]" strokeWidth={1.4} />
              <span className="text-[0.55em] font-medium uppercase tracking-[0.3em]">Photo coming soon</span>
            </div>
          )}
        </div>

        <h3
          className={`mt-[0.85em] font-display text-[1.65em] font-black leading-[0.95] tracking-tight ${
            open ? "text-black/25" : ""
          }`}
        >
          {open ? "Coming soon" : m.name}
        </h3>
        <p className="mt-[0.5em] text-[0.6em] font-semibold uppercase tracking-[0.28em] text-[#2641FF]">
          {open ? "New member" : m.role}
        </p>

        {/* description */}
        <div className="mt-[0.8em] min-h-0 flex-1">
          {m.bio ? (
            <p className="text-[0.7em] leading-[1.6] text-black/60">{m.bio}</p>
          ) : (
            <div aria-label="Description coming soon" className="space-y-[0.55em] pt-[0.2em]">
              <div className="h-[0.42em] w-full rounded-full bg-black/[0.07]" />
              <div className="h-[0.42em] w-[92%] rounded-full bg-black/[0.07]" />
              <div className="h-[0.42em] w-[70%] rounded-full bg-black/[0.07]" />
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
}

function EndPage({ side }: { side: "left" | "right" }) {
  return (
    <Paper side={side}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-[2em] text-center">
        <p className="text-[0.56em] font-medium uppercase tracking-[0.32em] text-black/40">That's the crew</p>
        <p className="mt-[0.6em] font-display text-[1.6em] font-black leading-[0.95] tracking-tight">
          Your project,
          <br />
          <span className="font-light italic text-[#2641FF]">our people.</span>
        </p>
      </div>
    </Paper>
  );
}

function renderPage(p: Page, side: "left" | "right") {
  switch (p.kind) {
    case "cover":
      return <CoverPage />;
    case "back":
      return <BackCover />;
    case "end":
      return <EndPage side={side} />;
    case "blank":
      return <Paper side={side} />;
    case "member":
      return <MemberPage m={p.m} i={p.i} side={side} />;
  }
}

/* ------------------------------------------------------------------ */
/* Background strips of real work (kept from the old section)          */
/* ------------------------------------------------------------------ */

const TOP_ROW = ["t01", "t04", "t02", "t07", "t10", "t03", "t05", "t11"];
const BOTTOM_ROW = ["t06", "t12", "t08", "t09", "t03", "t01", "t05", "t02"];

function WorkRow({ ids, reverse, className }: { ids: string[]; reverse?: boolean; className: string }) {
  const base = import.meta.env.BASE_URL;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-0 h-28 overflow-hidden opacity-[0.18] md:h-36 ${className}`}
      style={{
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
        maskImage: "linear-gradient(90deg, transparent, #000 18%, #000 82%, transparent)",
      }}
    >
      <div
        className="animate-marquee flex h-full w-max gap-4"
        style={
          {
            "--marquee-duration": reverse ? "90s" : "75s",
            animationDirection: reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {[0, 1].map((rep) =>
          ids.map((id, i) => (
            <img
              key={rep + "-" + i}
              src={`${base}showcase/${id}.webp`}
              alt=""
              draggable={false}
              loading="lazy"
              decoding="async"
              className="h-full w-auto shrink-0 rounded-lg object-cover"
            />
          )),
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The flipbook                                                        */
/* ------------------------------------------------------------------ */

export function Team() {
  const [W, setW] = useState(360);
  const [phone, setPhone] = useState(false);
  const [still, setStill] = useState(false);
  const [flipped, setFlipped] = useState(0); // how many leaves have been turned
  const [moving, setMoving] = useState<number | null>(null); // leaf turning forward, kept on top
  const [peek, setPeek] = useState(false);
  const [resetting, setResetting] = useState(false);
  const lockRef = useRef(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const fit = () => {
      const iw = window.innerWidth;
      const ih = window.innerHeight;
      const small = iw < 768;
      setPhone(small);
      setW(
        Math.round(
          small
            ? Math.min(iw - 56, 360, (ih * 0.6) / RATIO)
            : Math.min(400, (iw - 160) / 2, (ih * 0.56) / RATIO),
        ),
      );
    };
    fit();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(mq.matches);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Desktop: a real two-page spread, so each leaf carries a page on both sides.
  // Phone: one page at a time, each leaf has a member on the front and plain paper behind.
  const inner: Page[] = team.map((m, i) => ({ kind: "member", m, i }));
  const leaves: [Page, Page][] = [];
  if (phone) {
    [{ kind: "cover" } as Page, ...inner, { kind: "end" } as Page].forEach((p) => leaves.push([p, { kind: "blank" }]));
  } else {
    const pages: Page[] = [{ kind: "cover" }, ...inner];
    if (inner.length % 2 === 1) pages.push({ kind: "end" });
    pages.push({ kind: "back" });
    for (let i = 0; i < pages.length; i += 2) leaves.push([pages[i], pages[i + 1]]);
  }
  const L = leaves.length;
  const maxFlip = phone ? L - 1 : L;

  // Keep the position valid when switching between phone and desktop layouts.
  useEffect(() => {
    setFlipped((f) => Math.min(f, maxFlip));
  }, [maxFlip]);

  const dur = still ? 0 : FLIP_S;

  const lock = (ms: number) => {
    lockRef.current = true;
    window.setTimeout(() => (lockRef.current = false), ms);
  };

  const next = useCallback(() => {
    if (lockRef.current) return;
    setPeek(false);
    if (flipped >= maxFlip) {
      // Back at the end: close the book again, last leaf first.
      setResetting(true);
      setFlipped(0);
      const total = (dur + 0.12 * (L - 1)) * 1000;
      lock(total);
      window.setTimeout(() => setResetting(false), total);
      return;
    }
    lock(dur * 650);
    setMoving(flipped);
    window.setTimeout(() => setMoving((m) => (m === flipped ? null : m)), dur * 1000);
    setFlipped(flipped + 1);
  }, [flipped, maxFlip, dur, L]);

  const prev = useCallback(() => {
    if (lockRef.current || flipped === 0) return;
    lock(dur * 650);
    setFlipped(flipped - 1);
  }, [flipped, dur]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  const onBookClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phone) return next();
    const b = e.currentTarget.getBoundingClientRect();
    if (e.clientX - b.left < b.width / 2) prev();
    else next();
  };

  const H = Math.round(W * RATIO);
  // Closed books sit in the middle: the cover on its own, or the back cover on its own.
  const shift = phone ? 0 : flipped === 0 ? -W / 2 : flipped === L ? W / 2 : 0;

  // Label under the book.
  const memberPos = (p: Page) => (p.kind === "member" ? p.i + 1 : null);
  let label = "Cover";
  if (flipped > 0) {
    if (phone) {
      const p = leaves[flipped][0];
      label = p.kind === "member" ? `${String(p.i + 1).padStart(2, "0")} / ${String(team.length).padStart(2, "0")}` : "The end";
    } else if (flipped === L) {
      label = "Back cover";
    } else {
      const nums = [memberPos(leaves[flipped - 1][1]), memberPos(leaves[flipped]?.[0])].filter(Boolean) as number[];
      label = `${nums.map((n) => String(n).padStart(2, "0")).join("–")} / ${String(team.length).padStart(2, "0")}`;
    }
  }

  return (
    <section
      id="team"
      className="relative overflow-hidden px-6 pt-44 pb-44 text-white md:pt-56 md:pb-52"
      style={{ background: "radial-gradient(circle at top, #232323 0%, #050505 62%)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[55%] h-[50rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(38,65,255,0.14), rgba(38,65,255,0.05) 55%, transparent)" }}
      />
      <WorkRow ids={TOP_ROW} className="top-6" />
      <WorkRow ids={BOTTOM_ROW} reverse className="bottom-4" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-12 md:mb-16"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/50">Our Team / 03</p>
          <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] font-black leading-none tracking-tight">
            The people behind the <span className="font-light italic text-white/60">work</span>
          </h2>
        </motion.div>

        {/* ---- the book ---- */}
        <div className={phone ? "mx-auto overflow-hidden" : "mx-auto"} style={{ width: phone ? W : 2 * W, height: H + 40, paddingTop: 20 }}>
          <motion.div
            role="group"
            aria-roledescription="flipbook"
            aria-label="Team members"
            tabIndex={0}
            onKeyDown={onKey}
            onClick={onBookClick}
            onMouseEnter={() => !phone && flipped === 0 && !still && setPeek(true)}
            onMouseLeave={() => setPeek(false)}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (dx < -40) next();
              else if (dx > 40) prev();
            }}
            className="relative cursor-pointer select-none outline-none"
            style={{ width: phone ? W : 2 * W, height: H, perspective: 2200, fontSize: (W / 360) * 16 }}
            animate={{ x: shift }}
            transition={{ duration: dur * 0.8, ease: EASE }}
          >
            {/* soft shadow under whatever is lying open */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 h-10 rounded-[50%] bg-black/70 blur-xl"
              animate={{
                left: phone ? "6%" : flipped === 0 ? "53%" : flipped === L ? "3%" : "3%",
                right: phone ? "6%" : flipped === 0 ? "3%" : flipped === L ? "53%" : "3%",
              }}
              transition={{ duration: dur * 0.8, ease: EASE }}
            />

            {leaves.map(([front, back], i) => {
              const isFlipped = i < flipped;
              const z = moving === i ? 3 * L : isFlipped ? i + 1 : 2 * L - i;
              const delay = resetting ? 0.12 * (L - 1 - i) : 0;
              return (
                <motion.div
                  key={(phone ? "p" : "d") + i}
                  className="absolute top-0"
                  style={{
                    left: phone ? 0 : W,
                    width: W,
                    height: H,
                    zIndex: z,
                    transformOrigin: "left center",
                    transformStyle: "preserve-3d",
                  }}
                  initial={false}
                  animate={{ rotateY: isFlipped ? -180 : peek && i === 0 ? -16 : 0 }}
                  transition={{ duration: peek ? dur * 0.5 : dur, delay, ease: EASE }}
                >
                  <div
                    className="absolute inset-0 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]"
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                  >
                    {renderPage(front, "right")}
                  </div>
                  <div
                    className="absolute inset-0 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.85)]"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {renderPage(back, "left")}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* ---- controls ---- */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={prev}
              disabled={flipped === 0}
              aria-label="Previous page"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#2641FF] hover:bg-[#2641FF] hover:text-black disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[7rem] text-center font-display text-sm font-bold uppercase tracking-[0.25em] text-white/60">
              {label}
            </span>
            <button
              type="button"
              onClick={next}
              aria-label={flipped >= maxFlip ? "Close the book" : "Next page"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#2641FF] hover:bg-[#2641FF] hover:text-black"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs uppercase tracking-widest text-white/40">
            {phone ? "Tap or swipe to turn the page" : "Click the book or use the arrows to turn the page"}
          </p>
        </div>
      </div>
    </section>
  );
}
