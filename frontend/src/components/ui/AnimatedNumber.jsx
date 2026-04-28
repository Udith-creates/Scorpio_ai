import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

const DURATION_MS = 1400;

export function AnimatedNumber({ value, format }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const shouldReduce = useReducedMotion();
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView || value == null) return;
    const target = parseFloat(value) || 0;

    if (shouldReduce) { setCurrent(target); return; }

    startRef.current = null;
    const tick = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const pct = Math.min((ts - startRef.current) / DURATION_MS, 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCurrent(target * eased);
      if (pct < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, value, shouldReduce]);

  const displayed = value == null
    ? '—'
    : format
      ? format(current)
      : Number.isInteger(value)
        ? Math.round(current)
        : current.toFixed(1);

  return <span ref={ref}>{displayed}</span>;
}
