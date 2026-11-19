import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Instagram, ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

const INSTAGRAM_URL = "https://www.instagram.com/shaffedits/";

// Seven photo cards, fanned out like a hand of cards. To add a real photo,
// import it at the top of this file (e.g. `import post1 from "@/assets/socials/post-1.jpg";`)
// and set `image: post1`. Cards without an image show a placeholder.
const posts: { image?: string; alt: string }[] = [
  { alt: "Instagram post 1" },
  { alt: "Instagram post 2" },
  { alt: "Instagram post 3" },
  { alt: "Instagram post 4" },
  { alt: "Instagram post 5" },
  { alt: "Instagram post 6" },
  { alt: "Instagram post 7" },
];

// Card height / width — tall, phone-story shaped cards like an Instagram reel.
const RATIO = 1.7;
const EASE = [0.22, 1, 0.36, 1] as const;
/** Phones and other touch screens: no fan animations. */
const STILL_QUERY = "(max-width: 767px), (hover: none)";

/** Card width and spacing that keep the whole fan well inside the screen edges. */
function useFanSize() {
  const calc = () => {
    const vw = window.innerWidth;
    const phone = vw < 640;
    // the fan may use at most ~84% of the screen (max 1100px), leaving room on both sides
    const room = Math.min(vw * (phone ? 0.86 : 0.84), 1100);
    const step = phone ? 0.42 : 0.6; // horizontal step between cards, as a share of card width
    const tilt = phone ? 4 : 6; // degrees per step out from the middle
    // Outer cards pivot at their bottom centre, so a tilted card reaches out by
    // half its width plus its height x sin(tilt). Total fan width in card widths:
    const n = posts.length;
    const outer = (3 * tilt * Math.PI) / 180; // tilt of the outermost card
    const span = (n - 1) * step + Math.cos(outer) + 2 * RATIO * Math.sin(outer);
    const W = Math.round(Math.min(230, Math.max(64, room / span)));
    return { W, step, tilt };
  };
  const [s, setS] = useState(calc);
  useEffect(() => {
    const on = () => setS(calc());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return s;
}

export function Socials() {
  const { W, step, tilt } = useFanSize();
  const fanRef = useRef<HTMLUListElement>(null);
  // Phones get the fan as a still picture: no opening animation and no pick-out.
  const [still, setStill] = useState(() => window.matchMedia(STILL_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(STILL_QUERY);
    const on = () => setStill(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  // The fan opens once it scrolls into view.
  const inView = useInView(fanRef, { once: true, amount: 0.25 });
  const open = still || inView;
  // After the opening deal, cards react with a springy feel.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setSettled(true), 1200);
    return () => clearTimeout(t);
  }, [open]);
  // The card being "picked" out of the hand (hover, desktop only).
  const [hovered, setPicked] = useState<number | null>(null);
  const picked = still ? null : hovered;

  const H = Math.round(W * RATIO);
  const mid = (posts.length - 1) / 2;
  const SPREAD = W * step; // horizontal step between card centres
  const TILT = tilt; // degrees of rotation per step out from the middle
  const DROP = W * 0.06; // how much lower each card sits, growing outwards
  const LIFT = still ? 0 : W * 0.5; // how far a picked card rises out of the hand (room kept above the fan)

  return (
    <section
      id="socials"
      aria-labelledby="socials-title"
      className="relative overflow-hidden bg-[#050505] px-6 pt-32 pb-12 text-white md:pt-44"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/50">
          On the Feed / 02c
        </p>
        <h2
          id="socials-title"
          className="font-display text-[clamp(2.2rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-tight"
        >
          Check us out
          <span className="block italic font-light normal-case text-white/60">on socials</span>
        </h2>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="chrome-text mt-6 inline-flex items-center gap-2 text-sm font-semibold tracking-wide"
        >
          @shaffedits <ArrowUpRight className="h-4 w-4 text-white/60" aria-hidden />
        </a>
      </div>

      {/* The fan */}
      <ul
        ref={fanRef}
        className="relative mx-auto mt-10 md:mt-14"
        style={{ height: LIFT + H + DROP * mid * mid + 24 }}
        aria-label="Latest Instagram posts"
        onMouseLeave={() => setPicked(null)}
      >
        {posts.map((post, i) => {
          const k = i - mid; // -3 … 3
          const isPicked = picked === i;
          // neighbours lean away from the picked card to make room
          const away = picked === null || isPicked ? 0 : Math.sign(i - picked) * W * (Math.abs(i - picked) === 1 ? 0.22 : 0.12);
          const x = k * SPREAD + away;
          const y = isPicked ? -LIFT : k * k * DROP + (picked !== null && !isPicked ? 10 : 0);
          const rotate = isPicked ? 0 : k * TILT;
          const scale = isPicked ? 1.14 : 1;
          return (
            <motion.li
              key={i}
              className={`absolute left-1/2 ${still ? "" : "cursor-pointer"}`}
              style={{
                top: LIFT,
                width: W,
                height: H,
                marginLeft: -W / 2,
                zIndex: isPicked ? 50 : 10 - Math.round(Math.abs(k) * 2),
                transformOrigin: "50% 100%",
              }}
              initial={still ? false : { x: 0, y: 60, rotate: 0, opacity: 0 }}
              animate={open ? { x, y, rotate, scale, opacity: 1 } : undefined}
              transition={
                settled
                  ? { type: "spring", stiffness: 260, damping: 22 }
                  : { duration: 0.9, delay: Math.abs(k) * 0.06, ease: EASE }
              }
              onMouseEnter={still ? undefined : () => setPicked(i)}
            >
              <div
                className={`relative h-full w-full overflow-hidden border bg-[#0d0d0d] transition-[border-color,box-shadow,filter] duration-300 ${
                  isPicked
                    ? "border-[#AEFF00]/70 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.95),0_0_40px_-6px_rgba(174,255,0,0.45)]"
                    : "border-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
                } ${picked !== null && !isPicked ? "brightness-[.6]" : ""}`}
                style={{ borderRadius: W * 0.16 }}
              >
                {post.image ? (
                  <img src={post.image} alt={post.alt} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_15%,#262626_0%,#0b0b0b_70%)] text-white/25">
                    <Instagram className="h-6 w-6 md:h-9 md:w-9" aria-hidden />
                    <span className="text-[8px] uppercase tracking-[0.35em] md:text-[10px]">
                      Photo {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
                {/* a glint sweeps across the card as it's picked */}
                <span
                  aria-hidden
                  className={`pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out ${
                    isPicked ? "translate-x-[320%]" : "translate-x-0"
                  }`}
                />
              </div>
            </motion.li>
          );
        })}
      </ul>

      <div className="relative z-20 mt-10 flex justify-center md:mt-14">
        <GlowButton as="a" href={INSTAGRAM_URL}>
          <Instagram className="h-4 w-4" aria-hidden />
          Follow us on Instagram
        </GlowButton>
      </div>
    </section>
  );
}
