import { useEffect, useRef, useState } from "react";

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Animates a number from its previous value to the new one. */
export function useCountUp(value: number, duration = 900) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReduced()) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      fromRef.current = value;
    };
  }, [value, duration]);

  return display;
}

/**
 * Balance figure that counts up on mount / when the value or masking changes.
 * `mask` comes from useBalanceVisibility so hidden balances stay hidden.
 */
export function AmountCounter({
  value,
  hidden,
  mask,
  className,
  duration,
}: {
  value: number;
  hidden: boolean;
  mask: (value: number) => string;
  className?: string;
  duration?: number;
}) {
  const animated = useCountUp(hidden ? value : value, duration);
  return (
    <span className={className}>{hidden ? mask(value) : mask(animated)}</span>
  );
}

/** Reveals children once they scroll into view. */
export function useInView<T extends HTMLElement>(rootMargin = "-40px") {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, rootMargin]);

  return { ref, seen };
}

/** Staggered fade-up wrapper. */
export function Rise({
  delay = 0,
  className,
  children,
  inView = false,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
  inView?: boolean;
}) {
  const { ref, seen } = useInView<HTMLDivElement>();
  const active = inView ? seen : true;
  return (
    <div
      ref={inView ? ref : undefined}
      className={`${active ? "k-rise" : "opacity-0"} ${className ?? ""}`}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
