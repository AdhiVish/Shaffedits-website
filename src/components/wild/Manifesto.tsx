import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { useJsScroll } from "@/components/wild/useJsScroll";
import { GlowButton } from "../ui/GlowButton";

const base = import.meta.env.BASE_URL;

// "[img]" tokens become little pictures that pop open inside the sentence.
const TEXT =
  "At Shaffedits, creativity is communication. We're a multidisciplinary creative agency bringing [img:a02] branding, content, design, [img:t03] digital strategy, filmmaking and web experiences [img:a07] under one creative roof. Strategy behind every pixel.";

const LOUD = new Set(["communication.", "pixel.", "roof."]);

type Token = { kind: "word"; text: string } | { kind: "img"; src: string };

const tokens: Token[] = TEXT.split(" ").map((t) => {
  const m = t.match(/^\[img:(\w+)\]$/);
  return m ? { kind: "img", src: m[1] } : { kind: "word", text: t };
});

function Word({ text, range, progress }: { text: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, ["0.25em", "0em"]);
  const loud = LOUD.has(text);
  return (
    <motion.span
      style={{ opacity, y }}
      className={"mr-[0.25em] inline-block " + (loud ? "italic font-light underline decoration-[0.06em] underline-offset-[0.12em]" : "")}
    >
      {text}
    </motion.span>
  );
}

function Pic({ src, range, progress }: { src: string; range: [number, number]; progress: MotionValue<number> }) {
  const width = useTransform(progress, range, ["0em", "1.9em"]);
  const rotate = useTransform(progress, range, [-30, 0]);
  return (
    <motion.span
      style={{ width, rotate }}
      className="mr-[0.25em] inline-block h-[0.82em] overflow-hidden rounded-full align-[-0.08em] ring-2 ring-black"
    >
      <img src={`${base}showcase/${src}.webp`} alt="" className="h-full w-full object-cover" draggable={false} />
    </motion.span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useJsScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const stickerSpin = useTransform(scrollYProgress, [0, 1], [0, 540]);
  const n = tokens.length;

  return (
    <section id="about" className="relative overflow-hidden chrome-surface px-6 pb-32 pt-24 text-black md:pb-48 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <p className="mb-10 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.4em]">
          About / 01 <span className="font-normal normal-case tracking-normal opacity-60">(the part where we talk about ourselves)</span>
        </p>

        <div ref={ref} className="font-display text-[clamp(2rem,5.4vw,5.2rem)] font-bold leading-[1.04] tracking-tight">
          {tokens.map((t, i) => {
            const start = i / n;
            const range: [number, number] = [start, Math.min(1, start + 2.5 / n)];
            return t.kind === "word" ? (
              <Word key={i} text={t.text} range={range} progress={scrollYProgress} />
            ) : (
              <Pic key={i} src={t.src} range={range} progress={scrollYProgress} />
            );
          })}
        </div>

        <div className="mt-20 grid items-end gap-12 md:grid-cols-12">
          <p className="max-w-xl text-lg leading-relaxed text-black/75 md:col-span-7">
            Every project begins with understanding your business, your audience and your ambitions,
            before we build solutions that are visually compelling and commercially effective. Launching,
            refreshing or scaling, we become an extension of your team.
          </p>
          <div className="flex items-center gap-8 md:col-span-5 md:justify-end">
            <GlowButton as="a" href="#contact" tone="onLight">
              Let's Build Your Brand
            </GlowButton>
            <motion.div
              aria-hidden
              style={{ rotate: stickerSpin }}
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-black text-center font-display text-[11px] font-black uppercase leading-tight tracking-widest"
            >
              <span className="chrome-text">
            8+ yrs
              <br />
              of good
              <br />
              chaos
            </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
