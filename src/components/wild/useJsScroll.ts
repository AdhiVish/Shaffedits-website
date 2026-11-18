import { useScroll, useTransform } from "motion/react";

/**
 * Same as motion's useScroll, but forces the progress to be computed in JS.
 *
 * Motion can hand scroll-linked opacity / filter / clip-path animations to
 * the browser's native ViewTimeline. With pinned (position: sticky) scenes
 * that mapping comes out wrong in Chromium (values rise, then fall back),
 * so we pass progress through a function transform, which can't be
 * hardware-accelerated and therefore always tracks the real scroll position.
 */
export function useJsScroll(options?: Parameters<typeof useScroll>[0]) {
  const s = useScroll(options);
  const scrollYProgress = useTransform(s.scrollYProgress, (v) => v);
  return { ...s, scrollYProgress };
}
