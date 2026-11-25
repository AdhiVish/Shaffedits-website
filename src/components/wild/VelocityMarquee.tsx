import { useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { cn } from "@/lib/utils";
import { isPhone } from "@/lib/usePhone";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/**
 * A marquee that is alive: it speeds up when you scroll fast, flips
 * direction when you scroll back up, and leans (skews) with the speed.
 */
export function VelocityMarquee({
  children,
  baseVelocity = 3,
  className,
  innerClassName,
  skew = true,
}: {
  children: ReactNode;
  /** % of one copy per second; negative runs the other way */
  baseVelocity?: number;
  className?: string;
  innerClassName?: string;
  skew?: boolean;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  // no lean on phones: skewing big text every scroll frame is costly there
  const lean = skew && !isPhone();
  const skewX = useTransform(smooth, [-2500, 2500], lean ? [14, -14] : [0, 0]);
  const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`);
  const dir = useRef(1);
  const box = useRef<HTMLDivElement>(null);
  // off screen it would still move (and repaint) every frame — skip it
  const visible = useInView(box, { margin: "100px 0px" });

  useAnimationFrame((_, delta) => {
    if (!visible) return;
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    moveBy += dir.current * moveBy * f;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div ref={box} className={cn("overflow-hidden whitespace-nowrap", className)}>
      <motion.div style={{ x, skewX }} className="flex w-max flex-nowrap">
        {[0, 1, 2, 3].map((k) => (
          <div key={k} aria-hidden={k > 0} className={cn("flex shrink-0 items-center", innerClassName)}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
