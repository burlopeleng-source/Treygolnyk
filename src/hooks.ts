import { useEffect, useRef, useState } from 'react';

/** Плавная анимация числа к целевому значению (rAF, easeOutCubic). */
export function useAnimatedNumber(target: number | null, duration = 560): number | null {
  const [val, setVal] = useState<number | null>(target);
  const st = useRef({ from: 0, cur: 0, start: 0, raf: 0, has: false });

  useEffect(() => {
    const s = st.current;
    if (target == null || !isFinite(target)) {
      cancelAnimationFrame(s.raf);
      s.has = false;
      setVal(null);
      return;
    }
    if (!s.has) {
      s.cur = 0;
      s.has = true;
    }
    s.from = s.cur;
    s.start = performance.now();
    cancelAnimationFrame(s.raf);
    const tick = (t: number) => {
      const p = Math.min(1, (t - s.start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      const v = s.from + (target - s.from) * e;
      s.cur = v;
      setVal(v);
      if (p < 1) s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s.raf);
  }, [target, duration]);

  return val;
}

/** Появление блока при попадании в зону видимости. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

/** Состояние, зеркалируемое в localStorage. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* приватный режим — молча пропускаем */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
