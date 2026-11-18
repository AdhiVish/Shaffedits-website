import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Instagram, ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";

const INSTAGRAM_URL = "https://www.instagram.com/shaffedits/";

// Six photo cards, fanned out in an arc. To add a real photo, import it at the
// top of this file (e.g. `import post1 from "@/assets/socials/post-1.jpg";`)
// and set `image: post1`. Cards without an image show a placeholder.
const posts: { image?: string; alt: string }[] = [
  { alt: "Instagram post 1" },
  { alt: "Instagram post 2" },
  { alt: "Instagram post 3" },
  { alt: "Instagram post 4" },
  { alt: "Instagram post 5" },
  { alt: "Instagram post 6" },
];

// Card height / width — tall, phone-story shaped cards like an Instagram reel.
const RATIO = 1.7;

export function Socials() {
  const [W, setW] = useState(260);
  const fanRef = useRef<HTMLUListElement>(null);
  // The fan opens once it scrolls into view.
  const open = useInView(fanRef, { once: true, amount: 0.25 });

  // Card size follows the screen so the whole fan always fits across.
  useEffect(() => {
    const fit = () => setW(Math.round(Math.min(300, Math.max(108, window.innerWidth / 5.6))));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const H = Math.round(W * RATIO);
  const mid = (posts.length - 1) / 2;
  const SPREAD = W * 0.74; // horizontal step between card centres
  const TILT = 7; // degrees of rotation per step out from the middle
  const DROP = W * 0.07; // how much lower each card sits, growing outwards

  return (
    <section
      id="socials"
      aria-labelledby="socials-title"
      className="relative overflow-hidden bg-[#050505] px-6 pt-32 pb-12 text-white md:pt-44"
    >
      <div className="mx-auto max-w-6xl text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/50">
          On the Feed / 03c
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
        className="relative mx-auto mt-14 md:mt-20"
        style={{ height: H + DROP * mid * mid + 24 }}
        aria-label="Latest Instagram posts"
      >
        {posts.map((post, i) => {
          const k = i - mid; // -2.5 … 2.5
          const x = k * SPREAD;
          const y = k * k * DROP;
          const rotate = k * TILT;
          return (
            <motion.li
              key={i}
              className="absolute left-1/2 top-0"
              style={{
                width: W,
                height: H,
                marginLeft: -W / 2,
                zIndex: 10 - Math.round(Math.abs(k) * 2),
                transformOrigin: "50% 100%",
              }}
              initial={{ x: 0, y: 60, rotate: 0, opacity: 0 }}
              animate={open ? { x, y, rotate, opacity: 1 } : undefined}
              transition={{ duration: 0.9, delay: Math.abs(k) * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                whileHover={{ y: -18 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="h-full w-full overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0d0d0d] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] md:rounded-[2.8rem]"
                style={{ borderRadius: W * 0.16 }}
              >
                {post.image ? (
                  <img src={post.image} alt={post.alt} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_15%,#262626_0%,#0b0b0b_70%)] text-white/25">
                    <Instagram className="h-7 w-7 md:h-10 md:w-10" aria-hidden />
                    <span className="text-[9px] uppercase tracking-[0.35em] md:text-[10px]">
                      Photo {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </motion.div>
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
