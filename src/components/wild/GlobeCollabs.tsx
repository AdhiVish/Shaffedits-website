import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { motion, useInView } from "motion/react";
import { Plane } from "lucide-react";

/** Countries Shaffedits has collaborated with: marker position (lat, lng) and time zone for the live clock. */
const COUNTRIES = [
  { name: "United States", city: "New York", tz: "America/New_York", loc: [40.71, -74.01] as [number, number] },
  { name: "Russia", city: "Moscow", tz: "Europe/Moscow", loc: [55.75, 37.62] as [number, number] },
  { name: "Germany", city: "Berlin", tz: "Europe/Berlin", loc: [52.52, 13.4] as [number, number] },
  { name: "UAE", city: "Dubai", tz: "Asia/Dubai", loc: [25.2, 55.27] as [number, number] },
  { name: "Qatar", city: "Doha", tz: "Asia/Qatar", loc: [25.29, 51.53] as [number, number] },
  { name: "Singapore", city: "Singapore", tz: "Asia/Singapore", loc: [1.35, 103.82] as [number, number] },
  { name: "Malaysia", city: "Kuala Lumpur", tz: "Asia/Kuala_Lumpur", loc: [3.14, 101.69] as [number, number] },
  { name: "India", city: "Home base", tz: "Asia/Kolkata", loc: [21.0, 78.0] as [number, number] },
];

const LIME: [number, number, number] = [174 / 255, 1, 0];
const TAU = Math.PI * 2;
/** Globe angles that put a given lat/lng at the front (cobe's orientation). */
const facing = ([lat, lng]: [number, number]) => ({
  phi: Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2),
  theta: ((lat * Math.PI) / 180) * 0.75,
});
/** The longitude currently at the front for a given phi. */
const lngAt = (phi: number) => ((((3 * Math.PI) / 2 - phi) * 180) / Math.PI + 540) % 360 - 180;

function Clock({ tz, now }: { tz: string; now: Date }) {
  return (
    <>
      {new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now)}
    </>
  );
}

/**
 * Global collaborations: a glowing dotted globe with a lime marker on every
 * country we've worked in. It drifts round on its own (the list highlights
 * whichever country is facing you), can be dragged, and hovering or tapping a
 * country spins the globe to it.
 */
export function GlobeCollabs() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const near = useInView(wrap, { margin: "200px" });
  const shown = useInView(wrap, { once: true, amount: 0.3 });
  const [active, setActive] = useState(7);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => new Date());

  // shared, mutable animation state read by the render loop
  const s = useRef({ phi: facing(COUNTRIES[7].loc).phi, theta: 0.3, tPhi: 0, tTheta: 0.3, focus: -1, drag: null as null | { x: number; phi: number }, idleUntil: 0, active: 7 });

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  // only run the WebGL globe while it is on (or near) the screen
  useEffect(() => {
    if (!near || !canvas.current || !wrap.current) return;
    const c = canvas.current;
    const st = s.current;
    st.tPhi = st.phi;
    let width = c.offsetWidth;
    const ro = new ResizeObserver(() => (width = c.offsetWidth));
    ro.observe(c);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const globe = createGlobe(c, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: st.phi,
      theta: st.theta,
      dark: 1,
      diffuse: 1.15,
      mapSamples: 16000,
      mapBrightness: 5.5,
      mapBaseBrightness: 0.02,
      baseColor: [0.22, 0.22, 0.22],
      markerColor: LIME,
      glowColor: [0.85, 0.85, 0.85],
      opacity: 0.95,
      markers: COUNTRIES.map((k) => ({ location: k.loc, size: 0.05 })),
      onRender: (state) => {
        const t = performance.now();
        if (st.focus < 0 && !st.drag && t > st.idleUntil && !still) {
          st.tPhi += 0.0028; // gentle drift
          st.tTheta = 0.3;
        }
        st.phi += (st.tPhi - st.phi) * 0.08;
        st.theta += (st.tTheta - st.theta) * 0.08;
        state.phi = st.phi;
        state.theta = st.theta;
        state.width = width * 2;
        state.height = width * 2;
        // which country faces us right now (while drifting or dragging)
        if (st.focus < 0) {
          const front = lngAt(st.phi);
          let best = 0;
          let bd = 1e9;
          COUNTRIES.forEach((k, i) => {
            const d = Math.abs(((k.loc[1] - front + 540) % 360) - 180);
            if (d < bd) {
              bd = d;
              best = i;
            }
          });
          if (best !== st.active) {
            st.active = best;
            setActive(best);
          }
        }
        state.markers = COUNTRIES.map((k, i) => ({ location: k.loc, size: i === st.active ? 0.11 : 0.045 }));
      },
    });
    const fade = window.setTimeout(() => setReady(true), 80);
    return () => {
      clearTimeout(fade);
      ro.disconnect();
      globe.destroy();
    };
  }, [near]);

  /** Spin the globe to a country (shortest way round) and hold it there. */
  const focusOn = (i: number) => {
    const st = s.current;
    const f = facing(COUNTRIES[i].loc);
    const k = Math.round((st.phi - f.phi) / TAU);
    st.tPhi = f.phi + k * TAU;
    st.tTheta = f.theta;
    st.focus = i;
    st.active = i;
    setActive(i);
  };
  const release = () => {
    const st = s.current;
    st.focus = -1;
    st.idleUntil = performance.now() + 1500;
  };

  // drag to spin
  const onDown = (e: React.PointerEvent) => {
    s.current.drag = { x: e.clientX, phi: s.current.tPhi };
    s.current.focus = -1;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = s.current.drag;
    if (d) s.current.tPhi = d.phi + (e.clientX - d.x) * 0.006;
  };
  const onUp = () => {
    s.current.drag = null;
    s.current.idleUntil = performance.now() + 2500;
  };

  return (
    <div ref={wrap} className="relative mt-24 grid items-center gap-10 border-t border-white/10 pt-16 md:mt-32 md:grid-cols-[1fr_1.05fr] md:gap-6 md:pt-20">
      <div className="order-2 md:order-1">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={shown ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.7 }}
          className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.35em] text-[#AEFF00] md:text-xs"
        >
          <Plane className="size-4" /> Global collaborations
        </motion.p>
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={shown ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-black leading-[0.92] tracking-tight"
        >
          Our work
          <br />
          <span className="chrome-text pr-[0.06em] font-light italic">travels.</span>
        </motion.h3>

        <ul onMouseLeave={release}>
          {COUNTRIES.map((k, i) => {
            const on = i === active;
            return (
              <motion.li
                key={k.name}
                initial={{ opacity: 0, x: -24 }}
                animate={shown ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.6, delay: 0.25 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onMouseEnter={() => focusOn(i)}
                  onFocus={() => focusOn(i)}
                  onClick={() => focusOn(i)}
                  onBlur={release}
                  className="group flex w-full cursor-pointer items-baseline gap-4 border-b border-white/[0.07] bg-transparent py-2.5 text-left md:py-3"
                >
                  <span className={`w-6 font-display text-xs font-bold tabular-nums transition-colors ${on ? "text-[#AEFF00]" : "text-white/25"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 font-display text-[clamp(1.35rem,2.6vw,2.2rem)] font-black leading-none tracking-tight transition-all duration-500 ${
                      on ? "translate-x-2 text-white" : "text-white/25 group-hover:text-white/60"
                    }`}
                  >
                    {k.name}
                  </span>
                  <span className={`text-right text-[10px] uppercase tracking-[0.2em] transition-opacity duration-500 md:text-[11px] ${on ? "opacity-100" : "opacity-0"}`}>
                    <span className="text-white/45">{k.city}</span>
                    <span className="ml-2 font-display font-bold tabular-nums text-[#AEFF00]">
                      <Clock tz={k.tz} now={now} />
                    </span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <div className="relative order-1 mx-auto w-full max-w-[560px] md:order-2">
        {/* soft white halo behind the globe */}
        <div aria-hidden className="pointer-events-none absolute inset-[8%] rounded-full bg-white/[0.06] blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={shown ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square w-full"
        >
          <canvas
            ref={canvas}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-label="Globe showing the 8 countries Shaffedits has collaborated with"
            role="img"
            className="h-full w-full cursor-grab touch-pan-y transition-opacity duration-700 active:cursor-grabbing"
            style={{ opacity: ready ? 1 : 0 }}
          />
          <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[10px] uppercase tracking-[0.35em] text-white/35">
            drag to spin
          </p>
        </motion.div>
      </div>
    </div>
  );
}
