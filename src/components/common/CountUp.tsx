import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Animates a number from 0 → value once it scrolls into view.
 * Renders the final value on the server so it's correct without JS.
 */
export function CountUp({
  value,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number | string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const target = typeof value === "string" ? parseFloat(value) : value;
  const safeTarget = Number.isFinite(target) ? target : 0;
  const inferredDecimals = decimals || (typeof value === "string" && value.includes(".") ? 1 : 0);

  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(safeTarget);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduced()) {
      setDisplay(safeTarget);
      return;
    }

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const from = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // easeOutExpo
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setDisplay(from + (safeTarget - from) * eased);
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(safeTarget);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          run();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [safeTarget, duration]);

  const formatted =
    prefix +
    display.toLocaleString("tr-TR", {
      minimumFractionDigits: inferredDecimals,
      maximumFractionDigits: inferredDecimals,
    }) +
    suffix;

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
