import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useInView } from "motion/react";
import { Play, X, Film } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

const base = import.meta.env.BASE_URL;

// The videos, in hand order. To add one, drop the file in public/videos/ and set
// `src: \`${base}videos/name.mp4\`` (+ an optional `poster` still). Cards without
// a `src` show a placeholder and open a "coming soon" player.
type Video = { title: string; client: string; src?: string; poster?: string };
const videos: Video[] = [
  { title: "Reel 04", client: "Shaffedits", src: `${base}videos/reel-04.mp4`, poster: `${base}videos/reel-04.webp` },
  { title: "Reel 05", client: "Shaffedits", src: `${base}videos/reel-05.mp4`, poster: `${base}videos/reel-05.webp` },
  { title: "Reel 06", client: "Shaffedits", src: `${base}videos/reel-06.mp4`, poster: `${base}videos/reel-06.webp` },
  { title: "Showreel 2026", client: "Shaffedits", src: `${base}videos/showreel.mp4`, poster: `${base}videos/showreel.webp` },
  { title: "Reel 08", client: "Shaffedits", src: `${base}videos/reel-08.mp4`, poster: `${base}videos/reel-08.webp` },
  { title: "Reel 08", client: "Lspace", src: `${base}videos/lspace-reel-08.mp4`, poster: `${base}videos/lspace-reel-08.webp` },
  { title: "Reel 06 · June", client: "Shaffedits", src: `${base}videos/reel-06-jun.mp4`, poster: `${base}videos/reel-06-jun.webp` },
];

const RATIO = 16 / 9; // vertical reel cards
const EASE = [0.22, 1, 0.36, 1] as const;
/** Phones and touch screens: the hand is a still picture, tap opens the player. */
const STILL_QUERY = "(max-width: 767px), (hover: none)";

function useHandSize() {
  const calc = () => {
    const vw = window.innerWidth;
    const phone = vw < 640;
    const room = Math.min(vw * (phone ? 0.9 : 0.86), 1180);
    const step = phone ? 0.4 : 0.62;
    const tilt = phone ? 5 : 7;
    const n = videos.length;
    const outer = ((n - 1) / 2) * tilt * (Math.PI / 180);
    const span = (n - 1) * step + Math.cos(outer) + 2 * RATIO * Math.sin(outer) * 0.5;
    const W = Math.round(Math.min(240, Math.max(70, room / span)));
    return { W, step, tilt, phone };
  };
  const [s, setS] = useState(calc);
  useEffect(() => {
    const on = () => setS(calc());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

/** One reel card. Plays a muted preview while it's picked (desktop). */
function ReelCard({ v, i, active, W }: { v: Video; i: number; active: boolean; W: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) el.play().catch(() => {});
    else {
      el.pause();
    }
  }, [active]);

  return (
    <div className="relative h-full w-full">
      {v.src ? (
        <video
          ref={ref}
          src={v.src}
          poster={v.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(circle_at_30%_15%,#1d2240_0%,#0b0b0b_70%)]">
          <span
            className="absolute left-[9%] top-[7%] font-medium uppercase tracking-[0.3em] text-white/25"
            style={{ fontSize: Math.max(7, W * 0.04) }}
          >
            Coming soon
          </span>
        </div>
      )}

      {/* bottom caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-[9%] pt-[30%]">
        <p className="truncate font-medium uppercase tracking-[0.25em] text-white/55" style={{ fontSize: Math.max(8, W * 0.045) }}>
          {v.client}
        </p>
        <p className="mt-1 truncate font-display font-black leading-tight" style={{ fontSize: Math.max(10, W * 0.085) }}>
          {v.title}
        </p>
      </div>

      {/* play button grows on the picked card */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <span
          className={`grid place-items-center rounded-full transition-all duration-500 ${
            active ? "chrome-bg scale-100 text-black" : "scale-75 bg-white/10 text-white/70 backdrop-blur-sm"
          }`}
          style={{ width: Math.max(30, W * 0.26), height: Math.max(30, W * 0.26) }}
        >
          <Play className="ml-[8%] h-[40%] w-[40%]" fill="currentColor" />
        </span>
      </div>
    </div>
  );
}

/** Full-screen player. */
function Player({ v, onClose }: { v: Video; onClose: () => void }) {
  useEffect(() => {
    const lenis = window.__lenis;
    lenis?.stop();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", key);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 md:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={v.title}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white hover:text-black md:right-8 md:top-8"
      >
        <X className="h-5 w-5" />
      </button>
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-full flex-col items-center"
      >
        {v.src ? (
          <video src={v.src} poster={v.poster} controls autoPlay playsInline className="max-h-[80vh] max-w-full rounded-2xl bg-black" />
        ) : (
          <div className="grid aspect-[9/16] h-[70vh] max-w-full place-items-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_15%,#1d2240_0%,#0b0b0b_70%)] text-center text-white/40">
            <div>
              <Film className="mx-auto h-10 w-10" strokeWidth={1.3} />
              <p className="mt-4 text-xs uppercase tracking-[0.35em]">Video coming soon</p>
            </div>
          </div>
        )}
        <p className="mt-4 text-center">
          <span className="block text-[10px] uppercase tracking-[0.35em] text-white/45">{v.client}</span>
          <span className="font-display text-xl font-black text-white md:text-2xl">{v.title}</span>
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export function Showreel() {
  const { W, step, tilt, phone } = useHandSize();
  const handRef = useRef<HTMLUListElement>(null);
  const [still, setStill] = useState(() => window.matchMedia(STILL_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(STILL_QUERY);
    const on = () => setStill(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const inView = useInView(handRef, { once: true, amount: 0.25 });
  const open = still || inView;
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setSettled(true), 1300);
    return () => clearTimeout(t);
  }, [open]);

  const [hovered, setHovered] = useState<number | null>(null);
  const picked = still ? null : hovered;
  const [playing, setPlaying] = useState<number | null>(null);
  const close = useCallback(() => setPlaying(null), []);

  const n = videos.length;
  const H = Math.round(W * RATIO);
  const mid = (n - 1) / 2;
  const SPREAD = W * step;
  // An arch instead of a dip: the middle card stands tallest, the outer cards fall away.
  const DROP = W * (phone ? 0.05 : 0.07);
  const LIFT = still ? 0 : W * 0.45;

  return (
    <section
      id="videos"
      aria-labelledby="videos-title"
      className="relative overflow-hidden bg-[#050505] px-6 pt-32 pb-16 text-white md:pt-44"
    >
      {/* giant outlined word drifting behind the hand */}
      <motion.div
        aria-hidden
        className="text-outline font-band pointer-events-none absolute left-0 top-[46%] whitespace-nowrap text-[22vw] uppercase leading-none text-white/[0.06]"
        initial={{ x: "0%" }}
        whileInView={{ x: "-18%" }}
        viewport={{ once: false }}
        transition={{ duration: 18, ease: "linear" }}
      >
        Showreel · Showreel
      </motion.div>
      {/* soft blue light under the hand */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[62%] h-[44rem] w-[60rem] max-w-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(38,65,255,0.16), rgba(38,65,255,0.05) 55%, transparent)" }}
      />

      <div className="relative mx-auto max-w-6xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/50">Showreel / 02b</p>
        <h2
          id="videos-title"
          className="font-display text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-tight"
        >
          Press play
          <span className="block font-light normal-case italic text-white/60">on our work</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-white/50">
          {still ? "Tap a reel to watch it." : "Hover a reel for a preview, click to watch it full screen."}
        </p>
      </div>

      {/* the hand of reels */}
      <ul
        ref={handRef}
        className="relative mx-auto mt-10 md:mt-24"
        style={{ height: LIFT + H + DROP * mid * mid + 24 }}
        aria-label="Videos"
        onMouseLeave={() => setHovered(null)}
      >
        {videos.map((v, i) => {
          const k = i - mid;
          const isPicked = picked === i;
          const away =
            picked === null || isPicked ? 0 : Math.sign(i - picked) * W * (Math.abs(i - picked) === 1 ? 0.26 : 0.14);
          const x = k * SPREAD + away;
          const y = isPicked ? -LIFT : k * k * DROP + (picked !== null && !isPicked ? 12 : 0);
          const rotate = isPicked ? 0 : k * tilt;
          const scale = isPicked ? 1.16 : 1;
          return (
            <motion.li
              key={i}
              className="absolute left-1/2 cursor-pointer"
              style={{
                top: LIFT,
                width: W,
                height: H,
                marginLeft: -W / 2,
                zIndex: isPicked ? 50 : 10 - Math.round(Math.abs(k) * 2),
                transformOrigin: "50% 100%",
              }}
              // dealt from a face-down pile in the middle, flipping over as they spread
              initial={still ? false : { x: 0, y: 80, rotate: 0, rotateY: 180, opacity: 0, scale: 0.85 }}
              animate={open ? { x, y, rotate, rotateY: 0, scale, opacity: 1 } : undefined}
              transition={
                settled
                  ? { type: "spring", stiffness: 260, damping: 22 }
                  : { duration: 1, delay: 0.1 + Math.abs(k) * 0.08, ease: EASE }
              }
              onMouseEnter={still ? undefined : () => setHovered(i)}
              onClick={() => setPlaying(i)}
            >
              <button
                type="button"
                aria-label={`Play ${v.title}`}
                className={`relative block h-full w-full overflow-hidden border text-left text-white transition-[border-color,box-shadow,filter] duration-300 ${
                  isPicked
                    ? "border-[#2641FF]/70 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.95),0_0_34px_-10px_rgba(38,65,255,0.35)]"
                    : "border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
                } ${picked !== null && !isPicked ? "brightness-[.55]" : ""}`}
                style={{ borderRadius: W * 0.14 }}
              >
                <ReelCard v={v} i={i} active={isPicked} W={W} />
                {/* glint as the card is picked */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out ${
                    isPicked ? "translate-x-[320%]" : "translate-x-0"
                  }`}
                />
              </button>
            </motion.li>
          );
        })}
      </ul>

      <div className="relative z-20 mt-10 flex justify-center md:mt-14">
        <GlowButton type="button" onClick={() => setPlaying(Math.floor(mid))}>
          <Play className="mr-2 h-4 w-4" fill="currentColor" aria-hidden />
          Play the showreel
        </GlowButton>
      </div>

      <AnimatePresence>
        {playing !== null && <Player key={playing} v={videos[playing]} onClose={close} />}
      </AnimatePresence>
    </section>
  );
}
