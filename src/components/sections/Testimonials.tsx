import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

// PLACEHOLDER testimonials — replace with real client quotes when available.
const items = [
  {
    quote:
      "Shaffedits redefined how our brand shows up online. The creative was sharp, the strategy was thoughtful, and the results spoke for themselves.",
    name: "Priya S.",
    role: "Founder, Cloud Apparels",
  },
  {
    quote:
      "From the first call, they felt like an extension of our team. Every deliverable was on brand and on business.",
    name: "Rahul M.",
    role: "Lead, Lspace",
  },
  {
    quote:
      "They took our messy vision and shipped a brand system we could actually scale. The content engine they built keeps paying off.",
    name: "Ayesha K.",
    role: "CEO, Purple Curve",
  },
  {
    quote:
      "Editorial quality creative with a focus on performance — rare combo. Our CAC dropped and our brand equity grew.",
    name: "Daniel T.",
    role: "Growth Director, Untangle",
  },
];

/** How long each review stays up before the slideshow moves on. */
const SLIDE_MS = 6000;

export function Testimonials() {
  const [i, setI] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const running = inView && !hovered && !tabHidden && !still;

  const next = () => setI((v) => (v + 1) % items.length);
  const prev = () => setI((v) => (v - 1 + items.length) % items.length);
  const t = items[i];

  // Slideshow: move on by itself. Any change of slide (auto or arrows/dots) restarts the timer;
  // it pauses while the review text is hovered, off screen, or when the tab is in the background.
  // Time left on the current slide survives a pause, so it stays in step with the filling dot.
  const left = useRef(SLIDE_MS);
  useEffect(() => {
    left.current = SLIDE_MS; // a new slide always gets the full time
  }, [i]);
  useEffect(() => {
    if (!running) return;
    const started = performance.now();
    const timer = window.setTimeout(next, left.current);
    return () => {
      clearTimeout(timer);
      left.current = Math.max(0, left.current - (performance.now() - started));
    };
  }, [i, running]);
  useEffect(() => {
    const on = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  return (
    <section
      ref={ref}
      className="bg-black px-6 py-28 text-white md:py-40"
    >
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.4em] text-[#2641FF]">
          Client Reviews / 05
        </p>
        <span className="chrome-bg mx-auto mb-8 grid size-14 place-items-center rounded-full">
          <Quote className="h-6 w-6 fill-current" strokeWidth={1.5} />
        </span>
        {/* only hovering the review itself pauses it (the section fills the screen, so a resting cursor would always pause it) */}
        <div className="relative min-h-55" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="font-display text-2xl font-medium leading-snug tracking-tight md:text-4xl"
            >
              "{t.quote}"
              <footer className="mt-10 text-sm font-normal not-italic text-white/60">
                <span className="mx-auto mb-5 block h-px w-12 bg-[#2641FF]" />
                <span className="font-semibold text-[#2641FF]">{t.name}</span> · {t.role}
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            aria-label="Previous testimonial"
            onClick={prev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#2641FF] hover:bg-[#2641FF] hover:text-[#AEFF00]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Go to review ${idx + 1}`}
                aria-current={idx === i ? "true" : undefined}
                onClick={() => setI(idx)}
                className={`relative h-1.5 overflow-hidden rounded-full transition-all ${idx === i ? "w-10 bg-white/25" : "w-2 bg-white/30"}`}
              >
                {/* the active dot fills up until the next review */}
                {idx === i && (
                  <span
                    key={i}
                    className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[#2641FF]"
                    style={{
                      animation: still ? undefined : `review-fill ${SLIDE_MS}ms linear forwards`,
                      animationPlayState: running ? "running" : "paused",
                      transform: still ? "scaleX(1)" : undefined,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            aria-label="Next testimonial"
            onClick={next}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-[#2641FF] hover:bg-[#2641FF] hover:text-[#AEFF00]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
