import { useLayoutEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";
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
  "videography-photography": `${base}showcase/t05.webp`,
  "meta-ads": pf("Creative Campaign + Social Media", "Purplecurve_Static01_022026 copy.webp"),
  "website-design-development": pf("E-Commerce Store + Website", "Lspace Website copy.webp"),
};

const THEMES = [
  "chrome-bg text-black",
  "bg-white text-black",
  "bg-neutral-950 text-white ring-1 ring-white/15",
];

function ServiceCard({ index, lean }: { index: number; lean: MotionValue<number> }) {
  const s = services[index];
  const Icon = s.icon;
  return (
    <motion.article
      style={{ skewX: lean, rotate: index % 2 ? 1.5 : -1.5 }}
      className={`group relative flex h-[70svh] w-[82vw] shrink-0 flex-col overflow-hidden rounded-[2rem] sm:w-[60vw] lg:w-[34vw] ${
        THEMES[index % 3]
      }`}
    >
      <Link
        to={s.path}
        data-cursor="Open"
        className="absolute inset-0 z-20"
        aria-label={`${s.title}: ${s.cta}`}
      />
      <div className="relative h-[52%] overflow-hidden">
        <img
          src={IMAGES[s.slug]}
          alt=""
          loading="lazy"
          draggable={false}
          className="h-full w-full scale-110 object-cover grayscale transition-all duration-700 ease-out group-hover:scale-100 group-hover:grayscale-0"
        />
        <span className="absolute left-5 top-4 font-display text-[5.5rem] font-black leading-none text-white mix-blend-difference md:text-[7rem]">
          0{index + 1}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between p-6 md:p-8">
        <div>
          <Icon className="mb-4 h-6 w-6" strokeWidth={1.6} />
          <h3 className="font-display text-3xl font-black leading-[0.95] tracking-tight md:text-4xl">{s.title}</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed opacity-70">{s.desc}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]">
          {s.cta}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </span>
      </div>
    </motion.article>
  );
}

/**
 * The page turns sideways: vertical scrolling drives a horizontal track of
 * service cards. The cards lean into the direction of travel.
 */
export function WildServices() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dist = useMotionValue(0);

  useLayoutEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      const s = sectionRef.current;
      if (!t || !s) return;
      const d = Math.max(0, t.scrollWidth - window.innerWidth);
      dist.set(d);
      s.style.height = `${d + window.innerHeight}px`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [dist]);

  const { scrollYProgress: p, scrollY } = useJsScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(() => -p.get() * dist.get());
  const bgX = useTransform(p, [0, 1], ["0%", "-40%"]);
  const velocity = useVelocity(scrollY);
  const lean = useSpring(useTransform(velocity, [-3000, 3000], [10, -10]), { stiffness: 200, damping: 30 });
  const progressBar = useTransform(p, [0, 1], [0, 1]);

  return (
    <section id="services" ref={sectionRef} className="relative bg-black text-white" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* giant outlined word drifting behind */}
        <motion.div
          aria-hidden
          style={{ x: bgX }}
          className="text-outline pointer-events-none absolute bottom-[-4vw] left-0 whitespace-nowrap font-display text-[28vw] font-black uppercase leading-none text-white/10"
        >
          disciplines disciplines
        </motion.div>

        <motion.div ref={trackRef} style={{ x }} className="relative flex h-full w-max items-center gap-8 px-6 md:gap-12 md:px-16">
          <div className="flex w-[82vw] shrink-0 flex-col justify-center sm:w-[60vw] lg:w-[40vw]">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-white/50">What We Do / 02</p>
            <h2 className="font-display text-[clamp(2.6rem,6vw,6rem)] font-black leading-[0.9] tracking-tight">
              Six disciplines.
              <br />
              One creative <span className="chrome-text pr-[0.08em] font-light italic">engine.</span>
            </h2>
            <p className="mt-8 flex items-center gap-3 text-sm text-white/60">
              <motion.span
                animate={{ x: [0, 12, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="chrome-text text-2xl"
              >
                →
              </motion.span>
              keep scrolling down. yes, down. it goes sideways now.
            </p>
          </div>

          {services.map((_, i) => (
            <ServiceCard key={services[i].slug} index={i} lean={lean} />
          ))}

          <div className="flex w-[82vw] shrink-0 flex-col justify-center sm:w-[60vw] lg:w-[36vw]">
            <h3 className="font-display text-[clamp(2.4rem,5vw,5rem)] font-black leading-[0.9] tracking-tight">
              That's all six.
              <br />
              <span className="font-light italic text-white/60">Yes, we do it all.</span>
            </h3>
            <a
              href="#contact"
              data-cursor="Hi!"
              className="mt-10 inline-flex w-fit items-center gap-3 chrome-bg rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition-transform hover:-rotate-3 hover:scale-105"
            >
              Pick one, or all <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </motion.div>

        {/* progress rail */}
        <div className="absolute bottom-6 left-6 right-6 h-px bg-white/15 md:left-16 md:right-16">
          <motion.div style={{ scaleX: progressBar }} className="neon-line h-full origin-left" />
        </div>
      </div>
    </section>
  );
}

/** Two big crossing bands of services that react to scroll speed. */
export function ServiceBands() {
  const words = ["Branding", "Content", "Social", "Film", "Photo", "Meta Ads", "Websites", "Strategy"];
  return (
    <section aria-hidden className="relative overflow-hidden bg-black py-20 md:py-28">
      <div className="-rotate-[4deg] scale-110 chrome-bg py-3 text-black">
        <VelocityMarquee baseVelocity={2.2}>
          {words.map((w) => (
            <span key={w} className="flex items-center font-display text-5xl font-black uppercase tracking-tight md:text-8xl">
              <span className="px-6">{w}</span>
              <span className="text-4xl md:text-6xl">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
      <div className="mt-6 rotate-[3deg] scale-110 border-y border-white/20 py-3 text-white">
        <VelocityMarquee baseVelocity={-1.8}>
          {words.map((w) => (
            <span key={w} className="flex items-center font-display text-5xl font-black uppercase tracking-tight md:text-8xl">
              <span className="text-outline px-6">{w}</span>
              <span className="chrome-text text-4xl md:text-6xl">✱</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}
