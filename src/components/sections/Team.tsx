import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { motion, type PanInfo } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

type Suit = "spades" | "hearts" | "clubs" | "diamonds";
type Rank = "K" | "Q" | "J" | "A";

// Each team member is dealt a face card: men get King, Jack or Ace, women get Queen.
// Change `rank` and `suit` here to deal someone a different card.
const team: {
  name: string;
  role: string;
  bio: string;
  rank: Rank;
  suit: Suit;
  image?: string;
}[] = [
  { name: "Mohammed Shafeeq", role: "Founder & Creative Director", rank: "K", suit: "spades", bio: "Leads the agency's creative vision, brand strategy, client relationships, and campaign direction while ensuring every project creates meaningful business impact." },
  { name: "Ayesha Saiyed", role: "Content Writer", rank: "Q", suit: "hearts", bio: "Transforms ideas into compelling stories, campaigns, and copy that connect brands with their audience." },
  { name: "Amal Kader", role: "Social Media Strategist", rank: "J", suit: "clubs", bio: "Develops strategic content plans and digital growth frameworks that strengthen brand presence across platforms." },
  { name: "Zeena Qaida", role: "Graphic Designer", rank: "Q", suit: "diamonds", bio: "Creates thoughtful visual identities and creative assets that blend aesthetics with strategy." },
  { name: "Mohammed", role: "Web Developer", rank: "A", suit: "spades", bio: "Builds fast, scalable, and user-focused websites designed for performance and long-term growth." },
  { name: "Sufyaan", role: "Web Developer", rank: "K", suit: "diamonds", bio: "Builds modern, responsive, and high-performance digital experiences, turning creative concepts into seamless websites that are both visually engaging and technically robust." },
  { name: "Rukshanda", role: "Video Editor", rank: "Q", suit: "clubs", bio: "Shapes engaging visual stories through editing, pacing, motion, and cinematic storytelling." },
];

const RANK_NAME: Record<Rank, string> = { K: "King", Q: "Queen", J: "Jack", A: "Ace" };
const SUIT_NAME: Record<Suit, string> = {
  spades: "Spades",
  hearts: "Hearts",
  clubs: "Clubs",
  diamonds: "Diamonds",
};
// Black suits take the brand lime, red suits a warm coral — both read on a dark card.
const SUIT_COLOR: Record<Suit, string> = {
  spades: "#ACEC00",
  clubs: "#ACEC00",
  hearts: "#FF5468",
  diamonds: "#FF5468",
};

const PIP_PATH: Record<Suit, string> = {
  hearts:
    "M50 90 C20 63 5 46 5 30 C5 16 16 7 29 7 C38 7 46 12 50 20 C54 12 62 7 71 7 C84 7 95 16 95 30 C95 46 80 63 50 90 Z",
  diamonds: "M50 3 L89 50 L50 97 L11 50 Z",
  spades:
    "M50 5 C50 5 8 38 8 60 C8 74 20 83 33 83 C40 83 46 80 48 75 C47 85 43 92 35 96 L65 96 C57 92 53 85 52 75 C54 80 60 83 67 83 C80 83 92 74 92 60 C92 38 50 5 50 5 Z",
  clubs: "M42 58 L58 58 L64 96 L36 96 Z",
};

function Pip({ suit, className, color }: { suit: Suit; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className} fill={color ?? SUIT_COLOR[suit]}>
      <path d={PIP_PATH[suit]} />
      {suit === "clubs" && (
        <>
          <circle cx="50" cy="27" r="21" />
          <circle cx="27" cy="60" r="21" />
          <circle cx="73" cy="60" r="21" />
        </>
      )}
    </svg>
  );
}

/** Small crest above the monogram: crown for K, tiara for Q, plume for J. */
function Crest({ rank, color }: { rank: Rank; color: string }) {
  if (rank === "J") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden className="h-[1.75em] w-[1.75em]" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round">
        <path d="M50 6 C82 30 80 70 50 94 C20 70 18 30 50 6 Z" />
        <path d="M50 18 L50 88" />
        <path d="M50 40 L68 30 M50 56 L70 46 M50 40 L32 30 M50 56 L30 46" />
      </svg>
    );
  }
  if (rank === "Q") {
    return (
      <svg viewBox="0 0 100 100" aria-hidden className="h-[1.75em] w-[1.75em]" fill={color}>
        <path d="M10 78 L16 36 L34 56 L50 24 L66 56 L84 36 L90 78 Z" />
        <circle cx="16" cy="30" r="6" />
        <circle cx="50" cy="16" r="7" />
        <circle cx="84" cy="30" r="6" />
        <rect x="10" y="82" width="80" height="8" rx="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="h-[1.75em] w-[1.75em]" fill={color}>
      <path d="M8 80 L8 32 L30 54 L50 20 L70 54 L92 32 L92 80 Z" />
      <rect x="8" y="84" width="84" height="9" rx="3" />
      <rect x="46" y="4" width="8" height="18" rx="2" />
      <rect x="40" y="9" width="20" height="7" rx="2" />
    </svg>
  );
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

function Corner({ rank, suit, flip }: { rank: Rank; suit: Suit; flip?: boolean }) {
  const color = SUIT_COLOR[suit];
  return (
    <div
      className={`absolute flex flex-col items-center leading-none ${
        flip ? "bottom-[0.75em] right-[0.75em] rotate-180" : "left-[0.75em] top-[0.75em]"
      }`}
      style={{ color }}
    >
      <span className="font-display text-[1.7em] font-black">{rank}</span>
      <Pip suit={suit} className="mt-[0.25em] h-[1.25em] w-[1.25em]" />
    </div>
  );
}

/** The front of one playing card, dark with a thin lit border. */
function CardFace({ member }: { member: (typeof team)[number] }) {
  const color = SUIT_COLOR[member.suit];
  const mono = initials(member.name);
  const isAce = member.rank === "A";

  const half = (
    <div className="flex flex-col items-center justify-center gap-[0.5em]">
      <Crest rank={member.rank} color={color} />
      <span
        className="font-display text-[3.6em] font-black leading-none tracking-tight"
        style={{ color, textShadow: `0 0 28px ${color}55` }}
      >
        {mono}
      </span>
    </div>
  );

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[1.1em]"
      style={{
        background: "linear-gradient(150deg, #1a1a1a 0%, #0a0a0a 55%, #050505 100%)",
        border: `1px solid ${color}66`,
        boxShadow: `0 30px 70px -20px rgba(0,0,0,0.9), 0 0 60px -10px ${color}33`,
      }}
    >
      <Corner rank={member.rank} suit={member.suit} />
      <Corner rank={member.rank} suit={member.suit} flip />

      {/* inner frame */}
      <div
        className="absolute inset-x-[15%] inset-y-[8%] rounded-lg"
        style={{ border: `1px solid ${color}40`, background: `linear-gradient(160deg, ${color}0d, transparent 60%)` }}
      >
        {isAce ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Pip suit={member.suit} className="h-[78%] w-[78%] opacity-95" />
            <span className="absolute font-display text-[3.4em] font-black text-black/85">{mono}</span>
          </div>
        ) : (
          <>
            <div className="absolute inset-x-0 top-0 flex h-1/2 items-center justify-center">{half}</div>
            <div className="absolute inset-x-0 bottom-0 flex h-1/2 rotate-180 items-center justify-center">{half}</div>
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2" style={{ background: `${color}55` }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0a] p-[0.4em]">
              <Pip suit={member.suit} className="h-5 w-5" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The back of every card: dark lattice with the Shaffedits logo. */
function CardBack({ style }: { style?: CSSProperties }) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[1.1em]"
      style={{
        background:
          "repeating-linear-gradient(45deg, rgba(172,236,0,0.16) 0 1px, transparent 1px 11px), repeating-linear-gradient(-45deg, rgba(172,236,0,0.16) 0 1px, transparent 1px 11px), #080808",
        border: "1px solid rgba(172,236,0,0.45)",
        boxShadow: "0 30px 70px -20px rgba(0,0,0,0.9)",
        ...style,
      }}
    >
      <div className="absolute inset-[0.75em] rounded-xl border border-[#ACEC00]/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-xl bg-[#080808] px-[1.25em] py-[1em] ring-1 ring-[#ACEC00]/40">
          <img src={logoWhite} alt="" draggable={false} className="w-[6em] object-contain" />
        </div>
      </div>
    </div>
  );
}

const TOP_ROW = ["t01", "t04", "t02", "t07", "t10", "t03", "t05", "t11"];
const BOTTOM_ROW = ["t06", "t12", "t08", "t09", "t03", "t01", "t05", "t02"];

/** A slow, dimmed strip of the agency's real work that sits behind the deck. */
function WorkRow({ ids, reverse, className }: { ids: string[]; reverse?: boolean; className: string }) {
  const base = import.meta.env.BASE_URL;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-0 h-28 overflow-hidden opacity-[0.22] md:h-36 ${className}`}
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

// ---- Coverflow + flip tuning ----
const BASE_W = 300; // card width at full size (px); height follows the 5:7 playing-card ratio
const FLIP_S = 0.85; // seconds for the card that lands in the middle to turn over
const SLIDE_S = 0.5;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DRAG_THRESHOLD = 90;
const TILT = 24;
const SCALE_STEP = 0.1;

export function Team() {
  const n = team.length;
  const [active, setActive] = useState(0);
  const [W, setW] = useState(BASE_W);
  const [phone, setPhone] = useState(false);
  const lockRef = useRef(false);
  const prevRel = useRef<Record<number, number>>({});

  // Card size follows the screen so the row always fits.
  useEffect(() => {
    const fit = () => {
      const iw = window.innerWidth;
      const small = iw < 640;
      setPhone(small);
      // desktop: size so all seven cards fit across the screen; phone: centre card + neighbours
      setW(Math.round(small ? iw * 0.5 : Math.min(BASE_W, Math.max(150, iw / 4.9))));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const H = Math.round((W * 7) / 5);
  const SPREAD = Math.round(W * (phone ? 0.56 : 0.68));

  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, FLIP_S * 1000 * 0.9);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (lockRef.current || i === active) return;
      lock();
      setActive(i);
    },
    [lock, active],
  );
  const step = useCallback(
    (dir: number) => goTo((((active + dir) % n) + n) % n),
    [goTo, active, n],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(n - 1);
      }
    },
    [step, goTo, n],
  );

  const onDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x <= -DRAG_THRESHOLD) step(1);
      else if (info.offset.x >= DRAG_THRESHOLD) step(-1);
    },
    [step],
  );

  // Show the whole hand (up to 3 either side); on narrow screens 2 either side.
  const reach = Math.min(Math.floor(n / 2), phone ? 2 : 3);
  const visible: { rel: number; index: number }[] = [];
  for (let rel = -reach; rel <= reach; rel++) visible.push({ rel, index: (((active + rel) % n) + n) % n });

  useEffect(() => {
    const next: Record<number, number> = {};
    visible.forEach((v) => (next[v.index] = v.rel));
    prevRel.current = next;
  });

  const member = team[active];
  const color = SUIT_COLOR[member.suit];
  const slideCss = `transform ${SLIDE_S}s ${EASE}, opacity ${SLIDE_S}s ${EASE}`;

  return (
    <section
      id="team"
      className="relative overflow-hidden px-6 pt-44 pb-28 text-white md:pt-56 md:pb-40"
      style={{ background: "radial-gradient(circle at top, #232323 0%, #050505 62%)" }}
    >
      {/* Giant outlined first name that swaps as you move through the team */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[44%] z-0 flex -translate-y-1/2 justify-center overflow-hidden"
      >
        <motion.span
          key={active}
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="select-none whitespace-nowrap font-display font-black leading-none tracking-tighter"
          style={{
            fontSize: "clamp(6rem, 22vw, 20rem)",
            color: "transparent",
            WebkitTextStroke: `1px ${color}47`,
          }}
        >
          {member.name.split(" ")[0]}
        </motion.span>
      </div>

      {/* Light behind the hand, tinted to the suit on the table */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        animate={{ backgroundColor: `${color}18` }}
        transition={{ duration: 0.8 }}
      />

      <WorkRow ids={TOP_ROW} className="top-6" />
      <WorkRow ids={BOTTOM_ROW} reverse className="bottom-4" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-8 flex items-end justify-between gap-6"
        >
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-white/50">
              Our Team / 04
            </p>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,4rem)] font-black leading-none tracking-tight">
              The people behind the <span className="italic font-light text-white/60">work</span>
            </h2>
          </div>
          <div className="hidden shrink-0 items-baseline gap-1 font-display text-white/40 sm:flex">
            <motion.span
              key={active}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-[#ACEC00]"
            >
              {String(active + 1).padStart(2, "0")}
            </motion.span>
            <span className="text-sm"> / {String(n).padStart(2, "0")}</span>
          </div>
        </motion.div>

        {/* ---- The hand: every card in one horizontal row ---- */}
        <div
          className="relative mx-auto flex items-center justify-center outline-none"
          style={{ perspective: 1300, minHeight: H + 90 }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Team members"
          onKeyDown={onKeyDown}
        >
          <motion.div
            className="relative"
            style={{ width: W, height: H }}
            drag="x"
            dragElastic={0.12}
            dragMomentum={false}
            dragSnapToOrigin
            onDragEnd={onDragEnd}
          >
            {visible.map(({ rel, index }) => {
              const m = team[index];
              const isActive = rel === 0;
              const dist = Math.abs(rel);
              const sc = 1 - dist * SCALE_STEP;
              const prev = prevRel.current[index];
              // a card wrapping from one end of the row to the other just reappears
              const jumped = prev !== undefined && Math.abs(rel - prev) > 1;

              return (
                <div
                  key={m.name}
                  onClick={() => (isActive ? step(1) : goTo(index))}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${m.name}, ${RANK_NAME[m.rank]} of ${SUIT_NAME[m.suit]}`}
                  className="absolute"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: W,
                    height: H,
                    zIndex: 10 - dist,
                    cursor: isActive ? "pointer" : "pointer",
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.8 : dist === 2 ? 0.55 : 0.38,
                    transform: `translate(-50%, -50%) translateX(${rel * SPREAD}px) rotateY(${-rel * TILT}deg) scale(${sc})`,
                    transition: jumped ? "none" : slideCss,
                    fontSize: `${(W / BASE_W) * 16}px`,
                  }}
                >
                  {/* the card that lands in the middle lifts and turns over end-over-end */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ transformStyle: "preserve-3d" }}
                    initial={false}
                    animate={
                      isActive
                        ? { rotateX: 360, y: [0, -36, 0], scale: [1, 1.07, 1] }
                        : { rotateX: 0, y: 0, scale: 1 }
                    }
                    transition={
                      isActive
                        ? { duration: FLIP_S, ease: [0.45, 0, 0.2, 1] }
                        : { duration: 0 }
                    }
                  >
                    <div
                      className="absolute inset-0"
                      style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                    >
                      <CardFace member={m} />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateX(180deg)",
                      }}
                    >
                      <CardBack />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ---- Who's on the card ---- */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: FLIP_S * 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-2xl text-center"
        >
          <p
            className="mb-4 inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.35em]"
            style={{ color }}
          >
            <Pip suit={member.suit} className="h-4 w-4" />
            {RANK_NAME[member.rank]} of {SUIT_NAME[member.suit]}
          </p>
          <h3 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-black leading-none tracking-tight">
            {member.name}
          </h3>
          <p className="mt-3 text-xs uppercase tracking-[0.35em] text-white/50">{member.role}</p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-white/60">{member.bio}</p>
        </motion.div>

        <div className="mt-10 flex flex-col items-center gap-5">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous team member"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#ACEC00] hover:bg-[#ACEC00] hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10 sm:w-56">
              <motion.div
                className="h-full rounded-full bg-[#ACEC00]"
                animate={{ width: `${((active + 1) / n) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next team member"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-[#ACEC00] hover:bg-[#ACEC00] hover:text-black"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs uppercase tracking-widest text-white/40">
            Use the arrows, swipe, or click a card.
          </p>
        </div>
      </div>
    </section>
  );
}
