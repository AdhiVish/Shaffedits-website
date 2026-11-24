import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { VelocityMarquee } from "./VelocityMarquee";

const base = import.meta.env.BASE_URL;
const pf = (folder: string, file: string) => `${base}portfolio/${folder}/${file}`;

const IMAGES: Record<string, string> = {
  "branding-design": pf("Branding + Presentation", "b13 copy.webp"),
  "content-creation-animation": `${base}showcase/t01.webp`,
  "social-media-management": pf("Creative Campaign + Social Media", "Lspace_Carousel01_062026_Slide1 copy.webp"),
  "meta-ads": pf("Creative Campaign + Social Media", "Purplecurve_Static01_022026 copy.webp"),
  "website-design-development": pf("E-Commerce Store + Website", "Lspace Website copy.webp"),
  "technical-graphics-animation": `${base}showcase/t05.webp`,
};

/**
 * Card covers stay black and white, alternating: 1 black, 2 white, 3 black…
 * On hover the text picks up the accent: lime on the black cards, blue on the white ones.
 */
const THEME_CLS = [
  "svc-dark bg-black text-white ring-1 ring-white/15",
  "svc-light bg-white text-black",
] as const;
/** How far each card is turned while it sits in the deck before being dealt. */
const DECK_TILT = [-14, 9, -6, 12, -10, 7];

const EASE = [0.16, 1, 0.3, 1] as const;

function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

function ServiceCard({ index, dealt, cols }: { index: number; dealt: boolean; cols: 2 | 3 }) {
  const s = services[index];
  const Icon = s.icon;
  const ref = useRef<HTMLElement>(null);
  const still = useMedia("(prefers-reduced-motion: reduce)");

  // Where this card sits relative to the middle of the grid: the deck it is dealt from.
  const rows = 6 / cols;
  const dx = ((cols - 1) / 2 - (index % cols)) * 104;
  const dy = ((rows - 1) / 2 - Math.floor(index / cols)) * 104;

  // 3D tilt toward the cursor; the cursor position also drives the photo reveal (CSS vars).
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const move = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width;
    const y = (e.clientY - b.top) / b.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    if (still) return;
    ry.set((x - 0.5) * 10);
    rx.set(-(y - 0.5) * 10);
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      initial={still ? { opacity: 0 } : { x: `${dx}%`, y: `${dy}%`, rotate: DECK_TILT[index], scale: 0.82, opacity: 0 }}
      animate={dealt ? { x: "0%", y: "0%", rotate: 0, scale: 1, opacity: 1 } : undefined}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 16,
        delay: 0.25 + (5 - index) * 0.07,
        opacity: { duration: 0.35, delay: index * 0.04 },
      }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, zIndex: 10 - index }}
      className={`svc-card group relative isolate min-h-0 overflow-hidden rounded-2xl transition-[filter] duration-500 group-hover/grid:[filter:brightness(.45)_saturate(.6)] hover:![filter:none] md:rounded-[1.6rem] ${THEME_CLS[index % 2]}`}
    >
      <Link to={s.path} data-cursor="Open" className="absolute inset-0 z-30" aria-label={`${s.title}: ${s.cta}`} />

      {/* photo, revealed in a circle that grows from the cursor */}
      <div className="svc-reveal absolute inset-0 -z-10">
        <img
          src={IMAGES[s.slug]}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full scale-110 object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
      </div>

      {/* a slow shine that sweeps across now and then */}
      <span aria-hidden className="svc-shine pointer-events-none absolute inset-0 -z-[5]" style={{ animationDelay: `${index * 1.3}s` }} />

      <div className="relative flex h-full flex-col justify-between p-4 transition-colors duration-500 group-hover:text-white md:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="svc-num font-display text-[clamp(2.6rem,6.5vh,5.5rem)] font-black leading-[0.8] tracking-tighter">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="svc-acc grid size-9 shrink-0 place-items-center rounded-full border border-current/25 transition-[transform,color] duration-700 group-hover:rotate-[360deg] md:size-11">
            <Icon className="size-4 md:size-5" strokeWidth={1.7} />
          </span>
        </div>

        <div>
          {/* the title rolls up to a neon copy of itself on hover */}
          <h3 className="relative overflow-hidden font-display text-[clamp(1rem,2.1vw,1.9rem)] font-black leading-[1.02] tracking-tight">
            <span className="block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full">
              {s.title}
            </span>
            <span
              aria-hidden
              className="svc-acc absolute inset-0 block translate-y-full transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0"
            >
              {s.title}
            </span>
          </h3>
          <p className="mt-2 line-clamp-2 hidden max-w-sm text-sm leading-snug opacity-70 md:block [@media(max-height:760px)]:hidden">
            {s.desc}
          </p>
          <span className="svc-acc mt-3 hidden items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 sm:inline-flex">
            {s.cta}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/** One heading line whose words rise out of a mask once the section is in view. */
function Rise({ words, show, delay = 0, accent }: { words: string[]; show: boolean; delay?: number; accent?: number }) {
  return (
    <span className="block">
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={"inline-block " + (i === accent ? "chrome-text pr-[0.08em] font-light italic" : "")}
            initial={{ y: "110%" }}
            animate={show ? { y: "0%" } : undefined}
            transition={{ duration: 0.9, delay: delay + i * 0.07, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/**
 * What we do: all six services on one screen, no sideways scrolling.
 * When the section comes into view the cards are dealt out from a stack in
 * the middle; hovering a card tilts it, dims the others and reveals its photo
 * from the cursor.
 */
export function WildServices() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const desktop = useMedia("(min-width: 1024px)");

  return (
    <section
      id="services"
      ref={ref}
      className="relative flex h-svh min-h-[640px] flex-col overflow-hidden bg-black px-4 pb-5 pt-24 text-white md:px-10 md:pb-8 md:pt-28 lg:px-16"
    >
      {/* giant outlined word drifting behind */}
      <motion.div
        aria-hidden
        initial={{ x: "8%" }}
        animate={{ x: "-30%" }}
        transition={{ duration: 40, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        className="text-outline font-band pointer-events-none absolute bottom-[-5vw] left-0 whitespace-nowrap text-[26vw] font-black uppercase leading-none text-white/[0.07]"
      >
        disciplines disciplines
      </motion.div>

      <div className="relative mb-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-3 md:mb-6">
        <div>
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={inView ? { opacity: 1, letterSpacing: "0.4em" } : undefined}
            transition={{ duration: 1, ease: EASE }}
            className="mb-2 text-[10px] font-medium uppercase text-white/50 md:mb-3 md:text-xs"
          >
            What We Do / 01
          </motion.p>
          <h2 className="font-display text-[clamp(1.9rem,4.2vw,4rem)] font-black leading-[0.95] tracking-tight">
            <Rise words={["Six", "disciplines."]} show={inView} />
            <Rise words={["One", "creative", "engine."]} show={inView} delay={0.15} accent={2} />
          </h2>
        </div>
        <motion.a
          href="#contact"
          data-cursor="Hi!"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
          className="chrome-bg hidden w-fit items-center gap-3 rounded-full px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:-rotate-3 hover:scale-105 sm:inline-flex"
        >
          Pick one, or all <ArrowUpRight className="h-4 w-4" />
        </motion.a>
      </div>

      <div className="group/grid relative grid min-h-0 flex-1 grid-cols-2 grid-rows-3 gap-2.5 md:gap-4 lg:grid-cols-3 lg:grid-rows-2">
        {services.map((sv, i) => (
          <ServiceCard key={sv.slug} index={i} dealt={inView} cols={desktop ? 3 : 2} />
        ))}
      </div>
    </section>
  );
}

/** Two big crossing bands of services that react to scroll speed. */
export function ServiceBands() {
  const words = ["Branding", "Content", "Social", "Meta Ads", "Websites", "Technical", "Animation", "Strategy"];
  return (
    <section aria-hidden className="relative overflow-hidden bg-black py-20 md:py-28">
      <div className="-rotate-[4deg] scale-110 chrome-bg py-3 text-black">
        <VelocityMarquee baseVelocity={2.2}>
          {words.map((w) => (
            <span key={w} className="flex items-center font-band text-5xl uppercase md:text-8xl">
              <span className="px-6">{w}</span>
              <span className="text-4xl md:text-6xl">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
      <div className="mt-6 rotate-[3deg] scale-110 border-y border-white/20 py-3 text-white">
        <VelocityMarquee baseVelocity={-1.8}>
          {words.map((w) => (
            <span key={w} className="flex items-center font-band text-5xl uppercase md:text-8xl">
              <span className="text-outline px-6">{w}</span>
              <span className="chrome-text text-4xl md:text-6xl">✱</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}
