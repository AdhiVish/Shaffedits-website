import { useEffect, useState } from "react";

/** Phones only (matches the CSS `max-width: 767px` breakpoint). Desktop is never affected. */
export const PHONE_QUERY = "(max-width: 767px)";

export const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

/** True on phone-sized screens; updates if the window is resized across the breakpoint. */
export function useIsPhone() {
  const [m, setM] = useState(isPhone);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}
