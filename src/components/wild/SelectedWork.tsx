import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowDown } from "lucide-react";

const base = import.meta.env.BASE_URL;
const pf = (folder: string, file: string) => encodeURI(`${base}portfolio/${folder}/${file}`);
const SOCIAL = "Creative Campaign + Social Media";
const WEB = "E-Commerce Store + Website";
const BANNERS = "Website Banners + Assets";
const BRAND = "Branding + Presentation";

type Project = {
  client: string;
  tags: string[];
  images: string[];
  /** grid placement classes for phone / desktop */
  area: string;
  big?: boolean;
};

/** Real client work from /public/portfolio. Each tile cycles through that client's pieces. */
const PROJECTS: Project[] = [
  {
    client: "Lspace",
    tags: ["Website", "Social media", "Content"],
    big: true,
    area: "col-span-2 lg:col-span-2 lg:row-span-2",
    images: [
      pf(WEB, "Lspace Website copy.webp"),
      pf(SOCIAL, "Lspace_Carousel03_052026_Slide1 copy.webp"),
      pf(SOCIAL, "Lspace_Static01_052026 copy.webp"),
      pf(SOCIAL, "Lspace_Carousel04_052026_Slide1 copy.webp"),
      pf(SOCIAL, "Lspace_Carousel02_052026_Slide01 copy.webp"),
      pf(BRAND, "b1 copy.webp"),
    ],
  },
  {
    client: "Cloud Apparels",
    tags: ["Branding", "Packaging", "Website", "Social"],
    area: "lg:col-span-2",
    images: [
      pf(BANNERS, "Banner 1 - Slide 1 copy.webp"),
      pf(BRAND, "Copy of mockup 2 copy.webp"),
      pf(BANNERS, "Banner 2 - Slide 1 copy.webp"),
      pf(BRAND, "Copy of Cloud Box packaging 11 copy.webp"),
      pf(SOCIAL, "Copy of Cloudapparels_Static01_012026 copy.webp"),
      pf(BANNERS, "Banner 3 - Slide 1 copy.webp"),
    ],
  },
  {
    client: "Cricketeria",
    tags: ["E-commerce", "Web banners", "Merch"],
    area: "",
    images: [
      pf(BANNERS, "Main_hero_mobile_banner_slide1 copy.webp"),
      pf(WEB, "Cricketeria Website copy.webp"),
      pf(BANNERS, "Bats_mobile_Home_Screen_banner copy.webp"),
      pf(BRAND, "cricketeria_hoodies_8MP_6x7_300PPI.webp"),
      pf(BRAND, "b9 copy.webp"),
    ],
  },
  {
    client: "Purple Curve",
    tags: ["Social media", "Meta ads"],
    area: "",
    images: [
      pf(SOCIAL, "Purplecurve_Carousel01_042026_Slide01 copy.webp"),
      pf(SOCIAL, "Purplecurve_Carousel05_032026_Slide1 copy.webp"),
      pf(SOCIAL, "Purplecurve_Carousel03_032026_slide1 copy.webp"),
      pf(SOCIAL, "Purplecurve_Carousel06_042026_Slide01 copy.webp"),
    ],
  },
  {
    client: "Identity systems",
    tags: ["Logos", "Brand guidelines"],
    area: "",
    images: ["b5", "b2", "b9", "b3", "b1", "b6"].map((b) => pf(BRAND, `${b} copy.webp`)),
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Cycles through a client's pieces: each new one wipes in over the last. */
function Slides({ images, interval, offset, running }: { images: string[]; interval: number; offset: number; running: boolean }) {
  const [i, setI] = useState(0);
  const ready = useRef<Set<number>>(new Set([0]));

  // fetch + decode every piece up front, so a wipe never reveals an empty (black) frame
  useEffect(() => {
    if (!running) return;
    images.forEach((src, k) => {
      if (ready.current.has(k)) return;
      const img = new Image();
      img.src = src;
      img
        .decode()
        .then(() => ready.current.add(k))
        .catch(() => {});
    });
  }, [running, images]);

  useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // move on only when the next piece is ready; otherwise wait for the next tick
    const advance = () =>
      setI((v) => {
        const next = (v + 1) % images.length;
        return ready.current.has(next) ? next : v;
      });
    let t: number;
    const start = window.setTimeout(() => {
      advance();
      t = window.setInterval(advance, interval);
    }, offset);
    return () => {
      clearTimeout(start);
      clearInterval(t);
    };
  }, [running, images.length, interval, offset]);

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.img
          key={i}
          src={images[i]}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          initial={{ clipPath: "inset(0 0 0 100%)", scale: 1.15 }}
          animate={{ clipPath: "inset(0 0 0 0%)", scale: 1 }}
          exit={{ opacity: 1, transition: { duration: 1 } }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
        />
      </AnimatePresence>
      {/* how long until the next piece */}
      <div className="absolute inset-x-4 bottom-3 z-10 flex gap-1 md:inset-x-5">
        {images.map((_, k) => (
          <span key={k} className="h-[2px] flex-1 overflow-hidden rounded-full bg-white/25">
            <span
              key={k === i ? `on-${i}` : "off"}
              className="block h-full origin-left bg-[#b8ff2e]"
              style={{
                transform: k < i ? "scaleX(1)" : "scaleX(0)",
                animation: k === i && running ? `work-bar ${k === 0 && i === 0 ? offset : interval}ms linear forwards` : undefined,
              }}
            />
          </span>
        ))}
      </div>
    </>
  );
}

function Tile({ p, index, show }: { p: Project; index: number; show: boolean }) {
  return (
    <motion.div
      initial={{ clipPath: "inset(100% 0 0 0 round 24px)", y: 40 }}
      animate={show ? { clipPath: "inset(0% 0 0 0 round 24px)", y: 0 } : undefined}
      transition={{ duration: 1.1, delay: 0.15 + index * 0.1, ease: EASE }}
      className={`relative min-h-0 overflow-hidden rounded-2xl bg-neutral-900 md:rounded-3xl ${p.area}`}
    >
      <Slides images={p.images} interval={p.big ? 3200 : 2700 + index * 230} offset={1400 + index * 520} running={show} />

      {/* legibility gradient + client name */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-black/15 to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 md:p-5">
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t, k) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, y: -8 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.7 + index * 0.1 + k * 0.06 }}
              className={`rounded-full border border-white/25 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-md ${
                p.big ? "" : k === 1 ? "hidden md:inline" : k > 1 ? "hidden xl:inline" : ""
              }`}
            >
              {t}
            </motion.span>
          ))}
        </div>
        <span className="font-display text-xs font-bold text-white/60 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-4 pb-6 md:p-5 md:pb-7">
        <h3
          className={`font-display font-black leading-[0.9] tracking-tight text-white ${
            p.big ? "text-[clamp(2rem,5vw,4.75rem)]" : "text-[clamp(1.15rem,2.2vw,2rem)]"
          }`}
        >
          {p.client}
        </h3>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">{p.images.length} pieces shown</p>
      </div>

    </motion.div>
  );
}

/**
 * Selected projects, from a client's point of view: one screen, no scroll
 * journey. Real clients as tiles, each quietly cycling through the work we
 * made for them. The tiles are display only; the lime tile leads to the archive.
 */
export function SelectedWork() {
  const ref = useRef<HTMLElement>(null);
  const show = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      id="work"
      ref={ref}
      className="relative flex h-svh min-h-[640px] flex-col overflow-hidden bg-black px-4 pb-5 pt-24 text-white md:px-10 md:pb-8 md:pt-28 lg:px-16"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-2 md:mb-6">
        <div>
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={show ? { opacity: 1, letterSpacing: "0.4em" } : undefined}
            transition={{ duration: 1, ease: EASE }}
            className="mb-2 text-[10px] font-medium uppercase text-white/50 md:mb-3 md:text-xs"
          >
            Featured Work / 02
          </motion.p>
          <h2 className="font-display text-[clamp(1.9rem,4.2vw,4rem)] font-black leading-[0.95] tracking-tight">
            {["Selected", "projects."].map((w, i) => (
              <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className={"inline-block " + (i === 1 ? "chrome-text pr-[0.08em] font-light italic" : "")}
                  initial={{ y: "110%" }}
                  animate={show ? { y: "0%" } : undefined}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
                >
                  {w}
                  {i === 0 ? " " : ""}
                </motion.span>
              </span>
            ))}
          </h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={show ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
          className="hidden max-w-xs text-sm leading-relaxed text-white/60 md:block"
        >
          Real brands, real work. Each tile plays through what we made for that client.
        </motion.p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[1.35fr_1fr_1fr_auto] gap-2.5 md:gap-4 lg:grid-cols-5 lg:grid-rows-2">
        {PROJECTS.map((p, i) => (
          <Tile key={p.client} p={p} index={i} show={show} />
        ))}

        {/* the rest of the work lives in the archive just below */}
        <motion.a
          href="#archive"
          initial={{ clipPath: "inset(100% 0 0 0 round 24px)", y: 40 }}
          animate={show ? { clipPath: "inset(0% 0 0 0 round 24px)", y: 0 } : undefined}
          transition={{ duration: 1.1, delay: 0.15 + PROJECTS.length * 0.1, ease: EASE }}
          className="chrome-bg group col-span-2 flex min-h-0 items-center justify-between gap-4 rounded-2xl p-4 text-black md:rounded-3xl md:p-5 lg:col-span-1 lg:flex-col lg:items-start"
        >
          <p className="font-display text-base font-black leading-tight md:text-xl lg:text-[clamp(1.2rem,1.9vw,1.8rem)]">
            Just a few of the <span className="italic font-light">40+ brands</span> we work with.
          </p>
          <span className="inline-flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
            Full archive
            <span className="grid size-9 place-items-center rounded-full bg-black text-[#b8ff2e] transition-transform duration-300 group-hover:translate-y-1">
              <ArrowDown className="size-4" />
            </span>
          </span>
        </motion.a>
      </div>
    </section>
  );
}
