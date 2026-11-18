import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";

/**
 * A blob that chases the pointer, stretches in the direction you move,
 * and swells into a labelled bubble over anything clickable.
 * Add `data-cursor="Label"` to any element to give it a label.
 * Only on mouse/trackpad devices, never on touch.
 */
export function Cursor() {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [label, setLabel] = useState<string | null>(null);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 600, damping: 42, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 600, damping: 42, mass: 0.6 });
  const vx = useVelocity(sx);
  const vy = useVelocity(sy);

  // stretch along the direction of travel
  const rotate = useTransform(() => (Math.atan2(vy.get(), vx.get()) * 180) / Math.PI);
  const stretch = useTransform(() => {
    const speed = Math.hypot(vx.get(), vy.get());
    return 1 + Math.min(speed / 2600, 0.7);
  });
  const squash = useTransform(stretch, (s) => 1 / Math.sqrt(s));

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as Element | null)?.closest?.("a, button, [data-cursor]");
      setLabel(t ? (t.getAttribute("data-cursor") ?? "") : null);
    };
    const press = () => setDown(true);
    const release = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = label === null ? 16 : label ? 92 : 56;

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[200] mix-blend-difference"
    >
      <motion.div style={{ rotate, scaleX: label === null ? stretch : 1, scaleY: label === null ? squash : 1 }}>
        <motion.div
          animate={{ width: size, height: size, scale: down ? 0.75 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />
      </motion.div>
      {label ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[11px] font-black uppercase tracking-[0.2em] text-black"
        >
          {label}
        </motion.span>
      ) : null}
    </motion.div>
  );
}
